import { StyleSheet } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, PenBox, PlusSquare, Search, User } from 'lucide-react-native';
import ConferenceCall from '../screens/call/ConferenceCall';
import CallHome from '../screens/call/CallHome';
import ScreenWrapper from '../components/ScreenWrapper';
import MainTab from '../(tabs)/Main';
import SearchTab from '../(tabs)/Search';
import CreateTab from '../(tabs)/Create';
import LearningTab from '../(tabs)/Learning';
import ProfileTab from '../(tabs)/Profile';
import Notification from '../screens/notification/Notification';
import Message from '../screens/message/Message';
import Options from '../screens/user/Options';
import Rankings from '../screens/learning/Rankings';
import Progress from '../screens/user/Progress';
const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: 'white',
            height: 80,
          },
        }}
      >
        <Tab.Screen
          name="Main"
          component={MainTab}
          options={{
            tabBarLabel: 'Trang chủ',
            headerShown: false,
            tabBarLabelStyle: { color: 'black', fontSize: 14 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Home size={24} color="black" />
              ) : (
                <Home size={24} color="gray" />
              ),
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchTab}
          options={{
            tabBarLabel: 'Tìm kiếm',
            headerShown: false,
            tabBarLabelStyle: { color: 'black', fontSize: 14 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <Search size={24} color="black" />
              ) : (
                <Search size={24} color="gray" />
              ),
          }}
        />
        <Tab.Screen
          name="Create"
          component={CreateTab}
          options={{
            tabBarLabel: 'Tạo',
            headerShown: false,
            tabBarLabelStyle: { color: 'black', fontSize: 14 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <PlusSquare size={24} color="black" />
              ) : (
                <PlusSquare size={24} color="gray" />
              ),
          }}
        />
        <Tab.Screen
          name="Learning"
          component={LearningTab}
          options={{
            tabBarLabel: 'Học tập',
            headerShown: false,
            tabBarLabelStyle: { color: 'black', fontSize: 14 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <PenBox size={24} color="black" />
              ) : (
                <PenBox size={24} color="gray" />
              ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileTab}
          options={{
            tabBarLabel: 'Cá nhân',
            headerShown: false,
            tabBarLabelStyle: { color: 'black', fontSize: 14 },
            tabBarIcon: ({ focused }) =>
              focused ? (
                <User size={24} color="black" />
              ) : (
                <User size={24} color="gray" />
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
    <ScreenWrapper bg="white">
      <Stack.Navigator>
        {/* Main */}
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notification"
          component={Notification}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Message"
          component={Message}
          options={{ headerShown: false }}
        />

        {/* Search */}
        
        {/* Learning */}
        <Stack.Screen
          name="Rankings"
          component={Rankings}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Progress"
          component={Progress}
          options={{ headerShown: false }}
        />

        {/* Profile */}
        <Stack.Screen
          name="Options"
          component={Options}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </ScreenWrapper>
  );
};

export default AppNavigation;

const styles = StyleSheet.create({});
