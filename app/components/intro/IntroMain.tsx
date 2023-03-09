/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-24
 * @brief EHP 서비스 소개 개발
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
import SiteIntro from "./site/SiteIntro";
import HelpMain from "./help/HelpMain";
import EhpLanding from "./landing/EhpLanding";
/**
 * @brief EHP 서비스 소개 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

//component

function IntroMain(props) {
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
                <SiteIntro
                    curTabMenu={curTabMenu}
                />
            }
            {(curTabMenu.tabUrl === CONST.URL_HELP) &&
                <HelpMain
                    curTabMenu={curTabMenu}
                />
            }
            {(curTabMenu.tabUrl === CONST.URL_LANDING) &&
                <EhpLanding
                    curTabMenu={curTabMenu}
                />
            }
        </>
    )

}

export default IntroMain;