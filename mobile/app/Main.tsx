import React from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import Home from "./screen/Home";
import { Prayer } from "./screen/Prayer";
import {PrayerEdit} from "./screen/PrayerEdit";
import {useInitialised} from "./utils/PrayerStore";
import {View} from "react-native";


const MainNavigator = createStackNavigator({
  Home: {screen: Home},
  Prayer: {screen: Prayer},
  PrayerEdit: {screen: PrayerEdit},
}, {
  headerMode: 'none'
});

const Container = createAppContainer(MainNavigator);

const Main = () => {
  const initialised = useInitialised();
  return initialised ? <Container /> : <View />;
};

export default Main;
