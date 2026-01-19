import Picker from "@/components/Picker";
import ScreenContainer from "@/components/ScreenContainer";
import { Resource } from "@/types";
import React, { useState } from "react";
import { ScrollView } from "react-native";

export default function BugReportScreen() {

    const [files, setFiles] = useState<Resource[]>([])

    return (
        <ScreenContainer stackScreenProps={{ headerShown: true, title: "问题反馈" }}>
            <ScrollView className="flex-1">
                <Picker
                    selectFilesTitle={'上传主页截图'}
                    files={files}
                    maxFiles={1}
                    onChange={files => {
                        setFiles(files);
                    }}
                    allowedTypes={['image']} />
            </ScrollView>
        </ScreenContainer>
    );
}
