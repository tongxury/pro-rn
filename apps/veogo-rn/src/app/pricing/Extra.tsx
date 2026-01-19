import React, {useState} from "react";
import {StyleProp, Text, TouchableOpacity, View, ViewStyle} from "react-native";
import {useTranslation} from "@/i18n/translation";
import Button from "@/components/ui/Button";
import {FlashIcon} from "@/constants/scene_icons";
import {useColors} from "@/hooks/uesColors";
import {Grid} from "@/components/ui/Grid";
import usePricing from "@/hooks/usePricing";

const Extra = ({onSubmit, disabled, style}: {
    onSubmit: (plan: any) => void,
    disabled?: boolean,
    style?: StyleProp<ViewStyle>;
}) => {

    const {packages} = usePricing()

    const [current, setCurrent] = useState<any>(packages[1]);
    const {t} = useTranslation();

    const colors = useColors()

    const submit = () => {
        onSubmit(current,)
    }
    return <View style={style}>
        <Grid data={packages} spacing={15}
              renderItem={(option: any, index) => {
                  return (
                      <TouchableOpacity
                          key={option.id}
                          activeOpacity={0.8}
                          onPress={() => setCurrent(option)}
                          className={`p-4 rounded-xl border-2 items-center relative ${
                              option.id === current?.id
                                  ? "border-primary bg-background1"
                                  : "border-grey4 bg-background1"
                          }`}
                      >

                          <View className="flex-row items-center mb-3 gap-0.5">
                              <FlashIcon size={20} color={colors.primary}/>
                              <Text
                                  className="text-grey1 text-lg">{option.title}</Text>
                          </View>

                          <Text
                              className="text-white text-3xl mb-3  font-bold">¥ {option.amount}</Text>

                      </TouchableOpacity>
                  )

              }}
        />

        <Button
            disabled={disabled}
            text={t('payment.confirm')}
            onPress={submit}
        />
    </View>
}

export default Extra;
