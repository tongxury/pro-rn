import {View, Text, ScrollView} from "react-native";
import useAppUpdate from "@/hooks/useAppUpdate";


const Debug = () => {

    const {channel, runtimeVersion, currentVersion} = useAppUpdate()

    return (
        <ScrollView className="flex-1 bg-background">
            <Text className={'text-white'}>channel: {JSON.stringify(channel)}</Text>
            <Text className={'text-white'}>runtimeVersion: {JSON.stringify(runtimeVersion)}</Text>
            <Text className={'text-white'}>currentVersion: {JSON.stringify(currentVersion)}</Text>
        </ScrollView>
    )
}

export default Debug;
