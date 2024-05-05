import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import MapViewStyle from "../utils/map-config.json";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import Voice from "@react-native-voice/voice";
import * as Speech from "expo-speech";
import MapViewDirections from 'react-native-maps-directions';


const PublicTransportNavigation = () => {
  const [stage, setStage] = useState(2);
  const [destination, setDestination] = useState("");
  const [transportMethod, setTransportMethod] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [location, setLocation] = useState(null);
  const [searchedLocation, setSearchedLocation] = useState(null);
  const dest = {latitude: 7.290572, longitude: 80.633728};
  const GOOGLE_MAPS_APIKEY = "AIzaSyD411Sx1eEwFu6XdwaW0Hv50uzk78sU1LQ"
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    })();
  }, []);

  useEffect(() => {
    if (stage === 0 || stage === 1) {
      handleSpeechInput(
        stage === 0
          ? "Where do you want to go?"
          : "What is your preferred transport method?"
      );
    }
  }, [stage]);

  const handleSpeechInput = async (question) => {
    try {
      await Speech.speak(question, { language: "en" });
      await Voice.start("en-US");
      Voice.onSpeechResults = onSpeechResults;
      setWaitingForInput(true);
    } catch (error) {
      console.error(error);
    }
  };

  const onSpeechResults = (event) => {
    const result = event.value[0];
    if (stage === 0) {
      setDestination(result);
      setStage(1);
    } else if (stage === 1) {
      setTransportMethod(result);
      setStage(2);
    }
    Voice.stop();
    setWaitingForInput(false);
  };

  const handleSubmit = () => {
    // Handle submission if needed
  };

  return (
    <View style={styles.container}>
      {(stage === 0 || stage === 1) && (
        <Image
          source={require("../assets/blindSafeLogo.png")}
          style={styles.appLogo}
        />
      )}
      {stage === 2 && (
        <Image
          source={require("../assets/blindSafeLogo.png")}
          style={styles.appHeader}
        />
      )}
      {waitingForInput && <ActivityIndicator size="large" color="#0000ff" />}
      {stage === 2 && (
        <>
          <GooglePlacesAutocomplete
            styles={{
              container: {
                flex: 0,
                width: "100%",
                top: 0,
                paddingHorizontal: 10,
              },
            }}
            enablePoweredByContainer={false}
            placeholder="Search"
            onPress={(data, details = null) => {
              console.log(data);
              if (details && details.geometry && details.geometry.location) {
                const latitude = details.geometry.location.lat;
                const longitude = details.geometry.location.lng;
                setSearchedLocation({ latitude, longitude });
              }
            }}
            query={{
              key: "AIzaSyD411Sx1eEwFu6XdwaW0Hv50uzk78sU1LQ",
              language: "en",
            }}
          />
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            location={location}
            region={{
              latitude: location?.latitude,
              longitude: location?.longitude,
              latitudeDelta: 0.0422,
              longitudeDelta: 0.0421,
            }}
            initialRegion={{
              latitude: location?.latitude,
              longitude: location?.longitude,
              latitudeDelta: 0.0422,
              longitudeDelta: 0.0421,
            }}
            customMapStyle={MapViewStyle}
          >
            <MapViewDirections
              origin={location}
              destination={dest}
              apikey="AIzaSyD411Sx1eEwFu6XdwaW0Hv50uzk78sU1LQ"
            />
            <Marker
              coordinate={{
                latitude: location?.latitude,
                longitude: location?.longitude,
              }}
            />
            {searchedLocation && (
              <Marker
                coordinate={{
                  latitude: searchedLocation.latitude,
                  longitude: searchedLocation.longitude,
                }}
              />
            )}
            {coordinates.length > 0 && (
              <Polyline
                coordinates={coordinates}
                strokeColor="#000"
                strokeWidth={6}
              />
            )}
          </MapView>

          <Text style={styles.text}>Destination: {destination}</Text>
          <Text style={styles.text}>Transport Method: {transportMethod}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 20,
    marginBottom: 10,
  },
  map: {
    flex: 1,
    width: "100%",
  },
  appHeader: {
    width: 200,
    height: 30,
    marginTop: 50,
    marginBottom: 20,
  },
  appLogo: {
    width: 200,
    height: 30,
    position: "absolute",
    top: 50,
  },
});

export default PublicTransportNavigation;
