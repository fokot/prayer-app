import {Text, TouchableOpacity, View} from "react-native";
import {toggleFavorite} from "../utils/PrayerStore";
import React from "react";
import { Ionicons } from '@expo/vector-icons';

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
        height: 100,
        backgroundColor: isActive ? 'blue' : 'white',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onPress={() => navigate('Prayer', {prayerId: item.id})}
      onLongPress={move}
      onPressOut={moveEnd}
    >
      <Text style={{
        fontWeight: 'bold',
        color: 'black',
        fontSize: 16,
      }}
      >{item.name}</Text>
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
    <Text style={{
      fontWeight: 'bold',
      color: 'black',
      fontSize: 32,
    }}
    >{item.name}</Text>

    <Text style={{
      fontWeight: 'bold',
      color: 'black',
    }}
    >{item.text}</Text>
  </View>;
