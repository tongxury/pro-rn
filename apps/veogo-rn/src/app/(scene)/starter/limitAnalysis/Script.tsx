import {Text, TextInput, View} from "react-native";
import React, {useState} from "react";
import Picker from "@/components/Picker";
import {Resource} from "@/types";
import useGlobal from "@/hooks/useGlobal";
import {packScriptResource, packTitleResource} from "@/utils/resource";
import Submitter from "@/components/Submitter";
import {concatIfNotNull} from "@/utils";
import {useTranslation} from "@/i18n/translation";
import AdvancedInput from "@/components/AdvancedInput";

export function Component({
                              scene,
                              sessionId,
                          }: {
    scene: string;
    sessionId: string;
}) {
    const [titleResource, setTitleResource] = useState<Resource>();
    const [promptId] = useState<string>("limitAnalysisScript");

    const {t} = useTranslation();

    const reset = () => {
        setTitleResource(undefined);
    };

    const handleTextChange = (text: string) => {
        setTitleResource(packScriptResource(text));
    }

    return (
        <View className={'flex-1'}>
            <View className="flex-1">
                <AdvancedInput
                    // className="placeholder:text-grey0/70 text-grey0 rounded-md p-[10px] text-md min-h-[500px] max-h-[500px] bg-background1 border border-grey4"
                    // style={{lineHeight: 25}}
                    style={{minHeight: 400, maxHeight: 400}}
                    placeholder={t("scene.scriptOptimizationInputPlaceholder")}
                    onChangeText={handleTextChange}
                    value={titleResource?.content}
                    maxLength={5000}
                />
            </View>

            <Submitter
                scene={scene}
                sessionId={sessionId}
                promptId={promptId}
                resources={concatIfNotNull([], titleResource)}
                onComplete={reset}
                accountRequired
            ></Submitter>
        </View>
    );
}


export default Component
