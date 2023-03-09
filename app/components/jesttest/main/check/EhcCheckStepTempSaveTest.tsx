/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-05-25
 * @brief EHP Status 컴포넌트
 *
 ********************************************************************/
import React, { useEffect, useState, useRef } from "react";
//
import { useAsync } from "react-async";
// recoli & state
import { useRecoilValue, useSetRecoilState, useResetRecoilState } from "recoil";
import { userInfoState, authState, } from '../../../../recoil/userState';
import {
  itemState,
  beforeItemState,
  nextItemState,
  assessmentInfoType,
  assessmentListState,
  doneAssessmentState,
  getCheckValueDtoList,
  checkStep,
  curCheckValueDto,
  getTempSave,
  getCheckDone,
  getStepDone
} from '../../../../recoil/assessmentState';
//utils
import clog from "../../../../utils/logUtils";
import * as HttpUtil from "../../../../utils/api/HttpUtil";
import * as CUTIL from "../../../../utils/commUtils";
//
import $ from "jquery";
//
import { useTrans } from "../../../../utils/langs/useTrans";
//
import EhcCheckStepTempSave from "./EhcCheckStepTempSaveTest";
import EhcCheckResult from "../../../main/checklist/EhcCheckResult";
import EhcCheckLast from "./EhcCheckLastTest";
import EhcCheckStep from "./EhcCheckStepTest";
//  import EhcCheckStep from "./EhcCheckStep";
//  import EhcCheckLast from "./EhcCheckLast";
//  import EhcCheckResult from "./EhcCheckResult";


/**
 * @brief EHP Status 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */
function EhcCheckStepTempSaveTest(props) {
  const userInfo = useRecoilValue(userInfoState);
  const curItem = useRecoilValue(itemState);
  const setCurItem = useSetRecoilState(itemState);
  const nextItem = useRecoilValue(nextItemState);
  const beforeItem = useRecoilValue(beforeItemState);
  const itemCheckList = useRecoilValue(assessmentListState);
  const setRecoilItemCheckList = useSetRecoilState(assessmentListState);
  const tsItemCheckListInfo = useRecoilValue(doneAssessmentState);
  const tsItemCheckList = useRecoilValue(getCheckValueDtoList);
  const setRecoilTsItemCheckListInfo = useSetRecoilState(doneAssessmentState);
  const resetRecoilTsItemCheckListInfo = useResetRecoilState(doneAssessmentState);
  const curCheckStep = useRecoilValue(checkStep);
  const setCurCheckStep = useSetRecoilState(checkStep);
  const isTempSave = useRecoilValue(getTempSave);
  const checkDone = useRecoilValue(getCheckDone);
  const stepDone = useRecoilValue(getStepDone);
  //
  const { company, zone, room, spg } = props.curTreeData;
  //
  const [popupContinue, setPopupContinue] = useState("none");
  //
  const t = useTrans();
  //
  useEffect(() => {
    getItemCheckList(curItem.ehcType, curItem.itemId);
    clog("IN EHC CHECK : assessmentId : " + JSON.stringify(curItem.assessment.assessmentId));
    if (!CUTIL.isnull(curItem.assessment.assessmentId)) {
      //if ( (curItem.assessment.assessmentId > -1)&&(!CUTIL.isnull(curItem.assessment.assessmentId)) ) {
      getTempItemCheckList(curItem.assessment.assessmentId);
    } else {
      clog("IN EHC CHECK : RESET TSITEMCHECKLISTINFO : " + JSON.stringify(curItem.assessment.assessmentId));
      resetRecoilTsItemCheckListInfo();
    }
  }, [curItem]);

  useEffect(() => {
    if (tsItemCheckList.length > 0) { // setPopupContinue start
      //if ( (tsItemCheckList[0].assessmentId > -1) ) {
      clog("IN EHCCHECK : setPopupContinue : ID : " + curItem.itemId + " : B : " + beforeItem.itemId + " : N : " + nextItem.itemId);
      clog("IN EHCCHECK : setPopupContinue : AID : " + curItem.assessment.assessmentId
        + " : B : " + beforeItem.assessment.assessmentId
        + " : N : " + nextItem.assessment.assessmentId);
      // assessementId가 없는 경우, 처음 저장 후, curItem->assessmentId를 갱신한다.
      // 
      if ((!stepDone) && (tsItemCheckList[0].assessmentId > -1)) {
        clog("IN EHCCHECK : setPopupContinue : INNER : " + stepDone + " : " + tsItemCheckList[0].assessmentId);
        //if ( !CUTIL.isnull(nextItem.assessment.assessmentId) && (nextItem.assessment.assessmentId > -1) ) {
        if ((curItem.itemId == nextItem.itemId) && (curItem.assessment.assessmentId == nextItem.assessment.assessmentId)) {
          setPopupContinue("block");
        }
      }
    }
  }, [tsItemCheckList]);

  clog("IN EHCCHECK : CHECK DONE : " + itemCheckList.length + " / " + curCheckStep + " / " + checkDone);

  async function getItemCheckList(curEhcType, itemId) {
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      httpMethod: "GET",
      appPath: "/api/v2/checksheet/step/spg/itemAll",
      appQuery: {
        stepName: curEhcType,
        itemId: itemId,
      },
      watch: curEhcType + itemId
    });
    if (data) {
      if (data.codeNum == 200) {
        clog("IN EHC CHECK : getItemCheckList : " + JSON.stringify(data.body.length));
        setRecoilItemCheckList(data.body);
      } else { // api if
        // need error handle
      }
    }
    //return data;
  }

  async function getTempItemCheckList(assessmentId) {
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "GET",
      "appPath": "/api/v2/assessment/values",
      "appQuery": {
        assessmentId: assessmentId,
      },
      watch: assessmentId
    });
    if (data) {
      if (data.codeNum == 200) {
        clog("IN EHC CHECK : getTempItemCheckList : " + JSON.stringify(data.body.checkValueDtoList.length));
        setRecoilTsItemCheckListInfo(data.body);
      } else { // api if
        // need error handle
      }
    }
    //return data;
  }

  async function deleteTempItemCheckList(assessmentId) {
    clog("IN EHC CHECK : deleteTempItemCheckList : ");
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "DELETE",
      "appPath": "/api/v2/assessment/values",
      "appQuery": {
        assessmentId: assessmentId,
      },
      watch: assessmentId
    });
    if (data) {
      if (data.codeNum == 200) {
        clog("IN EHC CHECK : deleteTempItemCheckList");
      } else { // api if
        // need error handle
      }
    }
    //return data;
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

  function onClickComment(e) {
    e.preventDefault();
    //var btnComment = (e.target.tagName==="BUTTON")?e.target:e.currentTarget;
    var btnComment = document.querySelector(".btn-comment");
    var divPopupBoxin = document.querySelector(".popup-boxin");
    var btnCommentClose = document.querySelector(".popup-boxin .btn-close");

    clog("btnComment : " + btnComment.tagName + " : CLASS : " + btnComment.className);
    if (!CUTIL.isnull(btnComment)) btnComment.classList.toggle("on");
    if (!CUTIL.isnull(divPopupBoxin)) divPopupBoxin.classList.toggle("on");
    if (CUTIL.isnull(btnCommentClose)) return;
    btnCommentClose.addEventListener("click", function (e) {
      onClickComment(e); // 재귀호출
    });
  }

  function onClickSave(e) {
    alert("commet save and close!!");
    onClickComment(e);
  }

  // ehc chekcer 임시저장 여부 체크
  document.addEventListener("click", function (e) {
  });


  function handleCurCheckStep(val) {
    clog("IN EHC CHECK : handleCurCheckStep : " + val);
    //setCheckDone(false);
    setCurCheckStep(val);
  }

  function hadlePopupContinue(val) {
    if (val) { // 이어서 하기
      setCurCheckStep(tsItemCheckList.length);
    } else { // 처음부터 하기
      // 선택된 ITEM의 assessmentID 초기화 필요    
      deleteTempItemCheckList(curItem.assessment.assessmentId);
      resetRecoilTsItemCheckListInfo();
      setCurCheckStep(0);

      const tmpCurItem = {
        ehcType: curItem.ehcType,
        itemId: curItem.itemId,
        itemName: curItem.itemName,
        serialNo: curItem.serialNo,
        itemStatus: curItem.itemStatus,
        itemStep: curItem.itemStep,
        responsible: curItem.itemStep,
        assessment: {
          assessmentId: null,
          totalComment: null,
          reportId: null,
          updatedTime: null,
          isTempSave: null
        }
      }
      //setCurItem(tmpCurItem);
    }
  }

  return (
    <>
      {/*<!--평가기준 : ehc__score / e-HC Status 선택에 따른 클래스 변경,컬러변경됨(ehc-b/ehc-p/ehc-a/ehc-n)-->*/}
      {/*<article id="ehc_checker" className={(isLoading)?"box loading__box":"box ehc__score ehc-b"}>*/}
      <article id="ehc_checker" className={"box ehc__score ehc-b"}>
        <div className="box__header">
          <p className="box__title"><span className="cate">{curItem.ehcType}</span> e-HC</p>
          <div className="box__etc"><span className="date">{CUTIL.curformattime("YYYY-MM-DD")}</span></div>
        </div>
        <div className="box__body">
          <div className="ehc__info">
            <p className="ehc__name">{curItem.itemName}</p>
            <ul onClick={(e) => onClickEhcInfo(e)}>
              <li><span>{t("FIELD.시리얼번호")}</span><span>{curItem.serialNo}</span></li>
              <li><span>{t("FIELD.담당자")}</span><span>{curItem.responsible}</span></li>
              <li><span>{t("FIELD.위치")}</span><span>{room.roomName}</span></li>
            </ul>
          </div>
          {
            (stepDone)
              ? <EhcCheckResult />
              : (isTempSave)
                ? <EhcCheckStepTempSave
                  isTempSave={isTempSave}
                />
                : (checkDone)
                  ? <EhcCheckLast
                  />
                  : <EhcCheckStep
                  />
          }

          {(!isTempSave) && <PopupContinue
            popupToggle={popupContinue}
            setPopupToggle={setPopupContinue}
            setPopupVal={hadlePopupContinue}
          />}
        </div>
      </article>
    </>
  )
}

export default EhcCheckStepTempSaveTest;

function PopupContinue(props) {
  const srcToggleVal = props.popupToggle;
  const setPopupToggle = props.setPopupToggle;
  const setParentPopupVal = props.setPopupVal;
  const [toggleVal, setToggleVal] = useState(srcToggleVal);
  const [popupObj, setPopupObj] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    setPopupObj(ref.current);
  });

  useEffect(() => {
    setToggleVal(srcToggleVal);
  }, [srcToggleVal]);

  function onClickClose(e) {
    (popupObj) && popupObj.style.setProperty("display", "none");
    setPopupToggle("none");
  }

  function onClickTrue(e) {
    setParentPopupVal(true);
    onClickClose(e);
  }

  function onClickFalse(e) {
    setParentPopupVal(false);
    onClickClose(e);
  }

  return (
    <>
      {/*<!--220610 안내창 팝업 : 공통... 박스안에만 뜨는 단순문구 안내창 팝업 > box__body클래스의 제일 아래부분에 넣어주시면 됩니다.  -->*/}
      {/*<div id="pop-basic" className="popup-boxin popup-basic" style={{display:`${toggleVal}`}}>*/}
      <div ref={ref} id="pop-basic" className="popup-boxin popup-basic" style={{ display: `${toggleVal}` }}>
        <div className="page-detail">
          <div className="popup__head">
            <h1>e-HC</h1>
            <button className="btn btn-close" onClick={(e) => onClickClose(e)}><span className="hide">닫기</span></button>
          </div>
          <div className="popup__body">
            <p>임시 저장된 내용이 있습니다.<br />이어서 진행하시겠습니까?</p>
          </div>
          <div className="popup__footer">
            <button type="button" className="bg-gray" onClick={(e) => onClickFalse(e)}><span>다시 시작</span></button>
            <button type="button" onClick={(e) => onClickTrue(e)}><span>불러오기</span></button>
          </div>
        </div>
      </div>
      {/*<!--//220610 안내창 팝업 -->*/}
    </>
  )
}

