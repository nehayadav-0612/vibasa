'use client';

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    setError('');

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  }

  return (
    <ScrollView style={darkMode ? { ...styles.container, backgroundColor: '#1A1A1A' } : styles.container}>
      <View style={darkMode ? { ...styles.header, backgroundColor: '#0D4A38' } : styles.header}>
        <Text style={styles.title}>Smart Waste Management</Text>
        <Text style={styles.subtitle}>Collection Tracking System</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={darkMode ? { ...styles.label, color: '#E0E0E0' } : styles.label}>Email</Text>
          <TextInput
            style={darkMode ? { ...styles.input, backgroundColor: '#2A2A2A', color: '#E0E0E0', borderColor: '#404040' } : styles.input}
            placeholder="your@email.com"
            placeholderTextColor={darkMode ? '#666' : '#999'}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={darkMode ? { ...styles.label, color: '#E0E0E0' } : styles.label}>Password</Text>
          <TextInput
            style={darkMode ? { ...styles.input, backgroundColor: '#2A2A2A', color: '#E0E0E0', borderColor: '#404040' } : styles.input}
            placeholder="••••••••"
            placeholderTextColor={darkMode ? '#666' : '#999'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.showPasswordContainer}
            onPress={() => setShowPassword(!showPassword)}
          >
            <View style={[styles.checkbox, darkMode && styles.checkboxDarkMode, showPassword && styles.checkboxChecked]}>
              {showPassword && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[styles.checkboxLabel, darkMode && { color: '#B0B0B0' }]}>Show password</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={[styles.errorBox, darkMode && { backgroundColor: '#5A1E1E', borderLeftColor: '#E74C3C' }]}>
            <Text style={[styles.errorText, darkMode && { color: '#FF6B6B' }]}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, darkMode && { color: '#B0B0B0' }]}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.footerLink, darkMode && { color: '#4CAF50' }]}>Register here</Text>
        </TouchableOpacity>
      </View>

      <View style={darkMode ? { ...styles.infoBox, backgroundColor: '#2A2A2A' } : styles.infoBox}>
        <Text style={[styles.infoTitle, darkMode && { color: '#E0E0E0' }]}>Demo Credentials:</Text>
        <Text style={[styles.infoText, darkMode && { color: '#B0B0B0' }]}>Resident: resident@test.com / password</Text>
        <Text style={[styles.infoText, darkMode && { color: '#B0B0B0' }]}>Collector: collector@test.com / password</Text>
      </View>
{/* To Enable Dark Mode Toggle
      <View style={styles.darkModeButtonContainer}>
        <TouchableOpacity
          style={[styles.darkModeButton, darkMode && styles.darkModeButtonActive]}
          onPress={() => setDarkMode(!darkMode)}
        >
          <Text style={[styles.darkModeButtonText, darkMode && { color: '#E0E0E0' }]}>{darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}</Text>
        </TouchableOpacity>
      </View>
*/}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#1E7F5C',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#E0E0E0',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1A1A',
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#1E7F5C',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    fontSize: 14,
    color: '#1E7F5C',
    fontWeight: '600',
  },
  infoBox: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1E7F5C',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginVertical: 4,
  },
  showPasswordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#1E7F5C',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#1E7F5C',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  darkModeButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  darkModeButton: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  darkModeButtonActive: {
    backgroundColor: '#333333',
    borderColor: '#555555',
  },
  darkModeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
});
