import { NavigationContainer } from '@react-navigation/native';
import React, { useContext } from 'react';
import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { AuthProvider, AuthContext } from './components/contexts/AuthContext';

// Screens
import AppNavigation from './src/navigation/AppNavigation';
import ChatBotAI from './src/chatbot/ChatBotAI';
import Welcome from './src/screens/Welcome';
import Login from './src/screens/auth/Login';
import Register from './src/screens/auth/Register';
import VerifyOtp from './src/screens/auth/forgotPassword/VerifyOtp';
import NewPassword from './src/screens/auth/forgotPassword/NewPassword';
import ForgotPassword from './src/screens/auth/forgotPassword/ForgotPassword';

const Stack = createNativeStackNavigator();

// chọn màn hình
function RootNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    // load session -> show Welcome
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Welcome"
          component={Welcome}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator>
      {user ? (
        // Nếu đã login -> đi vào main
        <Stack.Screen
          name="Main"
          component={AppNavigation}
          options={{ headerShown: false }}
        />
      ) : (
        // Nếu chưa login -> đi vào auth
        <>
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
        </>
      )}
    </Stack.Navigator>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthProvider>
          <RootNavigator />
          <Toast />
        </AuthProvider>
      </NavigationContainer>
      <ChatBotAI />
    </SafeAreaProvider>
  );
}

export default App;
