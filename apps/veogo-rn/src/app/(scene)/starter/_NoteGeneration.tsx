import Picker from "@/components/Picker";
import Submitter from "@/components/Submitter";
import useGlobal from "@/hooks/useGlobal";
import { useTranslation } from "@/i18n/translation";
import { Resource } from "@/types";
import { concatIfNotNull } from "@/utils";
import React, { useState } from "react";
import { Keyboard, Text, TouchableOpacity, View } from "react-native";

function Component({
                       scene,
                       sessionId,
                   }: {
    scene: string;
    sessionId: string;
}) {
    const [resources, setResources] = useState<Resource[]>([]);
    const [titleResource, setTitleResource] = useState<Resource>();
    const [promptId, setPromptId] = useState<string>("noteGeneration");

    const {
        settings: {titleMaxLength, prompts},
    } = useGlobal();
    const {t} = useTranslation();

    const reset = () => {
        setTitleResource(undefined);
        setResources([]);
    };

    const onFilesChange = (files: Resource[]) => {
        const videos = files
            ?.filter((x) => x.mimeType?.startsWith("video"))
            ?.slice(0, 1);
        setResources(videos?.length ? videos : files);
        setPromptId(videos?.length ? "noteGeneration" : "noteGeneration");
    };

    return (
        <TouchableOpacity activeOpacity={1} onPress={() => Keyboard.dismiss()} className={'flex-1 px-5'}>
            <View className="flex-1">

                <Text
                    className="text-lg text-center text-primary mb-[30px] bg-primary/10 p-5 rounded-xl border-primary/30 border-[0.5px]">
                    {t("scene.noteGenerationTitle")}
                </Text>

                <View className="rounded-[16px]">
                    <Picker
                        files={resources}
                        onChange={onFilesChange}
                        maxFiles={18}
                        maxSizeMB={1000}
                        allowedTypes={["image", "video"]}
                        // onUploaded={handleUploadComplete}
                    />
                </View>
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
