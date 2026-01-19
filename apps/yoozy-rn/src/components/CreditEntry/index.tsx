import { fetchCreditState } from "@/api/credit";
import { useQueryData } from "@/hooks/useQueryData";
import useTailwindVars from "@/hooks/useTailwindVars";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const CreditEntry = () => {
  const { colors } = useTailwindVars();

  const { data: credit } = useQueryData({
    queryKey: ["credit"],
    queryFn: () => fetchCreditState({}),
  });

  return (
    <View
      className="bg-card flex-row rounded-full px-4 py-1.5 items-center shadow-sm"
    >
      <View className="flex-row items-center mr-4">
        <Ionicons name="diamond" size={16} color={colors.primary} />
        <Text className="text-sm ml-1.5">{credit?.balance}</Text>
      </View>
      <TouchableOpacity activeOpacity={0.6}>
        <Text className="text-sm" >开会员</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CreditEntry;
