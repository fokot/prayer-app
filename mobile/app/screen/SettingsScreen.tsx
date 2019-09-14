import {
  FlatList,
  Modal,
  Picker,
  ScrollView,
  Slider,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View
} from "react-native";
import { Button } from "../components/Button";
import React, {useEffect, useState} from "react";
import {
  addCdnPrayers,
  currentStore,
  getCdnPrayers, NavigationProps,
  replaceCdnPrayers,
  replaceFromWeb, setFontSize, setLanguage,
  toggleDarkMode, updateLastTabListener,
  useSettings, useTextColor,
} from "../utils/PrayerStore";
import {Ionicons} from '@expo/vector-icons';
import {RenderSeparator} from "./ListItemsComponents";
import {BarCodeScanner} from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import {blue, grey, greyLight, white} from "../utils/Colors";
import {LocalText} from "../components/LocalText";
import {AppText} from "../components/AppText";
import {Background} from "../components/Background";
import version from "../version.json";

const margin = 8;

type PrayerList = {
  name: string,
  file: string,
}

type CloseType = () => void;

export const SettingsScreen = ({navigation}: NavigationProps) => {
  updateLastTabListener(navigation, 'Settings');
  const { language, darkMode, fontSize, }  = useSettings();
  const [showPrayersPicker, setShowPrayersPicker] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const closeModal = () => setShowPrayersPicker(false);
  const textColor = useTextColor();
  return (
    <Background>
      <ScrollView
        style={{
          paddingHorizontal: margin,
        }}
      >
        <View style={{
          marginVertical: margin,
          display: "flex",
          justifyContent: "space-between",
        }}>
          <LocalText m="Language" />
          <Picker
            selectedValue={language}
            style={
              // @ts-ignore this really works in android
              {color: textColor}
            }
            itemStyle={{fontSize}}
            onValueChange={setLanguage}>
            <Picker.Item label="English" value="en"/>
            <Picker.Item label="Slovak" value="sk"/>
          </Picker>
        </View>
        <View style={{marginVertical: margin}}>
          <LocalText m={'DarkMode'} />
          <Switch
            thumbColor={darkMode ? blue: grey}
            trackColor={{ true: white, false: greyLight }}
            value={darkMode}
            onValueChange={toggleDarkMode}
          />
        </View>
        <View style={{marginVertical: margin}}>
          <LocalText m="TextSize"/>
          <Slider
            value={fontSize}
            onValueChange={setFontSize}
            minimumTrackTintColor={blue}
            thumbTintColor={blue}
            minimumValue={10}
            maximumValue={30}
          />
        </View>
        <Button
          style={{marginVertical: 2 * margin}}
          onPress={() => setShowPrayersPicker(true)}
          m="LoadPrayers"
        />
        <AppText
          style={{
            marginTop: 2 * margin,
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
        />
        <LocalText m="EditEnd" />
        <AppText
          style={{
            marginTop: 8 * margin,
          }}
        >Version: {version}</AppText>
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
    </Background>
  )
};

const Sync = ({closeSync}: {closeSync: CloseType}) => {
  const [clientId, setClientId] = useState<string | null>(null);
  const [hasCameraPermission, setCameraPermission] = useState<boolean | null>(null);

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
    return (
      <Background>
        <AppText>Requesting for camera permission</AppText>
      </Background>
    );
  }
  if (hasCameraPermission === false) {
    return (
      <Background>
        <AppText>No access to camera</AppText>
      </Background>
    );
  }

  if (clientId) {
    return <Syncing clientId={clientId} closeSync={closeSync}/>;
  }

  return (
    <Background style={{
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-end',
    }}>
      <BarCodeScanner
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
        onBarCodeScanned={({data}) =>
          setClientId(data)
        }
        style={StyleSheet.absoluteFillObject}
      />
    </Background>
  );
}

const Syncing = ({clientId, closeSync}: {clientId: string, closeSync: CloseType}) => {
  useEffect(
    () => {
      // const ws = new WebSocket(`ws://192.168.43.6/${clientId}`);
      // const ws = new WebSocket(`ws://192.168.0.26:3000/ws/${clientId}`);
      const x = `wss://prayer-app.tk/ws/${clientId}`;
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

  return (
    <Background>
      <AppText>Syncing ({clientId}) ...</AppText>
    </Background>
  );
}

const PrayerModal = ({closeModal}: {closeModal: CloseType}) => {
  const [prayers, setPrayers] = useState([]);
  useEffect(
    () => {
      getCdnPrayers().then(setPrayers);
      return () => {
      };
    }, []
  );
  const [selectedPrayerList, setSelectedPrayerList] = useState(null);
  return (
    <Background style={{padding: margin}}>
      {selectedPrayerList ?
        <SelectedPrayerList prayerList={selectedPrayerList!} closeModal={closeModal}/> :
        <View>
          <Ionicons name="md-close"
                    onPress={closeModal}
                    size={32} color={blue}/>
          {prayers.length < 1 ?
            <AppText>Loading...</AppText> :
            <FlatList
              data={prayers}
              renderItem={({item}) => <LoadPrayerItem prayerList={item} selectPrayer={() => setSelectedPrayerList(item)}/>}
              keyExtractor={(item, index) => index.toString()}
              ItemSeparatorComponent={RenderSeparator}
            />
          }
        </View>
      }
    </Background>
  );
}

const LoadPrayerItem = ({prayerList: {name}, selectPrayer}: {prayerList: PrayerList, selectPrayer: () => void}) => (
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

const SelectedPrayerList = ({prayerList: {name, file}, closeModal}: {prayerList: PrayerList, closeModal: CloseType}) => (
  <Background style={{width: '100%'}}>
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
          addCdnPrayers(file).then(closeModal)
        }
        m="AddPrayers"
      />
      <Button
        style={{marginVertical: margin}}
        onPress={() =>
          replaceCdnPrayers(file).then(closeModal)
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
  </Background>
);
