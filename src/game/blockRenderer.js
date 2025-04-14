import React, { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { LegoBlock, BLOCK_TYPES, SpecialBlocks } from './blocks';
import { loadAllTextures } from './textures';

// Enhanced Block Renderer component that uses the detailed block models and textures
export const BlockRenderer = ({ blocks, onBlockClick }) => {
  const [textures, setTextures] = useState(null);
  const { scene } = useThree();
  
  // Load textures on component mount
  useEffect(() => {
    const loadedTextures = loadAllTextures();
    setTextures(loadedTextures);
    
    // Clean up textures when component unmounts
    return () => {
      if (textures) {
        Object.values(textures).forEach(textureSet => {
          if (textureSet.map) textureSet.map.dispose();
          if (textureSet.normalMap) textureSet.normalMap.dispose();
          if (textureSet.bumpMap) textureSet.bumpMap.dispose();
        });
      }
    };
  }, []);
  
  // If textures aren't loaded yet, don't render blocks
  if (!textures) return null;
  
  return (
    <group>
      {blocks.map((block, index) => (
        <LegoBlock
          key={index}
          position={block.position}
          type={block.type}
          onClick={(e) => onBlockClick(e, block, index)}
        />
      ))}
      
      {/* Example of using special blocks */}
      <SpecialBlocks.Brick2x2 
        position={[5, 1, 5]} 
        color="#f5a623" 
      />
      
      <SpecialBlocks.Plate 
        position={[8, 0.15, 8]} 
        color="#4169E1" 
        size={[4, 4]} 
      />
    </group>
  );
};

// Function to create a textured material for a block
export const createBlockMaterial = (blockType, textures) => {
  if (!textures) return null;
  
  const materialProps = {
    roughness: 0.3,
    metalness: 0.1,
    transparent: blockType.transparent,
    opacity: blockType.transparent ? 0.8 : 1
  };
  
  // Apply textures based on the block's textureMap
  if (blockType.textureMap) {
    if (blockType.textureMap.all && textures[blockType.textureMap.all]) {
      return { ...materialProps, ...textures[blockType.textureMap.all] };
    } else {
      // Create materials for each face if different textures are specified
      const materials = [];
      
      // Order: right, left, top, bottom, front, back
      const sides = [
        blockType.textureMap.right || blockType.textureMap.sides || null,
        blockType.textureMap.left || blockType.textureMap.sides || null,
        blockType.textureMap.top || null,
        blockType.textureMap.bottom || null,
        blockType.textureMap.front || blockType.textureMap.sides || null,
        blockType.textureMap.back || blockType.textureMap.sides || null
      ];
      
      sides.forEach(textureName => {
        if (textureName && textures[textureName]) {
          materials.push({ ...materialProps, ...textures[textureName] });
        } else {
          // Fallback to color if texture not found
          materials.push({ 
            ...materialProps, 
            color: blockType.color 
          });
        }
      });
      
      return materials;
    }
  }
  
  // Fallback to color if no textures specified
  return { 
    ...materialProps, 
    color: blockType.color 
  };
};

// Function to create a block palette for the UI
export const createBlockPalette = () => {
  return BLOCK_TYPES.map(blockType => ({
    id: blockType.id,
    name: blockType.name,
    color: blockType.color,
    icon: `block_${blockType.id}.png` // Reference to icon image
  }));
};
