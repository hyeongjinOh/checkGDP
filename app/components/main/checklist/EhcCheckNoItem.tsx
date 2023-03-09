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
 import { useRecoilValue } from "recoil";
 import { userInfoState, userInfoLoginState, authState,  } from '../../../recoil/userState';
 //utils
 import clog from "../../../utils/logUtils";
 import * as HttpUtil from "../../../utils/api/HttpUtil";
 import * as CUTIL from "../../../utils/commUtils";
 //
 import $ from "jquery";
 import { cp } from "fs/promises";
 //
 import { useTrans } from "../../../utils/langs/useTrans";
 
 /**
  * @brief EHP Status 컴포넌트, 반응형 동작
  * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
  * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
  * @returns react components
  */
 function EhcCheckNoItem(props) {
   const curEhcType = props.curEhcType;
   const {company, zone, room, spg} = props.curTreeData;
   //const item = props.curItem;
   const item = null;
   //const userInfo = useRecoilValue(userInfoState);
   const userInfo = useRecoilValue(userInfoLoginState);

   const [comment, setComment] = useState("");
 
   //clog(" ----------------- IN EHC CHECK NO ITEM-----------------------");
 
   function onClickEhcInfo(e) {
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
 
 
   return (
     <>
     {/*<!--평가기준 : ehc__score / e-HC Status 선택에 따른 클래스 변경,컬러변경됨(ehc-b/ehc-p/ehc-a/ehc-n)-->*/}
     <article id="ehc_checker" 
    //  className="box ehc__score ehc-b">
        className={`box ehc__score ${(curEhcType=="ADVANCED")?"ehc-a":(curEhcType=="PREMIUM")?"ehc-p":(curEhcType=="BASIC")?"ehc-b":"ehc-n"}`}>
       <div className="box__header">
         <p className="box__title"><span className="cate">{curEhcType}</span> e-HC</p>
       </div>
       <div className="box__body">
       {(!item)&&
        <p className="txt-ready">
          <span><strong>e-HC List</strong> 에서 점검할 기기를 먼저 선택해주세요.</span>
        </p>
       }
       </div>
     </article>
     </>
   )
 }
 
 
 
 export default EhcCheckNoItem;