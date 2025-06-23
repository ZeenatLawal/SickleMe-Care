import React from "react";
import { StyleSheet, Text, View } from "react-native";

const Logo = () => {
  return (
    <>
      <View style={styles.logo}>
        <Text style={styles.logoText}>SICKLEME CARE+</Text>
      </View>
    </>
  );
};

export default Logo;

const styles = StyleSheet.create({
  logo: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#0D9488",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#0D9488",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1,
  },
});
