import {Alert, Text, TextInput, TextInputProps, TouchableOpacity, View} from "react-native";
import useTailwindVars from "@/hooks/useTailwindVars";
import React, {useState} from "react";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';
import {useTranslation} from "@/i18n/translation";

const AdvancedInput = ({value, placeholder, onChangeText, maxLength = 500, style, ...rest}: TextInputProps) => {
    const [isPasting, setIsPasting] = useState(false);

    const { colors } = useTailwindVars();
    const {t} = useTranslation()

    // 清除所有内容
    const handleClear = () => {
        onChangeText?.('');
    };

    // 粘贴剪贴板内容
    const handlePaste = async () => {
        if (isPasting) return; // 防止重复点击

        setIsPasting(true);
        try {
            const clipboardContent = await Clipboard.getStringAsync();

            if (!clipboardContent || clipboardContent.trim() === '') {
                Alert.alert('提示', '剪贴板为空');
                return;
            }

            // 确保粘贴后不超过最大长度
            const currentText = value || '';
            const newText = currentText + clipboardContent;

            if ((newText.length || 0) <= maxLength) {
                onChangeText?.(newText);
            } else {
                // 截取到最大长度
                const trimmedText = newText.substring(0, maxLength);
                onChangeText?.(trimmedText);
                Alert.alert('提示', `粘贴内容过长，已自动截取到${maxLength}字符`);
            }
        } catch (error) {
            console.error('粘贴失败:', error);
            Alert.alert('错误', '粘贴失败，请重试');
        } finally {
            setIsPasting(false);
        }
    };

    return (
        <View style={style as any} className="bg-card p-5 rounded-xl border-grey5 border-[0.5px]">
            <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row gap-2">
                    {/* 粘贴按钮 */}
                    <TouchableOpacity
                        onPress={handlePaste}
                        disabled={isPasting}
                        className={'items-center flex-row gap-1 h-[17px] px-[8px] rounded-full bg-muted'}
                    >
                        <FontAwesome6
                            name="paste"
                            size={10}
                            color={isPasting ? colors['muted-foreground'] : colors['muted-foreground']}
                        />
                        <Text className={`text-sm ${isPasting ? 'text-muted-foreground' : 'text-foreground'}`}>
                            {isPasting ? t(`pasting`) + '...' : t('paste')}
                        </Text>
                    </TouchableOpacity>

                    {/* 清除按钮 - 只有当有内容时才显示 */}
                    {value?.length && (
                        <TouchableOpacity
                            onPress={handleClear}
                            className={'items-center flex-row gap-0.5 h-[17px] px-[8px] rounded-full bg-muted'}
                        >
                            <Ionicons name="close" size={14} color={colors['muted-foreground']}/>
                            <Text className="text-foreground text-sm">
                                {t('clear')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Text className="text-foreground/70 text-sm">
                    {value?.length || 0}/{maxLength || 0}
                </Text>
            </View>

            <TextInput
                className="text-foreground rounded-md text-md"
                style={[
                    // {lineHeight: 25, minHeight: 200},
                    style]}
                placeholder={placeholder}
                placeholderTextColor={colors.border}
                onChangeText={onChangeText}
                value={value}
                maxLength={maxLength}
                multiline
                {...rest}
            />
        </View>
    );
};

export default AdvancedInput;
