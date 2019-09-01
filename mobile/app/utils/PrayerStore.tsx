import {AsyncStorage} from 'react-native';
import prayers, {Prayer, PrayerFull} from "./Prayers";
import {append, assoc, concat, dissoc, fromPairs, mergeDeepRight, without, toPairs} from "ramda";
import {createStore} from "./Store";
import uuid from 'uuid/v1';


// database keys
const ALL_PRAYER_IDS = 'ALL_PRAYER_IDS';
const FAVORITE_PRAYER_IDS = 'FAVORITE_PRAYER_IDS';
const SETTINGS = 'SETTINGS';

// database functions

const dbGetAllPrayerIds = () => AsyncStorage.getItem(ALL_PRAYER_IDS).then(JSON.parse).then(
  ids => ids || []
);


const dbSetAllPrayerIds = (ids) =>
  AsyncStorage.setItem(ALL_PRAYER_IDS, JSON.stringify(ids));

const dbGetFavoritePrayerIds = () =>
  AsyncStorage.getItem(FAVORITE_PRAYER_IDS).then(JSON.parse).then(
    ids => ids || []
  );

const dbSetFavoritePrayerIds = (ids) =>
  AsyncStorage.setItem(FAVORITE_PRAYER_IDS, JSON.stringify(ids));

const dbSavePrayer = (prayer) =>
  AsyncStorage.setItem(prayer.id, JSON.stringify(prayer));

const dbSavePrayers = (prayerPairs) =>
  AsyncStorage.multiSet(prayerPairs.map(p => [p[0], JSON.stringify(p[1])]));

const dbDeletePrayers = (ids) =>
  AsyncStorage.multiRemove(ids);

const dbDeletePrayer = (id) =>
  AsyncStorage.removeItem(id);

// export const storeEveryting = async (prayers) => {
//   const prayerIds = prayers.map(p => p.id);
//   await AsyncStorage.multiSet(prayers.map(p => [p.id, JSON.stringify(p)]));
//   await AsyncStorage.setItem('AllPrayerIds', JSON.stringify(prayerIds));
//   return  await AsyncStorage.setItem('FavoritesPrayerIds', JSON.stringify([]));
// }

type StoreType = {
  settings: {
    darkMode: false
  },
  prayers: {[index: string]: Prayer},
  allPrayerIds: string[],
  favoritePrayerIds: string[],
}

const initialStore: StoreType = {
  settings: {
    darkMode: false
  },
  prayers: {},
  allPrayerIds: [],
  favoritePrayerIds: [],
};

// create store
const { updateStore, useStore, currentStore } = createStore(initialStore);
export { useStore, currentStore };

const readAllData = async (): Promise<StoreType> => {
  const settings = await AsyncStorage.getItem(SETTINGS).then(JSON.parse) || {darkMode: false};
  const allPrayerIds = await dbGetAllPrayerIds();
  const favoritePrayerIds = await AsyncStorage.getItem(FAVORITE_PRAYER_IDS).then(JSON.parse) || [];
  const prayers = await AsyncStorage.multiGet(allPrayerIds).then(x => x.map(p => JSON.parse(p[1])));

  return {
    settings,
    allPrayerIds,
    favoritePrayerIds,
    prayers: fromPairs(prayers.map(p => [p.id, p])),
  };
};

// read store from database
readAllData().then(
  storeFromDb => updateStore(() => storeFromDb)
);


// exported functions which update reactive store as well as database

const updateStoreMerge = (value: any): StoreType => updateStore(s => mergeDeepRight(s, value));

export const toggleDarkMode = (value: boolean) => {
  updateStoreMerge({settings: { darkMode: value }});
}

export const useBackgroundColor = () => useStore(s => s.settings.darkMode) ? '#181818' : 'white';

export const useTextColor = () => useStore(s => s.settings.darkMode) ? 'white' : 'black';

export const reorderAllPrayers = async (prayers: Prayer[]) => {
  const store = updateStoreMerge( { allPrayerIds: prayers.map(p => p.id) });
  await dbSetAllPrayerIds(store.allPrayerIds);
}

export const reorderFavoritePrayers = async (prayers: Prayer[]) => {
  const store = updateStoreMerge( { favoritePrayerIds: prayers.map(p => p.id) });
  await dbSetFavoritePrayerIds(store.favoritePrayerIds);
}

export const useAllPrayers = (): PrayerFull[] => useStore(s => s.allPrayerIds.map(id => ({...s.prayers[id], favorite: s.favoritePrayerIds.includes(id)})))

export const toggleFavorite = async (id) => {
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
      allPrayerIds: s.allPrayerIds.includes(prayer.id) ? s.allPrayerIds : append(prayer.id, s.allPrayerIds),
    })
  );
  await dbSavePrayer(prayer);
  await dbSetAllPrayerIds(store.allPrayerIds);
};

export const useFavoritePrayerIds = () => useStore(s => s.favoritePrayerIds);

export const usePrayer = (id: string): PrayerFull => useStore(s => ({...s.prayers[id], favorite: s.favoritePrayerIds.includes(id)}));

export const useFavoritePrayers = () => useStore(s => s.favoritePrayerIds.map(id => ({...s.prayers[id], favorite: true})))


// NETWORK

const STORAGE_PATH = 'https://storage.googleapis.com/prayers/';

export const getCdnPrayers = () =>
  fetch(`${STORAGE_PATH}all.json`).then(x => x.json());

const loadCdnPrayers = (fileName) =>
  fetch(`${STORAGE_PATH}${fileName}`).then(x => x.json());

export const addCdnPrayers = async (fileName) => {
  const prayers = await loadCdnPrayers(fileName);
  const toPair = (p) => {
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

const replacePrayers = async (prayers, favoritePrayerIds) => {
  const idsToDelete = currentStore().allPrayerIds;
  const pairs = prayers.map(p => [p.id, p]);
  const store = updateStore(
    s => ({
      ...s,
      prayers: fromPairs(pairs),
      allPrayerIds: prayers.map(p => p.id),
      favoritePrayerIds,
    })
  );
  await dbDeletePrayers(idsToDelete);
  await dbSavePrayers(pairs);
  await dbSetAllPrayerIds(store.allPrayerIds);
  await dbSetFavoritePrayerIds(favoritePrayerIds);
};

export const replaceCdnPrayers = async (fileName) => {
  const prayersFromCdn = await loadCdnPrayers(fileName);
  const prayers = prayersFromCdn.map(p => ({...p, id: uuid()}));
  await replacePrayers(prayers, []);
};

export const replaceFromWeb = async (prayersFromWeb) => {
  const prayers = prayersFromWeb.map(({favorite, ...p}) => p);
  const favoritePrayerIds = prayersFromWeb.filter(p => p.favorite).map(p => p.id);
  await replacePrayers(prayers, favoritePrayerIds);
};

