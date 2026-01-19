import SessionList from "@/components/session/List";
import {View} from "react-native";
import React, {useCallback, useState} from "react";
import SceneFilter from "@/components/scene/Filter";
import {Scene} from "@/types";
import {useSettings} from "@/hooks/useSettings";
import {useTranslation} from "@/i18n/translation";

function AdvancedSessionList() {

    const {settings: {scenes}} = useSettings();
    const {t} = useTranslation()

    const [scene, setScene] = useState<Scene>();
    const onSceneChange = useCallback((newScene: Scene) => {
        if (newScene.value !== scene?.value) {
            setScene(newScene);
        }
    }, [scene?.value]);

    return (
        <View className="flex-col flex-1 gap-[15px] bg-background">
            <View className={'px-[15px] pt-[15px]'}>
                <SceneFilter
                    current={scene}
                    onChange={onSceneChange}
                />
            </View>
            <SessionList scene={scene?.value}/>
        </View>
    )
}


export default AdvancedSessionList
