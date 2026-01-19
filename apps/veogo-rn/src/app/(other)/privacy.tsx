import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "@/i18n/translation";

interface Section {
  titleKey: string;
  contentKey: string;
}

const privacyData: Section[] = [
  { titleKey: "privacySection1Title", contentKey: "privacySection1Content" },
  { titleKey: "privacySection2Title", contentKey: "privacySection2Content" },
  { titleKey: "privacySection3Title", contentKey: "privacySection3Content" },
  { titleKey: "privacySection4Title", contentKey: "privacySection4Content" },
  { titleKey: "privacySection5Title", contentKey: "privacySection5Content" },
  { titleKey: "privacySection6Title", contentKey: "privacySection6Content" },
  { titleKey: "privacySection7Title", contentKey: "privacySection7Content" },
  { titleKey: "privacySection8Title", contentKey: "privacySection8Content" },
  { titleKey: "privacySection9Title", contentKey: "privacySection9Content" },
];

export default function PrivacyScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-5">
        <Text className="text-2xl font-bold text-white mb-4">
          {t("privacyTitle")}
        </Text>
        <View className="flex-col justify-between mb-6">
          <Text className="text-grey2 text-sm">{t("privacyUpdateDate")}</Text>
          <Text className="text-grey2 text-sm">
            {t("privacyEffectiveDate")}
          </Text>
        </View>

        {privacyData.map((section, index) => (
          <View key={index} className="mb-8">
            <Text className="text-lg font-bold text-white mb-4">
              {t(section.titleKey)}
            </Text>
            <Text className="text-grey2 text-sm leading-6">
              {t(section.contentKey)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
