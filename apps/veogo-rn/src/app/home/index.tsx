import VeogoList from "@/components/item/VeogoList";
import { Grid } from "@/components/ui/Grid";
import { useColors } from "@/hooks/uesColors";
import { useSettings } from "@/hooks/useSettings";
import { useTranslation } from "@/i18n/translation";
import { Scene } from "@/types";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";


function HomeScreen() {
    const {settings: {scenes}} = useSettings();
    const {t} = useTranslation();
    const {white} = useColors();

    const handleScenePress = (scene: Scene) => {
        router.navigate({
            pathname: "/starter",
            params: {scene: scene.value},
        });
    };

    return <ScrollView showsVerticalScrollIndicator={false} className={'flex-1 bg-background'}>
        {/*<View className={`bg-plain m-[15px] rounded-[10px] p-[25px] shadow-primary`}>*/}
        <View className={`mx-5 my-7`}>
            <Grid
                data={scenes.filter(x => !x.hideInHome)}
                columns={4}
                spacing={20}
                renderItem={(x, index) => (
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => handleScenePress(x)}
                        key={index}
                        className="items-center gap-4"
                    >
                        {x.getSceneIcon?.({size: 25, color: white})}
                        <Text className={'text-xs text-white'}>{t(`scene.${x.value}`)}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.value}
            />
        </View>
        {/*<Carousel*/}
        {/*    data={[*/}
        {/*        {*/}
        {/*            image: {uri: 'https://picsum.photos/400/200?random=1'},*/}
        {/*            title: '第一张图片',*/}
        {/*        },*/}
        {/*        {*/}
        {/*            image: {uri: 'https://picsum.photos/400/200?random=2'},*/}
        {/*            title: '第二张图片',*/}
        {/*        },*/}
        {/*        {*/}
        {/*            image: {uri: 'https://picsum.photos/400/200?random=3'},*/}
        {/*            title: '第三张图片',*/}
        {/*        },*/}
        {/*        {*/}
        {/*            image: {uri: 'https://picsum.photos/400/200?random=4'},*/}
        {/*            title: '第四张图片',*/}
        {/*        },*/}
        {/*    ]}*/}
        {/*    renderItem={(item, index) => (*/}
        {/*        <>*/}
        {/*            <Image source={item.image} style={{*/}
        {/*                width: '100%',*/}
        {/*                height: '100%',*/}
        {/*                resizeMode: 'cover',*/}
        {/*            }}/>*/}
        {/*            {item.title && (*/}
        {/*                <Text>{item.title}</Text>*/}
        {/*            )}*/}
        {/*        </>*/}
        {/*    )}*/}
        {/*    itemHeight={150}*/}
        {/*    autoPlay={true}*/}
        {/*    interval={3000}*/}
        {/*    showDots={true}*/}
        {/*    onItemPress={() => {*/}
        {/*    }}*/}
        {/*    style={{*/}
        {/*        height: 100,*/}
        {/*        margin: 15*/}
        {/*    }}*/}
        {/*/>*/}
        {/*<Button onPress={() => {*/}
        {/*    requestReview();*/}
        {/*    // void Linking.openURL(*/}
        {/*    //     // @ts-ignore*/}
        {/*    //     Platform.select<string>({*/}
        {/*    //         // ios: `https://apps.apple.com/app/id6747854090`,*/}
        {/*    //         ios: `itms-apps://itunes.apple.com/app/id6747854090?action=write-review`,*/}
        {/*    //         android: ''*/}
        {/*    //     })*/}
        {/*    // )*/}
        {/*}}/>*/}
        <VeogoList/>


    </ScrollView>
}

export default HomeScreen;