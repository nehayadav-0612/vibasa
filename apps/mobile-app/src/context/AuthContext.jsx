
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  async function bootstrapAsync() {
    try {
      const savedToken = await SecureStore.getItemAsync('auth_token');
      if (savedToken) {
        setToken(savedToken);
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
          timeout: 10000,
        });
        setUser(response.data.user);
      }
    } catch (error) {
      let errorMessage = 'Auth bootstrap error';
      if (error.response) {
        errorMessage = `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'Network error during bootstrap - will try again on next launch';
      }
      console.error(errorMessage, error.message);
      // Don't fail the app - just proceed without user data
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password }, {
        timeout: 10000,
      });
      const { token, user } = response.data;
      await SecureStore.setItemAsync('auth_token', token);
      setToken(token);
      setUser(user);
      return { success: true };
    } catch (error) {
      let errorMessage = 'Login failed';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.error || error.response.statusText || 'Server error';
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'Network error: Cannot reach server. Ensure server is running and check your connection.';
      } else {
        // Error in request setup
        errorMessage = error.message;
      }
      
      console.error('Login error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async function registerResident(email, password, prop_uid) {
    try {
      const response = await axios.post(`${API_URL}/auth/register/resident`, {
        email,
        password,
        prop_uid,
      }, {
        timeout: 10000,
      });
      const { token, user } = response.data;
      await SecureStore.setItemAsync('auth_token', token);
      setToken(token);
      setUser(user);
      return { success: true };
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      if (error.response) {
        errorMessage = error.response.data?.error || error.response.statusText || 'Server error';
      } else if (error.request) {
        errorMessage = `Network error: Cannot reach server. Check your internet connection`;
      } else {
        errorMessage = error.message;
      }
      
      console.error('Registration error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async function logout() {
    await SecureStore.deleteItemAsync('auth_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, registerResident, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
