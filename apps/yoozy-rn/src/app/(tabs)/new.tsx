import ScreenContainer from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import useTailwindVars from "@/hooks/useTailwindVars";

import { useTranslation } from "@/i18n/translation";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

// 功能项配置
const FEATURE_ITEMS = [
  {
    id: "segment-replication",
    icon: "sparkles",
    sparkle: true,
    title: "高光视频复刻",
    subtitle: "复刻同款爆款视频",
    route: "/create/segment-replication",
  },
  {
    id: "douyin-downloader",
    icon: "download-outline",
    sparkle: false,
    title: "抖音去水印下载",
    subtitle: "一键保存无水印原片",
    route: "/toolkit/douyin_downloader",
  },
  {
    id: "video-generation",
    icon: "play",
    sparkle: true,
    title: "输入灵感, 智能生视频",
    route: "/create/video-generation",
  },
  // {
  //   id: "ai-design",
  //   icon: "apps",
  //   sparkle: true,
  //   title: "AI 图片设计",
  //   route: "/ai-design",
  //   badge: "限时免费",
  // },
];

// 普通功能项组件
function FeatureItem({
  item,
  onPress,
}: {
  item: (typeof FEATURE_ITEMS)[0];
  onPress: () => void;
}) {
  return (
    <View className={"px-5"}>
      <TouchableOpacity
        onPress={onPress}
        className={"mb-3"}
        activeOpacity={0.8}
      >
        <View
          className={
            "flex-row items-center bg-card rounded-full px-4 py-3 self-start"
          }
        >
          <View className={"bg-primary/20 rounded-full p-2 mr-3"}>
            <Ionicons name={item.icon as any} size={13} color="#A855F7" />
          </View>
          {item.sparkle && (
            <Ionicons
              name="sparkles"
              size={14}
              color="#A855F7"
              style={{ marginRight: 6 }}
            />
          )}
          <Text className={"text-base font-medium"}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// 主功能项组件 (放在最底部，样式更显眼)
function MainFeatureItem({
    item,
    onPress,
  }: {
    item: (typeof FEATURE_ITEMS)[0];
    onPress: () => void;
  }) {
    return (
      <View className="px-5 mt-4">
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          className="bg-card rounded-[24px] p-5 flex-row items-center justify-between border border-muted/50"
        >
          <View className="flex-row items-center flex-1">
            <View className="bg-primary/10 rounded-2xl p-3 mr-4">
              <Ionicons name={item.icon as any} size={26} color="#A855F7" />
            </View>
            <View className="flex-1">
              <Text className="text-foreground text-lg font-bold mb-1">{item.title}</Text>
              {item.subtitle && (
                  <Text className="text-muted-foreground text-xs font-medium">{item.subtitle}</Text>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
        </TouchableOpacity>
      </View>
    );
  }

export default function Screen() {
  const { t } = useTranslation();
  const { colors } = useTailwindVars();

  const handleFeaturePress = (route: string) => {
    router.navigate(route as any);
  };

  // 整个列表从底部向上展示，数组中第一个（index 0）使用 Main UI
  const reversedItems = [...FEATURE_ITEMS].reverse();

  return (
    <ScreenContainer>
      <ScreenHeader title="创作" closeable={false} />

      <View className="flex-1 justify-end pb-10">
        {reversedItems.map((item) => {
          // 找到该项在原数组中的索引
          const originalIndex = FEATURE_ITEMS.findIndex(f => f.id === item.id);
          
          if (originalIndex === 0) {
            return (
              <MainFeatureItem
                key={item.id}
                item={item}
                onPress={() => handleFeaturePress(item.route)}
              />
            );
          }
          
          return (
            <FeatureItem
              key={item.id}
              item={item}
              onPress={() => handleFeaturePress(item.route)}
            />
          );
        })}
      </View>
    </ScreenContainer>
  );
}
