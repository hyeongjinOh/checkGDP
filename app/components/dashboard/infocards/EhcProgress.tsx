/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-01
 * @brief EHP DashBoard - e-HC 진행률 컴포넌트
 *
 ********************************************************************/
import React, { useState, useEffect, useRef } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
import { loadingBoxState, urlState } from "../../../recoil/menuState";

// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as CUTIL from "../../../utils/commUtils"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"

 /**
 * @brief EHP DashBoard - e-HC 진행률 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

//component
function EhcProgress(props) {
  //trans, ref, navigate
  const navigate = useNavigate();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [urlInfo, setRecoilUrlInfo] = useRecoilState(urlState);
  const [isLoadingBox, setRecoilIsLoadinBox] = useRecoilState(loadingBoxState);
  //props
  const selTree = props.selTree;

  const [ehpProgress, setEhpProgress] = useState(
    {
      "totalCount":0,
      "totalProgressCount":0,
      "totalProgress" : 0,
      "acbCount":0,
      "acbProgressCount":0,
      "acbProgress" : 0,
      "vcbCount":0,
      "vcbProgressCount":0,
      "vcbProgress":0,
      "switchBoardCount":0,
      "switchBoardProgressCount":0,
      "switchBoardProgress":0,
      "moldTrCount":0,
      "moldTrProgressCount":0,
      "moldTrProgress":0,
      "oilTrCount":0,
      "oilTrProgressCount":0,
      "oilTrProgress":0,
      "gisCount":0,
      "gisProgressCount":0,
      "gisProgress":0
    }
  );
  function handleEhpProgress(val) {
    setEhpProgress({...val, 
      "totalProgress" : (val.totalCount===0)?0:Math.round(val.totalProgressCount/val.totalCount*100),
      "acbProgress" : (val.acbCount===0)?0:Math.round(val.acbProgressCount/val.acbCount*100),
      "vcbProgress":(val.vcbCount===0)?0:Math.round(val.vcbProgressCount/val.vcbCount*100),
      "switchBoardProgress":(val.switchBoardCount===0)?0:Math.round(val.switchBoardProgressCount/val.switchBoardCount*100),
      "moldTrProgress":(val.moldTrCount===0)?0:Math.round(val.moldTrProgressCount/val.moldTrCount*100),
      "oilTrProgress":(val.oilTrCount===0)?0:Math.round(val.oilTrProgressCount/val.oilTrCount*100),
      "gisProgress":(val.gisCount===0)?0:Math.round(val.gisProgressCount/val.gisCount*100),
    });
  }


  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/maindashboard/ehcprogress`,
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
      //clog("IN INFOCARS : EHP PROGRESS : RES : " + JSON.stringify(retData.body));
      if (retData.codeNum == CONST.API_200) {
        handleEhpProgress(retData.body);
        //clog("PIN LC INFO : " + czoneStr);
      }
    }
  }, [retData])


  return (  
  <>
    <div className="box__header">
      <p className="box__title">e-HC 진행률</p>
      <div className="box__etc">
        {/*<button type="button" className="btn btn-setting toggle"><span className="hide">설정</span></button>*/}
      </div>
    </div>
    <div className="box__body">
      <div className="top">
        <div className="left">
          <div className="progress-circle">
            <div className="percent">
              <svg>
                <circle
                  cx="60" cy="60" r="55"
                   />
                <circle 
                  cx="60" cy="60" r="55"
                  strokeDasharray={`${2 * Math.PI * 55 * (ehpProgress.totalProgress/100)} ${2 * Math.PI * 55 * (1-ehpProgress.totalProgress/100)}`}
                  strokeDashoffset={`${2 * Math.PI * 55 * 0.25}`}
                  >
                  </circle>
              </svg>
              <div className="number">
                <p>{ehpProgress.totalProgress}<br /><span>%</span></p>
              </div>
            </div>
          </div>
        </div>
        <div className="right">
          <p className="small-tit icon-dot">e-Health Checker 진행 설비</p>
          <p className="total-num mt-16">
            <strong className="largetxt">{ehpProgress.totalProgressCount}</strong>
            <span> /{ehpProgress.totalCount}</span>ea</p>
        </div>
      </div>
      <ul className="bottom progress-wrap mt-40">
        <li>
          <p className="tit">VCB</p>
          {/*<!-- 막대 그래프 -->*/}
          <div className="progress-bar">
            <div className="progress" style={{"width": `${ehpProgress.vcbProgress}%`}}>
              <p className="num-detail" style={{"left": `${(ehpProgress.vcbProgress<=15)?0:ehpProgress.vcbProgress-15}%`}}>
                {`${ehpProgress.vcbProgressCount}/${ehpProgress.vcbCount} ea`}
              </p>
            </div>
          </div>
          <p className="num"><strong>{ehpProgress.vcbProgress}</strong> %</p>
        </li>
        <li>
          <p className="tit">ACB</p>
          {/*<!-- 막대 그래프 -->*/}
          <div className="progress-bar">
            {/*<!--"width: 값" 이 그래프 퍼센트임-->*/}
            <div className="progress" style={{"width": `${ehpProgress.acbProgress}%`}}>
              <p className="num-detail" style={{"left": `${(ehpProgress.acbProgress<=15)?0:ehpProgress.acbProgress-15}%`}}>
                {`${ehpProgress.acbProgressCount}/${ehpProgress.acbCount} ea`}
              </p>
            </div>
          </div>
          {/** */}
          <p className="num"><strong>{ehpProgress.acbProgress}</strong> %</p>
        </li>
        <li>
          <p className="tit">Mold TR</p>
          {/*<!-- 막대 그래프 -->*/}
          <div className="progress-bar">
            <div className="progress" style={{"width": `${ehpProgress.moldTrProgress}%`}}>
              {/*<!--"left: 값" 이 말풍선 위치임(progress의 width값에서 15정도 빼서 위치 잡아줘야 함.....)-->*/}
              <p className="num-detail" style={{"left": `${(ehpProgress.moldTrProgress<=15)?0:ehpProgress.moldTrProgress-15}%`}}>
                {`${ehpProgress.moldTrProgressCount}/${ehpProgress.moldTrCount} ea`}
              </p>
            </div>
          </div>
          <p className="num"><strong>{ehpProgress.moldTrProgress}</strong> %</p>
        </li>
        <li>
          <p className="tit">유입식 TR</p>
          {/*<!-- 막대 그래프 -->*/}
          <div className="progress-bar">
            <div className="progress" style={{"width": `${ehpProgress.oilTrProgress}%`}}>
              <p className="num-detail" style={{"left": `${(ehpProgress.oilTrProgress<=15)?0:ehpProgress.oilTrProgress-15}%`}}>
                {`${ehpProgress.oilTrProgressCount}/${ehpProgress.oilTrCount} ea`}
              </p>
            </div>
          </div>
          <p className="num"><strong>{ehpProgress.oilTrProgress}</strong> %</p>
        </li>
        <li>
          <p className="tit">GIS</p>
          {/*<!-- 막대 그래프 -->*/}
          <div className="progress-bar">
            <div className="progress" style={{"width": `${ehpProgress.gisProgress}%`}}>
              <p className="num-detail" style={{"left": `${(ehpProgress.gisProgress<=15)?0:ehpProgress.gisProgress-15}%`}}>
                {`${ehpProgress.gisProgressCount}/${ehpProgress.gisCount} ea`}
              </p>
            </div>
          </div>
          <p className="num"><strong>{ehpProgress.gisProgress}</strong> %</p>
        </li>
        <li>
          <p className="tit">배전반</p>
          {/*<!-- 막대 그래프 -->*/}
          <div className="progress-bar">
            <div className="progress" style={{"width": `${ehpProgress.switchBoardProgress}%`}}>
              <p className="num-detail" style={{"left": `${(ehpProgress.switchBoardProgress<=15)?0:ehpProgress.switchBoardProgress-15}%`}}>
                {`${ehpProgress.switchBoardProgressCount}/${ehpProgress.switchBoardCount} ea`}
              </p>
            </div>
          </div>
          <p className="num"><strong>{ehpProgress.switchBoardProgress}</strong> %</p>
        </li>
      </ul>
    </div>
  </>
  )
}

export default EhcProgress;