import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { World, Block } from './engine';
import gameConfig from './config';
import { BLOCK_TYPES } from './blocks';

// Ray casting for block selection and placement
export const useBlockInteraction = (world) => {
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedFace, setSelectedFace] = useState(null);
  const { camera, scene, raycaster, mouse } = useThree();
  
  // Update raycaster on mouse move
  const onMouseMove = (event) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);
    
    // Find intersections with blocks
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      // Get the first intersected object that is a block
      const intersect = intersects.find(obj => 
        obj.object.userData && obj.object.userData.isBlock
      );
      
      if (intersect) {
        setSelectedBlock(intersect.object);
        setSelectedFace(intersect.face);
      } else {
        setSelectedBlock(null);
        setSelectedFace(null);
      }
    } else {
      setSelectedBlock(null);
      setSelectedFace(null);
    }
  };
  
  // Add event listener for mouse move
  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);
  
  // Function to place a block
  const placeBlock = (blockTypeId) => {
    if (selectedBlock && selectedFace) {
      // Get the position of the selected block
      const position = selectedBlock.position.clone();
      
      // Get the normal of the selected face
      const normal = selectedFace.normal.clone();
      
      // Calculate the position of the new block
      const newPosition = [
        Math.round(position.x + normal.x),
        Math.round(position.y + normal.y),
        Math.round(position.z + normal.z)
      ];
      
      // Check if position is already occupied
      if (!world.hasBlock(...newPosition)) {
        // Find the block type by ID
        const blockType = BLOCK_TYPES.find(type => type.id === blockTypeId) || BLOCK_TYPES[0];
        
        // Add the block to the world
        world.addBlock(...newPosition, blockType);
        
        return true;
      }
    }
    
    return false;
  };
  
  // Function to remove a block
  const removeBlock = () => {
    if (selectedBlock) {
      // Get the position of the selected block
      const position = selectedBlock.position;
      
      // Remove the block from the world
      world.removeBlock(
        Math.round(position.x),
        Math.round(position.y),
        Math.round(position.z)
      );
      
      return true;
    }
    
    return false;
  };
  
  return {
    selectedBlock,
    selectedFace,
    placeBlock,
    removeBlock
  };
};

// Collision detection for player movement
export const useCollisionDetection = (world, playerPosition, playerSize = { width: 0.6, height: 1.8, depth: 0.6 }) => {
  // Check if a position is valid (no collision)
  const isValidPosition = (position) => {
    // Create a bounding box for the player
    const playerBox = new THREE.Box3().setFromCenterAndSize(
      new THREE.Vector3(position.x, position.y, position.z),
      new THREE.Vector3(playerSize.width, playerSize.height, playerSize.depth)
    );
    
    // Get blocks that might intersect with the player
    const minX = Math.floor(position.x - playerSize.width / 2 - 1);
    const maxX = Math.ceil(position.x + playerSize.width / 2 + 1);
    const minY = Math.floor(position.y - playerSize.height / 2 - 1);
    const maxY = Math.ceil(position.y + playerSize.height / 2 + 1);
    const minZ = Math.floor(position.z - playerSize.depth / 2 - 1);
    const maxZ = Math.ceil(position.z + playerSize.depth / 2 + 1);
    
    // Check each potential block for collision
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const block = world.getBlock(x, y, z);
          
          if (block && block.type.solid) {
            // Create a bounding box for the block
            const blockBox = new THREE.Box3().setFromCenterAndSize(
              new THREE.Vector3(x, y, z),
              new THREE.Vector3(1, 1, 1)
            );
            
            // Check for intersection
            if (playerBox.intersectsBox(blockBox)) {
              return false;
            }
          }
        }
      }
    }
    
    return true;
  };
  
  // Check if the player is on the ground
  const isOnGround = () => {
    const position = playerPosition.current.clone();
    position.y -= (playerSize.height / 2) + 0.1; // Check slightly below the player
    
    // Check if there's a block below the player
    for (let x = -0.3; x <= 0.3; x += 0.3) {
      for (let z = -0.3; z <= 0.3; z += 0.3) {
        const checkPos = position.clone().add(new THREE.Vector3(x, 0, z));
        const blockX = Math.floor(checkPos.x);
        const blockY = Math.floor(checkPos.y);
        const blockZ = Math.floor(checkPos.z);
        
        const block = world.getBlock(blockX, blockY, blockZ);
        if (block && block.type.solid) {
          return true;
        }
      }
    }
    
    return false;
  };
  
  return {
    isValidPosition,
    isOnGround
  };
};

// Enhanced player physics with collision detection
export const usePlayerPhysicsWithCollision = (world, initialPosition = [0, 5, 0], speed = 5) => {
  const position = useRef(new THREE.Vector3(...initialPosition));
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const { camera } = useThree();
  
  // Set up collision detection
  const { isValidPosition, isOnGround } = useCollisionDetection(world, position);
  
  // Keyboard controls state
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false
  });
  
  // Set up keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.code) {
        case 'KeyW':
          setKeys(prev => ({ ...prev, forward: true }));
          break;
        case 'KeyS':
          setKeys(prev => ({ ...prev, backward: true }));
          break;
        case 'KeyA':
          setKeys(prev => ({ ...prev, left: true }));
          break;
        case 'KeyD':
          setKeys(prev => ({ ...prev, right: true }));
          break;
        case 'Space':
          setKeys(prev => ({ ...prev, jump: true }));
          break;
      }
    };
    
    const handleKeyUp = (e) => {
      switch (e.code) {
        case 'KeyW':
          setKeys(prev => ({ ...prev, forward: false }));
          break;
        case 'KeyS':
          setKeys(prev => ({ ...prev, backward: false }));
          break;
        case 'KeyA':
          setKeys(prev => ({ ...prev, left: false }));
          break;
        case 'KeyD':
          setKeys(prev => ({ ...prev, right: false }));
          break;
        case 'Space':
          setKeys(prev => ({ ...prev, jump: false }));
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Update player position and handle physics
  useFrame((state, delta) => {
    // Reset direction
    direction.current.set(0, 0, 0);
    
    // Get camera direction for movement relative to view
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    cameraDirection.y = 0;
    cameraDirection.normalize();
    
    // Calculate right vector
    const right = new THREE.Vector3();
    right.crossVectors(camera.up, cameraDirection).normalize();
    
    // Update direction based on controls
    if (keys.forward) direction.current.add(cameraDirection);
    if (keys.backward) direction.current.sub(cameraDirection);
    if (keys.left) direction.current.sub(right);
    if (keys.right) direction.current.add(right);
    
    // Normalize direction vector
    if (direction.current.length() > 0) {
      direction.current.normalize();
    }
    
    // Calculate new position
    const newPosition = position.current.clone();
    
    // Apply movement with collision detection
    const moveSpeed = speed * delta;
    newPosition.x += direction.current.x * moveSpeed;
    newPosition.z += direction.current.z * moveSpeed;
    
    // Check if new position is valid
    if (isValidPosition(newPosition)) {
      position.current.copy(newPosition);
    } else {
      // Try moving only in X direction
      newPosition.copy(position.current);
      newPosition.x += direction.current.x * moveSpeed;
      if (isValidPosition(newPosition)) {
        position.current.copy(newPosition);
      }
      
      // Try moving only in Z direction
      newPosition.copy(position.current);
      newPosition.z += direction.current.z * moveSpeed;
      if (isValidPosition(newPosition)) {
        position.current.copy(newPosition);
      }
    }
    
    // Apply gravity and jumping
    const onGround = isOnGround();
    
    if (keys.jump && onGround) {
      velocity.current.y = gameConfig.player.jumpForce;
    }
    
    // Apply gravity
    velocity.current.y -= gameConfig.world.gravity * delta;
    
    // Apply vertical movement
    newPosition.copy(position.current);
    newPosition.y += velocity.current.y * delta;
    
    // Check if new vertical position is valid
    if (isValidPosition(newPosition)) {
      position.current.copy(newPosition);
    } else {
      // If we hit something, stop vertical velocity
      velocity.current.y = 0;
      
      // If we hit the ceiling, move down slightly
      if (velocity.current.y > 0) {
        position.current.y = Math.floor(position.current.y + 1) - 0.1;
      }
      // If we hit the ground, move up slightly
      else if (velocity.current.y < 0) {
        position.current.y = Math.floor(position.current.y) + 0.1;
      }
    }
    
    // Update camera position
    camera.position.copy(position.current);
  });
  
  return position;
};

// World generation
export const generateWorld = (size = { width: 32, height: 32, depth: 32 }) => {
  const world = new World(size);
  
  // Generate terrain heightmap using simplex noise
  const createHeightmap = () => {
    const heightmap = [];
    
    for (let x = 0; x < size.width; x++) {
      heightmap[x] = [];
      for (let z = 0; z < size.depth; z++) {
        // Simple height calculation (replace with noise function for better terrain)
        const distanceFromCenter = Math.sqrt(
          Math.pow((x - size.width / 2) / (size.width / 2), 2) +
          Math.pow((z - size.depth / 2) / (size.depth / 2), 2)
        );
        
        // Create a bowl-shaped terrain
        const height = Math.floor(
          (1 - Math.min(1, distanceFromCenter)) * 8 + 
          Math.random() * 2
        );
        
        heightmap[x][z] = height;
      }
    }
    
    return heightmap;
  };
  
  // Generate the terrain
  const heightmap = createHeightmap();
  
  // Create the terrain
  for (let x = 0; x < size.width; x++) {
    for (let z = 0; z < size.depth; z++) {
      const height = heightmap[x][z];
      
      // Add blocks from bottom to top
      for (let y = 0; y < height; y++) {
        let blockType;
        
        if (y === height - 1) {
          // Top layer is grass
          blockType = BLOCK_TYPES.find(type => type.id === 'grass');
        } else if (y > height - 4) {
          // Next 3 layers are dirt
          blockType = BLOCK_TYPES.find(type => type.id === 'dirt');
        } else {
          // Everything else is stone
          blockType = BLOCK_TYPES.find(type => type.id === 'stone');
        }
        
        world.addBlock(x, y, z, blockType);
      }
    }
  }
  
  // Add some random trees
  const addTrees = () => {
    const numTrees = Math.floor(size.width * size.depth * 0.01); // 1% of surface area
    
    for (let i = 0; i < numTrees; i++) {
      const x = Math.floor(Math.random() * size.width);
      const z = Math.floor(Math.random() * size.depth);
      const y = heightmap[x][z];
      
      // Check if there's space for a tree
      if (y > 0 && y < size.height - 6) {
        // Add trunk
        const woodType = BLOCK_TYPES.find(type => type.id === 'wood');
        for (let treeY = y; treeY < y + 4; treeY++) {
          world.addBlock(x, treeY, z, woodType);
        }
        
        // Add leaves
        const leavesType = BLOCK_TYPES.find(type => type.id === 'leaves');
        for (let leafX = x - 2; leafX <= x + 2; leafX++) {
          for (let leafZ = z - 2; leafZ <= z + 2; leafZ++) {
            for (let leafY = y + 3; leafY <= y + 5; leafY++) {
              // Skip trunk position and corners
              if ((leafX === x && leafZ === z && leafY < y + 5) ||
                  (Math.abs(leafX - x) === 2 && Math.abs(leafZ - z) === 2)) {
                continue;
              }
              
              // Add leaf block if position is empty
              if (!world.hasBlock(leafX, leafY, leafZ)) {
                world.addBlock(leafX, leafY, leafZ, leavesType);
              }
            }
          }
        }
        
        // Add top leaf
        world.addBlock(x, y + 5, z, leavesType);
      }
    }
  };
  
  // Add trees to the world
  addTrees();
  
  return world;
};
