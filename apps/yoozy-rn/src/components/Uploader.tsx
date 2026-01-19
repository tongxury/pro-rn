import useTailwindVars from "@/hooks/useTailwindVars";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Toast } from "react-native-toast-notifications";

interface UploaderProps {
    files?: ImagePicker.ImagePickerAsset[];
    onChange?: (files: ImagePicker.ImagePickerAsset[]) => void;
    maxFiles?: number;
}

const Uploader = ({ files = [], onChange, maxFiles = 9 }: UploaderProps) => {
    const { colors } = useTailwindVars();

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 1,
            });

            if (!result.canceled && onChange) {
                // Determine how many new files we can add
                const remainingSlots = maxFiles - files.length;
                if (remainingSlots <= 0) {
                    Toast.show(`最多只能上传 ${maxFiles} 张图片`);
                    return;
                }

                const newFiles = result.assets.slice(0, remainingSlots);
                onChange([...files, ...newFiles]);
            }
        } catch (error) {
            console.error(error);
            Toast.show("选择素材失败");
        }
    };

    const handleRemoveFile = (index: number) => {
        if (onChange) {
            onChange(files.filter((_, i) => i !== index));
        }
    };

    return (
        <View className="flex-row flex-wrap gap-3 mb-4">
            {files.length < maxFiles && (
                <TouchableOpacity
                    onPress={handlePickImage}
                    className="w-[72px] h-[72px] rounded-2xl border border-dashed justify-center items-center bg-muted/20"
                    style={{ borderColor: colors.border }}
                    activeOpacity={0.6}
                >
                    <Feather name="image" size={20} color={colors['muted-foreground']} />
                    <Text className="text-[10px] mt-1.5 font-medium" style={{ color: colors['muted-foreground'] }}>上传素材</Text>
                </TouchableOpacity>
            )}

            {files.map((file, index) => (
                <View key={index} className="w-[72px] h-[72px] rounded-2xl overflow-hidden bg-muted relative border border-border">
                    <Image source={{ uri: file.uri }} className="w-full h-full" resizeMode="cover" />
                    <TouchableOpacity
                        onPress={() => handleRemoveFile(index)}
                        className="absolute top-0 right-0 bg-black/50 p-1 rounded-bl-lg"
                    >
                        <Feather name="x" size={10} color="white" />
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
};

export default Uploader;