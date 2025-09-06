import { loginWithEmail, sendPasswordReset } from "@/backend/auth";
import {
  Button,
  CustomModal,
  FormInput,
  ScreenWrapper,
} from "@/components/shared";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const user = await loginWithEmail(
        email.trim().toLowerCase(),
        password.trim()
      );
      if (!user) {
        Alert.alert("Error", "Failed to log in. Please try again.");
        return;
      }
      Alert.alert("Success!", "You have successfully logged in.");
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotPasswordEmail(email);
    setShowModal(true);
  };

  const handleSendPasswordReset = async () => {
    if (!forgotPasswordEmail) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setIsSendingReset(true);

    try {
      await sendPasswordReset(forgotPasswordEmail.trim().toLowerCase());
      Alert.alert(
        "Password Reset",
        "If an account with this email exists, you will receive a password reset link shortly.",
        [
          {
            text: "OK",
            onPress: () => {
              setShowModal(false);
              setForgotPasswordEmail("");
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to send password reset email."
      );
    } finally {
      setIsSendingReset(false);
    }
  };

  const closeForgotModal = () => {
    setShowModal(false);
    setForgotPasswordEmail("");
  };

  return (
    <ScreenWrapper scrollable={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.description}>
              Sign in to continue managing your health
            </Text>
          </View>

          <View style={styles.form}>
            <FormInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              keyboardType="email-address"
              leftIcon="email"
            />

            <FormInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={!showPassword}
              leftIcon="lock"
              rightIcon={showPassword ? "visibility" : "visibility-off"}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            title="LOG IN"
            onPress={handleLogin}
            variant="primary"
            loading={isLoading}
            style={styles.loginButton}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don&#39;t have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <CustomModal
        visible={showModal}
        onClose={closeForgotModal}
        title="Reset Password"
        actions={[
          {
            title: "Cancel",
            onPress: closeForgotModal,
            variant: "secondary",
          },
          {
            title: "Send Reset Link",
            onPress: handleSendPasswordReset,
            variant: "primary",
            loading: isSendingReset,
          },
        ]}
      >
        <Text style={styles.modalText}>
          Enter your email address and a link to reset your password will be
          sent to you.
        </Text>

        <FormInput
          value={forgotPasswordEmail}
          onChangeText={setForgotPasswordEmail}
          placeholder="Email address"
          keyboardType="email-address"
          leftIcon="email"
        />
      </CustomModal>
    </ScreenWrapper>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "flex-start",
    paddingTop: 40,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.gray500,
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBackground,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  eyeIcon: {
    padding: 6,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 30,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: Colors.gray400,
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    color: Colors.gray500,
    fontSize: 16,
  },
  registerLink: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  modalText: {
    fontSize: 16,
    color: Colors.gray600,
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
});
