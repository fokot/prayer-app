import React, { useState } from "react";
import {StyleSheet, View} from "react-native";
import DraggableFlatList from 'react-native-draggable-flatlist';
import {
  useFavoritePrayers,
  reorderFavoritePrayers,
  updateLastTabListener,
  NavigationProps,
  useMessages,
  useAllPrayers, PrayerFull, TabName,
} from "../utils/PrayerStore";
import {PrayerListItem, PrayerListItemOpen, RenderSeparator} from "./ListItemsComponents";
import { Ionicons } from '@expo/vector-icons';
import {Background} from "../components/Background";
import ActionButton from 'react-native-action-button';
import {blue, purple} from "../utils/Colors";

const styles = StyleSheet.create({
  actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
});

const PrayerList = (name: TabName, prayersFn: () => PrayerFull[]) => ({navigation}: NavigationProps) => {
  const translate = useMessages();
  const {navigate} = navigation;
  updateLastTabListener(navigation, name);
  const prayers = prayersFn();
  const [isOpen, setOpen] = useState(false);
  return (
    <Background>
      {prayers.length > 0 &&
      // @ts-ignore
      <DraggableFlatList
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
      </View>
        <ActionButton buttonColor={blue}
                      renderIcon={() => <Ionicons name={isOpen ? "md-mail" : "md-mail-open"} style={styles.actionButtonIcon}  />}
                      onPress={() => setOpen(!isOpen)}
                      openOnPress={false}
        >
          <ActionButton.Item buttonColor={purple} title={translate['NewPrayer']} onPress={() => navigate('PrayerEdit')}>
            <Ionicons name="md-create" style={styles.actionButtonIcon}  />
          </ActionButton.Item>
        </ActionButton>
    </Background>);
};

export const AllList = PrayerList('All', useAllPrayers);
export const FavoriteList = PrayerList('Favorite', useFavoritePrayers);
