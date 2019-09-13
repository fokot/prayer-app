import React, {PropsWithChildren,} from "react";
import {useBackgroundColor} from "../utils/PrayerStore";
import {View, ViewStyle} from "react-native";

export const Background = ({children, style = {}}: PropsWithChildren<{style?: ViewStyle}>) => {
  const backgroundColor = useBackgroundColor();
  return <View style={{...style, backgroundColor, height: '100%'}}>{children}</View>
};
