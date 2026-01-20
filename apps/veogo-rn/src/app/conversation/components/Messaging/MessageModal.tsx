import React from "react";
import { 
    View, 
    Text, 
    TouchableOpacity, 
    Modal, 
    TextInput 
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface MessageModalProps {
    visible: boolean;
    onClose: () => void;
    textInput: string;
    setTextInput: (text: string) => void;
    onSendMessage: (text: string) => void;
}

export const MessageModal = ({ 
    visible, 
    onClose, 
    textInput, 
    setTextInput, 
    onSendMessage 
}: MessageModalProps) => {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <BlurView intensity={80} tint="dark" className="flex-1 justify-end px-6 pb-12">
                <TouchableOpacity className="flex-1" onPress={onClose} />
                <View className="bg-[#111] rounded-[45px] p-8 border border-white/10 shadow-2xl">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-2xl font-black text-white">Send Message</Text>
                        <TouchableOpacity onPress={onClose} className="h-10 w-10 bg-white/10 rounded-full items-center justify-center">
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        autoFocus
                        multiline
                        className="bg-white/5 rounded-3xl p-6 text-white text-lg min-h-[150px] border border-white/5"
                        placeholder="Type a message or provide context..."
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        value={textInput}
                        onChangeText={setTextInput}
                        selectionColor="white"
                    />
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                            onSendMessage(textInput);
                            setTextInput("");
                            onClose();
                        }}
                        disabled={!textInput.trim()}
                        className={`mt-6 py-5 rounded-[25px] items-center ${textInput.trim() ? 'bg-white' : 'bg-white/20'}`}
                    >
                        <Text className={`font-black text-lg ${textInput.trim() ? 'text-black' : 'text-white/40'}`}>SEND SIGNAL</Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Modal>
    );
};
