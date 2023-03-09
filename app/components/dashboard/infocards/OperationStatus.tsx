/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-01
 * @brief EHP DashBoard - 운영 현황 컴포넌트
 *
 ********************************************************************/
import React, { useState, useEffect, useRef } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
import { loadingBoxState, urlState, czoneInfoState } from "../../../recoil/menuState";


// ex-utils
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as CUTIL from "../../../utils/commUtils"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"

 /**
 * @brief EHP DashBoard - 운영 현황 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

//component
function OperationStatus(props) {
  //trans, ref, navigate
  const navigate = useNavigate();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [urlInfo, setRecoilUrlInfo] = useRecoilState(urlState);
  const [isLoadingBox, setRecoilIsLoadinBox] = useRecoilState(loadingBoxState);
  const [czoneInfo, setRecoilCZoneInfo] = useRecoilState(czoneInfoState);  
  //props
  const selTree = props.selTree;

  const [opStatus, setOpStatus] = useState(
    {
      "subZoneCount":0,
      "roomCount":0,
      "userCount":0,
      "itemCount":0,
      "spg":{
        "acbCount":0,
        "vcbCount":0,
        "switchBoardCount":0,
        "moldTrCount":0,
        "oilTrCount":0,
        "gisCount":0
      }
    }

  );

  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/maindashboard/operate/count`,
    appQuery: {"zoneId" : selTree.zone.zoneId},
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: selTree,
  });

  useEffect(() => {
    setRecoilIsLoadinBox(true);
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
    if (ERR_URL.length > 0) navigate(ERR_URL);
    if (retData) {
      setRecoilIsLoadinBox(false);
      //clog("IN INFOCARS : OPERATION STATUS : RES : " + JSON.stringify(retData.body));
      if (retData.codeNum == CONST.API_200) {
        setOpStatus(retData.body);
        //clog("PIN LC INFO : " + czoneStr);
      }
    }
  }, [retData])

  function onClickGoLink(url) {
    setRecoilCZoneInfo(selTree);    
    setRecoilUrlInfo(url);
    navigate(url);
  }

  return (  
  <>
    <div className="box__header">
      <p className="box__title">운영 현황</p>
      <div className="box__etc">
        {/*<button type="button" className="btn btn-setting toggle"><span className="hide">설정</span></button>*/}
      </div>
    </div>
    <div className="box__body">
      <ul className="datalist">
        <li>
          <p className="tit"><img src={require("/static/img/icon_treesub2@3x.png")} style={{"width": "9px", "height": "14px"}} className="mr-8 ml-6" alt="" />상세사업장</p>
          <p><strong>{opStatus.subZoneCount}</strong> 개</p>
        </li>
        <li>
          <p className="tit"><img src={require("/static/img/icon_treesub3@3x.png")} style={{"width": "9px", "height": "14px"}} className="mr-8 ml-6" alt="" />전기실</p>
          <p><strong>{opStatus.roomCount}</strong> 개</p>
        </li>
        <li>
          <p className="tit"><img src={require("/static/img/icon_admin.png")} style={{"width": "20px", "height": "20px"}} className="mr-4" alt="" />User</p>
          <p><strong>{opStatus.userCount}</strong> 개</p>
        </li>
        <li>
          <p className="tit"><img src={require("/static/img/icon_treesub4.png")} style={{"width": "10px", "height": "12px"}} className="mr-8 ml-6" alt="" />등록된 설비</p>
          <p><strong>{opStatus.itemCount}</strong> ea</p>
        </li>
      </ul>
      <ul className="datalist-small">
        <li>
          <p className="tit">VCB</p>
          <p><strong>{opStatus.spg.vcbCount}</strong> ea</p>
        </li>
        <li>
          <p className="tit">ACB</p>
          <p><strong>{opStatus.spg.acbCount}</strong> ea</p>
        </li>
        <li>
          <p className="tit">Mold TR</p>
          <p><strong>{opStatus.spg.moldTrCount}</strong> ea</p>
        </li>
        <li>
          <p className="tit">유입식 TR</p>
          <p><strong>{opStatus.spg.oilTrCount}</strong> ea</p>
        </li>
        <li>
          <p className="tit">GIS</p>
          <p><strong>{opStatus.spg.gisCount}</strong> ea</p>
        </li>
        <li>
          <p className="tit">배전반</p>
          <p><strong>{opStatus.spg.switchBoardCount}</strong> ea</p>
        </li>
      </ul>
      <button type="button" className="add__item"
        onClick={(e)=>onClickGoLink(CONST.URL_ADMIN)}
      >
        <span>사업장/전기실/설비 추가 등록</span>
      </button>
    </div>
  </>
  )
}

export default OperationStatus;