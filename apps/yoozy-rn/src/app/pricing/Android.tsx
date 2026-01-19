import Meta from "./Meta";
import {initialize, presentCardPaymentFlow, presentEntirePaymentFlow} from 'airwallex-payment-react-native';
import {useEffect, useState} from "react";
import {fetchPaymentIntent} from "@/api/payment";
import {Alert} from "react-native";
import {useTranslation} from "@/i18n/translation";
import {useRouter} from "expo-router";

const Android = () => {

    const router = useRouter()

    const {t} = useTranslation();
    const [payStart, setPayStart] = useState<number>();

    useEffect(() => {
        initialize()
    }, []);


    const submit = async (plan: any) => {
        setPayStart(Date.now());

        const pi = await fetchPaymentIntent({planId: plan?.id})

        const {clientSecret, amount, id, currency, mode, countryCode} = pi?.data?.data || {}

        console.log('pi', pi.data)

        const types = {
            oneOff: "OneOff",
            recurring: "Recurring",
        } as any;


        presentEntirePaymentFlow({
            paymentIntentId: id,
            currency,
            clientSecret,
            type: types[mode || "oneOff"],
            countryCode: countryCode || "CN",
            amount: amount,
            // isBillingRequired: false,
        })
            .then((result) => {

                Alert.alert(t(`payment.confirmTitle`), "",
                    [
                        {text: t(`payment.confirmCancel`), onPress: () => router.back()},
                        {text: t(`payment.confirmSuccess`), onPress: () => router.back()},
                    ])

                console.log(result);
                // switch (result.status) {
                //     // handle different payment result status in your UI
                //     case 'success':
                //     case 'inProgress':
                //     case 'cancelled':
                // }
            })
            .catch(
                (error) => console.log(error)
            )

    }

    return <Meta onSubmit={submit} payStart={payStart}/>
}

export default Android;
