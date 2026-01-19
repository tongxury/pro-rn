import { isIos } from "@/utils";
import IOS from "./IOS";
import Android from "@/app/pricing/Android";
import Dev from "@/app/pricing/Dev";
import { getConfig } from "@/config";

const Pricing = () => {
  if (getConfig().ENV === "development") {
    return (
      <>
        <Dev />
      </>
    );
  }

  return isIos ? <IOS /> : <Android />;
};

export default Pricing;
