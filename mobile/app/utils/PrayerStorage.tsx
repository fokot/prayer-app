import {AsyncStorage} from 'react-native';

const newPrayerId = async () => {
  const AllPrayerIds = await getAllPrayerIds();
  const ids = AllPrayerIds.map(x => parseInt(x.substr(2), 10))
  const maximum = Math.max(...ids) || 0;
  return `P:${maximum+1}`;
};

export const getAllPrayerIds = () => AsyncStorage.getItem('AllPrayerIds').then(JSON.parse).then(
  ids => ids || []
);

export const setAllPrayerIds = (ids) =>
  AsyncStorage.setItem('AllPrayerIds', JSON.stringify(ids));

export const getPrayer = (id) => AsyncStorage.getItem(id).then(JSON.parse);

export const getAllPrayers = () =>
  getAllPrayerIds()
    .then(ids => AsyncStorage.multiGet(ids))
    .then(x => x.map(p => JSON.parse(p[1])));

export const getFavoritePrayerIds = () =>
  AsyncStorage.getItem('FavoritesPrayerIds').then(JSON.parse).then(
    ids => ids || []
  );

export const setFavoritePrayerIds = (ids) =>
  AsyncStorage.setItem('FavoritesPrayerIds', JSON.stringify(ids));

export const getFavoritePrayers = () =>
  getFavoritePrayerIds()
    .then(ids => AsyncStorage.multiGet(ids))
    .then(x => x.map(p => JSON.parse(p[1])));

export const toggleFavorite = async (id) => {
  const FavoritesPrayerIds = await getFavoritePrayerIds();
  const NewFavoritesPrayerIds = FavoritesPrayerIds.includes(id) ?
    FavoritesPrayerIds.filter(x => x != id) : [...FavoritesPrayerIds, id];
  return await AsyncStorage.setItem('FavoritesPrayerIds', JSON.stringify(NewFavoritesPrayerIds));
};

export const storePrayer = async (prayer) => {
  await AsyncStorage.setItem(prayer.id, JSON.stringify(prayer));
  const AllPrayerIds = await getAllPrayerIds();
  return await AsyncStorage.setItem('AllPrayerIds', JSON.stringify([...AllPrayerIds, prayer.id]));
};

export const storeEveryting = async (prayers) => {
  const prayerIds = prayers.map(p => p.id);
  await AsyncStorage.multiSet(prayers.map(p => [p.id, JSON.stringify(p)]));
  await AsyncStorage.setItem('AllPrayerIds', JSON.stringify(prayerIds));
  return  await AsyncStorage.setItem('FavoritesPrayerIds', JSON.stringify([]));
}
