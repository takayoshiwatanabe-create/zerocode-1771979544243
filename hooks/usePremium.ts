import { useEffect, useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const PRODUCT_ID = "com.zerocode.myapp.premium";
const STORAGE_KEY = "isPremium";
const PURCHASE_TIMEOUT_MS = 30000;

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
  const listenerRef = useRef<ReturnType<typeof import("react-native-iap").purchaseUpdatedListener> | null>(null);

  useEffect(() => {
    // Check cached state first for fast startup
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === "true") setIsPremium(true);
    });
    initIAP();

    return () => {
      // Clean up listener on unmount
      listenerRef.current?.remove();
    };
  }, []);

  const initIAP = async () => {
    try {
      await loadIAP();
      if (!iapModule) {
        setIsLoading(false);
        return;
      }

      await iapModule.initConnection();

      // Set up a single persistent purchase listener
      listenerRef.current = iapModule.purchaseUpdatedListener(
        async (purchase) => {
          try {
            if (purchase.productId === PRODUCT_ID) {
              await iapModule!.finishTransaction({ purchase });
              await AsyncStorage.setItem(STORAGE_KEY, "true");
              setIsPremium(true);
            }
          } catch (e) {
            console.warn("Purchase listener error:", e);
          }
        }
      );

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
      // Connection failed — nullify module to prevent broken requestPurchase calls
      iapModule = null;
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
      // Race requestPurchase against a timeout to prevent hanging
      const purchasePromise = iapModule.requestPurchase({
        sku: PRODUCT_ID,
        ...(Platform.OS === "ios" ? { andDangerouslyFinishTransactionAutomaticallyIOS: false } : {}),
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Purchase timeout")), PURCHASE_TIMEOUT_MS)
      );

      await Promise.race([purchasePromise, timeoutPromise]);
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
