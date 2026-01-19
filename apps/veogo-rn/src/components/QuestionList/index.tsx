import React, {useMemo, useRef, useState} from "react";
import {FlatList, ScrollView, Text, TouchableOpacity, View} from "react-native";
import QuestionView from "./V2/QuestionView";
import GeneratingAnswerView from "./V2/GeneratingAnswerView";
import ContinueQuestionModal from "./ContinueQuestionModal";
import MarkdownView from "@/components/QuestionList/MarkdownView";
import {Question} from "@/types";
import CreditView from "@/components/QuestionList/CreditView";
import {router} from "expo-router";

const QuestionList = ({
                          data = [],
                          refetch,
                          onContinueQuestion,
                      }: {
    data: any[];
    refetch?: () => void;
    onContinueQuestion?: (question: string, onComplete: () => void) => void;
}) => {
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // 获取已完成的问题数量
    // const totalQuestions = data?.length || 0;

    const totalQuestions = useMemo(() => {
        return data?.length || 0;
    }, [data])

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

    const goToLast = () => {
        setCurrentIndex(totalQuestions - 1);
    }


    const renderAnswer = (x: Question) => {

        if (!x) {
            return null;
        }

        if (x.status === "prepared" || x.status === "generating" || x.status === "toRetry") {
            return <GeneratingAnswerView data={x} onComplete={refetch}/>;
        }

        if (x.status === "completed") {
            return <MarkdownView text={x?.answer?.text}/>;
        }

        if (x.status === "created") {
            return <CreditView data={x} onRecharge={() => router.navigate('/pricing')}/>;
        }

        return <></>;
    }

    return (
        <View className="flex-1">
            {/* 问题 */}
            <View className={'p-5'}>
                <QuestionView data={data?.[currentIndex]}/>
            </View>
            {/*<View className={'h-3 bg-background1'}></View>*/}
            {/* 答案 */}
            <ScrollView className={'flex-1 px-5'}>
                {renderAnswer(data?.[currentIndex])}
            </ScrollView>
            {/* 操作区 */}
            <View className="flex-row items-center justify-between px-5 pt-3 border-t border-divider">
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
                {data.length > 0 && (
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


            {/* 继续追问模态框 */}
            <ContinueQuestionModal
                visible={showQuestionModal}
                onClose={() => setShowQuestionModal(false)}
                onSubmit={(text) => {
                    onContinueQuestion?.(text, () => {
                        setShowQuestionModal(false);
                        // setCurrentIndex(totalQuestions - 1);
                        goToLast()
                    });
                }}
            />
        </View>
    );
};

export default QuestionList;
