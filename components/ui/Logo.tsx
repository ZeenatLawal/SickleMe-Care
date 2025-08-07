import React from "react";
import { Image, StyleSheet, View } from "react-native";

interface LogoProps {
  size?: number;
  variant?: "full" | "small";
}

const Logo: React.FC<LogoProps> = ({ size = 120, variant = "full" }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={require("../../assets/images/smc-plus.png")}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
};

export default Logo;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
});
