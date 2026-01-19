import {ReactNode} from "react";

import {DefaultTheme, ThemeProvider} from "@react-navigation/native";

const AppThemeProvider = ({children}: { children: ReactNode }) => {

    return (
        <ThemeProvider value={DefaultTheme}>
            {children}
        </ThemeProvider>
    );
};

export default AppThemeProvider;
