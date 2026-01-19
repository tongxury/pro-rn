import {View} from "react-native";
import {useFocusEffect, useLocalSearchParams} from "expo-router";
import {useQuery} from "@tanstack/react-query";
import {appendQuestion, listQuestions} from "@/api/api";
import {useCallback} from "react";
import QuestionList from "@/components/QuestionList/V2/QuestionList";

export default function SessionScreen() {
    const {id} = useLocalSearchParams();
    //
    // const {
    //     data: questionsData,
    //     isLoading: isQuestionsLoading,
    //     refetch: refetchQuestions,
    // } = useQuery({
    //     queryKey: ["questions", id],
    //     queryFn: () => listQuestions({sessionId: id as string}),
    //     staleTime: 7 * 24 * 60 * 60 * 1000,
    //     enabled: false,
    //     refetchOnWindowFocus: false,
    // });
    //
    // const questions = questionsData?.data?.data;
    //
    // useFocusEffect(useCallback(() => {
    //     void refetchQuestions()
    // }, []))
    //
    // const onAppendQuestion = (question: string, onComplete: () => void) => {
    //     appendQuestion({
    //         sessionId: id as string,
    //         prompt: {id: 'custom', content: question},
    //     }).then(rsp => {
    //         console.log('xxxxxxxxxxxxxxx result result', rsp)
    //
    //         refetchQuestions().then((result) => {
    //
    //             console.log('xxxxxxxxxxxxxxx result result', result?.data?.data?.data?.list?.length);
    //             onComplete()
    //         })
    //
    //     })
    // }

    return (
        <View className="flex-1 bg-background">
            {/*{(isQuestionsLoading && !questions) ? (*/}
            {/*    <View className="flex-1 gap-3 p-[20px]">*/}
            {/*        <View className="gap-3 flex-row items-center">*/}
            {/*            <SkeletonLoader width={90} height={30}/>*/}
            {/*            <SkeletonLoader width={50} height={30}/>*/}
            {/*        </View>*/}
            {/*        <SkeletonLoader width="100%" height={300}/>*/}
            {/*        <SkeletonLoader width="100%" height={300}/>*/}
            {/*        <SkeletonLoader width="100%" height={300}/>*/}

            {/*    </View>*/}
            {/*) : (*/}
            {/*    <QuestionList data={questions?.list}*/}
            {/*                  refetch={refetchQuestions}*/}
            {/*                  onContinueQuestion={onAppendQuestion}/>*/}
            {/*)}*/}
            <QuestionList sessionId={id as string}/>
        </View>
    );
}
