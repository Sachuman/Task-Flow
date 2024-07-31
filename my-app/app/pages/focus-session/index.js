import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';

const FocusSession = () => {
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [seconds, setSeconds] = useState(30 * 60); // Default is like i think, 30 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [workDuration, setWorkDuration] = useState(30); // in minutes
  const [breakDuration, setBreakDuration] = useState(5); // in minutes
  const intervalRef = useRef(null);
  const soundRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    Sound.setCategory('Playback');
    return () => {
      if (soundRef.current) {
        soundRef.current.release();
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds === 1) {
            playSound();
            switchSession();
            return prevSeconds - 1;
          } else {
            return prevSeconds - 1;
          }
        });
      }, 1000);
    } else if (!isRunning && seconds !== 0) {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const playSound = () => {
    const sound = new Sound(require('../assests/alert.mp3'), (error) => {
      if (error) {
        console.error('Error loading sound:', error);
        return;
      }
      sound.play((success) => {
        if (!success) {
          console.error('Sound playback failed');
        }
        sound.release();
      });
    });
    soundRef.current = sound;
  };

  const switchSession = () => {
    setIsWorkSession(!isWorkSession);
    setSeconds(isWorkSession ? breakDuration * 60 : workDuration * 60);
  };

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = secs % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pomodoro Timer</Text>
      <View style={styles.inputContainer}>
        
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={workDuration.toString()}
          onChangeText={(text) => setWorkDuration(parseInt(text) || 0)}
        />
        <Button
          title="Set Work Duration"
          onPress={() => {
            if (isWorkSession) {
              setSeconds(workDuration * 60);
            }
          }}
        />
      </View>
      <View style={styles.inputContainer}>
        
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={breakDuration.toString()}
          onChangeText={(text) => setBreakDuration(parseInt(text) || 0)}
        />
        <Button
          title="Set Break Duration"
          onPress={() => {
            if (!isWorkSession) {
              setSeconds(breakDuration * 60);
            }
          }}
        />
      </View>
      <View style={styles.sessionButtonContainer}>
        <TouchableOpacity
          style={[styles.sessionButton, isWorkSession && styles.activeSessionButton]}
          onPress={() => {
            setIsWorkSession(true);
            setSeconds(workDuration * 60);
          }}
        >
          <Text style={styles.sessionButtonText}>Work Session</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sessionButton, !isWorkSession && styles.activeSessionButton]}
          onPress={() => {
            setIsWorkSession(false);
            setSeconds(breakDuration * 60);
          }}
        >
          <Text style={styles.sessionButtonText}>Break Session</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sessionText}>{isWorkSession ? 'Work (min)' : 'Break (min)'}</Text>
      <Text style={styles.timerText}>{formatTime(seconds)}</Text>
      <View style={styles.buttonContainer}>
        <Button title={isRunning ? 'Pause' : 'Start'} onPress={() => setIsRunning(!isRunning)} />
        <Button
          title="Reset"
          onPress={() => setSeconds(isWorkSession ? workDuration * 60 : breakDuration * 60)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 45,
    backgroundColor: 'rgb(235, 237, 237)',  
  },
  title: {
    fontSize: 32,
    paddingVertical: "20%",
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#282c34',  
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 35,
    paddingBottom: "3%",
  },
  label: {
    color: '#282c34',  
    marginRight: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
    width: 60,
    color: '#282c34',  
  },
  sessionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sessionButton: {
    backgroundColor: '#ccc',  
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  activeSessionButton: {
    backgroundColor: '#4caf50',  
  },
  sessionButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  sessionText: {
    fontSize: 24,
    marginBottom: 20,
    color: '#282c34',  
  },
  timerText: {
    fontSize: 48,
    marginBottom: 20,
    color: '#282c34',  
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
});

export default FocusSession;
