import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TouchableWithoutFeedback,
  Modal,
} from 'react-native';
import {
  ArrowLeft,
  SquarePen,
  MessageSquare,
  Search,
  Users,
  MessageSquarePlus,
} from 'lucide-react-native';
import useAuth from '../../../hooks/useAuth';
import ListConversation from './components/ListConversation';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import ModalSearchNewChat from './components/ModalSearchNewChat';
import ModalCreateGroup from './components/ModalCreateGroup';

const Message = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  // State quản lý hiển thị
  const [isMenuVisible, setMenuVisible] = useState(false); 
  const [isNewChatVisible, setNewChatVisible] = useState(false); 
  const [isCreateGroupVisible, setCreateGroupVisible] = useState(false);

  // Actions
  const handleOpenNewChat = () => {
    setMenuVisible(false); 
    setTimeout(() => {
        setNewChatVisible(true); 
    }, 100);
  };

  const handleCreateGroup = () => {
    setMenuVisible(false);
    setCreateGroupVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header với gradient */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Tin nhắn</Text>
          </View>

          <TouchableOpacity style={styles.composeButton} activeOpacity={0.8} onPress={() => setMenuVisible(true)}>
            <SquarePen size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={20} color="#9ca3af" />
            <TextInput
              placeholder="Tìm kiếm cuộc trò chuyện hoặc người dùng..."
              style={styles.searchInput}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Conversations List */}
        <View style={styles.conversationsContainer}>
          <ListConversation />
        </View>
      </View>
      {/* --- DROPDOWN MENU MODAL --- */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          {/* Overlay mờ */}
          <View className="flex-1 bg-black/10">
            
            {/* Menu Box */}
            <TouchableWithoutFeedback>
                <View 
                  className="absolute top-[7.2%] right-5 bg-white rounded-xl py-2 w-[180px] shadow-lg shadow-black/20"
                  style={{ elevation: 5 }} // Shadow cho Android (Tailwind shadow đôi khi không ăn trên Android)
                >
                    <TouchableOpacity 
                      className="flex-row items-center py-3 px-4 active:bg-gray-50"
                      onPress={handleOpenNewChat}
                    >
                        <MessageSquarePlus size={20} color="#374151" />
                        <Text className="ml-3 text-[15px] font-medium text-gray-700">Tin nhắn mới</Text>
                    </TouchableOpacity>
                    
                    <View className="h-[1px] bg-gray-100 mx-3" />

                    <TouchableOpacity 
                      className="flex-row items-center py-3 px-4 active:bg-gray-50"
                      onPress={handleCreateGroup}
                    >
                        <Users size={20} color="#374151" />
                        <Text className="ml-3 text-[15px] font-medium text-gray-700">Tạo nhóm</Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* --- MODAL TẠO CHAT MỚI --- */}
      <ModalSearchNewChat 
        visible={isNewChatVisible} 
        onClose={() => setNewChatVisible(false)} 
      />

      <ModalCreateGroup 
        open={isCreateGroupVisible} 
        setOpen={setCreateGroupVisible} 
      />
    </SafeAreaView>
  );
};

export default Message;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  messageIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  composeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginTop: -12,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
  },
  conversationsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
