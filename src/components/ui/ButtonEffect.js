import React, { useRef } from "react";
import { Animated, Pressable } from "react-native";

/**
 * Botão com efeito de escala ao pressionar.
 * Props: igual ao TouchableOpacity/Pressable.
 */
export default function ButtonEffect({ style, children, onPress, ...rest }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        { transform: [{ scale: typeof scale === 'number' ? scale : scale.__getValue() }] },
        typeof style === "function" ? style({ pressed }) : style,
      ]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}
