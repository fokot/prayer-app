import React from 'react';
import {StyleSheet, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {createMaterialTopTabNavigator} from "react-navigation";
import {SettingsScreen} from "./SettingsScreen";
import {AllList} from "./screen/AllList";
import {FavoriteList} from "./screen/FavoriteList";

const TabBarIcon = (name) => ({focused, }) =>
  (<Ionicons size={32} name={name} color={focused ? 'green' : 'black'} />);

const HomeScreen = createMaterialTopTabNavigator(
  {
    Favorites: {
      screen: FavoriteList,
      navigationOptions: {
        tabBarIcon: TabBarIcon("md-star")
      },
    },
    All: {
      screen: AllList,
      navigationOptions: {
        tabBarIcon: TabBarIcon("md-book")
      },
    },
    Settings: {
      screen: SettingsScreen,
      navigationOptions: {
        title: '\u2699',
        tabBarIcon: TabBarIcon("md-menu")
      },
    },
  },
  {
    initialRouteName: 'Settings',
    tabBarOptions: {
      showIcon: true,
      showLabel: false,
      activeTintColor: '#979CA8',
      inactiveTintColor: '#B7BAC7',
      scrollEnabled: true,
      style: {
        backgroundColor: '#FFF',
        elevation: 0,
        borderBottomColor: '#DFE2EF',
        borderBottomWidth: 1,
      },
      labelStyle: {
        fontSize: 14,
        fontWeight: '500',
      },
      indicatorStyle: {
        backgroundColor: '#00D395',
        height: 1,
        marginBottom: -1,
      },
    },
  }
);


export default HomeScreen;
