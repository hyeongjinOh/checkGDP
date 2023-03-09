/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-24
 * @brief EHP 설비수명 - 설비수명Report 개발
 *
 ********************************************************************/

import React, { useEffect, useRef, useState } from "react";
//recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { loadingBoxState, } from '../../../../recoil/menuState';
import { userInfoLoginState } from "../../../../recoil/userState";

// utils
import * as CONST from "../../../../utils/Const"
import clog from "../../../../utils/logUtils";
import * as CUTIL from "../../../../utils/commUtils"

function DeviceReportMainTest(props) {
    // props
    const setPopWin = props.setPopWin;
    const curTabMenu = props.curTabMenu;
    


    return (
        <>
            {/* <!-- main, 컨테이너영역 --> */}
            <main className="container">
                {/* <!--221123, 서비스 준비 중 추가--> */}
                <div className="area__error error-ready">
                    <strong>서비스 준비 중 입니다.</strong>
                    <p>LS ELCTRIC의 ALO 플랫폼과 연계하여 전력설비 수명과 관련된 Lifecycle 보고서를 제공.</p>
                    <p>(’23년 정식 오픈 및 비용 공지 예정)</p>
                </div>
            </main>
            {/* <!-- //main, 컨테이너영역 --> */}
        </>
    );
}

export default DeviceReportMainTest;