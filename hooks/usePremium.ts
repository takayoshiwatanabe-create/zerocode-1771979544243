import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const PRODUCT_ID = "com.zerocode.myapp.premium";
const STORAGE_KEY = "isPremium";

let iapModule: typeof import("react-native-iap") | null = null;

async function loadIAP() {
  try {
    iapModule = await import("react-native-iap");
  } catch {
    // IAP not available (Expo Go or dev)
  }
}

export function usePremium() {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [price, setPrice] = useState<string>("¥100");

  useEffect(() => {
    // Check cached state first for fast startup
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === "true") setIsPremium(true);
    });
    initIAP();
  }, []);

  const initIAP = async () => {
    try {
      await loadIAP();
      if (!iapModule) {
        setIsLoading(false);
        return;
      }

      await iapModule.initConnection();

      // Get product info for localized price
      const products = await iapModule.getProducts({
        skus: [PRODUCT_ID],
      });
      if (products.length > 0) {
        setPrice(products[0].localizedPrice ?? "¥100");
      }

      // Check if already purchased
      await restorePurchases();
    } catch (e) {
      console.warn("IAP init error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const purchasePremium = useCallback(async (): Promise<boolean> => {
    if (!iapModule) {
      // Dev fallback: toggle premium
      if (__DEV__) {
        await AsyncStorage.setItem(STORAGE_KEY, "true");
        setIsPremium(true);
        return true;
      }
      return false;
    }

    try {
      // Set up purchase listener
      const purchaseListener = iapModule.purchaseUpdatedListener(
        async (purchase) => {
          if (purchase.productId === PRODUCT_ID) {
            await iapModule!.finishTransaction({ purchase });
            await AsyncStorage.setItem(STORAGE_KEY, "true");
            setIsPremium(true);
          }
        }
      );

      await iapModule.requestPurchase({
        sku: PRODUCT_ID,
        ...(Platform.OS === "ios" ? { andDangerouslyFinishTransactionAutomaticallyIOS: false } : {}),
      });

      // Clean up listener after a timeout
      setTimeout(() => purchaseListener.remove(), 60000);
      return true;
    } catch (e) {
      console.warn("Purchase error:", e);
      return false;
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    if (!iapModule) return;

    try {
      const purchases = await iapModule.getAvailablePurchases();
      const hasPremium = purchases.some((p) => p.productId === PRODUCT_ID);
      if (hasPremium) {
        await AsyncStorage.setItem(STORAGE_KEY, "true");
        setIsPremium(true);
      }
    } catch (e) {
      console.warn("Restore error:", e);
    }
  }, []);

  return { isPremium, isLoading, price, purchasePremium, restorePurchases };
}
