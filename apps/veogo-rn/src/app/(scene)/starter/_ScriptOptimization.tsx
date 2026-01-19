import {Keyboard, Text, TextInput, TouchableOpacity, View, Alert} from "react-native";
import React, {useState} from "react";
import {Resource} from "@/types";
import {packScriptResource, packTitleResource, packTopicResource} from "@/utils/resource";
import Submitter from "@/components/Submitter";
import {concatIfNotNull} from "@/utils";
import {useSettings} from "@/hooks/useSettings";
import {useTranslation} from "@/i18n/translation";
import * as Clipboard from 'expo-clipboard';
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
    const [inputText, setInputText] = useState('');

    const promptId = "scriptOptimization";

    const {
        settings: {titleMaxLength, prompts},
        getPromptConfig,
    } = useSettings();
    const {t} = useTranslation();

    const reset = () => {
        setTitleResource(undefined);
        setResources([]);
        setInputText('');
    };

    const handleTextChange = (text: string) => {
        setInputText(text);
        setTitleResource(packScriptResource(text));
    };

    return (
        <TouchableOpacity activeOpacity={1} onPress={() => Keyboard.dismiss()}
                          className={'flex-1 px-5'}>
            <View className="flex-1">
                <Text
                    className="text-lg text-center text-primary mb-[30px] bg-primary/10 p-5 rounded-xl border-primary/30 border-[0.5px]">
                    {t("scene.scriptOptimizationTitle")}
                </Text>

                {/* 文本输入区域 */}
                <AdvancedInput
                    // className="placeholder:text-grey0/70 text-grey0 rounded-md p-[10px] text-md min-h-[500px] max-h-[500px] bg-background1 border border-grey4"
                    // style={{lineHeight: 25}}
                    style={{minHeight: 400, maxHeight: 400}}
                    placeholder={t("scene.scriptOptimizationInputPlaceholder")}
                    onChangeText={handleTextChange}
                    value={inputText}
                    maxLength={5000}
                />
            </View>

            <Submitter
                scene={scene}
                sessionId={sessionId}
                promptId={promptId}
                resources={concatIfNotNull(resources, titleResource)}
                onComplete={reset}
                accountRequired
            />
        </TouchableOpacity>
    );
}

export default Component;
