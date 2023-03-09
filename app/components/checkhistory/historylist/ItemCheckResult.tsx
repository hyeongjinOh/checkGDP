/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author HyeongJin O
 * @contact hjoh@detech.co.kr
 * @date 2022-07-11
 * @brief EHP 진단점검 Report - 진단점검 Report 결과 개발
 *
 ********************************************************************/
import React, { useState, useEffect, useRef } from "react";
import ECharts, { EChartsReactProps } from 'echarts-for-react';
//
import { useAsync } from "react-async";
// recoli & state
import { useRecoilValue, useSetRecoilState, useResetRecoilState } from "recoil";
import { userInfoState, userInfoLoginState, authState, } from '../../../recoil/userState';
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
} from '../../../recoil/assessmentState';
//
import { useTrans } from "../../../utils/langs/useTrans";
//utils
import * as HttpUtil from "../../../utils/api/HttpUtil";
import * as CUTIL from "../../../utils/commUtils";
import clog from "../../../utils/logUtils"
import * as CONST from "../../../utils/Const";
//
import $ from "jquery";
//components
import Pagination from "../../common/pagination/Pagination"

/**
 * @brief EHP 진단점검 Report 결과 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function ItemCheckResult(props) {
  //trans
  const t = useTrans();
  //const userInfo = useRecoilValue(userInfoState);
  const userInfo = useRecoilValue(userInfoLoginState);
  //
  const curItem = useRecoilValue(itemState);
  const setRecoilCurItem = useSetRecoilState(itemState);
  const resetRecoilTsItemCheckListInfo = useResetRecoilState(doneAssessmentState);
  const setCurCheckStep = useSetRecoilState(checkStep);
  const setRecoilTempCheckVal = useSetRecoilState(tempCheckValue);
  const resetRecoilTempCheckVal = useResetRecoilState(tempCheckValue);
  //
  const [checkResult, setCheckResult] = useState(null);
  const { company, zone, subZone, room, spg } = props.curTreeData;
  //
  const isOpen = (props.hasOwnProperty("isOpen")) ? props.isOpen : false;
  const setParentResultOpen = props.setResultOpen;
  const item = props.curHistoryInfo
  //
  const assessmentId = props.assessmentId;
  // clog("IN ITEMCHECKHISTORYRESULT : assessmentId : " + assessmentId + " : OPEN : " + isOpen);
  const [checkName, setCheckName] = useState("");

  const [shareOn, setShareOn] = useState(false);
  //점검결과 API\  //  clog("IN EHCCHEKRESULT : INIT : " + curItem.ehcType);  //  clog("IN EHCCHEKRESULT : INIT : " + curItem.assessment.assessmentId);
  const chartWidth = window.innerWidth / 8 * 0.781;
  const [isMobile, setIsMobile] = useState(false);
  const mobileRef = useRef(null); // Mobile Check용
  useEffect(() => { // resize handler
    // Mobile 체크
    function handleResize() {
      if (CUTIL.isnull(mobileRef)) return;
      const mobileTag = mobileRef.current;
      if ((mobileTag.clientWidth <= 430)) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  });
  useEffect(() => { // re-rendering mobile check
    if (CUTIL.isnull(mobileRef)) return;
    const mobileTag = mobileRef.current;
    if (!CUTIL.isnull(mobileTag)) {

      if ((mobileTag.clientWidth <= 430)) {
        setIsMobile(true);

      } else {
        setIsMobile(false);
      }
    }
  });
  
  const { data: data, isLoading } = useAsync({
    promiseFn: HttpUtil.PromiseHttp,
    //deferFn: HttpUtil.Http,
    httpMethod: "GET",
    appPath: `/api/v2/assessment/${assessmentId}`,
    //appPath: '/api/v2/assessment/66',
    appQuery: {},
    userToken: userInfo.loginInfo.token,
    watch: assessmentId
  });

  useEffect(() => {
    if (data) {
      // clog("IN EHCRESULT : RETURN : " + JSON.stringify(curItem));
      if (data.codeNum == CONST.API_200) {
        //clog("IN EHCRESULT : RETURN : " + JSON.stringify(data.body));
        setCheckResult(data.body);
        // setComment(data.body.alarmDto.description)
      } else { // api if
        alert(data.errorList.map((err) => (err.msg)))
      }
    }
  }, [data])
  // PDF 다운로드
  async function onClickReportDownload(e, reportId) {
    //alert("selected-data : " + selectedPeriod);
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "GET",
      "appPath": `/api/v2/report/${reportId}`,
      "appQuery": {
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        clog("IN COMUTILS : GET FILEDOWNLOAD : " + JSON.stringify(data));
        //HttpUtil.fileDownload(`${item.itemReportDtoOut.itemName}_진단점검리포트.PDF`, data.body.fileLink);
        //20221020 jhpark 수정, pdf 이슈 해결 안되면 다시 수정 예정
        HttpUtil.fileDownload(`${item.itemReportDtoOut.itemName}_진단점검리포트.PDF`, data.body.fileLink);
      } else {

      }
    }
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
      /*      data: [
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
           ], */
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
          fontSize: (isMobile) ? 12 : 16
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

  function onSharePop(e) {
    if (shareOn === false) {
      setShareOn(true);
    }
  }


  return (
    <>
      {/*<!--점검결과 : ehc__score / e-HC Status 선택에 따른 클래스 변경,컬러변경됨(ehc-b/ehc-p/ehc-a/ehc-n)-->*/}
      <article ref={mobileRef} className={`box ehc__score ${(stepName === "NORMAL") ? "ehc-n" : (stepName === "PREMIUM") ? "ehc-p" : (stepName === "ADVANCED") ? "ehc-a" : "ehc-b"} ${(isOpen) ? "" : "close"}`}>
        <div  className="box__header"  >
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
              <li><span>{t("FIELD.시리얼번호")}</span><span>{serialNo}</span></li>
              <li><span>{t("FIELD.담당자")}</span><span>{responsible}</span></li>
              <li><span>{t("FIELD.위치")}</span><span>{roomName}</span></li>
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
              {/*       {(!saveComment) ?
                 <p className="txt">{(alarmDto != null) ? alarmDto.description : "-------------------------------------------X"}</p>
                 :
                 <p className="txt">{saveComment}</p>
               } */}
              {/* <input type="file" /> */}
              {/* <!--수정 버튼 추가(필요없을때는 빼심되여~), 220809 --> // by 20220819 hjo - Role: ROLE_ENGINEER 시 노출*/}
              {/*  {((userInfo.loginInfo.role == "ROLE_ENGINEER") && (stepName !== "BASIC")) &&
                 <button type="button" className="btn-edit" data-pop="pop-edit" onClick={(e) => onClickComment(e)} ><span className="hide">수정</span></button>
               } */}
            </div>
            <div className="scrollH">
              <div>
                <div className="chart" style={{ "width": "100%", "margin": "0 auto" }} >
                  <div id="radar" style={{ "height": "300px" }} >
                    <ECharts option={option} className="bottom  h300" />
                  </div>
                </div>
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
                        <ul className={(list.isChecked) ? "icon-score" : "icon-score score" + ((list.value == 0) ? 1 : (list.value == 1) ? 2 : (list.value == 2) ? 3 : (list.value == 3) ? 4 : (list.value == 4) ? 5 : "")}>
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
                <button type="button" className="btn-share" onClick={(e) => onSharePop(e)}><span>{t("LABEL.진단결과공유")}</span></button>
              </li>
              <li>
                {/* <!--220616, data-pop, class추가 --> */}
                <button type="button" className="btn-checkpop" data-pop="pop-check" onClick={(e) => onClickReportDownload(e, reportId)}><span>PDF Download</span></button>
              </li>
            </ul>
          </div>

          {/*<!-- //Premium 정밀진단 요청 팝업 -->*/}
          {/* <!--220809 수정 팝업 --> */}
          {/* <UpdataPop /> */}
          {/* <!-- //수정 팝업 --> */}
          {/* 진단결과 공유  팝업*/}
          <SharePop
            shareOn={shareOn}
            setShareOn={setShareOn}
            reportId={reportId}
            item={item}
          />
        </div>
      </article>
    </>
  )
}

export default ItemCheckResult;


function SharePop(props) {
  //trans
  const t = useTrans();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //props
  const shareOn = props.shareOn;
  const setShareOn = props.setShareOn
  const reportId = props.reportId
  const item = props.item
  //
  const [toMails, setToMails] = useState("");
  const [errorList, setErrorList] = useState([]);


  function shareClose(e) {
    if (shareOn === true) {
      setShareOn(false);
    }
    setToMails("");
  }

  function handleSetUserId(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "toMails"))
    )
    setToMails(e.target.value);
  }
  // fileLInk API
  async function emailShare(e) {
    if (CUTIL.isnull(reportId)) return;

    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "GET",
      "appPath": `/api/v2/report/${reportId}`,
      "appQuery": {
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        const fileLink = `${window.location.origin}${CONST.URL_COMM_PDFVIEWER}?${CONST.STR_PARAM_DATA + CONST.STR_PARAM_PDFNM}=${item.itemReportDtoOut.serialNo}_진단점검리포트.PDF&${CONST.STR_PARAM_DATA + CONST.STR_PARAM_PDFID}=${data.body.fileLink}`
        linkShare(fileLink)
      }
    }
  }

  async function linkShare(fileLink) {
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": `/api/v2/report/email`,
      "appQuery": {
        toMails: [toMails],
        fileLink: fileLink,
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {

      if (data.codeNum == CONST.API_200) {
        alert("메일 전송이 완료되었습니다.");
        setShareOn(false);
        setToMails("")
      } else {
        if (toMails == "") {
          setErrorList([{ field: "toMails", msg: "필수 항목입니다." }]);
        } else {
          setErrorList(data.body.errorList);
        }
      }
    }

  }

  return (
    <>
      {/* <!--진단결과 공유 팝업 221011 --> */}
      <div id="pop-share" className={`popup-boxin ${(shareOn) ? "on" : ""}`}>
        <div className="page-detail">
          <div className="popup__head">
            <h1>진단결과 공유</h1>
            <button className="btn btn-close" onClick={(e) => shareClose(e)}><span className="hide">닫기</span></button>
          </div>
          <div className="popup__body">
            <ul className="form__input w85p">
              <li className="center">
                <p className="tit">E-Mail</p>
                <div className="input__area w260">
                  <input type="text" id="userId0" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.공유하실이메일주소")])}
                    className={(errorList.filter(err => (err.field === "toMails")).length > 0) ? "input-error" : ""}
                    value={toMails} onChange={(e) => handleSetUserId(e)} />
                  <p className="input-errortxt">{errorList.filter(err => (err.field === "toMails")).map((err) => err.msg)}</p>
                  {/*   <input type="text" placeholder="공유하실 이메일 주소를 입력하세요." className="input-error" />
                  <p className="input-errortxt">올바르지 않은 이메일 주소입니다.</p> */}
                </div>
              </li>
            </ul>
          </div>
          <div className="popup__footer">
            <button type="button" className="bg-gray" onClick={(e) => shareClose(e)}  ><span>{t("LABEL.취소")}</span></button>
            <button type="button" className="close" onClick={(e) => emailShare(e)} ><span>{t("LABEL.확인")}</span></button>
          </div>
        </div>
      </div>
      {/* <!-- //진단결과 공유 팝업 --> */}
    </>
  )
}


/* function UpdataPop(props){
  
  // by 20220819 hjo
   const [resultPutPop, setResultPutPop] = useState(false);
  const [comment, setComment] = useState<string>("");
  const [saveComment, setSaveComment] = useState<string>(""); 
  // by hjo 20220819 
   function onClickComment(e) {
    e.preventDefault();
    if (resultPutPop === false) {
      setResultPutPop(true);
    }
  }
 
  function close(e) {
    if (resultPutPop === true) {
      setResultPutPop(false);
    }
  }
  async function onClickSaveComment(e) {
    onClickComment(e); // for layer close
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": `/api/v2/assessment/alarmmsg`,
      "appQuery": {
        "assessmentId": assessmentId,
        "alarmMessage": comment
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        setSaveComment(data.body.alarmMessage);
        close(e)
      }
    }
  } 
  return(
    <>
       <div id="pop-edit" className={`pop-edit popup-boxin ${(resultPutPop) ? "on" : ""}`} >
            <div className="page-detail">
              <div className="popup__head">
                <h1>Edit Message</h1>
                <button className="btn btn-close" onClick={(e) => close(e)}><span className="hide">닫기</span></button>
              </div>
              <div className="popup__body">
                <p className="txtnum">{comment.length} / 120</p>
                <textarea id="text" placeholder="의견을 입력하세요." value={comment}
                  onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                  onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, setComment)}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>
               <!--220610, memo__txt 태그 의견확인일 경우 노출--> 
               <!-- <p className="memo__txt">현충일(顯忠日)은 나라를 위해 희생한 순국선열(殉國先烈)과 전몰(戰歿)한 장병들의 충렬을 기리고 얼을 위로하기 위하여 지정된 대한민국의 중요한 기념일이다.중요한 기념일이다.이다.얼을 위로하기 위하여 지정된 대한민국의 중요한 기념일이다.중요한 기념일이다.</p> --> 
              <div className="popup__footer">
                <button type="button" onClick={(e) => onClickSaveComment(e)}><span>저장</span></button>
                 <!--220610, 삭제, 수정버튼 의견확인일 경우 노출--> 
                <!-- <button type="button" class="bg-gray"><span>삭제</span></button>
                 <button type="button"><span>수정</span></button>
              </div>
            </div>
          </div>
    </>
  );
} */