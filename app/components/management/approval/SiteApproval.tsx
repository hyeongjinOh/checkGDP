/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-08-30
 * @brief EHP ManageMent - SiteManageMent 개발
 *
 ********************************************************************/
 import React, { useEffect, useState } from "react";
 //
 import { useAsync } from "react-async";
 // recoil && state
 import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
 import { userInfoLoginState } from "../../../recoil/userState";
 //utils
 import * as HTTPUTIL from "../../../utils/api/HttpUtil";
 import clog from "../../../utils/logUtils";
 import * as CUTIL from "../../../utils/commUtils";
 import * as CONST from "../../../utils/Const"
 import EhpPagination from "../../common/pagination/EhpPagination";
 import { useNavigate } from "react-router-dom";
 import EhpPostCode from "../../common/postcode/EhpPostCode";
 //
 /**
  * @brief EHP ManageMent - ApprovalManageMent 개발 컴포넌트, 반응형 동작
  * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
  * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
  * @returns react components
  */
 
 function SiteApprovalManageMent(props) {
   //recoil
   const userInfo = useRecoilValue(userInfoLoginState);
   //화면 이동
   const navigate = useNavigate();
   //props
   const setParentPopWin = props.setPopWin;
   //
   const [treeDto, setTreeDto] = useState([]);
   const [toggle, setToggle] = useState(false);
   const [item, setItem] = useState(null)
   //
   const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0 };
   const [pageInfo, setPageInfo] = useState(defaultPageInfo);
   const [siteAddress, setSiteAddress] = useState("");
 
   function callbackSetSubZoneInfoAddress(val) {
     setSiteAddress(val);
   }
   let appPath = 'page=' + pageInfo.number + '&size=' + pageInfo.size;
   // 사업장 승인 요청 List
   const { data: data, error, isLoading, reload, run, } = useAsync({
     promiseFn: HTTPUTIL.PromiseHttp,
     httpMethod: "GET",
     appPath: `/api/v2/product/usertree/zoneapprovallist?${appPath}`,
     appQuery: {},
     userToken: userInfo.loginInfo.token,
     watch: appPath
   });
 
   useEffect(() => {
     // error page 이동
     const ERR_URL = HTTPUTIL.resultCheck(isLoading, data);
     if (ERR_URL.length > 0) navigate(ERR_URL);
 
     if (data) {
       if (data.codeNum == CONST.API_200) {
         setTreeDto(data.body);
         setPageInfo(data.data.page);
       }
     }
   }, [data]);
 
   function handleCurPage(page) {
     setPageInfo({ ...pageInfo, number: page });
   }
 
   function toggles(e) {
     if (toggle === false) {
       setToggle(true);
     } else {
       setToggle(false);
     }
   }
 
   //사업장 승인 요청 API - pop List
   function sitePop(e, list) {
     setItem(list)
 
     CUTIL.jsopen_Popup(e)
   }
   useEffect(() => {
     setParentPopWin("pop-workplace-ok",
       (item) && <SiteApprovalPop
         htmlHeader={<h1>사업장 승인 요청</h1>}
         item={item}
         onClickPostCode={onClickPostCode}
         siteAddress={siteAddress}
         setSiteAddress={setSiteAddress}
       />
     )
   });
 
   const [isPopupPostCode, setIsPopupPostCode] = useState(false);
   useEffect(() => {
     setParentPopWin("pop-postcode",
       <EhpPostCode
         isPopup={isPopupPostCode}
         setIsPopup={setIsPopupPostCode}
         setAddress={callbackSetSubZoneInfoAddress}
       />
     )
   });
   function onClickPostCode(e) {
     setIsPopupPostCode(true);
     CUTIL.jsopen_Popup(e);
   }
 
   const treeList = (treeDto === null) ? null : treeDto;
   return (
     <>
       <div className="page-top more__detail" onClick={(e) => toggles(e)}>
         <h2>사업장 승인 요청</h2>
         <p className="user-num">{pageInfo.totalElements}</p>
       </div>
       {/*<!--area__right_content, 오른쪽 컨텐츠 영역-->*/}
       <div className={`area__right_content detail__view  ${(toggle) ? "on" : ""}`}>
         <div className="tbl-list hcal-vh-315">
           <table summary="사용자 타입,회사, 사업장,이름, 허용 요청 회사,허용 요청 사업장 항목으로 구성된 사업장 승인 요청 리스트 입니다.">
             <caption>
               사업장 승인 요청 리스트
             </caption>
             <colgroup>
               {/* <col style="width: " /> */}
             </colgroup>
             <thead>
               <tr>
                 <th scope="col" className=" txt-left js-open" data-pop="pop-user-type">{/* question class delete */}
                   <span>사용자 타입</span>
                 </th>
                 <th scope="col" className="txt-left">회사</th>
                 <th scope="col" className="txt-left d-sm-none">사업장</th>
                 <th scope="col" className="txt-left">이름</th>
                 <th scope="col" className="txt-left d-sm-none">허용 요청 회사</th>
                 <th scope="col" className="txt-left pl-50 d-sm-none">허용 요청 사업장</th>
                 <th scope="col">승인요청</th>
               </tr>
             </thead>
             <tbody>
               {treeList.map((list) => (
                 <tr key={list.id}>
                   <td className="txt-left">{(list.user.role === "ROLE_ADMIN") ? "Admin" : (list.user.role === "ROLE_ENGINEER") ? "Engineer" : (list.user.role === "ROLE_USER") ? "User" : ""}</td>
                   <td className="txt-left">{list.user.userCompany}</td>
                   <td className="txt-left d-sm-none"><p className="ellipsis">{list.user.userZone}</p></td>
                   <td className="txt-left">{list.user.userName}</td>
                   <td className="txt-left d-sm-none"><p className="ellipsis">{list.company.companyName}</p></td>
                   <td className={`txt-new txt-left pl-50 d-sm-none ${(list.zone.approval == 1) ? " icon-new" : ""}`}>
                     <p className="ellipsis"><span>{list.zone.zoneName}</span></p>
                   </td>
                   <td>
                     <button type="button" className="bg-blue center js-open" data-pop="pop-workplace-ok" onClick={(e) => sitePop(e, list)}><span data-pop="pop-workplace-ok">확인</span></button>
                   </td>
                 </tr>
 
               ))}
             </tbody>
           </table>
         </div>
         {(pageInfo) && <EhpPagination
           componentName={"StieApproval"}
           pageInfo={pageInfo}
           handleFunc={handleCurPage}
         />}
       </div>
 
 
     </>
   )
 };
 
 
 export default SiteApprovalManageMent;
 
 function SiteApprovalPop(props) {
   //recoli
   const userInfo = useRecoilValue(userInfoLoginState);
   // props
   const item = props.item;
   const onClickPostCode = props.onClickPostCode;
   const siteAddress = props.siteAddress;
   const setSiteAddress = props.setSiteAddress;
   //
   const [list, setList] = useState(null);
   const [siteZoneName, setSiteZoneName] = useState("");
 
   const [siteMemo, setSiteMemo] = useState("");
   const [companionTxt, setCompanionTxt] = useState("")
   const [sitePutDisplay, setSitePutDisplay] = useState(false);
   const [siteDisplayDone, setSiteDisplayDone] = useState(false);
   const [siteDisplayCompanion, setSiteDisplayCompanion] = useState(false);
 
   const [update, setUpdate] = useState(false)
   // 상세 API
   const { data: data, isLoading } = useAsync({
     promiseFn: HTTPUTIL.PromiseHttp,
     httpMethod: "GET",
     appPath: `/api/v2/product/usertree/${item.id}/detail`,
     userToken: userInfo.loginInfo.token,
     watch: item.id + update
   });
   useEffect(() => {
 
     if (data) {
       if (data.codeNum == CONST.API_200) {
         setList(data.body);
         setSiteZoneName(data.body.zone.zoneName);
         setSiteAddress(data.body.zone.address);
         setSiteMemo(data.body.zone.memo);
         setUpdate(false);
       }
     }
   }, [data]);
 
   //site update dispaly envet
   function sitePut(e) {
     if (sitePutDisplay === false) {
       setSitePutDisplay(true);
       setCompanionTxt("");
       setSiteDisplayDone(false)
     }
   }
   // site PUT API
   async function siteUpdate(e, list) {
     let data: any = {};
     data = await HTTPUTIL.PromiseHttp({
       httpMethod: "PUT",
       appPath: `/api/v2/product/company/zone/${list.zone.zoneId}/usertree/${list.id}`,
       appQuery: {
         companyId: list.company.companyId,
         zoneName: siteZoneName,
         address: siteAddress,
         memo: siteMemo
       },
       userToken: userInfo.loginInfo.token,
     });
     if (data) {
       if (data.codeNum == CONST.API_200) {
 
         setSitePutDisplay(false);
         setUpdate(true);
       }
     }
 
   }
   // 반려 선택
   function onCompanion(e) {
     if (siteDisplayCompanion === false) {
       setSiteDisplayCompanion(true);
       setSiteDisplayDone(false);
     }
   }
   // 승인 선택
   function onDone(e) {
     if (siteDisplayDone === false) {
       setSiteDisplayDone(true);
       setSiteDisplayCompanion(false);
       setCompanionTxt("");
     }
   }
 
   //승인 - 완료
   async function siteDone(e, list) {
     let data: any = null;
     data = await HTTPUTIL.PromiseHttp({
       httpMethod: "POST",
       appPath: `/api/v2/product/usertree/user/${list.user.userIdPk}`,
       appQuery: {
         product: "zone",
         productName: list.zone.zoneName,
         productParentId: list.company.companyId,
         approval: 2,
         isontree: true
       },
       userToken: userInfo.loginInfo.token,
     });
 
     if (data) {
       if (data.codeNum == CONST.API_200) {
         alert("사업장 승인 요청이 완료 되었습니다.");
         window.location.reload();
       }
     }
 
   }
   // 반려 - 완료
   async function siteCompanion(e, list) {
     let data: any = null;
     data = await HTTPUTIL.PromiseHttp({
       httpMethod: "POST",
       appPath: `/api/v2/product/usertree/user/${list.user.userIdPk}`,
       appQuery: {
         product: "zone",
         productName: list.zone.zoneName,
         productParentId: list.company.companyId,
         approval: 0,
         deniedReason: companionTxt,
         isontree: true
       },
       userToken: userInfo.loginInfo.token,
     });
 
     if (data) {
       if (data.codeNum == CONST.API_200) {
         alert("반려 요청이 완료되었습니다.");
         window.location.reload();
       }
     }
   }
 
 
 
 
 
   return (
     <>
       {/* <!-- 사업장 승인 요청 팝업 --> */}
       {(list) &&
         <div className="popup__body">
           <div className="tbl-list type2 mt-16 ">
             <table summary="사용자 타입,회사,이름,E-mail(ID),연락처 항목으로 구성된 사업장 승인 요청자 정보 목록 입니다.">
               <caption>
                 사업장 승인 요청자 정보 목록
               </caption>
               <colgroup>
                 <col style={{}} />
               </colgroup>
               <thead className="d-sm-none">
                 <tr>
                   <th scope="col" className="txt-left">사용자 타입</th>
                   <th scope="col" className="txt-left">회사</th>
                   <th scope="col" className="txt-left">이름</th>
                   <th scope="col" className="txt-left">E-mail(ID)</th>
                   <th scope="col" className="txt-left">연락처</th>
                 </tr>
               </thead>
               <tbody className="d-sm-none">
                 <tr>
                   <td className="txt-left">{(list.user.role === "ROLE_ADMIN") ? "Admin" : (list.user.role === "ROLE_ENGINEER") ? "Engineer" : (list.user.role === "ROLE_USER") ? "User" : ""}</td>
                   <td className="txt-left">{list.user.userCompany}</td>
                   <td className="txt-left">{list.user.userName}</td>
                   <td className="txt-left">{list.user.userId}</td>
                   <td className="txt-left">{list.user.phoneNumber}</td>
                 </tr>
               </tbody>
               <tbody className="d-sm-block">
                 <tr>
                   <th scope="col" className="txt-left">사용자 타입</th>
                   <th scope="col" className="txt-left">회사</th>
                   <th scope="col" className="txt-left">이름</th>
                 </tr>
                 <tr>
                   <td className="txt-left">{(list.user.role === "ROLE_ADMIN") ? "Admin" : (list.user.role === "ROLE_ENGINEER") ? "Engineer" : (list.user.role === "ROLE_USER") ? "User" : ""}</td>
                   <td className="txt-left">{list.user.userCompany}</td>
                   <td className="txt-left">{list.user.userName}</td>
                 </tr>
                 <tr>
                   <th scope="col" colSpan={2} className="txt-left">E-mail(ID)</th>
                   <th scope="col" className="txt-left">연락처</th>
                 </tr>
                 <tr>
                   <td className="txt-left" colSpan={2}>{list.user.userId}</td>
                   <td className="txt-left">{list.user.phoneNumber}</td>
                 </tr>
               </tbody>
             </table>
           </div>
           <div className="workplace__info">
             <div className="img_workplace">
               {(list.zone.image)
                 ? <img src={list.zone.image.url} alt={list.zone.image.name} />
                 :
                 <img src={require("/static/img/img_workplace/bg_add.jpg")} alt="사진영역" />
               }
             </div>
             <div className="txt_workplace">
               <div className="page-top">
                 <h2>{list.company.companyName + " " + list.zone.zoneName}</h2>
                 <div className="top-button">
                   {/* <!--220901 수정버튼 활성화시 active 클래스 추가해주세요~--> */}
                   {(list.zone.approval == 1) &&
                     <button type="button" className={`btn-edit ${(props.sitePutDisplay) ? "active" : ""}`} onClick={(e) => sitePut(e)}><span className="hide">수정</span></button>
                   }
                 </div>
               </div>
               {(sitePutDisplay) &&
                 <ul className="form__input" >
                   <li>
                     <p className="tit">회사 명</p>
                     <div className="input__area">
                       <input type="text" id="inp1" disabled value={list.company.companyName} />
                     </div>
                   </li>
                   <li>
                     <p className="tit">사업장 명</p>
                     <div className="input__area">
                       <input type="text" id="inp2" placeholder="텍스트를 입력하세요"
                         value={siteZoneName} onChange={(e) => setSiteZoneName(e.target.value)} />
                     </div>
                   </li>
                   <li>
                     <p className="tit">사업장 주소</p>
                     <div className="input__area">
                       <div className="box__search">
                         <input type="text" className="h40"
                           placeholder="사업장 주소를 입력하세요"
                           value={siteAddress}
                           disabled
                         />
                         <button type="button"
                           className="btn btn-search"
                           data-pop="pop-postcode"
                           onClick={(e) => onClickPostCode(e)}
                         >
                           <span className="hide">조회</span>
                         </button>
                       </div>
                       {/*           <textarea className="h40" placeholder="사업장 주소를 입력하세요"
                         value={siteAddress} onChange={(e) => setSiteAddress(e.target.value)}
                       ></textarea> */}
 
                     </div>
                   </li>
                   <li>
                     <p className="tit">메모</p>
                     <div className="input__area">
                       <textarea className="h66" placeholder="메모를 입력하세요"
                         value={siteMemo} onChange={(e) => setSiteMemo(e.target.value)}
                       ></textarea>
                     </div>
                   </li>
                   <li>
                     <div className="btn__wrap right w100p">
                       <button type="button" onClick={(e) => siteUpdate(e, list)}><span>저장</span></button>
                     </div>
                   </li>
                 </ul>
               }
               {/* <!--220901 정보영역, 승인여부, 반려사유입력 추가됨--> */}
               {(!sitePutDisplay) &&
                 <ul >
                   <li>
                     <p className="tit">회사 명</p>
                     <p className="txt">{list.company.companyName}</p>
                   </li>
                   <li>
                     <p className="tit">사업장 명</p>
                     <p className="txt">{list.zone.zoneName}</p>
                   </li>
                   <li>
                     <p className="tit">사업장 주소</p>
                     <p className="txt">{list.zone.address}</p>
                   </li>
                   <li>
                     <p className="tit">메모</p>
                     <p className="txt h82">{list.zone.memo}</p>
                   </li>
                   <li>
                     <p className="tit star mt-8">승인 여부</p>
                     <div className="btn__wrap">
                       <button type="button" className={(siteDisplayDone) ? "bg-navy" : ""} onClick={(e) => onDone(e)}><span>승인</span></button>
                       <button type="button" className={(siteDisplayCompanion) ? "bg-navy" : ""} onClick={(e) => onCompanion(e)}><span>반려</span></button>
                     </div>
                   </li>
                   {(siteDisplayCompanion) &&
                     <li>
                       <p className="tit star">반려 사유 입력</p>
                       <div className="input__area">
                         <textarea placeholder="메모를 입력하세요" value={companionTxt} onChange={(e) => setCompanionTxt(e.target.value)}></textarea>
                       </div>
                     </li>
                   }
                 </ul>
               }
             </div>
           </div>
         </div>
       }
       <div className="popup__footer">
         {/* <!--비활성화시 disabled 적용해서 쓰심됩니다.--> */}
         {(companionTxt) ? // 반려 입력 시 활성화
           <button type="button" onClick={(e) => siteCompanion(e, list)}><span>완료</span></button>
           :
           (siteDisplayDone) ? // 승인 선택 시 활성화
           <button type="button" onClick={(e) => siteDone(e, list)}><span>완료</span></button>
           :
           <button type="button" disabled><span>완료</span></button>
         }
       </div>
       {/* </div> */}
       {/* <!-- //사업장 승인 요청 팝업 --> */}
     </>
   )
 }
 