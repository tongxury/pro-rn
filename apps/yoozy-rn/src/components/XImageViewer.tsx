import { useState } from "react"
import { Text, TouchableOpacity, View } from "react-native"
import ImageView from "react-native-image-viewing"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const XImageViewer = ({ children, defaultIndex = 0, images }: { children: React.ReactNode, images: string[], defaultIndex?: number }) => {
    const [visible, setVisible] = useState(false)
    const insets = useSafeAreaInsets()

    if (!images?.length) return null;

    return (
        <>
            <TouchableOpacity activeOpacity={0.9} onPress={() => setVisible(true)}>
                {children}
            </TouchableOpacity>
            <ImageView
                swipeToCloseEnabled
                images={images.map(img => ({ uri: img }))}
                imageIndex={defaultIndex}
                visible={visible}
                onRequestClose={() => setVisible(false)}
                presentationStyle="overFullScreen"
                animationType="fade"
                FooterComponent={({ imageIndex }) => (
                    <View style={{ paddingBottom: insets.bottom + 20, alignItems: 'center', width: '100%' }}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                            {imageIndex + 1} / {images.length}
                        </Text>
                    </View>
                )}
            />
        </>
    )
}

export default XImageViewer