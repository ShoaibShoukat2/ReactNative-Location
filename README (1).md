
# Sending Live Latitude and Longitude (React Native)

The MyLocation component in this application includes functionality to continuously send live latitude and longitude coordinates to a specified API endpoint. This feature is useful for tracking the user's real-time location and interacting with external services. Here's an overview of how it works:





## Installation

Install expo-locaton with npm

```bash
  npm install expo-location
```
    
## Screenshots

![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)


## Components Used

 - React Native Maps: The application utilizes the react-native-maps library to display a map and mark the user's location with a draggable pin.
 - Expo Location: The expo-location package is employed to handle location-related tasks, such as requesting permissions, watching for position changes, and reverse geocoding.
 - Axios: For making HTTP requests, the axios library is used. It sends the live location data to a specified API endpoint.
 



## How It Works
1. Location Permission: The app requests foreground location permissions from the user.

2. Location Listener: When the shouldEnableLocationUpdates state is true, a location listener is set up using Location.watchPositionAsync. This listener continuously updates the currentLocation state with the latest coordinates.

3. Sending to API: The sendLocationToApi function is called within the location listener. It constructs a POST request using Axios and sends the live latitude, longitude, and speed (if available) to a specified API endpoint.

4. Stopping Location Updates: Toggling the shouldEnableLocationUpdates state to false stops the location updates. Before stopping, the app sends a final message to the API using the axios.post method.

## API Reference

#### Get all items

```http
  GET /api/items
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_location` | `string` | **Required**. localhost |



