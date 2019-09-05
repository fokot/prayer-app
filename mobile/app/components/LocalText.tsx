import React from "react";
import {Text} from "react-native";
import {useMessages} from "../utils/PrayerStore";

export const LocalText = ({style, m}) => {
  const translate = useMessages();
  return <Text style={style}>{translate[m]}</Text>
}
