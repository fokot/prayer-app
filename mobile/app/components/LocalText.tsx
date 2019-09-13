import React from "react";
import { useMessages } from "../utils/PrayerStore";
import {AppText} from "./AppText";
import {TextStyle} from "react-native";

export const LocalText = ({style, m}: {style?: TextStyle, m: string}) => {
  const translate = useMessages();
  return <AppText style={style}>{translate[m]}</AppText>
}
