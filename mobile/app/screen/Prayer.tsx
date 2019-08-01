import React, {Component, useEffect, useState} from "react";
import {Text, TouchableOpacity, View} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import {usePrayer, toggleFavorite, deletePrayer} from "../utils/PrayerStore";

const Icon = (props: any) =>
  <Ionicons size={32}
            color="white"
            {...props}
  />;

export const Prayer = ({navigation}) => {
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
      <View>
        <View
          style={{
            paddingTop: 32,
            paddingBottom: 16,
            paddingHorizontal: 16,
            backgroundColor: '#2196f3',
            height: 80,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between"
          }}
        >
          <Icon
            name="md-arrow-back"
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
          <Text style={{
            fontWeight: 'bold',
            color: 'black',
            fontSize: 32,
          }}
          >{prayer.name}</Text>

          <Text style={{
            fontWeight: 'bold',
            color: 'black',
          }}
          >{prayer.text}</Text>
        </View>

      </View>
    )
};

