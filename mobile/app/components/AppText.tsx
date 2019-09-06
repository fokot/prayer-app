import React from "react";
import {Text} from "react-native";
import { useTextColor } from "../utils/PrayerStore";

export const AppText = ({style = {}, children,}) => {
  const color = useTextColor();
  return <Text style={{color, ...style}}>{children}</Text>
};
