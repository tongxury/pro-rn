import {StyleProp, ViewStyle} from "react-native";
import {Resource} from "@/types";
import React, {useState} from "react";
import {router} from "expo-router";
import Button from "@/components/ui/Button";
import {HStack} from "react-native-flex-layout";
import {isImage, isVideo, packPersonalAccountResource,} from "@/utils/resource";
import {useAccounts} from "@/hooks/useAccounts";
import {useTranslation} from "@/i18n/translation";
import {performSingleUpload} from "@/utils/upload";
import {addQuestion, addSessionV3} from "@/api/api";
import * as VideoThumbnails from "expo-video-thumbnails";
import {RNFile} from "@/utils/upload/utils";
import SubmitButton from "@/components/Submitter/SubmitButton";
import WaitingModal from "@/components/Submitter/Waiting";
import DefaultAccount from "@/components/DefaultAccount";
import useInterval from "@/hooks/common/useInterval";

interface SubmitterProps {
    sessionId: string;
    scene: string;
    promptId: string;
    resources: Resource[];
    onComplete?: () => void;
    accountRequired?: boolean;
    style?: StyleProp<ViewStyle>;
}

const Submitter = ({
                       sessionId,
                       promptId,
                       scene,
                       resources,
                       onComplete,
                       accountRequired,
                       style,
                   }: SubmitterProps) => {
    const [submitting, setSubmitting] = useState(false);
    const {t} = useTranslation();

    const [uploadProgress, setUploadProgress] = useState(10);

    const updateProgress = (progress: number) => {
        console.log('updateProgress', progress);

        setUploadProgress(prev => {
            return progress > prev ? progress : prev
        });
    }

    const onRetry = () => {
        setSubmitting(false);
    }

    const {defaultAccount} = useAccounts();

    useInterval(() => {
        console.log('useInterval')
        setUploadProgress(prevState => {
            return prevState >= 100 ? prevState : prevState + 1;
        });
    }, 1000, {enabled: submitting})


    const onSubmit = async () => {
        setSubmitting(true);

        // const il = setInterval(() => {
        //
        //     console.log('setInterval')
        //
        //     setUploadProgress(prevState => {
        //         return prevState >= 100 ? prevState : prevState + 1;
        //     });
        // }, 1000)

        const tmpResources = [];

        for (let i = 0; i < resources?.length; i++) {
            const x = resources[i];

            if (isImage(x) && x.uri) {
                const url = await performSingleUpload(x as any, (p) => {
                    updateProgress(p);
                });

                tmpResources.push({
                    ...x,
                    url: url,
                });
            } else if (isVideo(x) && x.uri) {
                const thumb = await VideoThumbnails.getThumbnailAsync(x.uri, {
                    time: 0,
                    quality: 0.5,
                });

                const coverUrl = await performSingleUpload(
                    {
                        uri: thumb.uri,
                        name: "thumb.jpg",
                        type: "image/jpeg",
                    } as RNFile,
                    (p) => {
                        // updateProgress(p);
                    }
                );

                const url = await performSingleUpload(x as any, (p) => {
                    updateProgress(p);
                });
                tmpResources.push({
                    ...x,
                    url: url,
                    coverUrl: coverUrl,
                });
            } else {
                tmpResources.push(x);
            }
        }

        if (accountRequired && defaultAccount) {
            tmpResources.push(packPersonalAccountResource(defaultAccount));
        }

        const sr = await addSessionV3({
            sessionId,
            scene,
            resources: tmpResources,
        });

        const qr = await addQuestion({
            sessionId,
            prompt: {id: promptId},
            scene: scene,
        });

        if (qr.data?.code === "exceeded") {
            router.push("/pricing");
        } else {
            router.push("/session");
        }

        // clearInterval(il)
        setUploadProgress(0);
        setSubmitting(false);
        onComplete?.();
    };


    if (accountRequired) {
        if (!defaultAccount) {
            return (
                <Button
                    style={[style]}
                    text={t("bindAccount")}
                    onPress={() => router.push("/account/list")}
                />
            );
        }

        return (
            <HStack
                spacing={10}
                style={[style]}
                items={"center"}
            >
                <DefaultAccount/>
                <SubmitButton
                    onSubmit={onSubmit}
                    promptId={promptId}
                    disabled={submitting || !resources?.length}
                />
                <WaitingModal visible={submitting} progress={uploadProgress}  onRetry={onRetry}/>
            </HStack>
        );
    }

    return (
        <HStack
            spacing={10}
            style={[style]}
            items={"center"}
        >
            <SubmitButton
                onSubmit={onSubmit}
                promptId={promptId}
                disabled={submitting || !resources?.length}
            />
            <WaitingModal visible={submitting} progress={uploadProgress} onRetry={onRetry}/>
        </HStack>
    );
};

export default Submitter;
