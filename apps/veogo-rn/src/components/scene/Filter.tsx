import {useSettings} from "@/hooks/useSettings";
import {useTranslation} from "@/i18n/translation";
import {Text, View, TouchableOpacity, ScrollView, Pressable, FlatList} from "react-native";
import {Scene} from "@/types";
import {HStack} from "react-native-flex-layout";
import React, {useMemo, useState} from "react";
import {useColors} from "@/hooks/uesColors";
import {Feather} from "@expo/vector-icons";
import {LinearGradient} from "expo-linear-gradient";
import {Grid} from "@/components/ui/Grid";

interface SceneFilterProps {
    current?: Scene;
    onChange: (scene: Scene) => void;
}

const SceneFilter = ({current, onChange}: SceneFilterProps) => {
    const {settings: {scenes}} = useSettings();
    const {t} = useTranslation();

    const colors = useColors()

    const [expanded, setExpanded] = useState(false);


    const renderItems = () => {
        return <HStack wrap items="center" spacing={20} w={'100%'}>
            {[{value: ''} as Scene, ...scenes].map((scene) => {
                const selected = (current?.value || '') === scene.value;

                return (
                    <TouchableOpacity
                        key={scene.value}
                        onPress={() => onChange(scene)}
                        activeOpacity={0.9}
                        className={`
                                flex-row items-center rounded-full gap-[3px]
                                py-[3px]
                            `}
                    >
                        {/*/!* 小图标 *!/*/}
                        {/*{*/}
                        {/*    scene?.getSceneIcon &&*/}
                        {/*    <View>*/}
                        {/*        {scene?.getSceneIcon({*/}
                        {/*            size: 12,*/}
                        {/*            color: selected ? colors.white : colors.grey3,*/}
                        {/*        })}*/}
                        {/*    </View>*/}
                        {/*}*/}

                        {/* 文字 */}
                        <Text className={`
                                text-md
                                ${selected ? 'text-white' : 'text-grey2'}
                            `}>
                            {t(`scene.${scene.value}`)}
                        </Text>

                    </TouchableOpacity>
                );
            })}
        </HStack>
    }

    return (expanded ?
            <View className={'flex-row'}>
                {/*   <View className="flex-row flex-1 items-baseline">
                    {renderItems()}
                </View>*/}
                <Grid
                    columns={4}
                    spacing={5}
                    data={[{value: ''} as Scene, ...scenes]}
                    renderItem={(scene, index) => {
                        const selected = (current?.value || '') === scene.value;

                        return (
                            <TouchableOpacity
                                key={scene.value}
                                onPress={() => onChange(scene)}
                                activeOpacity={0.9}
                                className={`rounded-md py-2 justify-center items-center ${selected ? ' bg-primary ' : 'bg-background1 '}`}
                            >
                                {/*/!* 小图标 *!/*/}
                                {/*{*/}
                                {/*    scene?.getSceneIcon &&*/}
                                {/*    <View>*/}
                                {/*        {scene?.getSceneIcon({*/}
                                {/*            size: 12,*/}
                                {/*            color: selected ? colors.white : colors.grey3,*/}
                                {/*        })}*/}
                                {/*    </View>*/}
                                {/*}*/}

                                {/* 文字 */}
                                <Text className={`
                                text-md ${selected ? 'text-white font-bold' : 'text-grey2'}
                            `}>
                                    {t(`scene.${scene.value}`)}
                                </Text>

                            </TouchableOpacity>
                        );
                    }}/>

                <TouchableOpacity activeOpacity={1} className={`w-[30px] bg-background justify-start items-center`}
                                  onPress={() => setExpanded(!expanded)}>
                    <Feather name="chevron-up" size={20} color={colors.grey2}/>
                </TouchableOpacity>
            </View> :
            <View className={'flex-row bg-warning'}>
                <View className={"flex-1 relative"}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="bg-background flex-row">
                        {renderItems()}
                    </ScrollView>
                    <View className={'absolute w-[40px] h-full right-0'}>
                        <LinearGradient
                            colors={['transparent', colors.background]} // 透明到更深的红色
                            start={{x: 0, y: 0}}
                            end={{x: 1, y: 0}}
                            style={{width: '100%', height: '100%'}}
                        />
                    </View>
                </View>
                <TouchableOpacity activeOpacity={1} className={`w-[30px] bg-background justify-center items-center`}
                                  onPress={() => setExpanded(!expanded)}>
                    <Feather name="chevron-down" size={19} color={colors.grey2}/>
                </TouchableOpacity>
            </View>
    );
};

export default SceneFilter;
