import React, {useEffect, useState} from "react";
import {
    ActivityIndicator,
    Platform,
    Pressable,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {zodResolver} from "@hookform/resolvers/zod";
import {router} from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";
import Error from "../components/RormValidationError";
import {
    useLoginWithEmail,
    useLoginWithPhone,
    useSendCodeWithEmail,
    useSendCodeWithPhone,
} from "@/reactQuery/user";
import {Toast} from "react-native-toast-notifications";
import AppleLogin from "@/components/AppleLogin";
import {useTranslation} from "@/i18n/translation";
import {useColors} from "@/hooks/uesColors";
import {Feather} from "@expo/vector-icons";

type LoginType = "email" | "phone";

export default function LoginScreen() {
    const insets = useSafeAreaInsets();
    const [loginType, setLoginType] = useState<LoginType>("phone");
    const [countdown, setCountdown] = useState(0);
    const [isAgreed, setIsAgreed] = useState(false);
    const {white} = useColors();

    const {t} = useTranslation();

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

    // 监听发送验证码的状态
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
            onLoginSuccess()
        }
    }, [isLoginSuccess]);

    const onLoginSuccess = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.dismissTo("/");
        }
    }

    const onClose = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace("/");
        }
    }


    const handleSendCode = () => {
        if (loginType === "email") {
            // @ts-ignore
            sendEmailCode({email: loginForm.getValues("email")});
        } else {
            // @ts-ignore
            sendPhoneCode({phone: loginForm.getValues("phone")});
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

    const buttonDisabled = () => {
        if (!isAgreed) return false;

        if (loginType === "email") {
            return loginForm.getValues("code").length === 6 && isEmailValid();
        }
        if (loginType === "phone") {
            return loginForm.getValues("code").length === 6 && isPhoneValid();
        }
        return false;
    };

    loginForm.watch();

    const submit = async (val: {
        email?: string;
        phone?: string;
        code: string;
    }) => {
        // 手动验证当前登录类型的字段
        if (loginType === "email") {
            if (!val.email || !isEmailValid()) {
                loginForm.setError("email", {message: t("emailFormatError")});
                return;
            }
            loginWithEmail({email: val.email, code: val.code});
        } else {
            if (!val.phone || !isPhoneValid()) {
                loginForm.setError("phone", {message: t("phoneFormatError")});
                return;
            }
            loginWithPhone({phone: val.phone, code: val.code});
        }
    };

    return (
        <View className="flex-1 bg-background justify-center">
            <View className="flex-1 content-center">
                <View
                    className="flex-row items-center px-4"
                    style={{}}
                >
                    <TouchableOpacity
                        onPress={() => onClose()}
                        className="w-10 h-10 items-center justify-center"
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    >
                        <Feather name="x" size={24} color={white}/>
                    </TouchableOpacity>
                </View>

                <View className="px-6 mt-20">
                    <View>
                        <Text className="text-white text-2xl font-semibold mb-8">
                            {loginType === "phone" ? t("loginPhone") : t("loginEmail")}
                        </Text>

                        {/* 登录方式切换 */}
                        <View className="flex-row bg-grey5 rounded-lg p-1 mb-6">
                            <Pressable
                                onPress={() => {
                                    setLoginType("phone");
                                    // 切换时清除邮箱字段
                                    loginForm.setValue("email", "");
                                }}
                                style={({pressed}) => [
                                    {
                                        opacity: pressed ? 0.8 : 1,
                                    },
                                ]}
                                className={`flex-1 py-3 rounded-md items-center ${
                                    loginType === "phone" ? "bg-primary" : ""
                                }`}
                            >
                                <Text className="text-white">{t("phone")}</Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    setLoginType("email");
                                    // 切换时清除手机号字段
                                    loginForm.setValue("phone", "");
                                }}
                                style={({pressed}) => [
                                    {
                                        opacity: pressed ? 0.8 : 1,
                                    },
                                ]}
                                className={`flex-1 py-3 rounded-md items-center ${
                                    loginType === "email" ? "bg-primary" : ""
                                }`}
                            >
                                <Text className="text-white">{t("email")}</Text>
                            </Pressable>

                        </View>

                        {/* 输入框 */}
                        {loginType === "phone" ? (
                            <Controller
                                name="phone"
                                control={loginForm.control}
                                render={({field, fieldState}) => (
                                    <View className="flex-row bg-grey5 rounded-lg mb-6 items-center px-4">
                                        <Text className="text-white text-base">+86</Text>
                                        <TextInput
                                            className="flex-1 h-12 text-white text-base ml-3"
                                            placeholder={t("inputPhone")}
                                            placeholderTextColor="#666"
                                            value={field.value}
                                            onChangeText={(e) => {
                                                field.onChange(e.trim());
                                            }}
                                            keyboardType="phone-pad"
                                            maxLength={11}
                                        />
                                    </View>
                                )}
                            />
                        ) : (
                            <Controller
                                name="email"
                                control={loginForm.control}
                                render={({field, fieldState}) => (
                                    <View className="mb-6">
                                        <View className="bg-grey5 rounded-lg">
                                            <View>
                                                <TextInput
                                                    className="h-12 text-white text-base px-4"
                                                    placeholder={t("inputEmail")}
                                                    placeholderTextColor="#666"
                                                    keyboardType="email-address"
                                                    autoCapitalize="none"
                                                    value={field.value}
                                                    onChangeText={(e) => {
                                                        field.onChange(e.trim());
                                                    }}
                                                />
                                            </View>
                                        </View>
                                        <Error className="mt-2" fieldState={fieldState}/>
                                    </View>
                                )}
                            />
                        )}
                        <Controller
                            name="code"
                            control={loginForm.control}
                            render={({field, fieldState}) => (
                                <View className="mb-6">
                                    <View className="flex-row">
                                        <View className="flex-1 bg-grey5 rounded-lg mr-3">
                                            <TextInput
                                                className="h-12 text-white text-base px-4"
                                                placeholder={t("inputCode")}
                                                placeholderTextColor="#666"
                                                value={field.value}
                                                onChangeText={(e) => {
                                                    field.onChange(e.trim());
                                                }}
                                                keyboardType="number-pad"
                                                maxLength={6}
                                            />
                                        </View>
                                        <TouchableOpacity
                                            style={{
                                                opacity:
                                                    loginType === "email"
                                                        ? !isEmailValid() || countdown > 0
                                                            ? 0.5
                                                            : 1
                                                        : !isPhoneValid() || countdown > 0
                                                            ? 0.5
                                                            : 1,
                                            }}
                                            className={`w-28 h-12 rounded-lg items-center justify-center bg-primary`}
                                            onPress={handleSendCode}
                                            disabled={
                                                loginType === "email"
                                                    ? !isEmailValid() || countdown > 0
                                                    : !isPhoneValid() || countdown > 0
                                            }
                                        >
                                            {isSendCodePending ? (
                                                <ActivityIndicator color="#fff" size="small"/>
                                            ) : (
                                                <Text className="text-white text-sm">
                                                    {countdown > 0
                                                        ? `${countdown}${t("resendCode")}`
                                                        : t("getCode")}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                    <Error className="mt-2" fieldState={fieldState}/>
                                </View>
                            )}
                        />

                        {/* 服务条款 */}
                        <View className="flex-row items-center mb-12">
                            <TouchableOpacity
                                onPress={() => setIsAgreed(!isAgreed)}
                                className="w-4 h-4 border border-[#666] rounded-full mr-2 items-center justify-center"
                            >
                                {isAgreed && (
                                    <View
                                        className={`w-2.5 h-2.5 rounded-full ${
                                            isAgreed ? "bg-primary" : "bg-transparent"
                                        }`}
                                    />
                                )}
                            </TouchableOpacity>
                            <Text className="text-[#666]">
                                {t("agreeTerms")}
                                <Text className="text-primary">{t("terms")}</Text>
                                {t("and")}
                                <Text className="text-primary">{t("privacy")}</Text>
                            </Text>
                        </View>

                        {/* 下一步按钮 */}
                        <TouchableOpacity
                            className={`h-12 rounded-lg items-center justify-center mb-6 bg-primary flex-row ${
                                buttonDisabled() ? "1" : "opacity-50"
                            }`}
                            onPress={loginForm.handleSubmit(submit)}
                            disabled={!buttonDisabled()}
                        >
                            {isLoginPending && (
                                <ActivityIndicator color="#fff" size="small"/>
                            )}
                            <Text className="text-white text-base font-medium">
                                {t("login")}
                            </Text>
                        </TouchableOpacity>

                        {/* 其他登录方式 */}
                    </View>
                </View>
            </View>

            {/* 其他登录方式放到底部 */}
            {Platform.OS === "ios" && (
                <View className="pb-8" style={{marginBottom: insets.bottom}}>
                    <Text className="text-grey2 text-center mb-6">{t("otherLogin")}</Text>
                    <View className="flex-row justify-center">
                        <AppleLogin onSuccess={onLoginSuccess}/>
                    </View>
                </View>
            )}
        </View>
    );
}
