import InspirationList from "@/app/inspiration/list";
import TemplateList from "@/app/template/list";
import ScreenContainer from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Text,
  TouchableOpacity,
  View
} from "react-native";

type TabType = "video" | "inspiration";
const tabList: { id: number; name: string; value: TabType }[] = [
  // {
  //   id: 0,
  //   name: "视频库",
  //   value: "video",
  // },
  {
    id: 1,
    name: "灵感库",
    value: "inspiration",
  },
];


export default function HomeScreen() {
  const { colors } = useTailwindVars();
  const [activeTab, setActiveTab] = useState<TabType>(tabList[0].value);


  return (
    <ScreenContainer edges={['top']} >
      {/* Premium Header Area - Clean & Spacious */}

    <ScreenHeader title={'灵感库'}  closeable={false}/>

      {/* Content Area */}
      <View className="flex-1">
          <InspirationList />
      </View>
    </ScreenContainer>
  );
}
