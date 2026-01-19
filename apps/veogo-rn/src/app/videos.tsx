import React from 'react';
import {View, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import VideoFeed from '../components/VideoFeed';

const sampleVideos = [
    {
        id: '1',
        url: 'https://your-video-url-1.mp4',
    },
    {
        id: '2',
        url: 'https://your-video-url-2.mp4',
    },
    {
        id: '3',
        url: 'https://your-video-url-3.mp4',
    },
];

export default function VideosScreen() {
    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <VideoFeed videos={sampleVideos} />
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    safeArea: {
        flex: 1,
    },
});
