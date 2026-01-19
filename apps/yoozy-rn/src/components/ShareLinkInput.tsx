import {Alert, StyleProp, Text, TouchableOpacity, View, ViewStyle} from "react-native";
import useTailwindVars from "@/hooks/useTailwindVars";
import React, {useState} from "react";
import {Stack} from "react-native-flex-layout";
import Button from "@/components/ui/Button";
import {extractLink} from "@/utils/url";
import {getResourceByShareLink} from "@/api/api";
import {Resource} from "@/types";
import {useTranslation} from "@/i18n/translation";
import * as Clipboard from 'expo-clipboard';
import AdvancedInput from "@/components/AdvancedInput";
import AntDesign from '@expo/vector-icons/AntDesign';


export default function ShareLinkInput({
                                           onComplete,
                                           style,
                                       }: {
    onComplete: (resources: Resource[]) => void;
    style?: StyleProp<ViewStyle>;
}) {
    const {t} = useTranslation();
    const { colors } = useTailwindVars();

    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);

    const onExtract = () => {
        if (!link || loading) return;

        setLoading(true);

        const url = extractLink(link);

        if (!url) {
            Alert.alert(t("inputError"));
            setLoading(false);
            return;
        }

        getResourceByShareLink({link: url})
            .then((res) => {
                if (res?.data?.data?.resources?.length) {
                    setLink("");
                    setLoading(false);

                    onComplete?.(res?.data?.data?.resources);
                } else {
                    Alert.alert(t("extractFail"));
                    setLink("");
                    setLoading(false);
                }
            })
            .catch(() => {
                setLink("");
                setLoading(false);
            });

        // addResourceV7({link: url}).then((res) => {
        //     if (!res?.code && res?.data?.resources) {
        //         setResources(res.data?.resources)
        //         setUploading(false)
        //     } else {
        //         message.error(t(res?.code)).then()
        //         setLink('')
        //         setUploading(false)
        //     }
        // }).catch((err) => {
        //     message.error('提取失败，请稍后重试').then(() => {
        //     })
        //     setLink('')
        //     setUploading(false)
        // })
    };

    const handlePaste = async () => {
        const clipboardText = await Clipboard.getStringAsync();
        onChange(clipboardText);
    };


    const onChange = (text: string) => {

        if (text) {
            const url = extractLink(text);
            if (url) {
                setLink(text);
            }
        } else {
            setLink(text);
        }
    }


    return (
        <Stack style={style} justify={"between"}>
            <View className={'gap-2'}>
                <AdvancedInput
                    // className="rounded-[8px] p-[12px] text-[14px] text-white mb-[20px] bg-grey4 h-[200px]"
                    placeholder={t("inputShareLink")}
                    placeholderTextColor={colors['muted-foreground']}
                    showSoftInputOnFocus={false}
                    value={link}
                    editable={!loading}
                    onPress={handlePaste}
                    style={{minHeight: 100}}
                    onChangeText={onChange}
                    clearButtonMode={'while-editing'}
                    // multiline={true}
                    numberOfLines={10}
                />
                <TouchableOpacity activeOpacity={0.9} onPress={
                    () => Alert.alert(t("linkRuleTitle"), t("linkRuleDetail"))
                }>
                    <View className={'flex-row gap-0.5 items-center'}>
                        <Text className={'text-disabled text-sm'}>
                            {t("linkRuleTitle")}
                        </Text>
                        <AntDesign name="questioncircle" size={12} color={colors.border}/>
                    </View>
                </TouchableOpacity>
            </View>
            <Button
                loading={loading}
                onPress={onExtract}
                disabled={!link || loading}
                text={t("extractBtn")}
            ></Button>
        </Stack>
    );
}

