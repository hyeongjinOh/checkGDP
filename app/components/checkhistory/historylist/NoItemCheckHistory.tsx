/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author HyeongJin O
 * @contact hjoh@detech.co.kr
 * @date 2022-11-11
 * @brief EHP 진단점검 Report - 진단점검 Report 결과 초기 개발
 *
 ********************************************************************/
import React, { useEffect, useState, useRef } from "react";
//
import { useAsync } from "react-async";
// recoli & state
import { useRecoilValue } from "recoil";
import { userInfoState, userInfoLoginState, authState, } from '../../../recoil/userState';
//utils
import clog from "../../../utils/logUtils";
import * as HttpUtil from "../../../utils/api/HttpUtil";
import * as CUTIL from "../../../utils/commUtils";
//
import $ from "jquery";
import { cp } from "fs/promises";
//
import { useTrans } from "../../../utils/langs/useTrans";


/**
 * @brief EHP 진단점검 Report 결과 초기화면 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function NoItemCheckHistory(props) {

  const isOpen = (props.hasOwnProperty("isOpen")) ? props.isOpen : false;
  const setParentResultOpen = props.setResultOpen;

  function handleResultOpen(e, openVal) {
    clog("IN ITEMCHECKRESULT : handleResultOpen : " + openVal);
    setParentResultOpen(!openVal);
  }


  return (
    <>
      {/*<!--평가기준 : ehc__score / e-HC Status 선택에 따른 클래스 변경,컬러변경됨(ehc-b/ehc-p/ehc-a/ehc-n)-->*/}
      <article className={`box ehc__score  ehc-b ${(isOpen) ? "" : "close"}`}>
        <div className="box__header"  >
          <p className="box__title">
            {/*<button type="button" className="btn btn-box " onClick={(e) => resultOpen(e)}><span className="hide">메뉴접기펼치기</span></button>*/}
            <button type="button" className="btn btn-box " onClick={(e) => handleResultOpen(e, isOpen)}>
              <span className="hide">메뉴접기펼치기</span>
            </button>
            {/*<!--220622, 여기 이렇게 전체적으로 수정요청-->*/}
            <span className="cate">Basic <span>e-HC</span></span>
          </p>
          {/* <div className="box__etc"><span className="date">{CUTIL.utc2time("YYYY-MM-DD", updatedTime)}</span></div> */}
        </div>
        <div className="box__body">
          <p className="txt-ready">
            <span><strong>진단점검 리포트</strong> 에서 점검결과 보기 버튼를 먼저 선택해주세요.</span>
          </p>

        </div>
      </article>

    </>
  )
}



export default NoItemCheckHistory;