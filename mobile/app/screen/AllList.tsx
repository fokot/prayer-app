import React from "react";
import {View} from "react-native";
import DraggableFlatList from 'react-native-draggable-flatlist';
import {
  reorderAllPrayers, useAllPrayers, useTextColor, updateLastTab, updateLastTabListener
} from "../utils/PrayerStore";
import {PrayerListItem, RenderSeparator} from "./ListItemsComponents";
import { Ionicons } from '@expo/vector-icons';
import {Background} from "../components/Background";

export const AllList = ({navigation}) => {
  const { navigate } = navigation;
  updateLastTabListener(navigation, 'All');
  const textColor = useTextColor();
  const prayers = useAllPrayers();
  return (
    <Background>
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
    </Background>);
};
