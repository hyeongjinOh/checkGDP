/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-24
 * @brief EHP 설비수명 - 수명인자,설비수명Report 개발
 *
 ********************************************************************/

import React, { useEffect, useRef, useState } from "react";
//recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { loadingBoxState, } from '../../recoil/menuState';
//ex-component
import $ from "jquery"

// utils
import * as CONST from "../../utils/Const"
import clog from "../../utils/logUtils";
import * as CUTIL from "../../utils/commUtils"
import DeviceLifeMain from "./devicelife/DeviceLifeMain";
import DeviceReportMain from "./devicereport/DeviceReportMain";

 /**
 * @brief EHP 설비수명 개발 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

//component

function EquipmentLifeMain(props) {
    //recoil
    const isLoadingBox = useRecoilValue(loadingBoxState);
    //props
    const setPopWin = props.setPopWin;
    const tabMenuList = props.tabMenuList;
    const curTabMenu = props.curTabMenu;
    const setParentCurTabMenu = props.setCurTabMenu;



    return (
        <>
            {(curTabMenu.tabUrl == CONST.URL_DEVICESLIFE) &&
                <DeviceLifeMain
                    setPopWin={setPopWin}
                    curTabMenu={curTabMenu}
                />
            }
            {(curTabMenu.tabUrl == CONST.URL_DEVICESLIFEREPORT) &&
                <DeviceReportMain
                    setPopWin={setPopWin}
                    curTabMenu={curTabMenu}
                />
            }
        </>
    )

}

export default EquipmentLifeMain;