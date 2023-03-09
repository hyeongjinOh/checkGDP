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
  assessmentListState,
  doneAssessmentState,
  getCheckValueDtoList,
  checkStep,
  getCurItemCheck,
  getCheckValueDto,
  curCheckValueDto,
  tempCheckValue,
  getCheckDone
} from '../../../../recoil/assessmentState';

//
import { useTrans } from "../../../../utils/langs/useTrans";
//utils
import clog from "../../../../utils/logUtils";
import * as HttpUtil from "../../../../utils/api/HttpUtil";
import * as CUTIL from "../../../../utils/commUtils";
//
import $ from "jquery";


/**
 * @brief EHP Status 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */
function EhcCheckStep(props) {
  const userInfo = useRecoilValue(userInfoState);
  const curItem = useRecoilValue(itemState);
  const setCurItem = useSetRecoilState(itemState);
  const itemCheckList = useRecoilValue(assessmentListState);
  //const setRecoilItemCheckList = useSetRecoilState(assessmentListState);
  const tsItemCheckListInfo = useRecoilValue(doneAssessmentState);
  //const tsItemCheckList = useRecoilValue(getCheckValueDtoList);
  const setRecoilTsItemCheckListInfo = useSetRecoilState(doneAssessmentState);
  const curCheckStep = useRecoilValue(checkStep);
  const setRecoilCurCheckStep = useSetRecoilState(checkStep);
  const curItemCheck = useRecoilValue(getCurItemCheck)
  //const tsCheckVal = useRecoilValue(getCheckValueDto);
  const setRecoilTsCheckVal = useSetRecoilState(curCheckValueDto);
  const resetRecoilTsCheckVal = useResetRecoilState(curCheckValueDto);
  //
  const setRecoilTempCheckVal = useSetRecoilState(tempCheckValue);
  const resetRecoilTempCheckVal = useResetRecoilState(tempCheckValue);
  const checkDone = useRecoilValue(getCheckDone);
  //
  const ingNum = Math.round((curCheckStep + 1) / itemCheckList.length * 100);
  const [isNextable, setIsNextable] = useState(true);
  const [comment, setComment] = useState("");
  const [tsItemCheckList, setTsItemCheckList] = useState(null);
  const [tsCheckVal, setTsCheckVal] = useState({
    assessmentId: -1,
    checkItemId: -1,
    checkItemName: "",
    isChecked: false,
    value: "",
    valueType: "",
    comment: "",
    versionNo: ""
  });
  const [assessmentId, setAssessmentId] = useState(null);
  const [isCheckDisable, setIsCheckDisable] = useState(false);

  useEffect(() => {
    //check 없이 next step 갈때..check된 isNextable 초기화
    setIsNextable(true);
    //setAssessmentId(curItem.assessment.assessmentId);
  }, [curItem, curCheckStep]);

  useEffect(() => {
    clog("IN EHCCHECKSETP : RESET TS LIST --- : " + JSON.stringify(tsItemCheckListInfo.checkValueDtoList.length));

    setTsItemCheckList(tsItemCheckListInfo.checkValueDtoList);
    //setCheckVal(tsItemCheckListInfo.checkValueDtoList[curCheckStep]);
  }, [tsItemCheckListInfo]);

  useEffect(() => {
    clog("IN EHCCHECKSETP : RESET TS VAL : AID : " + curItem.assessment.assessmentId);
    const tsCheckValList = (!CUTIL.isnull(curItem.assessment.assessmentId) && (curItem.assessment.assessmentId > -1))
      ? (tsItemCheckList) ? tsItemCheckList : tsItemCheckListInfo.checkValueDtoList
      : [];

    let tsVal = {
      assessmentId: -1,
      checkItemId: -1,
      checkItemName: "",
      isChecked: false,
      value: "",
      valueType: "",
      comment: "",
      versionNo: ""
    };
    clog("IN EHCCHECKSETP : RESET TS VAL : " + JSON.stringify(tsCheckValList.length) + " : " + curCheckStep);
    clog("IN EHCCHECKSETP : RESET TS VAL : " + JSON.stringify(curItemCheck) + " : " + curCheckStep);
    //if ( tsCheckValList.length > curCheckStep ) {
    (!CUTIL.isnull(curItemCheck)) && tsCheckValList.map((ts, idx) => {
      clog("CHECK LIST : " + idx + " : Value : " + ts.value
        + " : " + ts.checkItemId
        + " : " + curItemCheck.checkItemId);
      if (ts.checkItemId == curItemCheck.checkItemId) tsVal = ts;
    });
    //}
    setTsCheckVal(tsVal);
  }, [curCheckStep]);

  useEffect(() => {
    setIsCheckDisable(tsCheckVal.isChecked);
  }, [tsCheckVal]);

  // 수정 및 추가만
  function handleTsItemCheckList(val) {
    // delete
    const delList = (tsItemCheckList == null) ? null : tsItemCheckList.filter(ts => ts.checkItemId !== val.checkItemId);
    //(tsItemCheckList)&&setTsItemCheckList(tsItemCheckList.filter(ts=>ts.checkItemId !== val.checkItemId));
    // insert
    setTsItemCheckList([...delList, val]);
  }
  async function onClickNextFirstTempSave(stepVal, checkVal) {
    clog("onClickNextFirstTempSave : " + assessmentId);
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "POST",
      "appPath": "/api/v2/assessment/value",
      appQuery: {
        checkItemId: checkVal.checkItemId,
        isChecked: checkVal.isChecked, // 판정불가 : value 안들어감
        value: checkVal.value,
        valueType: checkVal.valueType,
        comment: checkVal.comment,
        itemId: checkVal.itemId,
        stepName: checkVal.stepName,
        isTempSave: true,
        versionNo: checkVal.versionNo,
      },
    });
    if (data) {
      if (data.codeNum == 200) {
        clog("FIRST INSERT AFTER HANDEL : " + JSON.stringify(data.body));
        //
        const tmpCurItem = {
          ehcType: curItem.ehcType,
          itemId: curItem.itemId,
          itemName: curItem.itemName,
          serialNo: curItem.serialNo,
          itemStatus: curItem.itemStatus,
          itemStep: curItem.itemStep,
          responsible: curItem.itemStep,
          assessment: {
            assessmentId: data.body.assessmentId,
            totalComment: curItem.assessment.totalComment,
            reportId: curItem.assessment.reportId,
            updatedTime: curItem.assessment.updatedTime,
            isTempSave: true//curItem.assessment.isTempSave
          }
        }
        //setCurItem(tmpCurItem);
        //
        setAssessmentId(data.body.assessmentId);
        handleTsItemCheckList(data.body);
        setRecoilCurCheckStep(stepVal + 1);
      } else { // api if
        // need error handle
      }
    }
    //return data;
  }

  async function onClickNextTempSave(stepVal, assessmentId, checkVal) {
    clog("onClickNextTempSave : " + assessmentId);
    if (CUTIL.isnull(assessmentId)) {
      return;
    }
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": "/api/v2/assessment/value",
      appQuery: {
        checkItemId: checkVal.checkItemId,
        isChecked: checkVal.isChecked, // 판정불가 : value 안들어감
        value: checkVal.value,
        valueType: checkVal.valueType,
        comment: checkVal.comment,
        itemId: checkVal.itemId,
        stepName: checkVal.stepName,
        assessmentId: assessmentId,
        isTempSave: true,
        versionNo: checkVal.versionNo,
        //totalComment : comment
      },
    });
    if (data) {
      if (data.codeNum == 200) {
        clog("INSERT AFTER HANDEL : " + JSON.stringify(data.body));
        handleTsItemCheckList(data.body);
        setRecoilCurCheckStep(stepVal + 1);
      } else { // api if
        // need error handle
      }
    }
    //return data;
  }

  function onClickBeforeStep(stepVal) {
    var stepScore = getCheckScore();
    clog("IN EHCCHECKSTEP : BEFORE : " + stepVal + ": " + stepScore);
    setRecoilCurCheckStep(stepVal - 1);
  }

  function onClickNextStep(stepVal, assessmentId, checkVal) {
    var stepScore = getCheckScore();
    clog("IN EHCCHECKSTEP : NEXT : " + stepVal + " : " + stepScore + " : " + isNextable + " : " + isCheckDisable);
    if ((!isCheckDisable) && (stepScore < 0)) {
      setIsNextable(false);
      return;
    } else {
      setIsNextable(true);
      setIsCheckDisable(false);
    }
    var inputData = {
      checkItemId: checkVal.checkItemId,
      isChecked: isCheckDisable, //false,
      value: stepScore,
      valueType: "number",
      comment: comment,
      itemId: curItem.itemId,
      stepName: checkVal.checkStepDto.name,
      isTempSave: true,
      versionNo: checkVal.versionNo,
    };
    if (CUTIL.isnull(assessmentId)) {
      onClickNextFirstTempSave(stepVal, inputData);
    } else {
      onClickNextTempSave(stepVal, assessmentId, inputData);
    }
    resetRecoilTempCheckVal();
  }

  function getCheckScore() {
    var divSelection = document.querySelector(".ehc__selectbtn") as unknown as HTMLElement;
    var stepScore = -1;
    if (CUTIL.isnull(divSelection)) return stepScore;
    for (var i = 0; i < divSelection.children.length; i++) {
      var child = divSelection.children[i];
      var val = child.getAttribute("data-value");
      if (child.classList.contains("on")) {
        stepScore = parseInt(val);
        break;
      }
    }
    return stepScore;
  }

  function onClickComment(e) {
    e.preventDefault();
    //var btnComment = (e.target.tagName==="BUTTON")?e.target:e.currentTarget;
    var btnComment = document.querySelector(".btn-comment");
    var divPopupBoxin = document.querySelector(".popup-boxin");
    var btnCommentClose = document.querySelector(".popup-boxin .btn-close");

    //clog("btnComment : " + btnComment.tagName + " : CLASS : " + btnComment.className);
    if (!CUTIL.isnull(btnComment)) btnComment.classList.toggle("on");
    if (!CUTIL.isnull(divPopupBoxin)) divPopupBoxin.classList.toggle("on");
    if (CUTIL.isnull(btnCommentClose)) return;
    btnCommentClose.addEventListener("click", function (e) {
      onClickComment(e); // 재귀호출
    });
  }

  function onClickSaveComment(e) {
    //alert("commet save and close!!");
    onClickComment(e); // for layer close
    clog("COMMENT : " + comment);
  }


  function enableScoreSelection() {
    var divSelection = document.querySelector(".ehc__selectbtn") as unknown as HTMLElement;
    if (CUTIL.isnull(divSelection)) return;
    divSelection.classList.remove("error");

    var inputCheck = document.querySelector("#chkJ1") as unknown as HTMLElement;
    if (CUTIL.isnull(inputCheck)) return;
    inputCheck.classList.remove("input-error");
  }
  function handelOnclickCheckDisable() {
    enableScoreSelection();
    setIsCheckDisable(!isCheckDisable);
  }

  function onClickScoreButton(e, checkVal) {
    enableScoreSelection();
    var btnScore = (e.target.tagName === "BUTTON") ? e.target : e.currentTarget;
    var btnCl = btnScore.className;
    var chkScore = -1;
    var parentElement = btnScore.parentElement;
    for (var i = 0; i < parentElement.children.length; i++) {
      var child = parentElement.children[i];
      child.classList.remove("on");
    }
    if (btnCl == "on") {
      //
    } else {
      btnScore.classList.add("on");
      chkScore = btnScore.getAttribute("data-value");
    }

    var tmpCheckVal = {
      item: curItem,
      checkVal: {
        assessmentId: curItem.assessment.assessmentId,
        checkItemId: checkVal.checkItemId,
        checkItemName: checkVal.checkItemName,
        isChecked: false,
        value: String(chkScore),
        valueType: "number",
        comment: comment,
        versionNo: checkVal.versionNo,
      },
      stepDone: false
    };
    setRecoilTempCheckVal(tmpCheckVal);
  }
  clog("IN EHCCHECKSTEP : isNextable : " + isNextable + " : isChecked : " + isCheckDisable);

  return (
    (!checkDone) &&
    <>
      <div className="ehc__detail">
        <p>{(curCheckStep + 1) + "." + curItemCheck.checkItemName}</p>
        <p>{curItemCheck.description}/{curItemCheck.checkItemId}</p>
      </div>
      <div className={(isNextable) ? "ehc__selectbtn" : "ehc__selectbtn error"}>
        {curItemCheck.checkItemRefDtoList.map((ref, idx) => (
          (ref.reference.length <= 0)
            ? <button key={"checkstep_" + curItemCheck.checkItemId + "_" + idx}
              type="button"
              className={(CUTIL.isnull(tsCheckVal)) ? "" : (parseInt(tsCheckVal.value) == ref.score) ? "on" : ""}
              data-value={ref.score}
              disabled={true}><span>{ref.score}</span>
            </button>
            : <button key={"checkstep_" + curItemCheck.checkItemId + "_" + idx}
              type="button"
              className={(CUTIL.isnull(tsCheckVal)) ? "" : (parseInt(tsCheckVal.value) == ref.score) ? "on" : ""}
              data-value={ref.score}
              onClick={(e) => onClickScoreButton(e, curItemCheck)}
              disabled={(isCheckDisable) ? true : false}><span>{ref.score}</span>
            </button>
        ))}
        {(!isNextable) && <p className={"input-errortxt"}>필수 입력 항목입니다.</p>}
      </div>
      <div className="tbl__top">
        <div className="left">
          <input type="checkbox" id="chkJ1" name="chkJudg"
            className={(isNextable) ? "" : "input-error"}
            onChange={(e) => { handelOnclickCheckDisable() }}
            checked={isCheckDisable}
          />
          <label htmlFor="chkJ1">판정불가</label>
          {/*<!--220608 수정, 의견작성 버튼 클래스 관련 수정-->*/}
          <button type="button" className="btn btn-comment" data-pop="pop-comment" onClick={(e) => onClickComment(e)}>
            <span>의견작성</span>
          </button>
        </div>
      </div>
      <div className="tbl-list">
        <table summary="점수, 평가기준 항목으로 구성된 판정 List 입니다.">
          <caption>
            판정 List
          </caption>
          <colgroup>
            {/*<!--220608 수정, col style 값 수정-->*/}
            <col style={{ width: "25%" }} />
            <col style={{ width: "75%" }} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">점수</th>
              <th scope="col">평가기준</th>
            </tr>
          </thead>
          <tbody>
            {curItemCheck.checkItemRefDtoList.map((ref, idx) => (
              <tr key={"checkstep_" + idx}>
                <td>{ref.score}점</td>
                <td className="txt-left">{ref.reference}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="tbl__bottom">
        <div className="ehc__step">
          <p className="hide">e-HC 평가 단계</p>
          {/*<!--220608, progressbar 수정-->*/}
          <div className="progressbar">
            <span className="step">{curCheckStep + 1} of {itemCheckList.length}</span>
            <div className="progress-value">
              <progress value={ingNum} max="100"></progress>
              <span className="value" style={{ left: `${ingNum}%` }}>{ingNum}%</span>
            </div>
          </div>
        </div>
        <div className="btn__wrap">

          {/*(curCheckStep > 0)
         ?<button type="button" onClick={(e)=>onClickBeforeStep(e, curCheckStep-1)}><span>이전</span></button>
         :<button type="button" className="bg-transparent"><span>이전</span></button>
         }
         {((curCheckStep+1) <= itemCheckList.length)
         ?<button type="button" onClick={(e)=>onClickNextStep(e, curCheckStep+1, assessmentId, curItemCheck)}><span>다음</span></button>
         :<button type="button" className="bg-transparent"><span>다음</span></button>
         */}
          {(curCheckStep > 0)
            ? <button type="button" onClick={(e) => onClickBeforeStep(curCheckStep)}><span>이전</span></button>
            : <button type="button" className="bg-transparent"><span>이전</span></button>
          }
          {((curCheckStep + 1) <= itemCheckList.length)
            ? <button type="button" onClick={(e) => onClickNextStep(curCheckStep, curItem.assessment.assessmentId, curItemCheck)}><span>다음</span></button>
            : <button type="button" className="bg-transparent"><span>다음</span></button>
          }

        </div>
      </div>
      {/*<!--220608 위치 및 클래스 수정, 의견작성 팝업 -->*/}
      <div id="pop-comment" className="popup-boxin">
        <div className="page-detail">
          <div className="popup__head">
            <h1>의견작성</h1>
            <button className="btn btn-close"><span className="hide">닫기</span></button>
          </div>
          <div className="popup__body">
            <p className="txtnum">{comment.length} / 150</p>
            <textarea placeholder="의견을 입력하세요." value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
          </div>
          <div className="popup__footer">
            <button type="button" onClick={(e) => onClickSaveComment(e)}><span>저장</span></button>
          </div>
        </div>
      </div>
    </>
  )
}

export default EhcCheckStep;


