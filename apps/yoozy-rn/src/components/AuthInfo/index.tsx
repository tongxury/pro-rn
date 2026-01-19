import {useAuthUser} from "@/hooks/useAuthUser";
import LatterAvatar from "@/components/LatterAvatar";
import {TouchableOpacity} from "react-native";
import {router} from "expo-router";


const AuthInfo = () => {

    const {user} = useAuthUser({fetchImmediately: true})

    if (user) {
        return (
            <TouchableOpacity activeOpacity={0.9} onPress={() => router.push("/user/my")}>
                <LatterAvatar  size={30} name={user._id!} />
            </TouchableOpacity>
        )
    }

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={() => router.push("/login")}>
            {/* <FontAwesome5 name="user-circle" size={20} color={colors.foreground} /> */}
        </TouchableOpacity>
    )
}

export default AuthInfo
