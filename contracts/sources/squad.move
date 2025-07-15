/// SaveSquad Squad Management Module
/// Handles squad creation, member management, and deposit tracking
module savesquad::squad {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::event;
    use std::vector;

    // Error codes
    const ESquadFull: u64 = 1;
    const ENotSquadMember: u64 = 2;
    const EInsufficientDeposit: u64 = 3;
    const EDepositTooEarly: u64 = 4;
    const ESquadNotActive: u64 = 5;
    const EDepositTooLate: u64 = 6;
    const EAlreadyMember: u64 = 7;

    // Constants
    const MAX_SQUAD_SIZE: u64 = 10;
    const MIN_WEEKLY_DEPOSIT: u64 = 1000000; // 0.001 SUI in MIST
    const WEEK_IN_MS: u64 = 604800000; // 7 days in milliseconds

    // Structs
    public struct Squad has key, store {
        id: UID,
        name: vector<u8>,
        creator: address,
        members: vector<address>,
        deposits: Table<address, DepositRecord>,
        total_pool: u64,
        is_active: bool,
        created_at: u64,
        weekly_target: u64,
    }

    public struct DepositRecord has store {
        total_deposited: u64,
        streak_count: u64,
        last_deposit_week: u64,
        deposits: vector<WeeklyDeposit>,
    }

    public struct WeeklyDeposit has store {
        amount: u64,
        week: u64,
        timestamp: u64,
    }

    public struct SquadCap has key {
        id: UID,
        squad_id: address,
    }

    // Events
    public struct SquadCreated has copy, drop {
        squad_id: address,
        creator: address,
        name: vector<u8>,
        weekly_target: u64,
    }

    public struct MemberJoined has copy, drop {
        squad_id: address,
        member: address,
    }

    public struct DepositMade has copy, drop {
        squad_id: address,
        member: address,
        amount: u64,
        week: u64,
        new_streak: u64,
    }

    public struct MemberInvited has copy, drop {
        squad_id: address,
        invitee: address,
        inviter: address,
    }

    public struct StreakBroken has copy, drop {
        squad_id: address,
        member: address,
        previous_streak: u64,
        weeks_missed: u64,
    }

    // Initialize function
    fun init(_ctx: &mut TxContext) {
        // Initialization logic if needed
    }

    // Create a new squad
    public entry fun create_squad(
        name: vector<u8>,
        weekly_target: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let creator = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);
        
        let mut squad = Squad {
            id: object::new(ctx),
            name,
            creator,
            members: vector::singleton(creator),
            deposits: table::new(ctx),
            total_pool: 0,
            is_active: true,
            created_at: current_time,
            weekly_target,
        };

        let squad_id = object::uid_to_address(&squad.id);
        
        // Create initial deposit record for creator
        let initial_record = DepositRecord {
            total_deposited: 0,
            streak_count: 0,
            last_deposit_week: 0,
            deposits: vector::empty(),
        };
        
        table::add(&mut squad.deposits, creator, initial_record);

        // Create squad capability for the creator
        let squad_cap = SquadCap {
            id: object::new(ctx),
            squad_id,
        };

        event::emit(SquadCreated {
            squad_id,
            creator,
            name,
            weekly_target,
        });

        transfer::transfer(squad_cap, creator);
        transfer::share_object(squad);
    }

    // Join an existing squad
    public entry fun join_squad(
        squad: &mut Squad,
        ctx: &mut TxContext
    ) {
        assert!(squad.is_active, ESquadNotActive);
        assert!(vector::length(&squad.members) < MAX_SQUAD_SIZE, ESquadFull);
        
        let member = tx_context::sender(ctx);
        assert!(!vector::contains(&squad.members, &member), EAlreadyMember);
        
        vector::push_back(&mut squad.members, member);
        
        let member_record = DepositRecord {
            total_deposited: 0,
            streak_count: 0,
            last_deposit_week: 0,
            deposits: vector::empty(),
        };
        
        table::add(&mut squad.deposits, member, member_record);

        event::emit(MemberJoined {
            squad_id: object::uid_to_address(&squad.id),
            member,
        });
    }

    // Make a weekly deposit
    public entry fun make_deposit(
        squad: &mut Squad,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(squad.is_active, ESquadNotActive);
        
        let depositor = tx_context::sender(ctx);
        assert!(vector::contains(&squad.members, &depositor), ENotSquadMember);
        
        let amount = coin::value(&payment);
        assert!(amount >= MIN_WEEKLY_DEPOSIT, EInsufficientDeposit);
        
        let current_time = clock::timestamp_ms(clock);
        let current_week = get_week_number(current_time, squad.created_at);
        
        let deposit_record = table::borrow_mut(&mut squad.deposits, depositor);
        
        // Check if deposit is too early (same week)
        if (deposit_record.last_deposit_week == current_week) {
            abort EDepositTooEarly
        };
        
        // Handle streak logic
        let previous_streak = deposit_record.streak_count;
        if (deposit_record.last_deposit_week > 0 && current_week > deposit_record.last_deposit_week + 1) {
            // Late deposit - streak is broken
            let weeks_missed = current_week - deposit_record.last_deposit_week - 1;
            event::emit(StreakBroken {
                squad_id: object::uid_to_address(&squad.id),
                member: depositor,
                previous_streak,
                weeks_missed,
            });
            deposit_record.streak_count = 1; // Reset to 1 for this deposit
        } else if (deposit_record.last_deposit_week + 1 == current_week) {
            // Consecutive week - increment streak
            deposit_record.streak_count = deposit_record.streak_count + 1;
        } else {
            // First deposit
            deposit_record.streak_count = 1;
        };
        
        // Record the deposit
        let weekly_deposit = WeeklyDeposit {
            amount,
            week: current_week,
            timestamp: current_time,
        };
        
        vector::push_back(&mut deposit_record.deposits, weekly_deposit);
        deposit_record.total_deposited = deposit_record.total_deposited + amount;
        deposit_record.last_deposit_week = current_week;
        
        // Add to squad pool
        squad.total_pool = squad.total_pool + amount;
        
        event::emit(DepositMade {
            squad_id: object::uid_to_address(&squad.id),
            member: depositor,
            amount,
            week: current_week,
            new_streak: deposit_record.streak_count,
        });
        
        // Transfer the coin to the squad (burn it for now)
        transfer::public_transfer(payment, @0x0);
    }

    // Invite a member to join the squad (can be called by any existing member)
    public entry fun invite_member(
        squad: &Squad,
        invitee: address,
        ctx: &mut TxContext
    ) {
        assert!(squad.is_active, ESquadNotActive);
        assert!(vector::length(&squad.members) < MAX_SQUAD_SIZE, ESquadFull);
        
        let inviter = tx_context::sender(ctx);
        assert!(vector::contains(&squad.members, &inviter), ENotSquadMember);
        assert!(!vector::contains(&squad.members, &invitee), EAlreadyMember);

        event::emit(MemberInvited {
            squad_id: object::uid_to_address(&squad.id),
            invitee,
            inviter,
        });
    }

    // Check if a deposit is within the valid time window
    public fun is_deposit_valid(
        squad: &Squad,
        member: address,
        current_time: u64
    ): (bool, u64) {
        let current_week = get_week_number(current_time, squad.created_at);
        
        if (!table::contains(&squad.deposits, member)) {
            return (true, current_week) // First deposit is always valid
        };
        
        let deposit_record = table::borrow(&squad.deposits, member);
        let last_week = deposit_record.last_deposit_week;
        
        // Can't deposit in the same week
        if (last_week == current_week) {
            return (false, current_week)
        };
        
        // Valid if it's the next week or later
        (true, current_week)
    }

    // Get member's current streak status
    public fun get_member_streak_info(squad: &Squad, member: address, current_time: u64): (u64, bool, u64) {
        if (!table::contains(&squad.deposits, member)) {
            return (0, true, 0) // No deposits yet, streak can start
        };
        
        let deposit_record = table::borrow(&squad.deposits, member);
        let current_week = get_week_number(current_time, squad.created_at);
        let last_deposit_week = deposit_record.last_deposit_week;
        let streak = deposit_record.streak_count;
        
        // Check if streak is still alive (not more than 1 week behind)
        let streak_alive = (current_week <= last_deposit_week + 1);
        let weeks_behind = if (current_week > last_deposit_week) {
            current_week - last_deposit_week
        } else {
            0
        };
        
        (streak, streak_alive, weeks_behind)
    }

    // Helper function to calculate week number
    fun get_week_number(current_time: u64, squad_created_at: u64): u64 {
        (current_time - squad_created_at) / WEEK_IN_MS + 1
    }

    // View functions
    public fun get_squad_info(squad: &Squad): (vector<u8>, address, u64, bool, u64) {
        (squad.name, squad.creator, squad.total_pool, squad.is_active, vector::length(&squad.members))
    }

    public fun get_member_record(squad: &Squad, member: address): (u64, u64, u64) {
        if (table::contains(&squad.deposits, member)) {
            let record = table::borrow(&squad.deposits, member);
            (record.total_deposited, record.streak_count, record.last_deposit_week)
        } else {
            (0, 0, 0)
        }
    }

    public fun is_member(squad: &Squad, addr: address): bool {
        vector::contains(&squad.members, &addr)
    }

    // Get all members of a squad
    public fun get_squad_members(squad: &Squad): vector<address> {
        squad.members
    }

    // Get squad summary including member count and activity
    public fun get_squad_summary(squad: &Squad, current_time: u64): (vector<u8>, address, u64, bool, u64, u64, u64) {
        let total_members = vector::length(&squad.members);
        let current_week = get_week_number(current_time, squad.created_at);
        
        // Count active members (deposited this week or last week)
        let mut active_members = 0;
        let mut i = 0;
        while (i < total_members) {
            let member = vector::borrow(&squad.members, i);
            if (table::contains(&squad.deposits, *member)) {
                let record = table::borrow(&squad.deposits, *member);
                if (record.last_deposit_week >= current_week - 1) {
                    active_members = active_members + 1;
                };
            };
            i = i + 1;
        };
        
        (
            squad.name,
            squad.creator, 
            squad.total_pool,
            squad.is_active,
            total_members,
            active_members,
            current_week
        )
    }

    // Getter function for squad ID
    public fun get_squad_id(squad: &Squad): address {
        object::uid_to_address(&squad.id)
    }
}
