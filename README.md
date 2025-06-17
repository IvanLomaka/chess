# Chess Multiplayer Game

A real-time multiplayer chess game developed in April 2021 during my second year of liceo. This was my first semi-large project using Node.js, Express, and Socket.IO.

## Technologies Used

### Backend
- **Node.js**: Server-side JavaScript runtime used to build the game server
- **Express.js (v4.17.1)**: Web application framework for creating the server and handling HTTP requests
- **Socket.IO (v4.0.1)**: Real-time bidirectional event-based communication library enabling live game updates and chat
- **Moment.js (v2.29.1)**: Time handling library used for formatting timestamps in chat messages

### Frontend
- **HTML5**: Used for creating the structure of the game board and UI
- **CSS3**: Styled the chessboard, pieces, and overall user interface
- **JavaScript**: Client-side logic for game mechanics, board rendering, and socket communication
- **DOM Manipulation**: Extensive use of document manipulation to update the game board dynamically

### Development Tools
- **Nodemon (v2.0.7)**: Development tool that automatically restarts the server on code changes

## Key Features

1. **Real-time Multiplayer**: Play chess with friends online with real-time move updates
2. **Room System**: Create and join game rooms with unique codes
3. **Live Chat**: In-game chat for players to communicate
4. **AI Opponent**: Single-player mode with a computer opponent using the Minimax algorithm
5. **Move Validation**: Comprehensive chess rule implementation
6. **Custom Pieces**: Multiple chess piece themes/styles
7. **Audio Feedback**: Sound effects for piece movements, captures, and game end
8. **Random Name Generator**: Automatic player name assignment

## What I Learned

### Technical Skills
- **Server-Side JavaScript**: How to create and manage a Node.js server
- **WebSockets**: Implementation of real-time bidirectional communication using Socket.IO
- **Event-Driven Programming**: Using event listeners and emitters for game state management
- **Game State Management**: Maintaining and synchronizing game state across multiple clients
- **Algorithm Implementation**: Implemented chess rules and AI using the Minimax algorithm with alpha-beta pruning

### Software Architecture
- **Client-Server Model**: Structuring code to handle both client and server responsibilities
- **Event-Based Architecture**: Designing systems around events for real-time interactions
- **Code Organization**: Separating concerns into different files and modules

### Project Management
- **Feature Planning**: Breaking down a complex project into manageable components
- **Debugging Strategies**: Troubleshooting issues in a multi-component system
- **Progressive Enhancement**: Building core functionality first, then adding features incrementally

### Personal Growth
- **Problem-Solving**: Tackling complex game logic and networking challenges
- **Self-Learning**: Researching and implementing new technologies independently
- **Project Completion**: Taking a substantial project from concept to completion

## Challenges Overcome
- Synchronizing game state between multiple clients
- Implementing complete chess rules (castling, en passant, promotion)
- Creating an AI opponent with various difficulty levels (does not always work)
- Managing real-time communication with minimal latency
- Handling player disconnections gracefully

This project represented a significant milestone in my programming journey, introducing me to web application development with Node.js and real-time communication concepts. It laid the foundation for my understanding of full-stack JavaScript development and game programming.

---
Created by Ivan | April 2021