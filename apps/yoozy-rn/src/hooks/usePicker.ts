import { getImageName } from "@/utils/upload/utils";
import * as ImagePicker from "expo-image-picker";

const usePicker = () => {
  // 请求媒体权限
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      return false;
    }
    return true;
  };

  const pick = async ({
    mediaTypes = ["images", "videos"],
    allowsMultipleSelection = true,
    allowsEditing,
  }: {
    mediaTypes?: ("images" | "videos")[];
    allowsMultipleSelection?: boolean;
    allowsEditing?: boolean;
  }) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsMultipleSelection,
      quality: 0.8,
      allowsEditing,
    });

    // if (!result.canceled && result.assets) {
    //     const newFiles = result.assets.map((asset, index) => ({
    //         uri: asset.uri,
    //         type: asset.type === 'video' ? 'video' : 'image' as 'image' | 'video',
    //         duration: asset.duration,
    //         id: `${Date.now()}-${index}`,
    //     }));
    //     return newFiles;
    // }

    return (
      result.assets?.map((asset, index) => ({
        uri: asset.uri,
        type: asset.type === "video" ? "video" : ("image" as "image" | "video"),
        duration: asset.duration,
        id: `${Date.now()}-${index}`,
        name: getImageName(asset.uri),
        size: asset.fileSize,
      })) || []
    );
  };

  return {
    pick,
  };
};

export default usePicker;
