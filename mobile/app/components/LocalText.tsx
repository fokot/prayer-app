import React from "react";
import { useMessages } from "../utils/PrayerStore";
import {AppText} from "./AppText";

export const LocalText = ({style, m}) => {
  const translate = useMessages();
  return <AppText style={style}>{translate[m]}</AppText>
}
