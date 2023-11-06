import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AddPostScreen from './AddPostScreen';
import PostsScreen from './PostsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
    
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AddPost">
        <Stack.Screen name="AddPost" component={AddPostScreen} />
        <Stack.Screen name="Posts" component={PostsScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
