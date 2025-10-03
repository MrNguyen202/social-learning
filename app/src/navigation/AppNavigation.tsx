import { StyleSheet } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, PenBox, PlusSquare, Search, User } from 'lucide-react-native';
import ConferenceCall from '../screens/call/ConferenceCall';
import CallHome from '../screens/call/CallHome';
import ScreenWrapper from '../components/ScreenWrapper';
import SearchTab from '../(tabs)/Search';
import CreateTab from '../(tabs)/Create';
import LearningTab from '../(tabs)/Learning';
import ProfileTab from '../(tabs)/Profile';
import Notification from '../screens/notification/Notification';
import Message from '../screens/message/Message';
import Options from '../screens/user/Options';
import Rankings from '../screens/learning/Rankings';
import Progress from '../screens/user/Progress';
import EditProfile from '../screens/user/EditProfile';
import Follow from '../screens/user/components/Follow';
import ChatDetail from '../screens/message/chat/ChatDetail';
import useAuth from '../../hooks/useAuth';
import Loading from '../components/Loading';
import Welcome from '../screens/Welcome';
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import ForgotPassword from '../screens/auth/forgotPassword/ForgotPassword';
import VerifyOTP from '../screens/auth/forgotPassword/VerifyOtp';
import NewPassword from '../screens/auth/forgotPassword/NewPassword';
import Main from '../(tabs)/Main';
import PostDetail from '../screens/post/PostDetail';
import EditPost from '../screens/post/EditPost';
import UserFollowScreen from '../screens/follow/UserFollow';
import RecommendFriend from '../screens/recommend/friends/RecommendFriend';
import Listening from '../screens/learning/listening/Listening';
import ListeningDetail from '../screens/learning/listening/ListeningDetail';
import Speaking from '../screens/learning/speaking/Speaking';
import Writing from '../screens/learning/writing/Writing';

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
          component={Main}
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
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return user ? (
    <ScreenWrapper bg="white">
      <Stack.Navigator>
        {/* Main */}
        <Stack.Screen
          name="BottomTabs"
          component={BottomTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Notification"
          component={Notification}
          options={{ headerShown: false }}
        />
        {/* Chat */}
        <Stack.Screen
          name="Message"
          component={Message}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ChatDetail"
          component={ChatDetail}
          options={{ headerShown: false }}
        />

        {/* Search */}
        <Stack.Screen
          name="RecommendFriend"
          component={RecommendFriend}
          options={{ headerShown: false }}
        />
        {/* Post */}
        <Stack.Screen
          name="PostDetail"
          component={PostDetail}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EditPost"
          component={EditPost}
          options={{ headerShown: false }}
        />

        {/* Learning */}
        <Stack.Screen
          name="Listening"
          component={Listening}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ListeningDetail"
          component={ListeningDetail}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Speaking"
          component={Speaking}
          options={{ headerShown: false }}
        />
         <Stack.Screen
          name="Writing"
          component={Writing}
          options={{ headerShown: false }}
        />
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
          name="EditProfile"
          component={EditProfile}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Follow"
          component={Follow}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserFollow"
          component={UserFollowScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Options"
          component={Options}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </ScreenWrapper>
  ) : (
    <ScreenWrapper bg="#FFF7ED">
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
          component={VerifyOTP}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NewPassword"
          component={NewPassword}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </ScreenWrapper>
  );
};

export default AppNavigation;

const styles = StyleSheet.create({});
