import { StatusBar } from "expo-status-bar";
import React, { useRef, useEffect, useState } from "react";
import { View, Image, StyleSheet, Text, Alert } from "react-native";
import { DeprecatedViewPropTypes } from "deprecated-react-native-prop-types";
import { Camera, CameraType } from "expo-camera";
import axios from "axios";

export default function InjuryScreen(props) {
  const [startCamera, setStartCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    __startCamera();
  });

  const __startCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === "granted") {
      setStartCamera(true);
    } else {
      Alert.alert("Access denied");
    }
  };

  // Real-time video streaming
  // const sendFrameToBackend = async (uri) => {
  //   try {
  //     const response = await axios.post(
  //       "http://192.168.8.160:5000/injury-detection",
  //       uri
  //     );
  //     console.log(response.data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // useEffect(() => {
  //   let isMounted = true;
  //   const sendFrames = async () => {
  //     if (cameraRef.current) {
  //       const { uri } = await cameraRef.current.recordAsync({quality: '360p'});
  //       if (isMounted) {
  //         sendFrameToBackend(uri);
  //         setTimeout(sendFrames, 1000); 
  //       }
  //     }
  //   };

  //   if (startCamera) {
  //     sendFrames();
  //   }

  //   return () => {
  //     isMounted = false;
  //   };
  // }, [startCamera]);



  // //sattic test 
  const [injuryDetected, setInjuryDetected] = useState(false);

  useEffect(() => {
    handleInjuryDetection(); 
  }, []); 

  const handleInjuryDetection = async () => {
    try {
      const response = await axios.post('http://192.168.8.160:5000/injury-detection');
      // Handle response
      console.log(response.data);
      setInjuryDetected(true);
    } catch (error) {
      // Handle error
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.heading}>Injury Detection</Text>
      {/* App logo */}
      <Image
        source={require("../assets/blindSafeLogo.png")}
        style={styles.appLogo}
      />

      {/* Camera Module */}
      {startCamera ? (
        <View style={styles.cameraContainer}>
          <Camera style={{ flex: 1, width: "100%" }} ref={cameraRef} />
        </View>
      ) : (
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            justifyContent: "center",
            alignItems: "center",
          }}
        ></View>
      )}

      {/* Microphone */}
      <Image source={require("../assets/mic.png")} style={styles.microphone} />
    </View>
  );
}

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
