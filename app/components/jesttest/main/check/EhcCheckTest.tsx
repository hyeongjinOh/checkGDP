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
  assessmentListState,
  doneAssessmentState,
  getCheckValueDtoList,
  checkStep,
  getCurItemCheck,
  getCheckValueDto,
  curCheckValueDto,
  tempCheckValue
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
function EhcCheckTest(props) {
  const userInfo = useRecoilValue(userInfoState);
  const curItem = useRecoilValue(itemState);
  const setRecoilItemInfo = useSetRecoilState(itemState); // recoil userState
  const beforeItemInfo = useRecoilValue(beforeItemState); // recoil userState
  const setRecoilBeforeItemInfo = useSetRecoilState(beforeItemState); // recoil userState
  const nextItemInfo = useRecoilValue(nextItemState); // recoil userState
  const setRecoilNextItemInfo = useSetRecoilState(nextItemState); // recoil userState

  const itemCheckList = useRecoilValue(assessmentListState);
  //const setRecoilItemCheckList = useSetRecoilState(assessmentListState);
  const tsItemCheckListInfo = useRecoilValue(doneAssessmentState);
  const tsItemCheckList = useRecoilValue(getCheckValueDtoList);
  const setRecoilTsItemCheckListInfo = useSetRecoilState(doneAssessmentState);
  const curCheckStep = useRecoilValue(checkStep);
  const setRecoilCurCheckStep = useSetRecoilState(checkStep);
  const curItemCheck = useRecoilValue(getCurItemCheck)
  const tsCheckVal = useRecoilValue(getCheckValueDto);
  const setRecoilTsCheckVal = useSetRecoilState(curCheckValueDto);
  const resetRecoilTsCheckVal = useResetRecoilState(curCheckValueDto);
  //
  //
  const tempCheckVal = useRecoilValue(tempCheckValue);
  const resetRecoilTempCheckVal = useResetRecoilState(tempCheckValue);
  //const [tempCheckVal, setRecoilTempCheckVal] = useRecoilValue(tempCheckValue); // need set selector
  //
  const isTempSave = props.isTempSave;
  //
  const ingNum = Math.round((curCheckStep + 1) / itemCheckList.length * 100);
  const [isNextable, setIsNextable] = useState(true);
  const [comment, setComment] = useState("");
  const [popupTempSave, setPopupTempSave] = useState("none");


  clog("IN EHCCHECKSTEP TEMPSAVE : INIT : " + isTempSave);
  useEffect(() => {
    if (isTempSave) setPopupTempSave("block");
  }, [isTempSave]);


  useEffect(() => {
    setIsNextable(true);
  }, [curItem]);


  async function onClickNextFirstTempSave(checkVal) {
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
        //setAssessmentId(data.body.assessmentId);
        //handleTsItemCheckList(data.body);
        //setRecoilCurCheckStep(stepVal+1);
      } else { // api if
        // need error handle
      }
    }
    //return data;
  }

  async function onClickNextTempSave(assessmentId, checkVal) {
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
        //handleTsItemCheckList(data.body);
        //setRecoilCurCheckStep(stepVal+1);
      } else { // api if
        // need error handle
      }
    }
    //return data;
  }


  function hadlePopupTempSave(val) {
    var inputData = {
      checkItemId: tempCheckVal.checkVal.checkItemId,
      isChecked: tempCheckVal.checkVal.isChecked,
      value: tempCheckVal.checkVal.value,
      valueType: "number",
      comment: tempCheckVal.checkVal.comment,
      itemId: tempCheckVal.item.itemId,
      stepName: tempCheckVal.item.ehcType,
      isTempSave: true,
      versionNo: tempCheckVal.checkVal.versionNo,
    };
    if (val) { // 임시 저장 후, 다른 아이템으로 진행
      if (CUTIL.isnull(tempCheckVal.item.assessment.assessmentId)) {
        onClickNextFirstTempSave(inputData);
      } else {
        onClickNextTempSave(tempCheckVal.item.assessment.assessmentId, inputData);
      }
      // 저장후, 이후 아이템으로 변경
      setRecoilItemInfo(nextItemInfo);
      setRecoilBeforeItemInfo(curItem);
      //
      setRecoilCurCheckStep(0);
      resetRecoilTempCheckVal();
    } else { // 임시 저장하지 않고, 이전 아이템으로 변경
      setRecoilNextItemInfo(curItem);
    }
  }

  return (
    <>
      <div className="ehc__detail">
        <p>{(curCheckStep + 1) + "." + curItemCheck.checkItemName}</p>
        <p>{curItemCheck.description}/{curItemCheck.checkItemId}</p>
      </div>
      <div className="ehc__selectbtn">
        {curItemCheck.checkItemRefDtoList.map((ref, idx) => (
          <button data-testid={"num" + idx} key={"checkstep_" + curItemCheck.checkItemId + "_" + idx}
            type="button" className={(CUTIL.isnull(tsCheckVal)) ? "" : (parseInt(tsCheckVal.value) == ref.score) ? "on" : ""}
            data-value={ref.score} >
            <span>{ref.score}</span>
          </button>
        ))}
        {(!isNextable) && <p>필수 입력 항목입니다.</p>}
      </div>
      <div className="tbl__top">
        <div className="left">
          <input type="checkbox" data-testid="check" id="chkJ1" name="chkJudg" />
          <label htmlFor="chkJ1">판정불가</label>
          {/*<!--220608 수정, 의견작성 버튼 클래스 관련 수정-->*/}
          <button type="button" className="btn btn-comment" data-pop="pop-comment" >
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
            ? <button type="button" ><span>이전</span></button>
            : <button type="button" className="bg-transparent"><span>이전</span></button>
          }
          {((curCheckStep + 1) <= itemCheckList.length)
            ? <button type="button" ><span>다음</span></button>
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
            <button type="button" ><span>저장</span></button>
          </div>
        </div>
      </div>
      <PopupTempSave
        popupToggle={popupTempSave}
        setPopupToggle={setPopupTempSave}
        setPopupVal={hadlePopupTempSave}
      />

    </>
  )
}

export default EhcCheckTest;


function PopupTempSave(props) {
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
            <p>점검이 완료되지 않았습니다. 나가시겠습니까?<br />페이지를 벗어날 경우, 진행 내용은 임시 저장됩니다.</p>
          </div>
          <div className="popup__footer">
            <button type="button" className="bg-gray" onClick={(e) => onClickFalse(e)}><span>취소</span></button>
            <button type="button" onClick={(e) => onClickTrue(e)}><span>확인</span></button>
          </div>
        </div>
      </div>
      {/*<!--//220610 안내창 팝업 -->*/}
    </>
  )
}