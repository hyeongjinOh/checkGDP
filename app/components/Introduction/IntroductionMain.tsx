/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-10-12
 * @brief EHP 이메일 상담 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
//recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { loadingBoxState, } from '../../recoil/menuState';

// utils
import * as CONST from "../../utils/Const"
import clog from "../../utils/logUtils";
import * as CUTIL from "../../utils/commUtils"
//
import InquiryView from "./Inquiry/InquiryView";
import EhpServiceCenter from "../common/link/EhpServiceCenter";
import EhpChatbot from "../common/link/EhpChatbot";

/**
 * @brief EHP 이메일 상담 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

//component
function IntroductionMain(props) {

    //recoil
    const isLoadingBox = useRecoilValue(loadingBoxState);
    //props
    const tabMenuList = props.tabMenuList;
    const curTabMenu = props.curTabMenu;
    const setParentCurTabMenu = props.setCurTabMenu;
    const setPopWin = props.setPopWin
    const menuItem = props.menuItem

    const [meun, setMeun] = useState(menuItem)

    const [workMode, setWorkMode] = useState("READ");

    return (
        <>
            {/*<!-- main, 컨테이너영역 -->*/}
            {/*<!-- 레이아웃이 가로 1개로 구분될때, layout-w1 클래스 추가됨 / 점검출동 service-page-->*/}
            <main className="container layout-w1 service-page"  style={{"cursor":"default"}}>
                {/*<!-- .content, 컨텐츠영역:개별박스영역(.box)으로 구성 -->*/}
                <section className="content">
                    <article className={`box ${(isLoadingBox) ? "loading__box" : ""}`}>
                        {(curTabMenu.tabUrl == CONST.URL_INTRODUCTIONINQUIRT) &&
                            <InquiryView
                                setPopWin={setPopWin}

                            //pop
                            />
                        }
                        {/* } */}
                        {/*<!--// .box__body-->*/}
                    </article>
                </section>
                {/*<!-- //.content, 컨텐츠영역:개별박스영역으로 구성 -->*/}
            </main>
            {/*<!-- //main, 컨테이너영역 -->*/}

            {/* 서비스센터 */}
            {(curTabMenu.tabUrl == CONST.URL_INTRODUCTIONINQUIRT) &&
                <EhpServiceCenter />
            }
            {/* 챗봇 */}
            {(curTabMenu.tabUrl == CONST.URL_INTRODUCTIONINQUIRT) &&
                <EhpChatbot />
            }
        </>
    )
}

export default IntroductionMain;