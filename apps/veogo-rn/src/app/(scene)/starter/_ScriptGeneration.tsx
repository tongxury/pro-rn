import {Keyboard, Text, TouchableOpacity, View} from "react-native";
import React, {useState} from "react";
import {Resource} from "@/types";
import {packTopicResource} from "@/utils/resource";
import Submitter from "@/components/Submitter";
import {concatIfNotNull} from "@/utils";
import {useSettings} from "@/hooks/useSettings";
import {useTranslation} from "@/i18n/translation";
import AdvancedInput from "@/components/AdvancedInput";

export function Component(
    {
        scene,
        sessionId,
    }: {
        scene: string;
        sessionId: string;
    }) {
    const [resources, setResources] = useState<Resource[]>([]);
    const [titleResource, setTitleResource] = useState<Resource>();

    const promptId = "scriptGeneration";

    // const {settings: {titleMaxLength, prompts}} = useGlobal();

    const {
        settings: {titleMaxLength, prompts},
        getPromptConfig,
    } = useSettings();
    const {t} = useTranslation();

    const reset = () => {
        setTitleResource(undefined);
        setResources([]);
    };

    return (
        <TouchableOpacity
            activeOpacity={1} onPress={() => Keyboard.dismiss()}
            className={'flex-1 px-5'}>
            <View className="flex-1">

                <Text
                    className="text-lg text-center text-primary mb-[30px] bg-primary/10 p-5 rounded-xl border-primary/30 border-[0.5px]">
                    {t("scene.scriptGenerationTitle")}
                </Text>

                <AdvancedInput
                    placeholder={t("scene.scriptGenerationInputPlaceholder")}
                    onChangeText={(text) => setTitleResource(packTopicResource(text))}
                    maxLength={500}
                />
            </View>
            <Submitter
                scene={scene}
                sessionId={sessionId}
                promptId={promptId}
                resources={concatIfNotNull(resources, titleResource)}
                onComplete={reset}
            ></Submitter>
        </TouchableOpacity>
    );
}

export default Component
