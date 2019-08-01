import React, {Component, useEffect, useState} from "react";
import {Text, TextInput, TouchableOpacity, View} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import {usePrayer, toggleFavorite, deletePrayer, savePrayer} from "../utils/Storage";
import {Prayer} from "../utils/Prayers";
import uuid from 'uuid/v1';

// yarn add  @types/ramda

const Icon = (props: any) =>
  <Ionicons size={32}
            color="white"
            {...props}
  />;

const newPrayer = (): Prayer => ({
  id: uuid(), name: "", text: ""
});

export const PrayerEdit = ({navigation}) => {
    const id = navigation.getParam('prayerId');
    const initialPrayer = id ? usePrayer(id) : newPrayer();
    const [prayer, setPrayer] = useState(initialPrayer);
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
              name="md-close"
              onPress={() => navigation.goBack()}
            />
            <Icon
              name="md-checkmark"
              onPress={() => {
                savePrayer(prayer);
                navigation.goBack();
              }}
            />
          </View>
        </View>
        <View
          style={{
            padding: 16
          }}
        >
          <TextInput
            style={{
              fontWeight: 'bold',
              color: 'black',
              fontSize: 32,
            }}
            value={prayer.name}
            placeholder={'Prayers name'}
            onChangeText={(text) => setPrayer({...prayer, name: text})}
          />
          <TextInput
            style={{
              fontWeight: 'bold',
              color: 'black',
              fontSize: 32,
            }}
            value={prayer.text}
            placeholder={'Prayers text'}
            multiline={true}
            numberOfLines={10}
            onChangeText={(text) => setPrayer({...prayer, text: text})}
          />
        </View>

      </View>
    )
};

