import React, { FC, useState } from "react";
import { SafeAreaView, StatusBar } from "react-native";
import Login from "./Login";
import Homepage from "./tabs/Homepage";

const App: FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  function handleLoginConfirmation() {
    setIsLoggedIn(true);
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ backgroundColor: "#E8DCCA", flex: 1 }}>
        {!isLoggedIn ? (
          <Login onLogin={handleLoginConfirmation} />
        ) : (
          <Homepage />
        )}
      </SafeAreaView>
    </>
  );
};

export default App;
