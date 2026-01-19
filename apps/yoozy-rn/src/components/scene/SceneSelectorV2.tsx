import {Pressable, Text, TouchableOpacity, View} from "react-native";
import useTailwindVars from "@/hooks/useTailwindVars";
import Modal from "@/components/ui/Modal";
import {HStack} from "react-native-flex-layout";
import {Fragment, useState} from "react";

import useGlobal from "@/hooks/useGlobal";
import {useTranslation} from "@/i18n/translation";
import {Grid} from "@/components/ui/Grid";
import {MaterialIcons} from "@expo/vector-icons";

export default function SceneSelectorV2({
                                            scene,
                                            onSelectScene,
                                        }: {
    scene: string;
    onSelectScene: (scene: string) => void;
}) {
    const {
        settings: {scenes},
    } = useGlobal();

    const { colors } = useTailwindVars();
    const [open, setOpen] = useState(false);
    const {t} = useTranslation();
    const current = scenes.filter((x) => x.value === scene)?.[0];
    return (
        <Fragment>
            <Pressable onPress={() => setOpen(true)}>
                <HStack justify={"between"} items={"center"}>
                    <Text className={`text-foreground text-md`}>{t(`scene.${current.value}`)}</Text>
                    <MaterialIcons name={"keyboard-arrow-down"} size={20} color={colors.foreground}/>
                </HStack>
            </Pressable>
            <Modal
                visible={open}
                position={"top"}
                onClose={() => {
                    setOpen(false);
                }}
            >
                <Grid columns={3} containerStyle={{padding: 15}} spacing={20} data={scenes} renderItem={(x, index) => {
                    return (
                        <TouchableOpacity
                            key={index}
                            className={`
                                  ${x.value === current.value ? "border-primary border-[1px]" : ""}
                                  rounded-lg
                                  items-center
                                  justify-center
                                  bg-muted
                                  py-[10px]
                                  gap-[8px]
                                  `}
                            onPress={() => {
                                setOpen(false);
                                onSelectScene(x.value);
                            }}
                        >
                            {/*<AntDesign*/}
                            {/*    name={x.icon}*/}
                            {/*    size={24}*/}
                            {/*    color={x.value === current.value ? primaryColor : '#fff'}*/}
                            {/*/>*/}

                            {x.getSceneIcon?.({
                                size: 24,
                                color:
                                    x.value === current.value
                                        ? colors.primary
                                        : colors.background,
                            })}

                            <Text
                                className={`text-[12px] text-center mt-[5px] ${
                                    x.value === current.value ? "text-primary" : "text-white"
                                }`}
                            >
                                {t(`scene.${x.value}`)}
                            </Text>
                        </TouchableOpacity>
                    );
                }}>

                </Grid>
            </Modal>
        </Fragment>
    );
}
