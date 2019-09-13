import {Text, TouchableOpacity, View} from "react-native";
import {Navigation, Prayer, PrayerFull, toggleFavorite} from "../utils/PrayerStore";
import React from "react";
import { Ionicons } from '@expo/vector-icons';
import {AppText} from "../components/AppText";
import {blue} from "../utils/Colors";
import {RenderItemInfo} from "react-native-draggable-flatlist";

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

export const PrayerListItem = (navigate: Navigation['navigate']) =>
  ({ item, move, moveEnd, isActive }: RenderItemInfo<PrayerFull>) => {
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
      }}
      >{item.name}</AppText>
      <Ionicons name={item.favorite ? "md-star" : "md-star-outline"}
                onPress={() => toggleFavorite(item.id)}
                size={32} color="green" />
    </TouchableOpacity>
  )
};

export const PrayerListItemOpen = ({item}: RenderItemInfo<PrayerFull>) =>
  <View
    style={{
      padding: 16
    }}
  >
    <AppText style={{
      fontWeight: 'bold',
    }}
    >{item.name}</AppText>

    <AppText style={{
      paddingTop: 16
    }}>{item.text}</AppText>
  </View>;
