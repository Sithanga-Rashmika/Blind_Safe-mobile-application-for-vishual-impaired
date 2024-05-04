import React, { useRef, useEffect, useState } from "react";
import { View, Image, StyleSheet, Text } from "react-native";
import { DeprecatedViewPropTypes } from "deprecated-react-native-prop-types";
import { Camera, CameraType } from 'expo-camera';
import axios from "axios";

const InjuryScreen = () => {
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const [permission, setPermission] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setPermission(cameraStatus.status === 'granted');
      setLoading(false); // Update loading state after permission request
    })();
  }, []);

  // Real-time video streaming
  useEffect(() => {
    const sendFrames = async () => {
      if (cameraRef.current) {
        const { uri } = await cameraRef.current.recordAsync();
        try {
          const response = await axios.post(
            "http://192.168.8.160:5000/injury-detection",
            uri
          );
          console.log(response.data);
        } catch (error) {
          console.error(error);
        }
      }
    };

    if (!loading) {
      sendFrames();
    }

    return () => {};
  }, [loading]); // Added loading dependency to avoid unnecessary calls when loading

  // Render loading indicator while permissions are being requested
  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Render camera component only if permission is granted
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Injury Detection</Text>
      {/* App logo */}
      <Image
        source={require("../assets/blindSafeLogo.png")} // Replace with your app logo
        style={styles.appLogo}
      />

      {/* Camera Module */}
      <View style={styles.cameraContainer}>
        <Camera 
          style={styles.camera}
          type={type}
          flashMode={flash}
          ref={cameraRef}
        />
      </View>

      {/* Microphone */}
      <Image
        source={require("../assets/mic.png")} // Replace with your microphone image
        style={styles.microphone}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  appLogo: {
    width: "50%",
    height: "20%",
    position: "absolute",
    top: 0,
  },
  heading: {
    color: "#070057",
    fontSize: 32,
    fontWeight: "bold",
    position: "absolute",
    top: "15%",
    left: "5%",
  },
  cameraContainer: {
    width: "90%",
    height: "50%",
    borderWidth: 1,
    borderColor: "black",
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  microphone: {
    position: "absolute",
    bottom: 10,
    width: "25%",
    height: "25%",
    resizeMode: "contain",
  },
});

export default InjuryScreen;
