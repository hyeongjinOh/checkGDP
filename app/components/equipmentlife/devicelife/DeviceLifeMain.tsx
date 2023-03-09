/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-24
 * @brief EHP 설비수명 - 수명인자 개발
 *
 ********************************************************************/

import React, { useEffect, useRef, useState } from "react";
//recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { loadingBoxState, } from '../../../recoil/menuState';
import { userInfoLoginState } from "../../../recoil/userState";

// utils
import * as CONST from "../../../utils/Const"
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils"
import DeviceLifeTree from "./DeviceLifeTree";
import DeviceLifeCRUD from "./DeviceLifeCRUD";

 /**
 * @brief EHP 설비수명  - 수명인자 개발 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function DeviceLifeMain(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const isLoadingBox = useRecoilValue(loadingBoxState);
    //props
    const setParentPopWin = props.setPopWin;
    const tabMenuList = props.tabMenuList;
    const curTabMenu = props.curTabMenu;
    const setParentCurTabMenu = props.setCurTabMenu;
    //
    const [isMobile, setIsMobile] = useState(false);
    const [adminType, setAdminType] = useState("LIFE"); // LIFE,REPORT
    // LIST, CREATE, UPDATE, DELETE, READ, BATCH
    const [workMode, setWorkMode] = useState("READ");
    const [reWork, setReWork] = useState(null)
    const [nodata, setNodata] = useState<number>();


    /*    // option 선택 시  값 변경 액션
       function selectTabOption(optionElement) {
           const selectBox = optionElement.closest(".select");
           const selectedElement = selectBox.querySelector(".selected-value ");
           selectedElement.textContent = optionElement.textContent;
           var optionData = optionElement.getAttribute("data-value");
           selectedElement.setAttribute("data-value", optionData);
           clog("OPT VAL : " + optionElement.value);
   
           defaultCurTree();
           setParentCurTabMenu(JSON.parse(optionData)); // 탭 또는 모바일 경우
           //resetSearchParams();
       } */
    /* function onClickTab(e) {
        var actTag = (e.target.tagName === "DIV") ? e.target : e.currentTarget;
        var tabStrInfo = actTag.getAttribute("data-value");
        var tabInfo = JSON.parse(tabStrInfo)
        //clog("TAB : " + JSON.stringify(tabInfo));
        //setAdminType(tabInfo.adminType);
        /*      if (curTabMenu.tabType === "TAB_DEVICE") {
                 // setAdminType("ZONE");
                 setWorkMode("READ");
                 defaultCurTree();
             } else {
     
             } 
        defaultCurTree();

        setParentCurTabMenu(tabInfo);
    } */
    /*     const defaultCurTree = () => (setSelTree({
            company: { companyId: "", companyName: "" },
            zone: { zoneId: "", zoneName: "" },
            subZone: { subZoneId: "", subZoneName: "" },
            room: { roomId: "", roomName: "" },
            spg: { spgId: -1, spgName: "" },
            reload: false
        })); */

    const defaultTree = {
        company: { companyId: "", companyName: "" },
        zone: { zoneId: "", zoneName: "" },
        subZone: { subZoneId: "", subZoneName: "" },
        room: { roomId: "", roomName: "" },
        reload: false
    };
    const [selTree, setSelTree] = useState(defaultTree);

    function handleSelTree(adminType, treeInfo) {
        clog("IN SITETREE : handleCurTree : " + adminType);
        setAdminType(adminType);
        setSelTree(treeInfo);
    }


    useEffect(() => {
        setReWork(selTree);
    }, [selTree])


    return (
        <>
            <main className="container admin-site"  style={{"cursor":"default"}}>
                {/*<!-- .content, 컨텐츠영역:개별박스영역(.box)으로 구성 -->*/}
                <section className="content">
                    {/*<!--그리드 영역 -->*/}
                    <article className={`box list ${(isLoadingBox) ? "loading__box" : ""} `}>
                        {/*<!--220531, 데이터 없는 경우 box__body 클래스에 nodata 추가 -->*/}
                        <div className={`box__body ${(nodata <= 0) ? "nodata" : ""}`}>
                            {/*<!--슬라이드 탭 영역-->*/}
                            <section className="swiper-section">
                                <div className="swiper-container mySwiper">
                                    <div className="swiper-wrapper">
                                        {/*<!--선택된 탭에 on 클래스 자동 생성, 첫번째 탭에는 on 넣기(기본 선택 탭)-->*/}
                                        <div className="swiper-slide tab on" data-tab="tab-1"><p>{curTabMenu.tabName}</p></div>
                                    </div>
                                </div>
                            </section>

                            {/*<!--탭별 내용 영역 : 선택된 탭에 current 자동 생성, 첫번째 내용에는 current 넣기(기본노출내용) -->*/}
                            {/*<!-- Tab1 -->*/}
                            <div id="tab-1" className="tabcontent current">
                                {/*<!--area__left, 왼쪽 영역, 메뉴부분은 피그마에 맞게 수정해서 넣어주세요~-->*/}
                                <DeviceLifeTree
                                    selTree={selTree}
                                    setSelTree={handleSelTree} // adminType 변경됨
                                    adminType={adminType}
                                    setAdminType={setAdminType}
                                />
                                {/*<!--//area__left, 왼쪽 영역-->*/}

                                {/*<!--area__right, 오른쪽 영역-->*/}
                                {(adminType == "LIFE") &&
                                    < DeviceLifeCRUD
                                        selTree={selTree}
                                        setSelTree={handleSelTree} // adminType 변경됨
                                        adminType={adminType}
                                        setAdminType={setAdminType}
                                        workMode={workMode}
                                        setWorkMode={setWorkMode}
                                        setPopWin={props.setPopWin}
                                        setNodata={setNodata}
                                        reWork={reWork}
                                        setReWork={setReWork}
                                    />
                                }


                                {/*<!--//area__right, 오른쪽 영역-->*/}
                            </div>
                            {/*<!-- //Tab2, 220722 기기등록관리 작업 -->*/}

                            {/*<!-- Tab3 -->*/}
                            {/* <div id="tab-3" className="tabcontent">tab 3:사용자 관리</div> */}
                            {/*<!--//탭별  내용 영역-->*/}
                        </div>
                        {/*<!--// .box__body-->*/}
                    </article>
                </section>
                {/*<!-- //.content, 컨텐츠영역:개별박스영역으로 구성 -->*/}
                {/* 
        {/*<!--220510, 트리플로팅버튼 추가-->*/}
                {/* <a href="#" className="treebar__toggleBtn"><span className="hide">트리메뉴보기</span></a>  */}
            </main>
        </>
    );
}

export default DeviceLifeMain;