/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
import New from './New';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Animated,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Image,
  TouchableWithoutFeedback,
  TouchableOpacity,
  PermissionsAndroid,
  Share,
  ToastAndroid,
} from 'react-native';
import Icons from 'react-native-vector-icons/MaterialIcons';
import Fs from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [isImageFocused, setIsImageFocused] = useState(true);
  const scale = new Animated.Value(1);
  const {width, height} = Dimensions.get('window');
  let scales = {
    transform: [{scale: scale}],
  };

  let actionBarY = scale.interpolate({
    inputRange: [0.9, 1],
    outputRange: [0, -80],
  });

  let borderRadius = scale.interpolate({
    inputRange: [0.9, 1],
    outputRange: [30, 0],
  });
  let Load = async () => {
    try {
      let res = await fetch(
        'https://api.unsplash.com/photos/random?count=30&client_id=896979fdb70f80865638d7a4648bf9ce309675335318933eab2bf990af42e295',
      );
      let data = await res.json();
      setImages(data);
      setIsLoading(false);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    Load();
  }, [isLoading]);
  useEffect(() => {
    if (isImageFocused) {
      Animated.spring(scale, {
        toValue: 0.9,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: false,
      }).start();
    }
  }, [isImageFocused]);
  const showControls = items => {
    setIsImageFocused(isImageFocused => !isImageFocused);
  };

  let savePicture = item => {
    Fs.downloadFile({
      fromUrl: item.item.urls.regular,
      toFile: `file://${Fs.DocumentDirectoryPath}/${item.item.id}.jpg`,
    }).promise.then(response => {
      // console.log(response);
      // console.log();
      let path = `${Fs.DocumentDirectoryPath}/${item.item.id}.jpg`;
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'My App Storage Permission',
          message:
            'My App needs access to your storage ' +
            'so you can save your photos',
        },
      ).then(granted => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the camera');
          CameraRoll.saveToCameraRoll(path, 'photo').then(data => {
            ToastAndroid.show(' Downloaded Successfully', ToastAndroid.LONG);
          });
        } else {
          console.log('Camera permission denied');
        }
      });
    });
  };
  let sharePicture = async items => {
    try {
      await Share.share({
        message: items.item.urls.full,
        title: 'check out wallpaper ',
      });
    } catch (err) {
      console.log(err);
    }
  };
  let renderItem = items => {
    return (
      <View style={{flex: 1}}>
        {/* <New /> */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            backgroundColor: 'black',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ActivityIndicator size="large" color="grey" />
        </View>
        <TouchableWithoutFeedback onPress={() => showControls(items)}>
          <Animated.View style={[{height, width}, scales]}>
            <Animated.Image
              style={[
                {
                  height: null,
                  width: null,
                  flex: 1,
                  borderRadius: borderRadius,
                },
              ]}
              source={{uri: items.item.urls.regular}}
              resizeMode="cover"
            />
          </Animated.View>
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: actionBarY,
              height: 80,
              backgroundColor: 'black',
            },
          ]}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'space-around',
              flexDirection: 'row',
            }}>
            <TouchableOpacity activeOpacity={0.5} onPress={() => Load()}>
              <Icons name="refresh" color="white" size={40} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => sharePicture(items)}>
              <Icons name="share" color="white" size={40} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.5}
              onPress={() => savePicture(items)}>
              <Icons name="file-download" color="white" size={40} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  };
  return isLoading ? (
    <View
      style={{
        flex: 1,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <ActivityIndicator color="grey" size="large" />
    </View>
  ) : (
    <View style={{flex: 1, backgroundColor: 'black'}}>
      <FlatList
        horizontal
        pagingEnabled
        scrollEnabled={!isImageFocused}
        data={images}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({});

export default App;
