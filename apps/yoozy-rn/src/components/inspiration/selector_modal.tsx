import Selector from "@/components/inspiration/Selector";
import Modal from "@/components/ui/Modal";
import useTailwindVars from "@/hooks/useTailwindVars";
import React from "react";
import { Dimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: screenHeight } = Dimensions.get("window");

interface InspirationSelectorDrawerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (id: string) => void;
}

const InspirationSelectorModal = ({ visible, onClose, onSelect }: InspirationSelectorDrawerProps) => {
    const { colors } = useTailwindVars();
    const insets = useSafeAreaInsets();

    const handleSelect = (item: any) => {
        if (item?._id) {
            onSelect(item._id);
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            onClose={onClose}
            position="bottom"
            contentStyle={{
                height: screenHeight * 0.85,
                backgroundColor: colors.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingBottom: insets.bottom,
            }}
        >
            <View className="flex-1 w-full mt-2">
                <Selector
                    value={null}
                    onChange={handleSelect}
                />
            </View>
        </Modal>
    );
};

export default InspirationSelectorModal;
