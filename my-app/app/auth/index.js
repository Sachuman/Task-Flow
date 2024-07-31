import { StyleSheet, Text, View, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter, Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import{
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";


const Auth = () => {

  const promptAsync = () =>{
    GoogleSignin.configure({
      // Replace with your own client IDs
      iosClientId: '713285340053-0lg949bgedavtv1plkmj19um3ts5itsa.apps.googleusercontent.com',
      androidClientId: '713285340053-eqhhu71ls3emc71jiq348le7fnfg5v6s.apps.googleusercontent.com',
      webClientId: '713285340053-slbg2qnsbahi40eaj8g8n0gnvb7svrat.apps.googleusercontent.com',
      // redirectUri: AuthSession.makeRedirectUri({
      //   native: 'myapp://redirect', // Use your custom URI scheme here
      //   //useProxy: true,
      // }),
    });
  }
  const [userInfo, setUserInfo] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(-1);
  const router = useRouter();

  useEffect(() => {
    promptAsync();
});

const loggingInAsync = async() =>{
  try{
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    setUserInfo(userInfo);
    await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
    const {accessToken} = await GoogleSignin.getTokens();

    sendTokenToBackend(accessToken);

  }
  catch(error){
    console.log('Error logging in:', error);
  }
}

  /// Retrieve Id from server
  /// 
  const sendTokenToBackend = async (token) => {
    try {
      await axios.post('https://task-flow-server-nodejs.onrender.com/auth/google', { token });
      console.log('Token sent to backend successfully');
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  };

  const getOverlayStyle = (index) => ({
    ...styles.overlay,
    backgroundColor: `rgb(${138 - index * 20}, 3, 3)`,
    transform: hoverIndex === index ? [{ translateY: -10 }] : [{ translateY: 0 }], // Move up by 10px when hovered
  });


  return userInfo ? (
    <Redirect href={`/pages/home?userId=${userInfo.email}`} />
  ) : (
    <View style={styles.container}>
      
        <Image style= {styles.circlePlaceholder} source={require('../pages/assests/TaskFlow.png')} />
    
      <Text style={styles.title}>Task Flow</Text>

      
      <GoogleSigninButton
      style={styles.button}
      onPress={loggingInAsync}
    />
    <Text style={styles.buttonText}>Login !!</Text>
    <View style={styles.background}>
      {[...Array(6)].map((_, index) => (
        <View
          key={index}
          style={getOverlayStyle(index)}
          onMouseEnter={() => setHoverIndex(index)}
          onMouseLeave={() => setHoverIndex(-1)}
        />
      ))}
    </View>
      
    </View>
  );
};

export default Auth;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%', // Ensure the container fills the screen width
    height: '100%',
    position: 'relative', // Use relative positioning for overlay
  },
  circlePlaceholder: {
    
    width: 100, // Width of the circle
    height: 100, // Height of the circle
    borderRadius: 50, // Half of the width and height to make it a perfect circle
    backgroundColor: '#cccccc', // Gray color
    marginBottom: 20, // Margin below the circle
    zIndex: 2, // Higher z-index to bring it forward
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: 'white',
    zIndex: 2,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column', // Ensure the overlays are stacked vertically
  },
  overlay: {
    flex: 1, // Each overlay will take equal part of the container
    width: '100%',
    transition: 'transform 0.3s ease', // Ensure smooth transitions
    backgroundColor: 'transparent', // Ensure background is transparent
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    zIndex: 1,
    color: 'white', // Make text color white for better visibility
  },
  button: {
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    zIndex: 2, // Higher z-index to bring it forward
  },
  buttonText: {
    color: 'white',
  },
});