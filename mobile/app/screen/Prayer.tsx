import React, {Component, useEffect, useState} from "react";
import {Text, TouchableOpacity, View} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import {usePrayer, toggleFavorite, deletePrayer, useBackgroundColor} from "../utils/PrayerStore";
import {AppText} from "../components/AppText";
import {blue} from "../utils/Colors";

const Icon = (props: any) =>
  <Ionicons size={32}
            color="white"
            {...props}
  />;

export const Prayer = ({navigation}) => {
    const backgroundColor = useBackgroundColor()
    const id = navigation.getParam('prayerId');
    const prayer = usePrayer(id);
    // const [isFavorite, setFavorite] = useState(prayer.favorite);
    // useEffect(
    //   () => {
    //     alert(`start: ${prayer.favorite}, ${isFavorite}`);
    //     return function cleanup () {
    //         alert(`toggle: ${prayer.favorite}, ${isFavorite}`);
    //       if(prayer.favorite != isFavorite){
    //         // toggleFavorite(prayer.id)
    //       }
    //     }
    //   }
    // );
    return (
      <View style={{backgroundColor, height: '100%'}}>
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
              name={prayer.favorite ? "md-star" : "md-star-outline"}
              // onPress={() => setFavorite(!isFavorite)}
              onPress={() => toggleFavorite(prayer.id)}
            />
          </View>
        </View>
        <View
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
        </View>

      </View>
    )
};

