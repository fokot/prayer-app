import {Text, TouchableOpacity, View} from "react-native";
import {toggleFavorite} from "../utils/PrayerStore";
import React from "react";
import { Ionicons } from '@expo/vector-icons';
import {AppText} from "../components/AppText";
import {blue} from "../utils/Colors";

export const RenderSeparator = () => (
  <View
    style={{
      marginLeft: 20,
      marginRight: 20,
      backgroundColor: 'grey',
      height: 1,
    }}
  />
);

export const PrayerListItem = (navigate) => ({ item, index, move, moveEnd, isActive }) => {
  return (
    <TouchableOpacity
      style={{
        ...( isActive ? {backgroundColor: blue} : {}),
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onPress={() => navigate('Prayer', {prayerId: item.id})}
      onLongPress={move}
      onPressOut={moveEnd}
    >
      <AppText style={{
        fontWeight: 'bold',
        fontSize: 16,
      }}
      >{item.name}</AppText>
      <Ionicons name={item.favorite ? "md-star" : "md-star-outline"}
                onPress={() => toggleFavorite(item.id)}
                size={32} color="green" />
    </TouchableOpacity>
  )
};

export const PrayerListItemOpen = ({item}) =>
  <View
    style={{
      padding: 16
    }}
  >
    <AppText style={{
      fontWeight: 'bold',
      fontSize: 32,
    }}
    >{item.name}</AppText>

    <AppText style={{
      fontWeight: 'bold',
    }}
    >{item.text}</AppText>
  </View>;
