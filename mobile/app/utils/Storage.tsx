import React, {Component, useEffect, useState} from "react";
import { assoc, append, dissoc, equals, forEach, fromPairs, mergeDeepRight, without } from 'ramda';
import prayers, {NEW_ID, Prayer, PrayerFull} from "./Prayers";

const createStore = <S,>(initialStore: S) => {

  let store = initialStore;

  let listeners: ((store: S) => void)[] = [];

  return ({
    updateStore: (f: (store: S) => S): void => {
      store = f(store)
      forEach(f => f(store), listeners);
    },
    // withStore: <P,>(WrappedComponent: React.ComponentType<P>, connect: (state: S) => P) => {
    //
    //     type StateFullComponentProps = { connectedProps: P};
    //
    //     return class StateFullComponent extends Component<P, StateFullComponentProps> {
    //
    //       listener: (store: S) => void = () => null;
    //
    //       constructor(props: P) {
    //         super(props);
    //         this.listener = this.setAndDiffState.bind(this);
    //         listeners = append(this.listener, listeners)
    //       }
    //
    //       componentWillUnmount(): void {
    //         listeners = without([this.listener], listeners)
    //       }
    //
    //       state = { connectedProps: connect(store) }
    //
    //       setAndDiffState = (newStore: S) => {
    //         const newProps = connect(newStore);
    //         if(!equals(this.state.connectedProps, newProps))
    //           this.setState({ connectedProps: newProps })
    //       }
    //
    //       render() {
    //         return (<WrappedComponent {...this.state.connectedProps} />);
    //       }
    //     }
    //   },
    useStore: <P,>(connect: (state: S) => P) => {
      const [state, setState] = useState(connect(store));
      const listener = (newStore: S) => {
        const newProps = connect(newStore);
        if(!equals(state, newProps))
          setState(newProps);
      }
      useEffect(
        () => () => {
            listeners = without([listener], listeners);
          }
      );
      listeners = append(listener, listeners);
      return state;
    }
  })
};

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
  prayers: fromPairs(prayers.map(p => [p.id, p])),
  allPrayerIds: prayers.map(p => p.id),
  favoritePrayerIds: [],
};

const { updateStore, withStore, useStore } = createStore(initialStore);

const updateStoreMerge = (value: any) => updateStore(s => mergeDeepRight(s, value));

export const toggleDarkMode = (value: boolean) => {
  updateStoreMerge({settings: { darkMode: value }});
}

export { withStore, useStore };

export const useBackgroundColor = () => useStore(s => s.settings.darkMode) ? '#181818' : 'white';

export const useTextColor = () => useStore(s => s.settings.darkMode) ? 'white' : 'black';

export const reorderAllPrayers = (prayers) =>
  updateStoreMerge( { allPrayerIds: prayers.map(p => p.id) });

export const reorderFavoritePrayers = (prayers) =>
  updateStoreMerge( { favoritePrayerIds: prayers.map(p => p.id) });

export const useAllPrayers = (): PrayerFull[] => useStore(s => s.allPrayerIds.map(id => ({...s.prayers[id], favorite: s.favoritePrayerIds.includes(id)})))

export const toggleFavorite = (id) => {
  updateStore(s =>
    ({...s, favoritePrayerIds: s.favoritePrayerIds.includes(id) ?
        without([id], s.favoritePrayerIds) : append(id, s.favoritePrayerIds)})
  );
};

export const deletePrayer = (prayer: Prayer) =>
  updateStore(
    s => ({
      ...s,
      prayers: dissoc(prayer.id, s.prayers),
      allPrayerIds: without([prayer.id], s.allPrayerIds),
      favoritePrayerIds: without([prayer.id], s.favoritePrayerIds),
    })
  );

export const savePrayer = (prayer: Prayer) =>
  updateStore(
    s => ({
      ...s,
      prayers: assoc(prayer.id, prayer, s.prayers),
      allPrayerIds: s.allPrayerIds.includes(prayer.id) ? s.allPrayerIds : append(prayer.id, s.allPrayerIds),
    })
  );

export const useFavoritePrayerIds = () => useStore(s => s.favoritePrayerIds);

export const usePrayer = (id: string): PrayerFull => useStore(s => ({...s.prayers[id], favorite: s.favoritePrayerIds.includes(id)}));

export const useFavoritePrayers = () => useStore(s => s.favoritePrayerIds.map(id => ({...s.prayers[id], favorite: true})))



