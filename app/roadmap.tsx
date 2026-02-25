import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadMilestones } from "@/utils/milestoneStorage";
import { loadStampCard, loadTotalGoal } from "@/utils/storage";
import type { Milestone } from "@/types/milestone";
import { t } from "@/i18n";

export default function RoadmapScreen() {
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [totalStamps, setTotalStamps] = useState(0);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const ms = await loadMilestones();
        setMilestones(ms);

        const goal = await loadTotalGoal();
        const card = await loadStampCard(goal);
        setTotalStamps(card.totalEarnedStamps);
      })();
    }, [])
  );

  const reversed = [...milestones].reverse();

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#1A1A2E", "#16213E"]} style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>{t("roadmap.back")}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t("roadmap.title")}</Text>
        <Text style={styles.headerSub}>{t("roadmap.currentProgress", { count: totalStamps })}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Goal */}
        <View style={styles.goalNode}>
          <View style={styles.goalCircle}>
            <Text style={styles.goalEmoji}>🏆</Text>
          </View>
          <Text style={styles.goalText}>{t("roadmap.goal")}</Text>
        </View>

        {/* Milestones (reversed: highest first) */}
        {reversed.map((ms, i) => {
          const achieved = totalStamps >= ms.count;
          const isNextTarget =
            !achieved &&
            (i === reversed.length - 1 || totalStamps >= reversed[i + 1]?.count);

          return (
            <View key={ms.id} style={styles.milestoneContainer}>
              {/* Vertical line */}
              <View
                style={[styles.line, achieved && styles.lineAchieved]}
              />

              {/* Node */}
              <View
                style={[
                  styles.node,
                  achieved && styles.nodeAchieved,
                  isNextTarget && styles.nodeCurrent,
                ]}
              >
                {/* Icon */}
                <View
                  style={[
                    styles.iconCircle,
                    achieved && styles.iconAchieved,
                    isNextTarget && styles.iconCurrent,
                  ]}
                >
                  <Text style={styles.iconEmoji}>{ms.rewardEmoji}</Text>
                  {achieved && (
                    <View style={styles.checkBadge}>
                      <Text style={{ fontSize: 10 }}>✅</Text>
                    </View>
                  )}
                </View>

                {/* Text */}
                <View style={styles.nodeText}>
                  <Text
                    style={[
                      styles.countText,
                      achieved && styles.achievedCountText,
                    ]}
                  >
                    🎯 {ms.count}こ
                  </Text>
                  <Text
                    style={[
                      styles.rewardText,
                      achieved && styles.achievedRewardText,
                    ]}
                  >
                    {ms.rewardName}
                  </Text>
                  {achieved && ms.achievedAt && (
                    <Text style={styles.dateText}>
                      ✨ {t("roadmap.achieved", {
                        date: new Date(ms.achievedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        }),
                      })}
                    </Text>
                  )}
                  {isNextTarget && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>
                        {t("roadmap.remaining", { count: ms.count - totalStamps })}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {/* Start */}
        <View style={styles.startNode}>
          <View style={[styles.goalCircle, styles.startCircle]}>
            <Text style={styles.goalEmoji}>🚀</Text>
          </View>
          <Text style={styles.startText}>{t("roadmap.start")}</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    top: 60,
    left: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 16,
    color: "#FFFFFFCC",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  // Goal node
  goalNode: {
    alignItems: "center",
    marginBottom: 8,
  },
  goalCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFD700",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  goalEmoji: {
    fontSize: 32,
  },
  goalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  // Start node
  startNode: {
    alignItems: "center",
    marginTop: 8,
  },
  startCircle: {
    backgroundColor: "#5BC8F5",
  },
  startText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  // Milestone
  milestoneContainer: {
    width: "100%",
    alignItems: "center",
    position: "relative",
  },
  line: {
    width: 3,
    height: 24,
    backgroundColor: "#E0E0E0",
  },
  lineAchieved: {
    backgroundColor: "#5BC8F5",
  },
  node: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    width: "100%",
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: "#F0F0F0",
  },
  nodeAchieved: {
    borderColor: "#5BC8F5",
    backgroundColor: "#F0FAFF",
  },
  nodeCurrent: {
    borderColor: "#FFD700",
    backgroundColor: "#FFFBF0",
    shadowColor: "#FFD700",
    shadowOpacity: 0.2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconAchieved: {
    backgroundColor: "#E0F7FA",
  },
  iconCurrent: {
    backgroundColor: "#FFF8E1",
  },
  iconEmoji: {
    fontSize: 24,
  },
  checkBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
  },
  nodeText: {
    flex: 1,
  },
  countText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#999",
  },
  achievedCountText: {
    color: "#5BC8F5",
  },
  rewardText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginTop: 2,
  },
  achievedRewardText: {
    color: "#333",
  },
  dateText: {
    fontSize: 12,
    color: "#5BC8F5",
    marginTop: 4,
  },
  currentBadge: {
    backgroundColor: "#FFF3CD",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  currentBadgeText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FF8F00",
  },
});
