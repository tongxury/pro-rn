import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "@/i18n/translation";

interface Feature {
  titleKey: string;
  itemKeys: string[];
}

const features: Feature[] = [
  {
    titleKey: "precisionPrediction",
    itemKeys: [
      "precisionPredictionItem1",
      "precisionPredictionItem2",
      "precisionPredictionItem3",
    ],
  },
  {
    titleKey: "secondOptimization",
    itemKeys: ["secondOptimizationItem1", "secondOptimizationItem2"],
  },
  {
    titleKey: "technicalGenes",
    itemKeys: ["technicalGenesContent"],
  },
];

export default function AboutScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView className="flex-1 bg-background">
      {/* 顶部标题区域 */}
      <View className="items-center py-8">
        <Text className="text-2xl font-bold text-white mb-3">
          {t("aboutAppTitle")}
        </Text>
        <Text className="text-base text-grey2">{t("aboutSubtitle")}</Text>
      </View>

      {/* 关于我们 */}
      <View className="px-4 mb-8">
        <Text className="text-lg font-bold text-white mb-4">
          {t("aboutUsSection")}
        </Text>
        <Text className="text-grey2 text-sm leading-6">
          {t("aboutUsContent")}
        </Text>
      </View>

      {/* 功能特点 */}
      {features.map((feature, index) => (
        <View key={index} className="px-4 mb-8">
          <Text className="text-lg font-bold text-white mb-4">
            {t(feature.titleKey)}
          </Text>
          <View className="space-y-3">
            {feature.itemKeys.map((itemKey, itemIndex) => (
              <Text key={itemIndex} className="text-grey2 text-sm leading-6">
                {t(itemKey)}
              </Text>
            ))}
          </View>
        </View>
      ))}

      {/* 使命 */}
      <View className="px-4 mb-8">
        <Text className="text-lg font-bold text-white mb-4 text-center">
          {t("ourMission")}
        </Text>
        <Text className="text-base text-grey2 text-center mb-3">
          {t("missionTitle")}
        </Text>
        <Text className="text-sm text-grey2 leading-6">
          {t("missionContent")}
        </Text>
      </View>
    </ScrollView>
  );
}
