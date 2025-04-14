import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { LegoBlock, BLOCK_TYPES } from './blocks';
import { BlockRenderer } from './blockRenderer';
import { useBlockInteraction, usePlayerPhysicsWithCollision } from './gameMechanics';
import gameConfig from './config';

// Component to handle lighting
const Lighting = ({ timeOfDay = 0.5 }) => {
  // Calculate sun position based on time of day (0-1)
  const sunPosition = [
    Math.cos(timeOfDay * Math.PI * 2) * 100,
    Math.sin(timeOfDay * Math.PI * 2) * 100,
    0
  ];
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={sunPosition} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />
      <Sky 
        distance={450000} 
        sunPosition={sunPosition} 
        inclination={0.5} 
        azimuth={0.25} 
      />
    </>
  );
};

// Component to render the world grid
const WorldGrid = ({ size }) => {
  return (
    <gridHelper 
      args={[size, size]} 
      position={[0, 0, 0]} 
      rotation={[0, 0, 0]}
    />
  );
};

// Component to handle player and camera
const Player = ({ world, position = [16, 20, 16], onPositionUpdate, movementState }) => {
  const playerPosition = usePlayerPhysicsWithCollision(world, position, gameConfig.player.speed, movementState);
  
  // Update position for UI
  useFrame(() => {
    if (onPositionUpdate && playerPosition.current) {
      onPositionUpdate(playerPosition.current);
    }
  });
  
  return null;
};

// Component to render the selection box around the targeted block
const SelectionBox = ({ selectedBlock, selectedFace }) => {
  if (!selectedBlock || !selectedFace) return null;
  
  const position = selectedBlock.position.clone();
  
  return (
    <mesh position={position}>
      <boxGeometry args={[1.01, 1.01, 1.01]} />
      <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.5} />
    </mesh>
  );
};

// Component to render a preview of the block to be placed
const BlockPreview = ({ selectedBlock, selectedFace, selectedBlockType }) => {
  if (!selectedBlock || !selectedFace) return null;
  
  // Get the position of the selected block
  const position = selectedBlock.position.clone();
  
  // Get the normal of the selected face
  const normal = selectedFace.normal.clone();
  
  // Calculate the position of the new block
  const previewPosition = [
    Math.round(position.x + normal.x),
    Math.round(position.y + normal.y),
    Math.round(position.z + normal.z)
  ];
  
  // Find the block type by ID
  const blockType = BLOCK_TYPES.find(type => type.id === selectedBlockType) || BLOCK_TYPES[0];
  
  return (
    <mesh position={previewPosition} scale={[0.5, 0.5, 0.5]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={blockType.color} 
        transparent 
        opacity={0.5} 
      />
    </mesh>
  );
};

// Main 3D scene component
export const Scene3D = ({ world, selectedBlockType = 'brick_red', onPositionUpdate, onSceneReady, movementState }) => {
  const [timeOfDay, setTimeOfDay] = useState(0.5);
  const [blocks, setBlocks] = useState([]);
  const { scene, camera, gl } = useThree();
  
  // Set up block interaction
  const { selectedBlock, selectedFace, placeBlock, removeBlock } = useBlockInteraction(world);
  
  // Update blocks from world
  useEffect(() => {
    if (world) {
      const worldBlocks = world.getAllBlocks().map(block => ({
        position: block.position,
        type: block.type
      }));
      
      setBlocks(worldBlocks);
    }
  }, [world]);
  
  // Update time of day for day/night cycle
  useEffect(() => {
    if (gameConfig.game.dayNightCycle) {
      const interval = setInterval(() => {
        setTimeOfDay((time) => (time + 0.001) % 1);
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, []);
  
  // Notify parent when scene is ready with renderer, scene, and camera
  useEffect(() => {
    if (onSceneReady && gl && scene && camera) {
      // Expose renderer info for performance monitoring
      window.renderer = gl;
      
      onSceneReady(gl, scene, camera);
    }
  }, [gl, scene, camera, onSceneReady]);
  
  // Handle mouse clicks for block placement and removal
  useEffect(() => {
    const handleMouseClick = (event) => {
      if (!world) return;
      
      // Left click to place block
      if (event.button === 0 && !event.shiftKey) {
        if (placeBlock(selectedBlockType)) {
          // Update blocks from world
          const worldBlocks = world.getAllBlocks().map(block => ({
            position: block.position,
            type: block.type
          }));
          
          setBlocks(worldBlocks);
        }
      }
      // Shift+Left click or right click to remove block
      else if ((event.button === 0 && event.shiftKey) || event.button === 2) {
        if (removeBlock()) {
          // Update blocks from world
          const worldBlocks = world.getAllBlocks().map(block => ({
            position: block.position,
            type: block.type
          }));
          
          setBlocks(worldBlocks);
        }
      }
    };
    
    // Prevent context menu on right click
    const handleContextMenu = (event) => {
      event.preventDefault();
    };
    
    window.addEventListener('mousedown', handleMouseClick);
    window.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      window.removeEventListener('mousedown', handleMouseClick);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [world, selectedBlockType, placeBlock, removeBlock]);
  
  // Optimize rendering by using object instancing for similar blocks
  const optimizeBlockRendering = () => {
    // Group blocks by type for instanced rendering
    const blocksByType = {};
    
    blocks.forEach(block => {
      const typeId = block.type.id;
      if (!blocksByType[typeId]) {
        blocksByType[typeId] = [];
      }
      blocksByType[typeId].push(block);
    });
    
    return Object.entries(blocksByType).map(([typeId, typeBlocks]) => {
      const blockType = BLOCK_TYPES.find(type => type.id === typeId) || BLOCK_TYPES[0];
      
      // If there are many blocks of the same type, use instanced rendering
      if (typeBlocks.length > 50) {
        return (
          <instancedMesh
            key={typeId}
            args={[null, null, typeBlocks.length]}
            userData={{ isBlock: true }}
          >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial 
              color={blockType.color}
              roughness={0.3}
              metalness={0.1}
              transparent={blockType.transparent}
              opacity={blockType.transparent ? 0.8 : 1}
            />
            {typeBlocks.map((block, i) => {
              const matrix = new THREE.Matrix4();
              matrix.setPosition(
                block.position[0],
                block.position[1],
                block.position[2]
              );
              return <primitive key={i} object={matrix} attach={`instanceMatrix[${i}]`} />;
            })}
          </instancedMesh>
        );
      }
      
      // For fewer blocks, render individually
      return typeBlocks.map((block, index) => (
        <LegoBlock 
          key={`${typeId}-${index}`}
          position={block.position}
          type={blockType}
          userData={{ isBlock: true }}
        />
      ));
    });
  };
  
  if (!world) return null;
  
  return (
    <>
      <Lighting timeOfDay={timeOfDay} />
      <Player 
        world={world}
        position={[16, 5, 16]}
        onPositionUpdate={onPositionUpdate} 
        movementState={movementState}
      />
      <WorldGrid size={gameConfig.world.size.width} />
      
      {/* Render optimized blocks */}
      {optimizeBlockRendering()}
      
      {/* Render selection box and block preview */}
      <SelectionBox selectedBlock={selectedBlock} selectedFace={selectedFace} />
      <BlockPreview 
        selectedBlock={selectedBlock} 
        selectedFace={selectedFace} 
        selectedBlockType={selectedBlockType} 
      />
    </>
  );
};
