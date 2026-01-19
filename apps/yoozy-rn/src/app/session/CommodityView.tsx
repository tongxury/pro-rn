import { FlatList, Image, Text, View } from "react-native";
import PulseLoader from "@/components/PulseLoader";
import React from "react";

const CommodityView = ({ data }: { data: any }) => {
  return (
    <View className={"gap-3"}>
      {data?.status == "commodityMetadataParsing" && (
        <View className={"flex-row gap-3 items-center"}>
          <PulseLoader size={15} />
          <Text className={"text-white"}>正在提取商品信息</Text>
        </View>
      )}
      <Text className={"text-white/90 text-base font-medium"}>
        {data?.commodity?.title}
      </Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data?.commodity?.images}
        ItemSeparatorComponent={() => <View className={"w-[10px] h-[8px]"} />}
        renderItem={({ item }) => {
          return (
            <View>
              <Image
                source={{ uri: item }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                }}
                resizeMode="contain"
              />
            </View>
          );
        }}
      />
    </View>
  );
};

export default CommodityView;
