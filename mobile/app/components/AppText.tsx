import React, { ReactNode } from "react";
import {Text, TextStyle} from "react-native";
import {textColor, useSettings,} from "../utils/PrayerStore";

export const AppText = ({style = {}, children,}: {style?: TextStyle, children: ReactNode}) => {
  const { darkMode, fontSize, }  = useSettings();
  const color = textColor(darkMode);
  return <Text style={{color, fontSize, ...style}}>{children}</Text>
};
