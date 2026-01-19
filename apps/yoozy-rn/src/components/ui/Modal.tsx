import {
    Animated,
    TouchableOpacity,
    View,
    Text,
    Pressable,
    ViewStyle,
    Dimensions,
    Platform,
    KeyboardAvoidingView,
    Modal as RNModal
} from 'react-native';
import {ReactNode, useEffect, useRef} from 'react';
import useTailwindVars from "@/hooks/useTailwindVars";


// 定义可能的出现位置
type Position = 'top' | 'bottom';

interface CustomModalProps {
    visible?: boolean;
    onClose?: () => void;
    position?: Position;
    contentStyle?: ViewStyle;
    animationDuration?: number;
    backgroundOpacity?: number;
    closeOnBackdropPress?: boolean;
    useScale?: boolean;
    showIndicator?: boolean;
    children: ReactNode;
}

const Modal = ({
                   visible = false,
                   onClose,
                   position = 'bottom',
                   contentStyle,
                   animationDuration = 300,
                   backgroundOpacity = 0.6,
                   closeOnBackdropPress = true,
                   useScale = true,
                   showIndicator = true,
                   children,
               }: CustomModalProps) => {
    const animation = useRef(new Animated.Value(0)).current;
    const scaleAnimation = useRef(new Animated.Value(useScale ? 0.95 : 1)).current;
    const {height} = Dimensions.get('window');
    const { colors } = useTailwindVars();

    useEffect(() => {
        if (visible) {
            animation.setValue(0);
            scaleAnimation.setValue(useScale ? 0.95 : 1);

            Animated.parallel([
                Animated.timing(animation, {
                    toValue: 1,
                    duration: animationDuration,
                    useNativeDriver: true,
                }),
                ...(useScale ? [
                    Animated.spring(scaleAnimation, {
                        toValue: 1,
                        tension: 100,
                        friction: 8,
                        useNativeDriver: true,
                    })
                ] : []),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(animation, {
                    toValue: 0,
                    duration: animationDuration,
                    useNativeDriver: true,
                }),
                ...(useScale ? [
                    Animated.timing(scaleAnimation, {
                        toValue: 0.95,
                        duration: animationDuration,
                        useNativeDriver: true,
                    })
                ] : []),
            ]).start();
        }
    }, [visible, animationDuration, useScale]);

    // 计算从哪个方向滑入
    const translateY = animation.interpolate({
        inputRange: [0, 1],
        outputRange: position === 'bottom' ? [height, 0] : [-height, 0],
    });

    const overlayOpacity = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, backgroundOpacity],
    });

    // 内容样式基于位置
    const positionStyle: ViewStyle = {
        ...(position === 'top' ? {top: 0} : {bottom: 0}),
        left: 0,
        right: 0,
        position: 'absolute',
    };

    // 内容边框圆角基于位置
    const borderRadiusStyle: ViewStyle = {
        ...(position === 'top'
            ? {
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
            }
            : {
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
            }),
    };

    const modalContainerStyle = {
        flex: 1,
        justifyContent: position === 'top' ? 'flex-start' : 'flex-end',
    } as any;

    const pressableOverlayStyle = {
        position: 'absolute' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    };

    const modalContentStyle = {
        backgroundColor: colors.card,
        position: 'relative' as const,
        zIndex: 1002,
        overflow: 'hidden' as const,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: position === 'bottom' ? -4 : 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 15,
        minHeight: 100,
        paddingTop: position === 'top' ? 20 : 12,
        paddingBottom: position === 'bottom' ? 20 : 12,
    };

    return (
        <RNModal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={modalContainerStyle}>
                {/* 改进的蒙层部分 */}
                <Animated.View
                    style={[
                        {
                            opacity: overlayOpacity,
                            ...pressableOverlayStyle,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            pointerEvents: 'auto' as const,
                            zIndex: 1001,
                        },
                    ]}
                >
                    <Pressable style={pressableOverlayStyle} onPress={closeOnBackdropPress ? onClose : undefined}/>
                </Animated.View>


                <Animated.View
                    style={[
                        modalContentStyle,
                        positionStyle,
                        borderRadiusStyle,
                        {
                            transform: [
                                {translateY},
                                {scale: scaleAnimation}
                            ]
                        },
                        contentStyle,
                    ]}
                    className="overflow-hidden"
                    pointerEvents="auto"
                >
                    {/* 添加顶部指示器（仅bottom位置） */}
                    {position === 'bottom' && showIndicator && (
                        <View className="items-center">
                            <View
                                className="w-10 h-1 rounded-full"
                                style={{backgroundColor: colors['muted-foreground']}}
                            />
                        </View>
                    )}

                    {children}
                </Animated.View>
            </View>
        </RNModal>
    );
};

export default Modal;
