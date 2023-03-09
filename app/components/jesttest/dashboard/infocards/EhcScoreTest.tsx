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
//component

function EhcScoreTest(props) {
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


  const [ehcScore, setEhcScore] = useState(
    {
      "totalCount":0,
      "tenLess":0,
      "betweenTenAndTwenty":0,
      "betweenTwentyAndThirty":0,
      "betweenThirtyAndForty":0,
      "betweenFortyAndFifty":0,
      "betweenFiftyAndSixty":0,
      "betweenSixtyAndSeventy":0,
      "betweenSeventyAndEighty":0,
      "betweenEightyAndNinety":0,
      "ninetyMore":0
    }
  );
  // ECahrt , data 반시계 반향으로 적용
  var chartDefaultVal = {
    color: ["#909FB7"],
    tooltip: {
      trigger: 'item',
      //formatter: `{c} EA`,
      formatter: function (params) {
        return `${params.data.value} EA`
      },      
      position: 'top',
      backgroundColor: "#2A2C2F",
      textStyle: {
        color: "#FFFFFF",
        fontSize: 13
      }
    },
    grid: {"left":"3%", "right":"3%", "top":"10%", "bottom":"10%"},
    xAxis: [{
      type: "category",
      data: ["10", "20", "30", "40", "50", "60", "70", "80", "90", "100"],
      min: 0,
      max: 9,
      axisTick: {
        alignWithLabel: true
      },
      splitArea: {
        interval: 1
      }
    }],
    yAxis: {
      //type: "value",
      //position: "left",
      // y 상단 이름
      name: "(EA)",
      // y 이름 스타일
      nameTextStyle: {
        verticalAlign: "top"
      },
      //
      min: 0,
      max: 20,
      // y 글자색상
      axisLabel: {
        //show:true,
        hideOverlap: false,
        color: "rgba(0, 0, 0, 0)"
      },
    },
    series: {
      type: "bar",
      barWidth: "40%", // ber 굵기
      label: {
        show: true,
        position: 'top',
        valueAnimation: true
      },
      data: [
        {
          value: 0, //-10
          emphasis: {// mouse hover color 변경 이벤트
            focus: 'series', itemStyle: { color: 'rgb(91, 113, 239)'} // basic 색
            //color: 'rgb(19, 167, 158)' // premium 색
            //color: 'rgb(255, 153, 0)' // Advanced 색
          },
        },
        {
          value: 0, //10-20
          emphasis: {// mouse hover color 변경 이벤트
            focus: 'series', itemStyle: { color: 'rgb(91, 113, 239)'} // basic 색
          },
        },
        {
          value: 0, //20-30
          emphasis: {// mouse hover color 변경 이벤트
            focus: 'series', itemStyle: { color: 'rgb(91, 113, 239)'} // basic 색
          },
        },
        {
          value: 0, //30-40
          emphasis: {// mouse hover color 변경 이벤트
            focus: 'series', itemStyle: { color: 'rgb(91, 113, 239)'} // basic 색
          },
        },
        {
          value: 0, //40-50
          emphasis: {// mouse hover color 변경 이벤트
            focus: 'series', itemStyle: { color: 'rgb(91, 113, 239)'} // basic 색
          },
        },
        {
          value: 0, //50-60
          emphasis: {// mouse hover color 변경 이벤트
            focus: 'series', itemStyle: { color: 'rgb(91, 113, 239)'} // basic 색
          },
        },
        {
          value: 0, //60-70
          emphasis: {// mouse hover color 변경 이벤트
            focus: 'series', itemStyle: { color: 'rgb(91, 113, 239)'} // basic 색
          },
        },
        {
          value: 0, //70-80
          emphasis: {// mouse hover color 변경 이벤트
            focus: 'series', itemStyle: { color: 'rgb(91, 113, 239)'} // basic 색
          },
        },
        {
          value: 0, //80-90
          emphasis: {// mouse hover color 변경 이벤트
            focus: 'series', itemStyle: { color: 'rgb(91, 113, 239)'} // basic 색
          },
        },
        {
          value: 0, //90-100
          emphasis: {// mouse hover color 변경 이벤트
            focus: 'series', itemStyle: { color: 'rgb(91, 113, 239)'} // basic 색
          },
        },
      ]
    }
  }
  const [chartVal, setChartVal] = useState(chartDefaultVal);
  function handleChartVal(val) {
    clog("handleChartVal : " + JSON.stringify(step));
    let yMax = 10;
    yMax = val.tenLess;
    yMax = (val.betweenTenAndTwenty > yMax)?val.betweenTenAndTwenty:yMax;
    yMax = (val.betweenTwentyAndThirty > yMax)?val.betweenTwentyAndThirty:yMax;
    yMax = (val.betweenThirtyAndForty > yMax)?val.betweenThirtyAndForty:yMax;
    yMax = (val.betweenFortyAndFifty > yMax)?val.betweenFortyAndFifty:yMax;
    yMax = (val.betweenFiftyAndSixty > yMax)?val.betweenFiftyAndSixty:yMax;
    yMax = (val.betweenSixtyAndSeventy > yMax)?val.betweenSixtyAndSeventy:yMax;
    yMax = (val.betweenSeventyAndEighty > yMax)?val.betweenSeventyAndEighty:yMax;
    yMax = (val.betweenEightyAndNinety > yMax)?val.betweenEightyAndNinety:yMax;
    yMax = (val.ninetyMore > yMax)?val.ninetyMore:yMax;

    let barStyle = { color: 'rgb(91, 113, 239)'}; // basic
    barStyle = 
    (step.stepVal === "ADVANCED")
    ? {color: 'rgb(255, 153, 0)'} // Advanced 색
    : (step.stepVal === "PREMIUM")
     ? {color: 'rgb(19, 167, 158)'} // premium 색
     : { color: 'rgb(91, 113, 239)'} // basic

    let datas = [];
    datas.push({ value: val.tenLess, emphasis: { focus: 'series', itemStyle: barStyle }});
    datas.push({ value: val.betweenTenAndTwenty, emphasis: { focus: 'series', itemStyle: barStyle }});
    datas.push({ value: val.betweenTwentyAndThirty, emphasis: { focus: 'series', itemStyle: barStyle }});
    datas.push({ value: val.betweenThirtyAndForty, emphasis: { focus: 'series', itemStyle: barStyle }});
    datas.push({ value: val.betweenFortyAndFifty, emphasis: { focus: 'series', itemStyle: barStyle }});
    datas.push({ value: val.betweenFiftyAndSixty, emphasis: { focus: 'series', itemStyle: barStyle }});
    datas.push({ value: val.betweenSixtyAndSeventy, emphasis: { focus: 'series', itemStyle: barStyle }});
    datas.push({ value: val.betweenSeventyAndEighty, emphasis: { focus: 'series', itemStyle: barStyle }});
    datas.push({ value: val.betweenEightyAndNinety, emphasis: { focus: 'series', itemStyle: barStyle }});
    datas.push({ value: val.ninetyMore, emphasis: { focus: 'series', itemStyle: barStyle }});

    setChartVal({ 
      ...chartVal, 
      yAxis:{...chartVal.yAxis, max:CUTIL.execCeilVal(yMax)},
      series: { ...chartVal.series, data: datas } 
    });
  }

  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/maindashboard/ehcscores?zoneId=${selTree.zone.zoneId}&stepName=${step.stepVal}&spgList=${spg.spgVal}`,
    appQuery: {
      /*"zoneId" : selTree.zone.zoneId,
      "spgList" : spg.spgVal*/
    },
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: selTree.zone.zoneId+spg.spgVal+step.stepVal,
    //watch: selTree+spg,
  });

  useEffect(() => {
    setRecoilIsLoadinBox(true);
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
    if (ERR_URL.length > 0) navigate(ERR_URL);
    if (retData) {
      setRecoilIsLoadinBox(false);
      //clog("IN INFOCARS : EHC SCORE : RES : " + JSON.stringify(retData.body));
      if (retData.codeNum == CONST.API_200) {
        setEhcScore(retData.body);
        handleChartVal(retData.body);
      }
    }
  }, [retData])
  const chartWidth = window.innerWidth / (8/colCount) * 0.781;

  return (
    <>
    <div className="box__header">
      <p className="box__title">e-HC 점수 현황</p>
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
      <ul className="tab__small">
      {/* <!-- 선택된 탭 on --> */}
        {stepList.map((sp, idx)=>(
        <li key={`li_${idx.toString()}`} className={(step.stepVal===sp.stepVal)?"on":""}>
          <a onClick={(e)=>setStep(sp)}>{sp.stepDisp}</a>
        </li>
        ))}
      </ul>
      {/* <!--221123, 그래프 영역 수정--> */}
      <div className="bottom  mt-40">{/* ehc__chart */}
        <div className="chart" style={{ "width": "100%", "marginLeft": "0 auto" }}>
          <div id="eHC_list"  >
            <ECharts option={chartVal} className="ehc__chart" style={{"width":`${chartWidth}px`}}/>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}

export default EhcScoreTest;