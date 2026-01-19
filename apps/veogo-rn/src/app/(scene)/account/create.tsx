import {Alert, Animated, Text, TouchableOpacity, View} from "react-native";
import AdvancedInput from "@/components/AdvancedInput";
import React, {useRef, useState} from "react";
import {useTranslation} from "@/i18n/translation";
import Button from "@/components/ui/Button";
import * as Clipboard from "expo-clipboard";
import SocialIcon from "@/assets/svgs";
import {HStack} from "react-native-flex-layout";
import {platforms} from "@/constants/platform";
import {Account, Resource} from "@/types";
import {useColors} from "@/hooks/uesColors";
import {bindAccount} from "@/api/account";
import AccountInfo from "@/components/account/AccountInfo";
import Modal from "@/components/ui/Modal";
import ConnectionAnimationView from "@/components/account/ConnectionAnimationView";
import {router} from "expo-router";
import Picker from "@/components/Picker";
import {performSingleUpload} from "@/utils/upload";

const Create = () => {
    const {t} = useTranslation()
    const colors = useColors()

    const [keyword, setKeyword] = useState<string>("")
    const [files, setFiles] = useState<Resource[]>([])

    const [platform, setPlatform] = useState<string>("xiaohongshu")
    const [mode, setMode] = useState<'accountId' | 'image'>('accountId');

    const [account, setAccount] = useState<Account>();
    const [open, setOpen] = useState(false);

    const [isConnecting, setIsConnecting] = useState(false);

    const handlePaste = async () => {
        const clipboardText = await Clipboard.getStringAsync();
        setKeyword(clipboardText?.trim() || '');
    };

    const onChange = (text: string) => {
        setKeyword(text?.trim() || '');
    }

    const onSubmitByImage = async () => {

        if (!files?.length) {
            Alert.alert('提示', '请上传主页截图');
            return;
        }

        setOpen(true);
        setIsConnecting(true);

        const url = await performSingleUpload(files[0] as any,);

        const res = await bindAccount({platform, keyword: url})

        if (!res.data?.code) {
            setAccount(res.data?.data)
        } else {
        }
        // bindAccount({platform, keyword}).then(res => {
        //     if (!res.data?.code) {
        //         setAccount(res.data?.data)
        //     } else {
        //         // setAccount({})
        //         // 打开 手动上传主页图片入口
        //     }
        //
        //     setIsConnecting(false);
        // });

        setIsConnecting(false);
    }

    const onSubmit = () => {
        if (!keyword.trim()) {
            Alert.alert('提示', '请输入账号ID');
            return;
        }
        if (keyword?.startsWith("http://") || keyword?.startsWith("https://")) {
            Alert.alert('提示', '请按照提示输入账号ID, 而不是主页链接');
            setKeyword('');
            return;
        }

        setOpen(true);
        setIsConnecting(true);

        bindAccount({platform, keyword}).then(res => {
            if (!res.data?.code) {
                setAccount(res.data?.data)
            } else {
                // setAccount({})
                // 打开 手动上传主页图片入口
                Alert.alert("绑定失败", "试试上传主页截图的方式？", [{
                    text: '好的', onPress: () => {
                        setMode('image');
                    }
                }]);
            }

            setIsConnecting(false);
        });
    }

    const onConfirm = () => {
        setOpen(false);
        router.back();
    }

    return (
        <View className="flex-1 bg-background">
            {/* 表单区域 */}
            <View className={`flex-1 p-5 gap-3`}>
                {/* 平台选择 */}
                <HStack spacing={12}>
                    {platforms.map((x) => (
                        <TouchableOpacity
                            key={x.name}
                            className={`flex-1 flex-row gap-2 items-center p-3 rounded-2xl border-[1.5px] ${
                                platform === x.name
                                    ? "!border-primary bg-primary/5"
                                    : "!bg-cardBg/70 !border-cardBg/70"
                            }`}
                            onPress={() => setPlatform(x.name)}
                            activeOpacity={0.9}
                            disabled={open || !!account}
                        >
                            <SocialIcon name={x.name} size={30}/>
                            <Text className="text-grey0 text-lg font-semibold mb-1 tracking-tight">
                                {t(x.name)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </HStack>

                {mode === "accountId" && (
                    <>
                        <AdvancedInput
                            keyboardType={'url'}
                            showSoftInputOnFocus={false}
                            onPress={handlePaste}
                            maxLength={30}
                            value={keyword}
                            onChangeText={onChange}
                            placeholder={t(`account.${platform}IdPlaceholder`)}
                            editable={!open && !account}
                        />

                        <View>
                            <Button
                                text={open ? '连接中...' : t('confirm')}
                                onPress={onSubmit}
                                disabled={!keyword || open}
                            />
                        </View>
                        <Text className={'text-primary/50'}
                              onPress={() => setMode('image')}>切换为手动上传主页截图</Text>

                    </>
                )}


                {mode === "image" && (
                    <>
                        <View>
                            <Picker
                                selectFilesTitle={'上传主页截图'}
                                files={files}
                                maxFiles={1}
                                onChange={files => {
                                    setFiles(files);
                                }}
                                allowedTypes={['image']}/>
                        </View>

                        <View className={''}>
                            <Button
                                text={open ? '连接中(大概2-3分钟)...' : t('confirm')}
                                onPress={onSubmitByImage}
                                disabled={!files.length || open}
                            />
                        </View>

                        <Text className={'text-primary/50'} onPress={() => setMode('accountId')}>切换为输入账号ID</Text>
                    </>
                )}

            </View>

            <Modal
                visible={isConnecting && !account}
                contentStyle={{padding: 10}}
            >
                <ConnectionAnimationView platform={platform}/>
            </Modal>

            <Modal
                visible={!!account}
                contentStyle={{padding: 10}}
            >
                <View className={'gap-2'}>
                    {/* @ts-ignore */}
                    <AccountInfo account={account}/>
                    <Button text={'确认'} onPress={onConfirm}/>
                </View>
            </Modal>
        </View>
    )
}

export default Create;
