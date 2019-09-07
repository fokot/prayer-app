import React from "react";
import {Text} from "react-native";
import {textColor, useSettings, useTextColor} from "../utils/PrayerStore";

export const AppText = ({style = {}, children,}) => {
  const { darkMode, fontSize, }  = useSettings();
  const color = textColor(darkMode);
  return <Text style={{color, fontSize, ...style}}>{children}</Text>
};
