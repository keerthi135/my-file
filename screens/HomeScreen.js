import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const HomeScreen = () => {
  const [photos, setPhotos] = useState([]);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await axios.get(
          'https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&per_page=20&page=1&api_key=6f102c62f41998d151e5a1b48713cf13&format=json&nojsoncallback=1&extras=url_s'
        );
        const photoUrls = response.data.photos.photo.map((photo) => photo.url_s);

        // Check if new data is different from cached data
        const cachedPhotos = await AsyncStorage.getItem('cachedPhotos');
        const cachedPhotosArray = cachedPhotos ? JSON.parse(cachedPhotos) : [];

        if (JSON.stringify(cachedPhotosArray) !== JSON.stringify(photoUrls)) {
          await AsyncStorage.setItem('cachedPhotos', JSON.stringify(photoUrls));
          setPhotos(photoUrls);
        } else {
          setPhotos(cachedPhotosArray);
        }

        setIsOffline(false);
      } catch (error) {
        console.log('Failed to fetch photos:', error);
        const cachedPhotos = await AsyncStorage.getItem('cachedPhotos');
        if (cachedPhotos) {
          setPhotos(JSON.parse(cachedPhotos));
          setIsOffline(true);
        } else {
          Alert.alert('Error', 'Failed to load photos and no cached data found.');
        }
      }
    };

    fetchPhotos();
  }, []);

  return (
    <View style={styles.container}>
      {isOffline && <Text style={styles.offlineText}>You are offline. Showing cached images.</Text>}
      <FlatList
        data={photos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Image source={{ uri: item }} style={styles.image} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
  },
  offlineText: {
    color: 'red',
    textAlign: 'center',
    margin: 10,
  },
});

export default HomeScreen;
