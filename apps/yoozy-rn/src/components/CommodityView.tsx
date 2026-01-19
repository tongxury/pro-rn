import React from 'react';
import {View, Text, ScrollView, Image, Dimensions} from 'react-native';

const {width: screenWidth} = Dimensions.get('window');

const CommodityView = ({data}: { data: any }) => {

    if (!data) {
        return <View/>;
    }


    return (
        <View className="bg-background p-4 gap-5">
            {/* 商品标题 */}
            <Text className="text-lg font-semibold text-white">
                {data.title}
            </Text>

            {/* 横向滚动图片 */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
                contentContainerStyle={{paddingRight: 16}}
            >
                {data.images?.map((x: any, i: number) => (
                    <View key={i} className="mr-3">
                        <Image
                            source={{uri: x}}
                            className="rounded-lg"
                            style={{
                                width: screenWidth * 0.6,
                                height: screenWidth * 0.6,
                                resizeMode: 'cover'
                            }}
                        />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default CommodityView;
