import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

// LEGO block dimensions
const BLOCK_SIZE = 1;
const STUD_RADIUS = 0.1;
const STUD_HEIGHT = 0.1;
const BLOCK_HEIGHT = 0.8;

// Create a standard LEGO block with studs - simple approach without merging
export const createLegoBlockGeometry = () => {
  // Creating the block as a simple BoxGeometry
  // We'll use nested mesh components for the studs instead of geometry merging
  const blockGeometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_HEIGHT, BLOCK_SIZE);
  blockGeometry.translate(0, BLOCK_HEIGHT/2, 0); // Move pivot to bottom

  return blockGeometry;
};

// Different LEGO block types with their properties
export const BLOCK_TYPES = [
  {
    id: 'grass',
    name: 'Grass Block',
    color: '#7CFC00',
    solid: true,
    textureMap: {
      top: 'grass_top',
      sides: 'grass_side',
      bottom: 'dirt'
    }
  },
  {
    id: 'dirt',
    name: 'Dirt Block',
    color: '#8B4513',
    solid: true,
    textureMap: {
      all: 'dirt'
    }
  },
  {
    id: 'stone',
    name: 'Stone Block',
    color: '#808080',
    solid: true,
    textureMap: {
      all: 'stone'
    }
  },
  {
    id: 'water',
    name: 'Water Block',
    color: '#1E90FF',
    solid: false,
    transparent: true,
    textureMap: {
      all: 'water'
    }
  },
  {
    id: 'wood',
    name: 'Wood Block',
    color: '#A0522D',
    solid: true,
    textureMap: {
      top: 'wood_top',
      bottom: 'wood_top',
      sides: 'wood_side'
    }
  },
  {
    id: 'leaves',
    name: 'Leaves Block',
    color: '#228B22',
    solid: true,
    transparent: true,
    textureMap: {
      all: 'leaves'
    }
  },
  {
    id: 'sand',
    name: 'Sand Block',
    color: '#F4A460',
    solid: true,
    textureMap: {
      all: 'sand'
    }
  },
  {
    id: 'glass',
    name: 'Glass Block',
    color: '#87CEEB',
    solid: true,
    transparent: true,
    textureMap: {
      all: 'glass'
    }
  },
  {
    id: 'brick_red',
    name: 'Red Brick',
    color: '#B22222',
    solid: true,
    textureMap: {
      all: 'brick_red'
    }
  },
  {
    id: 'brick_blue',
    name: 'Blue Brick',
    color: '#4169E1',
    solid: true,
    textureMap: {
      all: 'brick_blue'
    }
  },
  {
    id: 'brick_yellow',
    name: 'Yellow Brick',
    color: '#FFD700',
    solid: true,
    textureMap: {
      all: 'brick_yellow'
    }
  },
  {
    id: 'brick_green',
    name: 'Green Brick',
    color: '#006400',
    solid: true,
    textureMap: {
      all: 'brick_green'
    }
  },
  {
    id: 'brick_white',
    name: 'White Brick',
    color: '#FFFFFF',
    solid: true,
    textureMap: {
      all: 'brick_white'
    }
  },
  {
    id: 'brick_black',
    name: 'Black Brick',
    color: '#000000',
    solid: true,
    textureMap: {
      all: 'brick_black'
    }
  }
];

// Enhanced LEGO Block component with detailed geometry using nested components
export const LegoBlock = ({ position, type, onClick }) => {
  const meshRef = useRef();
  const blockType = type || BLOCK_TYPES[0];

  // Add subtle animation on hover
  useFrame(() => {
    if (meshRef.current && meshRef.current.userData.hovered) {
      meshRef.current.scale.setScalar(1.05);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1);
    }
  });

  // Handle pointer events
  const handlePointerOver = () => {
    if (meshRef.current) {
      meshRef.current.userData.hovered = true;
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = () => {
    if (meshRef.current) {
      meshRef.current.userData.hovered = false;
      document.body.style.cursor = 'auto';
    }
  };

  // Define stud positions
  const studPositions = [
    [-0.25, 0, -0.25],
    [0.25, 0, -0.25],
    [-0.25, 0, 0.25],
    [0.25, 0, 0.25]
  ];

  return (
    <group position={position}>
      {/* Main block */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
        userData={{ isBlock: true }}
      >
        <boxGeometry args={[BLOCK_SIZE, BLOCK_HEIGHT, BLOCK_SIZE]} />
        <meshStandardMaterial
          color={blockType.color}
          roughness={0.3}
          metalness={0.1}
          transparent={blockType.transparent}
          opacity={blockType.transparent ? 0.8 : 1}
        />
      </mesh>

      {/* Studs */}
      {studPositions.map((studPos, index) => (
        <mesh
          key={index}
          position={[studPos[0], BLOCK_HEIGHT + STUD_HEIGHT/2, studPos[2]]}
          castShadow
        >
          <cylinderGeometry args={[STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 16]} />
          <meshStandardMaterial
            color={blockType.color}
            roughness={0.3}
            metalness={0.1}
            transparent={blockType.transparent}
            opacity={blockType.transparent ? 0.8 : 1}
          />
        </mesh>
      ))}
    </group>
  );
};

// Special block types
export const SpecialBlocks = {
  // 2x1 LEGO brick
  Brick2x1: ({ position, color = '#f5a623', rotation = [0, 0, 0] }) => {
    return (
      <group position={position} rotation={rotation}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 0.8, 1]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />

          {/* Studs */}
          <mesh position={[-0.5, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
          </mesh>
          <mesh position={[0.5, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
          </mesh>
        </mesh>
      </group>
    );
  },

  // 2x2 LEGO brick
  Brick2x2: ({ position, color = '#f5a623', rotation = [0, 0, 0] }) => {
    return (
      <group position={position} rotation={rotation}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2, 0.8, 2]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />

          {/* Studs */}
          <mesh position={[-0.5, 0.4, -0.5]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
          </mesh>
          <mesh position={[0.5, 0.4, -0.5]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
          </mesh>
          <mesh position={[-0.5, 0.4, 0.5]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
          </mesh>
          <mesh position={[0.5, 0.4, 0.5]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
          </mesh>
        </mesh>
      </group>
    );
  },

  // LEGO plate (flat piece)
  Plate: ({ position, color = '#f5a623', size = [2, 2], rotation = [0, 0, 0] }) => {
    return (
      <group position={position} rotation={rotation}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[size[0], 0.3, size[1]]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />

          {/* Generate studs based on size */}
          {Array.from({ length: size[0] }).map((_, x) =>
            Array.from({ length: size[1] }).map((_, z) => (
              <mesh
                key={`${x}-${z}`}
                position={[
                  x - (size[0] - 1) / 2,
                  0.15,
                  z - (size[1] - 1) / 2
                ]}
                castShadow
              >
                <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
              </mesh>
            ))
          )}
        </mesh>
      </group>
    );
  },

  // LEGO slope piece
  Slope: ({ position, color = '#f5a623', rotation = [0, 0, 0] }) => {
    return (
      <group position={position} rotation={rotation}>
        {/* Create a slope using a custom geometry */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 0.8, 1]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />

          {/* Add studs on the flat part */}
          <mesh position={[0, 0.4, -0.5]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
          </mesh>
        </mesh>
      </group>
    );
  }
};
