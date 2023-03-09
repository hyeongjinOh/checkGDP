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
 import { userInfoState, authState,  } from '../../../../recoil/userState';
 //utils
 import clog from "../../../../utils/logUtils";
 import * as HttpUtil from "../../../../utils/api/HttpUtil";
 import * as CUTIL from "../../../../utils/commUtils";
 //
 import $ from "jquery";
 import { cp } from "fs/promises";
 //
 import { useTrans } from "../../../../utils/langs/useTrans";
 
 /**
  * @brief EHP Status 컴포넌트, 반응형 동작
  * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
  * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
  * @returns react components
  */
 function EhcCheckNoItemTest(props) {
   const curEhcType = props.curEhcType;
   const {company, zone, room, spg} = props.curTreeData;
   const item = props.curItem;
   const userInfo = useRecoilValue(userInfoState);
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
     <article id="ehc_checker" className="box ehc__score ehc-b">
       <div className="box__header">
         <p className="box__title"><span className="cate">{curEhcType}</span> e-HC</p>
         <div className="box__etc"><span className="date">{CUTIL.curformattime("YYYY-MM-DD")}</span></div>
       </div>
       <div className="box__body">
       {(!item)&&
         <div className="ehc__detail">
           <p>리스트에서 아이템 선택 후, 평가를 진행하세요..</p>
         </div>
       }
       {(item)&&
       <>
         <div className="ehc__info">
           <p className="ehc__name">VCB#12</p>
           <ul onClick={(e)=>onClickEhcInfo(e)}>
             <li><span>제조번호</span><span>211202-4435.02</span></li>
             <li><span>담당자</span><span>김철수</span></li>
             <li><span>위치</span><span>A동 전기실1</span></li>
           </ul>
         </div>
         <div className="ehc__detail">
           <p>8. 부식, 변색, 오염</p>
           <p>탱크, 밸로즈 발청, 애관, 제어회로, 조작부, 단자함</p>
         </div>
         <div className="ehc__selectbtn">
           <button type="button"><span>0</span></button>
           <button type="button"><span>1</span></button>
           {/*<!--선택된 버튼 클래스 on-->*/}
           <button type="button" className="on"><span>2</span></button>
           <button type="button"><span>3</span></button>
           <button type="button"><span>4</span></button>
         </div>
         <div className="tbl__top">
           <div className="left">
             <input type="checkbox" id="chkJ1" name="chkJudg" />
             <label htmlFor="chkJ1">판정불가</label>
             {/*<!--220608 수정, 의견작성 버튼 클래스 관련 수정-->*/}
             <button type="button" className="btn btn-comment" data-pop="pop-comment" onClick={(e)=>onClickComment(e)}>
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
               <tr>
                 <td>0점</td>
                 <td className="txt-left">0점 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트</td>
               </tr>
               <tr>
                 <td>1점</td>
                 <td className="txt-left">1점 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트</td>
               </tr>
               <tr>
                 <td>2점</td>
                 <td className="txt-left">2점 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트</td>
               </tr>
               <tr>
                 <td>3점</td>
                 <td className="txt-left">3점 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트</td>
               </tr>
               <tr>
                 <td>4점</td>
                 <td className="txt-left">4점 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트</td>
               </tr>
               <tr>
                 <td>4점</td>
                 <td className="txt-left">4점 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트</td>
               </tr>
               <tr>
                 <td>4점</td>
                 <td className="txt-left">4점 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트</td>
               </tr>
               <tr>
                 <td>4점</td>
                 <td className="txt-left">4점 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트 텍스트</td>
               </tr>
             </tbody>
           </table>
         </div>
         <div className="tbl__bottom">
           <div className="ehc__step">
             <p className="hide">e-HC 평가 단계</p>
             {/*<!--220608, progressbar 수정-->*/}
             <div className="progressbar">
               <span className="step">13 of 16</span>
               <div className="progress-value">
                 <progress value="60" max="100"></progress>
                 {/*<!--style값과 태그값, progress value값 동일하게 변동되야 함-->*/}
                 <span className="value" style={{left: "60%"}}>60%</span>
               </div>
             </div>
           </div>
           <div className="btn__wrap">
             <button type="button" className="bg-transparent"><span>이전</span></button>
             <button type="button"><span>다음</span></button>
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
               <textarea placeholder="의견을 입력하세요." value={comment} onChange={(e)=>setComment(e.target.value)}></textarea>
             </div>
             <div className="popup__footer">
               <button type="button" onClick={(e)=>onClickSave(e)}><span>저장</span></button>
             </div>
           </div>
         </div>
         </>
         }
       </div>
     </article>
     </>
   )
 }
 
 
 
 export default EhcCheckNoItemTest;