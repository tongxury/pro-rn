import React from 'react';
import useTailwindVars from "@/hooks/useTailwindVars";
import {View, Text, Image, TouchableOpacity, ScrollView, Modal, Animated, Dimensions, Platform} from 'react-native';
import {AntDesign} from '@expo/vector-icons';
import {router} from 'expo-router';

import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
interface MenuItem {
    title: string;
    route?: string;
    isHighlight?: boolean;
    isDanger?: boolean;
}

const menuItems: MenuItem[][] = [
    [
        {
            title: '即刻成为可灵AI会员',
            route: 'vip',
            isHighlight: true,
        },
    ],
    [
        {
            title: '灵感值中心',
            route: 'spirit-center',
        },
        {
            title: '支付与订阅',
            route: 'payment',
        },
    ],
    [
        {
            title: '通知中心',
            route: 'notifications',
        },
        {
            title: '使用指南',
            route: 'guide',
        },
        {
            title: '创作者社区',
            route: 'community',
        },
        {
            title: '联系我们',
            route: 'contact',
        },
    ],
    [
        {
            title: '权限列表',
            route: 'permissions',
        },
        {
            title: '隐私政策',
            route: 'privacy',
        },
        {
            title: '服务条款',
            route: 'terms',
        },
        {
            title: '第三方数据合作清单',
            route: 'third-party',
        },
        {
            title: '关于我们',
            route: 'about',
        },
    ],
    [
        {
            title: '退出登录',
            isDanger: true,
        },
    ],
];

interface Props {
    visible: boolean;
    onClose: () => void;
}

export default function MyDrawer({visible, onClose}: Props) {
    const { colors } = useTailwindVars();
    const [slideAnim] = React.useState(new Animated.Value(-300));
    const screenWidth = Dimensions.get('window').width;
    const drawerWidth = screenWidth * 0.8;
    const insets = useSafeAreaInsets();

    React.useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -drawerWidth,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, drawerWidth]);

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: -drawerWidth,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    const handleMenuPress = (item: MenuItem) => {
        if (item.route) {
            // @ts-ignore
            router.push(item.route);
            handleClose();
        } else if (item.isDanger) {
            // 处理退出登录
            console.log('退出登录');
            handleClose();
        }
    };

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
            <View className="flex-1 bg-divider/30">
                <TouchableOpacity className="flex-1" activeOpacity={1} onPress={handleClose}>
                    <Animated.View
                        style={[
                            {
                                width: drawerWidth,
                                transform: [{translateX: slideAnim}],
                                backgroundColor: colors.background,
                                height: '100%',
                                paddingTop: insets.top,
                            },
                        ]}
                    >
                        <TouchableOpacity activeOpacity={1}>
                            <ScrollView>
                                {/* 用户信息 */}
                                <View className="p-4 mb-4">
                                    <View className="flex-row items-center">
                                        <Image
                                            source={{
                                                uri: 'https://sns-avatar-qc.xhscdn.com/avatar/1040g2jo31cfhtn0h0u005n3e5bl409nt8kpaf4g?imageView2/2/w/120/format/jpg',
                                            }}
                                            className="w-12 h-12 rounded-full"
                                        />
                                        <View className="ml-3">
                                            <Text className="text-white text-lg">爱剪辑</Text>
                                            <Text className="text-gray-400">ID 2149970099</Text>
                                        </View>
                                        <Text className="ml-auto text-[#4CAF50] text-lg">66.00</Text>
                                    </View>
                                </View>

                                {/* 菜单列表 */}
                                {menuItems.map((section, sectionIndex) => (
                                    <View key={sectionIndex} className="mb-6">
                                        {section.map((item, itemIndex) => (
                                            <TouchableOpacity
                                                key={itemIndex}
                                                onPress={() => handleMenuPress(item)}
                                                className={`px-4 py-3 flex-row items-center justify-between ${
                                                    item.isHighlight ? 'bg-[#FFE4B5]/10' : ''
                                                }`}
                                            >
                                                <View className="flex-row items-center">
                                                    {item.isHighlight && (
                                                        <AntDesign
                                                            name="star"
                                                            size={20}
                                                            color="#FFD700"
                                                            className="mr-2"
                                                        />
                                                    )}
                                                    <Text
                                                        className={`text-base ${
                                                            item.isDanger
                                                                ? 'text-red-500'
                                                                : item.isHighlight
                                                                ? 'text-[#FFD700]'
                                                                : 'text-white'
                                                        }`}
                                                    >
                                                        {item.title}
                                                    </Text>
                                                </View>
                                                {item.isHighlight && (
                                                    <AntDesign name="right" size={16} color="#FFD700" />
                                                )}
                                                {!item.isHighlight && item.route && (
                                                    <AntDesign name="right" size={16} color="#666" />
                                                )}
                                                {item.title === '灵感值中心' && (
                                                    <Text className="text-[#4CAF50]">166.00</Text>
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ))}
                            </ScrollView>
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableOpacity>
            </View>
        </Modal>
    );
}
