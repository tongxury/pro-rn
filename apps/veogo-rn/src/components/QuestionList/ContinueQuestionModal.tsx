import React, {useState} from "react";
import {Text, TextInput, View, KeyboardAvoidingView, Platform} from "react-native";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import {useColors} from "@/hooks/uesColors";

interface ContinueQuestionModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (text: string) => void;
}

const ContinueQuestionModal: React.FC<ContinueQuestionModalProps> =
    ({
         visible,
         onClose,
         onSubmit,
     }) => {
        const maxLength = 50

        const colors = useColors();

        const [customQuestion, setCustomQuestion] = useState("");

        const [loading, setLoading] = useState(false);

        // 预置问题列表
        const presetQuestions = [
            "能详细解释一下这个答案吗？",
            "有没有相关的例子？",
            "还有其他解决方案吗？"
        ];

        const handlePresetQuestion = (question: string) => {
            onSubmit(question);
            setCustomQuestion("");
        };

        const handleCustomQuestion = () => {
            if (customQuestion.trim()) {
                onSubmit(customQuestion.trim());
                setCustomQuestion("");
            }
        };

        const handleClose = () => {
            setCustomQuestion("");
            onClose();
        };

        return (
            <Modal
                visible={visible}
                onClose={handleClose}
                contentStyle={{backgroundColor: colors.background}}
            >

                <View className="px-5 pt-5">
                    {/* 标题 */}
                    <View className="items-center mb-6">
                        <Text className="text-white text-xl font-bold">继续追问</Text>
                    </View>

                    {/*/!* 预置问题 *!/*/}
                    {/*<View className="mb-6">*/}
                    {/*    <Text className="text-gray-300 text-base mb-3">快速提问</Text>*/}
                    {/*    {presetQuestions.map((question, index) => (*/}
                    {/*        <TouchableOpacity*/}
                    {/*            key={index}*/}
                    {/*            className="bg-primary/10 p-3 rounded-lg mb-3"*/}
                    {/*            onPress={() => handlePresetQuestion(question)}*/}
                    {/*            activeOpacity={0.7}*/}
                    {/*        >*/}
                    {/*            <Text className="text-white text-base">{question}</Text>*/}
                    {/*        </TouchableOpacity>*/}
                    {/*    ))}*/}
                    {/*</View>*/}

                    {/* 自定义输入 */}
                    <View className="gap-2">
                        <View className={'flex-row justify-between'}>
                            <Text className="text-grey2 text-base">自定义问题</Text>

                            <Text className="text-grey0/70 text-sm">
                                {customQuestion?.length || 0}/{maxLength}
                            </Text>
                        </View>

                        <TextInput
                            className="bg-background2 p-4 rounded-lg text-white text-base border-primary"
                            placeholder="输入你的问题..."
                            placeholderTextColor="#9CA3AF"
                            value={customQuestion}
                            onChangeText={setCustomQuestion}
                            multiline
                            style={{maxHeight: 200, minHeight: 100}}
                            numberOfLines={3}
                            maxLength={maxLength}
                        />

                        <Button loading={loading} disabled={!customQuestion} text={'发送问题'} onPress={() => {
                            onSubmit(customQuestion)
                            setLoading(true);
                        }}/>
                    </View>
                </View>

            </Modal>
        );
    };

export default ContinueQuestionModal;
