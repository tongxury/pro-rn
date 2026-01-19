import React, { useRef, useEffect } from 'react';
import { View, ScrollView, Image, Modal, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImagePreviewProps {
  images: Array<{ url: string; desc?: string }>;
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  initialIndex,
  visible,
  onClose,
  onIndexChange,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: screenWidth } = Dimensions.get('window');
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);

  // Auto-scroll to initial image when modal opens
  useEffect(() => {
    if (visible && images.length > 0 && scrollViewRef.current) {
      // Small delay to ensure ScrollView is rendered
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: initialIndex * screenWidth,
          animated: false,
        });
      }, 100);
    }
  }, [visible, initialIndex, screenWidth, images.length]);

  // Update current index when scrolling
  const handleScroll = (event: any) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    setCurrentIndex(newIndex);
    onIndexChange?.(newIndex);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.95)' }}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
          style={{ flex: 1 }}
        >
          {images.map((img, idx) => (
            <View
              key={idx}
              style={{
                width: screenWidth,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Image
                source={{ uri: img.url }}
                style={{ width: screenWidth * 0.9, height: '80%' }}
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>
        
        {/* Image Counter */}
        {images.length > 1 && (
          <View
            style={{
              position: 'absolute',
              bottom: 40,
              alignSelf: 'center',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
            }}
          >
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        )}
        
        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 50,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ImagePreview;
