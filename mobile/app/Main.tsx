import React from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import {Home} from "./screen/Home";
import { Prayer } from "./screen/Prayer";
import {PrayerEdit} from "./screen/PrayerEdit";
import {useInitialised} from "./utils/PrayerStore";
import {ActivityIndicator, View} from "react-native";
import {blue} from "./utils/Colors";


const MainNavigator = createStackNavigator({
  Home: {screen: Home},
  Prayer: {screen: Prayer},
  PrayerEdit: {screen: PrayerEdit},
}, {
  headerMode: 'none'
});

export const Main = createAppContainer(MainNavigator);
