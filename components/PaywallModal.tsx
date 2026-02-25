import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type PaywallReason = "theme" | "milestone" | "roadmap" | "general";

interface Props {
  visible: boolean;
  reason: PaywallReason;
  price: string;
  onPurchase: () => Promise<boolean>;
  onRestore: () => Promise<void>;
  onClose: () => void;
}

const REASONS: Record<
  PaywallReason,
  { emoji: string; title: string; desc: string }
> = {
  theme: {
    emoji: "🎨",
    title: "テーマを変えよう",
    desc: "どうぶつ・のりもの・うちゅう・わがら\n4つのテーマが使えるようになります",
  },
  milestone: {
    emoji: "🎯",
    title: "ごほうびを設定しよう",
    desc: "10個ごとにオリジナルのごほうびを\n設定できるようになります",
  },
  roadmap: {
    emoji: "🗺️",
    title: "ロードマップを開放",
    desc: "全ごほうびの旅マップで\n次の目標が一目でわかります",
  },
  general: {
    emoji: "✨",
    title: "プレミアムにアップグレード",
    desc: "全ての機能が解放されます",
  },
};

const FEATURES = [
  "🎨 テーマ4種（どうぶつ・のりもの・うちゅう・わがら）",
  "🚫 広告非表示",
  "🎯 ごほうびマイルストーン設定",
  "🗺️ ごほうびロードマップ",
  "✏️ カスタムごほうび名",
];

export function PaywallModal({
  visible,
  reason,
  price,
  onPurchase,
  onRestore,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const r = REASONS[reason] ?? REASONS.general;

  return (
    <Modal visible={visible} transparent animationType="slide">
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
            <Text style={styles.emoji}>{r.emoji}</Text>
            <Text style={styles.title}>{r.title}</Text>
            <Text style={styles.desc}>{r.desc}</Text>

            {/* Feature list */}
            <View style={styles.featureList}>
              {FEATURES.map((f) => (
                <View key={f} style={styles.featureRow}>
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            {/* Purchase button */}
            <Pressable
              style={styles.purchaseBtn}
              onPress={async () => {
                setLoading(true);
                await onPurchase();
                setLoading(false);
              }}
              disabled={loading}
            >
              <LinearGradient
                colors={["#FF6B35", "#FF8C42"]}
                style={styles.purchaseBtnGradient}
              >
                <Text style={styles.purchaseBtnText}>
                  {loading ? "処理中..." : `${price} で買い切り`}
                </Text>
                <Text style={styles.purchaseBtnSub}>
                  一度の購入で永久に使えます
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Restore */}
            <Pressable onPress={onRestore} style={styles.restoreBtn}>
              <Text style={styles.restoreText}>購入を復元する</Text>
            </Pressable>

            {/* Legal */}
            <Text style={styles.legal}>
              購入はApple IDに請求されます。{"\n"}
              利用規約・プライバシーポリシーはruok.jp/appsをご覧ください。
            </Text>
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
