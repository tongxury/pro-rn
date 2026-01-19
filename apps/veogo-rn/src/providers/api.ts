import axios from 'axios';
import {Platform} from 'react-native';
import {getAuthToken} from '@/utils';
import {Toast} from 'react-native-toast-notifications';
import {router} from 'expo-router';
import Constants from "expo-constants";
import {getConfig} from "@/config";
import DeviceInfo from "react-native-device-info";

const instance = axios.create({});

// 这是用法
// instance.request({
//     url: '',
//     params: {},
//     data: {}
// })

instance.interceptors.request.use(
    async function (config) {

        config.baseURL = getConfig().API_URL;

        const token = await getAuthToken();

        config.headers.set('Authorization', token || '');
        config.headers.set('Platform', Platform.OS);
        config.headers.set('Client-Version', Constants.expoConfig?.version || '');
        config.headers.set('Device-Id', (await DeviceInfo.getUniqueId()).toLowerCase());
        // config.headers.set('Client', 'user')
        // config.headers.set('Version', Constants.expoConfig.version ?? '')
        // config.headers.set('U-Version', conf.version)

        // console.log(`--------- ${new Date().valueOf()} http sending request...`, config);

        return config;
    },
    function (error) {
        console.error(error);
        // Do something with request error
        return Promise.reject(error);
    },
);

// Add a response interceptor
instance.interceptors.response.use(
    function (response) {
        // Any status code that lie within the range of 2xx cause this function to trigger
        // Do something with response data

        if (response.status !== 200) {
            Toast.show('服务器繁忙, 请稍后重试');
        } else {
            switch (response.data?.code) {
                case 'UNAUTHORIZED':
                    router.navigate('/login');
                    return Promise.reject(response.data.message || response.data.code);
                // case 10404:
                //     // nav.navigate('Store')
                //     break;
            }
            // if (response.data.code || response.data.message) {
            //     Toast.show(response.data.message || response.data.code);
            //     // console.error(response.data.error, response);
            //     return Promise.reject(response.data.message || response.data.code);
            // }
        }

        return response;
    },
    function (error) {
        console.error('provider/api', error);
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        // Do something with response error
        return Promise.reject(error);
    },
);

export default instance;
