import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import * as THREE from 'three';
import { World } from './engine';
import { BLOCK_TYPES } from './blocks';
import gameConfig from './config';

// Performance testing and optimization utilities
export const runPerformanceTests = (world, renderer, scene, camera) => {
  // Store test results
  const results = {
    fps: [],
    renderTime: [],
    memoryUsage: [],
    blockCount: world ? world.getAllBlocks().length : 0,
    recommendations: []
  };
  
  // Variables for FPS calculation
  let frameCount = 0;
  let lastTime = performance.now();
  let fpsArray = [];
  
  // Test frame rate
  const measureFrameRate = () => {
    frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;
    
    // Calculate FPS every second
    if (elapsed >= 1000) {
      const fps = Math.round((frameCount * 1000) / elapsed);
      fpsArray.push(fps);
      frameCount = 0;
      lastTime = currentTime;
      
      // After collecting 5 samples, calculate average
      if (fpsArray.length >= 5) {
        const avgFps = fpsArray.reduce((sum, val) => sum + val, 0) / fpsArray.length;
        results.fps.push(avgFps);
        fpsArray = [];
        
        // Add recommendations based on FPS
        if (avgFps < 30) {
          results.recommendations.push('Low frame rate detected. Consider reducing render distance or world size.');
        }
      }
    }
    
    // Continue measuring if we haven't collected enough data
    if (results.fps.length < 3) {
      requestAnimationFrame(measureFrameRate);
    }
  };
  
  // Measure render time
  const measureRenderTime = () => {
    if (!renderer || !scene || !camera) return;
    
    const renderTimes = [];
    
    // Measure render time for 10 frames
    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();
      renderer.render(scene, camera);
      const endTime = performance.now();
      renderTimes.push(endTime - startTime);
    }
    
    // Calculate average render time
    const avgRenderTime = renderTimes.reduce((sum, val) => sum + val, 0) / renderTimes.length;
    results.renderTime.push(avgRenderTime);
    
    // Add recommendations based on render time
    if (avgRenderTime > 16) { // 16ms = ~60fps
      results.recommendations.push('Slow render time detected. Consider optimizing scene complexity.');
    }
  };
  
  // Measure memory usage
  const measureMemoryUsage = () => {
    if (window.performance && window.performance.memory) {
      const memory = window.performance.memory;
      results.memoryUsage.push({
        totalJSHeapSize: memory.totalJSHeapSize / (1024 * 1024), // MB
        usedJSHeapSize: memory.usedJSHeapSize / (1024 * 1024), // MB
        jsHeapSizeLimit: memory.jsHeapSizeLimit / (1024 * 1024) // MB
      });
      
      // Add recommendations based on memory usage
      if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.8) {
        results.recommendations.push('High memory usage detected. Consider reducing world size or texture quality.');
      }
    } else {
      results.memoryUsage.push('Memory API not available');
    }
  };
  
  // Start performance tests
  const startTests = () => {
    measureFrameRate();
    measureRenderTime();
    measureMemoryUsage();
  };
  
  // Return test functions and results
  return {
    startTests,
    getResults: () => results
  };
};

// Optimization strategies
export const optimizeRendering = (scene, camera, renderer) => {
  // Apply optimizations and return the optimization functions
  return {
    // Level of Detail (LOD) optimization
    applyLOD: (enabled = true) => {
      if (!scene) return;
      
      if (enabled) {
        // Find all mesh objects in the scene
        scene.traverse((object) => {
          if (object.isMesh) {
            // Create LOD levels based on distance
            const lod = new THREE.LOD();
            
            // Original high detail model
            lod.addLevel(object, 0);
            
            // Medium detail model (simplified geometry)
            const mediumGeometry = object.geometry.clone();
            // Simplify geometry (in a real implementation, you would use a geometry simplification algorithm)
            const mediumMesh = new THREE.Mesh(mediumGeometry, object.material);
            lod.addLevel(mediumMesh, 20);
            
            // Low detail model (very simplified)
            const lowGeometry = new THREE.BoxGeometry(1, 1, 1); // Simple cube for far distances
            const lowMesh = new THREE.Mesh(lowGeometry, object.material);
            lod.addLevel(lowMesh, 50);
            
            // Replace original object with LOD
            object.parent.add(lod);
            lod.position.copy(object.position);
            object.parent.remove(object);
          }
        });
      }
    },
    
    // Frustum culling optimization
    applyFrustumCulling: (enabled = true) => {
      if (!scene || !camera) return;
      
      if (enabled) {
        const frustum = new THREE.Frustum();
        const projScreenMatrix = new THREE.Matrix4();
        
        // Update the frustum on each frame
        const updateFrustum = () => {
          camera.updateMatrixWorld();
          projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
          frustum.setFromProjectionMatrix(projScreenMatrix);
          
          // Check each object against the frustum
          scene.traverse((object) => {
            if (object.isMesh) {
              if (!object.userData.boundingBox) {
                object.userData.boundingBox = new THREE.Box3().setFromObject(object);
              }
              
              // Update bounding box
              object.userData.boundingBox.setFromObject(object);
              
              // Check if object is in frustum
              const isInFrustum = frustum.intersectsBox(object.userData.boundingBox);
              object.visible = isInFrustum;
            }
          });
          
          requestAnimationFrame(updateFrustum);
        };
        
        updateFrustum();
      } else {
        // Make all objects visible
        scene.traverse((object) => {
          if (object.isMesh) {
            object.visible = true;
          }
        });
      }
    },
    
    // Instanced rendering for similar objects
    applyInstancing: (enabled = true) => {
      if (!scene) return;
      
      if (enabled) {
        // Group similar meshes by geometry and material
        const instanceGroups = {};
        
        scene.traverse((object) => {
          if (object.isMesh) {
            const geometryId = object.geometry.uuid;
            const materialId = object.material.uuid;
            const key = `${geometryId}_${materialId}`;
            
            if (!instanceGroups[key]) {
              instanceGroups[key] = {
                geometry: object.geometry,
                material: object.material,
                positions: []
              };
            }
            
            instanceGroups[key].positions.push(object.position.clone());
          }
        });
        
        // Create instanced meshes for each group
        Object.values(instanceGroups).forEach((group) => {
          if (group.positions.length > 10) { // Only use instancing for groups with many objects
            // Create instanced buffer geometry
            const instancedGeometry = new THREE.InstancedBufferGeometry().copy(group.geometry);
            
            // Create matrix for each instance
            const matrices = new Float32Array(group.positions.length * 16);
            const matrix = new THREE.Matrix4();
            
            // Set position for each instance
            for (let i = 0; i < group.positions.length; i++) {
              const position = group.positions[i];
              matrix.setPosition(position);
              matrix.toArray(matrices, i * 16);
            }
            
            // Add instance matrices to geometry
            const instancedAttribute = new THREE.InstancedBufferAttribute(matrices, 16);
            instancedGeometry.setAttribute('instanceMatrix', instancedAttribute);
            
            // Create instanced mesh
            const instancedMesh = new THREE.InstancedMesh(
              instancedGeometry,
              group.material,
              group.positions.length
            );
            
            // Add to scene and remove original meshes
            scene.add(instancedMesh);
          }
        });
      }
    },
    
    // Optimize renderer settings
    optimizeRenderer: () => {
      if (!renderer) return;
      
      // Set pixel ratio to balance quality and performance
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      // Enable shadow map optimization
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.shadowMap.autoUpdate = false; // Only update shadows when necessary
      
      // Set power preference to high-performance
      renderer.powerPreference = 'high-performance';
      
      // Enable physical correct lighting
      renderer.physicallyCorrectLights = true;
      
      // Optimize render targets
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1;
    }
  };
};

// Component to display performance metrics
export const PerformanceMonitor = ({ isVisible = false }) => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    triangles: 0,
    drawCalls: 0,
    memory: 0
  });
  
  // Update metrics every second
  useEffect(() => {
    if (!isVisible) return;
    
    let frameCount = 0;
    let lastTime = performance.now();
    
    const updateMetrics = () => {
      frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTime;
      
      // Update metrics every second
      if (elapsed >= 1000) {
        const fps = Math.round((frameCount * 1000) / elapsed);
        
        // Get renderer info if available
        let triangles = 0;
        let drawCalls = 0;
        let memory = 0;
        
        if (window.renderer && window.renderer.info) {
          triangles = window.renderer.info.render.triangles;
          drawCalls = window.renderer.info.render.calls;
        }
        
        if (window.performance && window.performance.memory) {
          memory = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
        }
        
        setMetrics({
          fps,
          triangles,
          drawCalls,
          memory
        });
        
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(updateMetrics);
    };
    
    const animationId = requestAnimationFrame(updateMetrics);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isVisible]);
  
  if (!isVisible) return null;
  
  return (
    <View style={styles.performanceMonitor}>
      <Text style={styles.metricText}>FPS: {metrics.fps}</Text>
      <Text style={styles.metricText}>Triangles: {metrics.triangles}</Text>
      <Text style={styles.metricText}>Draw Calls: {metrics.drawCalls}</Text>
      <Text style={styles.metricText}>Memory: {metrics.memory} MB</Text>
    </View>
  );
};

// Performance test results display component
export const PerformanceResults = ({ results, onClose }) => {
  if (!results) return null;
  
  return (
    <View style={styles.resultsContainer}>
      <Text style={styles.resultsTitle}>Performance Test Results</Text>
      
      <ScrollView style={styles.resultsScroll}>
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Frame Rate</Text>
          {results.fps.map((fps, index) => (
            <Text key={`fps-${index}`} style={styles.resultText}>
              Test {index + 1}: {fps.toFixed(1)} FPS
            </Text>
          ))}
        </View>
        
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Render Time</Text>
          {results.renderTime.map((time, index) => (
            <Text key={`time-${index}`} style={styles.resultText}>
              Test {index + 1}: {time.toFixed(2)} ms
            </Text>
          ))}
        </View>
        
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Memory Usage</Text>
          {results.memoryUsage.map((memory, index) => (
            <Text key={`memory-${index}`} style={styles.resultText}>
              {typeof memory === 'string' 
                ? memory 
                : `Used: ${memory.usedJSHeapSize.toFixed(1)} MB / Limit: ${memory.jsHeapSizeLimit.toFixed(1)} MB`}
            </Text>
          ))}
        </View>
        
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Block Count</Text>
          <Text style={styles.resultText}>{results.blockCount} blocks in world</Text>
        </View>
        
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {results.recommendations.length > 0 ? (
            results.recommendations.map((rec, index) => (
              <Text key={`rec-${index}`} style={styles.recommendationText}>
                • {rec}
              </Text>
            ))
          ) : (
            <Text style={styles.resultText}>No issues detected. Performance is good!</Text>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>CLOSE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  performanceMonitor: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  metricText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxWidth: 500,
    maxHeight: '80%',
    width: '90%',
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultsScroll: {
    maxHeight: 400,
  },
  resultSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4a90e2',
  },
  resultText: {
    fontSize: 14,
    marginBottom: 5,
  },
  recommendationText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#e09600',
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
