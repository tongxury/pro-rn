import SceneSelectorV2 from "@/components/scene/SceneSelectorV2";
import { useColors } from "@/hooks/uesColors";
import { generateObjectId } from "@/utils";
import { AntDesign, SimpleLineIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { TouchableOpacity, View } from "react-native";

import AccountAnalysis from "./_AccountAnalysis";
import Analysis from "./_Analysis";
import ContentExtraction from "./_ContentExtraction";
import ContentGeneration from "./_ContentGeneration";
import CoverAnalysis from "./_CoverAnalysis";
import DuplicateScript from "./_DuplicateScript";
import NoteGeneration from "./_NoteGeneration";
import ScriptGeneration from "./_ScriptGeneration";
import ScriptOptimization from "./_ScriptOptimization";
import LimitAnalysis from "./limitAnalysis";
import PreAnalysis from "./preAnalysis";

import { useAccounts } from "@/hooks/useAccounts";

export default function StarterScreen() {
    const {scene} = useLocalSearchParams() as any;
    const [currentScene, setCurrentScene] = useState<string>(scene);

    const {grey0} = useColors();

    const [sessionId, setSessionId] = useState<string>(generateObjectId());

    const {fetch: fetchAccounts} = useAccounts()

    useFocusEffect(
        useCallback(() => {
            setSessionId(generateObjectId());

            fetchAccounts()
            return () => {
                // console.log('页面不可见');
            };
        }, [])
    );

    const renderSceneComponent = () => {
        switch (currentScene) {
            case "noteGeneration":
                return <NoteGeneration scene={scene} sessionId={sessionId}/>
            case "contentExtraction":
                return <ContentExtraction scene={scene} sessionId={sessionId}/>
            case "accountAnalysis":
                return <AccountAnalysis scene={scene} sessionId={sessionId}/>
            case "scriptOptimization":
                return <ScriptOptimization scene={scene} sessionId={sessionId}/>
            case "scriptGeneration":
                return <ScriptGeneration scene={scene} sessionId={sessionId}/>
            case "contentGeneration":
                return <ContentGeneration scene={scene} sessionId={sessionId}/>
            case "coverAnalysis":
                return <CoverAnalysis scene={currentScene} sessionId={sessionId}/>;
            case "analysis":
                return <Analysis scene={currentScene} sessionId={sessionId}/>;
            case "duplicateScript":
                return <DuplicateScript scene={currentScene} sessionId={sessionId}/>;
            case "preAnalysis":
                return <PreAnalysis scene={currentScene} sessionId={sessionId}/>;
            case "limitAnalysis":
                return <LimitAnalysis scene={currentScene} sessionId={sessionId}/>;
            default:
                return null;
        }
    };

    return (
        <View className="bg-background flex-1 flex-col">
            <View
                className="bg-background px-[20px] pt-[10px] pb-[15px] z-10 relative flex-row justify-between items-center">
                <TouchableOpacity
                    className={'w-[40px] h-[20px] items-start '}
                    onPress={() => {
                        router.navigate({pathname: "/session/list"});
                    }}
                >
                    <SimpleLineIcons name="menu" size={18} color={grey0}/>
                </TouchableOpacity>
                <SceneSelectorV2
                    scene={currentScene}
                    onSelectScene={(scene) => {
                        setCurrentScene(scene);
                    }}
                />
                <TouchableOpacity
                    // 加大点击区域
                    className={'w-[40px] h-[20px] items-end '}
                    onPress={() => {
                        router.back();
                    }}
                >
                    <AntDesign
                        name={"close"}
                        size={20}
                        color={grey0}
                    />
                </TouchableOpacity>
            </View>
            <View className="flex-1">
                {renderSceneComponent()}
            </View>
        </View>
    );
}
