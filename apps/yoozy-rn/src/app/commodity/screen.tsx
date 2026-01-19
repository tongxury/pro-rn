import ScreenContainer from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import CommodityListScreen from "./list";
import { useTranslation } from "@/i18n/translation";


const CommodityScreen = () => {
    const { t } = useTranslation();
    
    return (
        <ScreenContainer edges={['top']} stackScreenProps={{headerShown: true, title: '我的商品'}}>
            <CommodityListScreen />
        </ScreenContainer>
    )
}

export default CommodityScreen;
