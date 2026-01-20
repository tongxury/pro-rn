import React, { useState } from "react";
import { 
    View, 
    Text, 
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    TextInput,
    Alert
} from "react-native";
import { MaterialCommunityIcons, Feather, Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';
import { upload } from "@/utils/upload/tos";
import { addVoice, listVoices } from "@/api/voiceagent";
import { useQueryData } from "@/hooks/useQueryData";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Voice } from "@/types";

export const VoiceTab = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [voiceName, setVoiceName] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordDuration, setRecordDuration] = useState(0);

    const queryClient = useQueryClient();
    const { data: voicesData, isLoading } = useQueryData<any>({
        queryKey: ['voices'],
        queryFn: () => listVoices(),
    });

    const voices = (voicesData?.list || []) as Voice[];

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert('Permission denied', 'We need microphone access to record audio.');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
            setRecordDuration(0);

            // Start timer
            const interval = setInterval(async () => {
                const status = await recording.getStatusAsync();
                if (status.canRecord) {
                    setRecordDuration(Math.floor(status.durationMillis / 1000));
                }
            }, 1000);

            (recording as any)._interval = interval;

        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        setIsRecording(false);
        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            clearInterval((recording as any)._interval);
            setRecording(null);

            if (uri) {
                await processAudioFile(uri, `recorded_voice_${Date.now()}.m4a`, 'audio/x-m4a');
            }
        } catch (err) {
            console.error('Failed to stop recording', err);
        }
    };

    const processAudioFile = async (uri: string, name: string, type: string) => {
        setIsUploading(true);
        try {
            const sampleUrl = await upload({
                uri,
                name,
                type,
            }, (progress) => {
                setUploadProgress(progress);
            });

            setIsUploading(false);

            await addVoice({
                name: voiceName || name.split('.')[0],
                sampleUrl: sampleUrl,
                type: 'cloned'
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await queryClient.invalidateQueries({ queryKey: ['voices'] });
            setIsAdding(false);
            setVoiceName("");
            setUploadProgress(0);
        } catch (error: any) {
            console.error("Failed to process audio:", error);
            Alert.alert("Error", error.message || "Failed to process audio");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddVoice = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'audio/*',
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await processAudioFile(file.uri, file.name, file.mimeType || 'audio/mpeg');
        } catch (error: any) {
            console.error("Failed to select file:", error);
            Alert.alert("Error", "Failed to select audio file");
        }
    };

    const renderVoiceItem = ({ item }: { item: Voice }) => (
        <View className="mb-3 p-4 rounded-3xl bg-white/5 border border-white/10 flex-row items-center">
            <View className="h-10 w-10 bg-indigo-500/20 rounded-full items-center justify-center">
                <MaterialCommunityIcons name="microphone" size={20} color="#818cf8" />
            </View>
            <View className="ml-4 flex-1">
                <Text className="text-white font-bold">{item.name}</Text>
                <Text className="text-white/40 text-xs uppercase tracking-widest">{item.type} • {item.status}</Text>
            </View>
            {item.status === 'processing' && (
                <ActivityIndicator size="small" color="#818cf8" />
            )}
        </View>
    );

    if (isAdding) {
        return (
            <View className="flex-1 py-4">
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-white/40 text-xs font-bold uppercase tracking-widest">Clone New Voice</Text>
                    <TouchableOpacity onPress={() => setIsAdding(false)}>
                        <Text className="text-indigo-400 font-bold">Cancel</Text>
                    </TouchableOpacity>
                </View>

                <Text className="text-white/60 mb-2 ml-1 text-sm">Voice Name</Text>
                <TextInput
                    placeholder="e.g. My Custom Voice"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    className="bg-white/5 rounded-2xl p-4 text-white mb-6 border border-white/10"
                    value={voiceName}
                    onChangeText={setVoiceName}
                />

                <View className="bg-indigo-600/10 border border-dashed border-indigo-500/30 rounded-3xl p-6 items-center justify-center mb-8">
                    {isUploading ? (
                        <View className="items-center py-4">
                            <ActivityIndicator size="large" color="#818cf8" />
                            <Text className="text-white mt-4 font-bold">Uploading Sample... {Math.round(uploadProgress)}%</Text>
                        </View>
                    ) : isRecording ? (
                        <View className="items-center py-4 w-full">
                            <View className="flex-row items-center justify-center mb-4 space-x-2">
                                <View className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                <Text className="text-white font-mono text-xl">{Math.floor(recordDuration / 60)}:{(recordDuration % 60).toString().padStart(2, '0')}</Text>
                            </View>
                            <TouchableOpacity 
                                onPress={stopRecording}
                                className="h-20 w-20 bg-red-500 rounded-full items-center justify-center shadow-lg shadow-red-500/50"
                            >
                                <Ionicons name="stop" size={32} color="white" />
                            </TouchableOpacity>
                            <Text className="text-white/60 mt-4 font-medium">Tap to finish recording</Text>
                        </View>
                    ) : (
                        <View className="flex-row w-full justify-around py-4">
                            <TouchableOpacity onPress={handleAddVoice} className="items-center">
                                <View className="h-16 w-16 bg-white/10 rounded-full items-center justify-center mb-4 border border-white/5">
                                    <Feather name="upload-cloud" size={28} color="white" />
                                </View>
                                <Text className="text-white font-bold">Upload File</Text>
                                <Text className="text-white/40 text-[10px] mt-1 italic">MP3/WAV/M4A</Text>
                            </TouchableOpacity>

                            <View className="w-[1px] h-16 bg-white/10 self-center" />

                            <TouchableOpacity onPress={startRecording} className="items-center">
                                <View className="h-16 w-16 bg-indigo-600 rounded-full items-center justify-center mb-4 shadow-lg shadow-indigo-600/30">
                                    <MaterialCommunityIcons name="microphone" size={32} color="white" />
                                </View>
                                <Text className="text-white font-bold">Direct Record</Text>
                                <Text className="text-white/40 text-[10px] mt-1 italic">Record now</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
                {!isRecording && !isUploading && (
                    <Text className="text-white/40 text-xs text-center px-4">
                        Provide a clear 1-5 minute recording for best results.
                    </Text>
                )}
            </View>
        );
    }

    return (
        <View className="flex-1">
            <FlatList
                data={voices}
                keyExtractor={(item) => item._id}
                renderItem={renderVoiceItem}
                ListHeaderComponent={
                    <View className="mb-4">
                        <Text className="text-white/40 text-xs font-bold uppercase tracking-widest">Available Voices</Text>
                    </View>
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View className="items-center justify-center py-12">
                            <MaterialCommunityIcons name="microphone-off" size={48} color="rgba(255,255,255,0.05)" />
                            <Text className="text-white/20 mt-4">No custom voices yet</Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={
                    <TouchableOpacity 
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            setIsAdding(true);
                        }}
                        className="mt-4 py-6 border border-dashed border-white/20 rounded-3xl items-center flex-row justify-center space-x-2"
                    >
                        <Feather name="plus" size={20} color="white" className="opacity-40" />
                        <Text className="text-white/40 font-bold">Add Custom Voice</Text>
                    </TouchableOpacity>
                }
            />
        </View>
    );
};
