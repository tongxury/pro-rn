import {Theme, dark, light} from '@/tailwind.vars';
import {useColorScheme} from "react-native";

export const useColors = () => {
    const colorScheme = useColorScheme();
    let colorValue: Record<keyof Theme, string> = {} as Record<keyof Theme, string>;
    if (colorScheme === 'dark') {
        (Object.keys(dark) as Array<keyof typeof dark>).forEach((key) => {
            const newKey = key?.replace('--', '') as keyof Theme;
            colorValue[newKey] = `rgb(${dark[key].trim().split(' ').join(',')})`;
        });
    } else {
        (Object.keys(light) as Array<keyof typeof light>).forEach((key) => {
            const newKey = key.replace('--', '') as keyof Theme;
            colorValue[newKey] = `rgb(${light[key].trim().split(' ').join(',')})`;
        });
    }
    return colorValue;
};


export const useThemeColors = () => {
    const colorScheme = useColorScheme();
    let colorValue: Record<keyof Theme, string> = {} as Record<keyof Theme, string>;
    if (colorScheme === 'dark') {
        (Object.keys(dark) as Array<keyof typeof dark>).forEach((key) => {
            const newKey = key.replace('--', '') as keyof Theme;
            colorValue[newKey] = `rgb(${dark[key].trim().split(' ').join(',')})`;
        });
    } else {
        (Object.keys(light) as Array<keyof typeof light>).forEach((key) => {
            const newKey = key.replace('--', '') as keyof Theme;
            colorValue[newKey] = `rgb(${light[key].trim().split(' ').join(',')})`;
        });
    }
    return {
        colors: colorValue,
    };
};
