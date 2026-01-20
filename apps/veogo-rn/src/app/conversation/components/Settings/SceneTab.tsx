import React from "react";
import { 
    Text, 
    TouchableOpacity, 
    FlatList 
} from "react-native";
import * as Haptics from "expo-haptics";
import { listScenes } from "@/api/voiceagent";
import { useQueryData } from "@/hooks/useQueryData";
import { VoiceScene } from "@/types";

interface SceneTabProps {
    activeScene: VoiceScene | null;
    setActiveScene: (scene: VoiceScene) => void;
}

export const SceneTab = ({ activeScene, setActiveScene }: SceneTabProps) => {
    const { data: scenesData } = useQueryData<any>({
        queryKey: ['scenes'],
        queryFn: () => listScenes(),
    });

    const scenes = (scenesData?.list || []) as VoiceScene[];

    const renderSceneItem = ({ item }: { item: VoiceScene }) => (
        <TouchableOpacity 
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveScene(item);
            }}
            className={`mb-3 p-5 rounded-3xl border ${activeScene?._id === item._id ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/10'}`}
        >
            <Text className="text-white font-bold text-lg">{item.name}</Text>
            <Text className="text-white/50 text-xs mt-1">{item.desc}</Text>
        </TouchableOpacity>
    );

    return (
        <FlatList
            data={scenes}
            keyExtractor={item => item._id}
            renderItem={renderSceneItem}
            ListHeaderComponent={<Text className="text-white/40 text-xs font-bold uppercase mb-4 tracking-widest">Select Atmosphere</Text>}
        />
    );
};
