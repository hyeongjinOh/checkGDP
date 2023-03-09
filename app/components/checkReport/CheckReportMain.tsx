/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-07-13
 * @brief EHP 시험성적서 컴포넌트
 *
 ********************************************************************/
import React, { useEffect, useState } from "react";
//
import { useAsync } from "react-async";
// recoil && state
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { userInfoState, authState } from '../../recoil/userState';
import {
  curSpgTreeState,
  itemState,
  itemSelectState,
  beforeItemState,
  nextItemState,
  tempCheckValue,
} from '../../recoil/assessmentState';
//
import { useTrans } from "../../utils/langs/useTrans";
//
import $ from "jquery"
//
import * as CUTIL from "../../utils/commUtils";
import clog from "../../utils/logUtils"
import TreeMenu from "../main/treemenu/TreeMenu";
import ItemReportView from "./reportlist/ItemReportView";

/**
 * @brief EHP 시험성적서 컴포넌트, 반응형 동작
 * @param - 
 * @returns react components
 */

function CheckReportMain(props) {
  const curTreeData = useRecoilValue(curSpgTreeState);
  //
  const t = useTrans();
  const selectedSpg = curTreeData;
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
  /*
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
  */
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
  }

  const [treeOpen, setTreeOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);

  function handleTreeOpen(isTree) {
    clog("IN REPORTMAIN : handleTreeOpen : " + isTree);
    if (isTree) { // 결과창이 열리면
      setResultOpen(false); // <- isClose
    }
    setTreeOpen(isTree);
  }

  let isSpgSelect: boolean = (curTreeData.spg.spgId < 0) ? false : true;

  return (
    <>
      <main className="container filereports testrecord"  style={{"cursor":"default"}}>
        {/* <!-- //.treebar, 메뉴트리영역 --> */}
        {/*  {<TreeMenu
        setCurTreeData={handleTreeData}
        isOpen={treeOpen}
        setTreeOpen={handleTreeOpen}
      />} */}
        {/* <!-- .content, 컨텐츠영역:개별박스영역(.box)으로 구성 --> */}
        <section className="content">
          {/* <!--그리드 영역 --> */}
          {/* {(isSpgSelect)&& */}
          {<ItemReportView
            curTreeData={curTreeData}
          />}
        </section>
        {/* <!-- //.content, 컨텐츠영역:개별박스영역으로 구성 --> */}

        {/* <!--220510, 트리플로팅버튼 추가--> */}
        {/* <a href="#" className="treebar__toggleBtn" onClick={(e) => treeToggleOnClick(e)}>
          <span className="hide">트리메뉴보기</span>
        </a> */}
      </main>
    </>
  )
}

export default CheckReportMain;