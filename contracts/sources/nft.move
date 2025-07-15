/// SaveSquad NFT Module  
/// Handles minting of non-transferable streak milestone NFTs
module savesquad::nft {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::url::{Self, Url};
    use sui::table::{Self, Table};
    use sui::clock::{Self, Clock};
    use sui::event;
    use std::string::{Self, String};
    use std::vector;
    use savesquad::squad::{Self, Squad};

    // Error codes
    const ENotEligibleForNFT: u64 = 1;
    const ENFTAlreadyMinted: u64 = 2;
    const EInvalidMilestone: u64 = 3;

    // Milestone requirements
    const BRONZE_MILESTONE: u64 = 4;  // 4 weeks
    const SILVER_MILESTONE: u64 = 8;  // 8 weeks  
    const GOLD_MILESTONE: u64 = 12;   // 12 weeks
    const DIAMOND_MILESTONE: u64 = 24; // 24 weeks

    // Non-transferable SaveSquad NFT
    public struct SaveSquadNFT has key {
        id: UID,
        name: String,
        description: String,
        image_url: Url,
        milestone_type: String,
        streak_achieved: u64,
        minted_at: u64,
        squad_id: address,
        owner: address,
    }

    // Registry to track minted NFTs and prevent duplicates
    public struct NFTRegistry has key {
        id: UID,
        minted_nfts: Table<address, vector<MintRecord>>,
    }

    public struct MintRecord has store, copy {
        milestone_type: String,
        streak_achieved: u64,
        minted_at: u64,
        nft_id: address,
    }

    // Events
    public struct NFTMinted has copy, drop {
        nft_id: address,
        owner: address,
        milestone_type: String,
        streak_achieved: u64,
        squad_id: address,
    }

    // Initialize the module
    fun init(ctx: &mut TxContext) {
        let registry = NFTRegistry {
            id: object::new(ctx),
            minted_nfts: table::new(ctx),
        };
        
        transfer::share_object(registry);
    }

    // Mint milestone NFT based on streak achievement
    public entry fun mint_milestone_nft(
        registry: &mut NFTRegistry,
        squad: &Squad,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let minter = tx_context::sender(ctx);
        assert!(squad::is_member(squad, minter), ENotEligibleForNFT);

        let (_, streak_count, _) = squad::get_member_record(squad, minter);
        let milestone_type = get_milestone_type(streak_count);
        
        assert!(milestone_type != string::utf8(b"None"), EInvalidMilestone);

        // Check if NFT already minted for this milestone
        if (table::contains(&registry.minted_nfts, minter)) {
            let mint_records = table::borrow(&registry.minted_nfts, minter);
            assert!(!has_milestone_nft(mint_records, &milestone_type), ENFTAlreadyMinted);
        };

        let current_time = clock::timestamp_ms(clock);
        let squad_id = squad::get_squad_id(squad);

        // Create the NFT
        let nft = SaveSquadNFT {
            id: object::new(ctx),
            name: create_nft_name(&milestone_type),
            description: create_nft_description(&milestone_type, streak_count),
            image_url: create_nft_image_url(&milestone_type),
            milestone_type: milestone_type,
            streak_achieved: streak_count,
            minted_at: current_time,
            squad_id,
            owner: minter,
        };

        let nft_id = object::uid_to_address(&nft.id);

        // Record the mint
        let mint_record = MintRecord {
            milestone_type: milestone_type,
            streak_achieved: streak_count,
            minted_at: current_time,
            nft_id,
        };

        if (table::contains(&registry.minted_nfts, minter)) {
            let mint_records = table::borrow_mut(&mut registry.minted_nfts, minter);
            vector::push_back(mint_records, mint_record);
        } else {
            table::add(&mut registry.minted_nfts, minter, vector::singleton(mint_record));
        };

        event::emit(NFTMinted {
            nft_id,
            owner: minter,
            milestone_type: milestone_type,
            streak_achieved: streak_count,
            squad_id,
        });

        // Transfer NFT to owner (non-transferable by design - stored at owner's address)
        transfer::transfer(nft, minter);
    }

    // Helper functions
    fun get_milestone_type(streak_count: u64): String {
        if (streak_count >= DIAMOND_MILESTONE) {
            string::utf8(b"Diamond")
        } else if (streak_count >= GOLD_MILESTONE) {
            string::utf8(b"Gold")
        } else if (streak_count >= SILVER_MILESTONE) {
            string::utf8(b"Silver") 
        } else if (streak_count >= BRONZE_MILESTONE) {
            string::utf8(b"Bronze")
        } else {
            string::utf8(b"None")
        }
    }

    fun create_nft_name(milestone_type: &String): String {
        let mut name = string::utf8(b"SaveSquad ");
        string::append(&mut name, *milestone_type);
        string::append(&mut name, string::utf8(b" Streak Badge"));
        name
    }

    fun create_nft_description(milestone_type: &String, streak_count: u64): String {
        let mut desc = string::utf8(b"Congratulations! You've achieved a ");
        string::append(&mut desc, *milestone_type);
        string::append(&mut desc, string::utf8(b" milestone with "));
        // Note: In a real implementation, you'd convert u64 to string
        string::append(&mut desc, string::utf8(b" weeks of consistent savings. This NFT represents your dedication to financial growth through the SaveSquad community."));
        desc
    }

    fun create_nft_image_url(milestone_type: &String): Url {
        // In production, these would be actual IPFS or web URLs
        if (milestone_type == &string::utf8(b"Diamond")) {
            url::new_unsafe_from_bytes(b"https://savesquad.io/nft/diamond.png")
        } else if (milestone_type == &string::utf8(b"Gold")) {
            url::new_unsafe_from_bytes(b"https://savesquad.io/nft/gold.png")
        } else if (milestone_type == &string::utf8(b"Silver")) {
            url::new_unsafe_from_bytes(b"https://savesquad.io/nft/silver.png")
        } else {
            url::new_unsafe_from_bytes(b"https://savesquad.io/nft/bronze.png")
        }
    }

    fun has_milestone_nft(records: &vector<MintRecord>, milestone_type: &String): bool {
        let mut i = 0;
        let len = vector::length(records);
        
        while (i < len) {
            let record = vector::borrow(records, i);
            if (&record.milestone_type == milestone_type) {
                return true
            };
            i = i + 1;
        };
        
        false
    }

    // View functions
    public fun get_nft_info(nft: &SaveSquadNFT): (String, String, Url, String, u64, u64) {
        (
            nft.name,
            nft.description, 
            nft.image_url,
            nft.milestone_type,
            nft.streak_achieved,
            nft.minted_at
        )
    }

    public fun get_user_nfts(registry: &NFTRegistry, user: address): vector<MintRecord> {
        if (table::contains(&registry.minted_nfts, user)) {
            *table::borrow(&registry.minted_nfts, user)
        } else {
            vector::empty()
        }
    }

    public fun can_mint_milestone(
        registry: &NFTRegistry,
        squad: &Squad,
        user: address
    ): (bool, String) {
        if (!squad::is_member(squad, user)) {
            return (false, string::utf8(b"Not a squad member"))
        };

        let (_, streak_count, _) = squad::get_member_record(squad, user);
        let milestone_type = get_milestone_type(streak_count);
        
        if (milestone_type == string::utf8(b"None")) {
            return (false, string::utf8(b"Streak too short"))
        };

        if (table::contains(&registry.minted_nfts, user)) {
            let mint_records = table::borrow(&registry.minted_nfts, user);
            if (has_milestone_nft(mint_records, &milestone_type)) {
                return (false, string::utf8(b"Already minted"))
            };
        };

        (true, milestone_type)
    }

    public fun get_next_milestone(current_streak: u64): (String, u64) {
        if (current_streak < BRONZE_MILESTONE) {
            (string::utf8(b"Bronze"), BRONZE_MILESTONE - current_streak)
        } else if (current_streak < SILVER_MILESTONE) {
            (string::utf8(b"Silver"), SILVER_MILESTONE - current_streak)
        } else if (current_streak < GOLD_MILESTONE) {
            (string::utf8(b"Gold"), GOLD_MILESTONE - current_streak)
        } else if (current_streak < DIAMOND_MILESTONE) {
            (string::utf8(b"Diamond"), DIAMOND_MILESTONE - current_streak)
        } else {
            (string::utf8(b"Max Level"), 0)
        }
    }
}
