/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author JiHoon Park
 * @contact jhpark@detech.co.kr
 * @date 2022-07-19
 * @brief EHP Management 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
//recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { loadingBoxState, } from '../../recoil/menuState';

// utils
import clog from "../../utils/logUtils";
import * as CONST from "../../utils/Const"
import * as CUTIL from "../../utils/commUtils"
//component
import UserMain from "./user/UserMain";
import ApprovalMain from "./approval/ApprovalMain";
import SiteMain from "./site/SiteMain";
import MenuMain from "./menu/MenuMain";
import MassageMain from "./massage/MessageMain";
import CheckSheetMain from "./checksheet/CheckSheetMain";
import EconsultMain from "./econsult/EconsultMain";
/**
 * @brief EHP Management 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
function ManagementMain(props) {
  //recoil
  const isLoadingBox = useRecoilValue(loadingBoxState);
  //props
  const tabMenuList = props.tabMenuList;
  const curTabMenu = props.curTabMenu;
  const setParentCurTabMenu = props.setCurTabMenu;
  const setParentPopWin = props.setPopWin;
  // option 선택 시  값 변경 액션
  function selectTabOption(optionElement) {
    const selectBox = optionElement.closest(".select");
    const selectedElement = selectBox.querySelector(".selected-value ");
    selectedElement.textContent = optionElement.textContent;
    var optionData = optionElement.getAttribute("data-value");
    selectedElement.setAttribute("data-value", optionData);
    clog("OPT VAL : " + optionElement.value);

    setParentCurTabMenu(JSON.parse(optionData)); // 탭 또는 모바일 경우
    //resetSearchParams();
  }
  function onClickTab(e) {
    var actTag = (e.target.tagName === "DIV") ? e.target : e.currentTarget;
    var tabStrInfo = actTag.getAttribute("data-value");
    var tabInfo = JSON.parse(tabStrInfo)
    //clog("TAB : " + JSON.stringify(tabInfo));
    //setAdminType(tabInfo.adminType);
    setParentCurTabMenu(tabInfo);

    setParentPopWin("pop-message-add", null);
    setParentPopWin("pop-message", null);
    setParentPopWin("pop-delete", null);
    setParentPopWin("pop-message-edit", null);
    //
    setParentPopWin("pop-answer-ok", null);
    setParentPopWin("pop-answer", null);


  }
  const [isNodata, setIsNoData] = useState(false);
  function handleNodata(pageInfo) {
    if (pageInfo.totalElements <= 0) {
      setIsNoData(true);
    } else {
      setIsNoData(false);
    }
  }
  //clog("IN MANAGEMENTMAIN : INIT : ISLOADING CHECK : " + isLoadingBox);
  return (
    <>
      {/*<!-- main, 컨테이너영역 -->*/}
      {/*<!-- 220808, 사업장 관리 admin-site 에서 레이아웃이 가로 3개로 구분될때, layout-w3 클래스 추가됨-->*/}
      <main className={`container admin-site ${(curTabMenu.tabUrl === CONST.URL_ECONSULTMANAGEMENT) ? "" : "layout-w3"} ${(curTabMenu.tabUrl === CONST.URL_SITEMANAGEMENT) ? "rightcont-half" : ""}`} style={{ "cursor": "default" }}> {/* no-responsive */}
        {/*<!-- .content, 컨텐츠영역:개별박스영역(.box)으로 구성 -->*/}
        <section className="content">
          {/*<!--그리드 영역 -->*/}
          <article className={`box list ${(isLoadingBox) ? "loading__box" : ""}`}>
            {/*<!--220531, 데이터 없는 경우 box__body 클래스에 nodata 추가 -->*/}
            <div className={`box__body ${(isNodata) ? "nodata" : ""}`}>
              {/*<!--슬라이드 탭 영역-->*/}
              <section className="swiper-section">
                <div className="swiper-container mySwiper " style={{ "cursor": "pointer" }}>
                  <div className="swiper-wrapper">
                    {/*<!--선택된 탭에 on 클래스 자동 생성, 첫번째 탭에는 on 넣기(기본 선택 탭)-->*/}
                    {tabMenuList.map((tabMenu, idx) => (
                      <div key={`tab_${idx.toString()}`}
                        className={`swiper-slide tab ${(tabMenu.tabId === curTabMenu.tabId) ? "on" : ""}`}
                        onClick={(e) => onClickTab(e)}
                        data-value={JSON.stringify(tabMenu)}>
                        <p>{tabMenu.tabName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/*<!--모바일 버전 탭-셀렉트 형식으로 변경됨 : 767 이하에서 노출-->
              <div className="d-sm-tab">
                <div className="select">
                  <div className="selected">
                    <div className="selected-value">All</div>
                    <div className="arrow"></div>
                  </div>
                  <ul>
                    {tabMenuList.map((tabMenu, idx) => (
                      <li key={`tab_m_${idx.toString()}`}
                        className={`option tab ${(tabMenu.tabId === curTabMenu.tabId) ? "on" : ""}`}
                        data-value={JSON.stringify(tabMenu)}
                      >
                        {tabMenu.tabName}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              */}
              {/*<!--모바일 버전 탭-셀렉트 형식으로 변경됨 : 767 이하에서 노출-->*/}
              <div className="d-sm-tab">
                <div className="select" onClick={(e) => CUTIL.onClickSelect(e, selectTabOption)}>
                  <div className="selected">
                    <div className="selected-value">{curTabMenu.tabName}</div>
                    <div className="arrow"></div>
                  </div>
                  <ul>
                    {tabMenuList.map((tabMenu, idx) => (
                      <li key={`tab_m_${idx.toString()}`}
                        className={`option tab ${(tabMenu.tabId === curTabMenu.tabId) ? "on" : ""}`}
                        data-value={JSON.stringify(tabMenu)}
                      >
                        {tabMenu.tabName}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {(curTabMenu.tabUrl === CONST.URL_APPROVALMANAGEMENT/*"TAB_APPROVAL"*/) &&
                <div id={curTabMenu.id} className="tabcontent current">
                  <ApprovalMain
                    setPopWin={props.setPopWin} //pop
                  />
                </div>
              }
              {(curTabMenu.tabUrl === CONST.URL_USERMANAGEMENT/*"TAB_USER"*/) &&
                <div id={curTabMenu.id} className="tabcontent layout-w2 current">
                  <UserMain
                    setPopWin={props.setPopWin} //pop
                  />
                </div>
              }
              {(curTabMenu.tabUrl === CONST.URL_SITEMANAGEMENT/*"TAB_SITE"*/) &&
                <div id={curTabMenu.id} className="tabcontent layout-w2 current">
                  <SiteMain
                    setPopWin={props.setPopWin} //pop
                  />
                </div>
              }
              {(curTabMenu.tabUrl === CONST.URL_MESSAGEMANAGEMENT/*"TAB_MESSAGE"*/) &&
                <div id={curTabMenu.id} className="tabcontent layout-w2 current">
                  <MassageMain
                    setPopWin={props.setPopWin} //pop
                  />
                </div>
              }
              {(curTabMenu.tabUrl === CONST.URL_MENUMANAGEMENT/*"TAB_MENU"*/) &&
                <div id={curTabMenu.id} className="tabcontent layout-w2 current">
                  <MenuMain
                    setPopWin={props.setPopWin} //pop
                  />
                </div>
              }
              {(curTabMenu.tabUrl === CONST.URL_CHECKSHEETMANAGEMENT/*"TAB_CHECK"*/) &&
                <div id={curTabMenu.id} className="tabcontent layout-w2 current">
                  <CheckSheetMain
                    setPopWin={props.setPopWin} //pop
                  />
                </div>
              }
              {(curTabMenu.tabUrl === CONST.URL_ECONSULTMANAGEMENT/*"TAB_CHECK"*/) &&
                <div id={curTabMenu.id} className="tabcontent current">
                  <EconsultMain
                    setPopWin={props.setPopWin} //pop
                    handleNodata={handleNodata}
                  />
                </div>
              }
            </div>
          </article>
        </section>
      </main>

    </>
  )
};
export default ManagementMain;