import {Alert, Text, View} from "react-native";
import React, {useState} from "react";
import {Resource} from "@/types";
import {Stack} from "react-native-flex-layout";
import ShareLinkInput from "@/components/ShareLinkInput";
import MediaTextGroupView from "@/components/Resource/MediaTextGroupView";
import Submitter from "@/components/Submitter";
import {useTranslation} from "@/i18n/translation";

function Component({
                                scene,
                                sessionId,
                            }: {
    scene: string;
    sessionId: string;
}) {
    const {t} = useTranslation();

    const [resources, setResources] = useState<Resource[]>([]);
    const [promptId, setPromptId] = useState<string>("contentExtraction");

    const onExtracted = (resources: Resource[]) => {
        const videos = resources
            ?.filter((x) => x.mimeType?.startsWith("video"))
            ?.slice(0, 1);
        setResources(resources);

        if (videos?.length) {
            setPromptId("contentExtraction");
        } else {
            Alert.alert(t("scene.contentExtractionRequireVideoAlert", ));
            setResources([])
        }

    };

    const reset = () => {
        setResources([]);
    };

    return (
        <View className="flex-1 px-5">
            <Text
                className="text-lg text-center text-primary mb-[30px] bg-primary/10 p-5 rounded-xl border-primary/30 border-[0.5px]">
                {t("scene.contentExtractionTitle")}
            </Text>

            {resources?.length ? (
                <Stack justify={"between"} style={{flex: 1}}>
                    <MediaTextGroupView resources={resources}/>

                    <Submitter
                        scene={scene}
                        sessionId={sessionId}
                        promptId={promptId}
                        resources={resources}
                        onComplete={reset}
                    ></Submitter>
                </Stack>

                ) : (
                <ShareLinkInput onComplete={onExtracted} style={{flex: 1}}/>
            )}
        </View>
    );
}


export default Component
