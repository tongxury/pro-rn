import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import Video, { ResizeMode, OnProgressData, OnLoadData, VideoRef } from 'react-native-video';
import { getCachedVideoUri, prefetchVideo, isVideoCachedSync, getDeterministicLocalUri } from '@/utils/videoCache';
import { Ionicons } from '@expo/vector-icons';

interface VideoPlayerProps {
    videoUrl: string;
    timeStart?: number;
    timeEnd?: number;
    shouldLoop?: boolean;
    resizeMode?: ResizeMode;
    autoPlay?: boolean;
    onReadyForDisplay?: () => void;
    style?: StyleProp<ViewStyle>;
}

const VideoPlayer = ({
    videoUrl,
    timeStart = 0,
    timeEnd,
    shouldLoop = false,
    resizeMode = ResizeMode.CONTAIN,
    autoPlay = true,
    onReadyForDisplay,
    style
}: VideoPlayerProps) => {
    const videoRef = useRef<VideoRef>(null);
    const [paused, setPaused] = useState(!autoPlay);
    const [isLoading, setIsLoading] = useState(true);
    const isInitialSeekDone = useRef(false);
    
    const [resolvedUri, setResolvedUri] = useState<string>(() => {
        if (isVideoCachedSync(videoUrl)) {
            return getDeterministicLocalUri(videoUrl);
        }
        return videoUrl;
    });

    // 1. 处理 URL 切换
    useEffect(() => {
        let isMounted = true;
        isInitialSeekDone.current = false;
        setIsLoading(true);
        setPaused(!autoPlay);

        const resolveSource = async () => {
            const cachedUri = await getCachedVideoUri(videoUrl);
            if (isMounted) {
                setResolvedUri(cachedUri);
                if (cachedUri === videoUrl) prefetchVideo(videoUrl);
            }
        };

        resolveSource();
        return () => { isMounted = false; };
    }, [videoUrl]);

    // 2. 处理 timeStart 变化（比如编辑时）
    useEffect(() => {
        if (isInitialSeekDone.current) {
            videoRef.current?.seek(timeStart);
        }
    }, [timeStart]);

    const performInitialSeek = () => {
        if (!isInitialSeekDone.current) {
            videoRef.current?.seek(timeStart);
            isInitialSeekDone.current = true;
        }
    };

    const handleLoad = (data: OnLoadData) => {
        setIsLoading(false);
        performInitialSeek();
    };

    const handleReadyForDisplay = () => {
        // ReadyForDisplay 是最稳健的 seek 时机
        performInitialSeek();
        if (onReadyForDisplay) onReadyForDisplay();
    };

    const handleProgress = (data: OnProgressData) => {
        // 片段循环逻辑：一旦当前时间超过 timeEnd，强制回跳
        if (!paused && timeEnd !== undefined && data.currentTime >= timeEnd) {
            videoRef.current?.seek(timeStart);
            if (!shouldLoop) {
                setPaused(true);
            }
        }
    };

    const handleEnd = () => {
        if (shouldLoop) {
            videoRef.current?.seek(timeStart);
        } else {
            setPaused(true);
            videoRef.current?.seek(timeStart);
        }
    };

    const togglePlayPause = () => {
        setPaused(!paused);
    };

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity
                style={StyleSheet.absoluteFill}
                activeOpacity={1}
                onPress={togglePlayPause}
            >
                <Video
                    ref={videoRef}
                    source={{ uri: resolvedUri }}
                    style={StyleSheet.absoluteFill}
                    resizeMode={resizeMode}
                    paused={paused}
                    muted={false}
                    volume={1.0}
                    onLoad={handleLoad}
                    onProgress={handleProgress}
                    onEnd={handleEnd}
                    onReadyForDisplay={handleReadyForDisplay}
                    progressUpdateInterval={50} // 保持高频监测
                    repeat={false} 
                    playInBackground={false}
                    playWhenInactive={false}
                    ignoreSilentSwitch="ignore"
                    shutterColor="transparent"
                    disableFocus={true}
                    mixWithOthers="mix"
                />

                {(paused || isLoading) && (
                    <View style={styles.overlay}>
                            {isLoading ? (
                            <ActivityIndicator size="large" color="#fff" />
                            ) : (
                            <Ionicons name="play" size={60} color="rgba(255,255,255,0.8)" />
                            )}
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'black',
        overflow: 'hidden',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
});

export default VideoPlayer;
