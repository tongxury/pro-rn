import React, {useState} from "react";
import {View,} from "react-native";
import CategoryTabs from "@/components/hot/CategoryTabs";
import ItemList from "@/components/item/List";

export default function AdvancedItemList() {
    const [selectedCategory, setSelectedCategory] = useState("");

    return (
        <View className="flex-1 bg-background">
            <View className='mt-2'>
                <CategoryTabs category={selectedCategory} onChange={setSelectedCategory}/>
            </View>

            <View className="h-[0.5px] bg-divider"/>
            <ItemList category={selectedCategory}/>
        </View>
    );
}

