import { useState, useEffect } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { t } from "@/i18n";

type PaywallReason = "theme" | "milestone" | "roadmap" | "general";

interface Props {
  visible: boolean;
  reason: PaywallReason;
  price: string;
  isIAPReady: boolean;
  onPurchase: () => Promise<boolean>;
  onRestore: () => Promise<void>;
  onClose: () => void;
}

const REASON_CONFIG: Record<PaywallReason, { emoji: string; titleKey: string; descKey: string }> = {
  theme: { emoji: "🎨", titleKey: "paywall.themeTitle", descKey: "paywall.themeDesc" },
  milestone: { emoji: "🎯", titleKey: "paywall.milestoneTitle", descKey: "paywall.milestoneDesc" },
  roadmap: { emoji: "🗺️", titleKey: "paywall.roadmapTitle", descKey: "paywall.roadmapDesc" },
  general: { emoji: "✨", titleKey: "paywall.generalTitle", descKey: "paywall.generalDesc" },
};

const FEATURE_KEYS = [
  "paywall.feature1",
  "paywall.feature2",
  "paywall.feature3",
  "paywall.feature4",
  "paywall.feature5",
];

export function PaywallModal({
  visible,
  reason,
  price,
  isIAPReady,
  onPurchase,
  onRestore,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const cfg = REASON_CONFIG[reason] ?? REASON_CONFIG.general;

  // Reset loading state when modal closes
  useEffect(() => {
    if (!visible) setLoading(false);
  }, [visible]);

  const handlePurchase = async () => {
    if (!isIAPReady) {
      Alert.alert(
        "購入できません",
        "App Storeに接続できません。しばらく後でお試しください。"
      );
      return;
    }
    setLoading(true);
    try {
      const success = await onPurchase();
      if (!success) {
        Alert.alert(
          t("paywall.errorTitle") ?? "エラー",
          t("paywall.errorMsg") ?? "もう一度お試しください"
        );
      }
    } catch (e) {
      Alert.alert(
        t("paywall.errorTitle") ?? "エラー",
        t("paywall.errorMsg") ?? "もう一度お試しください"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Close button */}
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <Text style={styles.emoji}>{cfg.emoji}</Text>
            <Text style={styles.title}>{t(cfg.titleKey)}</Text>
            <Text style={styles.desc}>{t(cfg.descKey)}</Text>

            {/* Feature list */}
            <View style={styles.featureList}>
              {FEATURE_KEYS.map((key) => (
                <View key={key} style={styles.featureRow}>
                  <Text style={styles.featureText}>{t(key)}</Text>
                </View>
              ))}
            </View>

            {/* Purchase button */}
            <Pressable
              style={[styles.purchaseBtn, loading && styles.purchaseBtnDisabled]}
              onPress={handlePurchase}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ["#999", "#AAA"] : ["#FF6B35", "#FF8C42"]}
                style={styles.purchaseBtnGradient}
              >
                <Text style={styles.purchaseBtnText}>
                  {loading
                    ? t("paywall.processing")
                    : isIAPReady
                      ? t("paywall.buyButton", { price })
                      : t("paywall.openAppStore") ?? "App Storeで購入"}
                </Text>
                <Text style={styles.purchaseBtnSub}>
                  {isIAPReady
                    ? t("paywall.buySubtitle")
                    : t("paywall.openAppStoreSub") ?? "App Storeが開きます"}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Restore */}
            <Pressable onPress={onRestore} style={styles.restoreBtn}>
              <Text style={styles.restoreText}>{t("paywall.restore")}</Text>
            </Pressable>

            {/* Legal */}
            <Text style={styles.legal}>{t("paywall.legal")}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#00000060",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 16,
    color: "#666",
  },
  emoji: {
    fontSize: 56,
    marginTop: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  desc: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  featureList: {
    width: "100%",
    backgroundColor: "#FFF8F0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  featureRow: {
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 15,
    color: "#333",
  },
  purchaseBtn: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  purchaseBtnDisabled: {
    opacity: 0.7,
  },
  purchaseBtnGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    borderRadius: 16,
  },
  purchaseBtnText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  purchaseBtnSub: {
    fontSize: 12,
    color: "#FFFFFFCC",
    marginTop: 4,
  },
  restoreBtn: {
    paddingVertical: 12,
    marginBottom: 16,
  },
  restoreText: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "underline",
  },
  legal: {
    fontSize: 11,
    color: "#BBBBBB",
    textAlign: "center",
    lineHeight: 16,
  },
});
