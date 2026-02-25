import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#87CEEB" },
          animation: "slide_from_bottom",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="reward"
          options={{
            animation: "slide_from_bottom",
          }}
        />
        <Stack.Screen
          name="roadmap"
          options={{
            animation: "slide_from_right",
          }}
        />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
