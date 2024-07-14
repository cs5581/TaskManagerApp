import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  Firestore,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfg";
import { useRouter } from "expo-router";

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  createdAt: Date;
  completedAt: Date | null;
}

const Homepage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [taskDescription, setTaskDescription] = useState("");
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);

  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "No user is logged in");
        return;
      }

      const q = query(
        collection(FIREBASE_DB, "tasks"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const tasksList: Task[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasksList.push({
          id: doc.id,
          title: data.title,
          completed: data.completed,
          description: data.description,
          userId: data.userId,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          completedAt: data.completedAt ? data.completedAt.toDate() : null,
        });
      });
      setTasks(tasksList);
    } catch (error) {
      console.error("Error fetching tasks: ", error);
      Alert.alert("Error", "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (taskTitle.trim() === "") return;

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "No user is logged in");
        return;
      }

      const newTask: Omit<Task, "id"> = {
        title: taskTitle,
        description: taskDescription,
        completed: false,
        userId: user.uid,
        createdAt: new Date(),
        completedAt: null,
      };

      const docRef = await addDoc(collection(FIREBASE_DB, "tasks"), newTask);
      setTasks((prevTasks) => [...prevTasks, { id: docRef.id, ...newTask }]);
      setTaskTitle("");
      setTaskDescription("");
      setShowDescriptionInput(false);
    } catch (error) {
      console.error("Error adding task: ", error);
      Alert.alert("Error", "Failed to add task");
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    try {
      const taskRef = doc(FIREBASE_DB, "tasks", taskId);
      const task = tasks.find((task) => task.id === taskId);
      if (task) {
        const updatedTask = {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date() : null,
        };
        await updateDoc(taskRef, {
          completed: updatedTask.completed,
          completedAt: updatedTask.completedAt,
        });
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
        );
      }
    } catch (error) {
      console.error("Error toggling task completion", error);
      Alert.alert("Error", "Failed to toggle task completion");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const taskRef = doc(FIREBASE_DB, "tasks", taskId);
      await deleteDoc(taskRef);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Error deleting task: ", error);
      Alert.alert("Error", "Failed to delete task");
    }
  };

  const startEditing = (task: Task) => {
    setTaskTitle(task.title);
    setTaskDescription(task.description || "");
    setEditingTaskId(task.id);
  };

  const updateTask = async () => {
    if (!editingTaskId || taskTitle.trim() === "") return;

    try {
      const taskRef = doc(FIREBASE_DB, "tasks", editingTaskId);
      await updateDoc(taskRef, {
        title: taskTitle,
        desription: taskDescription,
      });
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === editingTaskId
            ? { ...task, title: taskTitle, description: taskDescription }
            : task
        )
      );
      setTaskTitle("");
      setTaskDescription("");
      setEditingTaskId(null);
      setShowDescriptionInput(false);
    } catch (error) {
      console.error("Error updating task: ", error);
      Alert.alert("Error", "Failed to update task");
    }
  };

  const handleTaskTitleFocus = () => {
    setShowDescriptionInput(true);
  };

  const handleTaskTitleBlur = () => {
    if (taskTitle.trim() === "") {
      setShowDescriptionInput(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error logging out: ", error);
      Alert.alert("Logout Error", "Failed to log out. Please try again.");
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.taskRow}>
      <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
        <Text
          style={{
            ...styles.taskText,
            textDecorationLine: item.completed ? "line-through" : "none",
          }}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
      <View style={styles.taskButtons}>
        <View style={styles.buttonContainer}>
          <Button title="Edit" onPress={() => startEditing(item)} />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Delete" onPress={() => deleteTask(item.id)} />
        </View>
      </View>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Task Title"
          value={taskTitle}
          onChangeText={setTaskTitle}
          onFocus={handleTaskTitleFocus}
          onBlur={handleTaskTitleBlur}
        />
        {showDescriptionInput && (
          <TextInput
            style={styles.input}
            placeholder="Task Description"
            value={taskDescription}
            onChangeText={setTaskDescription}
          />
        )}
        <Button
          title={editingTaskId ? "Update Task" : "Add Task"}
          onPress={editingTaskId ? updateTask : addTask}
        />
        <Text style={styles.header}>Pending Tasks</Text>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <FlatList
            data={tasks.filter((task) => !task.completed)}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            style={styles.taskList}
          />
        )}

        <Text style={styles.header}>Completed Tasks</Text>
        <FlatList
          data={tasks.filter((task) => task.completed)}
          renderItem={({ item }) => (
            <View style={styles.taskRow}>
              <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
                <Text
                  style={{
                    ...styles.taskText,
                    textDecorationLine: "line-through",
                    color: "gray",
                  }}
                >
                  {item.title}
                </Text>
              </TouchableOpacity>
              <View style={styles.taskButtons}>
                <Button title="Delete" onPress={() => deleteTask(item.id)} />
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
          style={styles.taskList}
        />
        <Button title="Logout" onPress={handleLogout} color="red" />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9F5F0",
  },
  input: {
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  taskText: {
    fontSize: 16,
  },
  taskButtons: {
    flexDirection: "row",
  },
  taskList: {
    marginTop: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  buttonContainer: {
    marginRight: 5,
  },
});

export default Homepage;
