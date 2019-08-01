import React, {useState} from "react";
import {View} from "react-native";
import DraggableFlatList from 'react-native-draggable-flatlist';
import {
  useFavoritePrayers, reorderFavoritePrayers
} from "../utils/PrayerStore";
import {PrayerListItem, PrayerListItemOpen, RenderSeparator} from "./ListItemsComponents";
import { Ionicons } from '@expo/vector-icons';

export const FavoriteList = ({navigation: {navigate}}) => {
  const prayers = useFavoritePrayers();
  const [isOpen, setOpen] = useState(false);
  return (
    <View style={{ flex: 1 }}>
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
          color="black"
        />
      </View>
    </View>);
};
