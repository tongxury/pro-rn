import React from "react";
import useTailwindVars from "@/hooks/useTailwindVars";
import Button from "@/components/ui/Button";
import {HStack} from "react-native-flex-layout";
import {Ionicons} from "@expo/vector-icons";
import {Text, View} from "react-native";
import {useSettings} from "@/hooks/useSettings";
import {useTranslation} from "@/i18n/translation";


const SubmitButton = ({
                          onSubmit,
                          disabled,
                          promptId,
                      }: {
    onSubmit: () => void;
    disabled?: boolean;
    promptId: string;
}) => {

    const { colors } = useTailwindVars();

    const {
        settings,
        getPromptConfig,
    } = useSettings();

    const {t} = useTranslation();

    return (
        <>
            <Button  style={{flex: 1, height: 43}} disabled={disabled} onPress={onSubmit}>
                <View className={'items-center gap-[8px] flex-row'}
                    // style={{ opacity: disabled ? 0.5 : 1 }}
                >
                    <HStack items={"center"} spacing={5}>
                        <Ionicons name="flash" size={18} color={colors.foreground}/>
                        <Text
                            style={{
                                color: colors.foreground,
                                fontSize: 16,
                            }}
                        >
                            {getPromptConfig(promptId!)?.cost}
                            {/*{open ? 'true' : 'false'}*/}
                        </Text>
                    </HStack>
                    <Text
                        style={{
                            color: colors.foreground,
                            fontSize: 16,
                        }}
                    >
                        {t("startAnalysis")}
                    </Text>
                </View>
            </Button>

        </>
    );
};

export default SubmitButton;
