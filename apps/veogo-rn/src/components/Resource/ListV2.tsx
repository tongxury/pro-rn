import React, {useCallback, useState} from 'react';
import {FlatList, Image, Modal, Text, TouchableOpacity, View,} from 'react-native';
import {Resource} from '@/types';
import {MaterialIcons} from '@expo/vector-icons';
import {LinearGradient} from 'expo-linear-gradient';
import {HStack, Stack} from 'react-native-flex-layout';
import {ResizeMode, Video} from 'expo-av';
import ImageView from 'react-native-image-viewing';

interface ResourceListProps {
    resources?: Resource[];
    onPreview?: (resource: Resource) => void;
    onRemove?: (resource: Resource) => void;
}

const ResourceList = ({resources = [], onPreview, onRemove}: ResourceListProps) => {

    const [activeIndex, setActiveIndex] = useState(0);
    const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({});
    const [videoVisible, setVideoVisible] = useState(false);
    const [imageVisible, setImageVisible] = useState(false);
    const [videoUri, setVideoUri] = useState('');

    const handlePress = useCallback((resource: Resource) => {
        if (resource.mimeType?.startsWith('video/') && resource.uri) {
            setVideoUri(resource.uri);
            setVideoVisible(true);
        } else {
            setImageVisible(true);
        }
        onPreview?.(resource);
    }, [onPreview]);

    return (
        <View className="border border-gray-300 rounded-xl overflow-hidden shadow-lg">
            <View className="relative">
                {/* 页码指示器 */}
                {resources.length > 1 && (
                    <View className="absolute top-3 right-3 bg-black/60 px-2.5 py-1.5 rounded-2xl z-10 shadow-lg">
                        <Text className="text-white text-xs font-semibold">
                            {activeIndex + 1}/{resources.length}
                        </Text>
                    </View>
                )}

                <FlatList
                    data={resources}
                    renderItem={({item: resource}) => (
                        <View className="w-screen h-screen relative">
                            <TouchableOpacity
                                onPress={() => handlePress(resource)}
                                activeOpacity={0.9}
                                className="w-full h-full overflow-hidden"
                            >
                                <Image
                                    source={{
                                        uri: resource.mimeType?.startsWith('video/') && resource.uri
                                            ? thumbnails[resource.uri] || resource.uri
                                            : resource.uri,
                                    }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                                {resource.mimeType?.startsWith('video/') && (
                                    <View className="absolute inset-0 justify-center items-center bg-black/30">
                                        <MaterialIcons name="play-circle-filled" size={50} color="white"/>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    keyExtractor={(item, index) => item.uri || index.toString()}
                    decelerationRate="fast"
                    bounces={false}
                />

                {/* 文件信息 */}
                <LinearGradient
                    colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0, 0.7)']}
                    className="absolute bottom-0 left-0 right-0 p-3 z-10"
                >
                    <HStack items={'center'} justify={'between'}>
                        <HStack spacing={8} items={'center'}>
                            <MaterialIcons
                                name={getFileTypeIcon(resources[activeIndex]?.mimeType) as any}
                                size={30}
                                color="white"
                                style={{
                                    textShadowColor: 'rgba(0, 0, 0, 0.75)',
                                    textShadowOffset: {width: 0, height: 1},
                                    textShadowRadius: 3,
                                }}
                            />
                            <Stack spacing={5}>
                                <Text className="text-white text-sm font-semibold" numberOfLines={1}>
                                    {resources[activeIndex]?.name}
                                </Text>
                                <Text className="text-white/90 text-xs mt-1">
                                    {formatFileSize(resources[activeIndex]?.size)}
                                </Text>
                            </Stack>
                        </HStack>

                        <HStack items={'center'} spacing={8}>
                            <TouchableOpacity onPress={() => onRemove?.(resources[activeIndex])}>
                                <MaterialIcons name={'delete'} size={30} color="white"/>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => onRemove?.(resources[activeIndex])}>
                                <MaterialIcons name={'add'} size={30} color="white"/>
                            </TouchableOpacity>
                        </HStack>
                    </HStack>
                </LinearGradient>
            </View>

            {/* 视频播放模态框 */}
            <Modal
                visible={videoVisible}
                transparent={false}
                onRequestClose={() => setVideoVisible(false)}
                statusBarTranslucent
                animationType="fade"
            >
                <View className="flex-1 bg-black justify-center items-center">
                    <Video
                        source={{uri: videoUri}}
                        className="w-screen h-screen bg-black"
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay
                        isLooping
                    />
                    <TouchableOpacity
                        className="absolute top-12 right-5 z-20 p-2.5 bg-black/50 rounded-full w-10 h-10 justify-center items-center"
                        onPress={() => setVideoVisible(false)}
                    >
                        <MaterialIcons name="close" size={30} color="white"/>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* 图片预览 */}
            <ImageView
                images={resources
                    .filter(r => !r.mimeType?.startsWith('video/'))
                    .map(r => ({uri: r.uri}))}
                imageIndex={activeIndex}
                visible={imageVisible}
                onRequestClose={() => setImageVisible(false)}
                swipeToCloseEnabled={true}
                doubleTapToZoomEnabled={true}
            />
        </View>
    );
};

// 格式化文件大小
const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 根据文件类型返回对应图标
const getFileTypeIcon = (mimeType?: string): string => {
    if (!mimeType) return 'insert-drive-file';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'videocam';
    return 'videocam';
};

export default ResourceList;
