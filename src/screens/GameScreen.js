import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, PanResponder } from 'react-native';
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

  const [movementState, setMovementState] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false
  });
  
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (cameraRef.current) {
          const sensitivity = 0.01;
          cameraRef.current.rotation.y -= gestureState.dx * sensitivity;
          // Limit vertical rotation to avoid flipping
          const newXRotation = cameraRef.current.rotation.x - gestureState.dy * sensitivity;
          cameraRef.current.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, newXRotation));
        }
      }
    })
  ).current;
  
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
          <Canvas style={styles.canvas} shadows fallback={<Text style={styles.fallbackText}>Loading 3D world...</Text>} {...panResponder.panHandlers}>
            <Scene3D
              world={worldRef.current}
              selectedBlockType={selectedBlockType}
              onPositionUpdate={handlePositionUpdate}
              onSceneReady={handleSceneReady}
              movementState={movementState}
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

          <View style={styles.touchControls}>
            <View style={styles.moveControls}>
              <TouchableOpacity
                style={styles.controlButton}
                onPressIn={() => setMovementState(prev => ({...prev, forward: true}))}
                onPressOut={() => setMovementState(prev => ({...prev, forward: false}))}
              >
                <Text style={styles.controlText}>↑</Text>
              </TouchableOpacity>

              <View style={styles.horizontalControls}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPressIn={() => setMovementState(prev => ({...prev, left: true}))}
                  onPressOut={() => setMovementState(prev => ({...prev, left: false}))}
                >
                  <Text style={styles.controlText}>←</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPressIn={() => setMovementState(prev => ({...prev, backward: true}))}
                  onPressOut={() => setMovementState(prev => ({...prev, backward: false}))}
                >
                  <Text style={styles.controlText}>↓</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPressIn={() => setMovementState(prev => ({...prev, right: true}))}
                  onPressOut={() => setMovementState(prev => ({...prev, right: false}))}
                >
                  <Text style={styles.controlText}>→</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.controlButton, styles.jumpButton]}
              onPressIn={() => setMovementState(prev => ({...prev, jump: true}))}
              onPressOut={() => setMovementState(prev => ({...prev, jump: false}))}
            >
              <Text style={styles.controlText}>JUMP</Text>
            </TouchableOpacity>
          </View>

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
  fallbackText: {
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
  touchControls: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moveControls: {
    alignItems: 'center',
  },
  horizontalControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  controlButton: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  jumpButton: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(245, 166, 35, 0.7)',
  },
  controlText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
