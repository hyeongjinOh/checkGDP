/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-06-27
 * @brief EHP List 컴포넌트
 *
 ********************************************************************/
import React, { useState, useEffect } from "react";
import ECharts, { EChartsReactProps } from 'echarts-for-react';
//
import { useAsync } from "react-async";
// recoli & state
import { useRecoilValue, useSetRecoilState, useResetRecoilState } from "recoil";
import { userInfoState, authState, } from '../../../../recoil/userState';
import {
    itemType,
    itemState,
    nextItemState,
    beforeItemState,
    checkStep,
    curCheckValueDto,
    getTempSave,
    tempCheckValue,
    doneAssessmentState
} from '../../../../recoil/assessmentState';
//
import { useTrans } from "../../../../utils/langs/useTrans";
//utils
import * as HttpUtil from "../../../../utils/api/HttpUtil";
import * as CUTIL from "../../../../utils/commUtils";
import clog from "../../../../utils/logUtils"
//
import $ from "jquery";
//components
import Pagination from "../../../common/pagination/Pagination"
/**
 * @brief EHP List 컴포넌트, 반응형 동작
 * @param param0 curTreeData : Tree에서 선택한 SPG
 * @param param1
 * @returns react components
 */
function ItemCheckResultTest(props) {
    const userInfo = useRecoilValue(userInfoState);
    //
    const curItem = useRecoilValue(itemState);
    const setRecoilCurItem = useSetRecoilState(itemState);
    const resetRecoilTsItemCheckListInfo = useResetRecoilState(doneAssessmentState);
    const setCurCheckStep = useSetRecoilState(checkStep);
    const setRecoilTempCheckVal = useSetRecoilState(tempCheckValue);
    const resetRecoilTempCheckVal = useResetRecoilState(tempCheckValue);
    //
    const [checkResult, setCheckResult] = useState(null);

    //
    const isOpen = (props.hasOwnProperty("isOpen")) ? props.isOpen : false;
    const setParentResultOpen = props.setResultOpen;
    const item = props.curHistoryInfo
    //
    const assessmentId = props.assessmentId;
    clog("IN ITEMCHECKHISTORYRESULT : assessmentId : " + assessmentId + " : OPEN : " + isOpen);
    const [checkName, setCheckName] = useState("");

    //점검결과 API\  //  clog("IN EHCCHEKRESULT : INIT : " + curItem.ehcType);  //  clog("IN EHCCHEKRESULT : INIT : " + curItem.assessment.assessmentId);

    const { data: data, isLoading } = useAsync({
        promiseFn: HttpUtil.PromiseHttp,
        //deferFn: HttpUtil.Http,
        httpMethod: "GET",
        appPath: `/api/v2/assessment/${assessmentId}`,
        //appPath: '/api/v2/assessment/66',
        appQuery: {},
        // userToken: userInfo.userInfo.token,
        watch: assessmentId
    });

    useEffect(() => {
        if (data) {
            // clog("IN EHCRESULT : RETURN : " + JSON.stringify(curItem));
            if (data.codeNum == 200) {
                //clog("IN EHCRESULT : RETURN : " + JSON.stringify(data.body));
                setCheckResult(data.body);

            } else { // api if
            }
        }
    }, [data])
    //if (isLoading) return (<div>로딩중..</div>);
    // DELETE API
    /* async function deleteResult(assessmentId) {
      clog("IN EHCCHEKRESULT : deleteResult : " + assessmentId);
      let data:any = null;
      data = await HttpUtil.PromiseHttp({
        "httpMethod" : "DELETE", 
        "appPath" : "/api/v2/assessment/values", 
        "appQuery" : {
          assessmentId: assessmentId,
        },
        userToken : userInfo.userInfo.token,
      });
      if (data) {
       clog("IN EHCRESULT : deleteResult : " + JSON.stringify(curItem));
       if ( data.codeNum == 200 ) {
         clog("IN EHCRESULT : deleteResult : " + JSON.stringify(data.body));
       } else { // api if
       }
     }
    }
   
    // 확인 버튼 
    function hadleRerun(val) {
       // 선택된 ITEM의 assessmentID 초기화 필요    
       deleteResult(curItem.assessment.assessmentId);
       resetRecoilTsItemCheckListInfo();
       setCurCheckStep(0);
   
       const tmpCurItem = {
         spgTree : {
           company : company,
           zone : zone,
           room : room,
           spg : spg
         },
         ehcType: curItem.ehcType,
         id: curItem.id, 
         itemName: curItem.itemName, 
         serialNo : curItem.serialNo,
         itemStatus : curItem.itemStatus,
         itemStep : curItem.itemStep,
         responsible : curItem.itemStep,
         assessment:{
           preAssessmentId:null,
           assessmentId:null, 
           totalComment:null,
           reportId : null,
           updatedTime : null,
           isTempSave : null
         }
        };
        var inputData = { 
          item : val,
          checkVal : {
            assessmentId:null,
            checkItemId:-1,
            checkItemName:"",
            isChecked:false,
            value:"",
            valueType:"",
            comment:"",
            versionNo:""
          },
          stepDone:false
        };
        setRecoilCurItem(tmpCurItem);
        resetRecoilTempCheckVal();
    } */
    // PDF 다운로드
    async function onClickReportDownload(e, reportId) {
        //alert("selected-data : " + selectedPeriod);
        let data: any = null;
        data = await HttpUtil.PromiseHttp({
            "httpMethod": "GET",
            "appPath": `/api/v2/report/${reportId}`,
            "appQuery": {
            },
            // userToken: userInfo.userInfo.token,
        });
        if (data) {
            if (data.codeNum == 200) {
                clog("IN COMUTILS : GET FILEDOWNLOAD : " + JSON.stringify(data));
                HttpUtil.fileDownload(`${item.itemReportDtoOut.itemName}_진단점검리포트.PDF`, data.body.fileLink);
            } else {

            }
        }
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

    const totalScore = (checkResult == null) ? -1 : (checkResult.hasOwnProperty("totalScore")) ? checkResult.totalScore : -1; // totalAPI
    const alarmDto = (checkResult == null) ? null : (checkResult.hasOwnProperty("alarmDto")) ? checkResult.alarmDto : null; // AlarmAPI
    const checkGroupValue = (checkResult == null) ? null : (checkResult.hasOwnProperty("checkGroupValueDtoList")) ? checkResult.checkGroupValueDtoList : null;
    const checkAvgValue = (checkResult == null) ? null : (checkResult.hasOwnProperty("checkAvgValueDtoList")) ? checkResult.checkAvgValueDtoList : null;
    const checkValueList = (checkResult == null) ? null : (checkResult.hasOwnProperty("checkValueDtoMap")) ? checkResult.checkValueDtoMap : null;
    const stepName = (checkResult == null) ? null : (checkResult.hasOwnProperty("stepName")) ? checkResult.stepName : null; // stepName
    const updatedTime = (checkResult == null) ? null : (checkResult.hasOwnProperty("updatedTime")) ? checkResult.updatedTime : null; // updateTime
    const itemName = (item == null) ? null : (item.hasOwnProperty("itemReportDtoOut")) ? item.itemReportDtoOut.itemName : null; // itemName
    const responsible = (item == null) ? null : (item.hasOwnProperty("itemReportDtoOut")) ? item.itemReportDtoOut.responsible : null; // responsible
    const serialNo = (item == null) ? null : (item.hasOwnProperty("itemReportDtoOut")) ? item.itemReportDtoOut.serialNo : null; // serialNo
    const roomName = (item == null) ? null : (item.hasOwnProperty("roomName")) ? item.roomName : null; // roomName
    const spgName = (item == null) ? null : (item.hasOwnProperty("spgDto")) ? item.spgDto.name : null; // spg
    const reportId = (item == null) ? null : (item.hasOwnProperty("reportId")) ? item.reportId : null; // spg


    clog(item);

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
                    //  icon: "image://./static/* 개발 서버 /asset/ 배포용
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
                    //name: "VCB 평균점수",
                    name: `${spgName} 평균점수`,
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
                    { text: (checkGroupValue == null) ? "" : ((checkGroupValue.length < 1) || !checkGroupValue[0].hasOwnProperty("checkGroupName")) ? "" : checkGroupValue[0].checkGroupName, color: "black" },
                    { text: (checkGroupValue == null) ? "" : ((checkGroupValue.length < 2) || !checkGroupValue[1].hasOwnProperty("checkGroupName")) ? "" : checkGroupValue[1].checkGroupName, color: "black" },
                    { text: (checkGroupValue == null) ? "" : ((checkGroupValue.length < 3) || !checkGroupValue[2].hasOwnProperty("checkGroupName")) ? "" : checkGroupValue[2].checkGroupName, color: "black" },
                    { text: (checkGroupValue == null) ? "" : ((checkGroupValue.length < 4) || !checkGroupValue[3].hasOwnProperty("checkGroupName")) ? "" : checkGroupValue[3].checkGroupName, color: "black" },
                    { text: (checkGroupValue == null) ? "" : ((checkGroupValue.length < 5) || !checkGroupValue[4].hasOwnProperty("checkGroupName")) ? "" : checkGroupValue[4].checkGroupName, color: "black" },
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
                        value: [
                            (checkGroupValue == null) ? -1 : ((checkGroupValue.length < 1) || !checkGroupValue[0].hasOwnProperty("value")) ? -1 : checkGroupValue[0].value,
                            (checkGroupValue == null) ? -1 : ((checkGroupValue.length < 2) || !checkGroupValue[1].hasOwnProperty("value")) ? -1 : checkGroupValue[1].value,
                            (checkGroupValue == null) ? -1 : ((checkGroupValue.length < 3) || !checkGroupValue[2].hasOwnProperty("value")) ? -1 : checkGroupValue[2].value,
                            (checkGroupValue == null) ? -1 : ((checkGroupValue.length < 4) || !checkGroupValue[3].hasOwnProperty("value")) ? -1 : checkGroupValue[3].value,
                            (checkGroupValue == null) ? -1 : ((checkGroupValue.length < 5) || !checkGroupValue[4].hasOwnProperty("value")) ? -1 : checkGroupValue[4].value,
                        ],
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
                        value: [
                            (checkAvgValue == null) ? -1 : ((checkAvgValue.length < 1) || !checkAvgValue[0].hasOwnProperty("value")) ? -1 : checkAvgValue[0].value,
                            (checkAvgValue == null) ? -1 : ((checkAvgValue.length < 2) || !checkAvgValue[1].hasOwnProperty("value")) ? -1 : checkAvgValue[1].value,
                            (checkAvgValue == null) ? -1 : ((checkAvgValue.length < 3) || !checkAvgValue[2].hasOwnProperty("value")) ? -1 : checkAvgValue[2].value,
                            (checkAvgValue == null) ? -1 : ((checkAvgValue.length < 4) || !checkAvgValue[3].hasOwnProperty("value")) ? -1 : checkAvgValue[3].value,
                            (checkAvgValue == null) ? -1 : ((checkAvgValue.length < 5) || !checkAvgValue[4].hasOwnProperty("value")) ? -1 : checkAvgValue[4].value,
                        ],
                        //name: "VCB 평균점수",
                        name: `${spgName} 평균점수`,
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

    // 우측 메뉴 이벤트
    function resultOpen(e) {
        const targetElement = e.target as unknown as HTMLElement;
        const ehcScoreBox = targetElement.closest(".ehc__score");
        if (CUTIL.isnull(ehcScoreBox)) return;

        // clog("resultOpen : " + ehcScoreBox.className);
        if (ehcScoreBox.classList.contains("close")) {
            ehcScoreBox.classList.remove("close"); // open
        } else {
            ehcScoreBox.classList.add("close"); // close
        }
    }


    // by sjpark 20220708
    function handleResultOpen(e, openVal) {
        clog("IN ITEMCHECKRESULT : handleResultOpen : " + openVal);
        setParentResultOpen(!openVal);
    }

    return (
        <>
            {/*<!--점검결과 : ehc__score / e-HC Status 선택에 따른 클래스 변경,컬러변경됨(ehc-b/ehc-p/ehc-a/ehc-n)-->*/}
            <article className={`box ehc__score ${(stepName === "NORMAL") ? "ehc-n" : (stepName === "PREMIUM") ? "ehc-p" : (stepName === "ADVANCED") ? "ehc-a" : "ehc-b"} ${(isOpen) ? "" : "close"}`}>
                <div className="box__header"  >
                    <p className="box__title">
                        {/*<button type="button" className="btn btn-box " onClick={(e) => resultOpen(e)}><span className="hide">메뉴접기펼치기</span></button>*/}
                        <button type="button" className="btn btn-box " onClick={(e) => handleResultOpen(e, isOpen)}>
                            <span className="hide">메뉴접기펼치기</span>
                        </button>
                        {/*<!--220622, 여기 이렇게 전체적으로 수정요청-->*/}
                        <span className="cate">{stepName} <span>e-HC</span></span>
                    </p>
                    <div className="box__etc"><span className="date">{CUTIL.utc2time("YYYY-MM-DD", updatedTime)}</span></div>
                </div>
                <div className="box__body">
                    <div className="ehc__info">
                        <p className="ehc__name">{itemName}</p>
                        <ul onClick={(e) => onClickEhcInfo(e)}>
                            <li><span>제조번호</span><span>{serialNo}</span></li>
                            <li><span>담당자</span><span>{responsible}</span></li>
                            <li><span>위치</span><span>{roomName}</span></li>
                        </ul>
                    </div>
                    {/* <!--정성평가 : ehc__score / e-HC Status 선택에 따른 클래스 변경,컬러변경됨(ehc-b/ehc-p/ehc-a/ehc-n)--> */}
                    <div className="ehc__detail ehc__result">
                        <div className="result__txt">
                            {/* <!--점수에따라 종합접수 부분 아이콘 변경됨(3가지) : 정상(기본) / 주의(클래스 caution 추가) / 경고(클래스 warning 추가)--> */}
                            {/* SAFETY 이외 아이콘 노출로 변경 - 20220618 */}
                            <p className={
                                /*(alarmDto.alarmStatus == "SAFETY") ? "tit " : "tit caution"*/
                                `tit ${(alarmDto != null) ? (alarmDto.alarmStatus == "SAFETY") ? "" : "caution" : "caution"}`
                            }><span>종합점수</span></p>
                            <p className="score">{totalScore}</p>
                            <p className="txt">{(alarmDto != null) ? alarmDto.description : "-------------------------------------------X"}</p>
                            {/* <input type="file" /> */}
                        </div>
                        <div className="scrollH">
                            <div >
                                <ECharts className="ehc__chart" option={option} />
                            </div>
                            {/* filter 영역에 맞는 list 제공 */}
                            {((checkGroupValue != null) && (checkValueList != null)) && checkGroupValue.filter(group => checkValueList.hasOwnProperty(group.checkGroupName)).map((name, idx) => (
                                < div className="ma__score" key={idx} >
                                    <p className="tit" >{name.checkGroupName}</p>
                                    <ul className="score__info">
                                        {/*checkValueList[checkGroupValue[idx].checkGroupName].map((list) => (*/}
                                        {/*{checkValueList[name.checkGroupName].map((list) => (*/}
                                        {((checkValueList != null) && (checkValueList.hasOwnProperty(name.checkGroupName))) && checkValueList[name.checkGroupName].map((list) => (
                                            <li key={list.checkItemId} className={(list.isChecked) ? "disabled" : ""}>
                                                <p className="tit" ><span>{list.checkItemName}</span></p>
                                                <ul className={(list.isChecked) ? "icon-score" : "icon-score score" + ++list.value}>
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
                                <button type="button" className="btn-share"><span>진단결과 공유</span></button>
                            </li>
                            <li>
                                {/* <!--220616, data-pop, class추가 --> */}
                                <button type="button" className="btn-checkpop" data-pop="pop-check" onClick={(e) => onClickReportDownload(e, reportId)}><span>PDF Download</span></button>
                            </li>
                        </ul>
                    </div>
                    {/*<!--재진행 팝업 220616 -->*/}
                    <div id="pop-reload" className="popup-boxin">
                        <div className="page-detail">
                            <div className="popup__head">
                                <h1>Basic 재진행</h1>
                                <button className="btn btn-close"><span className="hide">닫기</span></button>
                            </div>
                            <div className="popup__body">
                                <p className="fontMedium">Basic 점검을 재진행하시겠습니까?</p>
                                <p>이전 점검 내용은 사라지게 됩니다.</p>
                            </div>
                            <div className="popup__footer">
                                <button type="button" className="bg-gray"><span>취소</span></button>
                                <button type="button" className="close"><span>확인</span></button>
                            </div>
                        </div>
                    </div>
                    {/*<!-- //재진행 팝업 -->*/}
                    {/*<!--Premium 정밀진단 요청 팝업 220616 -->*/}
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
                    {/*<!-- //Premium 정밀진단 요청 팝업 -->*/}
                </div>
            </article>
        </>
    )
}

export default ItemCheckResultTest;