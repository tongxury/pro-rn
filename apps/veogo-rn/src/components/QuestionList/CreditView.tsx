import useDateFormatter from "@/hooks/useDateFormatter";
import {useTranslation} from "@/i18n/translation";
import useTailwindVars from "@/hooks/useTailwindVars";
import {Text, TouchableOpacity, View} from "react-native";
import React, {useMemo} from "react";
import {Feather} from "@expo/vector-icons";

const CreditView = ({data, onRecharge}: { data: any, onRecharge?: () => void }) => {
    const {formatToNow} = useDateFormatter();
    const {t} = useTranslation();
    const {colors} = useTailwindVars();

    const createdTime = formatToNow(data?.createdAt);
    // const sceneName = t(`prompt.${data?.prompt?.id}`);
    const sceneName = useMemo(() => {
        return data?.prompt?.content || t(`prompt.${data?.prompt?.id}`)
    }, [data])

    return (

        <View className="items-center py-8">

            {/* 提示文字 */}
            <Text className="text-lg font-semibold text-grey0 mb-2">
                积分不足
            </Text>
            <Text className="text-sm text-grey2 text-center mb-6 leading-5">
                当前积分不够生成此内容{'\n'}请充值后继续使用
            </Text>

            {/* 充值按钮 */}
            <TouchableOpacity
                onPress={onRecharge}
                className="bg-orange-500 py-4 px-8 rounded-xl flex-row items-center space-x-2 shadow-sm"
            >
                <Feather
                    name="zap"
                    size={18}
                    color="white"
                />
                <Text className="text-white font-semibold text-base">
                    立即充值
                </Text>
            </TouchableOpacity>

            {/*/!* 次要按钮 *!/*/}
            {/*<TouchableOpacity className="mt-3 py-2 px-4">*/}
            {/*    <Text className="text-sm text-grey2">*/}
            {/*        查看积分说明*/}
            {/*    </Text>*/}
            {/*</TouchableOpacity>*/}
        </View>
    );
};


export default CreditView;
