import React, {useState, useRef} from 'react';
import {View, FlatList, Dimensions, StyleSheet, ActivityIndicator} from 'react-native';
import Video from 'react-native-video';

const {height} = Dimensions.get('window');

interface VideoItem {
    id: string;
    url: string;
}

interface VideoFeedProps {
    videos: VideoItem[];
}

const VideoFeed: React.FC<VideoFeedProps> = ({videos}) => {
    const [activeVideoIndex, setActiveVideoIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const renderItem = ({item, index}: {item: VideoItem; index: number}) => {
        const isActive = index === activeVideoIndex;

        return (
            <View style={styles.videoContainer}>
                <Video
                    source={{uri: item.url}}
                    style={styles.video}
                    resizeMode="cover"
                    repeat
                    paused={!isActive}
                    playInBackground={false}
                    playWhenInactive={false}
                    onError={(error) => console.log('视频播放错误:', error)}
                    onBuffer={() => <ActivityIndicator />}
                />
            </View>
        );
    };

    const onViewableItemsChanged = useRef(({viewableItems}: any) => {
        if (viewableItems.length > 0) {
            setActiveVideoIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    return (
        <FlatList
            ref={flatListRef}
            data={videos}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={height}
            snapToAlignment="start"
            decelerationRate="fast"
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            windowSize={3}
            maxToRenderPerBatch={3}
            removeClippedSubviews
            style={styles.container}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    videoContainer: {
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    video: {
        width: '100%',
        height: '100%',
    },
});

export default VideoFeed;
