import {Text, View, TouchableOpacity} from "react-native";
import React, {useState} from "react";
import {useTranslation} from "@/i18n/translation";
import Media from './Media'
import Script from "./Script";
import TextTabs from "@/components/ui/TextTabs";

export function Component({
                              scene,
                              sessionId,
                          }: {
    scene: string;
    sessionId: string;
}) {
    const {t} = useTranslation();

    const switcherOptions = [
        {value: 'media', label: t('scene.limitCategoryMedia')},
        {value: 'script', label: t('scene.limitCategoryScript')},
    ];

    const [category, setCategory] = useState<any>(switcherOptions[0]);

    return (
        <View className={'flex-1 px-5'}>
            <View className="flex-1 gap-5">
                <Text
                    className="text-lg text-center text-primary bg-primary/10 p-5 rounded-xl border-primary/30 border-[0.5px]">
                    {t("scene.limitAnalysisTitle")}
                </Text>

                <View className="mx-auto">

                    <TextTabs
                        current={category}
                        onChange={(value) => setCategory(value)}
                        options={switcherOptions}
                    />
                </View>

                {category.value === 'media' && (<Media scene={scene} sessionId={sessionId}/>)}
                {category.value === 'script' && (<Script scene={scene} sessionId={sessionId}/>)}
            </View>
        </View>
    );
}

export default Component
