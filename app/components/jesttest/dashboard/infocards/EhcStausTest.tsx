import React, { useState, useEffect, useRef } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";
import { loadingBoxState, urlState } from "../../../../recoil/menuState";

// utils
import clog from "../../../../utils/logUtils";
import * as CONST from "../../../../utils/Const"
import * as CUTIL from "../../../../utils/commUtils"
import * as HTTPUTIL from "../../../../utils/api/HttpUtil"
//component

function EhcStausTest(props) {
  //trans, ref, navigate
  const navigate = useNavigate();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [urlInfo, setRecoilUrlInfo] = useRecoilState(urlState);
  const [isLoadingBox, setRecoilIsLoadinBox] = useRecoilState(loadingBoxState);
  //props
  const selTree = props.selTree;
  //
  const spgList = [
    { "id": 0, "spgDisp": "전체", "spgVal": "" },
    { "id": 1, "spgDisp": "VCB", "spgVal": "VCB" },
    { "id": 2, "spgDisp": "ACB", "spgVal": "ACB" },
    { "id": 3, "spgDisp": "MoldTR", "spgVal": "MoldTR" },
    { "id": 4, "spgDisp": "유입식TR", "spgVal": "유입식TR" },
    { "id": 5, "spgDisp": "GIS", "spgVal": "GIS" },
    { "id": 6, "spgDisp": "배전반", "spgVal": "배전반" },
  ];
  const [spg, setSpg] = useState(spgList[0]);
  useEffect(()=>{
    setSpg(spgList[0]);
  }, [selTree])
  // option 선택 시  값 변경 액션
  function selectOptionSpg(optionElement) { // 확장 가능
    const selectBox = optionElement.closest(".select");
    const selectedElement = selectBox.querySelector(".selected-value ");
    selectedElement.textContent = optionElement.textContent;
    var optionData = optionElement.getAttribute("data-value");
    selectedElement.setAttribute("data-value", optionData);
    setSpg(JSON.parse(optionData));
  }


  const [ehpStatus, setEhpStatus] = useState(
    {
      "totalCount":0,
      "progressCount":0,
      "basicCount":0,
      "basicProgress" : 0,
      "premiumCount":0,
      "premiumProgress" : 0,
      "advancedCount":0,
      "advancedProgress":0,
      "normalCount":0,
      "normalProgress":0,
      "requestedCount":0,
      "acceptedCount":0,
      "ingCount":0
    }
  );
  function handleEhpStatus(val) {
    setEhpStatus({...val, 
      "basicProgress" : (val.totalCount===0)?0:Math.round(val.basicCount/val.totalCount*100),
      "premiumProgress" : (val.totalCount===0)?0:Math.round(val.premiumCount/val.totalCount*100),
      "advancedProgress":(val.totalCount===0)?0:Math.round(val.advancedCount/val.totalCount*100),
      "normalProgress":(val.totalCount===0)?0:Math.round(val.normalCount/val.totalCount*100),
    });
  }


  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/maindashboard/ehcstatus?zoneId=${selTree.zone.zoneId}&spgList=${spg.spgVal}`,
    appQuery: {
      /*"zoneId" : selTree.zone.zoneId,
      "spgList" : spg.spgVal*/
    },
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: selTree.zone.zoneId+spg.spgVal,
    //watch: selTree+spg,
  });

  useEffect(() => {
    setRecoilIsLoadinBox(true);
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
    if (ERR_URL.length > 0) navigate(ERR_URL);
    if (retData) {
      setRecoilIsLoadinBox(false);
      //clog("IN INFOCARS : EHP STATUS : RES : " + JSON.stringify(retData.body));
      if (retData.codeNum == CONST.API_200) {
        handleEhpStatus(retData.body);
        //clog("PIN LC INFO : " + czoneStr);
      }
    }
  }, [retData])

  function onClickGoLink(url) {
    setRecoilUrlInfo(url);
    navigate(url);
  }



  return (  
  <>
    <div className="box__header">
      <p className="box__title">e-HC Status</p>
      <div className="box__etc">
        <div className="select" onClick={(e)=>CUTIL.onClickSelect(e, selectOptionSpg)}>
          <div className="selected">
            <div className="selected-value">{spg.spgDisp}</div>
            <div className="arrow"></div>
          </div>
          <ul>
            {spgList.map((spg, idx)=>(
              <li key={`li_${idx.toString()}`} className="option" data-value={JSON.stringify(spg)}>{spg.spgDisp}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
    <div className="box__body">
      <div className="top">
        <div className="left mt-5">
          <p className="txt-info">진단점검이 필요한 설비가 존재합니다.</p>
        </div>
        <div className="right inline">
          <p className="total-num"><strong>{ehpStatus.progressCount}</strong><span> /{ehpStatus.totalCount}</span>ea</p>
          <button type="button" className="btn btn-go"
            onClick={(e)=>onClickGoLink(CONST.URL_MAIN_DASHBOARD)}
          >
            <span className="hide">바로가기</span>
          </button>
        </div>
      </div>
      <div className="progresscircle-wrap mt-40">
        <div className="progress-circle">
          <div className="percent">
            <svg>
              <circle cx="40" cy="40" r="35"></circle>
              {/*<!--"--percent: 값" 이 그래프 퍼센트임-->
              <circle cx="40" cy="40" r="35" style="--percent: 40; stroke: #5b71ef"></circle>*/}
              <circle cx="40" cy="40" r="35" style={{"stroke": "#5b71ef"}}
                strokeDasharray={`${2 * Math.PI * 35 * (ehpStatus.basicProgress/100)} ${2 * Math.PI * 35 * (1-ehpStatus.basicProgress/100)}`}
                strokeDashoffset={`${2 * Math.PI * 35 * 0.25}`}
              ></circle>
            </svg>
            <div className="number">
              <p>{ehpStatus.basicCount}</p>
            </div>
          </div>
          <div className="title">
            <h3>{/* <img src={require("/static/img/icon_b.png")} style={{"width": "16px", "height": "16px"}} alt="Basic" /> */}Basic</h3>
          </div>
        </div>
        <div className="progress-circle">
          <div className="percent">
            <svg>
              <circle cx="40" cy="40" r="35"></circle>
              {/*<!--"--percent: 값" 이 그래프 퍼센트임-->
              <circle cx="40" cy="40" r="35" style="--percent: 10; stroke: #13a79e"></circle>*/}
              <circle cx="40" cy="40" r="35" style={{"stroke": "#13a79e"}}
                strokeDasharray={`${2 * Math.PI * 35 * (ehpStatus.premiumProgress/100)} ${2 * Math.PI * 35 * (1-ehpStatus.premiumProgress/100)}`}
                strokeDashoffset={`${2 * Math.PI * 35 * 0.25}`}
              ></circle>
            </svg>
            <div className="number">
              <p>{ehpStatus.premiumCount}</p>
            </div>
          </div>
          <div className="title">
            <h3>{/* <img src={require("/static/img/icon_p.png")} style={{"width": "16px", "height": "16px"}} alt="Premium" /> */}Premium</h3>
          </div>
        </div>
        <div className="progress-circle">
          <div className="percent">
            <svg>
              <circle cx="40" cy="40" r="35"></circle>
              {/*<!--"--percent: 값" 이 그래프 퍼센트임-->
              <circle cx="40" cy="40" r="35" style="--percent: 20; stroke: #ff9900"></circle>*/}
              <circle cx="40" cy="40" r="35" style={{"stroke": "#ff9900"}}
                strokeDasharray={`${2 * Math.PI * 35 * (ehpStatus.advancedProgress/100)} ${2 * Math.PI * 35 * (1-ehpStatus.advancedProgress/100)}`}
                strokeDashoffset={`${2 * Math.PI * 35 * 0.25}`}
              ></circle>
            </svg>
            <div className="number">
              <p>{ehpStatus.advancedCount}</p>
            </div>
          </div>
          <div className="title">
            <h3>{/* <img src={require("/static/img/icon_a.png")} style={{"width": "16px", "height": "16px"}} alt="Advanced" /> */}Advanced</h3>
          </div>
        </div>
        <div className="progress-circle">
          <div className="percent">
            <svg>
              <circle cx="40" cy="40" r="35"></circle>
              {/*<!--"--percent: 값" 이 그래프 퍼센트임-->
              <circle cx="40" cy="40" r="35" style="--percent: 20; stroke: #1fc95c"></circle>*/}
              <circle cx="40" cy="40" r="35" style={{"stroke": "#1fc95c"}}
                strokeDasharray={`${2 * Math.PI * 35 * (ehpStatus.normalProgress/100)} ${2 * Math.PI * 35 * (1-ehpStatus.normalProgress/100)}`}
                strokeDashoffset={`${2 * Math.PI * 35 * 0.25}`}
              ></circle>
            </svg>
            <div className="number">
              <p>{ehpStatus.normalCount}</p>
            </div>
          </div>
          <div className="title">
            <h3>Normal</h3>
          </div>
        </div>
      </div>
      <div className="bottom line mt-50">
        <div className="top">
          <h2>Work Order</h2>
          <button type="button" className="btn btn-go"
            onClick={(e)=>onClickGoLink(CONST.URL_SERVICEWORKORDER)}
          >
            <span className="hide">바로가기</span>
          </button>
        </div>
        <ul className="step-order">
          <li>
            <p className="tit">요청</p>
            <p className="total-num"><strong>{ehpStatus.requestedCount}</strong><span> ea</span></p>
          </li>
          <li>
            <p className="tit">접수</p>
            <p className="total-num"><strong>{ehpStatus.acceptedCount}</strong><span> ea</span></p>
          </li>
          <li>
            <p className="tit">진행 중</p>
            <p className="total-num"><strong>{ehpStatus.ingCount}</strong><span> ea</span></p>
          </li>
        </ul>
      </div>
    </div>
  </>
  )
}

export default EhcStausTest;