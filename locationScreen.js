import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import axios from 'axios';

const MyLocation = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [isStopModalVisible, setStopModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [markerPosition, setMarkerPosition] = useState(null);
  const [shouldEnableLocationUpdates, setShouldEnableLocationUpdates] = useState(true);
  const locationListenerRef = useRef(null);

  const toggleStopModal = async () => {
    // If the modal is now visible, stop location updates
    setShouldEnableLocationUpdates(!shouldEnableLocationUpdates);
  
    if (locationListenerRef.current) {
      locationListenerRef.current.remove();
      locationListenerRef.current = null; // Reset the ref after removing the listener
    }
  
    setStopModalVisible(!isStopModalVisible);
  
    if (!shouldEnableLocationUpdates) {
      // Location updates have stopped, send the last message to the API
      try {
        const apiUrl = 'http://192.168.48.20:3000/api/sendLastMessage';
        const response = await axios.post(
          apiUrl,
          {
            message: 'Last message before stopping location updates',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
  
        console.log('Last message sent to API:', response.data);
      } catch (error) {
        console.error('Error sending last message to API:', error);
      }
    }
  };
  

  const closeModal = () => {
    setStopModalVisible(false);
    setShouldEnableLocationUpdates(true);
  };

  const handleIconPress = (iconName) => {
    if (iconName === 'ios-camera') {
      navigation.navigate('CameraScreen');
    } else if (iconName === 'signature') {
      navigation.navigate('Signature');
    } else if (iconName === 'confirm') {
      console.log('Confirm icon pressed');
    } else if (iconName === 'cancel') {
      console.log('Cancel icon pressed');
    }
    // Add more conditions for other icons as needed
  };

  const sendLocationToApi = async (latitude, longitude, speed) => {
    try {
      const apiUrl = 'http://192.168.48.20:3000/api/location';
      const response = await axios.post(
        apiUrl,
        {
          latitude: latitude,
          longitude: longitude,
          speed: speed,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Location sent to API:', response.data);
    } catch (error) {
      console.error('Error sending location to API:', error);
    }
  };

  useEffect(() => {
    const setupLocationListener = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Location permission not granted!');
          return;
        }

        if (shouldEnableLocationUpdates) {
          locationListenerRef.current = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000 },
            (location) => {
              setCurrentLocation(location.coords);
              setMarkerPosition({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              });

              sendLocationToApi(location.coords.latitude, location.coords.longitude, location.coords.speed || 0);

              (async () => {
                const address = await Location.reverseGeocodeAsync({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                });
                setCurrentAddress(address[0]?.name || 'Current Location');
              })();
            }
          );
        }
      } catch (error) {
        console.error('Error setting up location listener:', error);
      }
    };

    setupLocationListener();

    return () => {
      if (locationListenerRef.current) {
        locationListenerRef.current.remove();
        locationListenerRef.current = null; // Reset the ref after removing the listener

      }
    };
  }, [shouldEnableLocationUpdates]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={{
          latitude: currentLocation ? currentLocation.latitude : 0,
          longitude: currentLocation ? currentLocation.longitude : 0,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        {markerPosition && (
          <Marker
            coordinate={markerPosition}
            title="My Location"
            description={currentAddress || 'Current Location'}
          />
        )}
      </MapView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.circleIconLeftTop}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.stopButtonContainer}>
        <TouchableOpacity style={styles.stopButton} onPress={toggleStopModal}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>STOP</Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isStopModalVisible}
        onRequestClose={() => {
          toggleStopModal();
        }}
      >
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Location Stopped!</Text>
              <ScrollView style={styles.iconScrollContainer} horizontal={true} showsHorizontalScrollIndicator={false}>
                <View style={[styles.iconRow, styles.firstIconRow]}>
                  <TouchableOpacity onPress={() => handleIconPress('ios-camera')}>
                    <View style={[styles.iconBox, { backgroundColor: '#3498db' }]}>
                      <Icon name="ios-camera" size={64} color="white" />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleIconPress('signature')}>
                    <View style={[styles.iconBox, { backgroundColor: '#2ecc71' }]}>
                      <Icon name="ios-create" size={64} color="white" />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleIconPress('confirm')}>
                    <View style={[styles.iconBox, { backgroundColor: 'white' }]}>
                      <Icon name="ios-checkmark" size={64} color="black" />
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleIconPress('cancel')}>
                    <View style={[styles.iconBox, { backgroundColor: '#e74c3c' }]}>
                      <Icon name="ios-close" size={64} color="white" />
                    </View>
                  </TouchableOpacity>
                </View>
              </ScrollView>
              <View style={styles.iconContainer}>{/* Add other icon-related functionality here */}</View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleIconLeftTop: {
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 12,
    elevation: 5,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  stopButtonContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black background color
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  modalText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  iconScrollContainer: {
    marginTop: 10,
    maxHeight: 150,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  firstIconRow: {
    marginTop: 10,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
});

export default MyLocation;
