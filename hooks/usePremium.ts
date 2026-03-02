import { useEffect, useState, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";

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
  const [isIAPReady, setIsIAPReady] = useState(false);
  const [price, setPrice] = useState<string>("¥100");
  const listenerRef = useRef<ReturnType<typeof import("react-native-iap").purchaseUpdatedListener> | null>(null);

  useEffect(() => {
    // Check cached state first for fast startup
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === "true") setIsPremium(true);
    });
    initIAP();

    return () => {
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

      // Plan C: Flush any stuck/pending transactions to prevent UI freeze
      try {
        if (Platform.OS === "ios" && typeof (iapModule as any).clearTransactionIOS === "function") {
          await (iapModule as any).clearTransactionIOS();
        } else if (Platform.OS === "android" && typeof (iapModule as any).flushFailedPurchasesCachedAsPendingAndroid === "function") {
          await (iapModule as any).flushFailedPurchasesCachedAsPendingAndroid();
        }
      } catch (e) {
        console.warn("Transaction flush error:", e);
      }

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

      // Get product info — this confirms IAP is truly usable
      const products = await iapModule.getProducts({
        skus: [PRODUCT_ID],
      });
      if (products.length > 0) {
        setPrice(products[0].localizedPrice ?? "¥100");
        setIsIAPReady(true); // Only set ready when product is confirmed available
      } else {
        console.warn("IAP: product not found, IAP not ready");
        // Product not found — IAP is not usable
      }

      // Check if already purchased
      await restorePurchases();
    } catch (e) {
      console.warn("IAP init error:", e);
      iapModule = null;
      // isIAPReady stays false
    } finally {
      setIsLoading(false);
    }
  };

  const purchasePremium = useCallback(async (): Promise<boolean> => {
    // Dev fallback
    if (__DEV__ && !iapModule) {
      await AsyncStorage.setItem(STORAGE_KEY, "true");
      setIsPremium(true);
      return true;
    }

    if (!iapModule) {
      Alert.alert(
        "購入できません",
        "App Storeに接続できません。しばらく後でお試しください。"
      );
      return false;
    }

    try {
      // Fire-and-forget: StoreKit handles the purchase UI.
      // The purchaseUpdatedListener handles success (finishTransaction + setPremium).
      // No timeout — Sandbox takes 10-30s for password/confirmation.
      iapModule.requestPurchase({
        sku: PRODUCT_ID,
        ...(Platform.OS === "ios" ? { andDangerouslyFinishTransactionAutomaticallyIOS: false } : {}),
      }).catch((e) => {
        // User cancelled or StoreKit error — logged only, not surfaced as error
        console.warn("Purchase requestPurchase rejected:", e);
      });
      return true; // "purchase sheet launched" — not "purchase completed"
    } catch (e) {
      console.warn("Purchase launch error:", e);
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

  return { isPremium, isLoading, isIAPReady, price, purchasePremium, restorePurchases };
}
