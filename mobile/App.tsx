import React from 'react';
import {useInitialised} from "./app/utils/PrayerStore";
import {ActivityIndicator} from "react-native";
import {blue} from "./app/utils/Colors";
// import {Main} from "./app/Main";

export default function () {
    const initialised = useInitialised();
    if(initialised) {
        // require because in `const Home` we read current store
        const { Main } = require('./app/Main');
        return <Main />;
    }
    return <ActivityIndicator size="large" color={blue} />;
}

