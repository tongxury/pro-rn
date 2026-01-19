import {useState, useEffect} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {colorScheme} from "nativewind";

const THEME_KEY = "appTheme";

type ThemeMode = "light" | "dark" | "system";

// 创建一个全局状态
let globalThemeMode: ThemeMode = "light";
let isInitialized = false;

export const useThemeMode = () => {
    const [themeMode, setThemeMode] = useState<ThemeMode>(globalThemeMode);

    useEffect(() => {
        if (!isInitialized) {
            void loadSavedTheme();
            isInitialized = true;
        }
    }, []);

    useEffect(() => {
        applyTheme();
    }, [themeMode]);

    const loadSavedTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_KEY);

            console.log('savedTheme', savedTheme);

            if (savedTheme && ["light", "dark"].includes(savedTheme)) {
                globalThemeMode = savedTheme as ThemeMode;
                setThemeMode(globalThemeMode);
            } else {
                globalThemeMode = "light";
                setThemeMode("light");
                await AsyncStorage.setItem(THEME_KEY, "light");
            }
        } catch (error) {
            console.error("Error loading saved theme:", error);
            setThemeMode("light");
        }
    };
    const applyTheme = () => {
        colorScheme.set(themeMode);
    };

    const changeTheme = async (newTheme: ThemeMode) => {
        try {
            setThemeMode(newTheme);
            await AsyncStorage.setItem(THEME_KEY, newTheme);
        } catch (error) {
            console.error("Error saving theme:", error);
        }
    };

    const getCurrentTheme = (): ThemeMode => {
        return themeMode;
    };

    const getThemeOptions = () => {
        return [
            {value: "light", label: "lightTheme", icon: "sun"},
            {value: "dark", label: "darkTheme", icon: "moon"},
        ];
    };

    return {
        themeMode,
        currentTheme: getCurrentTheme(),
        changeTheme,
        getThemeOptions,
        isDarkMode: themeMode === "dark",
    };
};
