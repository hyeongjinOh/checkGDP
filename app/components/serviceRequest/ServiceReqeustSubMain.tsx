/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-10-20
 * @brief EHP WorkOrder 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
//recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { loadingBoxState, treeMenuState} from '../../recoil/menuState';
//ex-component
import $ from "jquery"

// utils
import * as CONST from "../../utils/Const"
import clog from "../../utils/logUtils";
import * as CUTIL from "../../utils/commUtils"

//component
import EhealthCheckMain from "./workorder/ehealthcheck/EhealthCheckMain";
import WorkInspectionMain from "./workorder/inspection/WorkInspectionMain";
import WorkHistoryList from "./workorder/histoty/WorkHistoryList";
import ChangeMain from "./workorder/change/ChangeMain";
/**
 * @brief EHP WorkOrder 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
function ServiceRequestSubMain(props) {
  //recoil
  const isLoadingBox = useRecoilValue(loadingBoxState);
  const [treeOpen, setRecoilTreeOpen] = useRecoilState(treeMenuState);  
  //props
  const setParentPopWin = props.setPopWin
  const tabMenuList = props.tabMenuList;
  const curTabMenu = props.curTabMenu;
  const setParentCurTabMenu = props.setCurTabMenu;

  //const menuItem = props.menuItem
  /*
  const subTabMenuList = [
    { tabId: 0, tabName: "e-Health Check", tabUrl: CONST.URL_SERVICEWORKORDER, tabType: "TAB_EHC" },
    { tabId: 1, tabName: "점검출동", tabUrl: CONST.URL_SERVICEWORKORDER, tabType: "TAB_INSPECTION" },
    { tabId: 2, tabName: "점검/사고이력", tabUrl: CONST.URL_SERVICEWORKORDER, tabType: "TAB_HISTORY" },
    { tabId: 3, tabName: "노후교체 컨설팅", tabUrl: CONST.URL_SERVICEWORKORDER, tabType: "TAB_CHANGE" },
  ];

  const [tabMenuList, setTabMenuList] = useState(subTabMenuList);
  const [curTabMenu, setCurTabMenu] = useState(subTabMenuList[0]);
  */

  const [nodata, setNodata] = useState<number>();

  // option 선택 시  값 변경 액션
  function selectTabOption(optionElement) {
    const selectBox = optionElement.closest(".select");
    const selectedElement = selectBox.querySelector(".selected-value ");
    selectedElement.textContent = optionElement.textContent;
    var optionData = optionElement.getAttribute("data-value");
    selectedElement.setAttribute("data-value", optionData);
    //setCurTabMenu(JSON.parse(optionData)); // 탭 또는 모바일 경우
    setParentCurTabMenu(JSON.parse(optionData)); // 탭 또는 모바일 경우
  }


  function onClickTab(e) {
    var actTag = (e.target.tagName === "DIV") ? e.target : e.currentTarget;
    var tabStrInfo = actTag.getAttribute("data-value");
    var tabInfo = JSON.parse(tabStrInfo)
    //setCurTabMenu(tabInfo);
    setParentCurTabMenu(tabInfo);
    //
    setParentPopWin("pop-list-ehcdetailview", null);
    setParentPopWin("pop-list-view", null);
    
  }

  function onClickMoblieTreeMenu(e) {
    //트리메뉴 모바일
    e.preventDefault();

    //$(this).parent().children().children().children().children().children(".area__left").addClass("active");
    //$(this).parent().children().children().children().children().children(".area__right").addClass("w100p");
    $(".area__left__toggleBtn").parent().children().children().children().children().children(".area__left").addClass("active");
    $(".area__left__toggleBtn").parent().children().children().children().children().children(".area__right").addClass("w100p");

    $(".area__left.active .btn-left").on("click", function () {
      $(".area__left").removeClass("active");
      $(this).hide();

      var mql = window.matchMedia("screen and (min-width: 768px)");
      if (mql.matches) {
        $(".area__left.close .btn-left, .area__left .btn-left").css({ display: "flex" });
      } else {
        $(".area__left.close .btn-left, .area__left .btn-left").css({ display: "" });
      }
    });
    setRecoilTreeOpen(true);
  }

  return (
    <>
      {/*<!-- main, 컨테이너영역 -->*/}
      {/*<!-- 220808, 사업장 관리 admin-site 에서 레이아웃이 가로 3개로 구분될때, layout-w3 클래스 추가됨-->*/}
      <main className={`container admin-site workorder`} style={{ "cursor": "default" }}>
        {/*<!-- .content, 컨텐츠영역:개별박스영역(.box)으로 구성 -->*/}
        <section className="content">
          {/*<!--그리드 영역 -->*/}
          <article className={`box list ${(isLoadingBox) ? "loading__box" : ""} `}>
            {/*<!--220531, 데이터 없는 경우 box__body 클래스에 nodata 추가 -->*/}
            <div className={`box__body ${(nodata <= 0) ? "nodata" : ""}`}>
              {/*<!--슬라이드 탭 영역-->*/}
              <section className="swiper-section">
                <div className="swiper-container mySwiper " style={{ "cursor": "pointer" }}>
                  <div className="swiper-wrapper">
                    {/*<!--선택된 탭에 on 클래스 자동 생성, 첫번째 탭에는 on 넣기(기본 선택 탭)-->*/}
                    {(tabMenuList) && tabMenuList.map((tabMenu, idx) => (
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
              {/*(curTabMenu.tabType === "TAB_EHC") &&*/
                (curTabMenu.tabUrl === CONST.URL_EHCWORKORDER) &&
                <div className="tabcontent current">
                  <EhealthCheckMain
                    setNodata={setNodata}
                    setPopWin={props.setPopWin} //pop
                    nodata={nodata}
                  />
                </div>
              }
              {/*(curTabMenu.tabType === "TAB_INSPECTION") &&*/
                (curTabMenu.tabUrl === CONST.URL_REQUESTWORKORDER) &&
                <div className="tabcontent current">
                  <WorkInspectionMain
                    setPopWin={props.setPopWin}
                    setNodata={setNodata}
                    nodata={nodata}
                  //pop
                  />
                </div>
              }
              {/*(curTabMenu.tabType === "TAB_HISTORY") &&*/
                (curTabMenu.tabUrl === CONST.URL_HISTORYWORKORDER) &&
                <div className="tabcontent current">
                  <WorkHistoryList
                    setPopWin={props.setPopWin}
                    setNodata={setNodata}
                    nodata={nodata}
                  //pop
                  />
                </div>
              }
              {/*(curTabMenu.tabType === "TAB_CHANGE") &&*/
                (curTabMenu.tabUrl === CONST.URL_DEVICECHANGEWORKORDER) &&
                <div className="tabcontent current">
                  <ChangeMain
                    setPopWin={props.setPopWin} //pop
                    setNodata={setNodata}
                    nodata={nodata}
                  />
                </div>
              }
            </div>
          </article>
        </section>
        {((curTabMenu.tabUrl === CONST.URL_EHCWORKORDER) || (curTabMenu.tabUrl === CONST.URL_DEVICECHANGEWORKORDER)) &&
          <a href="#" className="area__left__toggleBtn"
            onClick={(e) => onClickMoblieTreeMenu(e)}
          >
            <span className="hide">트리메뉴보기</span>
          </a>
        }
      </main>

    </>
  )
}

export default ServiceRequestSubMain;