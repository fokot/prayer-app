import React from "react";
import {Text, TouchableHighlight, View} from "react-native";
import {blue, blueLight} from "../utils/Colors";

export const Button = ({title, onPress, style, fontSize}) =>
  <TouchableHighlight
    style={{...{
      backgroundColor: blue,
      padding: 12,
      borderRadius: 10,
    }, ...style}}
    underlayColor={blueLight}
    onPress={onPress}
  >
    <Text style={{
      color: "white",
      fontSize: fontSize || 18,
      fontWeight: "bold",
      textAlign: "center",
    }}>
      {title}
    </Text>
  </TouchableHighlight>;
