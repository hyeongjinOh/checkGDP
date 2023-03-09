/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-05-25
 * @brief EHP Main 컴포넌트
 *
 ********************************************************************/
import React, { useEffect, useState, useRef, DependencyList } from "react";
//
import { useAsync } from "react-async";
// recoil && state
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { userInfoState, authState } from '../../recoil/userState';
import {
  curSpgTreeState,
  nextSpgTreeState,
  beforeSpgTreeState,
  curEhcTypeState,
  nextEhcTypeState,
  beforeEhcTypeState,
  itemState,
  itemSelectState,
  beforeItemState,
  nextItemState,
  tempCheckValue,
  getTempSave,
  curCheckValueDto,
  doneAssessmentState,
  checkStep,
  getStepDone,

} from '../../recoil/assessmentState';
import { treeMenuState } from '../../recoil/menuState';
//
import { useTrans } from "../../utils/langs/useTrans";
//
import $ from "jquery"
//
import * as CUTIL from "../../utils/commUtils";
import clog from "../../utils/logUtils"
//component 
import TreeMenu from "./treemenu/TreeMenu";
import Status from "./status/Status";
import WorkOrder from "./workorder/WorkOrder";
import BasicList from "./itemlist/BasicList";
import AdvancedList from "./itemlist/AdvancedList";
import PremiumList from "./itemlist/PremiumList";
import NormalList from "./itemlist/NormalList";
import EhcCheck from "./checklist/EhcCheck";
import EhcCheckNoItem from "./checklist/EhcCheckNoItem";
/**
 * @brief EHP Main 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */


function Main(props) {
  //navi, ref
  const t = useTrans();
  //recoil
  const [treeOpen, setRecoilTreeOpen] = useRecoilState(treeMenuState);
  const userInfo = useRecoilValue(userInfoState);
  const curTreeData = useRecoilValue(curSpgTreeState);
  const setRecoilCurSpgTree = useSetRecoilState(curSpgTreeState);
  const nextSpgTree = useRecoilValue(nextSpgTreeState);
  const setRecoilNextSpgTree = useSetRecoilState(nextSpgTreeState);
  const beforeSpgTree = useRecoilValue(beforeSpgTreeState);
  const setRecoilBeforeSpgTree = useSetRecoilState(beforeSpgTreeState);
  //
  const ehcType = useRecoilValue(curEhcTypeState);
  const setRecoilCurEhcType = useSetRecoilState(curEhcTypeState);
  const nextEhcType = useRecoilValue(nextEhcTypeState);
  const setRecoilNextEhcType = useSetRecoilState(nextEhcTypeState);
  const beforeEhcType = useRecoilValue(beforeEhcTypeState);
  const setRecoilBeforeEhcType = useSetRecoilState(beforeEhcTypeState);
  //
  const curItem = useRecoilValue(itemState);
  const setRecoilCurItem = useSetRecoilState(itemState); // recoil userState
  const resetRecoilCurItem = useResetRecoilState(itemState); // recoil userState
  const beforeItem = useRecoilValue(beforeItemState); // recoil userState
  const resetRecoilBeforeItem = useResetRecoilState(beforeItemState); // recoil userState
  const nextItem = useRecoilValue(nextItemState); // recoil userState
  const resetRecoilNextItem = useResetRecoilState(nextItemState); // recoil userState
  const resetRecoilTsItemCheckListInfo = useResetRecoilState(doneAssessmentState);
  const tempCheckVal = useRecoilValue(tempCheckValue);
  const resetRecoilTempCheckVal = useResetRecoilState(tempCheckValue);
  const setRecoilCurCheckStep = useSetRecoilState(checkStep);
  const resetRecoilCurCheckStep = useResetRecoilState(checkStep);
  const isTempSave = useRecoilValue(getTempSave);
  const stepDone = useRecoilValue(getStepDone);
  //
  const isItemSelected = useRecoilValue(itemSelectState);
  //
  const setParentItemDetail = props.setItemDetail;
  // 
  let isSpgSelect: boolean = (curTreeData.hasOwnProperty("spg")) ? (curTreeData.spg.hasOwnProperty("spgId")) ? (curTreeData.spg.spgId < 0) ? false : true : false : false;

  //
  const selectedSpg = curTreeData;

  useEffect(() => {
    // item reset->itemSelectState 변경
    clog("IN MAIN : INIT : curEhcType : " + ehcType + " : " + JSON.stringify(curTreeData) + "event chought .......");
    resetRecoilCurCheckStep();
    resetRecoilCurItem();
  }, [curTreeData, ehcType]);


  //모바일 트리토글 버튼 액션
  function treeToggleOnClick(e) {
    e.preventDefault();
    //모바일 트리토글 버튼 액션 트리메뉴 open 
    $(".treebar__toggleBtn").parent(".container").children(".treebar").addClass("active");
    $(".treebar__toggleBtn").parent(".container").children(".content").addClass("w100p");

    //모바일 트리토글 버튼 액션 트리메뉴 shut
    $(".treebar.active .btn-tree").on("click", function () {
      $(".treebar").removeClass("active");
      $(".treebar.active .btn-tree").hide();
      //트리메뉴 토글 사이즈 최소범위       
      var mql = window.matchMedia("screen and (min-width: 768px)");
      if (mql.matches) {
        $(".box.treebar.close .btn-tree, .box.treebar .btn-tree").css({ display: "flex" });
      } else {
        $(".box.treebar.close .btn-tree, .box.treebar .btn-tree").css({ display: "" });
      }
    });
    setRecoilTreeOpen(true);
  };
  // 팝업창 select 콤보박스 리스트 활성화
  document.addEventListener("click", function (e) {
    //e.preventDefault();
    const targetElement = e.target as unknown as HTMLElement;
    const isSelect = targetElement.classList.contains("select") || targetElement.closest(".select");
    if (isSelect) {
      return;
    }
    const allSelectBoxElements = document.querySelectorAll(".select");
    allSelectBoxElements.forEach((boxElement) => {
      boxElement.classList.remove("active");
    });
  });

  function handleTreeData(selSpgTree) {
    const tsValue = (tempCheckVal.checkVal.value.length > 0) ? parseInt(tempCheckVal.checkVal.value) : -1;
    clog("IN MAIN : handleTreeData : " + tsValue);

    setRecoilNextSpgTree(selSpgTree);
    if (tsValue < 0) {
      setRecoilCurSpgTree(selSpgTree);
      setRecoilBeforeSpgTree(curTreeData);
    }
    //handleInitCheckItem();
    //setCurTreeData(val);
  }

  function handleEhcType(selEhcType) {
    const tsValue = (tempCheckVal.checkVal.value.length > 0) ? parseInt(tempCheckVal.checkVal.value) : -1;
    clog("IN MAIN : handleEhcType : " + tsValue);

    // default : BASIC
    setRecoilNextEhcType(selEhcType);
    if (tsValue < 0) {
      // 임시저장 상태가 아니므로, 다음 status로 이동
      //handleInitCheckItem();
      // EhcType 처리
      setRecoilCurEhcType(selEhcType);
      setRecoilBeforeEhcType(ehcType);
      // item초기화 등
      // Satus에서 함.
    }
  }

  const [statusReload, setStatusReload] = useState(false);


  return (
    <>
      {/* main, 컨테이너영역 */}
      <main className="container"  style={{"cursor":"default"}}>
        {<TreeMenu
          setCurTreeData={handleTreeData}
        />}
        {/* .content, 컨텐츠영역:개별박스영역(.box)으로 구성 */}
        <section className="content">
          {(isSpgSelect) && <Status
            curEhcType={ehcType}
            curTreeData={selectedSpg}
            setEhcType={handleEhcType}
            statusReload={statusReload}
            setStatusReload={setStatusReload} // status reload
          />}

          {(isSpgSelect) && <WorkOrder
            curEhcType={ehcType}
            curTreeData={selectedSpg}
            statusReload={statusReload}
          />}
          {((isSpgSelect && isItemSelected) || (isTempSave))
            ? <EhcCheck
              curEhcType={ehcType}
              //setEhcType={handleEhcType}
              curTreeData={selectedSpg}
              curItem={curItem}
              setStatusReload={setStatusReload}  // status reload
            />
            : <EhcCheckNoItem
              curEhcType={ehcType}
              curTreeData={selectedSpg}
              curItem={curItem}
            />
          }
          {((isSpgSelect) && (ehcType === "BASIC")) && <BasicList
            curEhcType={ehcType}
            curTreeData={selectedSpg}
            setItemDetail={props.setItemDetail}
            setReportInfo={props.setReportInfo}
            reportLoading={props.reportLoading}
            setReportLoading={props.setReportLoading}
            statusReload={statusReload}
            setPopWin={props.setPopWin}
          />}
          {(isSpgSelect) && (ehcType === "ADVANCED") && <AdvancedList
            curEhcType={ehcType}
            curTreeData={selectedSpg}
            setItemDetail={props.setItemDetail}
            setReportInfo={props.setReportInfo}
            reportLoading={props.reportLoading}
            setReportLoading={props.setReportLoading}
            statusReload={statusReload}
            setStatusReload={setStatusReload}
            setPopWin={props.setPopWin}
          />}
          {(isSpgSelect) && (ehcType === "PREMIUM") && <PremiumList
            curEhcType={ehcType}
            curTreeData={selectedSpg}
            setItemDetail={props.setItemDetail}
            setReportInfo={props.setReportInfo}
            reportLoading={props.reportLoading}
            setReportLoading={props.setReportLoading}
            statusReload={statusReload}
            setStatusReload={setStatusReload}
            setPopWin={props.setPopWin}
          />}
          {(isSpgSelect) && (ehcType === "NORMAL") && <NormalList
            curTreeData={selectedSpg}
            curEhcType={ehcType}
            setItemDetail={props.setItemDetail}
            setReportInfo={props.setReportInfo}
            reportLoading={props.reportLoading}
            setReportLoading={props.setReportLoading}
            statusReload={statusReload}
            setStatusReload={setStatusReload} // status reload
            setPopWin={props.setPopWin}
          />}
        </section>
        {/* //.content, 컨텐츠영역:개별박스영역으로 구성 */}

        {/*220510, 트리플로팅버튼 추가*/}
        <a href="#" className="treebar__toggleBtn" onClick={(e) => treeToggleOnClick(e)} >
          <span className="hide">트리메뉴보기</span>
        </a>
      </main>
      {/* //main, 컨테이너영역 */}
    </>
  );

}

export default Main;


export function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps?: DependencyList,
) {
  useEffect(() => {
    const t = setTimeout(() => {
      fn.apply(undefined, deps)
    }, waitTime)

    return () => {
      clearTimeout(t)
    }
  }, deps)
}