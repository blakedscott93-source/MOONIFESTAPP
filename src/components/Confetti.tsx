/**
 * Confetti Animation Component
 * 
 * Celebratory particle effect for achievements, jackpots, and milestones
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, Easing } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  scale: Animated.Value;
  opacity: Animated.Value;
  color: string;
  size: number;
  shape: 'square' | 'circle' | 'star';
}

interface ConfettiProps {
  active: boolean;
  duration?: number;
  pieceCount?: number;
  colors?: string[];
  onComplete?: () => void;
}

const DEFAULT_COLORS = [
  '#FFD700', // Gold
  '#FF6B9D', // Pink
  '#C77DFF', // Purple
  '#4ECDC4', // Teal
  '#FF6B35', // Orange
  '#7FFF00', // Lime
  '#00D9A3', // Mint
  '#FF1493', // Deep Pink
];

const SHAPES: ConfettiPiece['shape'][] = ['square', 'circle', 'star'];

export const Confetti: React.FC<ConfettiProps> = ({
  active,
  duration = 3000,
  pieceCount = 50,
  colors = DEFAULT_COLORS,
  onComplete,
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    if (active) {
      startConfetti();
    } else {
      stopConfetti();
    }

    return () => {
      stopConfetti();
    };
  }, [active]);

  const createPiece = (id: number): ConfettiPiece & { startX: number } => {
    const startX = Math.random() * SCREEN_WIDTH;
    const startY = -50;
    
    return {
      id,
      x: new Animated.Value(startX),
      y: new Animated.Value(startY),
      rotation: new Animated.Value(0),
      scale: new Animated.Value(Math.random() * 0.5 + 0.5),
      opacity: new Animated.Value(1),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 12 + 8,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      startX, // Store the initial value for reference
    };
  };

  const startConfetti = () => {
    // Create pieces with startX stored
    const newPiecesWithStartX: Array<ConfettiPiece & { startX: number }> = [];
    for (let i = 0; i < pieceCount; i++) {
      newPiecesWithStartX.push(createPiece(i));
    }
    setPieces(newPiecesWithStartX);

    // Animate each piece
    const animations = newPiecesWithStartX.map((piece) => {
      const horizontalMovement = (Math.random() - 0.5) * 200;
      const fallDuration = duration + Math.random() * 1000;
      const spinSpeed = (Math.random() - 0.5) * 8;

      return Animated.parallel([
        // Fall down with slight horizontal drift
        Animated.timing(piece.y, {
          toValue: SCREEN_HEIGHT + 50,
          duration: fallDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // Horizontal drift
        Animated.timing(piece.x, {
          toValue: piece.startX + horizontalMovement,
          duration: fallDuration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        // Spin
        Animated.timing(piece.rotation, {
          toValue: spinSpeed,
          duration: fallDuration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        // Fade out at the end
        Animated.sequence([
          Animated.delay(fallDuration * 0.7),
          Animated.timing(piece.opacity, {
            toValue: 0,
            duration: fallDuration * 0.3,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    animationsRef.current = animations;

    // Start all animations
    Animated.parallel(animations).start(() => {
      setPieces([]);
      onComplete?.();
    });
  };

  const stopConfetti = () => {
    animationsRef.current.forEach(anim => anim.stop());
    setPieces([]);
  };

  const renderPiece = (piece: ConfettiPiece) => {
    const animatedStyle = {
      position: 'absolute' as const,
      transform: [
        { translateX: piece.x },
        { translateY: piece.y },
        {
          rotate: piece.rotation.interpolate({
            inputRange: [-8, 8],
            outputRange: ['-720deg', '720deg'],
          }),
        },
        { scale: piece.scale },
      ],
      opacity: piece.opacity,
    };

    let shapeStyle;
    switch (piece.shape) {
      case 'circle':
        shapeStyle = {
          width: piece.size,
          height: piece.size,
          borderRadius: piece.size / 2,
          backgroundColor: piece.color,
        };
        break;
      case 'star':
        shapeStyle = {
          width: 0,
          height: 0,
          borderLeftWidth: piece.size / 2,
          borderRightWidth: piece.size / 2,
          borderBottomWidth: piece.size,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: piece.color,
        };
        break;
      case 'square':
      default:
        shapeStyle = {
          width: piece.size,
          height: piece.size * 0.6,
          backgroundColor: piece.color,
          borderRadius: 2,
        };
        break;
    }

    return (
      <Animated.View key={piece.id} style={animatedStyle}>
        <View style={shapeStyle} />
      </Animated.View>
    );
  };

  if (!active && pieces.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map(renderPiece)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
});

// Burst confetti from a specific point (for buttons/achievements)
interface BurstConfettiProps {
  active: boolean;
  origin?: { x: number; y: number };
  pieceCount?: number;
  colors?: string[];
  onComplete?: () => void;
}

export const BurstConfetti: React.FC<BurstConfettiProps> = ({
  active,
  origin = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 },
  pieceCount = 30,
  colors = DEFAULT_COLORS,
  onComplete,
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    if (active) {
      startBurst();
    }

    return () => {
      animationsRef.current.forEach(anim => anim.stop());
    };
  }, [active]);

  const startBurst = () => {
    const newPieces: ConfettiPiece[] = [];
    
    for (let i = 0; i < pieceCount; i++) {
      newPieces.push({
        id: i,
        x: new Animated.Value(origin.x),
        y: new Animated.Value(origin.y),
        rotation: new Animated.Value(0),
        scale: new Animated.Value(1),
        opacity: new Animated.Value(1),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 6,
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      });
    }
    
    setPieces(newPieces);

    const animations = newPieces.map((piece, index) => {
      const angle = (index / pieceCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const distance = 150 + Math.random() * 100;
      const targetX = origin.x + Math.cos(angle) * distance;
      const targetY = origin.y + Math.sin(angle) * distance + 100; // Add gravity effect

      return Animated.parallel([
        Animated.timing(piece.x, {
          toValue: targetX,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(piece.y, {
          toValue: targetY,
          duration: 800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(piece.rotation, {
          toValue: (Math.random() - 0.5) * 4,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(piece.opacity, {
          toValue: 0,
          duration: 800,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(piece.scale, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]);
    });

    animationsRef.current = animations;

    Animated.parallel(animations).start(() => {
      setPieces([]);
      onComplete?.();
    });
  };

  const renderPiece = (piece: ConfettiPiece) => {
    const animatedStyle = {
      position: 'absolute' as const,
      transform: [
        { translateX: Animated.subtract(piece.x, piece.size / 2) },
        { translateY: Animated.subtract(piece.y, piece.size / 2) },
        {
          rotate: piece.rotation.interpolate({
            inputRange: [-4, 4],
            outputRange: ['-360deg', '360deg'],
          }),
        },
        { scale: piece.scale },
      ],
      opacity: piece.opacity,
    };

    return (
      <Animated.View key={piece.id} style={animatedStyle}>
        <View
          style={{
            width: piece.size,
            height: piece.size,
            borderRadius: piece.shape === 'circle' ? piece.size / 2 : 2,
            backgroundColor: piece.color,
          }}
        />
      </Animated.View>
    );
  };

  if (pieces.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map(renderPiece)}
    </View>
  );
};


