import React, {useState} from "react";
import {ScrollView, TextInput, View} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import {usePrayer, savePrayer, useTextColor, useBackgroundColor, useMessages} from "../utils/PrayerStore";
import {Prayer} from "../utils/Prayers";
import uuid from 'uuid/v1';
import {blue} from "../utils/Colors";

const Icon = (props: any) =>
  <Ionicons size={32}
            color="white"
            {...props}
  />;

const newPrayer = (): Prayer => ({
  id: uuid(), name: "", text: ""
});

export const PrayerEdit = ({navigation}) => {
    const translate = useMessages();
    const backgroundColor = useBackgroundColor();
    const id = navigation.getParam('prayerId');
    const initialPrayer = id ? usePrayer(id) : newPrayer();
    const [prayer, setPrayer] = useState(initialPrayer);
    const textColor = useTextColor();
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
        <ScrollView
          style={{
            padding: 16
          }}
        >
          <TextInput
            style={{
              fontWeight: 'bold',
              color: textColor,
              fontSize: 32,
            }}
            value={prayer.name}
            placeholder={translate['Name']}
            onChangeText={(text) => setPrayer({...prayer, name: text})}
          />
          <TextInput
            style={{
              fontWeight: 'bold',
              color: textColor,
              fontSize: 32,
            }}
            value={prayer.text}
            placeholder={translate['Text']}
            multiline={true}
            numberOfLines={10}
            onChangeText={(text) => setPrayer({...prayer, text: text})}
          />
        </ScrollView>

      </View>
    )
};

