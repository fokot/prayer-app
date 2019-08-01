import React from 'react';
import Main from './app/Main';
import {storeEveryting, getAllPrayerIds} from "./app/utils/PrayerStorage";
import prayers from "./app/utils/Prayers";


export default class App extends React.Component {

  async newPrayers() {
    const ids = await getAllPrayerIds();
    if(ids.length < 1)
      storeEveryting(prayers);
  }

  componentDidMount(): void {
    this.newPrayers();
  }

  render() {
    return <Main/>;
  }
}
