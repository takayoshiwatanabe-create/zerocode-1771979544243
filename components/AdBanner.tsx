import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

// Test Ad Unit IDs from Google
const TEST_BANNER_ID = "ca-app-pub-3940256099942544/2934735716";

interface Props {
  isPremium: boolean;
}

export function AdBanner({ isPremium }: Props) {
  const [AdComponent, setAdComponent] = useState<React.ComponentType<any> | null>(null);
  const [BannerAdSize, setBannerAdSize] = useState<any>(null);

  useEffect(() => {
    if (isPremium) return;

    // Dynamically import to avoid crashes if module not available
    (async () => {
      try {
        const ads = await import("react-native-google-mobile-ads");
        setAdComponent(() => ads.BannerAd);
        setBannerAdSize(ads.BannerAdSize);
      } catch {
        // Ad module not available
      }
    })();
  }, [isPremium]);

  if (isPremium) return null;

  if (!AdComponent || !BannerAdSize) {
    // Placeholder when ads module not available
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>AD</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdComponent
        unitId={TEST_BANNER_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 4,
  },
  placeholder: {
    width: "90%",
    height: 50,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 4,
  },
  placeholderText: {
    fontSize: 12,
    color: "#CCCCCC",
    fontWeight: "bold",
  },
});
