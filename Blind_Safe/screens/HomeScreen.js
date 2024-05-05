import React, { useState, useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, Vibration, Animated } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [swipedDirection, setSwipedDirection] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  // Function to handle swipe actions
  const handleSwipe = (direction) => {
    console.log('Swipe Direction:', direction); // Log detected swipe direction
    // Implement swipe action based on direction
    switch (direction) {
      case 'up':
        console.log('Function 1');
        break;
      case 'down':
        console.log('Function 2');
        break;
      case 'left':
        console.log('Function 3');
        navigation.navigate('PublicTransport'); // Navigate to PublicTransportNavigation
        break;
      case 'right':
        console.log('Function 4');
        break;
      default:
        break;
    }
    
    // Vibrate when a swipe is detected
    Vibration.vibrate(100); // Vibrate for 100 milliseconds
    // Animate the middle button
    animateMiddleButton();
  };

  // Function to handle gesture events
  const onGestureEvent = (event) => {
    const { translationX, translationY, state } = event.nativeEvent;

    if (state === State.ACTIVE) {
      const swipeThreshold = 50; // Adjust as needed

      // Check if the drag gesture is moving towards the side buttons
      if (Math.abs(translationX) > swipeThreshold || Math.abs(translationY) > swipeThreshold) {
        let direction;
        if (Math.abs(translationX) > Math.abs(translationY)) {
          direction = translationX > 0 ? 'right' : 'left';
        } else {
          direction = translationY > 0 ? 'down' : 'up';
        }
        setSwipedDirection(direction);
        handleSwipe(direction);
      }
    }
  };

  // Function to animate the middle button
  const animateMiddleButton = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <View style={styles.fullScreenContainer}>
          {/* Joystick */}
          <View style={styles.joystickContainer}>
            {/* Up button */}
            <TouchableOpacity style={styles.joystickButton} onPress={() => handleSwipe('up')}>
              <Text style={styles.functionName}>Fall Detector</Text>
            </TouchableOpacity>

            {/* Left and right buttons */}
            <View style={styles.sideButtonsContainer}>
              <TouchableOpacity style={styles.joystickButton} onPress={() => handleSwipe('left')}>
                <Text style={styles.functionName}>Navigation</Text>
              </TouchableOpacity>

              {/* Middle button */}
              <Animated.View style={[styles.centralButton, { opacity: fadeAnim }]}>
                <Text style={styles.functionName}>Selected</Text>
              </Animated.View>

              <TouchableOpacity style={styles.joystickButton} onPress={() => handleSwipe('right')}>
                <Text style={styles.functionName}>Medicine Detector</Text>
              </TouchableOpacity>
            </View>

            {/* Down button */}
            <TouchableOpacity style={styles.joystickButton} onPress={() => handleSwipe('down')}>
              <Text style={styles.functionName}>Wound Detector</Text>
            </TouchableOpacity>
          </View>
        </View>
      </PanGestureHandler>

      {/* App logo */}
      <Image
        source={require('../assets/blindSafeLogo.png')} // Replace with your app logo
        style={styles.appLogo}
      />

      {/* Microphone */}
      <Image
        source={require('../assets/mic.png')} // Replace with your microphone image
        style={styles.microphone}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  fullScreenContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appLogo: {
    width: 200,
    height: 100,
    marginBottom: 20,
    marginTop: 50,
    position: 'absolute',
    top: 50,
  },
  joystickContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  joystickButton: {
    width: 100,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  sideButtonsContainer: {
    flexDirection: 'row',
  },
  centralButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#070057',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginHorizontal: 20,
  },
  functionName: {
    fontSize: 16,
    color: '#070057',
    textAlign: 'center',
  },
  microphone: {
    position: 'absolute',
    bottom: 100,
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});

export default HomeScreen;