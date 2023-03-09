/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-01
 * @brief EHP DashBoard - 점검 사고 이력 컴포넌트
 *
 ********************************************************************/
import React, { useState, useEffect, useRef } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
import { loadingBoxState, urlState } from "../../../recoil/menuState";

// ex-utils
import ECharts, { EChartsReactProps } from 'echarts-for-react';
// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as CUTIL from "../../../utils/commUtils"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import { SeriesModel } from "echarts";

 /**
 * @brief EHP DashBoard - 점검 사고 이력 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

//component

function EhcHistory(props) {
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
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { // resize handler
    // Mobile 체크
    function handleResize() {
        if (CUTIL.isnull(chartRef)) return;
        const mobileTag = chartRef.current;
        if (!CUTIL.isnull(mobileTag)) {
          if ((mobileTag.clientWidth <= 670)) {
              setIsMobile(true);
          } else {
              setIsMobile(false);
          }
        }
      }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
    }
  }, []);
  /*
  useEffect(() => { // re-rendering mobile check
    if (CUTIL.isnull(chartRef)) return;
    const mobileTag = chartRef.current;
    if (!CUTIL.isnull(mobileTag)) {
        if ((mobileTag.clientWidth <= 670)) {
            setIsMobile(true);
        } else {
            setIsMobile(false);
        }
    }
  });
  */
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

  const [ehcHistory, setEhcHistory] = useState(
    []
    /*{
    "year2018":{"januaryCount":0,"februaryCount":0,"marchCount":0,"aprilCount":0,"mayCount":0,"juneCount":0,"julyCount":0,"augustCount":0,"septemberCount":0,"octoberCount":0,"novemberCount":0,"decemberCount":0},
    "year2019":{"januaryCount":0,"februaryCount":0,"marchCount":0,"aprilCount":0,"mayCount":0,"juneCount":0,"julyCount":0,"augustCount":0,"septemberCount":0,"octoberCount":0,"novemberCount":0,"decemberCount":0},
    "year2020":{"januaryCount":0,"februaryCount":0,"marchCount":0,"aprilCount":0,"mayCount":0,"juneCount":0,"julyCount":0,"augustCount":0,"septemberCount":0,"octoberCount":0,"novemberCount":2,"decemberCount":5},
    "year2021":{"januaryCount":4,"februaryCount":6,"marchCount":11,"aprilCount":12,"mayCount":12,"juneCount":12,"julyCount":12,"augustCount":12,"septemberCount":12,"octoberCount":12,"novemberCount":14,"decemberCount":17},
    "year2022":{"januaryCount":4,"februaryCount":6,"marchCount":11,"aprilCount":12,"mayCount":12,"juneCount":12,"julyCount":12,"augustCount":12,"septemberCount":12,"octoberCount":12,"novemberCount":14,"decemberCount":17}
  }*/
  );

    // ECahrt , data 반시계 반향으로 적용
  var chartDefaultVal = {

    tooltip: {
      trigger: 'item',
      valueFormatter: (value) => value + "ea",
      position: 'top',
      backgroundColor: "#2A2C2F",
      textStyle: {
        color: "#FFFFFF",
        fontSize: 13
      }
    },
    legend: {
      data: ['2016', '2019', '2020', '2021', '2022'],
      //bottom: 'bottom',
      icon: "circle",
      align: "auto",
      //"left":"%", "right":"3%", "top":"5%", 
      "bottom":"0%",
    },
    dataset: {
      // 연도 정의
      dimensions: ['product', '2018', '2019', '2020', '2021', '2022'],
      source: [
        //해당연도 월별 data , 
        /*
        { product: 'Jan', '2018': 25, '2019': 40, '2020': 55, '2021': 65, '2022': 90, },
        { product: 'Feb', '2018': 11, '2019': 18, '2020': 16, '2021': 16, '2022': 19, },
        { product: 'Mar', '2018': 12, '2019': 17, '2020': 6, '2021': 16, '2022': 19, },
        { product: 'Apr', '2018': 13, '2019': 14, '2020': 16, '2021': 6, '2022': 8, },
        { product: 'May', '2018': 14, '2019': 15, '2020': 6, '2021': 16, '2022': 19, },
        { product: 'Jun', '2018': 15, '2019': 12, '2020': 6, '2021': 16, '2022': 19, },
        { product: 'Jul', '2018': 1, '2019': 15, '2020': 16, '2021': 6, '2022': 10, },
        { product: 'Aug', '2018': 2, '2019': 17, '2020': 6, '2021': 16, '2022': 19, },
        { product: 'Sept', '2018': 3, '2019': 20, '2020': 6, '2021': 16, '2022': 19, },
        { product: 'Oct', '2018': 4, '2019': 11, '2020': 16, '2021': 6, '2022': '', },
        { product: 'Nov', '2018': 5, '2019': 11, '2020': 6, '2021': 16, '2022': '', },
        { product: 'Dec', '2018': 6, '2019': 11, '2020': 6, '2021': 16, '2022': '', },
        */
      ]
    },
    grid: {
        "left":"1%", "right":"3%", "top":"5%", "bottom":"10%",
        containLabel: true
    },
    xAxis: {
        type: 'category',
        axisTick: {
            alignWithLabel: true
        },
        axisLabel: { interval: 0, rotate: (isMobile) ? 30 : '' }
    },
    yAxis: {
      // y 상단 이름
      name: "(EA)",
      // y 이름 스타일
      nameTextStyle: {
        verticalAlign: "top"
      },
      //
      min: 0,
      max: 100,
      // y 글자색상
      axisLabel: {
        hideOverlap: false,
        color: "rgba(0, 0, 0, 0)"
      },
    },
    series: [
      {name: '2018', type: 'line', emphasis: { focus: 'series' } }, // smooth: true, seriesLayoutBy: 'row',
      {name: '2019', type: 'line', emphasis: { focus: 'series' } }, // smooth: true, seriesLayoutBy: 'row',
      {name: '2020', type: 'line', emphasis: { focus: 'series' } }, // smooth: true, seriesLayoutBy: 'row',
      {name: '2021', type: 'line', emphasis: { focus: 'series' } }, // smooth: true, seriesLayoutBy: 'row',
      {name: '2022', type: 'line', emphasis: { focus: 'series' } }, // smooth: true, seriesLayoutBy: 'row',
    ]
  };
  const [chartVal, setChartVal] = useState(chartDefaultVal);
  function handleChartVal(val) {
    const startYear = parseInt(CUTIL.curformattime("YYYY")) - 5 + 1;

    let legendDatas = [];
    let dsDsimensions = ["product"];
    let dsSourece = [];
    let seriesVals = [];

    val.map((history, idx)=>{
      legendDatas.push((startYear+idx).toString());
      dsDsimensions.push((startYear+idx).toString());
      seriesVals.push({name: (startYear+idx).toString(), type: 'line',emphasis: { focus: 'series' }});
    });
    //
    let data1, data2, data3, data4, data5, data6, data7, data8, data9, data10, data11, data12;
    let yMax = 10;

    val.map((history, idx)=>{
      if (idx === 0) {
        data1 = `{"product": "Jan"`;
        data2 = `{"product": "Feb"`;
        data3 = `{"product": "Mar"`;
        data4 = `{"product": "Apr"`;
        data5 = `{"product": "May"`;
        data6 = `{"product": "Jun"`;
        data7 = `{"product": "Jul"`;
        data8 = `{"product": "Aug"`;
        data9 = `{"product": "Sept"`;
        data10 = `{"product": "Oct"`;
        data11 = `{"product": "Nov"`;
        data12 = `{"product": "Dec"`;
      }
      data1 = data1 + `, "${(startYear+idx).toString()}": ${history.januaryCount}`;
      yMax = (history.januaryCount > yMax)?history.januaryCount:yMax;
      data2 = data2 + `, "${(startYear+idx).toString()}": ${history.februaryCount}`;
      yMax = (history.februaryCount > yMax)?history.februaryCount:yMax;
      data3 = data3 + `, "${(startYear+idx).toString()}": ${history.marchCount}`;
      yMax = (history.marchCount > yMax)?history.marchCount:yMax;
      data4 = data4 + `, "${(startYear+idx).toString()}": ${history.aprilCount}`;
      yMax = (history.aprilCount > yMax)?history.aprilCount:yMax;
      data5 = data5 + `, "${(startYear+idx).toString()}": ${history.mayCount}`;
      yMax = (history.mayCount > yMax)?history.mayCount:yMax;
      data6 = data6 + `, "${(startYear+idx).toString()}": ${history.juneCount}`;
      yMax = (history.juneCount > yMax)?history.juneCount:yMax;
      data7 = data7 + `, "${(startYear+idx).toString()}": ${history.julyCount}`;
      yMax = (history.julyCount > yMax)?history.julyCount:yMax;
      data8 = data8 + `, "${(startYear+idx).toString()}": ${history.augustCount}`;
      yMax = (history.augustCount > yMax)?history.augustCount:yMax;
      data9 = data9 + `, "${(startYear+idx).toString()}": ${history.septemberCount}`;
      yMax = (history.septemberCount > yMax)?history.septemberCount:yMax;
      data10 = data10 + `, "${(startYear+idx).toString()}": ${history.octoberCount}`;
      yMax = (history.octoberCount > yMax)?history.octoberCount:yMax;
      data11 = data11 + `, "${(startYear+idx).toString()}": ${history.novemberCount}`;
      yMax = (history.novemberCount > yMax)?history.novemberCount:yMax;
      data12 = data12 + `, "${(startYear+idx).toString()}": ${history.decemberCount}`;
      yMax = (history.decemberCount > yMax)?history.decemberCount:yMax;
      if (idx === (val.length - 1)) {
        data1 = data1 + "}";
        data2 = data2 + "}";
        data3 = data3 + "}";
        data4 = data4 + "}";
        data5 = data5 + "}";
        data6 = data6 + "}";
        data7 = data7 + "}";
        data8 = data8 + "}";
        data9 = data9 + "}";
        data10 = data10 + "}";
        data11 = data11 + "}";
        data12 = data12 + "}";
      }
    })

    dsSourece.push(JSON.parse(data1));
    dsSourece.push(JSON.parse(data2));
    dsSourece.push(JSON.parse(data3));
    dsSourece.push(JSON.parse(data4));
    dsSourece.push(JSON.parse(data5));
    dsSourece.push(JSON.parse(data6));
    dsSourece.push(JSON.parse(data7));
    dsSourece.push(JSON.parse(data8));
    dsSourece.push(JSON.parse(data9));
    dsSourece.push(JSON.parse(data10));
    dsSourece.push(JSON.parse(data11));
    dsSourece.push(JSON.parse(data12));

    clog("EHC HISTORY : Y MAX : " + yMax);
    var strNum = yMax.toString();
    var maxVal = Math.pow(10, strNum.length);
    var ratio = yMax/maxVal*100;
    var calVal = (ratio>80)?maxVal:(ratio>50)?maxVal*0.7:(ratio>30)?maxVal*0.5:(ratio>20)?maxVal*0.3:maxVal*ratio/100;
    calVal = (strNum.length===1)?10:calVal;
    clog("EHC HISTORY : Y : " + yMax + " : max : " + maxVal + " : cal : " + calVal + " : ratio: " + ratio);
  
    setChartVal({ 
      ...chartVal, 
      yAxis:{...chartVal.yAxis, max:CUTIL.execCeilVal(yMax)},
      dataset:{...chartVal.dataset, dimensions: dsDsimensions, source: dsSourece},
      legend:{...chartVal.legend, data:legendDatas},
      series: seriesVals,
    });
      
  }


  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/maindashboard/customerservice/status?zoneId=${selTree.zone.zoneId}&spgList=${spg.spgVal}`,
    appQuery: {
        /*"zoneId" : selTree.zone.zoneId,
        "spgList" : spg.spgVal*/
    },
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: selTree.zone.zoneId+spg.spgVal,
  });
    
  useEffect(() => {
    setRecoilIsLoadinBox(true);
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
    if (ERR_URL.length > 0) navigate(ERR_URL);
    if (retData) {
      setRecoilIsLoadinBox(false);
      //clog("IN INFOCARS : EHC HISTORY : RES : " + JSON.stringify(retData.body));
      if (retData.codeNum == CONST.API_200) {
        setEhcHistory(retData.body);
        handleChartVal(retData.body);
      }
    }
  }, [retData])
    
  function onClickGoLink(url) {
    setRecoilUrlInfo(url);
    navigate(url);
  }

  const chartWidth = window.innerWidth / (8/colCount) * 0.781;
  return (
  <>
    <div className="box__header" ref={chartRef}>
      <p className="box__title">점검 사고 이력</p>
      <div className="box__etc">
        <div className="select" onClick={(e)=>CUTIL.onClickSelect(e, selectOptionSpg)}>
          <div className="selected">
            <div className="selected-value">{spg.spgDisp}</div>
            <div className="arrow"></div>
          </div>
          <ul>
            {spgList.map((spg, idx)=>(<li key={`li_${idx.toString()}`} className="option" data-value={JSON.stringify(spg)}>{spg.spgDisp}</li>))}
          </ul>
        </div>
        <button type="button" className="btn btn-go ml-8" onClick={(e)=>onClickGoLink(CONST.URL_HISTORYWORKORDER)}>
          <span className="hide">바로가기</span>
        </button>
      </div>
    </div>
    <div className="box__body">
      {/* <!--221123, 그래프 영역 수정--> */}
      <div className="bottom ">{/* ehc__chart */}
        <div className="chart" style={{ "width": "100%", "marginLeft": "0 auto" }}>
          <div id="history">
            <ECharts option={chartVal} className="ehc__chart" style={{"width":`${chartWidth}px`, "height":"400px"}} />
          </div>
        </div>
      </div>
    </div>
  </>
  );
}

export default EhcHistory;