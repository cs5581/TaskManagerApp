import {
  Text,
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Button,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import React, { FC, useState } from "react";
import { useRouter } from "expo-router";
import { FIREBASE_AUTH } from "@/FirebaseConfg";
import { signInWithEmailAndPassword } from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfg";

interface LoginProps {
  onLogin: () => void;
}

const Login: FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = FIREBASE_AUTH;

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
      onLogin();
      router.push("/tabs/Homepage");
    } catch (error) {
      console.log("Problem signing you in: ", error);
      Alert.alert(
        "Sign In Error",
        "Failed to sign in. Please check your credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    setLoading(true);
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = response.user.uid;
      onLogin();
      console.log(response);
      await setDoc(doc(FIREBASE_DB, "users", userId), {
        id: userId,
        email: email, // Store the email here
        completedTasks: 0, // You can initialize other fields as needed
        lastCompletedDate: null,
      });
      router.push("/tabs/Homepage");
    } catch (error) {
      console.log("Problem signing you up: ", error);
      Alert.alert("Sign Up Error", "Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <View style={styles.loginTitleContainer}>
          <Text style={styles.loginTitle}>Task Manager App</Text>
        </View>

        <View style={styles.loginDescriptionContainer}>
          <Text style={styles.loginDescription}>
            Keep all your tasks organized with Task Manager
          </Text>
        </View>
        <View style={styles.loginFieldsContainer}>
          <Text>Email</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            placeholder="email"
            onChangeText={(text) => setEmail(text)}
          ></TextInput>
          <Text>Password</Text>
          <TextInput
            style={styles.textInput}
            secureTextEntry={true}
            value={password}
            placeholder="password"
            onChangeText={(text) => setPassword(text)}
          ></TextInput>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#000ff" />
        ) : (
          <View>
            <View style={styles.buttonContainer}>
              <Button title="Login" onPress={signIn}></Button>
            </View>
            <View style={styles.buttonContainer}>
              <Button title="Create Account" onPress={signUp}></Button>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8DCCA",
  },
  loginFieldsContainer: {
    width: "100%",
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  textInput: {
    fontSize: 18,
    marginVertical: 8,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    width: 300,
  },
  loginDescription: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "#555",
    fontStyle: "italic",
  },
  loginDescriptionContainer: {
    padding: 25,
  },
  loginTitle: {
    fontSize: 34,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#3a3a3a",
  },
  loginTitleContainer: {
    alignSelf: "center",
    margin: 30,
  },
  buttonContainer: {
    marginBottom: 16,
  },
});

export default Login;
