# README.md - LEGO Minecraft Game

A 3D game similar to Minecraft but with LEGO blocks, built using Expo, React Native, and Three.js.

## Features

- 3D world built with LEGO-style blocks
- First-person gameplay with block placement and removal
- Procedurally generated terrain with trees
- Various block types with different colors and properties
- Performance optimizations for smooth gameplay
- Cross-platform support (iOS, Android, Web)

## Technologies Used

- **Expo**: For cross-platform mobile development
- **React Native**: For building the mobile application
- **Three.js**: For 3D rendering
- **React Three Fiber**: React renderer for Three.js
- **React Three Drei**: Useful helpers for React Three Fiber

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI for deployment (`npm install -g eas-cli`)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd LegoMinecraft
   npm install --legacy-peer-deps
   ```

### Running the Game

```
npm start
```

This will start the Expo development server. You can then:
- Press `a` to run on Android device/emulator
- Press `i` to run on iOS simulator (macOS only)
- Press `w` to run in web browser

## Game Controls

- **WASD**: Move player
- **Space**: Jump
- **Mouse**: Look around
- **Left Click**: Place block
- **Shift+Left Click**: Remove block

## Project Structure

- `/src/components`: UI components
- `/src/screens`: Main screens (Home, Game)
- `/src/game`: Game logic and 3D rendering
  - `/src/game/engine.js`: Core game engine
  - `/src/game/blocks.js`: LEGO block definitions
  - `/src/game/textures.js`: Texture generation
  - `/src/game/gameMechanics.js`: Game mechanics
  - `/src/game/performance.js`: Performance optimization
  - `/src/game/Scene3D.js`: Main 3D scene

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Performance

The game includes built-in performance monitoring and optimization tools:
- Toggle performance metrics display in-game
- Run performance tests to identify bottlenecks
- Adjust render distance and graphics settings for better performance

## License

This project is for educational purposes only.

## Acknowledgements

- Inspired by Minecraft and LEGO
- Built with Expo and Three.js
