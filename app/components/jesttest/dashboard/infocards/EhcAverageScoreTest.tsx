import React, { useState, useEffect, useRef } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";
import { loadingBoxState, urlState } from "../../../../recoil/menuState";

// ex-utils
import ECharts, { EChartsReactProps } from 'echarts-for-react';
// utils
import clog from "../../../../utils/logUtils";
import * as CONST from "../../../../utils/Const"
import * as CUTIL from "../../../../utils/commUtils"
import * as HTTPUTIL from "../../../../utils/api/HttpUtil"
import { SeriesModel } from "echarts";
import SpgCheckList from "../../../jesttest/management/checksheet/SpgCheckListTest";
//component

function EhcAverageScoreTest(props) {
  //trans, ref, navigate
  const navigate = useNavigate();
  const chartRef = useRef(null);
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [urlInfo, setRecoilUrlInfo] = useRecoilState(urlState);
  const [isLoadingBox, setRecoilIsLoadinBox] = useRecoilState(loadingBoxState);
  //props
  const selTree = props.selTree;
  const colCount = props.colCount;
  //
  const stepList = [
    { "id": 0, "stepDisp": "Basic", "stepVal": "BASIC" },
    { "id": 1, "stepDisp": "Premium", "stepVal": "PREMIUM" },
    { "id": 2, "stepDisp": "Advanced", "stepVal": "ADVANCED" },
  ];
  const [step, setStep] = useState(stepList[0]);
  useEffect(()=>{
    setStep(stepList[0]);
  }, [selTree])
  // option 선택 시  값 변경 액션
  function selectOptionStep(optionElement) { // 확장 가능
    const selectBox = optionElement.closest(".select"); 
    const selectedElement = selectBox.querySelector(".selected-value ");
    selectedElement.textContent = optionElement.textContent;
    var optionData = optionElement.getAttribute("data-value");
    selectedElement.setAttribute("data-value", optionData);
    setStep(JSON.parse(optionData));
  }
  const [ehcAverage, setEhcAverage] = useState({
    "totalAvgScore":0,
    "alarmStatus":"",
    "alarmMessage":"",
    "groupAvgScore":[
        /*{"checkGroupId":1,"checkGroupName":"사용연수","value":10.432693,"safeScore":17},
        {"checkGroupId":2,"checkGroupName":"운전이력","value":16.914482,"safeScore":17},
        {"checkGroupId":3,"checkGroupName":"설치환경","value":9.248998,"safeScore":17},
        {"checkGroupId":4,"checkGroupName":"부하조건","value":13.289713,"safeScore":17},
        {"checkGroupId":5,"checkGroupName":"유지보수","value":12.627465,"safeScore":17}*/
    ]
  });

  // ECahrt , data 반시계 반향으로 적용
  const chartDefaultVal = {
    color: [
      "rgba(144, 159, 183, 0.5)", // 배점
      "#FF6781", // 평가점수 Data
      "#5B71EF", // VCB 평균 점수 Data
        // "#FF917C"
    ],
    // 차트 하단 정보
    legend: {
      bottom: "bottom",
      icon: "circle",
      align: "auto",
    },
    // 점수 나오게하는 곳 
    tooltip: {
      position: ['50%', '50%'],
      backgroundColor: "#2A2C2F",
      textStyle: {
          color: "#FFFFFF",
          fontSize: 13
      },
      /*formatter: function (params) {
        return `${params.data.value} EA`
      },*/      
    },
    //grid: {"left":"3%", "right":"3%", "top":"10%", "bottom":"10%"},
    radar: //[
      {
        indicator: [
          { name: '부하조건', color: "black" },
          { name: '운전이력', color: "black" },
          { name: '설치환경', color: "black" },
          { name: '사용연수', color: "black" },
          { name: '유지보수', color: "black" },
        ],
        // 배경 간격
        splitNumber: 1,
        // 차트 max  
        radius: 100,
        // startAngle: 90,
        //radar 사이 box style
        splitArea: {
          areaStyle: {
            color: ["#FFF", "#FFF"],
          },
        },
        // 구분선 색상
        axisLine: {
          lineStyle: {
              // color: '#2A2C2F'
              color: "#C3CBD8",
          },
        },
        // 배경 라인 색상
        splitLine: {
          lineStyle: {
            color: "#C3CBD8",
          },
        },
        // 배경 font
        axisName: {
          fontWeight: 500,
          fontFamily: "Noto Sans KR",
          fontSize: 16
        }
      },
    //],
    series: //[
      {
        type: "radar",
        emphasis: {
          lineStyle: {
            width: 4,
          },
        },
        data: [
          {
            value: [20, 20, 20, 20, 20],
            name: "배점",
            symbol: "circle",
            symbolSize: 6,
          },
          {
            value: [0, 0, 0, 0, 0],
            name: "평균점수", // 평가점수
            symbol: "circle",
            symbolSize: 6, //내부 style
            areaStyle: {// 투명도
                opacity: 0.1
            },
          },
          {
              value: [0, 0, 0, 0, 0],
              name: "안전점수", // VCB 평균점수
              symbol: "circle",
              symbolSize: 6, //내부 style
              areaStyle: { // 투명도
                opacity: 0.1
              },
          },
        ],
      },
    //],
  }
  const [chartVal, setChartVal] = useState(chartDefaultVal);
  function handleChartVal(val) {
    clog("AVG : " + JSON.stringify(val));
    if (val.groupAvgScore.length <= 0) {
      setChartVal(chartDefaultVal);
      return;
    }
    let indicators = [];
    val.groupAvgScore.map((score)=>{
      indicators.push({ name: score.checkGroupName, color: "black" },);
    });

    const pointVals = {...chartVal.series.data[0], value : val.groupAvgScore.map((score)=>20)};
    const averageVals = {...chartVal.series.data[1], value : val.groupAvgScore.map((score)=>parseFloat(score.value))};
    const saftyVals = {...chartVal.series.data[2], value : val.groupAvgScore.map((score)=>parseFloat(score.safeScore))};

    setChartVal({ 
      ...chartVal, 
      radar:{...chartVal.radar, indicator:indicators},
      series: {...chartVal.series, data:[pointVals, averageVals, saftyVals]}
    });
    
  }
  
    

  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/maindashboard/ehcaverage?zoneId=${"selTree.zone.zoneId"}&stepName=${"step.stepVal"}`,
    appQuery: {
        /*"zoneId" : selTree.zone.zoneId,
        "spgList" : spg.spgVal*/
    },
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    // watch: selTree.zone.zoneId+step.stepVal,
  });
    
  useEffect(() => {
    setRecoilIsLoadinBox(true);
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
    if (ERR_URL.length > 0) navigate(ERR_URL);
    if (retData) {
      setRecoilIsLoadinBox(false);
      //clog("IN INFOCARS : EHC AVERAGE : RES : " + JSON.stringify(retData.body));
      if (retData.codeNum == CONST.API_200) {
        setEhcAverage(retData.body);
        handleChartVal(retData.body);
      }
    }
  }, [retData])

  const chartWidth = window.innerWidth / (8/colCount) * 0.781;

  return (
  <>
  <div className="box__header">
    <p className="box__title">e-HC 평균 점수</p>
    <div className="box__etc">
      <div className="select" onClick={(e)=>CUTIL.onClickSelect(e, selectOptionStep)}>
        <div className="selected">
            <div className="selected-value">{step.stepDisp}</div>
            <div className="arrow"></div>
        </div>
        <ul>
          {stepList.map((step, idx)=>(<li key={`li_${idx.toString()}`} className="option" data-value={JSON.stringify(step)}>{step.stepDisp}</li>))}
        </ul>
      </div>
    </div>
  </div>
  {(ehcAverage.groupAvgScore.length <= 0)
  ?<div className="box__body">
    <div className="top mt-20">
      <div className={`ehc__info ehc-${(step.stepVal==="ADVANCED")?"a":(step.stepVal==="PREMIUM")?"p":"b"}`}>
        <p className="ehc__name">{"selTree.zone.zoneName"}</p>
      </div>
    </div>
    <p className="txt-ready">
      <span><strong>{step.stepDisp}</strong> 진단점검을 진행하지 않았습니다.</span>
    </p>
  </div>
  :<div className="box__body">
    <div className="top mt-80">
      <div className={`ehc__info ehc-${(step.stepVal==="ADVANCED")?"a":(step.stepVal==="PREMIUM")?"p":"b"}`}>
        <p className="ehc__name">{"selTree.zone.zoneName"}</p>
      </div>
      <div className="ehc__detail">
        <div className="result__txt">
          <p className={`tit ${(ehcAverage.alarmStatus==="SAFETY")?"":(ehcAverage.alarmStatus==="WARNING_SCORE")?"caution":"caution"}`}><span>종합점수</span></p>
          <p className="score">{ehcAverage.totalAvgScore}</p>
          <p className="txt">{ehcAverage.alarmMessage}</p>
        </div>
      </div>
    </div>
    <div className="bottom">
      <div className="chart" style={{ "width": "100%", "margin": "0 auto" }} >
        <div id="radar" style={{ "height": "300px" }} >
          <ECharts option={chartVal} className="bottom ehc__chart h300" style={{"width":`${chartWidth}px`}} />
        </div>
      </div>
    </div>
  </div>
  }    
  </>
  );
}

export default EhcAverageScoreTest;