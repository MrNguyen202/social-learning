import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, User } from 'lucide-react-native';
import ConferenceCall from '../call/ConferenceCall';
import CallHome from '../call/CallHome';
const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: 'gray',
            height: 120,
          },
        }}
      >
        <Tab.Screen
          name="CallHome"
          component={CallHome}
          options={{
            tabBarLabel: '',
            headerShown: false,
            tabBarLabelStyle: { color: 'white', fontSize: 14 },
            tabBarIcon: ({ focused }) =>
              focused ? (
               <Home size={24} color="white" />
              ) : (
                <Home size={24} color="#000" />
              ),
          }}
        />

        <Tab.Screen
          name="OUT"
          component={CallHome}
          options={{
            tabBarLabel: '',
            headerShown: false,
            tabBarLabelStyle: { color: 'white', fontSize: 14 },
            tabBarIcon: ({ focused }) =>
              focused ? (
               <User size={24} color="white" />
              ) : (
                <User size={24} color="#000" />
              ),
          }}
        />
      </Tab.Navigator>
    </>
  );
}

const Stack = createNativeStackNavigator();

const AppNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={BottomTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="ConferenceCall" component={ConferenceCall} />
    </Stack.Navigator>
  );
};

export default AppNavigation;

const styles = StyleSheet.create({});
