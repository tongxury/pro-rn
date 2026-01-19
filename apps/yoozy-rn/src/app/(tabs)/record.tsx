import ScreenContainer from "@/components/ScreenContainer";
import { ScreenHeader } from "@/components/ScreenHeader";
import useTailwindVars from "@/hooks/useTailwindVars";
import React from "react";
import AssetList from "../asset/list";

export default function MyScreen() {

  const { colors } = useTailwindVars();

  return (
    <ScreenContainer edges={['top']} stackScreenProps={{}}>
      <ScreenHeader title="记录" closeable={false} />
      <AssetList />
    </ScreenContainer>
  );
}
