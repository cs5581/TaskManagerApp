import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, FlatList, Alert } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfg";
import { Picker } from "@react-native-picker/picker";

interface User {
  id: string;
  name: string;
  completedTasks: number;
  lastCompletedDate?: Date; // This will help with filtering
}

const LeaderBoard = () => {
  const [timePeriod, setTimePeriod] = useState("daily");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [timePeriod]);

  const fetchUserEmail = async (userId: string) => {
    const userDoc = await getDocs(
      query(collection(FIREBASE_DB, "users"), where("id", "==", userId))
    );
    const userData = userDoc.docs[0]?.data();
    return userData?.email || "no name"; // Fallback to userId if email not found
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const q = query(collection(FIREBASE_DB, "tasks"));
      const querySnapshot = await getDocs(q);
      const userTaskCount: {
        [key: string]: { completedTasks: number; lastCompletedDate?: Date };
      } = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const completedAt = data.completedAt?.toDate();
        const userId = data.userId;

        if (
          data.completed &&
          completedAt &&
          isTaskWithinTimePeriod(completedAt)
        ) {
          if (!userTaskCount[userId]) {
            userTaskCount[userId] = {
              completedTasks: 0,
              lastCompletedDate: completedAt,
            };
          }
          userTaskCount[userId].completedTasks += 1;
          userTaskCount[userId].lastCompletedDate = completedAt;
        }
      });

      const sortedUsers = await Promise.all(
        Object.keys(userTaskCount).map(async (userId) => {
          const email = await fetchUserEmail(userId);
          return {
            id: userId,
            name: email,
            completedTasks: userTaskCount[userId].completedTasks,
            lastCompletedDate:
              userTaskCount[userId].lastCompletedDate || new Date(0),
          };
        })
      );

      setUsers(sortedUsers.sort((a, b) => b.completedTasks - a.completedTasks));
    } catch (error) {
      console.error("Error fetching leaderboard: ", error);
      Alert.alert("Error", "Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const isTaskWithinTimePeriod = (completedAt: Date): boolean => {
    const now = new Date();
    switch (timePeriod) {
      case "daily":
        return completedAt.toDateString() === now.toDateString();
      case "weekly":
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return completedAt >= oneWeekAgo;
      case "monthly":
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return completedAt >= oneMonthAgo;
      default:
        return true;
    }
  };

  // const filterAndSortUsers = () => {
  //   const now = new Date();
  //   const filteredUsers = users.filter((user) => {
  //     const completedDate = new Date(user.lastCompletedDate);
  //     if (timePeriod === "daily") {
  //       return completedDate >= new Date(now.setHours(0, 0, 0, 0));
  //     } else if (timePeriod === "weekly") {
  //       return completedDate >= new Date(now.setDate(now.getDate() - 7));
  //     } else if (timePeriod === "monthly") {
  //       return completedDate >= new Date(now.setMonth(now.getMonth() - 1));
  //     }
  //     return true; // Fallback
  //   });

  // Sort by completed tasks
  //   return filteredUsers.sort((a, b) => b.completedTasks - a.completedTasks);
  // };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userRow}>
      <Text style={styles.userText}>{item.name}</Text>
      <Text style={styles.userText}>{item.completedTasks} tasks completed</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Daily" onPress={() => setTimePeriod("daily")} />
        <Button title="Weekly" onPress={() => setTimePeriod("weekly")} />
        <Button title="Monthly" onPress={() => setTimePeriod("monthly")} />
      </View>
      <Text style={styles.header}>
        Leaderboard ({timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)})
      </Text>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={(item) => item.id}
          style={styles.userList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F9F5F0",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  userRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  userText: {
    fontSize: 18,
  },
  userList: {
    marginTop: 10,
  },
});

export default LeaderBoard;
