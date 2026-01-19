import {FlatList, Text, TouchableOpacity, View, Alert} from "react-native";
import React, {useCallback, useState} from "react";
import {updateDefaultAccount} from "@/api/api";
import {router, Stack, useFocusEffect} from "expo-router";
import {Account} from "@/types";
import {useAccounts} from "@/hooks/useAccounts";
import {useTranslation} from "@/i18n/translation";
import {useColors} from "@/hooks/uesColors";
import AccountInfo from "@/components/account/AccountInfo";
import {updateAccount, deleteAccount} from "@/api/account";
import useDateFormatter from "@/hooks/useDateFormatter";
import {Feather} from '@expo/vector-icons';

const AccountList = () => {
    const {grey0, error, primary, grey4, grey2, grey3} = useColors();
    const {t} = useTranslation();

    const {accounts, defaultAccount, setDefaultAccount, fetch, fetchAsync, isLoading} = useAccounts();

    // const [tmpDefault, setTmpDefault] = useState<Account>();
    const [updatingAccountId, setUpdatingAccountId] = useState<string | null>(null);
    const [deletingAccountId, setDeletingAccountId] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            fetch();
        }, [])
    );

    const {formatToNow} = useDateFormatter()

    const onUpdate = async (id?: string) => {
        if (!id) return;

        setUpdatingAccountId(id);
        try {
            await updateAccount({id});
            await fetch();
        } catch (error) {
            Alert.alert('更新失败', '账号更新失败，请稍后重试');
        } finally {
            setUpdatingAccountId(null);
        }
    }

    const onDelete = async (account: Account) => {
        if (!account._id) return;

        Alert.alert(
            '确认删除',
            `确定要删除 ${account.nickname || account.platform} 账号吗？此操作不可撤销。`,
            [
                {
                    text: '取消',
                    style: 'cancel',
                },
                {
                    text: '删除',
                    style: 'destructive',
                    onPress: async () => {
                        // @ts-ignore
                        setDeletingAccountId(account._id);
                        try {
                            await deleteAccount({id: account._id});
                            await fetch();
                        } catch (error) {
                            Alert.alert('删除失败', '账号删除失败，请稍后重试');
                        } finally {
                            setDeletingAccountId(null);
                        }
                    },
                },
            ]
        );
    };

    const handleDefaultAccountToggle = async (
        account: Account,
        isEnabled: boolean
    ) => {
        setDefaultAccount(account)
        await updateDefaultAccount({id: account?._id!});
        await fetchAsync();
        // setDefaultAccount(undefined)
    };

    const renderItem = ({item}: { item: Account }) => {
        const isDefault = defaultAccount ? defaultAccount?._id === item._id : item.isDefault;
        const isUpdating = updatingAccountId === item._id;
        const isDeleting = deletingAccountId === item._id;

        return (
            <TouchableOpacity activeOpacity={0.9} onPress={() => handleDefaultAccountToggle(item, true)}
                              className={`bg-background2 rounded-lg ${isDefault ? 'border-primary border-[1.5px]' : ''}`}>
                {/* 账号信息 */}
                <AccountInfo account={item}/>

                {/* 底部操作区域 */}
                <View className="flex-row items-center justify-end px-4 py-3">
                    {/* 右侧：操作按钮 */}
                    <View className="flex-row items-center gap-2">
                        {/* 设为默认按钮 */}
                        {!isDefault && (
                            <TouchableOpacity
                                onPress={() => handleDefaultAccountToggle(item, true)}
                                className="px-3 py-1.5 bg-primary/10 rounded-lg"
                                activeOpacity={0.8}
                            >
                                <Text className="text-primary text-xs font-medium">
                                    切换为此账号
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* 立即更新按钮 */}
                        <TouchableOpacity
                            onPress={() => onUpdate(item._id)}
                            disabled={isUpdating}
                            className={`px-3 py-1.5 rounded-lg ${
                                isUpdating
                                    ? 'bg-gray-600/30'
                                    : 'bg-blue-500/10'
                            }`}
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-center gap-1">
                                {isUpdating ? (
                                    <Feather name="loader" size={12} color={grey3}/>
                                ) : (
                                    <Feather name="refresh-ccw" size={12} color="#3B82F6"/>
                                )}
                                <Text className={`text-xs font-medium ${
                                    isUpdating ? 'text-grey3' : 'text-blue-400'
                                }`}>
                                    {isUpdating ? '更新中...' : '立即更新'}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* 删除按钮 */}
                        <TouchableOpacity
                            onPress={() => onDelete(item)}
                            disabled={isDeleting}
                            className={`px-3 py-1.5 rounded-lg ${
                                isDeleting
                                    ? 'bg-gray-600/30'
                                    : 'bg-red-500/10'
                            }`}
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-center gap-1">
                                {isDeleting ? (
                                    <Feather name="loader" size={12} color={grey3}/>
                                ) : (
                                    <Feather name="trash-2" size={12} color="#EF4444"/>
                                )}
                                <Text className={`text-xs font-medium ${
                                    isDeleting ? 'text-grey3' : 'text-red-400'
                                }`}>
                                    {isDeleting ? '删除中...' : '删除'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmpty = () => (
        <TouchableOpacity
            activeOpacity={1}
            onPress={() => router.push("/account/create")}
            className="flex-1 justify-center items-center py-20"
        >
            <Feather name="users" size={48} color={grey3}/>
            <Text className="text-white/80 text-lg font-semibold mt-4 mb-2 tracking-tight">
                {t("account.noAccountData")}
            </Text>
            <Text className="text-white/60 text-sm tracking-tight">
                {t("account.createFirstAccount")}
            </Text>
        </TouchableOpacity>
    );

    return (
        <>
            <Stack.Screen
                options={{
                    title: t("account.management"),
                    headerRight: () => (
                        <TouchableOpacity onPress={() => router.push("/account/create")}>
                            <Feather name="plus"  size={24} color={grey0}/>
                        </TouchableOpacity>
                    ),
                }}
            />
            <View className="flex-1 bg-background">
                <FlatList
                    data={accounts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id || Math.random().toString()}
                    contentContainerStyle={{padding: 16, paddingBottom: 32}}
                    ListEmptyComponent={renderEmpty}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={8}
                    maxToRenderPerBatch={5}
                    windowSize={10}
                    refreshing={isLoading}
                    onRefresh={fetch}
                    removeClippedSubviews={true}
                    ItemSeparatorComponent={() => <View className="h-3"/>}
                />
            </View>
        </>
    );
};

export default AccountList;
