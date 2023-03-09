/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-05-09
 * @brief Local Clock 시계 컴포넌트
 * 1초당 rerandering 발생
 *
 ********************************************************************/
import React, { useState, useEffect } from "react";
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
// recoil state

import { useTrans } from "../../../utils/langs/useTrans";

/**
* @brief Local Clock 컴포넌트
* @param 
* @returns react components
*/
function AlarmCount(props) {
    //trans
    const t = useTrans();
    //props
    const setParentAlarmCount = props.setAlarmCount;
    const alarmCountReload = props.alarmCountReload;
    const setParentAlarmCountReload = props.setAlarmCountReload;
    //
    const [alarmCount, setAlarmCount] = useState(0);

    useEffect(() => {
        getAlarmCountUnRead();
    }, [alarmCountReload])

    let timer: any = null;

    async function getAlarmCountUnRead() {
        let data: any = null;
    }

    useEffect(() => {
        timer = setInterval(() => {
            getAlarmCountUnRead();
        }, 60000);
        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <>
            <p>100</p>
        </>
    );
}
export default AlarmCount;