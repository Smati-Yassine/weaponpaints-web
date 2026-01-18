# Requirements Document

## Introduction

The CS2 WeaponPaints Web Interface is a modern web application that enables Counter-Strike 2 players to customize their in-game cosmetic items through a browser-based interface. The system integrates with the existing CounterStrikeSharp WeaponPaints plugin and MySQL database, allowing players to configure weapon skins, knives, gloves, agents, music kits, and pins with team-specific selections (Terrorist and Counter-Terrorist).

## Glossary

- **System**: The CS2 WeaponPaints Web Interface application
- **Player**: A Counter-Strike 2 user who authenticates via Steam to customize their cosmetics
- **Steam_ID**: A 64-bit Steam identifier stored as a string (e.g., "76561198001234567")
- **Paint_ID**: A unique identifier for a weapon skin in the CS2 item system
- **Wear**: A float value between 0.00 and 1.00 representing weapon skin condition
- **Seed**: An integer value between 0 and 1000 that determines skin pattern variation
- **Team_Value**: An integer representing team affiliation (2=Terrorist, 3=Counter-Terrorist)
- **Database**: The existing MySQL database containing player customization data
- **Sticker_String**: A delimited string format "id;schema;x;y;wear;scale;rotation" for sticker positioning
- **Keychain_String**: A delimited string format "id;x;y;z;seed" for keychain positioning
- **Item_Data_Files**: JSON files containing available cosmetic items (skins_en.json, gloves_en.json, agents_en.json, music_en.json, collectibles_en.json)

## Requirements

### Requirement 1: Steam Authentication

**User Story:** As a player, I want to log in using my Steam account, so that I can access and manage my personal weapon customizations securely.

#### Acceptance Criteria

1. WHEN a player visits the application, THE System SHALL display a Steam login button
2. WHEN a player clicks the Steam login button, THE System SHALL redirect to Steam OpenID authentication
3. WHEN Steam authentication succeeds, THE System SHALL extract the player's Steam_ID as a 64-bit string
4. WHEN authentication is complete, THE System SHALL create or retrieve the player's session
5. WHEN a player is authenticated, THE System SHALL display their Steam profile information
6. WHEN a player logs out, THE System SHALL terminate their session and clear authentication data

### Requirement 2: Weapon Skin Selection and Configuration

**User Story:** As a player, I want to select and configure skins for all my weapons, so that I can customize my in-game appearance.

#### Acceptance Criteria

1. WHEN a player views the weapon customization interface, THE System SHALL display all available weapons organized by category
2. WHEN a player selects a weapon, THE System SHALL load available skins from skins_en.json with Paint_ID, name, and image
3. WHEN a player chooses a skin, THE System SHALL save the Paint_ID to wp_player_skins table with the player's Steam_ID
4. WHEN a player configures wear value, THE System SHALL validate it is between 0.00 and 1.00 inclusive
5. WHEN a player configures seed value, THE System SHALL validate it is between 0 and 1000 inclusive
6. WHEN a player saves weapon configuration, THE System SHALL persist wear and seed values to the Database
7. WHEN a player loads their configuration, THE System SHALL retrieve all weapon customizations from wp_player_skins table

### Requirement 3: Knife Selection

**User Story:** As a player, I want to select different knives for Terrorist and Counter-Terrorist teams, so that I can have team-specific knife customizations.

#### Acceptance Criteria

1. WHEN a player accesses knife selection, THE System SHALL display separate interfaces for Team_Value 2 (T) and Team_Value 3 (CT)
2. WHEN a player selects a knife for a team, THE System SHALL save it to wp_player_knife table with the corresponding Team_Value
3. WHEN a player configures knife skin, THE System SHALL apply wear and seed configuration options
4. WHEN a player switches between team tabs, THE System SHALL load the correct team-specific knife configuration
5. WHEN a player saves knife configuration, THE System SHALL create separate database entries for each Team_Value

### Requirement 4: Glove Selection

**User Story:** As a player, I want to select different gloves for each team, so that my glove customizations match my team affiliation.

#### Acceptance Criteria

1. WHEN a player accesses glove selection, THE System SHALL load available gloves from gloves_en.json
2. WHEN a player selects gloves, THE System SHALL provide separate selection for Team_Value 2 and Team_Value 3
3. WHEN a player saves glove configuration, THE System SHALL persist selections to wp_player_gloves table with Team_Value
4. WHEN a player loads glove configuration, THE System SHALL display the correct gloves for each team

### Requirement 5: Agent Selection

**User Story:** As a player, I want to select different player models (agents) for Terrorist and Counter-Terrorist teams, so that I can customize my character appearance per team.

#### Acceptance Criteria

1. WHEN a player accesses agent selection, THE System SHALL load available agents from agents_en.json
2. WHEN a player views agent selection, THE System SHALL display separate interfaces for T and CT teams
3. WHEN a player selects an agent for T team, THE System SHALL save it to wp_player_agents table with Team_Value 2
4. WHEN a player selects an agent for CT team, THE System SHALL save it to wp_player_agents table with Team_Value 3
5. WHEN a player loads agent configuration, THE System SHALL retrieve and display team-specific agent selections

### Requirement 6: Music Kit Selection

**User Story:** As a player, I want to select music kits for each team, so that I can customize my in-game audio experience.

#### Acceptance Criteria

1. WHEN a player accesses music kit selection, THE System SHALL load available music kits from music_en.json
2. WHEN a player selects a music kit, THE System SHALL provide team-specific selection for Team_Value 2 and Team_Value 3
3. WHEN a player saves music kit configuration, THE System SHALL persist selections to wp_player_music table with Team_Value
4. WHEN a player loads music kit configuration, THE System SHALL display the correct music kit for each team

### Requirement 7: Pin Selection

**User Story:** As a player, I want to select collectible pins for each team, so that I can display my achievements and preferences.

#### Acceptance Criteria

1. WHEN a player accesses pin selection, THE System SHALL load available pins from collectibles_en.json
2. WHEN a player selects pins, THE System SHALL provide team-specific selection for Team_Value 2 and Team_Value 3
3. WHEN a player saves pin configuration, THE System SHALL persist selections to wp_player_pins table with Team_Value
4. WHEN a player loads pin configuration, THE System SHALL display the correct pins for each team

### Requirement 8: StatTrak Configuration

**User Story:** As a player, I want to enable StatTrak on my weapons and set custom counters, so that I can track my kills with specific weapons.

#### Acceptance Criteria

1. WHEN a player configures a weapon skin, THE System SHALL provide a StatTrak toggle option
2. WHEN a player enables StatTrak, THE System SHALL save the stattrak flag to wp_player_skins table
3. WHEN StatTrak is enabled, THE System SHALL provide an input field for the StatTrak counter value
4. WHEN a player sets a StatTrak counter, THE System SHALL validate it is a non-negative integer
5. WHEN a player saves StatTrak configuration, THE System SHALL persist both the toggle state and counter value

### Requirement 9: Weapon Nametag Configuration

**User Story:** As a player, I want to add custom nametags to my weapons, so that I can personalize them with unique names.

#### Acceptance Criteria

1. WHEN a player configures a weapon skin, THE System SHALL provide a nametag input field
2. WHEN a player enters a nametag, THE System SHALL validate the text length and allowed characters
3. WHEN a player saves a nametag, THE System SHALL persist it to the nametag column in wp_player_skins table
4. WHEN a player loads weapon configuration, THE System SHALL display the saved nametag

### Requirement 10: Sticker Application and Positioning

**User Story:** As a player, I want to apply up to 5 stickers on each weapon with custom positioning, so that I can further personalize my weapon appearance.

#### Acceptance Criteria

1. WHEN a player configures a weapon skin, THE System SHALL provide an interface to add up to 5 stickers
2. WHEN a player adds a sticker, THE System SHALL allow configuration of id, schema, x, y, wear, scale, and rotation values
3. WHEN a player saves sticker configuration, THE System SHALL format it as Sticker_String "id;schema;x;y;wear;scale;rotation"
4. WHEN multiple stickers are configured, THE System SHALL concatenate them with appropriate delimiters
5. WHEN a player saves sticker data, THE System SHALL persist the Sticker_String to wp_player_skins table
6. WHEN a player loads weapon configuration, THE System SHALL parse the Sticker_String and display all configured stickers

### Requirement 11: Keychain Application and Positioning

**User Story:** As a player, I want to attach keychains to my weapons with custom positioning, so that I can add unique decorative elements.

#### Acceptance Criteria

1. WHEN a player configures a weapon skin, THE System SHALL provide an interface to add a keychain
2. WHEN a player adds a keychain, THE System SHALL allow configuration of id, x, y, z, and seed values
3. WHEN a player saves keychain configuration, THE System SHALL format it as Keychain_String "id;x;y;z;seed"
4. WHEN a player saves keychain data, THE System SHALL persist the Keychain_String to wp_player_skins table
5. WHEN a player loads weapon configuration, THE System SHALL parse the Keychain_String and display the configured keychain

### Requirement 12: Team-Specific Configuration Management

**User Story:** As a player, I want to configure items separately for Terrorist and Counter-Terrorist teams, so that I can have different customizations based on which team I'm playing.

#### Acceptance Criteria

1. WHEN a player configures team-specific items (knife, gloves, agents, music, pins), THE System SHALL maintain separate database entries for Team_Value 2 and Team_Value 3
2. WHEN a player switches between team configuration views, THE System SHALL load and display the correct team-specific data
3. WHEN a player saves team-specific configuration, THE System SHALL ensure the correct Team_Value is stored in the Database
4. WHEN a player has no configuration for a team, THE System SHALL display default or empty state for that team
5. IF a player copies configuration from one team to another, THEN THE System SHALL create a new database entry with the target Team_Value

### Requirement 13: Data Persistence and Retrieval

**User Story:** As a system administrator, I want the application to work seamlessly with the existing MySQL database schema, so that player data remains compatible with the CS2 plugin.

#### Acceptance Criteria

1. THE System SHALL connect to the existing MySQL Database using the current schema
2. WHEN storing Steam_ID values, THE System SHALL use string format for 64-bit Steam identifiers
3. WHEN writing to wp_player_skins, THE System SHALL include all fields: paint_id, wear, seed, nametag, stattrak, stickers, keychains
4. WHEN writing team-specific data, THE System SHALL use Team_Value 2 for Terrorist and Team_Value 3 for Counter-Terrorist
5. WHEN reading player data, THE System SHALL query by Steam_ID and Team_Value where applicable
6. WHEN parsing delimited strings (stickers, keychains), THE System SHALL correctly handle the existing format specifications

### Requirement 14: Item Data Loading

**User Story:** As a player, I want to see all available cosmetic items with their names and images, so that I can make informed customization choices.

#### Acceptance Criteria

1. WHEN the application starts, THE System SHALL load Item_Data_Files (skins_en.json, gloves_en.json, agents_en.json, music_en.json, collectibles_en.json)
2. WHEN displaying item selection interfaces, THE System SHALL show item names and images from the loaded data
3. WHEN an item is selected, THE System SHALL use the correct identifier (Paint_ID or equivalent) from the Item_Data_Files
4. IF an Item_Data_File fails to load, THEN THE System SHALL log the error and display a user-friendly message
5. WHEN Item_Data_Files are updated, THE System SHALL reload the data without requiring application restart

### Requirement 15: Responsive User Interface

**User Story:** As a player, I want to use the application on any device with a modern, intuitive interface, so that I can manage my customizations from desktop or mobile.

#### Acceptance Criteria

1. WHEN a player accesses the application on any device, THE System SHALL display a responsive layout that adapts to screen size
2. WHEN a player navigates the interface, THE System SHALL provide clear visual feedback for interactions
3. WHEN a player views item selections, THE System SHALL display items in an organized, searchable, and filterable grid or list
4. WHEN a player makes changes, THE System SHALL provide visual confirmation of save operations
5. WHEN loading data, THE System SHALL display loading indicators to inform the player of ongoing operations
6. WHEN errors occur, THE System SHALL display clear, actionable error messages

### Requirement 16: Configuration Preview

**User Story:** As a player, I want to preview my weapon and cosmetic configurations before saving, so that I can see how my customizations will look in-game.

#### Acceptance Criteria

1. WHEN a player configures a weapon skin, THE System SHALL display a preview image showing the selected skin
2. WHEN a player adjusts wear value, THE System SHALL update the preview to reflect the wear condition
3. WHEN a player adds stickers, THE System SHALL display sticker positions on the weapon preview where technically feasible
4. WHEN a player selects gloves or agents, THE System SHALL display preview images of the selected items
5. WHEN a player configures multiple items, THE System SHALL allow switching between previews for different item categories

### Requirement 17: Search and Filter Functionality

**User Story:** As a player, I want to search and filter available items, so that I can quickly find specific skins, gloves, agents, or other cosmetics.

#### Acceptance Criteria

1. WHEN a player views any item selection interface, THE System SHALL provide a search input field
2. WHEN a player enters search text, THE System SHALL filter displayed items by name matching the search query
3. WHEN a player applies filters (rarity, collection, type), THE System SHALL display only items matching the filter criteria
4. WHEN a player clears search or filters, THE System SHALL restore the full item list
5. WHEN search returns no results, THE System SHALL display a message indicating no items match the criteria

### Requirement 18: Bulk Configuration Operations

**User Story:** As a player, I want to copy configurations between teams or reset all customizations, so that I can efficiently manage my settings.

#### Acceptance Criteria

1. WHEN a player requests to copy team configuration, THE System SHALL duplicate all team-specific settings from source team to target team
2. WHEN a player confirms copy operation, THE System SHALL create new database entries with the target Team_Value
3. WHEN a player requests to reset configuration, THE System SHALL prompt for confirmation before deletion
4. WHEN a player confirms reset, THE System SHALL delete the specified configuration entries from the Database
5. WHEN bulk operations complete, THE System SHALL display a confirmation message and refresh the interface

### Requirement 19: Session Management and Security

**User Story:** As a system administrator, I want secure session management and data validation, so that player data is protected from unauthorized access and malicious input.

#### Acceptance Criteria

1. WHEN a player authenticates, THE System SHALL create a secure session with appropriate timeout
2. WHEN a session expires, THE System SHALL require re-authentication before allowing data modifications
3. WHEN a player submits data, THE System SHALL validate all inputs against expected formats and ranges
4. WHEN invalid data is submitted, THE System SHALL reject the request and return descriptive error messages
5. WHEN database queries are constructed, THE System SHALL use parameterized queries to prevent SQL injection
6. WHEN a player accesses data, THE System SHALL verify the session Steam_ID matches the requested data Steam_ID

### Requirement 20: Error Handling and Logging

**User Story:** As a system administrator, I want comprehensive error handling and logging, so that I can diagnose and resolve issues quickly.

#### Acceptance Criteria

1. WHEN an error occurs during database operations, THE System SHALL log the error with timestamp, user context, and error details
2. WHEN an error occurs, THE System SHALL display a user-friendly error message without exposing sensitive system information
3. WHEN Item_Data_Files fail to load, THE System SHALL log the failure and attempt to use cached data if available
4. WHEN authentication fails, THE System SHALL log the failure reason and display an appropriate message to the player
5. WHEN the System encounters unexpected states, THE System SHALL log diagnostic information and gracefully degrade functionality
