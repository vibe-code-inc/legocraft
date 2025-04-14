import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal } from 'react-native';
import { Canvas } from '@react-three/fiber';
import { Scene3D } from '../game/Scene3D';
import { generateWorld } from '../game/gameMechanics';
import { BLOCK_TYPES } from '../game/blocks';
import { GameHUD } from '../components/GameHUD';
import { PerformanceMonitor, PerformanceResults, runPerformanceTests, optimizeRendering } from '../game/performance';
import gameConfig from '../game/config';

export const GameScreen = ({ onExitGame }) => {
  const [selectedBlockType, setSelectedBlockType] = useState(BLOCK_TYPES[8].id); // Default to red brick
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [playerPosition, setPlayerPosition] = useState({ x: 16, y: 20, z: 16 });
  const [playerHealth, setPlayerHealth] = useState(100);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const [showPerformanceResults, setShowPerformanceResults] = useState(false);
  const [performanceResults, setPerformanceResults] = useState(null);
  const [optimizationsApplied, setOptimizationsApplied] = useState(false);
  
  const worldRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  
  // Generate the world on component mount
  useEffect(() => {
    worldRef.current = generateWorld(gameConfig.world.size);
    
    // Simulate loading the game
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Hide controls after a delay
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  // Show controls when user moves
  const handleUserInteraction = () => {
    setShowControls(true);
    
    // Hide controls after delay
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  };
  
  // Update player position from Scene3D
  const handlePositionUpdate = (position) => {
    if (position) {
      setPlayerPosition({
        x: position.x,
        y: position.y,
        z: position.z
      });
    }
  };
  
  // Store renderer, scene, and camera references
  const handleSceneReady = (renderer, scene, camera) => {
    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    
    // Apply optimizations if not already applied
    if (!optimizationsApplied && renderer && scene && camera) {
      const optimizations = optimizeRendering(scene, camera, renderer);
      optimizations.optimizeRenderer();
      optimizations.applyFrustumCulling(true);
      setOptimizationsApplied(true);
    }
  };
  
  // Run performance tests
  const handleRunTests = () => {
    if (worldRef.current && rendererRef.current && sceneRef.current && cameraRef.current) {
      const tests = runPerformanceTests(
        worldRef.current,
        rendererRef.current,
        sceneRef.current,
        cameraRef.current
      );
      
      tests.startTests();
      
      // Show results after tests complete (approximately 5 seconds)
      setTimeout(() => {
        setPerformanceResults(tests.getResults());
        setShowPerformanceResults(true);
      }, 5000);
    }
  };
  
  return (
    <View 
      style={styles.container}
      onTouchStart={handleUserInteraction}
      onMouseMove={handleUserInteraction}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Generating LEGO World...</Text>
        </View>
      ) : (
        <>
          <Canvas style={styles.canvas} shadows>
            <Scene3D 
              world={worldRef.current} 
              selectedBlockType={selectedBlockType}
              onPositionUpdate={handlePositionUpdate}
              onSceneReady={handleSceneReady}
            />
          </Canvas>
          
          <GameHUD 
            onExitGame={onExitGame}
            selectedBlockType={selectedBlockType}
            onBlockSelect={setSelectedBlockType}
            showControls={showControls}
            playerPosition={playerPosition}
            playerHealth={playerHealth}
          />
          
          <PerformanceMonitor isVisible={showPerformanceMonitor} />
          
          {/* Performance test controls */}
          <View style={styles.performanceControls}>
            <TouchableOpacity 
              style={styles.performanceButton}
              onPress={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
            >
              <Text style={styles.buttonText}>
                {showPerformanceMonitor ? 'Hide Metrics' : 'Show Metrics'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.performanceButton}
              onPress={handleRunTests}
            >
              <Text style={styles.buttonText}>Run Performance Test</Text>
            </TouchableOpacity>
          </View>
          
          {/* Performance results modal */}
          <Modal
            visible={showPerformanceResults}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowPerformanceResults(false)}
          >
            <View style={styles.modalOverlay}>
              <PerformanceResults 
                results={performanceResults}
                onClose={() => setShowPerformanceResults(false)}
              />
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4a90e2',
  },
  loadingText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  canvas: {
    flex: 1,
  },
  performanceControls: {
    position: 'absolute',
    bottom: 100,
    right: 10,
    flexDirection: 'column',
  },
  performanceButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
