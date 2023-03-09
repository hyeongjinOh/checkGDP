/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-06-16
 * @brief EHP 진단평가결과(카드) 컴포넌트
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from 'react';
import ECharts, { EChartsReactProps } from 'echarts-for-react';
//
import { useAsync } from "react-async";
// recoli & state
import { useRecoilValue } from "recoil";
import { userInfoState, authState, } from '../../../../recoil/userState';
//utils
import clog from "../../../../utils/logUtils";
import * as HttpUtil from "../../../../utils/api/HttpUtil";
import * as CUTIL from "../../../../utils/commUtils";
//
import $ from "jquery";
import { cp } from "fs/promises";
//
import { useTrans } from "../../../../utils/langs/useTrans";
import { lstat } from 'fs';
import { useNavigate } from 'react-router-dom';



/**
 * @brief EHP 진단평가결과(카드) 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */

function EhcCheckResultTest() {

  //token`
  const userInfo = useRecoilValue(userInfoState);
  // const curEhcType = props.curEhcType;
  // const setParentCardType = props.handleFunc;
  // const [comment, setComment] = useState("");
  // const chartRef = useRef(null);
  const [total, setTotal] = useState([]);
  const [alarm, setAlarm] = useState([]);
  const [datas, setDatas] = useState([]);
  const [dataAvg, setDataAvg] = useState([]);
  const [listName, setListName] = useState([]);




  //점검결과 API
  const { data: data } = useAsync({
    promiseFn: HttpUtil.PromiseHttp,
    //deferFn: HttpUtil.Http,
    httpMethod: "GET",
    // appPath: `/api/v2/assessment/${assessmentId}`,
    appPath: '/api/v2/assessment/66',
    appQuery: {},
  });
  useEffect(() => {
    if (data) {
      setTotal(data.body.totalScore); // totalAPI
      setAlarm(data.body.alarmDto); // AlarmAPI
      setDatas(data.body.checkGroupValueDtoList);// 평균 점수
      setDataAvg(data.body.checkAvgValueDtoList);// VCB 평균 점수
      setListName(data.body.checkValueDtoMap);// list
    }
  })
  // DELETE API
  const { data: deleteData, run } = useAsync({
    // promiseFn: HttpUtil.PromiseHttp,
    deferFn: HttpUtil.Http,
    httpMethod: "DELETE",
    // appPath: `/api/v2/assessment/values?${assessmentId}`,
    appPath: '/api/v2/assessment/values?assessmentId=123', //124~127 테스트 데이터 남음
    appQuery: {},
  });
  //DELETE 성공 시 useEffect
  useEffect(() => {
    if (deleteData) {
      if (deleteData.msg !== null) {
        clog("성공");
        $("#pop-reload").removeClass("on");
      } else {
        clog("실패");
        ;
      }

    }
  }, [deleteData]);
  // 제조번호 box 이벤트
  function onClickEhcInfo(e) {
    var divEhcInfo = document.querySelector(".ehc__info");
    var ulEhcInfo = "" as unknown as Element;
    for (var i = 0; i < divEhcInfo.children.length; i++) {
      var child = divEhcInfo.children[i];
      if (child.tagName == "UL") ulEhcInfo = child;
    }
    if (CUTIL.isnull(ulEhcInfo)) return;
    ulEhcInfo.classList.toggle("on");
  }

  // result 재진행 팝업창 열기
  function rerunPopOpen(e) {
    $(".btn-reload").toggleClass("on");
    $(".btn-reload").parent().parent().parent().parent().children(".popup-boxin#pop-reload").toggleClass("on");
  }
  // result 재진행 팝업창 닫기
  function rerunPopClose(e) {
    $(".btn-reload").removeClass("on");
    $(".btn-reload").parent().parent().parent().parent().children(".popup-boxin#pop-reload").removeClass("on");
  }
  // premium 팝업창 열기
  function onClickPremiumOpen(e) {
    $(".btn-checkpop").toggleClass("on");
    $(".btn-checkpop").parent().parent().parent().parent().children(".popup-boxin#pop-check").toggleClass("on");
  }
  // premium 팝업창 닫기
  function onClickPremiumColse(e) {
    $(".btn-checkpop").removeClass("on");
    $(".btn-checkpop").parent().parent().parent().parent().children(".popup-boxin#pop-check").removeClass("on");
  }

  // map data


  // ECahrt , data 반시계 반향으로 적용
  const option = {
    color: [
      "rgba(144, 159, 183, 0.5)", // 배점
      "#FF6781", // 평가점수 Data
      "#5B71EF", // VCB 평균 점수 Data
      // "#FF917C"
    ],
    // 차트 하단 정보
    legend: {
      bottom: "12",
      // right: "10",
      // width: "100",
      // itemGap: 9,
      itemWidth: 14,
      itemHeight: 9,
      align: "auto",
      data: [
        {
          icon: "image://./static/img/icon_legend_gray.png",
          name: "배점",
          textStyle: {
            fontFamily: "Noto Sans KR",
            fontWeight: 400,
            fontSize: 11,
            color: "#2A2C2F",
            padding: [0, 0, 0, 4],
          },
        },
        {
          icon: "image://./static/img/icon_legend_red.png",
          name: "평가점수",
          textStyle: {
            fontFamily: "Noto Sans KR",
            fontWeight: 400,
            fontSize: 11,
            color: "#2A2C2F",
            padding: [0, 0, 0, 4],
          },
        },
        {
          icon: "image://./static/img/icon_legend_purple.png",
          name: "VCB 평균점수",
          textStyle: {
            fontFamily: "Noto Sans KR",
            fontWeight: 400,
            fontSize: 11,
            color: "#2A2C2F",
            padding: [0, 0, 0, 4],
          },
        },
      ],
    },
    // 점수 나오게하는 곳 
    tooltip: {
      position: ['50%', '50%']
    },
    radar: [
      {
        indicator: [
          // status 정보에 따라 변함...
          { text: "사용연수", color: "black" },
          { text: "운전이력", color: "black" },
          { text: "설치환경", color: "black" },
          { text: "부하조건", color: "black" },
          { text: "유지보수", color: "black" },
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
    ],
    series: [
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
            value: [20, 20, 14, 20, 20],
            name: "평가점수",
            symbol: "circle",
            symbolSize: 6,
            //내부 style
            areaStyle: {
              // 투명도
              opacity: 0.1
            },
          },
          {
            value: [17, 17, 17, 17, 17],
            name: "VCB 평균점수",
            symbol: "circle",
            symbolSize: 6,
            //내부 style
            areaStyle: {
              // 투명도
              opacity: 0.1
            },
          },
        ],
      },
    ],
  }


  return (
    <>
      {/* <!--정성평가 : ehc__score / e-HC Status 선택에 따른 클래스 변경,컬러변경됨(ehc-b/ehc-p/ehc-a/ehc-n)--> */}
      <article className="box ehc__score ehc-b">
        <div className="box__header">
          <p className="box__title"><span className="cate">Basic</span> e-HC</p>
          <div className="box__etc"><span className="date">{CUTIL.curformattime("YYYY-MM-DD")}</span></div>
        </div>
        <div className="box__body">
          <div className="ehc__info">
            <p className="ehc__name">VCB#12</p>
            <ul onClick={(e) => onClickEhcInfo(e)}>
              <li><span>제조번호</span><span>211202-4435.02</span></li>
              <li><span>담당자</span><span>김철수</span></li>
              <li><span>위치</span><span>A동 전기실1</span></li>
            </ul>
          </div>
          <div className="ehc__detail ehc__result">
            <div className="result__txt">
              {/* <!--점수에따라 종합접수 부분 아이콘 변경됨(3가지) : 정상(기본) / 주의(클래스 caution 추가) / 경고(클래스 warning 추가)--> */}
              {/* SAFETY 이외 아이콘 노출로 변경 - 20220618 */}
              <p className="tit caution"><span>종합점수</span></p>
              <p className="score">{total}</p>
              <p className="txt">{alarm}</p>
              {/* <input type="file" /> */}
            </div>
            <div className="scrollH">
              <div >
                {/* <ECharts
                  option={option}
                  className="ehc__chart"
                /> */}
              </div>
              {/* filter 영역에 맞는 list 제공 */}
              {datas.filter((named) => (named.checkGroupName == named.checkGroupName)).map((name, idx) => (
                < div className="ma__score" key={idx} >
                  <p className="tit" >{name.checkGroupName}</p>
                  <ul className="score__info">
                    {listName[datas[idx].checkGroupName].map((list) => (
                      // isChecked == true disabled + icon
                      <li key={list.checkItemId} className={(list.isChecked) ? "disabled" : ""}>
                        <p className="tit" ><span>{list.checkItemName}</span></p>
                        {/* <!--점수없을경우 해당 li 클래스에 disabled--> */}
                        {/* <!-- 점수단계에 따라 score1~5 까지 표시(점수에따라 클래스(score1~5)가 변경됨) --> */}
                        {/* isChecked == true disabled + 점수 미표기 */}
                        <ul className={(list.isChecked) ? "icon-score" : "icon-score score" + list.value}>
                          <li>Bad</li>
                          <li><span className="hide">매우나쁨</span></li>
                          <li><span className="hide">나쁨</span></li>
                          <li><span className="hide">보통</span></li>
                          <li><span className="hide">좋음</span></li>
                          <li><span className="hide">매우좋음</span></li>
                          <li>Good</li>
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="tbl__bottom">
            <ul className="btn__wrap">
              <li>
                {/* <button type="button" className="btn-reload"><span>Basic 재진행</span></button> */}
                <button type="button" data-testid="reload" className="btn-reload" data-popup="btn-reload" onClick={(e) => rerunPopOpen(e)}><span>재진행</span></button>
                {/* 개발 예정! */}
                <button type="button" className="btn-share"><span>진단결과 공유</span></button>
              </li>
              <li>
                {/* 개발 예정! */}
                <button type="button" data-testid="premium" className="btn-checkpop" data-pop="pop-check" onClick={(e) => onClickPremiumOpen(e)} ><span>Premium 점검 요청</span></button>
              </li>
            </ul>
          </div>
          {/* <!--재진행 팝업 220616 --> */}
          <div id="pop-reload" className="popup-boxin">
            <div className="page-detail">
              <div className="popup__head">
                <h1>Basic 재진행</h1>
                <button className="btn btn-close" onClick={(e) => rerunPopClose(e)}><span className="hide"  >닫기</span></button>
              </div>
              <div className="popup__body">
                <p className="fontMedium">Basic 점검을 재진행하시겠습니까?</p>
                <p>이전 점검 내용은 사라지게 됩니다.</p>
              </div>
              <div className="popup__footer">
                <button type="button" className="bg-gray" onClick={(e) => rerunPopClose(e)} ><span>취소</span></button>
                <button type="button" className="close" onClick={run}><span>확인</span></button>
              </div>
            </div>
          </div>
          {/* <!-- //재진행 팝업 --> */}
          {/* <!--Premium 정밀진단 요청 팝업 220616 --> */}
          <div id="pop-check" className="popup-boxin">
            <div className="page-detail">
              <div className="popup__head">
                <h1>Premium 정밀진단 요청</h1>
                <button className="btn btn-close"><span className="hide">닫기</span></button>
              </div>
              <div className="popup__body">
                <p className="fontMedium">LS ELECTRIC 전문가가 활선/정전 상태에서 전력설비의 전기적 기계적 성능 점검 및 시험을 진행하고 설비의 정확한 상태를 제공합니다.</p>
                <p>(출장 및 현장 정밀 진단 서비스 비용 발생)</p>
              </div>
              <div className="popup__footer">
                <button type="button" className="close"><span>확인</span></button>
              </div>
            </div>
          </div>
          {/* <!-- //Premium 정밀진단 요청 팝업 --> */}
        </div>
      </article>
    </>
  )
}

export default EhcCheckResultTest;




