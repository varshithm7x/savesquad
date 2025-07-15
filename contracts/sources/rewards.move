/// SaveSquad Rewards Module
/// Handles SQUAD token minting and reward distribution with non-transferable mechanics
module savesquad::rewards {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance, Supply};
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::event;
    use sui::dynamic_field as df;
    use savesquad::squad::{Self, Squad};

    // Error codes
    const ENotEligibleForReward: u64 = 1;
    const ERewardAlreadyClaimed: u64 = 2;
    const EInsufficientSupply: u64 = 3;
    const ENotAuthorized: u64 = 4;
    const ETransferNotAllowed: u64 = 5;
    const EInsufficientBalance: u64 = 6;

    // Constants
    const DECIMALS: u8 = 6;
    const WEEKLY_REWARD: u64 = 10000000; // 10 SQUAD tokens (with 6 decimals)
    const STREAK_MULTIPLIER: u64 = 500000; // 0.5 SQUAD per streak week

    // One-time witness for the module (must match module name in uppercase)
    public struct REWARDS has drop {}

    // Phantom type for the coin
    public struct SQUADToken has drop {}

    // Admin capability for managing transfers and rewards
    public struct AdminCap has key {
        id: UID,
    }

    // Non-transferable token wrapper
    public struct LockedSquadToken has key {
        id: UID,
        balance: Balance<REWARDS>,
        owner: address,
        transferable: bool,
    }

    // Treasury for managing SQUAD tokens with dynamic fields for user balances
    public struct Treasury has key {
        id: UID,
        cap: TreasuryCap<REWARDS>,
        reward_claims: Table<address, RewardClaim>,
        admin: address,
        transfers_enabled: bool,
    }

    // User balance information stored as dynamic field
    public struct UserBalance has store {
        total_balance: u64,
        locked_balance: u64,
        transferable_balance: u64,
        last_reward_week: u64,
    }

    public struct RewardClaim has store {
        last_claim_week: u64,
        total_claimed: u64,
        streak_rewards: vector<StreakReward>,
    }

    public struct StreakReward has store {
        week: u64,
        streak_length: u64,
        amount: u64,
        timestamp: u64,
    }

    // Events
    public struct RewardClaimed has copy, drop {
        recipient: address,
        amount: u64,
        week: u64,
        is_transferable: bool,
    }

    public struct TokensMinted has copy, drop {
        amount: u64,
        recipient: address,
        mint_type: vector<u8>, // "weekly_reward", "streak_bonus", "admin_mint"
    }

    public struct TransferabilityChanged has copy, drop {
        user: address,
        amount: u64,
        now_transferable: bool,
    }

    public struct AdminCapTransferred has copy, drop {
        old_admin: address,
        new_admin: address,
    }

    // Initialize the module
    fun init(witness: REWARDS, ctx: &mut TxContext) {
        let admin = tx_context::sender(ctx);
        
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            DECIMALS,
            b"SQUAD",
            b"SaveSquad Token", 
            b"Non-transferable reward token for SaveSquad savings game",
            option::none(),
            ctx
        );

        transfer::public_freeze_object(metadata);

        let treasury = Treasury {
            id: object::new(ctx),
            cap: treasury_cap,
            reward_claims: table::new(ctx),
            admin,
            transfers_enabled: false,
        };

        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        transfer::transfer(admin_cap, admin);
        transfer::share_object(treasury);
    }

    // Claim weekly rewards (10 tokens for on-time deposit)
    public entry fun claim_rewards(
        treasury: &mut Treasury,
        squad: &Squad,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let claimer = tx_context::sender(ctx);
        assert!(squad::is_member(squad, claimer), ENotEligibleForReward);

        let current_time = clock::timestamp_ms(clock);
        let (_, _, last_deposit_week) = squad::get_member_record(squad, claimer);
        assert!(last_deposit_week > 0, ENotEligibleForReward);

        // Check if reward already claimed for this week
        if (table::contains(&treasury.reward_claims, claimer)) {
            let claim_record = table::borrow(&treasury.reward_claims, claimer);
            assert!(claim_record.last_claim_week < last_deposit_week, ERewardAlreadyClaimed);
        };

        // Get or create user balance using dynamic fields
        let user_balance_exists = df::exists_(&treasury.id, claimer);
        if (!user_balance_exists) {
            let initial_balance = UserBalance {
                total_balance: 0,
                locked_balance: 0,
                transferable_balance: 0,
                last_reward_week: 0,
            };
            df::add(&mut treasury.id, claimer, initial_balance);
        };

        let user_balance = df::borrow_mut<address, UserBalance>(&mut treasury.id, claimer);
        assert!(user_balance.last_reward_week < last_deposit_week, ERewardAlreadyClaimed);

        // Mint weekly reward (10 tokens)
        let reward_amount = WEEKLY_REWARD;
        let minted_coin = coin::mint(&mut treasury.cap, reward_amount, ctx);
        
        // Create locked token (non-transferable by default)
        let locked_token = LockedSquadToken {
            id: object::new(ctx),
            balance: coin::into_balance(minted_coin),
            owner: claimer,
            transferable: treasury.transfers_enabled,
        };

        // Update user balance
        user_balance.total_balance = user_balance.total_balance + reward_amount;
        user_balance.locked_balance = user_balance.locked_balance + reward_amount;
        user_balance.last_reward_week = last_deposit_week;

        // Update claim record
        let streak_reward = StreakReward {
            week: last_deposit_week,
            streak_length: 1, // Weekly reward is 1 week
            amount: reward_amount,
            timestamp: current_time,
        };

        if (table::contains(&treasury.reward_claims, claimer)) {
            let claim_record = table::borrow_mut(&mut treasury.reward_claims, claimer);
            claim_record.last_claim_week = last_deposit_week;
            claim_record.total_claimed = claim_record.total_claimed + reward_amount;
            vector::push_back(&mut claim_record.streak_rewards, streak_reward);
        } else {
            let new_claim = RewardClaim {
                last_claim_week: last_deposit_week,
                total_claimed: reward_amount,
                streak_rewards: vector::singleton(streak_reward),
            };
            table::add(&mut treasury.reward_claims, claimer, new_claim);
        };

        event::emit(RewardClaimed {
            recipient: claimer,
            amount: reward_amount,
            week: last_deposit_week,
            is_transferable: treasury.transfers_enabled,
        });

        event::emit(TokensMinted {
            amount: reward_amount,
            recipient: claimer,
            mint_type: b"weekly_reward",
        });

        transfer::transfer(locked_token, claimer);
    }

    // Admin function to enable/disable token transfers globally
    public entry fun set_transfer_enabled(
        _: &AdminCap,
        treasury: &mut Treasury,
        enabled: bool,
        ctx: &mut TxContext
    ) {
        let admin = tx_context::sender(ctx);
        assert!(admin == treasury.admin, ENotAuthorized);
        treasury.transfers_enabled = enabled;
    }

    // Admin function to unlock specific user's tokens for transfer
    public entry fun unlock_user_tokens(
        _: &AdminCap,
        treasury: &mut Treasury,
        user: address,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let admin = tx_context::sender(ctx);
        assert!(admin == treasury.admin, ENotAuthorized);
        
        let user_balance = df::borrow_mut<address, UserBalance>(&mut treasury.id, user);
        assert!(user_balance.locked_balance >= amount, EInsufficientBalance);
        
        user_balance.locked_balance = user_balance.locked_balance - amount;
        user_balance.transferable_balance = user_balance.transferable_balance + amount;
        
        event::emit(TransferabilityChanged {
            user,
            amount,
            now_transferable: true,
        });
    }

    // Admin function to mint tokens (for special events, etc.)
    public entry fun admin_mint_tokens(
        _: &AdminCap,
        treasury: &mut Treasury,
        recipient: address,
        amount: u64,
        transferable: bool,
        ctx: &mut TxContext
    ) {
        let admin = tx_context::sender(ctx);
        assert!(admin == treasury.admin, ENotAuthorized);
        
        let minted_coin = coin::mint(&mut treasury.cap, amount, ctx);
        
        let locked_token = LockedSquadToken {
            id: object::new(ctx),
            balance: coin::into_balance(minted_coin),
            owner: recipient,
            transferable,
        };

        // Update user balance using dynamic fields
        let user_balance_exists = df::exists_(&treasury.id, recipient);
        if (!user_balance_exists) {
            let initial_balance = UserBalance {
                total_balance: 0,
                locked_balance: 0,
                transferable_balance: 0,
                last_reward_week: 0,
            };
            df::add(&mut treasury.id, recipient, initial_balance);
        };

        let user_balance = df::borrow_mut<address, UserBalance>(&mut treasury.id, recipient);
        user_balance.total_balance = user_balance.total_balance + amount;
        if (transferable) {
            user_balance.transferable_balance = user_balance.transferable_balance + amount;
        } else {
            user_balance.locked_balance = user_balance.locked_balance + amount;
        };

        event::emit(TokensMinted {
            amount,
            recipient,
            mint_type: b"admin_mint",
        });

        transfer::transfer(locked_token, recipient);
    }

    // Transfer admin capability
    public entry fun transfer_admin(
        admin_cap: AdminCap,
        treasury: &mut Treasury,
        new_admin: address,
        ctx: &mut TxContext
    ) {
        let old_admin = tx_context::sender(ctx);
        assert!(old_admin == treasury.admin, ENotAuthorized);
        
        treasury.admin = new_admin;
        
        event::emit(AdminCapTransferred {
            old_admin,
            new_admin,
        });
        
        transfer::transfer(admin_cap, new_admin);
    }

    // Convert locked tokens to transferable coins (only if transferable flag is set)
    public entry fun unlock_to_coin(
        locked_token: LockedSquadToken,
        ctx: &mut TxContext
    ) {
        let LockedSquadToken { 
            id, 
            balance, 
            owner, 
            transferable 
        } = locked_token;
        
        assert!(transferable, ETransferNotAllowed);
        assert!(owner == tx_context::sender(ctx), ENotAuthorized);
        
        let coin = coin::from_balance(balance, ctx);
        object::delete(id);
        
        transfer::public_transfer(coin, owner);
    }

    // Calculate bonus reward based on streak length (in addition to weekly reward)
    fun calculate_streak_bonus(streak_count: u64): u64 {
        if (streak_count >= 8) {
            // 8+ week streak: 15 additional SQUAD tokens
            15 * WEEKLY_REWARD / 10
        } else if (streak_count >= 4) {
            // 4-7 week streak: 5 additional SQUAD tokens  
            5 * WEEKLY_REWARD / 10
        } else {
            // 1-3 week streak: streak multiplier
            streak_count * STREAK_MULTIPLIER
        }
    }

    // View functions
    public fun get_total_supply(treasury: &Treasury): u64 {
        coin::total_supply(&treasury.cap)
    }

    public fun get_user_balance(treasury: &Treasury, user: address): (u64, u64, u64) {
        if (df::exists_(&treasury.id, user)) {
            let user_balance = df::borrow<address, UserBalance>(&treasury.id, user);
            (user_balance.total_balance, user_balance.locked_balance, user_balance.transferable_balance)
        } else {
            (0, 0, 0)
        }
    }

    public fun get_user_claims(treasury: &Treasury, user: address): (u64, u64) {
        if (table::contains(&treasury.reward_claims, user)) {
            let claim_record = table::borrow(&treasury.reward_claims, user);
            (claim_record.total_claimed, claim_record.last_claim_week)
        } else {
            (0, 0)
        }
    }

    public fun calculate_pending_reward(): u64 {
        WEEKLY_REWARD // Always 10 tokens for weekly reward
    }

    public fun get_treasury_info(treasury: &Treasury): (address, bool, u64) {
        (treasury.admin, treasury.transfers_enabled, coin::total_supply(&treasury.cap))
    }

    public fun get_locked_token_info(token: &LockedSquadToken): (u64, address, bool) {
        (balance::value(&token.balance), token.owner, token.transferable)
    }

    // Check if user is eligible for reward claim
    public fun can_claim_reward(
        treasury: &Treasury,
        squad: &Squad,
        user: address
    ): bool {
        if (!squad::is_member(squad, user)) {
            return false
        };

        let (_, _, last_deposit_week) = squad::get_member_record(squad, user);
        if (last_deposit_week == 0) {
            return false
        };

        // Check dynamic field for last reward week
        if (df::exists_(&treasury.id, user)) {
            let user_balance = df::borrow<address, UserBalance>(&treasury.id, user);
            user_balance.last_reward_week < last_deposit_week
        } else {
            true // First time claiming
        }
    }

    // Check if user can unlock tokens
    public fun can_unlock_tokens(treasury: &Treasury, user: address): bool {
        treasury.transfers_enabled || (
            df::exists_(&treasury.id, user) && 
            df::borrow<address, UserBalance>(&treasury.id, user).transferable_balance > 0
        )
    }
}
