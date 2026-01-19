import {ActivityIndicator, Platform, StyleProp, Text, TouchableOpacity, View, ViewStyle} from 'react-native';
import useTailwindVars from "@/hooks/useTailwindVars";
import {ReactNode} from 'react';
import {HStack} from 'react-native-flex-layout';


const Button = (
    {
        children,
        text,
        disabled,
        loading,
        onPress,
        style,
    }: {
        children?: ReactNode;
        text?: string
        disabled?: boolean;
        loading?: boolean;
        onPress?: () => void;
        style?: StyleProp<ViewStyle>;
    }) => {

    const { colors } = useTailwindVars();

    const buttonStyle = {
        backgroundColor: disabled ? colors.border : colors.primary,
        // 阴影效果
        ...Platform.select({
            ios: {
                shadowColor: disabled ? 'transparent' : colors.primary,
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: disabled ? 0 : 0.3,
                shadowRadius: 4,
            },
            android: {
                elevation: disabled ? 0 : 4,
            },
        }),
    };

    return (
        <TouchableOpacity
            activeOpacity={disabled ? 1 : 0.8}
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            className="h-11 rounded-lg justify-center items-center flex-row"
            style={[buttonStyle, style]}
        >
            <View className={'gap-[8px] items-center flex-row'} >
                {loading && <ActivityIndicator color="#fff" size="small" />}
                {
                    text ?
                        <Text
                            className="text-[#fff] text-md font-semibold"
                            style={disabled ? {color: colors['muted-foreground']} : {}}
                        >
                            {text}
                        </Text>
                        :
                        children
                }
            </View>
        </TouchableOpacity>
    );
};

export default Button;
