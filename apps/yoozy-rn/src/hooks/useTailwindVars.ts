import {Theme, dark, light} from '@/tailwind.vars';
import { useColorScheme } from 'nativewind';


const useTailwindVars = () => {
    const { colorScheme } = useColorScheme();

    const themeColors = colorScheme === "dark" ? dark : light;

    const colors = {} as Record<keyof Theme, string>;
    (Object.keys(themeColors) as Array<keyof typeof themeColors>).forEach((key) => {
        const newKey = key.replace('--', '') as keyof Theme;
        colors[newKey] = `rgb(${themeColors[key].trim().split(' ').join(',')})`;
    });


    const fontSizes = {} as Record<keyof Theme, number>;
    (Object.keys(themeColors) as Array<keyof typeof themeColors>).forEach((key) => {
        const newKey = key.replace('--', '') as keyof Theme;
        fontSizes[newKey] = parseInt(themeColors[key]?.replace("px", ""));
    });


    return {colors, fontSizes};
};
export default useTailwindVars
