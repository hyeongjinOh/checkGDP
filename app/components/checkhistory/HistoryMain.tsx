/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author HyeongJin O
 * @contact hjoh@detech.co.kr
 * @date 2022-07-11
 * @brief EHP 진단점검 Report  개발
 *
 ********************************************************************/
import React, { useEffect, useState } from "react";
//
import { useAsync } from "react-async";
// recoil && state
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { userInfoState, authState } from '../../recoil/userState';
import {
  itemState,
  itemSelectState,
  beforeItemState,
  nextItemState,
  tempCheckValue,
  curSpgTreeState
} from '../../recoil/assessmentState';
//
import { useTrans } from "../../utils/langs/useTrans";
//
import $ from "jquery"
//
import * as CUTIL from "../../utils/commUtils";
import clog from "../../utils/logUtils"
//component 
import TreeMenu from "../main/treemenu/TreeMenu"
import ItemCheckHistory from "./historylist/ItemCheckHistory";
import ItemCheckResult from "./historylist/ItemCheckResult";
import NoItemCheckHistory from "./historylist/NoItemCheckHistory";

/**
 * @brief EHP 진단점검 Report 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function HistoryMain(props) {
  const itemInfo = useRecoilValue(itemState);
  const curTreeData2 = useRecoilValue(curSpgTreeState);
  const resetRecoilItemInfo = useResetRecoilState(itemState); // recoil userState
  const resetRecoilBeforeItemInfo = useResetRecoilState(beforeItemState); // recoil userState
  const resetRecoilNextItemInfo = useResetRecoilState(nextItemState); // recoil userState
  const resetRecoilTempCheckVal = useResetRecoilState(tempCheckValue);
  //
  const setPopWin = props.setPopWin;
  //

  const isItemSelected = useRecoilValue(itemSelectState);
  //clog("IN HISTORYMAIN : CHECK ITEM SELECT : " + isItemSelected);
  //


  const setParentItemDetail = props.setItemDetail;
  //const userInfo = useRecoilValue(userInfoState);
  // 
  const [ehcType, setEhcType] = useState("BASIC");
  // checklist
  const [curItem, setCurItem] = useState(null);
  //tree component id값
  const [curTreeData, setCurTreeData] = useState({});
  // history props
  const [curHistoryData, setCurHistoryData] = useState(null);
  const [curHistoryInfo, setCurHistoryInfo] = useState(null);

  //
  const [isCommonPopup, setIsCommonPopup] = useState(false);
  //
  //
  //
  const t = useTrans();
  const selectedSpg = curTreeData2;
  //   clog("Spg")
  // clog(selectedSpg);
  //모바일 트리토글 버튼 액션
  function treeToggleOnClick(e) {
    e.preventDefault();
    //모바일 트리토글 버튼 액션 트리메뉴 open 
    $(".treebar__toggleBtn").parent(".container").children(".treebar").addClass("active");
    $(".treebar__toggleBtn").parent(".container").children(".content").addClass("w100p");
    clog("click");

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

  function checkTempSave(cItem, nItem) {
    var ret = false;
    if (!CUTIL.isnull(cItem)) {
      if (cItem != nItem) {
        ret = confirm("needed temp save");
        //ret = true;
      }

    }

    return ret;
  }

  function handleTreeData(val) {
    /*
    resetRecoilItemInfo();
    resetRecoilBeforeItemInfo();
    resetRecoilNextItemInfo();
    resetRecoilTempCheckVal();
    //checkTempSave(curItem, null);
    //setCurItem(null);
    setCurTreeData(val);
    */
  }

  function handleEhcType(val) {
    //checkTempSave(curItem, null);
    setCurItem(null);
    setEhcType(val);
  }

  function handlCurItem(val) {
    /*
    var ret = checkTempSave(curItem, val);
    if ( ret == true ) {
      alert("임시저장을 해야 합니다. ");
      //return true;
    }
    */
    //clog("IN MAIN : handlCurItem : " + JSON.stringify(val))
    setCurItem(val);
  }

  /* 공통팝업 핸들링 
  document.addEventListener("click", function() {
    $("header, navbar, .box").on("click", function () {
      $(".popup-basic, .popup-basic.popup-boxin").toggleClass("show");
      $(".popup-basic .btn-close").on("click", function () {
        $("header, navbar, .box").trigger("click");
      });
    });
  });
  */
  const [treeOpen, setTreeOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);

  function handleResultOpen(isResult) {
    clog("IN HISTORYMAIN : handleResultOpen : " + isResult);
    if (isResult) { // 결과창이 열리면
      setTreeOpen(false); // <- isClose
    }
    setResultOpen(isResult);
  }

  function handleTreeOpen(isTree) {
    clog("IN HISTORYMAIN : handleTreeOpen : " + isTree);
    if (isTree) { // 결과창이 열리면
      setResultOpen(false); // <- isClose
    }
    setTreeOpen(isTree);
  }

  function handleHistoryData(val) {
    clog("IN HISTORYMAIN : handleHistoryData : " + val);
    setCurHistoryData(val);
    // by sjpark 20220708
 /*    setResultOpen(true);
    setTreeOpen(false); */ // <- isClose   
  }
  function handleHistoryInfo(val) {
    setCurHistoryInfo(val);
  }

  let isSpgSelect: boolean = (curTreeData2.spg.spgId < 0) ? false : true;
  return (
    <>
      {/* main, 컨테이너영역 */}
      <main className="container filereports" style={{"cursor":"default"}}>
  {/*       {<TreeMenu
          setCurTreeData={handleTreeData}
          isOpen={treeOpen}
          setTreeOpen={handleTreeOpen}
        />} */}
        {/* .content, 컨텐츠영역:개별박스영역(.box)으로 구성 */}
        <section className="content">
          {/* (isSpgSelect) && */ 
          <ItemCheckHistory
            setCurHistoryData={handleHistoryData}
            setCurHistoryInfo={handleHistoryInfo}
            setResultOpen={setResultOpen}
            curTreeData={selectedSpg}
            setPopWin={setPopWin}
          />}
          {(curHistoryData) ?
            <ItemCheckResult
              assessmentId={curHistoryData}
              curHistoryInfo={curHistoryInfo}
              curTreeData={selectedSpg}
              //isClose={false}
              // by sjpark 20220708
              isOpen={resultOpen}
              setResultOpen={handleResultOpen}
            />
            :
            <NoItemCheckHistory
              isOpen={resultOpen}
              setResultOpen={handleResultOpen}
            />
          }
        </section>
        {/* //.content, 컨텐츠영역:개별박스영역으로 구성 */}

        {/*220510, 트리플로팅버튼 추가*/}
        {/*    <a href="#" className="treebar__toggleBtn" onClick={(e) => treeToggleOnClick(e)} >
          <span className="hide">트리메뉴보기</span>
        </a> */}
      </main>
      {/* //main, 컨테이너영역 */}
    </>
  );

}

export default HistoryMain;
