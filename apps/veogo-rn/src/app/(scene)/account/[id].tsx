import {View, Text} from "react-native";
import {useLocalSearchParams} from "expo-router";


const Account = () => {

    const {id} = useLocalSearchParams();

    return (
        <View>
            <Text className={'text-white'}>{id}</Text>
        </View>
    )
}

export default Account
