/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-05-25
 * @brief EHP Status 컴포넌트
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
import * as CONST from "../../../utils/Const";
//
import $ from "jquery";
import { cp } from "fs/promises";
//
import { useTrans } from "../../../utils/langs/useTrans";
//import { isTemplateExpression } from "typescript";

/**
 * @brief EHP Status 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */
function ListDetail(props) {
  //const userInfo = useRecoilValue(userInfoState);
  const userInfo = useRecoilValue(userInfoLoginState);
  //
  const item = props.itemDetail;

  return (
    <>
      {/*<!-- 데이터 디테일 팝업 -->*/}
      <div id="data-detail" className="popup-layer js-layer layer-out hidden page-detail">
        <div className="popup__head">
          <h1>상세정보</h1>
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        <div className="popup__body">
          <ul className="datadetail-info">
            <li>
              <p>시리얼 번호</p>
              <p>{item.serialNo}</p>
            </li>
            <li>
              <p>담당자</p>
              <p>{item.responsible}</p>
            </li>
            <li>
              <p>위치</p>
              <p>{item.ehcPos}</p>
            </li>
            <li>
              <p>최근점검일</p>
              <p>{CUTIL.utc2time("YYYY-MM-DD", item.assessment.updatedTime)}</p>
              <p className="hide">Step</p>
              <ul className={(item.checkStep.name === "ADVANCED")
                ? "icon-step all"
                : (item.checkStep.name === "PREMIUM")
                  ? "icon-step two"
                  : (item.checkStep.name === "BASIC")
                    ? "icon-step one"
                    : "icon-step"
              }>
                <li><span className="hide">1단계</span></li>
                <li><span className="hide">2단계</span></li>
                <li><span className="hide">3단계</span></li>
              </ul>
            </li>
            <li className="btnarea">
              <div>
                {/*<button type="button" className="btn btn-file"><span className="hide">파일다운로드</span></button>*/}
                {(item.assessment.reportId != null)
                  ? <button type="button"
                    className="btn btn-file"
                    onClick={(e) => { HttpUtil.fileDownload_WithPdfViewer(item.itemName, item.assessment.reportId, userInfo.loginInfo.token) }}>
                    <span className="hide">파일다운로드</span>
                  </button>
                  : <button type="button" className="btn btn-file" disabled>
                    <span className="hide">파일다운로드</span>
                  </button>
                }
                <p>Report</p>
              </div>
              <div>
                {/*<button type="button" className="btn btn-memo"><span className="hide">메모</span></button>*/}
                {(item.assessment.totalComment == null)
                  ? <button type="button" className="btn btn-memo" disabled><span className="hide">메모</span></button>
                  : <button type="button" className="btn btn-memo"><span className="hide">메모</span></button>
                }
                <p>메모</p>
              </div>
              <div>
                <button type="button" className="btn btn-file" disabled><span className="hide">파일다운로드</span></button>
                <p>성적서</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      {/*<!-- //데이터 디테일 팝업 -->*/}

    </>
  )
}



export default ListDetail;