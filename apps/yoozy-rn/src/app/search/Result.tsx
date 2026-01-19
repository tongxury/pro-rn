import {View} from "react-native";
import SearchList from "@/components/item/SearchList";


const Result = ({keyword}: { keyword: string }) => {

    return <View className="flex-1">
        <SearchList keyword={keyword}/>
    </View>
}

export default Result;
