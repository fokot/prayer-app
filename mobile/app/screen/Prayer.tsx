import React, {useEffect, useState} from "react";
import {ScrollView, View} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import {usePrayer, toggleFavorite, deletePrayer, NavigationProps} from "../utils/PrayerStore";
import {AppText} from "../components/AppText";
import {blue} from "../utils/Colors";
import {Background} from "../components/Background";

const Icon = (props: any) =>
  <Ionicons size={32}
            color="white"
            {...props}
  />;


export const Prayer = ({navigation}: NavigationProps) => {
    const id = navigation.getParam('prayerId');
    const prayer = usePrayer(id);
    const [isFavorite, setFavorite] = useState(prayer.favorite);
    useEffect(
      () => {
        return function cleanup () {
          if(prayer.favorite != isFavorite && !navigation.isFocused()){
            toggleFavorite(prayer.id);
          }
        }
      }
    );
    return (
      <Background>
        <View
          style={{
            paddingHorizontal: 16,
            backgroundColor: blue,
            height: 50,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Icon
            style={{paddingRight: 20}}
            name="ios-arrow-back"
            onPress={() => navigation.goBack()}
          />
          <View
            style={{
              width: 120,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between"
            }}
          >
            <Icon
              name="md-trash"
              onPress={() => {
                deletePrayer(prayer);
                navigation.goBack();
              }}
            />
            <Icon
              name="md-create"
              onPress={() => navigation.navigate('PrayerEdit', {prayerId: id})}
            />
            <Icon
              name={isFavorite ? "md-star" : "md-star-outline"}
              onPress={() => setFavorite(!isFavorite)}
            />
          </View>
        </View>
        <ScrollView
          style={{
            padding: 16
          }}
        >
          <AppText style={{
            fontWeight: 'bold',
          }}
          >{prayer.name}</AppText>

          <AppText
            style={{
              paddingTop: 16
            }}
          >{prayer.text}</AppText>
        </ScrollView>

      </Background>
    )
};

