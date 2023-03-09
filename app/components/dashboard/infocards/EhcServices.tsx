/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-01
 * @brief EHP DashBoard - 진단 점검 서비스 컴포넌트
 *
 ********************************************************************/
import React, { useState, useEffect, useRef } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
import { loadingBoxState, urlState, menuListState } from "../../../recoil/menuState";

// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as CUTIL from "../../../utils/commUtils"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"

 /**
 * @brief EHP DashBoard - 진단 점검 서비스 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

//component

function EhcServices(props) {
  //trans, ref, navigate
  const navigate = useNavigate();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [urlInfo, setRecoilUrlInfo] = useRecoilState(urlState);
  const [menuRecoilList, setRecoilMenuList] = useRecoilState(menuListState);
  const [isLoadingBox, setRecoilIsLoadinBox] = useRecoilState(loadingBoxState);
  //props
  const selTree = props.selTree;
  const colCount = props.colCount;

  function onClickGoLink(isExternalUrl, url) {
    const goUrlList = menuRecoilList.filter((ml)=>ml.isExternalUrl===isExternalUrl).map(ml=>ml);
    //clog("IN ON CLICK LINK : ALL : " + JSON.stringify(goUrlList));
    var goUrl = null;
    if ( isExternalUrl ) {
      if ( goUrlList.length === 1) {
        goUrlList.map(ml=>{goUrl = ml});
      } 
      // 외부 URL이 2개 이상일 경우 처리 방안 필요
    } else {
      goUrlList.filter((ml)=>ml.url===url).map(ml=>{goUrl = ml});
    }
    //clog("ON CLICK : GO URL :" + JSON.stringify(goUrl));
    
    if (goUrl){
      if (goUrl.isExternalUrl) {
        window.open(goUrl.url, "_blank", "noreferrer");
        return;
      } else {
        setRecoilUrlInfo(goUrl.url);
        navigate(goUrl.url);
      }
    }
  }

  clog("IN INFOCARD : COL COUNT : " + colCount);

  return (  
  <>
    <div className="box__header">
      <p className="box__title">진단 점검 서비스</p>
    </div>
    <div className="box__body">
      <div className="e-checkbox">
        <div className="top">
          <div className="buttonbox">
            <a href="#">
              <p>
                <span className="tit">e-Health Check</span>
                <span>체계적인 3단계 Health Check(진단점검)로 전력 설비 건강 상태 확인</span>
              </p>
              <button type="button" onClick={(e)=>onClickGoLink(false, CONST.URL_MAIN_DASHBOARD)}>
                <span>시작하기</span>
              </button>
            </a>
          </div>
        </div>
        <ul className="bottom">
          <li>
            <div className="buttonbox">
              <a onClick={(e)=>onClickGoLink(false, CONST.URL_ADMIN)}>
                <div>
                  <img src={require("/static/img/icon_machine.png")} className="img-default mt-5" style={{"width": "28px", "height": "28px"}} alt="" />
                  <img src={require("/static/img/icon_machine_on.png")} className="img-active mt-5" style={{"width": "28px", "height": "28px"}} alt="" />
                  <img src={require("/static/img/icon_gos.png")} className="img-default icon-go" style={{"width": "24px", "height": "24px"}} alt="바로가기" />
                  <img src={require("/static/img/icon_gos_on.png")} className="img-active icon-go" style={{"width": "24px",  "height": "24px"}} alt="바로가기" />
                </div>
                <p>
                  <span className="tit">운영관리</span>
                  <span>기존/신규 설비 추가</span>
                </p>
              </a>
            </div>
            <div className="buttonbox">
              <a onClick={(e)=>onClickGoLink(false, CONST.URL_CHECKHISTORY)}>
                <div>
                  <img src={require("/static/img/icon_graph.png")} className="img-default mt-5" style={{"width": "28px", "height":"28px"}} alt="" />
                  <img src={require("/static/img/icon_graph_on.png")} className="img-active mt-5" style={{"width": "28px", "height":"28px"}} alt="" />
                  <img src={require("/static/img/icon_gos.png")} className="img-default icon-go" style={{"width": "24px", "height":"24px"}} alt="바로가기" />
                  <img src={require("/static/img/icon_gos_on.png")} className="img-active icon-go" style={{"width": "24px", "height":"24px"}} alt="바로가기" />
                </div>
                <p>
                  <span className="tit">진단점검 Report</span>
                  <span>조회</span>
                </p>
              </a>
            </div>
            <div className="buttonbox">
              <a onClick={(e)=>onClickGoLink(false, (colCount===2)?CONST.URL_DEVICESLIFE:CONST.URL_DEVICESLIFEREPORT)}>
                <div>
                  <img src={require("/static/img/icon_note.png")} className="img-default mt-5" style={{"width":"28px","height":"28px"}} alt="" />
                  <img src={require("/static/img/icon_note_on.png")} className="img-active mt-5" style={{"width":"28px","height":"28px"}} alt="" />
                  <img src={require("/static/img/icon_gos.png")} className="img-default icon-go" style={{"width":"24px","height":"24px"}} alt="바로가기" />
                  <img src={require("/static/img/icon_gos_on.png")} className="img-active icon-go" style={{"width":"24px","height":"24px"}} alt="바로가기" />
                </div>
                <p>
                  <span className="tit">설비수명 인자 설정</span>
                  <span>ALO 플랫폼 연계</span>
                </p>
              </a>
            </div>
          </li>
          <li>
            <div className="buttonbox">
              <a onClick={(e)=>onClickGoLink(false, CONST.URL_SERVICEWORKORDER)}>
                <div>
                  <img src={require("/static/img/icon_order.png")} className="img-default mt-5" style={{"width":"28px","height":"28px"}} alt="" />
                  <img src={require("/static/img/icon_order_on.png")} className="img-active mt-5" style={{"width":"28px","height": "28px"}} alt="" />
                  <img src={require("/static/img/icon_gos.png")} className="img-default icon-go" style={{"width":"24px","height": "24px"}} alt="바로가기" />
                  <img src={require("/static/img/icon_gos_on.png")} className="img-active icon-go" style={{"width":"24px","height": "24px"}} alt="바로가기" />
                </div>
                <p>
                  <span className="tit">Work Order</span>
                  <span>조회</span>
                </p>
              </a>
            </div>
            <div className="buttonbox">
              <a onClick={(e)=>onClickGoLink(true, "")}>
                <div>
                  <img src={require("/static/img/icon_checkm.png")} className="img-default mt-5" style={{"width": "28px","height": "28px"}} alt="" />
                  <img src={require("/static/img/icon_checkm_on.png")} className="img-active mt-5" style={{"width": "28px","height": "28px"}} alt="" />
                  <img src={require("/static/img/icon_gos.png")} className="img-default icon-go" style={{"width": "24px","height": "24px"}} alt="바로가기" />
                  <img src={require("/static/img/icon_gos_on.png")} className="img-active icon-go" style={{"width": "24px","height": "24px"}} alt="바로가기" />
                </div>
                <p>
                  <span className="tit">점검출동 요청</span>
                  <span>전력설비 점검 및 시험</span>
                </p>
              </a>
            </div>
            <div className="buttonbox">
              <a onClick={(e)=>onClickGoLink(false, CONST.URL_EHC_INTRO)}>
                <div>
                  <img src={require("/static/img/icon_book.png")} className="img-default mt-5" style={{"width": "30px","height": "28px"}} alt="" />
                  <img src={require("/static/img/icon_book_on.png")} className="img-active mt-5" style={{"width": "30px","height": "28px"}} alt="" />
                  <img src={require("/static/img/icon_gos.png")} className="img-default icon-go" style={{"width": "24px","height": "24px"}} alt="바로가기" />
                  <img src={require("/static/img/icon_gos_on.png")} className="img-active icon-go" style={{"width": "24px","height": "24px"}} alt="바로가기" />
                </div>
                <p>
                  <span className="tit">서비스 소개</span>
                  <span>e-Health Potal 안내</span>
                </p>
              </a>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </>
  )
}

export default EhcServices;