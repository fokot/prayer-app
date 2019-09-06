import {FlatList, Modal, Picker, ScrollView, Slider, StyleSheet, Switch, Text, View} from "react-native";
import { Button } from "../components/Button";
import React, {useEffect, useState} from "react";
import {
  addCdnPrayers,
  currentStore,
  getCdnPrayers, Language,
  replaceCdnPrayers,
  replaceFromWeb, setLanguage,
  toggleDarkMode,
  useBackgroundColor,
  useStore,
} from "../utils/PrayerStore";
import {Ionicons} from '@expo/vector-icons';
import {RenderSeparator} from "./ListItemsComponents";
import {BarCodeScanner} from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import {blue} from "../utils/Colors";
import {LocalText} from "../components/LocalText";

const margin = 8;
const fontSize = 20;

export const SettingsScreen = () => {
  const { language, darkMode, }  = useStore(s => s.settings);
  const backgroundColor = useBackgroundColor();
  const [showPrayersPicker, setShowPrayersPicker] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const closeModal = () => setShowPrayersPicker(false);
  return (
    <ScrollView
      style={{
        backgroundColor: backgroundColor,
        marginHorizontal: margin,
      }}
    >
      <View style={{
        marginVertical: margin,
        display: "flex",
        justifyContent: "space-between"
      }}>
        <LocalText style={{fontSize}} m="Language" />
        <Picker
          selectedValue={language}
          itemStyle={{fontSize}}
          onValueChange={setLanguage}>
          <Picker.Item label="English" value={Language.en}/>
          <Picker.Item label="Slovak" value={Language.sk}/>
        </Picker>
      </View>
      <View style={{marginVertical: margin}}>
        <LocalText style={{fontSize}} m={'DarkMode'} />
        <Switch value={darkMode} onValueChange={toggleDarkMode}/>
      </View>
      <View style={{marginVertical: margin}}>
        <LocalText style={{fontSize}} m="TextSize"/>
        <Slider value={5} minimumValue={3} maximumValue={30}/>
      </View>
      <Button
        style={{marginVertical: 2 * margin}}
        onPress={() => setShowPrayersPicker(true)}
        title={<LocalText m="LoadPrayers"/>}
        color="#841584"
      />
      <Text
        style={{
          marginTop: 2 * margin,
          fontSize,
        }}
      >
        <LocalText
          m="EditStart"
        />
        <Text style={{fontWeight: "bold"}}>prayer-app.tk</Text>
        <LocalText m="EditMiddle" />
      </Text>
      <Button
        onPress={() => setShowSync(true)}
        title={<LocalText m="EditInBrowser"/>}
        color="#841584"
      />
      <LocalText style={{fontSize}} m="EditEnd" />
      <Modal
        animationType="slide"
        transparent={false}
        visible={showPrayersPicker}
        onRequestClose={closeModal}>
        <PrayerModal closeModal={closeModal}/>
      </Modal>
      <Modal
        animationType="slide"
        transparent={false}
        visible={showSync}
        onRequestClose={() => setShowSync(false)}>
        <Sync closeSync={() => setShowSync(false)}/>
      </Modal>
    </ScrollView>
  )
};

const Sync = ({closeSync}) => {

  const [clientId, setClientId] = useState(null);
  const [hasCameraPermission, setCameraPermission] = useState(null);

  useEffect(
    () => {
      Permissions.askAsync(Permissions.CAMERA).then(
        ({status}) =>
          setCameraPermission(status === 'granted')
      )
      return () => {
      };
    }
  );

  if (hasCameraPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasCameraPermission === false) {
    return <Text>No access to camera</Text>;
  }

  if (clientId) {
    return <Syncing clientId={clientId} closeSync={closeSync}/>;
  }

  return (
    <View style={{
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}>
      <BarCodeScanner
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        onBarCodeScanned={({type, data}) => {
          setClientId(data);
          setClientId(data)
        }}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );
}

const Syncing = ({clientId, closeSync}) => {
  useEffect(
    () => {
      // const ws = new WebSocket(`ws://192.168.43.6/${clientId}`);
      // const ws = new WebSocket(`ws://192.168.0.26:3000/ws/${clientId}`);
      const x = `ws://prayer-app.tk/ws/${clientId}`;
      // alert(x);
      const ws = new WebSocket(x);
      // const ws = new WebSocket(`ws://prayer-app.tk/${clientId}`);

      ws.onmessage = function (event) {

        const data = JSON.parse(event.data);

        if (data === 'load') {
          const {prayers, allPrayerIds, favoritePrayerIds} = currentStore();
          const prayersToSend = allPrayerIds.map(id =>
            ({
              ...(prayers[id]),
              favorite: favoritePrayerIds.includes(id)
            })
          );

          ws.send(JSON.stringify(
            prayersToSend
          ))
        } else if (Array.isArray(data)) {
          replaceFromWeb(data);
        }
      };


      // ws.onerror = ({type}) => alert(JSON.stringify(Object.keys(type), null, 2));
      // ws.onerror = ({type}) => alert(type);

      ws.onclose = closeSync;
      return () => ws.close();
    }
  );

  return <Text>Syncing...{clientId}</Text>
}

const PrayerModal = ({closeModal}) => {
  const [prayers, setPrayers] = useState([]);
  useEffect(
    () => {
      getCdnPrayers().then(setPrayers);
      return () => {
      };
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
                    size={32} color="green"/>
          {prayers.length < 1 ?
            <Text>Loading...</Text> :
            <FlatList
              data={prayers}
              renderItem={({item}) => <LoadPrayerItem prayer={item} selectPrayer={() => setSelectedPrayer(item)}/>}
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
              size={32} color="green"/>
    <View
      style={{
        height: '100%',
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <View>
      <Text
        style={{
          fontWeight: 'bold',
          color: 'black',
          fontSize: 24,
          textAlign: 'center',
        }}
      >{name}</Text>
      <Button
        style={{marginVertical: margin}}
        onPress={() =>
          addCdnPrayers(file).then(closeModal())
        }
        title={<LocalText m="AddPrayers" />}
      />
      <Button
        style={{marginVertical: margin}}
        onPress={() =>
          replaceCdnPrayers(file).then(closeModal())
        }
        title={<LocalText m="ReplacePrayers" />}
      />
      <Button
        style={{marginVertical: margin}}
        onPress={closeModal}
        title={<LocalText m="Cancel" />}
      />
    </View>
    </View>
  </View>
)
