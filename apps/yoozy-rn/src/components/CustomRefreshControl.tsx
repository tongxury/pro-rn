import useTailwindVars from "@/hooks/useTailwindVars";
import React from "react";
import { RefreshControl, RefreshControlProps } from "react-native";

interface CustomRefreshControlProps extends RefreshControlProps { }

export const CustomRefreshControl: React.FC<CustomRefreshControlProps> = (
    props
) => {
    const { colors } = useTailwindVars();

    return (
        <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.background}
            {...props}
        />
    );
};
