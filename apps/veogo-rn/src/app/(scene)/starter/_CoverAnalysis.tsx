import {Keyboard, Text, TextInput, TouchableOpacity, View} from "react-native";
import React, {useState} from "react";
import Picker from "@/components/Picker";
import {Resource} from "@/types";
import {packTitleResource} from "@/utils/resource";
import Submitter from "@/components/Submitter";
import {concatIfNotNull} from "@/utils";
import {useSettings} from "@/hooks/useSettings";
import {useTranslation} from "@/i18n/translation";

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

    const promptId = "coverAnalysisImages";

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
                    {t("scene.coverAnalysisTitle")}
                </Text>

                <Picker
                    files={resources}
                    onChange={(files) => setResources(files)}
                    maxFiles={getPromptConfig(promptId)?.maxFiles}
                    maxSizeMB={1000}
                    allowedTypes={["image"]}
                    // onUploaded={handleUploadComplete}
                />

                <TextInput
                    className="placeholder:text-grey0/70 text-grey0 text-md mt-[20px]"
                    placeholder={t("inputTitle")}
                    onChangeText={(text) => setTitleResource(packTitleResource(text))}
                    maxLength={titleMaxLength}
                    multiline
                />
            </View>

            <Submitter
                scene={scene}
                sessionId={sessionId}
                promptId={promptId}
                resources={concatIfNotNull(resources, titleResource)}
                onComplete={reset}
                accountRequired
            ></Submitter>
        </TouchableOpacity>
    );
}

export default Component
