/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-01
 * @brief EHP DashBoard - 노후 교체 현황 컴포넌트
 *
 ********************************************************************/
import React, { useState, useEffect, useRef, DependencyList } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
import { loadingBoxState, urlState, czoneInfoState } from "../../../recoil/menuState";

// ex-utils
import ECharts, { EChartsReactProps } from 'echarts-for-react';
// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as CUTIL from "../../../utils/commUtils"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import { SeriesModel } from "echarts";

 /**
 * @brief EHP DashBoard - 노후 교체 현황 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

//component
function OldDeviceStatus(props) {
  //trans, ref, navigate
  const navigate = useNavigate();
  const chartRef = useRef(null);
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [urlInfo, setRecoilUrlInfo] = useRecoilState(urlState);
  const [isLoadingBox, setRecoilIsLoadinBox] = useRecoilState(loadingBoxState);
  const [czoneInfo, setRecoilCZoneInfo] = useRecoilState(czoneInfoState);    
  //props
  const selTree = props.selTree;
  const colCount = props.colCount;

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => { // resize handler
    // Mobile 체크
    function handleResize() {
      if (CUTIL.isnull(chartRef)) return;
      const mobileTag = chartRef.current;
      if (!CUTIL.isnull(mobileTag)) {
        if ((mobileTag.clientWidth <= 660)) {
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
      if ((mobileTag.clientWidth <= 660)) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    }
  });
  */
  const [oldDevice, setOldDevice] = useState(
    {
      "totalCount": 0,
      "oldDevice": []
    }
  );
  const chartDefaultVal = {
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        return `요청: ${params.data.accept} / 접수: ${params.data.request}`
      },
      position: 'top',
      backgroundColor: "#2A2C2F",
      textStyle: {
        color: "#FFFFFF",
        fontSize: 13
      }
    },
    grid: {"left":"3%", "right":"3%", "top":"10%", "bottom":"6%"},
    xAxis: [{
      type: "category",
      data: ['VCB', 'ACB', 'Mold TR', '유입식 TR', 'GIS', '배전반'], //b
      min: 0,
      max: 5,
      axisTick: {
        alignWithLabel: true
      },
      splitArea: {
        interval: 1
      },
      axisLabel: { interval: 0, rotate: (isMobile) ? 30 : '' }
    }],
    yAxis: {
      // y 상단 이름
      name: "(EA)",
      // y 이름 스타일
      nameTextStyle: {
        verticalAlign: "top"
      },
      //
      min: 0,
      max: 5,
      // y 글자색상
      axisLabel: {
        hideOverlap: false,
        color: "rgba(0, 0, 0, 0)"
      },
    },
    series:
    {
      label: {
        show: true,
        position: 'top',
        valueAnimation: true
      },
      data: [//'VCB', 'ACB', 'Mold TR', '유입식 TR', 'GIS', '배전반'
        { value: 0, accept: 0, request: 0 },
        { value: 0, accept: 0, request: 0 },
        { value: 0, accept: 0, request: 0 },
        { value: 0, accept: 0, request: 0 },
        { value: 0, accept: 0, request: 0 },
        { value: 0, accept: 0, request: 0 },
      ],
      type: 'bar',
      // barWidth: "10%"
    }

  };
  const [chartVal, setChartVal] = useState(chartDefaultVal);
  function handleChartVal(val) {
    let yMax = 100;
    val.oldDevice.map((spg, idx)=>{
      if (idx === 0) yMax = spg.sum;
      yMax = (spg.sum > yMax)?spg.sum:yMax;
    });

    let datas = [];
    val.oldDevice.filter((spg) => spg.spg.name === "VCB").map((spg) => {
      datas.push({ value: spg.sum, accept: spg.requestedCount, request: spg.acceptedCount });
    })
    val.oldDevice.filter((spg) => spg.spg.name === "ACB").map((spg) => {
      datas.push({ value: spg.sum, accept: spg.requestedCount, request: spg.acceptedCount });
    })
    val.oldDevice.filter((spg) => spg.spg.name === "MoldTR").map((spg) => {
      datas.push({ value: spg.sum, accept: spg.requestedCount, request: spg.acceptedCount });
    })
    val.oldDevice.filter((spg) => spg.spg.name === "유입식TR").map((spg) => {
      datas.push({ value: spg.sum, accept: spg.requestedCount, request: spg.acceptedCount });
    })
    val.oldDevice.filter((spg) => spg.spg.name === "GIS").map((spg) => {
      datas.push({ value: spg.sum, accept: spg.requestedCount, request: spg.acceptedCount });
    })
    val.oldDevice.filter((spg) => spg.spg.name === "배전반").map((spg) => {
      datas.push({ value: spg.sum, accept: spg.requestedCount, request: spg.acceptedCount });
    })
    setChartVal({ 
      ...chartVal, 
      yAxis:{...chartVal.yAxis, max:CUTIL.execCeilVal(yMax)},
      series: { ...chartVal.series, data: datas } 
    });
  }
  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/maindashboard/olddevicecount?zoneId=${selTree.zone.zoneId}`,
    appQuery: {
      /*"zoneId" : selTree.zone.zoneId,
      "spgList" : spg.spgVal*/
    },
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: selTree.zone.zoneId,
    //watch: selTree+spg,
  });

  useEffect(() => {
    setRecoilIsLoadinBox(true);
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
    if (ERR_URL.length > 0) navigate(ERR_URL);
    if (retData) {
      setRecoilIsLoadinBox(false);
      //clog("IN INFOCARS : OLD DEVICE : RES : " + JSON.stringify(retData.body));
      if (retData.codeNum == CONST.API_200) {
        setOldDevice(retData.body);
        handleChartVal(retData.body);
        //clog("PIN LC INFO : " + czoneStr);
      }
    }
  }, [retData])

  function onClickGoLink(url) {
    setRecoilCZoneInfo(selTree);    
    setRecoilUrlInfo(url);
    navigate(url);
  }

  const chartWidth = window.innerWidth / (8/colCount) * 0.781;
  
  return (
    <>
      <div className="box__header" ref={chartRef} >
        <p className="box__title">노후 교체 현황</p>
        <div className="box__etc">
          <button type="button" className="btn btn-go" onClick={(e)=>onClickGoLink(CONST.URL_DEVICECHANGEWORKORDER)}>
            <span className="hide">바로가기</span>
          </button>
        </div>
      </div>
      <div className="box__body">
        <div className="top">
          <div className="left mt-5">
            <p className="txt">노후 교체 요청 설비</p>
          </div>
          <div className="right">
            <p className="total-num"><strong>{oldDevice.totalCount}</strong> ea</p>
          </div>
        </div>
        <div>
          <div className="bottom " >
            <div className="chart" style={{ "width": "100%", "marginLeft": "0 auto" }} >
              <div id="change">
                <ECharts option={chartVal} className="ehc__chart" style={{"width":`${chartWidth}px`}}/>
                {/*<ECharts option={chartVal} className="ehc__chart"/>*/}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OldDeviceStatus;


