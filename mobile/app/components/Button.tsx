import React from "react";
import {Text, TouchableHighlight, View} from "react-native";
import {blue, blueLight} from "../utils/Colors";
import {LocalText} from "./LocalText";

const textStyle = (fontSize) =>
  ({
    color: "white",
    fontSize: fontSize || 18,
    fontWeight: "bold",
    textAlign: "center",
  });

export const Button = ({title, m, onPress, style, fontSize}) =>
  <TouchableHighlight
    style={{...{
      backgroundColor: blue,
      padding: 12,
      borderRadius: 10,
    }, ...style}}
    underlayColor={blueLight}
    onPress={onPress}
  >
    {m ?
      <LocalText style={textStyle(fontSize)} m={m}/>
      :
      <Text style={textStyle(fontSize)}>{title}</Text>
    }
  </TouchableHighlight>;
