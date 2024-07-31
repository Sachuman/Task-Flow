import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import { Entypo, AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { differenceInHours } from "date-fns";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const Home = ({}) => {
  const [currentTasks, setCurrentTasks] = useState([]);
  const [addTask, setAddTask] = useState(false);
  const [task, setTask] = useState("");
  const [category, setCategory] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [due, setDue] = useState(new Date());
  const [important, setImportant] = useState(false);
  const [duration, setDuration] = useState("");
  const [taskDetails, setTaskDetails] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [delegate, setDelegate] = useState(false);
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const categories = [
    "Work",
    "Personal",
    "Projects",
    "Study",
    "Errands",
    "Events",
    "Shopping",
    "Fitness",
    "Chores",
  ];

  const weights = {
    due: 0.4,
    duration: 0.3,
    importance: 0.2,
    delegate: 0.1,
  };

  const calculateHoursRemaining = (selectedDate) => {
    const now = new Date();
    return differenceInHours(selectedDate, now);
  };

  const calculateTaskScore = (task) => {
    const dueScore = calculateHoursRemaining(new Date(task.due));
    const importanceScore = task.important ? 10 : 0;
    const delegateScore = task.delegate ? 0 : 10;
    const durationScore = parseFloat(task.duration);

    return (
      weights.due * -dueScore +
      weights.importance * importanceScore +
      weights.delegate * delegateScore +
      weights.duration * durationScore
    );
  };

  const applyPriorityAlgorithm = () => {
    let tasks = [...currentTasks];
    tasks = tasks.map((task) => ({
      ...task,
      score: calculateTaskScore(task),
    }));
    tasks.sort((a, b) => b.score - a.score); // Sort in descending order of scores acc to the priority algorithm made !!! haha
    setCurrentTasks(tasks);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUserInfo = await AsyncStorage.getItem("userInfo");
        if (storedUserInfo) {
          const userInfo = JSON.parse(storedUserInfo);
          setUserId(userInfo.user.email);
          getFromServer(userInfo.user.email);
        } else {
          console.log("No user id found");
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleAddOrUpdateTask = async () => {
    if (editingTask) {
      await updateTask(editingTask.id, {
        task,
        category,
        due,
        important,
        duration,
        taskDetails,
        delegate,
      });
    } else {
      await addTaskToServer({
        task,
        category,
        due,
        important,
        duration,
        taskDetails,
        delegate,
      });
    }
    setTask("");
    setCategory("");
    setDue(new Date());
    setImportant(false);
    setDuration("");
    setTaskDetails("");
    setDelegate(false);
    setAddTask(false);
    setEditingTask(null);
    await getFromServer(userId); // Refresh the task list from the server
  };

  const handleCategory = (category) => {
    setCategory(category);
    setSelectedCategory(category);
  };

  const addTaskToServer = async (newTask) => {
    try {
      const response = await axios.post(
        `https://task-flow-server-nodejs.onrender.com/users/${userId}/tasks`,
        newTask
      );
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const updateTask = async (taskId, updatedTask) => {
    try {
      const response = await axios.patch(
        `https://task-flow-server-nodejs.onrender.com/users/${userId}/tasks/${taskId}`,
        updatedTask
      );
      console.log(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getFromServer = async (userId) => {
    try {
      const res = await axios.get(`https://task-flow-server-nodejs.onrender.com/users/${userId}/tasks`);
      let tasks = res.data.tasks.filter((task) => task.completed === false);
      console.log("tasks", tasks);
      setCurrentTasks(tasks);
    } catch (error) {
      console.log(error);
    }
  };

  const completeFromServer = async (taskId) => {
    try {
      await axios.patch(
        `https://task-flow-server-nodejs.onrender.com/users/${userId}/tasks/${taskId}`,
        { completed: true }
      );
      await getFromServer(userId);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteFromServer = async (taskId) => {
    try {
      await axios.delete(
        `https://task-flow-server-nodejs.onrender.com/users/${userId}/tasks/${taskId}`
      );
      await getFromServer(userId);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditTask = (task) => {
    setTask(task.task);
    setCategory(task.category);
    setEditingTask(task);
    setDue(new Date(task.due));
    setImportant(task.important);
    setDuration(task.duration);
    setTaskDetails(task.taskDetails);
    setDelegate(task.delegate);
    setAddTask(true);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear(); // Clear all AsyncStorage data
      GoogleSignin.revokeAccess();
      GoogleSignin.signOut();
      router.replace("/auth"); // Redirect to login page
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (date) {
      setDue(date);
      console.log("Hours remaining: ", calculateHoursRemaining(date));
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <Pressable
          style={styles.addButton}
          onPress={() => {
            setTask("");
            setCategory("");
            setEditingTask(null);
            setAddTask(true);
          }}
        >
          <AntDesign name="plus" size={24} color="#ffffff" />
        </Pressable>
        <Image style= {styles.taskicon} source={require('../assests/TaskFlow.png')} />


        <Pressable style={styles.prioritizeButton} onPress={applyPriorityAlgorithm}>
          <Text style={styles.prioritizeButtonText}>Prioritize Tasks</Text>
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>

        <ScrollView>
          {currentTasks.length > 0 ? (
            <View>
              {currentTasks.map((item, index) => (
                <View key={item.id} style={styles.taskbox}>
                  <Text style={styles.taskText}>{item.task}</Text>
                  <View style={styles.iconButtonsContainer}>
                    <Pressable
                      style={styles.iconButton}
                      onPress={() => handleEditTask(item)}
                    >
                      <AntDesign name="edit" size={24} color="black" />
                    </Pressable>
                    <Pressable
                      style={styles.iconButton}
                      onPress={() => deleteFromServer(item.id)}
                    >
                      <MaterialCommunityIcons
                        name="delete-empty-outline"
                        size={24}
                        color="black"
                      />
                    </Pressable>
                    <Pressable
                      style={styles.iconButton}
                      onPress={() => completeFromServer(item.id)}
                    >
                      <AntDesign name="check" size={24} color="green" />
                    </Pressable>
                  </View>
                  <Text style={styles.categoryText}>Category: {item.category}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View>
              <Text style={styles.noTasksText}>No tasks left, plan your tasks</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {addTask && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={addTask}
          onRequestClose={() => setAddTask(false)}
          style={styles.themodel}
        >
          
          <View style={styles.modalView}>
            <View style={styles.modalContent}>
              <TextInput
                placeholder="Enter Task . . ."
                value={task}
                onChangeText={setTask}
                style={styles.input}
              />

              <View style={styles.categoryContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.scrollView}
                >
                  {categories.map((category, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        selectedCategory === category && styles.selectedButton,
                      ]}
                      onPress={() => handleCategory(category)}
                    >
                      <Text style={styles.buttonText}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.dueContainer}>
                <Text style={styles.label}>Select Due Date:</Text>
                <View style={{ alignItems: "center", flexDirection: "row" }}>
                  <MaterialCommunityIcons
                    name="calendar-month"
                    size={24}
                    color="black"
                    style={styles.icon1}
                  />
                  <Pressable onPress={() => setShowDatePicker(true)}>
                    <Text>{due.toDateString()}</Text>
                  </Pressable>
                  {showDatePicker && (
                    <DateTimePicker
                      value={due}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                    />
                  )}
                </View>
              </View>

              <View style={styles.prioritySection}>
                <TouchableOpacity onPress={() => setImportant(!important)}>
                  <View
                    style={[
                      styles.priorityBox,
                      important && styles.clickedBox,
                    ]}
                  >
                    <Text style={styles.priorityLabel}>Important</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setDelegate(!delegate)}>
                  <View
                    style={[
                      styles.delegateBox,
                      delegate && styles.clickedBox2,
                    ]}
                  >
                    <Text style={styles.delegateLabel}>Delegate</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.durationContainer}>
                <Text style={styles.durationLabel}>Estimated Hours:</Text>
                <View style={styles.hourBox}>
                  <TextInput
                    keyboardType="numeric"
                    value={duration}
                    onChangeText={setDuration}
                    style={styles.durationInput}
                  />
                </View>
              </View>

              <View style={styles.detailsContainer}>
                <Text style={styles.detailsLabel}>Task Details</Text>
                <TextInput
                  placeholder="Enter task details..."
                  value={taskDetails}
                  onChangeText={setTaskDetails}
                  style={styles.detailsInput}
                  multiline
                  numberOfLines={5}
                />
              </View>

              <Pressable
                onPress={handleAddOrUpdateTask}
                style={styles.modalAddButton}
              >
                <Text style={styles.modalAddButtonText}>
                  {editingTask ? "Update" : "Add"}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setAddTask(false);
                  setEditingTask(null);
                  setTask("");
                  setCategory("");
                }}
                style={styles.closeButton}
              >
                <Entypo name="circle-with-cross" size={24} color="black" />
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 180,  
    backgroundColor: "#f5f5f5",
  },
  addButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#FF4D53',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
  prioritizeButton: {
    position: 'absolute',
    top: 40,
    left: 10,
    backgroundColor: '#FF4D53',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 10,
  },
  prioritizeButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 1,
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 7,
    fontSize: 18,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  scrollView: {
    flexDirection: "row",
    padding: 10,
  },

  taskicon: {
    position: 'absolute',
    top: 95,
    right: 20,
    width: 75,
    height: 50,
    borderRadius: 25,
  },

  button: {
    padding: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  selectedButton: {
    backgroundColor: "#007bff",
  },
  buttonText: {
    color: "#fff",
  },
  dueContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  prioritySection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  priorityBox: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
    padding: 5,
    backgroundColor: "white",
  },
  
  clickedBox: {
    backgroundColor: "red",
  },
  delegateBox: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 5,
    padding: 5,
    backgroundColor: "white",
  },
  clickedBox2: {
    backgroundColor: "#00e600",
  },
  priorityLabel: {
    fontWeight: "bold",
    color: "black",
  },
  delegateLabel: {
    fontWeight: "bold",
    color: "black",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  hourBox: {
    borderColor: "gray",
    borderRadius: 5,
    padding: 5,
    backgroundColor: "white",
  },
  durationInput: {
    height: 40,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    width: 80,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailsLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailsInput: {
    height: 80,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
  modalAddButton: {
    backgroundColor: "turquoise",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  modalAddButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    alignItems: "center",
  },
  taskbox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "white",
  },
  taskText: {
    fontSize: 16,
    flex: 1,
  },
  iconButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    
  },
  iconButton: {
    marginLeft: 10,
  },
  categoryText: {
    paddingLeft: "3%",
    fontSize: 14,
    color: "gray",
  },
  noTasksText: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },
  logoutButton: {
    position: 'absolute',
    top: 90,
    left: 20,
    backgroundColor: 'black',
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 30,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default Home;
