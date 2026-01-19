import {Text, TextInput, View} from "react-native";
import React, {useState} from "react";
import Picker from "@/components/Picker";
import {Resource} from "@/types";
import useGlobal from "@/hooks/useGlobal";
import {packTitleResource} from "@/utils/resource";
import Submitter from "@/components/Submitter";
import {concatIfNotNull} from "@/utils";
import {useTranslation} from "@/i18n/translation";

export function Component({
                              scene,
                              sessionId,
                          }: {
    scene: string;
    sessionId: string;
}) {
    const [resources, setResources] = useState<Resource[]>([]);
    const [titleResource, setTitleResource] = useState<Resource>();
    const [promptId, setPromptId] = useState<string>("limitAnalysis");

    // const promptId = 'coverAnalysisImages';

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
        setPromptId(videos?.length ? "limitAnalysis" : "limitAnalysisImages");
    };

    return (
        <View className={'flex-1'}>
            <View className="flex-1">
                <View className="rounded-[16px]">
                    <Picker
                        files={resources}
                        onChange={onFilesChange}
                        maxFiles={18}
                        maxSizeMB={1000}
                        allowedTypes={["image", "video"]}
                        // onUploaded={handleUploadComplete}
                    />

                    <TextInput
                        className="text-lg text-white mt-5"
                        placeholder={t("inputTitle")}
                        value={titleResource?.content}
                        onChangeText={(text) => setTitleResource(packTitleResource(text))}
                        maxLength={titleMaxLength}
                        multiline
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
        </View>
    );
}


export default Component
