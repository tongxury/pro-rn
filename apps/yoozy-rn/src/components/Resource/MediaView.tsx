import React, {useEffect, useState} from "react";
import {Image, Text, View} from "react-native";
import {Resource} from "@/types";
import {useTranslation} from "@/i18n/translation";
import {isMedia, isVideo} from "@/utils/resource";
import {getUrl} from "@/utils";
import {Feather} from "@expo/vector-icons";

interface MediaViewProps {
    item: Resource;
    index?: number; // 添加序号属性
    onPress?: () => void;
    width?: number;
    height?: number;
}

const MediaView = ({
                       item,
                       index,
                       // onPress,
                       width = 150,
                       height = 180,
                   }: MediaViewProps) => {
    // const [thumbnailUri, setThumbnailUri] = useState<string | undefined>(
    //     item?.coverUrl || item?.url || item?.uri
    // );
    const {t} = useTranslation();
    //

    const [url, setUrl] = useState<string>("");
    // useEffect(() => {
    //     if (!item?.coverUrl && isVideo && (item?.uri || item?.url)) {
    //         VideoThumbnails.getThumbnailAsync((item?.uri || item?.url)!, {
    //             time: 0,
    //             quality: 0.5,
    //         }).then((r) => {
    //             setThumbnailUri(r.uri);
    //         });
    //     }
    // }, [item.uri, item.mimeType, isVideo]);

    useEffect(() => {
        getUrl(item).then((r) => {
            setUrl(r || "");
        });
    }, [item]);

    if (!isMedia(item)) {
        return <></>;
    }

    if (!url) {
        return (
            <View
                className={`rounded-[10px] bg-muted border-b border-l border-r border-t border-grey5`}
                style={{width, height}}
            />
        );
    }

    return (
        <View
            // onPress={onPress}
            // activeOpacity={0.8}
            className="relative"
        >
            <Image
                source={{uri: url}}
                className={`rounded-[10px] bg-muted border-b border-l border-r border-t border-background1`}
                style={{width, height}}
                resizeMode="cover"
                fadeDuration={0}
            />

            {/* 视频时长标识（可选） */}
            {isVideo(item) && (
                <View
                    className="absolute bottom-2 left-2 flex-row items-center px-1.5 py-0.5 rounded-xl bg-background/80">
                    <Feather
                        name="video"
                        size={12}
                        color="#fff"
                        style={{marginRight: 4}}
                    />
                    <Text
                        className="text-white text-xs font-medium"
                        style={{
                            textShadowColor: "rgba(0, 0, 0, 0.3)",
                            textShadowOffset: {width: 0, height: 1},
                            textShadowRadius: 1,
                        }}
                    >
                        {t("video")}
                    </Text>
                </View>
            )}

            {/* 序号标识 */}
            {typeof index === "number" && (
                <View
                    className="absolute top-0 right-0 w-6 h-5 rounded-bl-lg justify-center items-center bg-background/80"
                    // style={{
                    //     borderTopRightRadius: 10,
                    //     borderBottomLeftRadius: 8,
                    //     // shadowColor: "#fff",
                    //     shadowOffset: {width: 0, height: 0},
                    //     shadowOpacity: 0.3,
                    //     shadowRadius: 2,
                    //     elevation: 5,
                    // }}
                >
                    <Text
                        className="text-white text-sm font-semibold"
                        style={{
                            textShadowColor: "rgba(0, 0, 0, 0.3)",
                            textShadowOffset: {width: 0, height: 1},
                            textShadowRadius: 2,
                        }}
                    >
                        {index}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default MediaView;
