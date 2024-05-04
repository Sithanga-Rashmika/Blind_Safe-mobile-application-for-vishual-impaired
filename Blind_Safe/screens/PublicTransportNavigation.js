import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, TextInput, Image } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import * as Location from "expo-location";

const PublicTransportNavigation = () => {
  const [stage, setStage] = useState(0);
  const [destination, setDestination] = useState("");
  const [transportMethod, setTransportMethod] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  useEffect(() => {
    setWaitingForInput(true);
  }, []);

  const handleDestinationInput = (text) => {
    setDestination(text);
  };

  const handleTransportMethodInput = (text) => {
    setTransportMethod(text);
  };

  const handleSubmit = () => {
    if (stage === 0 && destination.trim() !== "") {
      setStage(1);
      return;
    }
    if (stage === 1 && transportMethod.trim() !== "") {
      setWaitingForInput(false);
      setStage(2);
      getDirections(transportMethod);
      return;
    }
  };

  const getDirections = (transport) => {
    // Make API call to Google Directions API
    // Update coordinates state with the polyline coordinates from the response
  };

  return (
    <View style={styles.container}>
      {stage === 0 && (
        <>
          <Text style={styles.text}>Where do you want to go?</Text>
          <TextInput
            style={styles.input}
            onChangeText={handleDestinationInput}
            value={destination}
            placeholder="Enter destination"
          />
        </>
      )}
      {stage === 1 && (
        <>
          <Text style={styles.text}>
            What is your preferred transport method? (e.g., bus, train)
          </Text>
          <TextInput
            style={styles.input}
            onChangeText={handleTransportMethodInput}
            value={transportMethod}
            placeholder="Enter transport method"
          />
        </>
      )}
      {stage === 2 && (
        <>
          {/* App logo */}
          <Image
            source={require("../assets/blindSafeLogo.png")}
            style={styles.appLogo}
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
          >
            <Marker
              coordinate={{
                latitude: location?.latitude,
                longitude: location?.longitude,
              }}
            >
              <Image
                source={require("../assets/user.png")}
                style={{ width: 40, height: 40 }}
              />
            </Marker>
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
      {waitingForInput && (
        <Text style={styles.text}>Waiting for your input...</Text>
      )}
      <Button title="Submit" onPress={handleSubmit} />
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
  input: {
    height: 40,
    width: 200,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  map: {
    flex: 1,
    width: "100%",
  },
  header: {
    padding: 10,
    width: "100%",
    height: 100,
    top: 30,
  },
  appLogo: {
    width: 200,
    height: 30,
    marginTop: 50,
    marginBottom: 20,
  },
});

export default PublicTransportNavigation;
