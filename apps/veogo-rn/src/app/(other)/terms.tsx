import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "@/i18n/translation";

interface Section {
  titleKey: string;
  contentKey: string;
}

const termsData: Section[] = [
  { titleKey: "termsSection1Title", contentKey: "termsSection1Content" },
  { titleKey: "termsSection2Title", contentKey: "termsSection2Content" },
  { titleKey: "termsSection3Title", contentKey: "termsSection3Content" },
  { titleKey: "termsSection4Title", contentKey: "termsSection4Content" },
  { titleKey: "termsSection5Title", contentKey: "termsSection5Content" },
  { titleKey: "termsSection6Title", contentKey: "termsSection6Content" },
  { titleKey: "termsSection7Title", contentKey: "termsSection7Content" },
];

export default function TermsScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-5">
        <Text className="text-2xl font-bold text-white mb-4">
          {t("termsTitle")}
        </Text>
        <View className="flex-col justify-between mb-6">
          <Text className="text-grey2 text-sm">{t("termsUpdateDate")}</Text>
          <Text className="text-grey2 text-sm">{t("termsEffectiveDate")}</Text>
        </View>

        <Text className="text-grey2 text-sm mb-6">{t("termsIntro")}</Text>

        {termsData.map((section, index) => (
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
