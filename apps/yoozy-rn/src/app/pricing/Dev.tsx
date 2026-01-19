import Meta from "./Meta";
import React, {useEffect, useState} from "react";
import ProcessingModal from "@/app/pricing/ProcessingModal";

const Dev = () => {

    const [payStart, setPayStart] = useState<number>();

    const submit = () => {
        setPayStart(Date.now());
    }

    return <>
        <Meta onSubmit={submit} payStart={payStart}/>
    </>
}

export default Dev;
