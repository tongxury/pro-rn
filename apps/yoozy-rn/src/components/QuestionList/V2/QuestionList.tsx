import React, {useCallback, useMemo, useState} from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import QuestionView from "./QuestionView";
import GeneratingAnswerView from "./GeneratingAnswerView";
import MarkdownView from "@/components/QuestionList/MarkdownView";
import {Question} from "@/types";
import CreditView from "@/components/QuestionList/CreditView";
import {router, useFocusEffect} from "expo-router";
import {useQuery} from "@tanstack/react-query";
import {appendQuestion, listQuestions} from "@/api/api";
import {SkeletonLoader} from "@/components/ui/SkeletonLoader";
import Button from "@/components/ui/Button";

const QuestionList = ({sessionId,}: { sessionId: string; }) => {

    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [customQuestion, setCustomQuestion] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const {
        data: questionsData,
        isLoading: isQuestionsLoading,
        refetch: refetchQuestions,
    } = useQuery({
        queryKey: ["questions", sessionId],
        queryFn: () => listQuestions({sessionId}),
        staleTime: 7 * 24 * 60 * 60 * 1000,
        enabled: false,
        refetchOnWindowFocus: false,
    });

    const questions = questionsData?.data?.data?.list;

    // const questions = useMemo(() => {
    //     return questionsData?.data?.data?.list
    // }, [questionsData]);

    useFocusEffect(useCallback(() => {
        void refetchQuestions()
    }, []))

    const onAppendQuestion = async (question: string) => {

        setSubmitting(true);

        appendQuestion({
            sessionId: sessionId,
            prompt: {id: 'custom', content: question},
        }).then(rsp => {
            refetchQuestions().then((result) => {
                setCurrentIndex(result?.data?.data?.data?.list?.length - 1);
                setShowQuestionModal(false);
            })

            setSubmitting(false);
            setCustomQuestion('')
        })
    }

    const totalQuestions = useMemo(() => {
        return questions?.length || 0;
    }, [questions])

    const handlePrevious = () => {
        if (currentIndex > 0) {
            const newIndex = currentIndex - 1;
            setCurrentIndex(newIndex);
        }
    };

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            const newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
        }
    };

    const renderAnswer = (x: Question) => {

        if (!x) {
            return null;
        }

        if (x.status === "prepared" || x.status === "generating" || x.status === "toRetry") {
            return <GeneratingAnswerView data={x} onComplete={refetchQuestions}/>;
        }

        if (x.status === "completed") {
            return <MarkdownView text={x?.answer?.text}/>;
        }

        if (x.status === "created") {
            return <CreditView data={x} onRecharge={() => router.navigate('/pricing')}/>;
        }

        return <></>;
    }


    if (isQuestionsLoading && !questions) {
        return <View className="flex-1 gap-3 p-[20px]">
            <View className="gap-3 flex-row items-center">
                <SkeletonLoader width={90} height={30}/>
                <SkeletonLoader width={50} height={30}/>
            </View>
            <SkeletonLoader width="100%" height={300}/>
            <SkeletonLoader width="100%" height={300}/>
            <SkeletonLoader width="100%" height={300}/>
        </View>
    }

    const maxLength = 50

    return (
        <KeyboardAvoidingView
            style={{flex: 1}}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
        >
            {/* 问题 */}
            <View className={'p-5'}>
                <QuestionView data={questions?.[currentIndex]}/>
            </View>
            {/*<View className={'h-3 bg-muted'}></View>*/}
            {/* 答案 */}
            <ScrollView className={'flex-1 px-5'}>
                {renderAnswer(questions?.[currentIndex])}
            </ScrollView>
            {/* 操作区 */}
            <View className={'border-t border-divider'}>
                {
                    showQuestionModal &&
                    <TextInput
                        autoFocus
                        className="bg-muted p-4 rounded-t-lg text-white text-base border-primary"
                        placeholder="输入你的问题..."
                        placeholderTextColor="#9CA3AF"
                        value={customQuestion}
                        onChangeText={setCustomQuestion}
                        multiline
                        // style={{maxHeight: 200, minHeight: 100}}
                        numberOfLines={2}
                        maxLength={maxLength}
                        // returnKeyType="send"           // 将换行键改为"输入"
                        // onSubmitEditing={() => setShowQuestionModal(false)}
                        // blurOnSubmit={false}          // 防止提交时失去焦点
                    />
                }

                <View className="flex-row items-center justify-between px-5 pt-3">
                    {/* 序号切换区域 */}
                    {totalQuestions > 0 && (
                        <View className="flex-row items-center justify-between">

                            {/* 切换按钮 */}
                            <View className="flex-row items-center gap-2 ">
                                <TouchableOpacity
                                    onPress={handlePrevious}
                                    disabled={currentIndex === 0}
                                    className={`w-8 h-8 rounded-full items-center justify-center ${
                                        currentIndex === 0
                                            ? 'bg-gray-700 opacity-30'
                                            : 'bg-gray-700'
                                    }`}
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-white text-md ">‹</Text>
                                </TouchableOpacity>
                                {/* 序号显示 */}
                                <View className="flex-row items-center">
                                    <Text className="text-gray-300 text-sm mr-2">
                                        {currentIndex + 1} / {totalQuestions}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={handleNext}
                                    disabled={currentIndex === totalQuestions - 1}
                                    className={`w-8 h-8 rounded-full items-center justify-center ${
                                        currentIndex === totalQuestions - 1
                                            ? 'bg-gray-700 opacity-30'
                                            : 'bg-gray-700'
                                    }`}
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-gray-300 text-sm">›</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* 继续追问按钮 */}
                    {questions.length > 0 && (
                        showQuestionModal ?
                            <View className={'flex-row gap-2 items-center'}>
                                <TouchableOpacity
                                    className="py-1 px-3 rounded-full items-center"
                                    onPress={() => setShowQuestionModal(false)}
                                    activeOpacity={0.8}
                                >
                                    <Text className="text-white font-semibold text-base">
                                        取消
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-row gap-2 py-1 px-3 rounded-full items-center bg-primary"
                                    onPress={() => onAppendQuestion(customQuestion)}
                                    disabled={!customQuestion}
                                    activeOpacity={0.8}
                                >
                                    {submitting && <ActivityIndicator color="#fff" size="small" />}

                                    <Text className="text-white font-semibold text-base">
                                        确认
                                    </Text>
                                </TouchableOpacity>

                                {/*<Button*/}
                                {/*    style={{paddingHorizontal: 5, paddingVertical: 1}}*/}
                                {/*    disabled={!customQuestion}*/}
                                {/*    onPress={() => onAppendQuestion(customQuestion)}*/}
                                {/*    loading={submitting}*/}
                                {/*    text={'确认'}></Button>*/}
                            </View>

                            :
                            <TouchableOpacity
                                className="py-1 px-3 rounded-full items-center bg-primary"
                                onPress={() => setShowQuestionModal(true)}
                                activeOpacity={0.8}
                            >
                                <Text className="text-white font-semibold text-base">
                                    继续追问
                                </Text>
                            </TouchableOpacity>
                    )}
                </View>
            </View>

            {/*/!* 继续追问模态框 *!/*/}
            {/*<ContinueQuestionModal*/}
            {/*    visible={showQuestionModal}*/}
            {/*    onClose={() => setShowQuestionModal(false)}*/}
            {/*    onSubmit={(text) => {*/}
            {/*        onAppendQuestion?.(text);*/}
            {/*    }}*/}
            {/*/>*/}
        </KeyboardAvoidingView>
    );
};

export default QuestionList;
