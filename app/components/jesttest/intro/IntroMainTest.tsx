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
import { loadingBoxState, } from '../../../recoil/menuState';
//ex-component
import $ from "jquery"

// utils
import * as CONST from "../../../utils/Const"
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils"
import SiteIntroTest from "./site/SiteIntroTest";
// import HelpMain from "./help/HelpMain";
import EhpLandingTest from "./landing/EhpLandingTest";

//component

function IntroMainTest(props) {
    //recoil
    const isLoadingBox = useRecoilValue(loadingBoxState);
    //props
    const setPopWin = props.setPopWin;
    const tabMenuList = props.tabMenuList;
    const curTabMenu = props.curTabMenu;
    const setParentCurTabMenu = props.setCurTabMenu;




    return (
        <>
            {(curTabMenu.tabUrl === CONST.URL_EHC_INTRO) &&
                <SiteIntroTest
                    curTabMenu={curTabMenu}
                />
            }

            {/*       {(curTabMenu.tabUrl === CONST.URL_HELP) &&
                <HelpMain
                    curTabMenu={curTabMenu}
                />
            } */}
            {(curTabMenu.tabUrl === CONST.URL_LANDING) &&
                <EhpLandingTest
                    curTabMenu={curTabMenu}
                />
            }
        </>
    )

}

export default IntroMainTest;