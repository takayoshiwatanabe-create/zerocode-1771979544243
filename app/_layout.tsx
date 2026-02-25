import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "@/constants/colors";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.surface,
          headerTitleStyle: { fontWeight: "bold" },
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "スタンプカード" }}
        />
        <Stack.Screen
          name="stamp"
          options={{
            title: "スタンプをおす",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="reward"
          options={{
            title: "ごほうび",
            presentation: "modal",
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}
