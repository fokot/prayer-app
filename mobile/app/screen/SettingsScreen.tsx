import {Button, Picker, Slider, Switch, View, Text, Modal, FlatList, TouchableOpacity} from "react-native";
import React, {useEffect, useState} from "react";
import {
  toggleDarkMode,
  useStore,
  useBackgroundColor,
  toggleFavorite,
  getCdnPrayers,
  addCdnPrayers, replaceCdnPrayers
} from "../utils/PrayerStore";
import { Ionicons } from '@expo/vector-icons';
import {RenderSeparator} from "./ListItemsComponents";

export const SettingsScreen = () => {
  const darkMode = useStore(s => s.settings.darkMode);
  const backgroundColor = useBackgroundColor();
  const [showPrayersPicker, setShowPrayersPicker] = useState(false);
  const closeModal = () => setShowPrayersPicker(false);
  return (
  <View
    style={{
      backgroundColor: backgroundColor,
    }}
  >
    <View>
      <Text>Language</Text>
      <Picker
        selectedValue={"English"}
        style={{height: 50, width: 100}}
        onValueChange={(itemValue, itemIndex) =>
          alert({language: itemValue})
        }>
        <Picker.Item label="English" value="English" />
        <Picker.Item label="Slovak" value="Slovak" />
      </Picker>
    </View>
    <View>
      <Text>Dark mode</Text>
      <Switch value={darkMode} onValueChange={toggleDarkMode}/>
    </View>
    <View>
      <Text>Text size</Text>
      <Slider value={5} minimumValue={3} maximumValue={30}/>
    </View>
    <View
      style={{
        padding: 16
      }}
    >
      <Button
        onPress={() => setShowPrayersPicker(true)}
        title="Load prayers"
        color="#841584"
      />
    </View>
    <View
      style={{
        padding: 16
      }}
    >
      <Button
        onPress={() => alert('pressed')}
        title="Edit in browserk"
        color="#841584"
      />
    </View>
    <Modal
      animationType="slide"
      transparent={false}
      visible={showPrayersPicker}
      onRequestClose={closeModal}>
      <PrayerModal closeModal={closeModal}/>
    </Modal>
  </View>
)};

const PrayerModal = ({closeModal}) => {
  const [prayers, setPrayers] = useState([]);
  useEffect(
    () => {
      getCdnPrayers().then(setPrayers);
      return () => {};
    }, []
  );
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  return (
      <View style={{margin: 22}}>
        {selectedPrayer ?
        <SelectedPrayer prayer={selectedPrayer} closeModal={closeModal}/> :
          <View>
            <Ionicons name="md-close"
                      onPress={closeModal}
                      size={32} color="green" />
            {prayers.length < 1 ?
              <Text>Loading...</Text> :
              <FlatList
                data={prayers}
                renderItem={({item}) => <LoadPrayerItem prayer={item} selectPrayer={() => setSelectedPrayer(item)} />}
                keyExtractor={(item, index) => index.toString()}
                ItemSeparatorComponent={RenderSeparator}
              />
            }
          </View>
        }
      </View>
  );
}

const LoadPrayerItem = ({prayer: {name}, selectPrayer}) => (
  <Text style={{
    padding: 16,
    fontWeight: 'bold',
    color: 'black',
    fontSize: 24,
    textAlign: 'center',
  }}
  onPress={selectPrayer}
  >{name}</Text>
);

const SelectedPrayer = ({prayer: {name, file}, closeModal}) => (
  <View>
    <Ionicons name="md-close"
              onPress={closeModal}
              size={32} color="green" />
    <Text
      style={{
        padding: 16,
        fontWeight: 'bold',
        color: 'black',
        fontSize: 24,
        textAlign: 'center',
      }}
    >{name}</Text>
    <Button
      onPress={() =>
        addCdnPrayers(file).then(closeModal())
      }
      title="Add prayers"
      color="#841584"
    />
    <Button
      onPress={() =>
        replaceCdnPrayers(file).then(closeModal())
      }
      title="Replace prayers"
      color="#841584"
    />
    <Button
      onPress={closeModal}
      title="Cancel"
      color="#841584"
    />
  </View>
)
