/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigation from './src/navigation/AppNavigation';
import ChatBotAI from './src/chatbot/ChatBotAI';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Welcome from './src/screens/Welcome';
import Login from './src/screens/auth/Login';
import Register from './src/screens/auth/Register';
import Toast from 'react-native-toast-message';
import { AuthProvider } from './components/contexts/AuthContext';
import VerifyOtp from './src/screens/auth/forgotPassword/VerifyOtp';
import NewPassword from './src/screens/auth/forgotPassword/NewPassword';
import ForgotPassword from './src/screens/auth/forgotPassword/ForgotPassword';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthProvider>
          <Stack.Navigator initialRouteName="Welcome">
            <Stack.Screen
              name="Welcome"
              component={Welcome}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={Login}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={Register}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPassword}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="VerifyOtp"
              component={VerifyOtp}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="NewPassword"
              component={NewPassword}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Main"
              component={AppNavigation}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
          <Toast />
        </AuthProvider>
      </NavigationContainer>
      <ChatBotAI />
    </SafeAreaProvider>
  );
}

export default App;
