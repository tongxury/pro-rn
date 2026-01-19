import AdvancedInput from "@/components/AdvancedInput";
import {useState} from "react";
import Picker from "@/components/Picker";
import {View} from "react-native";
import Button from "@/components/ui/Button";
import {performSingleUpload} from "@/utils/upload/oss_bak";
import useTailwindVars from "@/hooks/useTailwindVars";

const CommodityInput = ({onConfirm}: {
    onConfirm: (params: { url: string, target: string, images: string[] }) => void
}) => {

    const [url, setUrl] = useState('');
    const [target, setTarget] = useState('');
    const [files, setFiles] = useState<any[]>([]);

    const {colors} = useTailwindVars()

    const confirm = async () => {

        if (!url && !files.length) {
            return;
        }

        const images = []

        if (files?.length) {

            for (let i = 0; i < files.length; i++) {
                const url = await performSingleUpload(files[i], (p) => {
                })
                images.push(url)
            }
        }
        onConfirm({url, target, images});
    }


    return (
        <View className={'p-5 gap-5'}>
            <View className={'flex-col gap-5  bg-card rounded-[20px]'}>
                <AdvancedInput value={url} placeholder={'输入抖音商品链接'} onChangeText={setUrl}
                               style={{height: 150, borderWidth: 0, backgroundColor: colors.card}}/>

                <View className={'p-5'}>
                    <Picker files={files} allowedTypes={['image']} onChange={setFiles}/>
                </View>
            </View>
            {/*<Button text="确认" disabled={!(url || files?.length)} onPress={() => confirm()}></Button>*/}
        </View>
    )
}

export default CommodityInput;
