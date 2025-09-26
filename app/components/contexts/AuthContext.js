import { useNavigation } from '@react-navigation/native';
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../../lib/supabase';
import { getUserData } from '../../src/api/user/route';
import { getSocket } from '../../socket/socketClient';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    // Lấy session hiện tại
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Lỗi khi lấy phiên:', error);
      }
      const sessionUser = data?.session?.user;
      if (sessionUser) {
        updateUserData(sessionUser, sessionUser.email);
      } else {
        setUser(null);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
      setLoading(false);
    });

    // Lắng nghe thay đổi trạng thái auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          updateUserData(session.user, session.user.email);
        } else {
          setUser(null);
          if (event === 'SIGNED_OUT') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      },
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [navigation]);

  const updateUserData = async (authUser, email) => {
    try {
      const res = await getUserData(authUser?.id);
      if (res.success) {
        setUser({
          ...res.data,
          email: email || authUser.email,
          id: authUser.id,
        });
      } else {
        setUser({
          id: authUser.id,
          email: email || authUser.email,
          ...authUser,
        });
      }
    } catch (error) {
      console.error('Error updating user data:', error);
      setUser({
        id: authUser.id,
        email: email || authUser.email,
        ...authUser,
      });
    }
  };

  // Gửi event user-online qua socket
  useEffect(() => {
    const socket = getSocket();
    if (user?.id) {
      socket.emit('user-online', { userId: user.id });
    }
  }, [user]);

  const contextValue = {
    user,
    setUser,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
