import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const Stats = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [tasksLast7Days, setTasksLast7Days] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUserInfo = await AsyncStorage.getItem('userInfo');
        if (storedUserInfo) {
          const userInfo = JSON.parse(storedUserInfo);
          setUserId(userInfo.user.email);
          fetchTasksLast7Days(userInfo.user.email);
        } else {
          console.log('No user id found');
          router.replace('/auth'); 
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };
    checkAuth();
  }, []);

  const fetchTasksLast7Days = async (userId) => {
    try {
      const last7Days = [...Array(7).keys()].map(i => moment().subtract(i, 'days').format('YYYY-MM-DD'));
      const tasksCounts = await Promise.all(last7Days.map(async date => {
        const response = await axios.get(`https://task-flow-server-nodejs.onrender.com/users/${userId}/tasks/completed/${date}`);
        return response.data.tasks.length;
      }));
      setTasksLast7Days(tasksCounts.reverse());
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCompletedTasks = async (date) => {
    try {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const response = await axios.get(`https://task-flow-server-nodejs.onrender.com/users/${userId}/tasks/completed/${formattedDate}`);
      const fetchedTasks = response.data.tasks;
      setTasks(fetchedTasks);

      // Calculate total tasks and hours
      const totalTasksCount = fetchedTasks.length;
      const totalHoursCount = fetchedTasks.reduce((sum, task) => sum + (parseFloat(task.duration) || 0), 0);
      setTotalTasks(totalTasksCount);
      setTotalHours(totalHoursCount);
    } catch (error) {
      console.log(error);
    }
  };

  const handleDateChange = (event, date) => {
    const selected = date || selectedDate;
    setShowPicker(false);
    setSelectedDate(selected);
    fetchCompletedTasks(selected);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.dateButton} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateButtonText}>Select Date</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Statistics</Text>
          <View style={styles.statsBox}>
            <Text style={styles.statsText}>Total Tasks Completed</Text>
            <Text style={styles.statsNumber}>{totalTasks}</Text>
          </View>
          <View style={styles.statsBox}>
            <Text style={styles.statsText}>Total Hours Worked</Text>
            <Text style={styles.statsNumber}>{totalHours}</Text>
          </View>
        </View>
        <View style={styles.achievementsContainer}>
          <Text style={styles.achievementsTitle}>Completed Tasks</Text>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <View key={task.id} style={styles.taskBox}>
                <Text style={styles.taskText}>{task.task}</Text>
                <View style={styles.taskDetailRow}>
                  <Text style={styles.taskDetailTitle}>Category:</Text>
                  <Text style={styles.taskDetailValue}>{task.category}</Text>
                </View>
                <View style={styles.taskDetailRow}>
                  <Text style={styles.taskDetailTitle}>Details:</Text>
                  <Text style={styles.taskDetailValue}>{task.taskDetails}</Text>
                </View>
                <View style={styles.taskDetailRow}>
                  <Text style={styles.taskDetailTitle}>Duration:</Text>
                  <Text style={styles.taskDetailValue}>{task.duration || '0'}</Text>
                </View>
                <View style={styles.taskDetailRow}>
                  <Text style={styles.taskDetailTitle}>Important:</Text>
                  <Text style={styles.taskDetailValue}>{task.isImportant ? 'Yes' : 'No'}</Text>
                </View>
                <View style={styles.taskDetailRow}>
                  <Text style={styles.taskDetailTitle}>Due Date:</Text>
                  <Text style={styles.taskDetailValue}>{moment(task.dueDate).format('YYYY-MM-DD')}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noTasksText}>No completed tasks for the selected date.</Text>
          )}
        </View>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Tasks Completed in the Last 7 Days</Text>
          <BarChart
            data={{
              labels: ['Day1', 'Day2', 'Day3', 'Day4', 'Day5', 'Day6', 'Day7', ],
              datasets: [{ data: tasksLast7Days }],
            }}
            width= {screenWidth - 60}
            height={220}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            }}
            style={{marginVertical: 8, borderRadius: 20, paddingRight: 20}}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    paddingBottom: 20,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  statsBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  achievementsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 10,
  },
  taskBox: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  taskText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  taskDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  taskDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  taskDetailValue: {
    fontSize: 16,
    color: '#333',
  },
  noTasksText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  chartContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  dateButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  dateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

});

export default Stats;
