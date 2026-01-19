import { StripeProvider } from "@stripe/stripe-react-native";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";

import { addEvent } from "@/api/event";
import ErrorFallback from "@/components/ErrorCallback";

import { usePermissionExecutor } from "@/hooks/usePermissionExecutor";
import { useSettings } from "@/hooks/useSettings";
import { useThemeMode } from "@/hooks/useThemeMode";
import { initVideoCache } from "@/utils/videoCache";
import AppThemeProvider from "@/providers/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient } from "@tanstack/react-query";
import {
  PersistedClient,
  Persister,
  persistQueryClient,
  PersistQueryClientProvider,
} from "@tanstack/react-query-persist-client";
import {
  Text,
  TextInput,
  View,
  Image,
  ActivityIndicator
} from "react-native";
import ErrorBoundary from "react-native-error-boundary";
import "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ToastProvider } from "react-native-toast-notifications";

// @ts-ignore
Text.defaultProps = Text.defaultProps || {};
// @ts-ignore
Text.defaultProps.allowFontScaling = false;
// @ts-ignore
TextInput.defaultProps = TextInput.defaultProps || {};
// @ts-ignore
TextInput.defaultProps.allowFontScaling = false;

// export {
//     // Catch any errors thrown by the Layout component.
//     ErrorBoundary,
// } from "expo-router";

// export const unstable_settings = {
//     // Ensure that reloading on `/modal` keeps a back button present.
//     initialRouteName: '/home',
// };

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const createAsyncStoragePersister = (): Persister => {
    return {
      persistClient: async (client: PersistedClient) => {
        try {
          await AsyncStorage.setItem(
            "REACT_QUERY_OFFLINE_CACHE",
            JSON.stringify(client)
          );
        } catch (error) {
          console.error("Error persisting cache:", error);
        }
      },
      restoreClient: async () => {
        try {
          const stringifiedClient = await AsyncStorage.getItem(
            "REACT_QUERY_OFFLINE_CACHE"
          );
          if (stringifiedClient) {
            return JSON.parse(stringifiedClient);
          }
        } catch (error) {
          console.error("Error restoring cache:", error);
        }
        return undefined;
      },
      removeClient: async () => {
        try {
          await AsyncStorage.removeItem("REACT_QUERY_OFFLINE_CACHE");
        } catch (error) {
          console.error("Error removing cache:", error);
        }
      },
    };
  };

  const persister = createAsyncStoragePersister();

  const queryClient = new QueryClient();

  persistQueryClient({
    queryClient: queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    buster: "",
    hydrateOptions: undefined,
    dehydrateOptions: {
      shouldDehydrateQuery: (query) => {
        // 只持久化特定的查询
        return ["myself", "items"].includes(query.queryKey[0] as string);
      },
    },
  });

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <ToastProvider>
        <SafeAreaProvider>
          <StripeProvider
            publishableKey="pk_live_KjsKZTP7GpgdW4PoYATjVfLK"
            merchantIdentifier="com.veogo.app"
          >
            <AppThemeProvider>
              <RootLayoutNav />
            </AppThemeProvider>
          </StripeProvider>
        </SafeAreaProvider>
      </ToastProvider>
    </PersistQueryClientProvider>
  );
}

function RootLayoutNav() {
  const { colors } = useTailwindVars();
  useThemeMode();

  const { fetchAsync: fetchSettings } = useSettings();

  const [appReady, setAppReady] = useState<boolean>(false);

  usePermissionExecutor({
    onAllGranted: () => {
      console.log("--------------- 权限已获取");
      void addEvent({ name: "visit" });
    },
    onElse: () => {
      void addEvent({ name: "visit" });
    },
  });
  // const {fetchAsync: fetchAccounts} = useAccounts();

  useEffect(() => {
    // SplashScreen.hideAsync();
    // void checkToUpdate();
    void load();
    // void addEvent({name: "visit"})
  }, []);

  const load = async () => {
    await fetchSettings();
    void initVideoCache();
    // await fetchAccounts()

    setTimeout(() => {
      setAppReady(true);
    }, 1000);
  };

  // 显示自定义启动屏幕
  if (!appReady) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <SafeAreaView
          edges={["top", "bottom"]}
          style={{
            flex: 1,
            backgroundColor: colors.background,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <View className="items-center justify-center">
            <View 
              style={{
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 24,
                elevation: 10,
              }}
              className="bg-card p-6 rounded-[40px] mb-8"
            >
              <Image 
                source={require("../assets/images/app_icon.png")}
                style={{ width: 100, height: 100, borderRadius: 24 }}
              />
            </View>
            
            <View className="items-center">
              <Text 
                className="text-3xl font-black tracking-tighter mb-2"
                style={{ color: colors.foreground }}
              >
                YOOZY
              </Text>
             
            </View>
          </View>
        </SafeAreaView>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      {/* <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      > */}
      {/*<OngoingQuestion/>*/}
      {/* <StatusBar
          // Default status bar style, pages can override
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor="transparent"
          translucent={true}
        /> */}
      <Stack
        screenOptions={{
          headerShown: false,
          // headerStyle: {
          //   backgroundColor: colors.background,
          // },
          // headerTintColor: grey0,
          // headerLeft: ({ canGoBack }) =>
          //   canGoBack ? (
          //     <TouchableOpacity
          //       onPress={() => {
          //         router.back();
          //       }}
          //       style={{
          //         // width: 20,
          //         // height: 20,
          //         justifyContent: "center",
          //         alignItems: "center",
          //         marginLeft: Platform.OS === "ios" ? 0 : 8,
          //       }}
          //       hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          //     >
          //       <Feather name="arrow-left" size={24} color={grey0} />
          //     </TouchableOpacity>
          //   ) : null,
          // contentStyle: {
          //   backgroundColor: colors.background,
          // }
        }}
      >
        {/* <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          /> */}

        {/* <Stack.Screen
            name="session/starter"
            options={{
              headerShown: false,
              animation: "fade",
              animationDuration: 1,
            }}
          /> */}
        {/* <Stack.Screen
            name="session/[id]/index"
            options={{
              headerShown: false,
              animation: "fade",
              animationDuration: 1,
            }}
          /> */}
        {/* <Stack.Screen
            name="commodity/[id]"
            options={{
              headerTitle: "商品详情",
            }}
          /> */}
        {/* <Stack.Screen
            name="commodity/create"
            options={{
              headerTitle: "添加商品",
            }}
          />
          <Stack.Screen
            name="inspiration/[id]"
            options={{
              headerShown: false,
            }}
          /> */}

        {/* <Stack.Screen
            name="template/[id]"
            options={{
              title: t("details"),
            }}
          />
          <Stack.Screen
            name="settings/index"
            // @ts-ignore
            options={({ navigation }) => ({
              // headerShown: false,
              title: null,
            })}
          /> */}
        {/* <Stack.Screen
            name="user/me"
            options={({ navigation }) => ({
              headerTitle: t("user.profile"),
            })}
          />

          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
              animation: "slide_from_bottom",
            }}
          /> */}

        {/* <Stack.Screen
            name="(other)/accountAndSecure"
            options={{
              title: t("accountAndSecure"),
            }}
          />
          <Stack.Screen
            name="(other)/deleteAccount"
            options={{
              title: t("deleteAccount"),
            }}
          />
          <Stack.Screen
            name="(other)/community"
            options={{
              title: t("creatorCommunity"),
            }}
          />
          <Stack.Screen
            name="(other)/sub_terms"
            options={{
              title: t("subTerms"),
            }}
          />
          <Stack.Screen
            name="(other)/contact"
            options={{
              title: t("contactUs"),
            }}
          />
          <Stack.Screen
            name="(other)/problem"
            options={{
              title: t("faq"),
            }}
          />
          <Stack.Screen
            name="(other)/privacy"
            options={{
              title: t("privacyPolicy"),
            }}
          />
          <Stack.Screen
            name="(other)/terms"
            options={{
              title: t("serviceTerms"),
            }}
          />
          <Stack.Screen
            name="(other)/about"
            options={{
              title: t("aboutUs"),
            }}
          /> */}
      </Stack>
      {/* </View> */}
    </ErrorBoundary>
  );
}
