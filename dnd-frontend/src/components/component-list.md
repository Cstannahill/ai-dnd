# D&D App Component List

## ✅ Completed Components
- CharacterSheet (already done)
- UI Components (shadcn/ui - button, input, card, etc.)

## 🔧 Core Game Components

### Socket & API
- [x] **useSocket** - Hook for WebSocket connection management
- [x] **api.ts** - API service functions (createRoom, joinRoom, etc.)

### Character Management
- [x] **CharacterPanel** - Displays character info in sidebar during game
- [x] **AIModelSelector** - Dropdown for selecting AI model (GPT-4, Claude, etc.)

### Game Communication
- [x] **ChatMessage** - Individual message component for game chat
- [x] **DiceRoller** - Dice rolling interface with common D&D dice
- [x] **GameMap** - Battle map/grid component for tactical combat

## 🎮 Game Flow Components

### Room Management
- [x] **PlayerList** - Display of players in lobby/game
- [ ] **RoomSettings** - Game configuration panel
- [ ] **JoinRoomForm** - Form for joining existing rooms

### Gameplay Features
- [x] **CombatTracker** - Initiative order and turn management
- [ ] **SpellList** - Searchable spell reference
- [ ] **InventoryPanel** - Character equipment management
- [ ] **SkillCheck** - Interface for ability checks and saves

## 🤖 AI & Customization
- [x] **FineTuningDemo** - AI DM customization interface
- [x] **PromptEditor** - Text editor for AI prompts
- [x] **AIPersonalitySelector** - Pre-built DM personality options

## 🎲 D&D Reference Components
- [ ] **ConditionsReference** - D&D conditions lookup
- [ ] **ActionsReference** - Combat actions quick reference
- [ ] **AbilityScoreDisplay** - Standard D&D ability score layout

## 🔧 Utility Components
- [ ] **LoadingSpinner** - Loading states
- [ ] **ErrorBoundary** - Error handling wrapper
- [ ] **NotificationToast** - In-game notifications
- [ ] **ConfirmationModal** - Confirmation dialogs

## 📱 Layout Components
- [ ] **GameHeader** - Top navigation bar for game rooms
- [ ] **Sidebar** - Collapsible sidebar layout
- [ ] **TabPanel** - Custom tab implementation
- [ ] **GridLayout** - Responsive grid system

## 🎨 Visual Enhancement
- [ ] **AnimatedDice** - 3D dice rolling animation
- [ ] **HealthBar** - Visual health representation
- [ ] **ProgressRing** - Circular progress indicators
- [ ] **ParticleEffect** - Magic/spell visual effects

## Priority Order for Implementation:
1. **useSocket** & **api.ts** (Core functionality)
2. **ChatMessage**, **DiceRoller**, **CharacterPanel** (Basic gameplay)
3. **AIModelSelector**, **GameMap** (Enhanced features)
4. **CombatTracker**, **FineTuningDemo** (Advanced features)
5. **Reference components** & **Visual enhancements** (Polish)

## Notes:
- Focus on core gameplay loop first
- AI integration is central to the app's value proposition  
- Mobile responsiveness important for modern D&D players
- Consider accessibility for dice rolling (screen readers, etc.)
- WebSocket reliability crucial for multiplayer experience