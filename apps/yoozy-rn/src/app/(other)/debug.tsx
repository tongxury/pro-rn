import ScreenContainer from "@/components/ScreenContainer";
import useAppUpdate from "@/hooks/useAppUpdate";
import { ScrollView, Text } from "react-native";

const Debug = () => {

    const { channel, runtimeVersion, currentVersion } = useAppUpdate()

    return (
        <ScreenContainer stackScreenProps={{ headerShown: true, title: "Debug" }}>
            <ScrollView className="flex-1">
                <Text className={''}>channel: {JSON.stringify(channel)}</Text>
                <Text className={''}>runtimeVersion: {JSON.stringify(runtimeVersion)}</Text>
                <Text className={''}>currentVersion: {JSON.stringify(currentVersion)}</Text>
            </ScrollView>
        </ScreenContainer>
    )
}

export default Debug;
