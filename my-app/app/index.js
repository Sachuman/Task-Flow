import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { set } from 'date-fns';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userverinfo, setUserverinfo] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (userInfo) {
          const userverinfo = JSON.parse(userInfo);
          setUserverinfo(userverinfo);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      } finally {
        console.log('userverinfo');
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  {
    if (isLoggedIn&& userverinfo) {
      return <Redirect href={`/pages/home?userId=${userverinfo.email}`} />
    }
    else{
      return <Redirect href="/auth" />
    }
  }};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
