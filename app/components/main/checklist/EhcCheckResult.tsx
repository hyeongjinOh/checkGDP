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
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import { userInfoState, userInfoLoginState, authState, } from '../../../recoil/userState';
import {
  checkStep,
  doneAssessmentState,
  itemState,
  tempCheckValue,
} from '../../../recoil/assessmentState';
//utils
import clog from "../../../utils/logUtils";
import * as HttpUtil from "../../../utils/api/HttpUtil";
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const";
//
import $ from "jquery";


/**
 * @brief EHP 진단평가결과(카드) 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */

function EhcCheckResult(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);

  const curItem = useRecoilValue(itemState);
  const setRecoilCurItem = useSetRecoilState(itemState);
  const resetRecoilTsItemCheckListInfo = useResetRecoilState(doneAssessmentState);
  const setCurCheckStep = useSetRecoilState(checkStep);
  const resetCurCheckStep = useResetRecoilState(checkStep);

  const setRecoilTempCheckVal = useSetRecoilState(tempCheckValue);
  const resetRecoilTempCheckVal = useResetRecoilState(tempCheckValue);
  //props
  const { company, zone, subZone, room, spg } = props.curTreeData;
  const setStatusReload = props.setStatusReload;
  //
  const [checkResult, setCheckResult] = useState(null);
  const [reloadOn, setRloadOn] = useState(false); // 재진행 팝업
  const [requestOn, setRequestOn] = useState(false); // 점검요청 팝업
  const [shareOn, setShareOn] = useState(false); // 공유 팝업
  const [link, setLink] = useState("");
  const [request, setRequst] = useState("")

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


  //점검결과 API
  clog("IN EHCCHEKRESULT : INIT : " + curItem.ehcType);
  clog("IN EHCCHEKRESULT : INIT : " + curItem.assessment.assessmentId);

  const { data: data, isLoading } = useAsync({
    promiseFn: HttpUtil.PromiseHttp,
    //deferFn: HttpUtil.Http,
    httpMethod: "GET",
    appPath: `/api/v2/assessment/${curItem.assessment.assessmentId}`,
    appQuery: {},
    userToken: userInfo.loginInfo.token,
  });

  useEffect(() => {
    if (data) {
      clog("IN EHCRESULT : RETURN : " + JSON.stringify(curItem.ehcType));
      if (data.codeNum == 200) {
        clog("IN EHCRESULT : RETURN : " + JSON.stringify(data.body));
        setCheckResult(data.body);
      } else { // api if
      }
    }
  }, [data])


  // result 재진행 팝업창 열기
  function rerunPopOpen(e) {
    setRloadOn(true);
  }

  // premium 팝업창 열기
  function onClickPremiumOpen(e) {
    setRequestOn(true);
  }


  async function onSharePop(e) {
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "GET",
      "appPath": `/api/v2/report`,
      "appQuery": {
        assessmentId: curItem.assessment.assessmentId
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        const fileLink = `${window.location.origin}${CONST.URL_COMM_PDFVIEWER}?${CONST.STR_PARAM_DATA + CONST.STR_PARAM_PDFNM}=${curItem.serialNo}_진단점검리포트.PDF&${CONST.STR_PARAM_DATA + CONST.STR_PARAM_PDFID}=${data.body.fileLink}`
        setShareOn(true);
        setLink(fileLink)
      } else {
        alert("리포트 생성 중입니다. 잠시 후 다시 진행 해주세요.")
      }
    }

  }

  //ROLE_ADMIN
  async function itemCheckAccepted(item) {
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": "/api/v2/product/company/zone/subzone/room/panel/item/itemstatus/ACCEPTED",
      appQuery: {
        itemId: item.itemId,
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        // clog("IN PREMIUM : itemCheckAccepted : " + JSON.stringify(data.body));
        alert("Advanced 점검요청이 완료 되었습니다.")
        setRequst(data.data.msg);
        setStatusReload(true);
        //setSavedFiles(data.body);
      } else { // api if
        // need error handle
      }
    }
    //return data;
  }

  // ECahrt , data 반시계 반향으로 적용
  const totalScore = (checkResult == null) ? -1 : (checkResult.hasOwnProperty("totalScore")) ? checkResult.totalScore : -1; // totalAPI
  const alarmDto = (checkResult == null) ? null : (checkResult.hasOwnProperty("alarmDto")) ? checkResult.alarmDto : null; // AlarmAPI
  const checkGroupValue = (checkResult == null) ? null : (checkResult.hasOwnProperty("checkGroupValueDtoList")) ? checkResult.checkGroupValueDtoList : null;
  const checkAvgValue = (checkResult == null) ? null : (checkResult.hasOwnProperty("checkAvgValueDtoList")) ? checkResult.checkAvgValueDtoList : null;
  const checkValueList = (checkResult == null) ? null : (checkResult.hasOwnProperty("checkValueDtoMap")) ? checkResult.checkValueDtoMap : null;
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
      /*  data: [
         {
           //  icon: "image://./static/* 개발 서버 /asset/ 배포용
           icon: "image://./asset/img/icon_legend_gray.png",
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
           icon: "image://./asset/img/icon_legend_red.png",
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
           icon: "image://./asset/img/icon_legend_purple.png",
           //name: "VCB 평균점수",
           name: `${spg.spgName} 평균점수`,
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
            name: `${spg.spgName} 평균점수`,
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
      <div className="ehc__detail ehc__result" ref={mobileRef}>
        <div className="result__txt">
          {/* <!--점수에따라 종합접수 부분 아이콘 변경됨(3가지) : 정상(기본) / 주의(클래스 caution 추가) / 경고(클래스 warning 추가)--> */}
          {/* SAFETY 이외 아이콘 노출로 변경 - 20220618 */}
          <p className={
            /*(alarmDto.alarmStatus == "SAFETY") ? "tit " : "tit caution"*/
            `tit ${(alarmDto != null) ? (alarmDto.alarmStatus == "SAFETY") ? "" : "caution" : "caution"}`
          }><span>종합점수</span></p>
          <p className="score">{totalScore}</p>
          <p className="txt">{(alarmDto != null) ? alarmDto.description : "-------------------------------------------X"}</p>
          {/*    {(!saveComment) ?
             <p className="txt">{(alarmDto != null) ? alarmDto.description : "-------------------------------------------X"}</p>
             :
             <p className="txt">{saveComment}</p>
           } */}
          {/* <input type="file" /> */}
          {/* <!--수정 버튼 추가(필요없을때는 빼심되여~), 220809 --> // by 20220819 hjo - Role: ROLE_ENGINEER 시 노출*/}
          {/* {((userInfo.loginInfo.role == "ROLE_ENGINEER")&&(curItem.ehcType !=="BASIC"))&& 
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
            {/* <!--220616, data-pop추가 --> */}
            <button type="button" className="btn-reload" data-popup="btn-reload" onClick={(e) => rerunPopOpen(e)}><span>재진행</span></button>
            {/* 개발 예정! */}
            <button type="button" className="btn-share" onClick={(e) => onSharePop(e)}><span>진단결과 공유</span></button>
          </li>
          {(curItem.ehcType !== "ADVANCED") &&
            < li >
              {/* <!--220616, data-pop추가 --> */}
              {(alarmDto != null) && (alarmDto.alarmStatus != "SAFETY") && (request.length <= 0) &&
                < button type="button" className={`btn-checkpop ${(curItem.ehcType == "BASIC") ? "bg-green" : (curItem.ehcType == "PREMIUM") ? "bg-yellow" : ""}`}
                  data-pop="pop-check" onClick={(e) => (curItem.ehcType == "BASIC") ? onClickPremiumOpen(e) : itemCheckAccepted(curItem)}>
                  <span>{(curItem.ehcType == "BASIC") ? "Premium" : "Advanced"}  점검 요청</span></button>

              }
            </li>
          }
        </ul>
      </div >
      {/* <!--재진행 팝업 220616 --> */}
      <ReloadPop
        curTreeData={props.curTreeData}
        curItem={curItem}
        setStatusReload={setStatusReload}
        reloadOn={reloadOn}
        setRloadOn={setRloadOn}

      />
      {/* <!-- //재진행 팝업 --> */}
      {/* <!--Premium 정밀진단 요청 팝업 220616  / 220705 page-detail에 w400 클래스--> */}
      <RequestPop
        curItem={curItem}
        requestOn={requestOn}
        setRequestOn={setRequestOn}
        setRequst={setRequst}
        setStatusReload={setStatusReload}
      />
      {/* <!-- //Premium 정밀진단 요청 팝업 --> */}
      {/* <!--220809 수정 팝업 --> */}
      {/* <UpdataPop /> */}
      {/* 진단결과 공유  팝업*/}
      <SharePop
        shareOn={shareOn}
        setShareOn={setShareOn}
        link={link}
      />

      {/* <!-- //수정 팝업 --> */}
      {(alarmDto) && (alarmDto.alarmStatus == "SAFETY") &&
        <NormarPop alarmDto={alarmDto} />
      }
    </>
  )
}

export default EhcCheckResult;

function ReloadPop(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const setRecoilCurItem = useSetRecoilState(itemState);
  const resetRecoilTsItemCheckListInfo = useResetRecoilState(doneAssessmentState);
  const setCurCheckStep = useSetRecoilState(checkStep);
  const resetCurCheckStep = useResetRecoilState(checkStep);
  const resetRecoilTempCheckVal = useResetRecoilState(tempCheckValue);

  //props
  const { company, zone, subZone, room, spg } = props.curTreeData;
  const curItem = props.curItem;
  const setStatusReload = props.setStatusReload;
  const setRloadOn = props.setRloadOn;
  const reloadOn = props.reloadOn;

  // DELETE API
  async function deleteResult(assessmentId) {
    clog("IN EHCCHEKRESULT : deleteResult : " + assessmentId);
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "DELETE",
      "appPath": "/api/v2/assessment/values",
      "appQuery": {
        assessmentId: assessmentId,
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      clog("IN EHCRESULT : deleteResult : " + JSON.stringify(curItem));
      setStatusReload(true);
      setCurCheckStep(0);
      if (data.codeNum == 200) {
        clog("IN EHCRESULT : deleteResult : " + JSON.stringify(data.body));
      } else { // api if
      }
    }
  }

  // 확인 버튼 
  function hadleRerun(item) {
    // 선택된 ITEM의 assessmentID 초기화 필요    
    deleteResult(item.assessment.assessmentId);
    resetRecoilTsItemCheckListInfo();
    //setCurCheckStep(0);
    resetCurCheckStep();

    const tmpCurItem = {
      spgTree: {
        company: company,
        zone: zone,
        subZone: subZone,
        room: room,
        spg: spg
      },
      ehcType: item.ehcType,
      itemId: item.itemId,
      itemName: item.itemName,
      serialNo: item.serialNo,
      itemStatus: item.itemStatus,
      itemStep: item.itemStep,
      responsible: item.responsible,
      assessment: {
        preAssessmentId: item.assessment.preAssessmentId,
        assessmentId: null,
        totalComment: null,
        reportId: null,
        updatedTime: null,
        isTempSave: null
      }
    };
    var inputData = {
      item: item,
      checkVal: {
        assessmentId: null,
        checkItemId: -1,
        checkItemName: "",
        isChecked: false,
        value: "",
        valueType: "",
        comment: "",
        versionNo: ""
      },
      stepDone: false
    };
    setRecoilCurItem(tmpCurItem);
    resetRecoilTempCheckVal();
  }


  // result 재진행 팝업창 닫기
  function rerunPopClose(e) {
    setRloadOn(false)
  }

  return (
    <>
      <div id="pop-reload" className={`popup-boxin ${(reloadOn) ? "on" : ""}`} >
        <div className="page-detail w400">
          <div className="popup__head">
            <h1>{(curItem.ehcType == "BASIC") ? "Basic" : (curItem.ehcType == "PREMIUM") ? "Premium" : "Advanced"} 재진행</h1>
            <button className="btn btn-close" onClick={(e) => rerunPopClose(e)}><span className="hide"  >닫기</span></button>
          </div>
          <div className="popup__body">
            <p className="fontMedium">{(curItem.ehcType == "BASIC") ? "Basic" : (curItem.ehcType == "PREMIUM") ? "Premium" : "Advanced"} 점검을 재진행하시겠습니까?</p>
            <p>이전 점검 내용은 사라지게 됩니다.</p>
          </div>
          <div className="popup__footer">
            <button type="button" className="bg-gray" onClick={(e) => rerunPopClose(e)} ><span>취소</span></button>
            <button type="button" className="close" onClick={(e) => hadleRerun(curItem)}><span>확인</span></button>
          </div>
        </div>
      </div >
    </>
  )

}

function RequestPop(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //props
  const curItem = props.curItem;
  const requestOn = props.requestOn
  const setRequestOn = props.setRequestOn
  const setRequst = props.setRequst;
  const setStatusReload = props.setStatusReload;

  // premium 팝업창 닫기
  function onClickPremiumColse(e) {
    setRequestOn(false)
  }

  //ROLE_USER
  async function itemCheckRequested(item) {
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": "/api/v2/product/company/zone/subzone/room/panel/item/itemstatus/REQUESTED",
      appQuery: {
        itemId: item.itemId,
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        clog("IN PREMIUM : itemCheckRequested : " + JSON.stringify(data.body));
        alert("정밀진단 요청이 완료 되었습니다.");
        setRequestOn(false);
        setRequst(data.data.msg);
        setStatusReload(true);
        //setSavedFiles(data.body);
      } else { // api if
        // need error handle
      }
    }
    //return data;
  }

  return (
    <>
      <div id="pop-check" className={`popup-boxin ${(requestOn) ? "on" : ""}`} >
        <div className="page-detail">
          <div className="popup__head">
            <h1>{(curItem.ehcType == "BASIC") ? "Premium" : (curItem.ehcType == "PREMIUM") ? "Advanced" : null} 정밀진단 요청</h1>
            <button className="btn btn-close" onClick={(e) => onClickPremiumColse(e)}><span className="hide">닫기</span></button>
          </div>
          <div className="popup__body">
            <p className="fontMedium">LS ELECTRIC 전문가가 활선/정전 상태에서 전력설비의 전기적 기계적 성능 점검 및 시험을 진행하고 설비의 정확한 상태를 제공합니다.</p>
            <p>(출장 및 현장 정밀 진단 서비스 비용 발생)</p>
          </div>
          <div className="popup__footer">
            <button type="button" className="bg-gray" onClick={(e) => onClickPremiumColse(e)} ><span>취소</span></button>
            <button type="button" className="close" onClick={(e) => itemCheckRequested(curItem)}><span>확인</span></button>
          </div>
        </div>
      </div>
    </>
  )
}

function SharePop(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //props
  const shareOn = props.shareOn;
  const setShareOn = props.setShareOn
  const reportId = props.reportId
  const item = props.item
  const link = props.link;
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
  async function linkShare(e) {
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": `/api/v2/report/email`,
      "appQuery": {
        toMails: [toMails],
        fileLink: link,
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
                  <input type="text" id="userId0" placeholder="공유하실 이메일 주소를 입력하세요."
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
            <button type="button" className="bg-gray" onClick={(e) => shareClose(e)}  ><span>취소</span></button>
            <button type="button" className="close" onClick={(e) => linkShare(e)} ><span>확인</span></button>
          </div>
        </div>
      </div>
      {/* <!-- //진단결과 공유 팝업 --> */}
    </>
  )
}

function NormarPop(props) {
  const alarmDto = props.alarmDto
  function NomralPopClose(e) {
    const targetElement = e.target as unknown as HTMLElement;
    const popupBox = targetElement.closest(".popup-boxin");
    // if (CUTIL.isnull(filterBox)) return;
    //  clog(flieterLayer);
    // clog("filterOpen : " + filterBox.className);
    if (popupBox.classList.contains("on")) {
      popupBox.classList.remove("on"); // open
    }
  }
  return (
    <>
      {/* <!--70점 이상 시 노말 팝업 --> */}
      <div id="pop-check" className={`popup-boxin ${(alarmDto.alarmStatus == "SAFETY") && "on"}`}>
        <div className="page-detail w400">
          <div className="popup__head">
            <h1>진단점검 결과</h1>
            <button className="btn btn-close " onClick={(e) => NomralPopClose(e)}><span className="hide">닫기</span></button>
          </div>
          <div className="popup__body">
            <p className="fontMedium">진단점검 결과 기준 점수 이상으로 정상(NORMAL) 단계로 이동합니다.</p>
            {/* <p>(출장 및 현장 정밀 진단 서비스 비용 발생)</p> */}
          </div>
          <div className="popup__footer">
            <button type="button" className="close js-close" onClick={(e) => NomralPopClose(e)}><span>확인</span></button>
          </div>
        </div>
      </div>
      {/* <!-- 70점 이상 시 노말 팝업 --> */}
    </>
  );
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
      if (data.codeNum == 200) {
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