import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const theme = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      router.replace('/(app)/home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <MaterialCommunityIcons name="shield-check" size={60} color="white" />
              </View>
            </View>
            
            <Text variant="displaySmall" style={styles.title}>
              SecureYou
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Your Safety, Our Priority
            </Text>

            <View style={styles.formContainer}>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                autoCapitalize="none"
                keyboardType="email-address"
                left={<TextInput.Icon icon="email" />}
                style={styles.input}
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                left={<TextInput.Icon icon="lock" />}
                right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
                style={styles.input}
              />

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.button}
                buttonColor="#dc2626"
                contentStyle={styles.buttonContent}
              >
                Continue
              </Button>

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/register">
                <Text style={styles.signupLink}>
                  Sign up
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: {
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
    color: '#6b7280',
  },
  formContainer: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotPasswordText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#9ca3af',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
  },
  signupLink: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: 'bold',
  },
});