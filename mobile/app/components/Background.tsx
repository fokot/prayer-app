import React from "react";
import {useBackgroundColor} from "../utils/PrayerStore";
import {View} from "react-native";

export const Background = ({children, style = {}}) => {
  const backgroundColor = useBackgroundColor();
  return <View style={{...style, backgroundColor, height: '100%'}}>{children}</View>
};
