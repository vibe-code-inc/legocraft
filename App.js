import 'react-native-gesture-handler';
// All other imports should come after this

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  
  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="auto" hidden />
      {currentScreen === 'home' && (
        <HomeScreen onStartGame={() => setCurrentScreen('game')} />
      )}
      {currentScreen === 'game' && (
        <GameScreen onExitGame={() => setCurrentScreen('home')} />
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
