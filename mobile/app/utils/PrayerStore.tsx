import {AsyncStorage} from 'react-native';
import {append, assoc, concat, dissoc, fromPairs, mergeDeepRight, without, pick, prepend, toPairs} from "ramda";
import {createStore} from "./Store";
import uuid from 'uuid/v1';
import {useEffect} from "react";
import {NavigationParams, NavigationScreenProp, NavigationState} from "react-navigation";
import { Pick } from 'ts-toolbelt/out/types/src/Object/_api';
import {T} from "ts-toolbelt";

// types
type ID = string;

export interface Prayer {
  id: ID,
  name: string,
  text: string,
}

export interface PrayerFull extends Prayer {
  favorite: boolean,
}

export type TabName = 'All' | 'Favorite' | 'Settings';

export type Language = 'en' | 'sk';

export type Navigation = NavigationScreenProp<NavigationState, NavigationParams>;
export type NavigationProps = { navigation: Navigation };

// database keys
const ALL_PRAYER_IDS = 'ALL_PRAYER_IDS';
const FAVORITE_PRAYER_IDS = 'FAVORITE_PRAYER_IDS';
const SETTINGS = 'SETTINGS';
const LAST_TAB = 'LAST_TAB';

// database functions

const getAndParse = <A,>(key: string, defaultVal: A): Promise<A> =>
  (AsyncStorage.getItem(key).then(x => x ? JSON.parse(x) : defaultVal)) as Promise<A>;

const dbGetAllPrayerIds = () => getAndParse<Array<ID>>(ALL_PRAYER_IDS, []);

const dbSetAllPrayerIds = (ids: Array<ID>) =>
  AsyncStorage.setItem(ALL_PRAYER_IDS, JSON.stringify(ids));

const dbSetFavoritePrayerIds = (ids: Array<ID>) =>
  AsyncStorage.setItem(FAVORITE_PRAYER_IDS, JSON.stringify(ids));

const dbSavePrayer = (prayer: Prayer) =>
  AsyncStorage.setItem(prayer.id, JSON.stringify(prayer));

const dbSavePrayers = (prayerPairs: Array<[string, Prayer]>) =>
  AsyncStorage.multiSet(prayerPairs.map(p => [p[0], JSON.stringify(p[1])]));

const dbDeletePrayers = (ids: Array<ID>) =>
  AsyncStorage.multiRemove(ids);

const dbDeletePrayer = (id: ID) =>
  AsyncStorage.removeItem(id);

type StoreType = {
  initialised: boolean,
  lastTab: TabName,
  settings: {
    language: Language,
    darkMode: boolean,
    fontSize: number,
  },
  prayers: {[index: ID]: Prayer},
  allPrayerIds: ID[],
  favoritePrayerIds: ID[],
}

type SettingsType = StoreType['settings'];

const initialStore: StoreType = {
  initialised: false,
  lastTab: 'Settings',
  settings: {
    darkMode: false,
    language: 'en',
    fontSize: 16,
  },
  prayers: {},
  allPrayerIds: [],
  favoritePrayerIds: [],
};

// create store
const { updateStore, useStore, currentStore } = createStore(initialStore);
export { useStore, currentStore };

const readAllData = async (): Promise<StoreType> => {
  const lastTab = await AsyncStorage.getItem(LAST_TAB) as TabName || 'Settings';
  const settings = await getAndParse<SettingsType>(SETTINGS,
    {language: 'en', darkMode: false, fontSize: 16}
  );
  const allPrayerIds = await dbGetAllPrayerIds();
  const favoritePrayerIds = await getAndParse<Array<ID>>(FAVORITE_PRAYER_IDS, []);
  const prayers = await AsyncStorage.multiGet(allPrayerIds).then(x => x.map(p => JSON.parse(p[1])));
  return {
    initialised: true,
    lastTab,
    settings,
    allPrayerIds,
    favoritePrayerIds,
    prayers: fromPairs(prayers.map(p => [p.id, p])),
  };
};

export const useInitialised = () => useStore(s => s.initialised);

// read store from database
readAllData().then(
  storeFromDb => updateStore(() => storeFromDb)
);


// exported functions which update reactive store as well as database


type PartialAll<T> = T extends object ? { [K in keyof T]?: PartialAll<T[K]> } : T;

const updateStoreMerge = (value: PartialAll<StoreType>): StoreType => updateStore(s =>
  mergeDeepRight(s, value) as StoreType
);

const updateSettings = async (f: (arg: SettingsType) => SettingsType) => {
  const store = updateStore(s =>
    ({...s, settings: f(s.settings)})
  );
  await AsyncStorage.setItem(SETTINGS, JSON.stringify(store.settings));
};

/* no need to update it in store, just in db */
const updateLastTab = (lastTab: TabName) =>
  AsyncStorage.setItem(LAST_TAB, lastTab);

export const updateLastTabListener = (navigation: Navigation, tabName: TabName) => useEffect(
  () => {
    const focusListener = navigation.addListener('didFocus',
      () => updateLastTab(tabName)
    );
    return () => focusListener.remove();
  }
);

export const toggleDarkMode = (value: boolean) =>
  updateSettings(s => ({...s, darkMode: value }));

export const setLanguage = async (language: Language) =>
  updateSettings(s => ({...s, language }));

export const setFontSize = async (fontSize: number) =>
  updateSettings(s => ({...s, fontSize}));

export const useBackgroundColor = () => useStore(s => s.settings.darkMode) ? '#181818' : 'white';

export const textColor = (darkMode: boolean) => darkMode ? 'white' : 'black';

export const useTextColor = () => textColor(useStore(s => s.settings.darkMode));

export const useSettings = () => useStore(s => s.settings);

export const reorderAllPrayers = async (prayers: readonly PrayerFull[] | null) => {
  const store = updateStoreMerge( { allPrayerIds: (prayers || []).map(p => p.id) });
  await dbSetAllPrayerIds(store.allPrayerIds);
}

export const reorderFavoritePrayers = async (prayers: readonly PrayerFull[] | null) => {
  const store = updateStoreMerge( { favoritePrayerIds: (prayers || []).map(p => p.id) });
  await dbSetFavoritePrayerIds(store.favoritePrayerIds);
}

export const useAllPrayers = (): PrayerFull[] => useStore(s => s.allPrayerIds.map(id => ({...s.prayers[id], favorite: s.favoritePrayerIds.includes(id)})))

export const toggleFavorite = async (id: ID) => {
  const store = updateStore(s =>
    ({...s, favoritePrayerIds: s.favoritePrayerIds.includes(id) ?
        without([id], s.favoritePrayerIds) : append(id, s.favoritePrayerIds)})
  );
  await dbSetFavoritePrayerIds(store.favoritePrayerIds);
};

export const deletePrayer = async (prayer: Prayer) => {
  const store = updateStore(
    s => ({
      ...s,
      prayers: dissoc(prayer.id, s.prayers),
      allPrayerIds: without([prayer.id], s.allPrayerIds),
      favoritePrayerIds: without([prayer.id], s.favoritePrayerIds),
    })
  );
  await dbSetAllPrayerIds(store.allPrayerIds);
  await dbSetFavoritePrayerIds(store.favoritePrayerIds);
  await dbDeletePrayer(prayer.id)
}

export const savePrayer = async (prayer: Prayer) => {
  const store = updateStore(
    s => ({
      ...s,
      prayers: assoc(prayer.id, prayer, s.prayers),
      allPrayerIds: s.allPrayerIds.includes(prayer.id) ? s.allPrayerIds : prepend(prayer.id, s.allPrayerIds),
    })
  );
  await dbSavePrayer(prayer);
  await dbSetAllPrayerIds(store.allPrayerIds);
};

export const useFavoritePrayerIds = () => useStore(s => s.favoritePrayerIds);

export const usePrayer = (id: string): PrayerFull => useStore(s => ({...s.prayers[id], favorite: s.favoritePrayerIds.includes(id)}));

export const useFavoritePrayers = () => useStore(s => s.favoritePrayerIds.map(id => ({...s.prayers[id], favorite: true})))


// NETWORK

const STORAGE_PATH = 'https://storage.googleapis.com/prayer-app/prayers/';

export const getCdnPrayers = () =>
  fetch(`${STORAGE_PATH}all.json`).then(x => x.json());

const loadCdnPrayers = (fileName: string): Promise<Array<{name: string, text: string}>> =>
  fetch(`${STORAGE_PATH}${fileName}`).then(x => x.json());

export const addCdnPrayers = async (fileName: string) => {
  const prayers = await loadCdnPrayers(fileName);
  const toPair = <A,>(p: A): [string, A & {id: string}] => {
    const id = uuid();
    return [id, ({...p, id})];
  };
  const pairs = prayers.map(toPair);
  const store = updateStore(
    s => ({
      ...s,
      prayers: fromPairs(concat(toPairs(s.prayers), pairs)),
      allPrayerIds: concat(s.allPrayerIds, pairs.map(p => p[0])),
    })
  );
  await dbSavePrayers(pairs);
  await dbSetAllPrayerIds(store.allPrayerIds);
};

const replacePrayers = async (prayers: Array<Prayer>, favoritePrayerIds: Array<ID>) => {
  // do not delete favorite prayers
  const existingFavoritePrayerIds = currentStore().favoritePrayerIds;
  const idsToDelete = without(existingFavoritePrayerIds, currentStore().allPrayerIds);
  const pairs: Array<[string, Prayer]> = prayers.map(p => [p.id, p]);
  const store = updateStore(
    s => ({
      ...s,
      prayers:
        fromPairs(
        concat(
          toPairs(pick(existingFavoritePrayerIds, s.prayers)),
          pairs
        )),
      allPrayerIds: concat(existingFavoritePrayerIds, prayers.map(p => p.id)),
      favoritePrayerIds: concat(existingFavoritePrayerIds, favoritePrayerIds),
    })
  );
  await dbDeletePrayers(idsToDelete);
  await dbSavePrayers(pairs);
  await dbSetAllPrayerIds(store.allPrayerIds);
  await dbSetFavoritePrayerIds(store.favoritePrayerIds);
};

export const replaceCdnPrayers = async (fileName: string) => {
  const prayersFromCdn = await loadCdnPrayers(fileName);
  const prayers = prayersFromCdn.map(p => ({...p, id: uuid()}));
  await replacePrayers(prayers, []);
};

export const replaceFromWeb = async (prayersFromWeb: Array<PrayerFull>) => {
  const prayers = prayersFromWeb.map(({favorite, ...p}) => p);
  const favoritePrayerIds = prayersFromWeb.filter(p => p.favorite).map(p => p.id);
  await replacePrayers(prayers, favoritePrayerIds);
};

const translationGetters = {
  // lazy requires (metro bundler does not support symlinks)
  en: () => require("../../assets/translations/en.json"),
  sk: () => require("../../assets/translations/sk.json"),
};

export const useMessages = () =>
  useStore(s => translationGetters[s.settings.language]());
