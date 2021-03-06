import React from "react";
import {Text, TextStyle, TouchableHighlight, View, ViewStyle,} from "react-native";
import {blue, blueLight} from "../utils/Colors";
import {LocalText} from "./LocalText";

const textStyle: TextStyle =
{
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',
  textAlign: 'center',
};

type ButtonProps = {
  title?: string,
  m?: string,
  onPress: () => void,
  style?: ViewStyle
}

export const Button = ({title, m, onPress, style = {},}: ButtonProps) =>
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
