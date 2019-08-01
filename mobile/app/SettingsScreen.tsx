import {Button, Picker, Slider, Switch, View, Text} from "react-native";
import React from "react";
import {toggleDarkMode, useStore, useBackgroundColor} from "./utils/PrayerStore";

// const SettingsScreen = ({ darkMode }) => (
export const SettingsScreen = () => {
  const darkMode = useStore(s => s.settings.darkMode);
  const backgroundColor = useBackgroundColor();
  return (
  <View
    style={{
      backgroundColor: backgroundColor,
    }}
  >
    <View>
      <Text>Language</Text>
      <Picker
        selectedValue={"English"}
        style={{height: 50, width: 100}}
        onValueChange={(itemValue, itemIndex) =>
          this.setState({language: itemValue})
        }>
        <Picker.Item label="English" value="English" />
        <Picker.Item label="Slovak" value="Slovak" />
      </Picker>
    </View>
    <View>
      <Text>Dark mode</Text>
      <Switch value={darkMode} onValueChange={toggleDarkMode}/>
    </View>
    <View>
      <Text>Text size</Text>
      <Slider value={5} minimumValue={3} maximumValue={30}/>
    </View>
    <View
      style={{
        padding: 16
      }}
    >
      <Button
        onPress={() => alert('pressed')}
        title="Load prayers"
        color="#841584"
      />
    </View>
    <View
      style={{
        padding: 16
      }}
    >
      <Button
        onPress={() => alert('pressed')}
        title="Edit in browser"
        color="#841584"
      />
    </View>
  </View>
)};
