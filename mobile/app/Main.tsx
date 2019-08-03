import React from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import PrayerList from "./screen/PrayerList";
import { Prayer } from "./screen/Prayer";
import {PrayerEdit} from "./screen/PrayerEdit";


const MainNavigator = createStackNavigator({
  Home: {screen: PrayerList},
  Prayer: {screen: Prayer},
  PrayerEdit: {screen: PrayerEdit},
}, {
  headerMode: 'none'
});

const App = createAppContainer(MainNavigator);

export default App;
