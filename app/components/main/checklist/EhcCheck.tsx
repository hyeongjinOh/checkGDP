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
 import { userInfoState, userInfoLoginState, authState,  } from '../../../recoil/userState';
 import { 
    itemState,
    beforeItemState,
    nextItemState,
    itemSelectState,    
    assessmentInfoType, 
    assessmentListState, 
    doneAssessmentState, 
    getCheckValueDtoList,
    checkStep,
    curCheckValueDto,
    getTempSave,
    getCheckDone,
    getStepDone,
    tempCheckValue
  } from '../../../recoil/assessmentState';
 //utils
 import clog from "../../../utils/logUtils";
 import * as HttpUtil from "../../../utils/api/HttpUtil";
 import * as CUTIL from "../../../utils/commUtils";
 //
 import $ from "jquery";
 //
 import { useTrans } from "../../../utils/langs/useTrans";
 //
 //import EhcCheckStepTempSave from "./EhcCheckStepTempSave";
 import EhcCheckStep from "./EhcCheckStep";
 import EhcCheckLast from "./EhcCheckLast";
 import EhcCheckResult from "./EhcCheckResult";
 
 
 /**
  * @brief EHP Status 컴포넌트, 반응형 동작
  * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
  * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
  * @returns react components
  */
 function EhcCheck(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const curItem = useRecoilValue(itemState);
  const setRecoilCurItem = useSetRecoilState(itemState);
  const resetRecoilCurItem = useResetRecoilState(itemState);
  const nextItem = useRecoilValue(nextItemState);
  const setRecoilNextItem = useSetRecoilState(nextItemState);
  const resetRecoilNextItem = useResetRecoilState(nextItemState);  
  const beforeItem = useRecoilValue(beforeItemState);
  const itemCheckList = useRecoilValue(assessmentListState);
  const setRecoilItemCheckList = useSetRecoilState(assessmentListState);
  const tsItemCheckListInfo = useRecoilValue(doneAssessmentState);
  const tsItemCheckList = useRecoilValue(getCheckValueDtoList); //curCheckValueDto
  const setRecoilTsItemCheckListInfo = useSetRecoilState(doneAssessmentState);
  const resetRecoilTsItemCheckListInfo = useResetRecoilState(doneAssessmentState);
  const curCheckStep = useRecoilValue(checkStep);
  const setRecoilCurCheckStep = useSetRecoilState(checkStep);
  const resetRecoilTempCheckVal = useResetRecoilState(tempCheckValue);
  const isTempSave = useRecoilValue(getTempSave);
  const checkDone = useRecoilValue(getCheckDone);
  const stepDone = useRecoilValue(getStepDone); // 체크 완료 후 결과 페이지 보여주기
  const isItemSelected = useRecoilValue(itemSelectState);
  //props
  const {company, zone, subZone, room, spg} = props.curTreeData;
  const setParentEhcType = props.setEhcType;
  //
  const [popupContinue, setPopupContinue] = useState("none");
  //
  const t = useTrans();
  //
  clog("IN ECHCHECK : INIT : ISTEMPSAVE : " + isTempSave + " : " + curCheckStep);
  // 진단 이이템이 변경된 경우, 
  // 체크 리스 및 기존 진행 중이던 점검 내역 불러오기
  useEffect(() => {
    clog("IN EHCCHECK : curItem : " + "현재 아이템이 변경되면 체크 정보/임시체크리스트 및 임시저장 체크 정보 불러오기-----------------------" );
    clog("IN EHCCHECK : 임시저장 후 임시저장리스트 초기화");
    resetRecoilTsItemCheckListInfo(); // 현재 아이템이 변경되면...임시 체크리스트 초기화
    //clog("IN EHCCHECK : curItem : 임시저장 취소 후 변경된 curItem 체크 : " + JSON.stringify(curItem.assessment.assessmentId));
    clog("IN EHCCHECK : curItem : " + curItem.itemId + " : " + curItem.itemName + " : " + curItem.assessment.assessmentId);
    clog("IN EHCCHECK : tsItemCheckList : setPopupContinue : " + JSON.stringify(tsItemCheckList) + " : " + popupContinue);
    getItemCheckList(curItem.ehcType, curItem.itemId);
    if ( !CUTIL.isnull(curItem.assessment.assessmentId) ) {
      clog("IN EHCCHECK : curItem : 체크정보 불러오기 : " + JSON.stringify(curItem.assessment.assessmentId));
      // 체크정보 불러와서
      getTempItemCheckList(curItem.assessment.assessmentId);
    } else {
      clog("IN EHCCHECK : curItem : 체크정보 초기화 : " + JSON.stringify(curItem.assessment.assessmentId));
      setRecoilCurCheckStep(0); // 0이 맞음..-1 아님
      //resetRecoilTsItemCheckListInfo();
      // 체크정보 초기화
    }
   }, [curItem.itemId]);
 
   // 기존 점검완료 안된 이력이 있는 경우, 
   // 이어서 하기 팝업 관련 판단
   useEffect(() => {
     //clog("IN EHCCHECK : tsItemCheckList : setPopupContinue : " + JSON.stringify(tsItemCheckList) + " : " + popupContinue);
     if ( (tsItemCheckList.length > 0)&&(!CUTIL.isnull(curItem.itemId)) ) { // setPopupContinue start
        //clog("IN EHCCHECK : setPopupContinue : ID : " + curItem.itemId + " : B : " + beforeItem.itemId + " : N : " + nextItem.itemId);
        //clog("IN EHCCHECK : setPopupContinue : AID : " + curItem.assessment.assessmentId 
        //                          + " : B : " + beforeItem.assessment.assessmentId 
        //                          + " : N : " + nextItem.assessment.assessmentId);
        // assessementId가 없는 경우, 처음 저장 후, curItem->assessmentId를 갱신한다.
        // 
        if ( (!stepDone)&&(tsItemCheckList[0].assessmentId > -1) ) {
          //clog("IN EHCCHECK : INNER1 : setPopupContinue : " + stepDone + " : " + tsItemCheckList[0].assessmentId);
          //clog("IN EHCCHECK : INNER2 : setPopupContinue : " + JSON.stringify(curItem) + " / " + JSON.stringify(nextItem));
          //if ( !CUTIL.isnull(nextItem.assessment.assessmentId) && (nextItem.assessment.assessmentId > -1) ) {
          if ( (curItem.itemId == nextItem.itemId)&&(curItem.assessment.assessmentId == nextItem.assessment.assessmentId) ) {            
            //setPopupContinue("block");
          }
       }
     }
   }, [tsItemCheckList]);
 
   clog("IN EHCCHECK : CHECK DONE : " + itemCheckList.length + " / " + curCheckStep + " / " + checkDone + " / " + popupContinue);//15, 0, false
   
   async function getItemCheckList(curEhcType, itemId) {
     let data:any = null;
     data = await HttpUtil.PromiseHttp({
       httpMethod: "GET",
       appPath: "/api/v2/checksheet/step/spg/itemAll",
       appQuery: { 
         stepName: curEhcType, 
         itemId: itemId,
       },
       userToken : userInfo.loginInfo.token,
       watch : curEhcType+itemId
     });
     if (data) {
       if ( data.codeNum == 200 ) {
         clog("IN EHC CHECK : getItemCheckList : " + JSON.stringify(data.body.length));
         //
         setRecoilItemCheckList(data.body);
         //setPopupContinue("none");
       } else { // api if
         // need error handle
       }
     }
     //return data;
   }
 
   async function getTempItemCheckList(assessmentId) {
     let data:any = null;
     data = await HttpUtil.PromiseHttp({
       "httpMethod" : "GET", 
       "appPath" : "/api/v2/assessment/values", 
       "appQuery" : {
         assessmentId: assessmentId,
       },
       userToken : userInfo.loginInfo.token,
       watch : assessmentId
     });
     if (data) {
       if ( data.codeNum == 200 ) {
        //clog("IN EHC CHECK : getTempItemCheckList : " + assessmentId);
        //clog("IN EHC CHECK : getTempItemCheckList : " + JSON.stringify(data.body.checkValueDtoList));
         setRecoilCurCheckStep(data.body.checkValueDtoList.length);
         setRecoilTsItemCheckListInfo(data.body);
         if ( data.body.checkValueDtoList.length > 0 ) {
            if ( data.body.checkValueDtoList[0].checkItemId !== "-1" ) {
              setPopupContinue("block");
            } else {
              setPopupContinue("none");
            }
         } else {
            setPopupContinue("none");
         }
       } else { // api if
         // need error handle
       }
     }
     //return data;
   }
 
   async function deleteTempItemCheckList(assessmentId) {
     clog("IN EHC CHECK : deleteTempItemCheckList : ");
     let data:any = null;
     data = await HttpUtil.PromiseHttp({
       "httpMethod" : "DELETE", 
       "appPath" : "/api/v2/assessment/values", 
       "appQuery" : {
         assessmentId: assessmentId,
       },
       userToken : userInfo.loginInfo.token,
       watch : assessmentId
     });
     if (data) {
       if ( data.codeNum == 200 ) {
         resetRecoilTsItemCheckListInfo(); // 아이템 임시저장된 체크리스트 초기화        
         clog("IN EHC CHECK : deleteTempItemCheckList");
       } else { // api if
         // need error handle
       }
     }
     //return data;
   }
  const [infoOpen, setInfoOpen] = useState(false);
  function onClickEhcInfo(e) {
        
  }
   function onClickEhcInfoOLD(e) {
     var divEhcInfo = document.querySelector(".ehc__info");
     var ulEhcInfo = "" as unknown as Element;
     for ( var i = 0; i < divEhcInfo.children.length; i ++ ) {
       var child = divEhcInfo.children[i];
       if ( child.tagName == "UL" ) ulEhcInfo = child;
     }
     if ( CUTIL.isnull(ulEhcInfo) ) return;
     ulEhcInfo.classList.toggle("on");
   }
   
   function onClickComment(e) {
     e.preventDefault();
     //var btnComment = (e.target.tagName==="BUTTON")?e.target:e.currentTarget;
     var btnComment = document.querySelector(".btn-comment");
     var divPopupBoxin = document.querySelector(".popup-boxin");
     var btnCommentClose = document.querySelector(".popup-boxin .btn-close");
     
     clog("btnComment : " + btnComment.tagName + " : CLASS : " + btnComment.className);
     if ( !CUTIL.isnull(btnComment) ) btnComment.classList.toggle("on");
     if ( !CUTIL.isnull(divPopupBoxin) ) divPopupBoxin.classList.toggle("on");
     if ( CUTIL.isnull(btnCommentClose) ) return;
     btnCommentClose.addEventListener("click", function(e){
       onClickComment(e); // 재귀호출
     });
   }
 
   function onClickSave(e) {
     alert("commet save and close!!");
     onClickComment(e);
   }
 
   // ehc chekcer 임시저장 여부 체크
   document.addEventListener("click", function(e) {
   });
 
/* 
   function handleCurCheckStep(val) {
     clog("IN EHC CHECK : handleCurCheckStep : " + val);
     //setCheckDone(false);
     setCurRecoilCheckStep(val);
   }
*/ 
   function hadlePopupContinue(val) {
     if ( val ) { // 이어서 하기
      //resetRecoilNextItem();     
      resetRecoilTempCheckVal(); // 임시저장상태 초기화      
      setRecoilCurCheckStep(tsItemCheckList.length);
     } else { // 처음부터 하기
      // 선택된 ITEM의 assessmentID 초기화 필요    
      deleteTempItemCheckList(curItem.assessment.assessmentId);
      //resetRecoilTsItemCheckListInfo(); // 아이템 임시저장된 체크리스트 초기화-> 함수에서 처리
      setRecoilCurCheckStep(0);
      const tmpCurItem = {
        spgTree : {
          company : company,
          zone : zone,
          subZone : subZone,
          room : room,
          spg : spg
        },
        ehcType: curItem.ehcType,
        itemId: curItem.itemId, 
        itemName: curItem.itemName, 
        serialNo : curItem.serialNo,
        itemStatus : curItem.itemStatus,
        //itemStep : curItem.itemStep,
        itemStep : "",
        responsible : curItem.responsible,
        assessment:{
          //preAssessmentId:null,
          preAssessmentId:curItem.assessment.preAssessmentId, // 20221103 sjpark
          assessmentId:null, 
          totalComment:null,
          reportId : null,
          updatedTime : null,
          isTempSave : null
        }
       }
       // -- 처음부터 할 경우
       // 0. 임시저장 상태 리셋하고,
       // 1. nextItem(clickItem)은 리셋하고
       // 2. 현재 아이템은 그대로 두고
       resetRecoilTempCheckVal(); // 임시저장상태 초기화
       resetRecoilNextItem();
       setRecoilCurItem(tmpCurItem);
       //setRecoilNextItem(tmpCurItem);
     }
   }
 
   return (
     <>
     {/*<!--평가기준 : ehc__score / e-HC Status 선택에 따른 클래스 변경,컬러변경됨(ehc-b/ehc-p/ehc-a/ehc-n)-->*/}
     {/*<article id="ehc_checker" className={(isLoading)?"box loading__box":"box ehc__score ehc-b"}>*/}
     <article id="ehc_checker" 
              className={`box ehc__score ${(curItem.ehcType=="ADVANCED")?"ehc-a":(curItem.ehcType=="PREMIUM")?"ehc-p":(curItem.ehcType=="BASIC")?"ehc-b":"ehc-n"}`}>
       <div className="box__header">
         <p className="box__title"><span className="cate">{curItem.ehcType}</span> e-HC</p>
         <div className="box__etc"><span className="date">{CUTIL.curformattime("YYYY-MM-DD")}</span></div>
       </div>
       <div className="box__body">
         <div className={`ehc__info ${(infoOpen)?"on":""}`}>
           <p className="ehc__name">{curItem.itemName}</p>
           <ul className={(infoOpen)?"on":""}
            onClick={(e)=>setInfoOpen(!infoOpen)}
           >
             <li><span>{t("FIELD.시리얼번호")}</span><span>{curItem.serialNo}</span></li>
             <li><span>{t("FIELD.담당자")}</span><span>{curItem.responsible}</span></li>
             <li><span>{t("FIELD.위치")}</span><span>{room.roomName}</span></li>
           </ul>
         </div>
         {/*
         (stepDone)
         ?<EhcCheckResult curTreeData={props.curTreeData} />
         : (isTempSave)
           ?<EhcCheckStepTempSave
              isTempSave={isTempSave}
              curTreeData={props.curTreeData}
              //setParentEhcType={setParentEhcType}
              />
           :(checkDone)
             ?<EhcCheckLast curTreeData={props.curTreeData} />
             :<EhcCheckStep curTreeData={props.curTreeData} />
          */}
         {
         (stepDone)
         ?<EhcCheckResult curTreeData={props.curTreeData}
           setStatusReload={props.setStatusReload} // status reload
         />
         : (checkDone)
              ? <EhcCheckLast 
                curTreeData={props.curTreeData}
                setStatusReload={props.setStatusReload} // status reload
              />
             : ((isItemSelected)&&(curCheckStep > -1))&&<EhcCheckStep curTreeData={props.curTreeData} />
          }
 
         {(!isTempSave)&&<PopupContinue
           popupToggle={popupContinue}
           setPopupToggle={setPopupContinue}
           setPopupVal={hadlePopupContinue}
           />}
       </div>
     </article>
     </>
   )
 }
 
 export default EhcCheck;

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
          <div className="popup__head-restart">
            <h1>e-HC</h1>
            <button className="btn btn-close" onClick={(e) => onClickClose(e)}><span className="hide">닫기</span></button>
          </div>
          <div className="popup__body-restart">
            <p>임시 저장된 내용이 있습니다.<br />이어서 진행하시겠습니까?</p>
          </div>
          <div className="popup__footer-restart">
            <button type="button" className="bg-gray" onClick={(e) => onClickFalse(e)}><span>다시 시작</span></button>
            <button type="button" onClick={(e) => onClickTrue(e)}><span>불러오기</span></button>
          </div>
        </div>
      </div>
      {/*<!--//220610 안내창 팝업 -->*/}
    </>
  )
}

