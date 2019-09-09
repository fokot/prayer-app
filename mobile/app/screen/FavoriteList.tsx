import React, {useEffect, useState} from "react";
import {View} from "react-native";
import DraggableFlatList from 'react-native-draggable-flatlist';
import {
  useFavoritePrayers, reorderFavoritePrayers, useTextColor, updateLastTab, updateLastTabListener
} from "../utils/PrayerStore";
import {PrayerListItem, PrayerListItemOpen, RenderSeparator} from "./ListItemsComponents";
import { Ionicons } from '@expo/vector-icons';
import {Background} from "../components/Background";

export const FavoriteList = ({navigation}) => {
  const {navigate} = navigation;
  updateLastTabListener(navigation, 'Favorite');
  const textColor = useTextColor();
  const prayers = useFavoritePrayers();
  const [isOpen, setOpen] = useState(false);
  return (
    <Background>
      {prayers.length > 0 && <DraggableFlatList
          data={prayers}
          renderItem={isOpen ? PrayerListItemOpen : PrayerListItem(navigate)}
          onMoveEnd={({ data }) => reorderFavoritePrayers(data)}
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
          name={isOpen ? "md-mail" : "md-mail-open"}
          onPress={() => setOpen(!isOpen)}
          size={64}
          color={textColor}
        />
      </View>
    </Background>);
};
