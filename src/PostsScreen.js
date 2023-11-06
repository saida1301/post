import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from './NotificationService';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Feather } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
export default function PostsScreen() {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const storedPosts = await AsyncStorage.getItem('posts');
        if (storedPosts) {
          const parsedPosts = JSON.parse(storedPosts);

          setPosts(parsedPosts.reverse());
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };
    fetchPosts();
  }, []);
  

  const handleLike = async (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        if (likedPosts.includes(postId)) {
          post.likes -= 1;
          setLikedPosts(prevLikedPosts => prevLikedPosts.filter(id => id !== postId));
        } else {
          post.likes += 1;
          setLikedPosts(prevLikedPosts => [...prevLikedPosts, postId]);
        }
      }
      return post;
    });

    await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
    notificationService.sendNotification('Post Liked!', 'Someone liked your post');
    setPosts(updatedPosts);
  };
  

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.postContainer}>
            {item.image && <Image source={{ uri: item.image }} style={styles.postImage} />}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={styles.postText}>{item.text}</Text>
                <Text style={styles.likesText}>Likes: {item.likes}</Text>
              </View>
              <TouchableOpacity onPress={() => handleLike(item.id)}>
              <FontAwesome5 
  name={likedPosts.includes(item.id) ? 'heart' : 'heart'} 
  size={16} 
  color={likedPosts.includes(item.id) ? '#FF0000' : '#1DA1F2'} 
/>

              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  postContainer: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 8, 
  },
  postText: {
    fontSize: 16,
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: 200,
    marginBottom: 8,
    borderRadius: 8, 
  },
  likesText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  likeButton: {
    color: '#1DA1F2',
    fontSize: 16,
    fontWeight: 'bold',
  },
});



async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync({ projectId: 'ccd2b336-dd4e-4071-9e67-b8664c991bfb' })).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}