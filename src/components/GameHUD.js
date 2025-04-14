import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Modal } from 'react-native';
import { BLOCK_TYPES } from '../game/blocks';
import gameConfig from '../game/config';

// HUD component for in-game interface
export const GameHUD = ({ 
  onExitGame, 
  selectedBlockType, 
  onBlockSelect, 
  showControls, 
  playerPosition,
  playerHealth = 100,
  inventory = []
}) => {
  const [showInventory, setShowInventory] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  
  // Get the current block type object
  const currentBlockType = BLOCK_TYPES.find(type => type.id === selectedBlockType) || BLOCK_TYPES[0];
  
  // Format player position for display
  const formatPosition = (pos) => {
    if (!pos) return 'X: 0 Y: 0 Z: 0';
    return `X: ${Math.floor(pos.x)} Y: ${Math.floor(pos.y)} Z: ${Math.floor(pos.z)}`;
  };
  
  return (
    <View style={[styles.container, !showControls && styles.hiddenControls]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.positionDisplay}>
          <Text style={styles.positionText}>{formatPosition(playerPosition)}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => setShowPauseMenu(true)}
        >
          <Text style={styles.menuButtonText}>MENU</Text>
        </TouchableOpacity>
      </View>
      
      {/* Health Bar */}
      <View style={styles.healthContainer}>
        <View style={styles.healthBarBackground}>
          <View 
            style={[
              styles.healthBarFill, 
              { width: `${playerHealth}%` },
              playerHealth < 30 ? styles.healthLow : null
            ]} 
          />
        </View>
        <Text style={styles.healthText}>{playerHealth}</Text>
      </View>
      
      {/* Bottom Bar with Block Selection */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={styles.inventoryButton}
          onPress={() => setShowInventory(!showInventory)}
        >
          <Text style={styles.inventoryButtonText}>INVENTORY</Text>
        </TouchableOpacity>
        
        <View style={styles.blockSelector}>
          <Text style={styles.blockSelectorTitle}>Current Block:</Text>
          <View style={styles.selectedBlockContainer}>
            <View 
              style={[
                styles.selectedBlockPreview, 
                { backgroundColor: currentBlockType.color }
              ]} 
            />
            <Text style={styles.selectedBlockName}>{currentBlockType.name}</Text>
          </View>
        </View>
        
        <View style={styles.controlsHint}>
          <Text style={styles.controlsHintText}>
            Click to place • Shift+Click to remove
          </Text>
        </View>
      </View>
      
      {/* Block Palette */}
      <View style={[styles.blockPalette, !showInventory && styles.hiddenPalette]}>
        <View style={styles.blockPaletteHeader}>
          <Text style={styles.blockPaletteTitle}>Block Inventory</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowInventory(false)}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.blockGrid}>
          {BLOCK_TYPES.map((blockType) => (
            <TouchableOpacity
              key={blockType.id}
              style={[
                styles.blockOption,
                { backgroundColor: blockType.color },
                selectedBlockType === blockType.id && styles.selectedBlock
              ]}
              onPress={() => {
                onBlockSelect(blockType.id);
                setShowInventory(false);
              }}
            >
              <Text style={styles.blockOptionName}>{blockType.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Pause Menu Modal */}
      <Modal
        visible={showPauseMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPauseMenu(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Game Paused</Text>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setShowPauseMenu(false)}
            >
              <Text style={styles.modalButtonText}>RESUME GAME</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>SETTINGS</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={onExitGame}
            >
              <Text style={styles.modalButtonText}>EXIT TO MENU</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Crosshair */}
      <View style={styles.crosshair}>
        <View style={styles.crosshairHorizontal} />
        <View style={styles.crosshairVertical} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    opacity: 1,
    transition: 'opacity 0.5s ease',
  },
  hiddenControls: {
    opacity: 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  positionDisplay: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  positionText: {
    color: '#fff',
    fontSize: 14,
  },
  menuButton: {
    backgroundColor: '#f5a623',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    pointerEvents: 'auto',
  },
  menuButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  healthContainer: {
    position: 'absolute',
    top: 60,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthBarBackground: {
    width: 150,
    height: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 7,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 7,
  },
  healthLow: {
    backgroundColor: '#F44336',
  },
  healthText: {
    color: '#fff',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  inventoryButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    pointerEvents: 'auto',
  },
  inventoryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  blockSelector: {
    alignItems: 'center',
  },
  blockSelectorTitle: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 5,
  },
  selectedBlockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  selectedBlockPreview: {
    width: 20,
    height: 20,
    borderRadius: 3,
    marginRight: 10,
  },
  selectedBlockName: {
    color: '#fff',
    fontSize: 14,
  },
  controlsHint: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  controlsHintText: {
    color: '#fff',
    fontSize: 12,
  },
  blockPalette: {
    position: 'absolute',
    bottom: 70,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
    padding: 10,
    maxHeight: 300,
    transform: [{ translateY: 0 }],
    transition: 'transform 0.3s ease',
    pointerEvents: 'auto',
  },
  hiddenPalette: {
    transform: [{ translateY: 400 }],
    pointerEvents: 'none',
  },
  blockPaletteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  blockPaletteTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#F44336',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  blockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  blockOption: {
    width: '23%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 5,
    justifyContent: 'flex-end',
    padding: 5,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  selectedBlock: {
    borderColor: '#fff',
    borderWidth: 3,
    transform: [{ scale: 1.05 }],
  },
  blockOptionName: {
    color: '#fff',
    fontSize: 10,
    textShadow: '-1px 1px 2px rgba(0, 0, 0, 0.75)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  modalButton: {
    backgroundColor: '#4a90e2',
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  crosshair: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -10,
  },
  crosshairHorizontal: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  crosshairVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});
