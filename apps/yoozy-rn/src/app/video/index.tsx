import { Feather } from "@expo/vector-icons";
import Video, { ResizeMode } from "react-native-video";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar, StyleSheet, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState } from 'react';

const VideoPage = () => {
    const { url } = useLocalSearchParams<{ url: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [isLoading, setIsLoading] = useState(true);

    const decodedUrl = url ? decodeURIComponent(url) : null;

    if (!decodedUrl) return null;

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false, animation: 'slide_from_bottom', animationDuration: 200}} />
            <StatusBar hidden />

            <Video
                source={{ uri: decodedUrl }}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                controls={true}
                paused={false}
                repeat={true}
                muted={false}
                ignoreSilentSwitch="ignore"
                playInBackground={false}
                playWhenInactive={false}
                shutterColor="transparent"
                onLoadStart={() => setIsLoading(true)}
                onLoad={() => setIsLoading(false)}
            />

            {isLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}

            <TouchableOpacity
                style={[styles.closeButton, { top: insets.top + 10, left: 20 }]}
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Feather name="chevron-left" size={32} color="white" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        zIndex: 50,
        padding: 4,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 40,
        backgroundColor: 'rgba(0,0,0,0.2)',
    }
});

export default VideoPage;
