/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author JiHoon Park
 * @contact jhpark@detech.co.kr
 * @date 2022-07-19
 * @brief EHP 회사/사업장/세부사업장 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
//recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { loadingBoxState, } from '../../recoil/menuState';
import { userInfoLoginState } from "../../recoil/userState";

// utils
import * as CONST from "../../utils/Const"
import clog from "../../utils/logUtils";
import * as CUTIL from "../../utils/commUtils"

//component
import AdminTree from "./AdminTree"
import NormalTree from "./NormalTree"
import AdminZone from "./zone/AdminZone"
import AdminSubZone from "./subZone/AdminSubZone"
import AdminRoom from "./room/AdminRoom"
import AdminDevice from "./device/AdminDevice"

/**
 * @brief EHP 운영 관리 컴포넌트 , 반응형 동작
 * @param -
 * @returns react components
 */

function AdminMain(props) {
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
  const [adminType, setAdminType] = useState("ZONE"); // ZONE, SUBZONE, ROOM, DEVICE
  // LIST, CREATE, UPDATE, DELETE, READ, BATCH
  const [workMode, setWorkMode] = useState("READ");

  const [nodata, setNodata] = useState<number>();


  // option 선택 시  값 변경 액션
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
  }
  function onClickTab(e) {
    var actTag = (e.target.tagName === "DIV") ? e.target : e.currentTarget;
    var tabStrInfo = actTag.getAttribute("data-value");
    var tabInfo = JSON.parse(tabStrInfo)
    //clog("TAB : " + JSON.stringify(tabInfo));
    //setAdminType(tabInfo.adminType);
    if (curTabMenu.tabType === "TAB_DEVICE") {
      setAdminType("ZONE");
      setWorkMode("READ");
      defaultCurTree();
    } else {
      defaultCurTree();
      setAdminType("ZONE");
      setWorkMode("READ");
    }
    setParentCurTabMenu(tabInfo);
  }
  const defaultCurTree = () => (setCurTree({
    company: { companyId: "", companyName: "" },
    zone: { zoneId: "", zoneName: "" },
    subZone: { subZoneId: "", subZoneName: "" },
    room: { roomId: "", roomName: "" },
    spg: { spgId: -1, spgName: "" },
    reload: false
  }));


  const [curTree, setCurTree] = useState({
    company: { companyId: "", companyName: "" },
    zone: { zoneId: "", zoneName: "" },
    subZone: { subZoneId: "", subZoneName: "" },
    room: { roomId: "", roomName: "" },
    spg: { spgId: -1, spgName: "" },
    reload: false
  });

  function handleCurTree(adminType, treeInfo) {
    //clog("IN SITETREE : handleCurTree : " + adminType);
    setAdminType(adminType);
    setCurTree(treeInfo);
  }


  clog("IN ADMINMAIN : INIT : " + curTabMenu.tabUrl + " : " + adminType + " : " + workMode + " : LOADING : " + isLoadingBox);

  return (
    <>
      {/*<!-- 220714 사업장 관리(레이아웃 변경되므로, 이하 주석부분 모두 확인 바람), 트리 삭제 -->*/}
      {/*<!-- main, 컨테이너영역 -->*/}
      {/*<!-- 사업장 관리 admin-site 클래스 추가--> */}
      <main className="container admin-site" style={{ "cursor": "default" }}>
        <section className="content">
          {/*<!--그리드 영역 -->*/}
          <article className={`box list ${(isLoadingBox) ? "loading__box" : ""}`}>
            {/*<!--220531, 데이터 없는 경우 box__body 클래스에 nodata 추가 -->*/}
            <div className={`box__body ${(nodata <= 0) ? "nodata" : ""}`}>
              {/*<!--슬라이드 탭 영역-->*/}
              <section className="swiper-section">
                <div className="swiper-container mySwiper" style={{ "cursor": "pointer" }}>
                  <div className="swiper-wrapper">
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
              <div id="tab-1" className="tabcontent current">
                {(userInfo.loginInfo.role === CONST.USERROLE_ADMIN)
                  ? <AdminTree
                    isMobile={isMobile}
                    tabType={curTabMenu.tabType}
                    curTree={curTree}
                    setCurTree={handleCurTree} // adminType 변경됨
                    adminType={adminType}
                    setAdminType={setAdminType}
                    workMode={workMode}
                    setWorkMode={setWorkMode}
                    setCurTabMenu={props.setCurTabMenu}
                    setPopWin={props.setPopWin} //9
                  />
                  : <NormalTree
                    isMobile={isMobile}
                    tabType={curTabMenu.tabType}
                    curTree={curTree}
                    setCurTree={handleCurTree} // adminType 변경됨
                    adminType={adminType}
                    setAdminType={setAdminType}
                    workMode={workMode}
                    setWorkMode={setWorkMode}
                    setCurTabMenu={props.setCurTabMenu}
                    setPopWin={props.setPopWin} //9
                  />
                }

                {(curTabMenu.tabType === "TAB_ZONE") && (adminType === "ZONE") && <AdminZone
                  isMobile={isMobile} //1
                  setIsMobile={setIsMobile} //2
                  curTree={curTree} //3
                  adminType={adminType} //4
                  setCurTree={handleCurTree} //5 // adminType도 같이 변함
                  setAdminType={setAdminType} //6 
                  workMode={workMode} //7
                  setWorkMode={setWorkMode} //8
                  setPopWin={props.setPopWin} //9
                />}
                {(curTabMenu.tabType === "TAB_ZONE") && (adminType === "SUBZONE") && <AdminSubZone
                  isMobile={isMobile} //1
                  setIsMobile={setIsMobile} //2
                  curTree={curTree} //3
                  adminType={adminType} //4
                  setCurTree={handleCurTree} //5 // adminType도 같이 변함
                  setAdminType={setAdminType} //6 
                  workMode={workMode} //7
                  setWorkMode={setWorkMode} //8
                  setCurTabMenu={props.setCurTabMenu} // tree, subzone, room에 기기등록 이동 존재
                  setPopWin={props.setPopWin} //9
                />}
                {(curTabMenu.tabType === "TAB_ZONE") && (adminType === "ROOM") && <AdminRoom
                  isMobile={isMobile} //1
                  setIsMobile={setIsMobile} //2
                  curTree={curTree} //3
                  adminType={adminType} //4
                  setCurTree={handleCurTree} //5 // adminType도 같이 변함
                  setAdminType={setAdminType} //6 
                  workMode={workMode} //7
                  setWorkMode={setWorkMode} //8
                  setCurTabMenu={props.setCurTabMenu} // tree, subzone, room에 기기등록 이동 존재
                  setPopWin={props.setPopWin} //9
                />}
                {(curTabMenu.tabType === "TAB_DEVICE") && <AdminDevice
                  isMobile={isMobile} //1
                  setIsMobile={setIsMobile} //2
                  curTree={curTree} //3
                  adminType={adminType} //4
                  setCurTree={handleCurTree} //5 // adminType도 같이 변함
                  setAdminType={setAdminType} //6 
                  workMode={workMode} //7
                  setWorkMode={setWorkMode} //8
                  setPopWin={props.setPopWin} //9
                  curTabMenu={curTabMenu.tabType}
                  setNodata={setNodata}
                />}

              </div>
            </div>
          </article>
        </section>
      </main>

    </>
  )
};
export default AdminMain;