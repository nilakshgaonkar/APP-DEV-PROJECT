import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import TrainerDashboard from '../screens/TrainerDashboard';
import HomeScreen from '../screens/HomeScreen';
import QuickCatchScreen from '../screens/QuickCatchScreen';
import PokemonStorageScreen from '../screens/PokemonStorageScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#f4511e',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -2},
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={TrainerDashboard}
        options={{
          title: 'Trainer HQ',
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => (
            <Text style={{fontSize: size, color}}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Pokedex"
        component={HomeScreen}
        options={{
          title: 'Pokédex Search',
          tabBarLabel: 'Pokédex',
          tabBarIcon: ({color, size}) => (
            <Text style={{fontSize: size, color}}>📖</Text>
          ),
        }}
      />
      <Tab.Screen
        name="QuickCatch"
        component={QuickCatchScreen}
        options={{
          title: 'Quick Catch',
          tabBarLabel: 'Catch',
          tabBarIcon: ({color, size}) => (
            <Text style={{fontSize: size, color}}>⚡</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Storage"
        component={PokemonStorageScreen}
        options={{
          title: 'Pokémon Storage',
          tabBarLabel: 'Storage',
          tabBarIcon: ({color, size}) => (
            <Text style={{fontSize: size, color}}>📦</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
