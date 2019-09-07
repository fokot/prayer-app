import React, {Component, useEffect} from "react";
import {Text, TouchableOpacity, View} from "react-native";
import DraggableFlatList from 'react-native-draggable-flatlist';
import {
  useFavoritePrayerIds,
  reorderAllPrayers,
  useAllPrayers,
  toggleFavorite,
  reorderFavoritePrayers, useBackgroundColor, useTextColor, updateLastTab, updateLastTabListener
} from "../utils/PrayerStore";
import {PrayerListItem, PrayerListItemOpen, RenderSeparator} from "./ListItemsComponents";
import { Ionicons } from '@expo/vector-icons';

export const AllList = ({navigation}) => {
  const { navigate } = navigation;
  updateLastTabListener(navigation, 'All');
  const backgroundColor = useBackgroundColor();
  const textColor = useTextColor();
  const prayers = useAllPrayers();
  return (
    <View style={{ backgroundColor, flex: 1 }}>
      {prayers.length > 0 && <DraggableFlatList
          data={prayers}
          renderItem={PrayerListItem(navigate)}
          onMoveEnd={({ data }) => reorderAllPrayers(data)}
          ItemSeparatorComponent={RenderSeparator}
      />}
      <View
        style={{
          position: 'absolute',
          right: 16,
          bottom: 16,
          elevation: 3,
        }}>
        <Ionicons
          name="md-add-circle-outline"
          onPress={() => navigate('PrayerEdit')}
          size={64}
          color={textColor}
        />
      </View>
    </View>);
};
