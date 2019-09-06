import React from "react";
import {Text, TouchableHighlight, View,} from "react-native";
import {blue, blueLight} from "../utils/Colors";
import {LocalText} from "./LocalText";

const textStyle =
{
  color: "white",
  fontSize: 18,
  fontWeight: "bold",
  textAlign: "center",
};

export const Button = ({title, m, onPress, style = {},}) =>
  <TouchableHighlight
    style={{...{
      backgroundColor: blue,
      padding: 12,
      borderRadius: 10,
      height: 50,
    }, ...style}}
    underlayColor={blueLight}
    onPress={onPress}
  >
    {/* View is here so TouchableHighlight does not push
      unexpected opacity style down to Text
    */}
    <View>
      {m ?
        <LocalText style={textStyle} m={m}/>
        :
        <Text style={textStyle}>{title}</Text>
      }
    </View>
  </TouchableHighlight>;
