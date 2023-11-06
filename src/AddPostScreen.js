import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export default function AddPostScreen() {
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    })();
  }, []);

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.cancelled) {
        setSelectedImage(result.assets[0].uri);
        console.log(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };
  

  const handlePost = async () => {
    try {
      const existingPosts = await AsyncStorage.getItem('posts');
      const parsedPosts = existingPosts ? JSON.parse(existingPosts) : [];

      const newPost = {
        id: Date.now().toString(),
        text: postText,
        likes: 0,
        image: selectedImage, 
      };

      const updatedPosts = [...parsedPosts, newPost];
console.log(selectedImage);
      await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));

      setPostText('');
      setSelectedImage(null);
      navigation.navigate('Posts');
      console.log('Post created successfully:', newPost);
    } catch (error) {
      console.error('Error posting:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        value={postText}
        onChangeText={setPostText}
        multiline
      />
  
      <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
        <Text style={styles.imageButtonText}>Select Image</Text>
      </TouchableOpacity>
  
      {selectedImage && <Image source={{ uri: selectedImage }} style={styles.imagePreview} />}
      
      <TouchableOpacity style={styles.postButton} onPress={handlePost}>
        <Text style={styles.postButtonText}>Post</Text>
      </TouchableOpacity>
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    padding: 8,
    fontSize: 16,
    borderRadius: 8, // Add rounded corners
  },
  imageButton: {
    backgroundColor: '#1DA1F2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 16,
  },
  postButton: {
    backgroundColor: '#1DA1F2',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

