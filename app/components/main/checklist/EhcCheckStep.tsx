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
 import { useRecoilValue,useSetRecoilState,useResetRecoilState } from "recoil";
 import { userInfoState, userInfoLoginState, authState,  } from '../../../recoil/userState';
import {
  curSpgTreeState,
  nextSpgTreeState,
  beforeSpgTreeState,

  curEhcTypeState,
  nextEhcTypeState,
  beforeEhcTypeState,
   
  itemState,
  nextItemState,
  beforeItemState,
  assessmentListState, 
  doneAssessmentState, 
  getCheckValueDtoList,
  checkStep,
  getCurItemCheck,
  getCheckValueDto,
  curCheckValueDto,
  tempCheckValue,
  getCheckDone,
  getTempSave  
  } from '../../../recoil/assessmentState';
 
 //
 import { useTrans } from "../../../utils/langs/useTrans";
 //utils
 import clog from "../../../utils/logUtils";
 import * as HttpUtil from "../../../utils/api/HttpUtil";
 import * as CUTIL from "../../../utils/commUtils";
 //
 import $ from "jquery";
 
 
 /**
  * @brief EHP Status 컴포넌트, 반응형 동작
  * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
  * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
  * @returns react components
  */
function EhcCheckStep(props) {
  //const userInfo = useRecoilValue(userInfoState);
  const userInfo = useRecoilValue(userInfoLoginState);
  //
  const curSpgTree = useRecoilValue(curSpgTreeState);
  const setRecoilCurSpgTree = useSetRecoilState(curSpgTreeState);
  const nextSpgTree = useRecoilValue(nextSpgTreeState);
  const resetRecoilNextSpgTree = useResetRecoilState(nextSpgTreeState);
  //
  const curEhcType = useRecoilValue(curEhcTypeState);
  const setRecoilCurEhcType = useSetRecoilState(curEhcTypeState);
  const nextEhcType = useRecoilValue(nextEhcTypeState);
  const setRecoilNextEhcType = useSetRecoilState(nextEhcTypeState);
  const resetRecoilNextEhcType = useResetRecoilState(nextEhcTypeState);
  const beforeEhcType = useRecoilValue(nextEhcTypeState);
  //
  const curItem = useRecoilValue(itemState);
  const setRecoilCurItem = useSetRecoilState(itemState);
  const nextItem = useRecoilValue(nextItemState);
  const resetRecoilNextItem = useResetRecoilState(nextItemState);
  const beforeItem = useRecoilValue(beforeItemState);
  const setRecoilBeforeItem = useSetRecoilState(beforeItemState);

   const itemCheckList = useRecoilValue(assessmentListState);
   //const setRecoilItemCheckList = useSetRecoilState(assessmentListState);
   const tsItemCheckListInfo = useRecoilValue(doneAssessmentState);
   //const tsItemCheckList = useRecoilValue(getCheckValueDtoList);
   const setRecoilTsItemCheckListInfo = useSetRecoilState(doneAssessmentState);
   const resetRecoilTsItemCheckListInfo = useResetRecoilState(doneAssessmentState);   
   const curCheckStep = useRecoilValue(checkStep);
   const setRecoilCurCheckStep = useSetRecoilState(checkStep);
   const resetRecoilCurCheckStep = useResetRecoilState(checkStep);
   const curItemCheck = useRecoilValue(getCurItemCheck)
   //const tsCheckVal = useRecoilValue(getCheckValueDto);
   const setRecoilTsCheckVal = useSetRecoilState(curCheckValueDto);
   const resetRecoilTsCheckVal = useResetRecoilState(curCheckValueDto);
   //
   const tempCheckVal = useRecoilValue(tempCheckValue);
   const setRecoilTempCheckVal = useSetRecoilState(tempCheckValue);
   const resetRecoilTempCheckVal = useResetRecoilState(tempCheckValue);
   const checkDone = useRecoilValue(getCheckDone);
   const isTempSave = useRecoilValue(getTempSave);
   //
   const {company, zone, subZone, room, spg} = props.curTreeData;
   const ingNum = Math.round((curCheckStep+1)/itemCheckList.length*100);
   const [isNextable, setIsNextable] = useState(true);
   const [comment, setComment] = useState<string>("");
   const [saveComment, setSaveComment] = useState<string>("");

   const [tsItemCheckList, setTsItemCheckList] = useState({item:null, tsCheckList:null});
   const [tsCheckVal, setTsCheckVal] = useState({  
     assessmentId:-1,
     checkItemId:-1,
     checkItemName:"",
     isChecked:false,
     value:"",
     valueType:"",
     comment:"",
     versionNo:""
   });
    const [isCheckDisable, setIsCheckDisable] = useState(false);
    const [popupTempSave, setPopupTempSave] = useState("none");

    useEffect(() => {
      clog("IN CHECK STEP : IS TEMPSAVE : " + popupTempSave);
      if ( isTempSave ) setPopupTempSave("block");
    }, [isTempSave]);

   // step 변경 확인
    useEffect(() => {
      //check 없이 next step 갈때..check된 isNextable 초기화
      clog("IN EHCCHECK_STEP : INIT : curCheckStep : " + JSON.stringify(tempCheckVal));
      //setComment("");
      setIsNextable(true);
    }, [curCheckStep]);

    useEffect(() => {
      //check 없이 next step 갈때..check된 isNextable 초기화
      //clog("IN EHCCHECK_STEP : curItem : " + JSON.stringify(curItem));
      //clog("IN EHCCHECK_STEP : tsItemCheckListInfo : curItem 변경 여부 확인 / 임시체크 내부 초기화: " + JSON.stringify(tsItemCheckListInfo));
      //
      //setTsItemCheckList(tsItemCheckListInfo.checkValueDtoList); // 내부 체크 리스트 셋팅
      setTsItemCheckList({item:curItem, tsCheckList:null});
      setTsCheckVal({  
        assessmentId:-1,
        checkItemId:-1,
        checkItemName:"",
        isChecked:false,
        value:"",
        valueType:"",
        comment:"",
        versionNo:""
      });
      setIsNextable(true);
      // 체크를 시작했으면...nextItem을 초기화 한다.    
    }, [curItem]);

    useEffect(() => {
      //clog("IN EHCCHECK_STEP : tsItemCheckList : 임시체크 내부 저장 변경 여부 확인 : " + (tsItemCheckList)?tsItemCheckList.length:0);
      clog("IN EHCCHECK_STEP : tsItemCheckListInfo : 임시체크 리코일 저장 변경 여부 확인 : " + curCheckStep + " : " + JSON.stringify(tsItemCheckListInfo));
      setTsItemCheckList({item:curItem, tsCheckList:tsItemCheckListInfo.checkValueDtoList});    
    }, [tsItemCheckListInfo]);

    useEffect(() => {
      //let tsVal = tempCheckVal.checkVal; // 임시저장정보로 셋팅
      let tsVal = {  
        assessmentId:-1,
        checkItemId:-1,
        checkItemName:"",
        isChecked:false,
        value:"",
        valueType:"",
        comment:"",
        versionNo:""
      };
      const imsiItem = tsItemCheckList.item;
      const imsiItemId = (imsiItem)?imsiItem.itemId:-1;
      const imsiItemName = (imsiItem)?imsiItem.itemName:"-1";
      const imsiItemCheckList = tsItemCheckList.tsCheckList;
// xxxxxxxxxxxxxxxxxxxxxxx
      clog("IN EHCHCECK_STEP : curCheckStep, tsItemCheckList : " + curItem.itemName + " : " + imsiItemName);
      ((curItem.itemId===imsiItemId)&&curItemCheck&&imsiItemCheckList)&&imsiItemCheckList.map((ts, idx)=>{
        /*clog("CHECK LIST : " + curItem.itemName + " / " + imsiItemName + " : Value : " + ts.value 
        + " : " + ts.checkItemId 
        + " : " + curItemCheck.checkItemId);*/
        if ( (curItem.itemName == imsiItemName)&&(ts.checkItemId == curItemCheck.checkItemId) ) {
          /*clog("CHECK LIST : CHECKED : " + curItem.itemName + " / " + imsiItemName +  " : " + (curItem.itemName == imsiItemName) + " : Value : " + ts.value 
          + " : " + ts.checkItemId 
          + " : " + curItemCheck.checkItemId);*/
          tsVal = ts;
        }
      });
      setTsCheckVal(tsVal);      

  }, [curCheckStep, tsItemCheckList]);

  // 현재 체크값의 isChecked를 판단
  useEffect(()=>{
    setComment(tsCheckVal.comment); // 20220706
    setSaveComment(tsCheckVal.comment); // 20220706
    setIsCheckDisable(tsCheckVal.isChecked);
  }, [tsCheckVal]);
  // onload 시 tempCheckVal 초기화


   // 수정 및 추가만
   function handleTsItemCheckList(item, val) {
     // delete
     const delList = (tsItemCheckList.tsCheckList==null)?null:tsItemCheckList.tsCheckList.filter(ts=>ts.checkItemId !== val.checkItemId);
     //clog("IN EHCCHECK_STEP : handleTsItemCheckList : " + JSON.stringify(delList));
     //(tsItemCheckList)&&setTsItemCheckList(tsItemCheckList.filter(ts=>ts.checkItemId !== val.checkItemId));
     // insert
     if (delList) {
      setTsItemCheckList({item:item, tsCheckList:[...delList, val]});
     } else {
      setTsItemCheckList({item:item, tsCheckList:[val]});
     }
   }

   
   async function onClickNextFirstTempSave(nextYn, stepVal, item, checkVal) {
     clog("IN EHCCHECKSTEP : onClickNextFirstTempSave : " + item.assessment.assessmentId);
     let data:any = null;
     data = await HttpUtil.PromiseHttp({
       "httpMethod" : "POST", 
       "appPath" : "/api/v2/assessment/value", 
       appQuery: { 
         preAssessmentId : item.assessment.preAssessmentId,
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
       userToken : userInfo.loginInfo.token,
     });

     if (data) {
       if ( data.codeNum == 200 ) {
         clog("IN EHCHECK_STEP : FIRST INSERT AFTER HANDEL : " + JSON.stringify(data.body));
         //
         const tmpCurItem = {
          spgTree : {
            company : company,
            zone : zone,
            subZone : subZone,
            room : room,
            spg : spg
          },
  
          ehcType: item.ehcType,
          itemId: item.itemId, 
          itemName: item.itemName, 
          serialNo : item.serialNo,
          itemStatus : item.itemStatus,
          itemStep : item.echType+"_ING", //curItem.itemStep,
          responsible : item.responsible,
          assessment:{
            preAssessmentId:item.assessment.preAssessmentId, 
            assessmentId:data.body.assessmentId, // 리턴값 저장
            totalComment:item.assessment.totalComment,
            reportId : item.assessment.reportId,
            updatedTime : item.assessment.updatedTime,
            isTempSave : true//curItem.assessment.isTempSave
          }
         }
         // 임시저장 확인 구분 
         // 
         if ( nextYn ) {
            // 처음 저장 후, 다음 단계 이동 으로
            // src : setRecoilBeforeItem(tmpCurItem); //등록 함수 안에서...// 목록 리프레쉬가 되면 괜찮을 텐데..        
            setRecoilCurItem(tmpCurItem); // 처음 내역 저장
            //------------
            setRecoilCurCheckStep(stepVal); // 다음단계 이동
            resetRecoilTempCheckVal();
         } else {
            // 처음 저장 후, 단계 초기화 및 다음 아이템으로 이동
            // src : setRecoilCurItem(tmpCurItem);
            setRecoilBeforeItem(tmpCurItem); // 처음 내역 저장 //등록 함수 안에서...// 목록 리프레쉬가 되면 괜찮을 텐데..        
            //------------------
            ////////////////////////////
            resetRecoilCurCheckStep(); // 임시저장에서는 임시저장후, 단계 초기화
            resetRecoilTempCheckVal(); // 임시저장상태 초기화
            // handle Item for List
            setRecoilCurItem(nextItem);  // 저장후, 이후 아이템으로 변경
            //handle EhcType for Status
            clog("IN ECHCHECKSTEP : HANDLE FIRST EHCTYPE : " + nextItem.ehcType + " : " + nextEhcType);
            if ( nextItem.ehcType != nextEhcType ) { //현재 아이템의 ehcType과 nextEhcType이 틀린 경우
              if ( nextEhcType.length > 0 ) { // 단 nextEhcType이 사용자 선택으로 틀려진 경우
                setRecoilCurEhcType(nextEhcType);
              }
            }
            //handle spgTree for Tree
            var citemSpgKey = String(curItem.spgTree.company.companyId) + curItem.spgTree.room.roomId + curItem.spgTree.zone.zoneId + String(curItem.spgTree.spg.spgId);
            var nitemSpgKey = String(nextItem.spgTree.company.companyId) + nextItem.spgTree.room.roomId + nextItem.spgTree.zone.zoneId + String(nextItem.spgTree.spg.spgId);
            var nSpgKey = String(nextSpgTree.company.companyId) + nextSpgTree.room.roomId + nextSpgTree.zone.zoneId + String(nextSpgTree.spg.spgId);
            clog("IN ECHCHECKSTEP : HANDLE SPGTREE : " + (citemSpgKey==nSpgKey) + " : " + citemSpgKey + " : " + nSpgKey);
            clog("IN ECHCHECKSTEP : HANDLE SPGTREE : " + (nitemSpgKey==nSpgKey) + " : " + nitemSpgKey + " : " + nSpgKey);
            if ( nitemSpgKey != nSpgKey ) { //현재 아이템의 spgTree과 nextspgTree이 틀린 경우
              if ( nextSpgTree.spg.spgId >= 0 ) { // 단 nextspgTree이 사용자 선택으로 틀려진 경우
                setRecoilCurSpgTree(nextSpgTree);
              }
            }          
         }
         handleTsItemCheckList(item, data.body); // nextYn 과 상관없이 수행내역 추가
       } else { // api if
         // need error handle
       }
     }
     return data.codeNum;
   }
 
   async function onClickNextTempSave(nextYn, stepVal, item, checkVal) {
    clog("IN EHCCHECKSTEP : onClickNextTempSave : " + item.assessment.assessmentId);
     if (CUTIL.isnull(item.assessment.assessmentId)) {
       return;
     }
     let data:any = null;
     data = await HttpUtil.PromiseHttp({
       "httpMethod" : "PUT", 
       "appPath" : "/api/v2/assessment/value", 
       appQuery: { 
         preAssessmentId : item.assessment.preAssessmentId,
         checkItemId: checkVal.checkItemId,
         isChecked: checkVal.isChecked, // 판정불가 : value 안들어감
         value: checkVal.value,
         valueType: checkVal.valueType,
         comment: checkVal.comment,
         itemId: checkVal.itemId,
         stepName: checkVal.stepName,
         assessmentId: item.assessment.assessmentId,
         isTempSave: true,
         versionNo: checkVal.versionNo,
         //totalComment : comment
       },
       userToken : userInfo.loginInfo.token,
     });
     if (data) {
       if ( data.codeNum == 200 ) {
         clog("IN EHCHECK_STEP : INSERT AFTER HANDEL : " + JSON.stringify(data.body));
         if ( nextYn ) {
            //------------
            setRecoilCurCheckStep(stepVal); // 다음단계 이동
            resetRecoilTempCheckVal();
         } else {
            //------------------
            ////////////////////////////
            resetRecoilCurCheckStep(); // 임시저장에서는 임시저장후, 단계 초기화
            resetRecoilTempCheckVal(); // 임시저장상태 초기화
            // handle Item for List
            setRecoilCurItem(nextItem);  // 저장후, 이후 아이템으로 변경
            //handle EhcType for Status
            clog("IN ECHCHECKSTEP : HANDLE FIRST EHCTYPE : " + nextItem.ehcType + " : " + nextEhcType);
            if ( nextItem.ehcType != nextEhcType ) { //현재 아이템의 ehcType과 nextEhcType이 틀린 경우
              if ( nextEhcType.length > 0 ) { // 단 nextEhcType이 사용자 선택으로 틀려진 경우
                setRecoilCurEhcType(nextEhcType);
              }
            }
            //handle spgTree for Tree
            var citemSpgKey = String(curItem.spgTree.company.companyId) + curItem.spgTree.room.roomId + curItem.spgTree.zone.zoneId + String(curItem.spgTree.spg.spgId);
            var nitemSpgKey = String(nextItem.spgTree.company.companyId) + nextItem.spgTree.room.roomId + nextItem.spgTree.zone.zoneId + String(nextItem.spgTree.spg.spgId);
            var nSpgKey = String(nextSpgTree.company.companyId) + nextSpgTree.room.roomId + nextSpgTree.zone.zoneId + String(nextSpgTree.spg.spgId);
            clog("IN ECHCHECKSTEP : HANDLE SPGTREE : " + (citemSpgKey==nSpgKey) + " : " + citemSpgKey + " : " + nSpgKey);
            clog("IN ECHCHECKSTEP : HANDLE SPGTREE : " + (nitemSpgKey==nSpgKey) + " : " + nitemSpgKey + " : " + nSpgKey);
            if ( nitemSpgKey != nSpgKey ) { //현재 아이템의 spgTree과 nextspgTree이 틀린 경우
              if ( nextSpgTree.spg.spgId >= 0 ) { // 단 nextspgTree이 사용자 선택으로 틀려진 경우
                setRecoilCurSpgTree(nextSpgTree);
              }
            }          
         }

         handleTsItemCheckList(item, data.body); // 수행내역 추가
         //setRecoilCurCheckStep(stepVal); // 다음단계 이동
       } else { // api if
         // need error handle
       }
     }
     return data.codeNum;
   }
 
   function onClickBeforeStep(stepVal) {
     var stepScore = getCheckScore();
     clog("IN EHCCHECKSTEP : BEFORE : " + stepVal + ": " + stepScore);
     setRecoilCurCheckStep(stepVal-1);
   }
 
   //function onClickNextStep(stepVal, assessmentId, checkVal) {
   function onClickNextStep(stepVal, item, checkVal) {
     var stepScore = getCheckScore();
     clog("IN EHCCHECKSTEP : NEXT : ST : " + stepVal + " : SC : " + stepScore + " : NEXTABLE : " + isNextable + " : CHECKBLE : " + isCheckDisable);
     if ( (!isCheckDisable)&&(stepScore < 0) ) {
      clog("IN EHCCHECKSTEP : NEXT===false&return : ST : " + stepVal + " : SC : " + stepScore + " : NEXTABLE : " + isNextable + " : CHECKBLE : " + isCheckDisable);
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
       itemId: item.itemId,
       stepName: checkVal.checkStepDto.name,
       isTempSave: true,
       versionNo: checkVal.versionNo,
     };
     var ret;
     if (CUTIL.isnull(item.assessment.assessmentId)) {
       ret = onClickNextFirstTempSave(true, stepVal+1, item, inputData); // src : false => true
       //setRecoilCurCheckStep(stepVal+1); // 다음단계 이동
     } else {
       ret = onClickNextTempSave(true, stepVal+1, item, inputData);
       //setRecoilCurCheckStep(stepVal+1); // 다음단계 이동
     }
     if ( ret === 200 ) {
      //setRecoilCurCheckStep(stepVal+1); // 다음단계 이동
      //resetRecoilTempCheckVal();
     }
   }
 
   function getCheckScoreOld() {
     var divSelection = document.querySelector(".ehc__selectbtn") as unknown as HTMLElement;
     var stepScore = -1;
     if ( CUTIL.isnull(divSelection) ) return stepScore;
     for ( var i = 0; i < divSelection.children.length; i ++ ) {
       var child = divSelection.children[i];
       var val = child.getAttribute("data-value");
       if ( child.classList.contains("on") ) {
         stepScore = parseInt(val);
         break;
       }
     }
     return stepScore;    
   }

   function getCheckScore() {
    var ulSelection = document.querySelector(".ehc__selectbtn") as unknown as HTMLElement;
    var stepScore = -1;
    if ( CUTIL.isnull(ulSelection) ) return stepScore;
    for ( var i = 0; i < ulSelection.children.length; i ++ ) {
      var childLi = ulSelection.children[i];
      if ( childLi.children.length < 1 ) continue; // 'BUTTON' OR P tag
      var btnTag = childLi.children[0]; // 'BUTTON' tag
      var val = btnTag.getAttribute("data-value");
      if ( btnTag.classList.contains("on") ) {
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
     if ( !CUTIL.isnull(btnComment) ) btnComment.classList.toggle("on");
     if ( !CUTIL.isnull(divPopupBoxin) ) divPopupBoxin.classList.toggle("on");
     if ( CUTIL.isnull(btnCommentClose) ) return;
     btnCommentClose.addEventListener("click", function(e){
       onClickComment(e); // 재귀호출
     });
   }
 
   function onClickSaveComment(e) {
     //alert("commet save and close!!");
     onClickComment(e); // for layer close
     setSaveComment(comment);
   }

   function onClickUpdateComment(e, type) {
    onClickComment(e); // for layer close
    if ( type == "DELETE" ) {
      setComment("");
      setSaveComment("");
    } else { // update insert
      setSaveComment(comment);
    }
  }


 
  function enableScoreSelection() {
    var divSelection = document.querySelector(".ehc__selectbtn") as unknown as HTMLElement;
    if (CUTIL.isnull(divSelection)) return;
    divSelection.classList.remove("error");

    var inputCheck = document.querySelector("#chkJ1") as unknown as HTMLElement;
    if (CUTIL.isnull(inputCheck)) return;
    inputCheck.classList.remove("input-error");
  }

  // 판정불가 버튼 클릭 핸들링
  function handelOnclickCheckDisable() {
    enableScoreSelection();
    if ( !isCheckDisable ) { // true 셋팅되면
      setIsNextable(true);
    }
    setIsCheckDisable(!isCheckDisable);
  }
 
  function onClickScoreButton(e, checkVal) {
    enableScoreSelection();
    //
    var btnScore = (e.target.tagName === "BUTTON")?e.target:e.currentTarget;
    var btnCl = btnScore.className;
    var chkScore = -1;
    //var parentElement = btnScore.parentElement;
    var ulSelection = btnScore.closest(".ehc__selectbtn");
    for ( var i = 0; i < ulSelection.children.length; i ++ ){
      var childLi = ulSelection.children[i];
      if ( childLi.children.length < 1 ) continue; // 'BUTTON' OR P tag
      var btnTag = childLi.children[0]; // 'BUTTON' tag
      btnTag.classList.remove("on");
    }
    if ( btnCl == "on" ) {
      //
      btnScore.classList.remove("on");
      chkScore = -1;
    } else {
      if ( btnScore.classList.contains("errorpoint") ) btnScore.classList.remove("errorpoint");
      btnScore.classList.add("on");
      chkScore = btnScore.getAttribute("data-value");
    }
    //

    var cval = { 
      item : curItem,
      checkVal : {
        assessmentId: curItem.assessment.assessmentId,      
        checkItemId: checkVal.checkItemId,
        checkItemName:checkVal.checkItemName,
        isChecked: false,
        value: String(chkScore),
        valueType: "number",
        comment: comment,
        versionNo: checkVal.versionNo,
      }, 
      stepDone : false
    };
    const checkValue = (cval.checkVal.value.length > 0)?parseInt(cval.checkVal.value):-1;
  
    if ( checkValue > -1) {
      setIsNextable(true); // sjpark 20220708
      setRecoilTempCheckVal(cval);
      setTsCheckVal(cval.checkVal);
    } else {
      resetRecoilTempCheckVal();
    }
  }

  function hadleTempSave(val) {
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

    /*
      -- ITEM 변경시
      0 현재 아이템이 체크되어 있지 않으면...클릭한 아이템을 현재 아이템으로 함
      1. LIST에서 점수 클릭시, 임시저장 여부 저장
      2. LIST에서 ITEM 변경/클릭시, 클릭한 항목을 다음 ITEM의 상태를 저장
      -- TreeData 변경시
      -- Status 변경시  
    */
    var ret;
    if ( val ) {
      // ture, 임시 저장 후, 다른 아이템으로 진행, 0단계로 이동
      clog("IN EHCCHECK_STEP : 임시저장 후 임시저장리스트 초기화");
      //
      //handle Item for List
      resetRecoilTsItemCheckListInfo(); // 아이템 임시저장된 체크리스트 초기화-> 함수에서 처리
      if (CUTIL.isnull(tempCheckVal.item.assessment.assessmentId)) {
        onClickNextFirstTempSave(false, -1, tempCheckVal.item, inputData); // src : true ==> false
      } else {
        onClickNextTempSave(false, -1, tempCheckVal.item, inputData);
      }

    } else { 
      // false, 임시 저장하지 않고, 이전 아이템으로 변경
      clog("IN EHCCHECK_STEP TEMPSAVE : 취소 : " + "clickItem/nextItem 초기화");
      resetRecoilNextItem(); // clickItem/nextItem 초기화
      clog("IN EHCCHECK_STEP TEMPSAVE : 취소 : " + "저장않고 후, 이전 아이템으로 변경");
      setRecoilCurItem(curItem);  // 저장않고 후, 이전 아이템으로 변경
      //handle EhcType for Status
      resetRecoilNextEhcType();
      if ( curItem.ehcType != curEhcType ) {
        setRecoilCurEhcType(curEhcType);
      }
      //handle spgTree for Tree
      resetRecoilNextSpgTree();
      if ( curItem.spgTree != curSpgTree ) {
        setRecoilCurSpgTree(curSpgTree);
      }
    }
  }

  return (
     ((!checkDone)&&(curItemCheck))&&
     <>
     <div className="ehc__detail">
       <p className="tit">{(curCheckStep+1) + "." + curItemCheck.checkItemName}</p>
       <p className="txt">{curItemCheck.description}</p>
     </div>
     {/*<div className={(isNextable)?"ehc__selectbtn":"ehc__selectbtn error"}>
       {curItemCheck.checkItemRefDtoList.map((ref, idx)=>(
        (ref.reference.length<=0)
        ?<button key={"checkstep_"+curItemCheck.checkItemId+"_"+idx} 
          type="button" 
          className={(CUTIL.isnull(tsCheckVal))?"":(parseInt(tsCheckVal.value)==ref.score)?"on":""}
          data-value={ref.score} 
          disabled={true}><span>{ref.score}</span>
        </button>
        :<button key={"checkstep_"+curItemCheck.checkItemId+"_"+idx} 
            type="button" 
            className={(CUTIL.isnull(tsCheckVal))?"":(parseInt(tsCheckVal.value)==ref.score)?"on":""}
            data-value={ref.score} 
            onClick={(e)=>onClickScoreButton(e, curItemCheck)}
            disabled={(isCheckDisable)?true:false}><span>{ref.score}</span>
        </button>
       ))}
       {(!isNextable)&&<p className={"input-errortxt"}>필수 입력 항목입니다.</p>}
      </div>
      */}
      {clog("IN EHCCHECSTEP : AFTER : " + isNextable + " : " + JSON.stringify(tsCheckVal))}
     <ul className={`ehc__selectbtn ${(isNextable)?"":"error"}`}>
       {curItemCheck.checkItemRefDtoList.map((ref, idx)=>(
        (ref.reference.length<=0)
        ?<li key={"checkstepli_"+"_"+idx}>
          <button key={"checkstep_"+curItemCheck.checkItemId+"_"+idx} 
            type="button" 
            className={(CUTIL.isnull(tsCheckVal))?"":(parseInt(tsCheckVal.value)==ref.score)?"on":""}
            data-value={ref.score} 
            disabled={true}><span>{ref.score}</span>
          </button>
          {(isNextable)?<></>:(idx==0)?<p className="input-errortxt">필수 입력 항목입니다.</p>:<></>}
        </li>
        :<li key={"checkstepli_"+"_"+idx} >
          <button key={"checkstep_"+curItemCheck.checkItemId+"_"+idx} 
            type="button" 
            className={(!isNextable)?"errorpoint":(CUTIL.isnull(tsCheckVal))?"":(parseInt(tsCheckVal.value)==ref.score)?"on":""}
            data-value={ref.score} 
            onClick={(e)=>onClickScoreButton(e, curItemCheck)}
            disabled={(isCheckDisable)?true:false}><span>{ref.score}</span>
          </button>
          {(isNextable)?<></>:(idx==0)?<p className="input-errortxt">필수 입력 항목입니다.</p>:<></>}
        </li>
       ))}
     </ul>
     <div className="tbl__top">
       <div className="left">
         <input type="checkbox" id="chkJ1" name="chkJudg" 
            className={(isNextable)?"":"input-error"}
            onChange={(e)=>{handelOnclickCheckDisable()}}
            checked={isCheckDisable}
          />
         <label htmlFor="chkJ1">판정불가</label>
         {/*<!--220608 수정, 의견작성 버튼 클래스 관련 수정-->*/}
         {(saveComment&&(saveComment.length > 0))
          ?<button type="button" className="btn btn-comment-check" data-pop="pop-comment" onClick={(e)=>onClickComment(e)}>
           <span>의견확인</span>
          </button>
          :<button type="button" className="btn btn-comment" data-pop="pop-comment" onClick={(e)=>onClickComment(e)}>
           <span>의견작성</span>
         </button>
          }
       </div>
     </div>
     <div className="tbl-list">
       <table summary="점수, 평가기준 항목으로 구성된 판정 List 입니다.">
         <caption>
           판정 List
         </caption>
         <colgroup>
           {/*<!--220608 수정, col style 값 수정-->*/}
           <col style={{width: "25%"}} />
           <col style={{width: "75%"}} />
         </colgroup>
         <thead>
           <tr>
             <th scope="col">점수</th>
             <th scope="col">평가기준</th>
           </tr>
         </thead>
         <tbody>
         {curItemCheck.checkItemRefDtoList.map((ref, idx)=>(
           <tr key={"checkstep_"+idx}>
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
           <span className="step">{curCheckStep+1} of {itemCheckList.length}</span>
           <div className="progress-value">
             <progress value={ingNum} max="100"></progress>
             <p className="value">
              <span style={{left: `${ingNum}%`}}>{ingNum}%</span>
             </p> 
           </div>
         </div>
       </div>
       <div className="btn__wrap">
          {(curCheckStep > 0)
            ? <button type="button" className="bg-transparent" onClick={(e) => onClickBeforeStep(curCheckStep)}><span>이전</span></button>
            : <button type="button" className="bg-transparent" disabled><span>이전</span></button>
          }
          {((curCheckStep + 1) <= itemCheckList.length)
            //?<button type="button" onClick={(e)=>onClickNextStep(curCheckStep, curItem.assessment.assessmentId, curItemCheck)}><span>다음</span></button>
            ? <button type="button" onClick={(e) => onClickNextStep(curCheckStep, curItem, curItemCheck)}><span>다음</span></button>
            : <button type="button" className="bg-transparent"><span>다음</span></button>
          } 
       </div>
     </div>
      {/*<!--220608 위치 및 클래스 수정, 의견작성 팝업 -->*/}
      <div id="pop-comment" className="popup-boxin">
        <div className="page-detail">
          <div className="popup__head-opinion">
            <h1>의견작성</h1>
            <button className="btn btn-close"><span className="hide">닫기</span></button>
          </div>
          <div className="popup__body-opinion">
            <p className="txtnum">{comment.length} / 120</p>
            <textarea placeholder="의견을 입력하세요." value={comment} 
                onKeyPress={(e)=> CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e)=> CUTIL.afterHandleComment(e, 120, setComment)}
                onChange={(e) => setComment(e.target.value)}></textarea>
          </div>
          <div className="popup__footer-opinion">
            {(saveComment&&(saveComment.length>0))
            ?<>
              <button type="button" className="bg-gray" onClick={(e) => onClickUpdateComment(e, "DELETE")}><span>삭제</span></button>
              <button type="button" onClick={(e) => onClickUpdateComment(e, "UPDATE")}><span>수정</span></button>
            </>
            :<><button type="button" onClick={(e) => onClickUpdateComment(e, "INSERT")}><span>저장</span></button></>
            }
          </div>
        </div>
      </div>
     <PopupTempSave
      popupToggle={popupTempSave}
      setPopupToggle={setPopupTempSave}
      hadleTempSave={hadleTempSave}
      />

     </>
   )
 }
 
 export default EhcCheckStep;
 
 
 function PopupTempSave(props) {
  const srcToggleVal = props.popupToggle;
  const setPopupToggle = props.setPopupToggle;
  const hanleParentTempSave = props.hadleTempSave;
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
    (popupObj)&&popupObj.style.setProperty("display", "none");
    setPopupToggle("none");
  }

  function onClickTrue(e) {
    hanleParentTempSave(true);
    onClickClose(e);
  }

  function onClickFalse(e) {
    hanleParentTempSave(false);
    onClickClose(e);
  }

  return (
    <>
    {/*<!--220610 안내창 팝업 : 공통... 박스안에만 뜨는 단순문구 안내창 팝업 > box__body클래스의 제일 아래부분에 넣어주시면 됩니다.  -->*/}
    {/*<div id="pop-basic" className="popup-boxin popup-basic" style={{display:`${toggleVal}`}}>*/}
    <div ref={ref} id="pop-basic" className="popup-boxin popup-basic" style={{display:`${toggleVal}`}}>
      <div className="page-detail">
        <div className="popup__head">
          <h1>e-HC</h1>
          <button className="btn btn-close" onClick={(e)=>onClickClose(e)}><span className="hide">닫기</span></button>
        </div>
        <div className="popup__body">
          <p>점검이 완료되지 않았습니다. 나가시겠습니까?<br />페이지를 벗어날 경우, 진행 내용은 임시 저장됩니다.</p>
        </div>
        <div className="popup__footer">
          <button type="button" className="bg-gray" onClick={(e)=>onClickFalse(e)}><span>취소</span></button>
          <button type="button" onClick={(e)=>onClickTrue(e)}><span>확인</span></button>
        </div>
      </div>
    </div>
    {/*<!--//220610 안내창 팝업 -->*/}
    </>
  )
}