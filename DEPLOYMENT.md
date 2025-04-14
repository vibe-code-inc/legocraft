## Deployment Guide for LEGO Minecraft Game

This document provides instructions for deploying the LEGO Minecraft game to different platforms.

### Web Deployment

To deploy the game to the web:

1. Build the web version:
   ```
   npm run build:web
   ```

2. Deploy to GitHub Pages:
   ```
   npm run deploy
   ```

Alternatively, you can manually deploy the web-build directory to any static hosting service.

### Mobile Deployment

#### Prerequisites
- Expo account (create one at https://expo.dev/signup)
- EAS CLI installed (`npm install -g eas-cli`)
- Logged in to EAS (`eas login`)

#### Android Build
To build for Android:
```
npm run build:android
```

#### iOS Build
To build for iOS (requires macOS):
```
npm run build:ios
```

#### Preview Build
To create a preview build for testing:
```
npm run preview
```

### Local Development

To run the game locally:
```
npm start
```

This will start the Expo development server, allowing you to run the game on:
- Android device/emulator: `npm run android`
- iOS device/simulator: `npm run ios`
- Web browser: `npm run web`

### Performance Considerations

The game includes performance monitoring and optimization tools:
- Toggle performance metrics display in-game
- Run performance tests to identify bottlenecks
- Adjust render distance and graphics settings for better performance

### Game Controls

- WASD: Move player
- Space: Jump
- Mouse: Look around
- Left Click: Place block
- Shift+Left Click: Remove block

### Additional Resources

For more information on Expo deployment:
- https://docs.expo.dev/deploy/
- https://docs.expo.dev/build/setup/
