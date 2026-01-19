import AppleLogin from "@/components/AppleLogin";
import useTailwindVars from "@/hooks/useTailwindVars";
import { useTranslation } from "@/i18n/translation";
import {
  useLoginWithEmail,
  useLoginWithPhone,
  useSendCodeWithEmail,
  useSendCodeWithPhone,
} from "@/reactQuery/user";
import { Feather, Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "react-native-toast-notifications";
import { z } from "zod";
import Error from "@/components/RormValidationError";
import { useAuthUser } from "@/hooks/useAuthUser";

type LoginType = "email" | "phone";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [loginType, setLoginType] = useState<LoginType>("phone");
  const [countdown, setCountdown] = useState(0);
  const [isAgreed, setIsAgreed] = useState(false);
  const { colors } = useTailwindVars();
  const { refreshUser } = useAuthUser();

  const { t } = useTranslation();

  const loginSchema = z.object({
    email: z.string().optional(),
    code: z.string().length(6, t("codeFormatError")),
    phone: z.string().optional(),
  });

  const {
    mutate: loginWithEmail,
    isPending: isEmailLoginPending,
    isSuccess: isEmailLoginSuccess,
    isError: isEmailLoginError,
  } = useLoginWithEmail();

  const {
    mutate: loginWithPhone,
    isPending: isPhoneLoginPending,
    isSuccess: isPhoneLoginSuccess,
    isError: isPhoneLoginError,
  } = useLoginWithPhone();

  const isLoginPending =
    loginType === "email" ? isEmailLoginPending : isPhoneLoginPending;
  const isLoginSuccess =
    loginType === "email" ? isEmailLoginSuccess : isPhoneLoginSuccess;
  const isLoginError =
    loginType === "email" ? isEmailLoginError : isPhoneLoginError;
    
  const {
    mutate: sendEmailCode,
    isPending: isSendEmailPending,
    isSuccess: isSendEmailSuccess,
    isError: isSendEmailError,
  } = useSendCodeWithEmail();

  const {
    mutate: sendPhoneCode,
    isPending: isSendPhonePending,
    isSuccess: isSendPhoneSuccess,
    isError: isSendPhoneError,
  } = useSendCodeWithPhone();

  const isSendCodePending =
    loginType === "email" ? isSendEmailPending : isSendPhonePending;
  const isSendCodeSuccess =
    loginType === "email" ? isSendEmailSuccess : isSendPhoneSuccess;
  const isSendCodeError =
    loginType === "email" ? isSendEmailError : isSendPhoneError;
    
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      code: "",
      phone: "",
    },
  });

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [countdown]);

  useEffect(() => {
    if (isSendCodeSuccess) {
      setCountdown(60);
      Toast.show(t("codeSentSuccess"));
    }
    if (isSendCodeError) {
      Toast.show(t("codeSentFail"));
    }
    if (isLoginError) {
      Toast.show(t("loginFail"));
    }
  }, [isSendCodeSuccess, isSendCodeError, isLoginError]);

  useEffect(() => {
    if (isLoginSuccess) {
      onLoginSuccess();
    }
  }, [isLoginSuccess]);

  const onLoginSuccess = async () => {
    await refreshUser();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.dismissTo("/");
    }
  };

  const onClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const handleSendCode = () => {
    if (loginType === "email") {
      sendEmailCode({ email: loginForm.getValues("email") as string });
    } else {
      sendPhoneCode({ phone: loginForm.getValues("phone") as string });
    }
  };

  const isEmailValid = () => {
    const email = loginForm.getValues("email") || "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPhoneValid = () => {
    const phone = loginForm.getValues("phone") || "";
    return phone.length === 11;
  };

  const buttonEnabled = () => {
    if (!isAgreed) return false;
    const code = loginForm.getValues("code");
    if (loginType === "email") {
      return code.length === 6 && isEmailValid();
    }
    if (loginType === "phone") {
      return code.length === 6 && isPhoneValid();
    }
    return false;
  };

  loginForm.watch();

  const submit = async (val: {
    email?: string;
    phone?: string;
    code: string;
  }) => {
    if (loginType === "email") {
      if (!val.email || !isEmailValid()) {
        loginForm.setError("email", { message: t("emailFormatError") });
        return;
      }
      loginWithEmail({ email: val.email, code: val.code });
    } else {
      if (!val.phone || !isPhoneValid()) {
        loginForm.setError("phone", { message: t("phoneFormatError") });
        return;
      }
      loginWithPhone({ phone: val.phone, code: val.code });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-4 py-2 flex-row justify-between items-center">
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 items-center justify-center rounded-full bg-muted"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="x" size={20} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 40, paddingBottom: 40 }}
        >
          {/* Welcome Text */}
          <View className="mb-12">
            <Text className="text-foreground text-3xl font-bold mb-2">
              {t("login")}
            </Text>
            <Text className="text-muted-foreground text-base">
              欢迎回来，请使用手机号登录
            </Text>
          </View>

          {/* Login Type Switcher - Temporarily Hidden */}
          {/* <View className="flex-row bg-muted rounded-2xl p-1.5 mb-8">
            ...
          </View> */}

          {/* Form Content */}
          <View className="gap-5">
            {loginType === "phone" ? (
              <Controller
                name="phone"
                control={loginForm.control}
                render={({ field, fieldState }) => (
                  <View>
                    <View className="flex-row bg-muted rounded-2xl items-center px-5 h-14 border border-transparent focus:border-primary">
                      <Text className="text-foreground text-lg font-bold mr-3">+86</Text>
                      <View className="w-[1px] h-4 bg-muted-foreground/20 mr-4" />
                      <TextInput
                        className="flex-1 text-foreground text-lg font-bold p-0"
                        placeholder={t("inputPhone")}
                        placeholderTextColor={colors['muted-foreground']}
                        value={field.value}
                        onChangeText={(e) => field.onChange(e.trim())}
                        keyboardType="phone-pad"
                        maxLength={11}
                        underlineColorAndroid="transparent"
                        style={{ textAlignVertical: 'center' }}
                      />
                    </View>
                    <Error className="mt-1 ml-2" fieldState={fieldState} />
                  </View>
                )}
              />
            ) : (
              <Controller
                name="email"
                control={loginForm.control}
                render={({ field, fieldState }) => (
                  <View>
                    <View className="bg-muted rounded-2xl px-5 h-14 border border-transparent">
                      <TextInput
                        className="h-full text-foreground text-base font-medium"
                        placeholder={t("inputEmail")}
                        placeholderTextColor={colors['muted-foreground']}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={field.value}
                        onChangeText={(e) => field.onChange(e.trim())}
                      />
                    </View>
                    <Error className="mt-1 ml-2" fieldState={fieldState} />
                  </View>
                )}
              />
            )}

            <Controller
              name="code"
              control={loginForm.control}
              render={({ field, fieldState }) => (
                <View>
                  <View className="flex-row gap-3">
                    <View className="flex-1 bg-muted rounded-2xl px-5 h-14">
                      <TextInput
                        className="h-full text-foreground text-base font-medium"
                        placeholder={t("inputCode")}
                        placeholderTextColor={colors['muted-foreground']}
                        value={field.value}
                        onChangeText={(e) => field.onChange(e.trim())}
                        keyboardType="number-pad"
                        maxLength={6}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={handleSendCode}
                      disabled={
                        loginType === "email"
                          ? !isEmailValid() || countdown > 0
                          : !isPhoneValid() || countdown > 0
                      }
                      className={`px-5 h-14 rounded-2xl items-center justify-center ${
                        (loginType === "email" ? isEmailValid() : isPhoneValid()) && countdown === 0
                          ? "bg-primary"
                          : "bg-primary/20"
                      }`}
                    >
                      {isSendCodePending ? (
                        <ActivityIndicator color={colors.card} size="small" />
                      ) : (
                        <Text className={`font-bold ${
                          (loginType === "email" ? isEmailValid() : isPhoneValid()) && countdown === 0
                            ? "text-white"
                            : "text-primary"
                        }`}>
                          {countdown > 0
                            ? `${countdown}s`
                            : t("getCode")}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  <Error className="mt-1 ml-2" fieldState={fieldState} />
                </View>
              )}
            />
          </View>

          {/* Terms Agreement */}
          <TouchableOpacity 
            onPress={() => setIsAgreed(!isAgreed)}
            activeOpacity={0.8}
            className="flex-row items-start mt-8 px-1"
          >
            <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mt-0.5 ${
              isAgreed ? "bg-primary border-primary" : "border-muted-foreground/30"
            }`}>
              {isAgreed && <Ionicons name="checkmark" size={12} color="white" />}
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-muted-foreground text-[13px] leading-5">
                {t("agreeTerms")}
                <Text onPress={() => router.push('/terms' as any)} className="text-primary font-bold">{t("terms")}</Text>
                {t("and")}
                <Text onPress={() => router.push('/privacy' as any)} className="text-primary font-bold">{t("privacy")}</Text>
              </Text>
            </View>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={loginForm.handleSubmit(submit)}
            disabled={!buttonEnabled() || isLoginPending}
            className={`h-14 rounded-2xl items-center justify-center mt-10 shadow-lg shadow-primary/20 ${
              buttonEnabled() ? "bg-primary" : "bg-primary/40"
            }`}
          >
            {isLoginPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">
                {t("login")}
              </Text>
            )}
          </TouchableOpacity>

          {/* Other Login Methods */}
          {Platform.OS === "ios" && (
            <View className="mt-16">
              <View className="flex-row items-center mb-8">
                <View className="flex-1 h-[1px] bg-muted-foreground/10" />
                <Text className="mx-4 text-muted-foreground text-xs uppercase tracking-widest">{t("otherLogin")}</Text>
                <View className="flex-1 h-[1px] bg-muted-foreground/10" />
              </View>
              <View className="flex-row justify-center">
                <AppleLogin onSuccess={onLoginSuccess} />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
