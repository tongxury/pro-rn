import React, {useState} from "react";
import {ScrollView} from "react-native";
import Picker from "@/components/Picker";
import {Resource} from "@/types";

export default function BugReportScreen() {

    const [files, setFiles] = useState<Resource[]>([])

    return (
        <ScrollView className="flex-1 bg-background">
            <Picker
                selectFilesTitle={'上传主页截图'}
                files={files}
                maxFiles={1}
                onChange={files => {
                    setFiles(files);
                }}
                allowedTypes={['image']}/>
        </ScrollView>
    );
}

