import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import { BLOCK_TYPES } from '../game/blocks';

// Enhanced Home Screen with better UI
export const HomeScreen = ({ onStartGame }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [settings, setSettings] = useState({
    renderDistance: 8,
    soundVolume: 80,
    musicVolume: 60,
    dayNightCycle: true,
    shadows: true,
  });

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>LEGO MINECRAFT</Text>
        <Text style={styles.subtitle}>Build your world with LEGO blocks</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onStartGame}>
          <Text style={styles.buttonText}>START GAME</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => setShowSettings(true)}>
          <Text style={styles.buttonText}>SETTINGS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={() => setShowAbout(true)}>
          <Text style={styles.buttonText}>ABOUT</Text>
        </TouchableOpacity>
      </View>
      
      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Render Distance</Text>
              <View style={styles.settingControl}>
                <TouchableOpacity 
                  style={styles.settingButton}
                  onPress={() => setSettings({...settings, renderDistance: Math.max(4, settings.renderDistance - 1)})}
                >
                  <Text style={styles.settingButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.settingValue}>{settings.renderDistance}</Text>
                <TouchableOpacity 
                  style={styles.settingButton}
                  onPress={() => setSettings({...settings, renderDistance: Math.min(16, settings.renderDistance + 1)})}
                >
                  <Text style={styles.settingButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sound Volume</Text>
              <View style={styles.settingControl}>
                <TouchableOpacity 
                  style={styles.settingButton}
                  onPress={() => setSettings({...settings, soundVolume: Math.max(0, settings.soundVolume - 10)})}
                >
                  <Text style={styles.settingButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.settingValue}>{settings.soundVolume}%</Text>
                <TouchableOpacity 
                  style={styles.settingButton}
                  onPress={() => setSettings({...settings, soundVolume: Math.min(100, settings.soundVolume + 10)})}
                >
                  <Text style={styles.settingButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Music Volume</Text>
              <View style={styles.settingControl}>
                <TouchableOpacity 
                  style={styles.settingButton}
                  onPress={() => setSettings({...settings, musicVolume: Math.max(0, settings.musicVolume - 10)})}
                >
                  <Text style={styles.settingButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.settingValue}>{settings.musicVolume}%</Text>
                <TouchableOpacity 
                  style={styles.settingButton}
                  onPress={() => setSettings({...settings, musicVolume: Math.min(100, settings.musicVolume + 10)})}
                >
                  <Text style={styles.settingButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Day/Night Cycle</Text>
              <TouchableOpacity 
                style={[styles.toggleButton, settings.dayNightCycle ? styles.toggleActive : styles.toggleInactive]}
                onPress={() => setSettings({...settings, dayNightCycle: !settings.dayNightCycle})}
              >
                <Text style={styles.toggleText}>{settings.dayNightCycle ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Shadows</Text>
              <TouchableOpacity 
                style={[styles.toggleButton, settings.shadows ? styles.toggleActive : styles.toggleInactive]}
                onPress={() => setSettings({...settings, shadows: !settings.shadows})}
              >
                <Text style={styles.toggleText}>{settings.shadows ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.closeButtonText}>SAVE & CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* About Modal */}
      <Modal
        visible={showAbout}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAbout(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>About LEGO Minecraft</Text>
            
            <ScrollView style={styles.aboutScroll}>
              <Text style={styles.aboutText}>
                LEGO Minecraft is a 3D block-building game that combines the creativity of LEGO with the open-world gameplay of Minecraft.
              </Text>
              
              <Text style={styles.aboutText}>
                Build anything you can imagine using colorful LEGO blocks in a procedurally generated world. Place and remove blocks, explore the terrain, and let your creativity run wild!
              </Text>
              
              <Text style={styles.aboutSubtitle}>Controls:</Text>
              <Text style={styles.aboutText}>
                • WASD - Move around{'\n'}
                • SPACE - Jump{'\n'}
                • Left Click - Place block{'\n'}
                • Shift+Left Click - Remove block{'\n'}
                • Mouse - Look around
              </Text>
              
              <Text style={styles.aboutSubtitle}>Credits:</Text>
              <Text style={styles.aboutText}>
                Created with Expo, React Native, and Three.js
              </Text>
              
              <Text style={styles.aboutText}>
                Version 1.0.0
              </Text>
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowAbout(false)}
            >
              <Text style={styles.closeButtonText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  buttonContainer: {
    width: '80%',
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#f5a623',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#e09600',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingButton: {
    backgroundColor: '#4a90e2',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingValue: {
    marginHorizontal: 10,
    fontSize: 16,
    minWidth: 40,
    textAlign: 'center',
  },
  toggleButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    minWidth: 70,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#4CAF50',
  },
  toggleInactive: {
    backgroundColor: '#F44336',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#f5a623',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  aboutScroll: {
    maxHeight: 300,
  },
  aboutText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
    lineHeight: 20,
  },
  aboutSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
});
