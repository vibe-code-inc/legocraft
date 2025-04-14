import * as THREE from 'three';
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

// Block class to represent a single LEGO block
export class Block {
  constructor(position, type, size = 1) {
    this.position = position;
    this.type = type;
    this.size = size;
  }
}

// World class to manage the game world and blocks
export class World {
  constructor(size) {
    this.size = size;
    this.blocks = new Map(); // Map of block positions to block objects
  }

  // Add a block to the world
  addBlock(x, y, z, type) {
    const key = `${x},${y},${z}`;
    const block = new Block([x, y, z], type);
    this.blocks.set(key, block);
    return block;
  }

  // Remove a block from the world
  removeBlock(x, y, z) {
    const key = `${x},${y},${z}`;
    if (this.blocks.has(key)) {
      this.blocks.delete(key);
      return true;
    }
    return false;
  }

  // Get a block at a specific position
  getBlock(x, y, z) {
    const key = `${x},${y},${z}`;
    return this.blocks.get(key);
  }

  // Check if a position has a block
  hasBlock(x, y, z) {
    const key = `${x},${y},${z}`;
    return this.blocks.has(key);
  }

  // Get all blocks in the world
  getAllBlocks() {
    return Array.from(this.blocks.values());
  }
}

// Custom hook for camera controls
export const usePlayerControls = () => {
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Update movement state based on key presses
      switch (e.code) {
        case 'KeyW':
          setMovement((m) => ({ ...m, forward: true }));
          break;
        case 'KeyS':
          setMovement((m) => ({ ...m, backward: true }));
          break;
        case 'KeyA':
          setMovement((m) => ({ ...m, left: true }));
          break;
        case 'KeyD':
          setMovement((m) => ({ ...m, right: true }));
          break;
        case 'Space':
          setMovement((m) => ({ ...m, jump: true }));
          break;
      }
    };

    const handleKeyUp = (e) => {
      // Update movement state when keys are released
      switch (e.code) {
        case 'KeyW':
          setMovement((m) => ({ ...m, forward: false }));
          break;
        case 'KeyS':
          setMovement((m) => ({ ...m, backward: false }));
          break;
        case 'KeyA':
          setMovement((m) => ({ ...m, left: false }));
          break;
        case 'KeyD':
          setMovement((m) => ({ ...m, right: false }));
          break;
        case 'Space':
          setMovement((m) => ({ ...m, jump: false }));
          break;
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Clean up event listeners
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return movement;
};

// Custom hook for player physics
export const usePlayerPhysics = (initialPosition = [0, 2, 0], speed = 5) => {
  const position = useRef(new THREE.Vector3(...initialPosition));
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  const controls = usePlayerControls();

  useFrame((state, delta) => {
    // Reset direction
    direction.current.set(0, 0, 0);

    // Update direction based on controls
    if (controls.forward) direction.current.z -= 1;
    if (controls.backward) direction.current.z += 1;
    if (controls.left) direction.current.x -= 1;
    if (controls.right) direction.current.x += 1;

    // Normalize direction vector
    if (direction.current.length() > 0) {
      direction.current.normalize();
    }

    // Apply movement
    const moveSpeed = speed * delta;
    position.current.x += direction.current.x * moveSpeed;
    position.current.z += direction.current.z * moveSpeed;

    // Apply gravity and jumping
    if (controls.jump && position.current.y <= 2) {
      velocity.current.y = 5;
    }

    // Apply gravity
    velocity.current.y -= 9.8 * delta;
    position.current.y += velocity.current.y * delta;

    // Simple ground collision
    if (position.current.y < 2) {
      position.current.y = 2;
      velocity.current.y = 0;
    }

    // Update camera position
    state.camera.position.copy(position.current);
  });

  return position;
};

// Block component to render a single LEGO block
export const LegoBlock = ({ position, type, onClick }) => {
  const blockConfig = type ? type : { id: 'default', color: '#f5a623', solid: true };
  
  return (
    <mesh position={position} onClick={onClick}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={blockConfig.color} />
      {/* Add LEGO studs on top */}
      <group position={[0, 0.5, 0]}>
        <mesh position={[-0.25, 0.1, -0.25]}>
          <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
          <meshStandardMaterial color={blockConfig.color} />
        </mesh>
        <mesh position={[0.25, 0.1, -0.25]}>
          <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
          <meshStandardMaterial color={blockConfig.color} />
        </mesh>
        <mesh position={[-0.25, 0.1, 0.25]}>
          <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
          <meshStandardMaterial color={blockConfig.color} />
        </mesh>
        <mesh position={[0.25, 0.1, 0.25]}>
          <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
          <meshStandardMaterial color={blockConfig.color} />
        </mesh>
      </group>
    </mesh>
  );
};
