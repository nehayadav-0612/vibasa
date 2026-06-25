import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider as AuthProviderContext, useAuthContext } from './src/context/AuthContext';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ResidentHomeScreen from './src/screens/resident/HomeScreen';
import ResidentHistoryScreen from './src/screens/resident/HistoryScreen';
import ResidentChargesScreen from './src/screens/resident/ChargesScreen';
import ResidentIssueScreen from './src/screens/resident/IssueScreen';
import CollectorHomeScreen from './src/screens/collector/HomeScreen';
import CollectorWardScreen from './src/screens/collector/WardScreen';
import SyncIndicator from './src/components/SyncIndicator';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function ResidentStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1E7F5C',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="ResidentHome" component={ResidentHomeScreen} options={{ title: 'Waste Collection' }} />
      <Stack.Screen name="History" component={ResidentHistoryScreen} options={{ title: 'Collection History' }} />
      <Stack.Screen name="Charges" component={ResidentChargesScreen} options={{ title: 'Monthly Charges' }} />
      <Stack.Screen name="ReportIssue" component={ResidentIssueScreen} options={{ title: 'Report Issue' }} />
    </Stack.Navigator>
  );
}

function CollectorStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1E7F5C',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="CollectorHome" component={CollectorHomeScreen} options={{ title: 'Your Wards' }} />
      <Stack.Screen name="Ward" component={CollectorWardScreen} options={{ title: 'Ward Properties' }} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { user, loading } = useAuthContext();
  const { isOnline } = useNetworkStatus();

  if (loading) {
    return null;
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <Stack.Screen name="Auth" component={AuthStack} options={{ animationEnabled: false }} />
          ) : user.role === 'resident' ? (
            <Stack.Screen name="Resident" component={ResidentStack} />
          ) : user.role === 'collector' ? (
            <Stack.Screen name="Collector" component={CollectorStack} />
          ) : null}
        </Stack.Navigator>
      </NavigationContainer>
      <SyncIndicator isOnline={isOnline} />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProviderContext>
        <AppContent />
      </AuthProviderContext>
    </QueryClientProvider>
  );
}
