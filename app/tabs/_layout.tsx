import { Tabs } from "expo-router";

export default () => {
  return (
    <Tabs>
      <Tabs.Screen name="Homepage" options={{ title: "Home" }} />
      <Tabs.Screen name="LeaderBoard" options={{ title: "Leader Board" }} />
    </Tabs>
  );
};
