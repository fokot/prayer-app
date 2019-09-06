import {
  FlatList,
  Modal,
  Picker,
  ScrollView,
  Slider,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
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
  useStore, useTextColor,
} from "../utils/PrayerStore";
import {Ionicons} from '@expo/vector-icons';
import {RenderSeparator} from "./ListItemsComponents";
import {BarCodeScanner} from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import {blue, blueDark, grey, greyDark, greyLight, white} from "../utils/Colors";
import {LocalText} from "../components/LocalText";
import {AppText} from "../components/AppText";

const margin = 8;
const fontSize = 20;

export const SettingsScreen = () => {
  const { language, darkMode, }  = useStore(s => s.settings);
  const backgroundColor = useBackgroundColor();
  const [showPrayersPicker, setShowPrayersPicker] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const closeModal = () => setShowPrayersPicker(false);
  const textColor = useTextColor();
  return (
    <ScrollView
      style={{
        backgroundColor,
        paddingHorizontal: margin,
      }}
    >
      <View style={{
        marginVertical: margin,
        display: "flex",
        justifyContent: "space-between",
      }}>
        <LocalText style={{fontSize}} m="Language" />
        <Picker
          selectedValue={language}
          style={{color: textColor}}
          itemStyle={{fontSize}}
          onValueChange={setLanguage}>
          <Picker.Item label="English" value={Language.en}/>
          <Picker.Item label="Slovak" value={Language.sk}/>
        </Picker>
      </View>
      <View style={{marginVertical: margin}}>
        <LocalText style={{fontSize}} m={'DarkMode'} />
        <Switch
          thumbColor={darkMode ? blue: grey}
          trackColor={{ true: white, false: greyLight }}
          value={darkMode}
          onValueChange={toggleDarkMode}
        />
      </View>
      <View style={{marginVertical: margin}}>
        <LocalText style={{fontSize}} m="TextSize"/>
        <Slider
          value={5}
          minimumTrackTintColor={blue}
          thumbTintColor={blue}
          minimumValue={3}
          maximumValue={30}
        />
      </View>
      <Button
        style={{marginVertical: 2 * margin}}
        onPress={() => setShowPrayersPicker(true)}
        m="LoadPrayers"
        color="#841584"
      />
      <AppText
        style={{
          marginTop: 2 * margin,
          fontSize,
        }}
      >
        <LocalText
          m="EditStart"
        />
        <AppText style={{fontWeight: "bold"}}>prayer-app.tk</AppText>
        <LocalText m="EditMiddle" />
      </AppText>
      <Button
        onPress={() => setShowSync(true)}
        m="EditInBrowser"
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

  const backgroundColor = useBackgroundColor();
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
    return <AppText>Requesting for camera permission</AppText>;
  }
  if (hasCameraPermission === false) {
    return <AppText>No access to camera</AppText>;
  }

  if (clientId) {
    return <Syncing clientId={clientId} closeSync={closeSync}/>;
  }

  return (
    <View style={{
      backgroundColor,
      height: '100%',
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

  const backgroundColor = useBackgroundColor()
  return (
    <View style={{backgroundColor, height: '100%'}}>
      <AppText>Syncing...{clientId}</AppText>
    </View>
  );
}

const PrayerModal = ({closeModal}) => {
  const [prayers, setPrayers] = useState([]);
  const backgroundColor = useBackgroundColor();
  useEffect(
    () => {
      getCdnPrayers().then(setPrayers);
      return () => {
      };
    }, []
  );
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  return (
    <View style={{backgroundColor, padding: margin, height: '100%'}}>
      {selectedPrayer ?
        <SelectedPrayer prayer={selectedPrayer} closeModal={closeModal}/> :
        <View>
          <Ionicons name="md-close"
                    onPress={closeModal}
                    size={32} color={blue}/>
          {prayers.length < 1 ?
            <AppText>Loading...</AppText> :
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
    <TouchableOpacity
        onPress={selectPrayer}
    >
  <AppText style={{
    padding: 15,
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
  }}
  >{name}</AppText>
    </TouchableOpacity>
);

const SelectedPrayer = ({prayer: {name, file}, closeModal}) => {
  const backgroundColor = useBackgroundColor();
  return (
  <View style={{backgroundColor, height: '100%', width: '100%'}}>
    <Ionicons name="md-close"
              onPress={closeModal}
              size={32} color={blue}/>
    <View
      style={{
        height: '100%',
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
      }}
    >
      <View
        style={{width: '100%'}}
      >
      <AppText
        style={{
          fontWeight: 'bold',
          fontSize: 24,
          textAlign: 'center',
        }}
      >{name}</AppText>
      <Button
        style={{marginVertical: margin, width: '100%'}}
        onPress={() =>
          addCdnPrayers(file).then(closeModal())
        }
        m="AddPrayers"
      />
      <Button
        style={{marginVertical: margin}}
        onPress={() =>
          replaceCdnPrayers(file).then(closeModal())
        }
        m="ReplacePrayers"
      />
      <Button
        style={{marginVertical: margin}}
        onPress={closeModal}
        m="Cancel"
      />
    </View>
    </View>
  </View>
)}
