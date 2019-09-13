import React from 'react';
import {StyleSheet, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {createMaterialTopTabNavigator, TabBarIconProps} from "react-navigation";
import {SettingsScreen} from "./SettingsScreen";
import {AllList} from "./AllList";
import {FavoriteList} from "./FavoriteList";
import {black, blue, blueLight, white} from "../utils/Colors";
import {currentStore} from "../utils/PrayerStore";

const TabBarIcon = (name: string) => ({focused, }: TabBarIconProps) =>
  (<Ionicons size={32} name={name} color={focused ? white : black} />);

export const Home = createMaterialTopTabNavigator(
  {
    Favorite: {
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
    initialRouteName: currentStore().lastTab,
    tabBarOptions: {
      showIcon: true,
      showLabel: false,
      scrollEnabled: true,
      style: {
        backgroundColor: blue,
        elevation: 0,
        height: 50,
      },
      indicatorStyle: {
        backgroundColor: white,
      },
    },
  }
);
