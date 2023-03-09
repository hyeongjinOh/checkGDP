/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author hj O
 * @contact hjoh@detech.co.kr
 * @date 2022-08-15
 * @brief EHP 회사/사업장/세부사업장 개발
 *
 ********************************************************************/
 import React, { useEffect, useRef, useState } from "react";
 import { useAsync } from "react-async";
 // recoil
 import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
 import { userInfoLoginState } from "../../../../recoil/userState";
 
 
 // utils
 import clog from "../../../../utils/logUtils";
 import * as CONST from "../../../../utils/Const"
 import * as HTTPUTIL from "../../../../utils/api/HttpUtil"
 import * as CUTIL from "../../../../utils/commUtils"
 
 //component
 function DeviceInsertTest(props) {
   //recoil
  //  const userInfo = useRecoilValue(userInfoLoginState);
   //props
   const isMobile = props.isMobile
   const curTree = props.curTree;
   const setParentIsMobile = props.setIsMobile;
   const setParentPopWin = props.setPopWin;
   const setParentCurTree = props.setCurTree;
   const setParentWorkMode = props.setWorkMode;
   //
   //spg 선택 
   const [diveceList] = useState([
     { id: 0, fname: "VCB", },
     { id: 1, fname: "ACB", },
     { id: 2, fname: "GIS", },
     { id: 3, fname: "MoldTR", },
     { id: 4, fname: "유입식TR", },
     { id: 5, fname: "배전반", },
   ]);
   //
   const [roomName, setRoomName] = useState("");
   const [managerInfo, setManagerInfo] = useState({ "id": "", "name": "홍길순", "telNo": "000-0000-0000" });
   //
   const [resErrorCode, setResErrorCode] = useState(200);
   const [resErrorMsg, setResErrorMsg] = useState([{ field: "", msg: "" }]);
 
   const [resSpgNameMsg, setResSpgNameMsg] = useState("");
   const [resPanelMsg, setResPanelMsg] = useState("");
   const [resSerialNoMsg, setResSerialNoMsg] = useState("");
   const [resRatingVoltageMsg, setResRatingVoltageMsg] = useState("");
   const [resRatingCurrentMsg, setResRatingCurrentMsg] = useState("");
   const [resCutoffCurrentMsg, setResCutoffCurrentMsg] = useState("");
   const [resGridVoltageMsg, setResGridVoltageMsg] = useState("");
   const [resRatedCapacityMsg, setResRatedCapacityMsg] = useState("");
   const [resModelNameMsg, setResModelNameMsg] = useState("");
   //
   const [spgName, setSpgName] = useState("");
   const [panelName, setPanelName] = useState("");
   const [modelName, setModelName] = useState("");
   const [serialNo, setSerialNo] = useState("");
   const [ratingVoltage, setRatingVoltage] = useState("")
   const [ratingCurrent, setRatingCurrent] = useState("");
   const [cutoffCurrent, setCutoffCurrent] = useState("");
   const [gridVoltage, setGridVoltage] = useState("");
   const [ratedCapacity, setRatedCapacity] = useState("");
   const [memo, setMemo] = useState("");
   //
   const [elecinfo, setElecinfo] = useState([]);
   //
   const [ratingVoltageDisplay, setRatingVoltageDisplay] = useState(false);
   const [ratingCurrentDisplay, setRatingCurrentDisplay] = useState(false);
   const [cutoffCurrentDisplay, setCutoffCurrentDisplay] = useState(false);
   const [gridVoltageDisplay, setGridVoltageDisplay] = useState(false);
   const [ratedCapacityDisplay, setRatedCapacityDisplay] = useState(false);
   const [panelData, setPanelData] = useState([]);
   const [panelSelect, setPanelSelect] = useState(false);
   //
   const fileRef: any = useRef();
   const [savedFiles, setSavedFiles] = useState([]);
   const [curPos] = useState(0);
   const [listSize] = useState(10);
 
   //mobile check
   const mobileRef = useRef(null); // Mobile Check용
/*    useEffect(() => { // resize handler
     function handleResize() {
       if (CUTIL.isnull(mobileRef)) return;
       const mobileTag = mobileRef.current;
       if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
         setParentIsMobile(true);
       } else {
         setParentIsMobile(false);
       }
     }
     window.addEventListener("resize", handleResize);
     return () => {
       window.removeEventListener('resize', handleResize);
     }
   }, []); */
/*    useEffect(() => { // re-rendering mobile check
     if (CUTIL.isnull(mobileRef)) return;
     const mobileTag = mobileRef.current;
     if (!CUTIL.isnull(mobileTag)) {
       if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
         setParentIsMobile(true);
       } else {
         setParentIsMobile(false);
       }
     }
   }, []);
  */
   /* useEffect(() => {
     setParentPopWin("pop-deviceadd",
       <MobileDeviceInsert
         htmlHeader={<h1>{curTree.room.roomName}</h1>}
         isMobile ={isMobile}
         curTree={curTree}
         //
         diveceList={diveceList}
         //
         spgName={spgName}
         setSpgName={setSpgName}
         panelName={panelName}
         setPanelName={setPanelName}
         modelName={modelName}
         setModelName={setModelName}
         serialNo={serialNo}
         setSerialNo={setSerialNo}
         ratingVoltage={ratingVoltage}
         setRatingVoltage={setRatingVoltage}
         ratingCurrent={ratingCurrent}
         setRatingCurrent={setRatingCurrent}
         cutoffCurrent={cutoffCurrent}
         setCutoffCurrent={setCutoffCurrent}
         gridVoltage={gridVoltage}
         setGridVoltage={setGridVoltage}
         ratedCapacity={ratedCapacity}
         setRatedCapacity={setRatedCapacity}
         memo={memo}
         setMemo={setMemo}
         //
         elecinfo={elecinfo}
         setElecinfo={setElecinfo}
         panelData={panelData}
         setPanelData={setPanelData}
         panelSelect={panelSelect}
         setPanelSelect={setPanelSelect}
         fileRef={fileRef}
         savedFiles={savedFiles}
         setSavedFiles={setSavedFiles}
         curPos={curPos}
         listSize={listSize}
         //
         resSpgNameMsg={resSpgNameMsg}
         resPanelMsg={resPanelMsg}
         resSerialNoMsg={resSerialNoMsg}
         resRatingVoltageMsg={resRatingVoltageMsg}
         resRatingCurrentMsg={resRatingCurrentMsg}
         resCutoffCurrentMsg={resCutoffCurrentMsg}
         resGridVoltageMsg={resGridVoltageMsg}
         resRatedCapacityMsg={resRatedCapacityMsg}
         resModelNameMsg={resModelNameMsg}
         //
         ratingVoltageDisplay={ratingVoltageDisplay}
         setRatingVoltageDisplay={setRatingVoltageDisplay}
         ratingCurrentDisplay={ratingCurrentDisplay}
         setRatingCurrentDisplay={setRatingCurrentDisplay}
         cutoffCurrentDisplay={cutoffCurrentDisplay}
         setCutoffCurrentDisplay={setCutoffCurrentDisplay}
         gridVoltageDisplay={gridVoltageDisplay}
         setGridVoltageDisplay={setGridVoltageDisplay}
         ratedCapacityDisplay={ratedCapacityDisplay}
         setRatedCapacityDisplay={setRatedCapacityDisplay}
         //
         ratingVoltageDown={ratingVoltageDown}
         ratingCurrentDown={ratingCurrentDown}
         cutoffCurrentDown={cutoffCurrentDown}
         ratedCapacityDown={ratedCapacityDown}
         gridVoltageDown={gridVoltageDown}
 
         //
         onClickDeveice={onClickDeveice}
         panelSelectClick={panelSelectClick}
         handleFileUpload={handleFileUpload}
         saveFileImage={saveFileImage}
         onClickAttachFileDelete={onClickAttachFileDelete}
         onClickclose={onClickclose}
         onClickSaved={onClickSaved}
       />
     )
   }); */
 
   //
   //기기 전력 정보 API
   async function onClickDeveice(e, list) {
 
 
 
     let appPath = "spgName=" + list.fname
     let data: any = null;
     data = await HTTPUTIL.PromiseHttp({
       "httpMethod": "GET",
       "appPath": '/api/v2/product/company/zone/subzone/room/panel/item/elecinfo?' + appPath,
      //  userToken: userInfo.loginInfo.token,
       watch: appPath
     });
 
     if (data) {
       if (data.codeNum == 200) {
         setElecinfo(data.body);
         setSpgName(list.fname);
 
 
       }
     }
     onClickPanel(e, list)
   }
   // 기기분류에 따른 판넬 목록 API
   async function onClickPanel(e, list) {
     let appPath = "roomId=" + curTree.room.roomId + "&spgName=" + list.fname
 
     let data: any = null;
     data = await HTTPUTIL.PromiseHttp({
       "httpMethod": "GET",
       "appPath": '/api/v2/product/company/zone/subzone/room/panels?' + appPath,
      //  userToken: userInfo.loginInfo.token,
       watch: appPath
     });
 
     if (data) {
       if (data.codeNum == 200 || panelSelect === false) {
         setPanelData(data.body);
         setPanelSelect(true)
       }
     }
 
   }
   //판넬 Selct 클릭 이벤트
   function panelSelectClick(e, panel) {
     setPanelName(panel.panelName)
     setPanelSelect(false)
   }
 
   function handleFileUpload(e) {
     fileRef.current.click();
   }
 
   // 첨부파일 저장
   function saveFileImage(e) {
     const file = e.target.files[0]
     const formData = new FormData();
     formData.append("files", file);
     var fileVal = {
       imageId: "INS_" + savedFiles.length,
       name: file.name,
       url: URL.createObjectURL(file),
       type: "INS",
       fileForm: formData,
     }
     setSavedFiles([...savedFiles, fileVal]);
     e.target.value = '';
   };
 
   //
   function onClickAttachFileDelete(delFile) {
     //var delFile = savedFiles[idx];
     if (!delFile.hasOwnProperty("type")) {
       URL.revokeObjectURL(delFile.url);
     }
     setSavedFiles(savedFiles.filter(file => file.imageId !== delFile.imageId));
   }
   
   let savedFilesArr = [];
 
   for (let i = 0; i < savedFiles.length; i++) {
     savedFilesArr.push(savedFiles[i].length);//spg이름
   }
 
   let savedFilesArrArray = [...savedFilesArr,]
   // console.log("savedFilesArrArray", savedFilesArrArray.length)
 
   async function onClickSaved(e, spgName) {
     let data: any = null;
     data = await HTTPUTIL.PromiseHttp({
       "httpMethod": "POST",
       appPath: '/api/v2/product/company/zone/subzone/room/panel/item',
       appQuery: {
        //  roomId: curTree.room.roomId,
         spgName: spgName,
         panelName: panelName,
         modelName: modelName,
         serialNo: serialNo,
         memo: memo,
         ratingVoltage: ratingVoltage,
         ratingCurrent: ratingCurrent,
         cutoffCurrent: cutoffCurrent,
         gridVoltage: gridVoltage,
         ratedCapacity: ratedCapacity
       },
      //  userToken: userInfo.loginInfo.token,
     });
     if (data) {
       if (data.codeNum == 200) {
         // setItemId(data.body.itemId)
         savedFiles.map((file, idx) => {
           if (file.hasOwnProperty("type") && (file.type == "INS")) {
             saveFiles(data.body.itemId, file.fileForm);
           }
         });
       } else {
         // 
         clog("error - join");
 
         setResErrorCode(data.codeNum);
         setResErrorMsg(data.errorList);
         setResSpgNameMsg("");
         setResPanelMsg("");
         setResSerialNoMsg("");
         setResRatingVoltageMsg("");
         setResRatingCurrentMsg("");
         setResCutoffCurrentMsg("");
         setResGridVoltageMsg("");
         setResRatedCapacityMsg("");
         setResModelNameMsg("");
 
         data.errorList.map((errMsg) => {
           errMsg.field === ("spgName") && setResSpgNameMsg(errMsg.msg);
           errMsg.field === ("panelName") && setResPanelMsg(errMsg.msg);
           errMsg.field === ("serialNo") && setResSerialNoMsg(errMsg.msg);
           errMsg.field === ("ratingVoltage") && setResRatingVoltageMsg(errMsg.msg);
           errMsg.field === ("ratingCurrent") && setResRatingCurrentMsg(errMsg.msg);
           errMsg.field === ("cutoffCurrent") && setResCutoffCurrentMsg(errMsg.msg);
           errMsg.field === ("gridVoltage") && setResGridVoltageMsg(errMsg.msg);
           errMsg.field === ("ratedCapacity") && setResRatedCapacityMsg(errMsg.msg);
           errMsg.field === ("modelName") && setResModelNameMsg(errMsg.msg);
         });
       }
     }
   }
 
   async function saveFiles(itemId, fileFormData) {
     let data: any = null;
     data = await HTTPUTIL.PromiseHttp({
       "httpMethod": "POST",
       "appPath": `/api/v2/product/company/zone/subzone/room/panel/item/images?itemId=${itemId}`,
       appQuery: fileFormData,
      //  userToken: userInfo.loginInfo.token,
     });
     if (data) {
       if (data.codeNum == 200) {
         console.log("IN CHECK ITEM LAST : saveFiles : ", data);
         setParentWorkMode("LIST");
         var btnCommentClose = document.getElementById("pop-deviceadd");
         var body = document.body
         if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
         if (!CUTIL.isnull(body)) body.setAttribute("style","overflow-y: auto;")
       } else { // api if
         // need error handle
       }
     }
     //return data;
 
   }
   //
   function ratingVoltageDown(e) {
     setRatingVoltageDisplay(true);
   }
   function ratingCurrentDown(e) {
     setRatingCurrentDisplay(true);
   }
   function cutoffCurrentDown(e) {
     setCutoffCurrentDisplay(true);
   }
   function ratedCapacityDown(e) {
     setRatedCapacityDisplay(true);
   }
   function gridVoltageDown(e) {
     setGridVoltageDisplay(true);
   }
 
 
 
 
   //
   function onClickclose(e) {
     setParentWorkMode("LIST");
     var btnCommentClose = document.getElementById("pop-deviceadd");
     var body = document.body
     if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
     if (!CUTIL.isnull(body)) body.setAttribute("style","overflow-y: auto;")
   }
 
   function onClickDeviceTab(e, workMode) {
     setParentWorkMode(workMode);
   }
 
 
 
   const elecinfos = (elecinfo == null) ? null : elecinfo;
   const panels = (panelData == null) ? null : panelData;
 
   return (
     <>
       {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)-->*/}
       {
         <div className="area__right" ref={mobileRef}>
           <ul className="page-loca">
           {/*   <li>{curTree.company.companyName}</li>
             <li>{curTree.zone.zoneName}</li>
             <li>{curTree.subZone.subZoneName}</li>
             <li>{curTree.room.roomName}</li> */}
           </ul>
           {/* <h2>{curTree.room.roomName}</h2> */}
           <div className="inline mb-18">
             {/*<!--목록이동 버튼, 활성화되면 active 클래스 추가-->*/}
             <a className="move-list"
               onClick={(e) => onClickDeviceTab(e, "LIST")}>
               Device List
             </a>
             <ul className="tab__small">
               {/*<!-- 선택된 탭 on -->*/}
               <li>
                 <a className="icon-add"
                   onClick={(e) => onClickDeviceTab(e, "BATCH")}>
                   일괄등록
                 </a>
               </li>
               <li className="on"><a className="icon-pen">개별등록</a></li>
             </ul>
           </div>
 
           {/*<!--area__right_content, 오른쪽 컨텐츠 영역-->*/}
           <div className="area__right_content hcal-170">
             <div className="content__info">
               <h3 className="hide">개별등록 정보 입력</h3>
               <ul className="form__input">
                 <li className="d-lm-block">
                   <p className="tit" ><span className="hide">카드 스캔</span></p>
                   <div className="input__area">
                     <button type="button" className="btn-scan js-open-m" data-pop="pop-scan" onClick={(e) => CUTIL.jsopen_m_Popup(e)}><span>카드 스캔</span></button>
                   </div>
                 </li>
                 <li>
                   <p className="tit star">기기명</p>
                   <div className="input__area">
                     {/*<!-- devicetype 웹용 -->*/}
                     <div className="devicetype">
                       {/*<!--클릭한 개체에 active-->*/}
                       <div className={`swiper-wrapper ${(resSpgNameMsg.length <= 0) ? "" : "errorpoint"} `}>
                         {/*<!--220812, 버튼 에러일경우 / className="errorpoint" 추가 (작업덜됨) -->*/}
                         {diveceList.map((list) => (
                           <div key={list.id} className="swiper-slide">
                             <button type="button" onClick={(e) => onClickDeveice(e, list)}>
                               {list.fname}
                             </button>
                           </div>
                         ))}
                         <p className="input-errortxt">{resSpgNameMsg}</p>
                       </div>
                     </div>
                     {/*<!-- devicetype Swiper/975px부터 노출 -->*/}
                     <div className="devicetype swiper mySwiper2">
                       {/*<!--클릭한 개체에 active-->*/}
                       <div className={`swiper-wrapper ${(resSpgNameMsg.length <= 0) ? "" : "errorpoint"}`}>
                         {diveceList.map((list) => (
                           <div key={list.id} className="swiper-slide">
                             <button type="button" onClick={(e) => onClickDeveice(e, list)}>
                               {list.fname}
                             </button>
                           </div>
                         ))}
                         <p className="input-errortxt">{resSpgNameMsg}</p>
                       </div>
                     </div>
                   </div>
                 </li>
                 <li>
                   <p className="tit star">Panel 명</p>
                   {((spgName == "GIS") || (spgName == "유입식TR")) &&
                     <div className="input__area">
                       < input type="text" disabled value={panelName} onChange={(e) => setPanelName(e.target.value)} />
                     </div>
                   }
                   {((spgName !== "GIS") && (spgName !== "유입식TR")) &&
                     <div className={`input__area ${(panelSelect) ? "autocomplete" : ""}`}>
                       <input type="text" id="inp1" placeholder="텍스트를 입력하세요" onClick={() => setPanelSelect(!panelSelect)}
                         value={panelName} onChange={(e) => setPanelName(e.target.value)}
                         className={` ${(resPanelMsg.length <= 0) ? "" : "input-error"}`}
                       />
                       <p className="input-errortxt">{resPanelMsg}</p>
                       {(panelSelect) &&
                         <ul className="autocomplete-box">
                           {panels.map((panel) => (
                             <li key={panel.panelId} >
                               <a onClick={(e) => panelSelectClick(e, panel)}><span className="highlight"></span>{panel.panelName}</a>
                             </li>
                           ))}
                         </ul>
                       }
 
                     </div>
                   }
                 </li>
                 <li>
                   <p className="tit star">모델 명</p>
                   <div className="input__area">
                     {(spgName == "배전반") &&
                       < input type="text" disabled />
                     }
                     {(spgName !== "배전반") &&
                       <input type="text" id="inp2" placeholder="텍스트를 입력하세요"
                         value={modelName} onChange={(e) => setModelName(e.target.value)}
                         className={(resModelNameMsg.length <= 0) ? "" : "input-error"}
                       />
                     }
                     <p id="inp3" className="input-errortxt">{resModelNameMsg}</p>
                   </div>
                 </li>
                 <li>
                   <p className="tit star">시리얼 번호</p>
                   <div className="input__area">
                     <input type="text" id="inp3" placeholder="텍스트를 입력하세요"
                       value={serialNo} onChange={(e) => setSerialNo(e.target.value)}
                       className={(resSerialNoMsg.length <= 0) ? "" : "input-error"}
                     />
                     <p className="input-errortxt">{resSerialNoMsg}</p>
                   </div>
                 </li>
                 {/* <!--220812, Autocomplete / 기존의 input__area 에 autocomplete 클래스를 추가하고, 인풋아래에 ul 태그 부분을 넣어주세요--> */}
                 {/* 정격전압 */}
                 {elecinfos.filter((list) => (list.code == 'ratingVoltage')).map((list, idx) => (
                   <li key={idx}>
                     <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                     <div className={`input__area ${(ratingVoltage && ratingVoltageDisplay) ? "autocomplete" : ""}`} >
                       <input type="text" id="inp4" placeholder="텍스트를 입력하세요"
                         value={ratingVoltage} onChange={(e) => setRatingVoltage(e.target.value)}
                         onKeyDown={(e) => ratingVoltageDown(e)}
                         className={(resRatingVoltageMsg.length <= 0) ? "" : "input-error"}
                       />
                       <p className="input-errortxt">{resRatingVoltageMsg}</p>
                       {(ratingVoltage && ratingVoltageDisplay) &&
                         <ul className="autocomplete-box">
                           <RatingVoltageAutoCompltet
                             values={list.values}
                             ratingVoltage={ratingVoltage}
                             setRatingVoltage={setRatingVoltage}
                             ratingVoltageDisplay={ratingVoltageDisplay}
                             setRatingVoltageDisplay={setRatingVoltageDisplay}
                           />
 
                         </ul>
                       }
                     </div>
                   </li>
                 ))}
                 {/* 정격전류 */}
                 {elecinfos.filter((list) => (list.code == 'ratingCurrent')).map((list, idx) => (
                   <li key={idx}>
                     <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                     <div className={`input__area ${(ratingCurrent && ratingCurrentDisplay) ? "autocomplete" : ""}`} >
                       <input type="text" id="inp5" placeholder="텍스트를 입력하세요"
                         value={ratingCurrent} onChange={(e) => setRatingCurrent(e.target.value)}
                         onKeyDown={(e) => ratingCurrentDown(e)}
                         className={(resRatingCurrentMsg.length <= 0) ? "" : "input-error"}
                       />
                       <p className="input-errortxt">{resRatingCurrentMsg}</p>
                       {(ratingCurrent && ratingCurrentDisplay) &&
                         <ul className="autocomplete-box">
                           <RatingCurrentAutoCompltet
                             values={list.values}
                             ratingCurrent={ratingCurrent}
                             setRatingCurrent={setRatingCurrent}
                             ratingCurrentDisplay={ratingCurrentDisplay}
                             setRatingCurrentDisplay={setRatingCurrentDisplay}
                           />
 
                         </ul>
                       }
                     </div>
                   </li>
                 ))}
                 {/* 차단전류 */}
                 {elecinfos.filter((list) => (list.code == "cutoffCurrent")).map((list, idx) => (
                   <li key={idx}>
                     <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                     <div className={`input__area ${(cutoffCurrent && cutoffCurrentDisplay) ? "autocomplete" : ""}`} >
                       <input type="text" id="inp6" placeholder="텍스트를 입력하세요"
                         value={cutoffCurrent} onChange={(e) => setCutoffCurrent(e.target.value)}
                         onKeyDown={(e) => cutoffCurrentDown(e)}
                         className={(resCutoffCurrentMsg.length <= 0) ? "" : "input-error"}
                       />
                       <p className="input-errortxt">{resCutoffCurrentMsg}</p>
                       {(cutoffCurrent&&cutoffCurrentDisplay) &&
                         <ul className="autocomplete-box">
                           <CutoffCurrentAutoCompltet
                             values={list.values}
                             cutoffCurrent={cutoffCurrent}
                             setCutoffCurrent={setCutoffCurrent}
                             cutoffCurrentDisplay={cutoffCurrentDisplay}
                             setCutoffCurrentDisplay={setCutoffCurrentDisplay}
                           />
 
                         </ul>
                       }
                     </div>
                   </li>
                 ))}
                 {/* 계통전압 */}
                 {elecinfos.filter((list) => (list.code == "ratedCapacity")).map((list, idx) => (
                   <li key={idx}>
                     <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                     <div className={`input__area ${(ratedCapacity && ratedCapacityDisplay) ? "autocomplete" : ""}`} >
                       <input type="text" id="inp8" placeholder="텍스트를 입력하세요"
                         value={ratedCapacity} onChange={(e) => setRatedCapacity(e.target.value)}
                         onKeyDown={(e) => ratedCapacityDown(e)}
                         className={(resRatedCapacityMsg.length <= 0) ? "" : "input-error"}
                       />
                       <p className="input-errortxt">{resRatedCapacityMsg}</p>
                       {(ratedCapacity && ratedCapacityDisplay) &&
                         <ul className="autocomplete-box">
                           <RatedCapacityyAutoCompltet
                             values={list.values}
                             ratedCapacity={ratedCapacity}
                             setRatedCapacity={setRatedCapacity}
                             ratedCapacityDisplay={ratedCapacityDisplay}
                             setRatedCapacityDisplay={setRatedCapacityDisplay}
                           />
 
                         </ul>
                       }
                     </div>
                   </li>
                 ))}
                 {/* 정격용량 */}
                 {elecinfos.filter((list) => (list.code == "gridVoltage")).map((list, idx) => (
                   <li key={idx}>
                     <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                     <div className={`input__area ${(gridVoltage && gridVoltageDisplay) ? "autocomplete" : ""}`} >
                       <input type="text" id="inp7" placeholder="텍스트를 입력하세요"
                         value={gridVoltage} onChange={(e) => setGridVoltage(e.target.value)}
                         onKeyDown={(e) => gridVoltageDown(e)}
                         className={(resGridVoltageMsg.length <= 0) ? "" : "input-error"}
                       />
                       <p className="input-errortxt">{resGridVoltageMsg}</p>
                       {(gridVoltage && gridVoltageDisplay) &&
                         <ul className="autocomplete-box">
                           <GridVoltageAutoCompltet
                             values={list.values}
                             gridVoltage={gridVoltage}
                             setGridVoltage={setGridVoltage}
                             gridVoltageDisplay={gridVoltageDisplay}
                             setGridVoltageDisplay={setGridVoltageDisplay}
                           />
 
                         </ul>
                       }
                     </div>
                   </li>
                 ))}
                 <li>
                   <p className="tit">첨부파일</p>
                   <div className="input__area">
                     <div className="filebox">
                       <input className="upload-name" placeholder="사진을 첨부하세요" />
                       <label onClick={(e) => handleFileUpload(e)}><span className="hide">파일찾기</span></label>
                       <input ref={fileRef} className="upload-name" type="file" id="file"
                         accept="image/jpg, image/jpeg, image/png" onChange={(e) => saveFileImage(e)} />
                     </div>
                     <ul className="filelist">
                       {savedFiles.filter((file, idx) => (idx >= curPos) && ((idx < curPos + listSize))).map((img) => (
                         <li key={img.imageId}>
                           <span>{img.name}</span>
                           <button type="button" className="btn btn-delete" onClick={(e) => onClickAttachFileDelete(img)}>
                             <span className="hide" >삭제</span>
                           </button>
                         </li>
                       ))}
                     </ul>
                   </div>
                 </li>
                 <li>
                   <p className="tit">메모</p>
                   <div className="input__area">
                     <textarea placeholder="메모를 입력하세요" value={memo} onChange={(e) => setMemo(e.target.value)}></textarea>
                   </div>
                 </li>
               </ul>
             </div>
             <div className="btn__wrap ml-0">
               <button type="button" className="bg-gray" onClick={(e) => onClickclose(e)} ><span>취소</span></button>
               <button type="button" onClick={(e) => onClickSaved(e, spgName)}><span>저장</span></button>
             </div>
           </div>
           {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
         </div>
       }
       {/*<!--//area__right, 오른쪽 영역-->*/}
 
       {/* <!-- scan 팝업 --> */}
       <ScanpPop />
       {/* <!-- //scan 팝업 --> */}
     </>
   )
 };
 export default DeviceInsertTest;

 function MobileDeviceInsert(props) {
   //
   const curTree = props.curTree;
   const isMobile = props.isMobile
   //
   const resSpgNameMsg = props.resSpgNameMsg;
   const resPanelMsg = props.resPanelMsg;
   const resSerialNoMsg = props.resSerialNoMsg;
   const resRatingVoltageMsg = props.resRatingVoltageMsg;
   const resRatingCurrentMsg = props.resRatingCurrentMsg;
   const resCutoffCurrentMsg = props.resCutoffCurrentMsg;
   const resGridVoltageMsg = props.resGridVoltageMsg;
   const resRatedCapacityMsg = props.resRatedCapacityMsg;
   const resModelNameMsg = props.resModelNameMsg;
   //
   const diveceList = props.diveceList;
   //
   const spgName = props.spgName;
   const panelName = props.panelName;
   const setPanelName = props.setPanelName;
   const modelName = props.modelName;
   const setModelName = props.setModelName;
   const serialNo = props.serialNo;
   const setSerialNo = props.setSerialNo;
   const ratingVoltage = props.ratingVoltage;
   const setRatingVoltage = props.setRatingVoltage;
   const ratingCurrent = props.ratingCurrent;
   const setRatingCurrent = props.setRatingCurrent;
   const cutoffCurrent = props.cutoffCurrent;
   const setCutoffCurrent = props.setCutoffCurrent;
   const gridVoltage = props.gridVoltage;
   const setGridVoltage = props.setGridVoltage;
   const ratedCapacity = props.ratedCapacity;
   const setRatedCapacity = props.setRatedCapacity;
   const memo = props.memo;
   const setMemo = props.setMemo;
   //
   const ratingVoltageDisplay = props.ratingVoltageDisplay;
   const setRatingVoltageDisplay = props.setRatingVoltageDisplay;
   const ratingCurrentDisplay = props.ratingCurrentDisplay;
   const setRatingCurrentDisplay = props.setRatingCurrentDisplay;
   const cutoffCurrentDisplay = props.cutoffCurrentDisplay;
   const setCutoffCurrentDisplay = props.setCutoffCurrentDisplay;
   const gridVoltageDisplay = props.gridVoltageDisplay;
   const setGridVoltageDisplay = props.setGridVoltageDisplay;
   const ratedCapacityDisplay = props.ratedCapacityDisplay;
   const setRatedCapacityDisplay = props.setRatedCapacityDisplay;
   //
   const ratingVoltageDown = props.ratingVoltageDown;
   const ratingCurrentDown = props.ratingCurrentDown;
   const cutoffCurrentDown = props.cutoffCurrentDown;
   const ratedCapacityDown = props.ratedCapacityDown;
   const gridVoltageDown = props.gridVoltageDown;
   //
   const elecinfo = props.elecinfo
   const panelData = props.panelData
   const setPanelSelect = props.setPanelSelect
   const panelSelect = props.panelSelect
   const fileRef = props.fileRef
   const savedFiles = props.savedFiles
   const setSavedFiles=props.setSavedFiles
   const curPos = props.curPos
   const listSize = props.listSize
   //
   const onClickDeveice = props.onClickDeveice
   const panelSelectClick = props.panelSelectClick
   const handleFileUpload = props.handleFileUpload
   const saveFileImage = props.saveFileImage
   const onClickAttachFileDelete = props.onClickAttachFileDelete
   const onClickclose = props.onClickclose
   const onClickSaved = props.onClickSaved
   //
  
   function onSumit(e){
  
  
  }
 
   const elecinfos = (elecinfo == null) ? null : elecinfo;
 
   return (
     <>
       {/*<!--개별 등록 팝업 -->*/}
       < div className="popup__body" >
         <div className="area__right_content workplace__info info__input">
           <div className="content__info">
             <h3 className="hide">개별등록 정보 입력</h3>
             <ul className="form__input">
               <li className="d-lm-block">
                 <p className="tit"><span className="hide">카드 스캔</span></p>
                 <div className="input__area">
                   <button type="button" className="btn-scan js-open-m" data-pop="pop-scan" onClick={(e) => CUTIL.jsopen_m_Popup(e)} ><span>카드 스캔</span></button>
                 </div>
               </li>
               <li>
                 <p className="tit star">기기 명</p>
                 <div className="input__area">
                   {/*<!-- devicetype 웹용 -->*/}
                   <div className="devicetype">
                     {/*<!--클릭한 개체에 active-->*/}
                     <div className={`swiper-wrapper ${(resSpgNameMsg.length <= 0) ? "" : "errorpoint"} `}>
                       {/*<!--220812, 버튼 에러일경우 / className="errorpoint" 추가 (작업덜됨) -->*/}
                       {diveceList.map((list) => (
                         <div key={list.id} className="swiper-slide">
                           <button type="button" onClick={(e) => onClickDeveice(e, list)}>
                             {list.fname}
                           </button>
                         </div>
                       ))}
                       <p className="input-errortxt">{resSpgNameMsg}</p>
                     </div>
                   </div>
                   {/*<!-- devicetype Swiper/975px부터 노출 -->*/}
                   <div className="devicetype swiper mySwiper2">
                     {/*<!--클릭한 개체에 active-->*/}
                     <div className={`swiper-wrapper ${(resSpgNameMsg.length <= 0) ? "" : "errorpoint"} `}>
                       {/*<!--220812, 버튼 에러일경우 / className="errorpoint" 추가 (작업덜됨) -->*/}
                       {diveceList.map((list) => (
                         <div key={list.id} className="swiper-slide">
                           <button type="button" onClick={(e) => onClickDeveice(e, list)}>
                             {list.fname}
                           </button>
                         </div>
                       ))}
                       <p className="input-errortxt">{resSpgNameMsg}</p>
                     </div>
                   </div>
                 </div>
               </li>
 
               <li>
                 <p className="tit star">Panel 명</p>
                 {((spgName == "GIS") || (spgName == "유입식TR")) &&
                   <div className="input__area">
                     < input type="text" disabled value={panelName} onChange={(e) => setPanelName(e.target.value)} />
                   </div>
                 }
                 {((spgName !== "GIS") && (spgName !== "유입식TR")) &&
                   <div className={`input__area ${(panelSelect) ? "autocomplete" : ""}`}>
                     <input type="text" id="inp1" placeholder="텍스트를 입력하세요" onClick={() => setPanelSelect(!panelSelect)}
                       value={panelName} onChange={(e) => setPanelName(e.target.value)}
                       className={` ${(resPanelMsg.length <= 0) ? "" : "input-error"}`}
                     />
                     <p className="input-errortxt">{resPanelMsg}</p>
                     {(panelSelect) &&
                       <ul className="autocomplete-box">
                         {panelData.map((panel) => (
                           <li key={panel.panelId} >
                             <a onClick={(e) => panelSelectClick(e, panel)}><span className="highlight"></span>{panel.panelName}</a>
                           </li>
                         ))}
                       </ul>
                     }
 
                   </div>
                 }
               </li>
               <li>
                 <p className="tit star">모델 명</p>
                 <div className="input__area">
                   {(spgName == "배전반") &&
                     < input type="text" disabled />
                   }
                   {(spgName !== "배전반") &&
                     <input type="text" id="inp2" placeholder="텍스트를 입력하세요"
                       value={modelName} onChange={(e) => setModelName(e.target.value)}
                       className={(resModelNameMsg.length <= 0) ? "" : "input-error"}
                     />
                   }
                   <p id="inp3" className="input-errortxt">{resModelNameMsg}</p>
                 </div>
               </li>
               <li>
                 <p className="tit star">시리얼 번호</p>
                 <div className="input__area">
                   <input type="text" id="inp3" placeholder="텍스트를 입력하세요"
                     value={serialNo} onChange={(e) => setSerialNo(e.target.value)}
                     className={(resSerialNoMsg.length <= 0) ? "" : "input-error"}
                   />
                   <p className="input-errortxt">{resSerialNoMsg}</p>
                 </div>
               </li>
               {/* <!--220812, Autocomplete / 기존의 input__area 에 autocomplete 클래스를 추가하고, 인풋아래에 ul 태그 부분을 넣어주세요--> */}
               {/* 정격전압 */}
               {elecinfos.filter((list) => (list.code == 'ratingVoltage')).map((list, idx) => (
                 <li key={idx}>
                   <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                   <div className={`input__area ${(ratingVoltage && ratingVoltageDisplay) ? "autocomplete" : ""}`} >
                     <input type="text" id="inp4" placeholder="텍스트를 입력하세요"
                       value={ratingVoltage} onChange={(e) => setRatingVoltage(e.target.value)}
                       onKeyDown={(e) => ratingVoltageDown(e)}
                       className={(resRatingVoltageMsg.length <= 0) ? "" : "input-error"}
                     />
                     <p className="input-errortxt">{resRatingVoltageMsg}</p>
                     {(ratingVoltage && ratingVoltageDisplay) &&
                       <ul className="autocomplete-box">
                         <RatingVoltageAutoCompltet
                           values={list.values}
                           ratingVoltage={ratingVoltage}
                           setRatingVoltage={setRatingVoltage}
                           ratingVoltageDisplay={ratingVoltageDisplay}
                           setRatingVoltageDisplay={setRatingVoltageDisplay}
                         />
 
                       </ul>
                     }
                   </div>
                 </li>
               ))}
               {/* 정격전류 */}
               {elecinfos.filter((list) => (list.code == 'ratingCurrent')).map((list, idx) => (
                 <li key={idx}>
                   <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                   <div className={`input__area ${(ratingCurrent && ratingCurrentDisplay) ? "autocomplete" : ""}`} >
                     <input type="text" id="inp5" placeholder="텍스트를 입력하세요"
                       value={ratingCurrent} onChange={(e) => setRatingCurrent(e.target.value)}
                       onKeyDown={(e) => ratingCurrentDown(e)}
                       className={(resRatingCurrentMsg.length <= 0) ? "" : "input-error"}
                     />
                     <p className="input-errortxt">{resRatingCurrentMsg}</p>
                     {(ratingCurrent && ratingCurrentDisplay) &&
                       <ul className="autocomplete-box">
                         <RatingCurrentAutoCompltet
                           values={list.values}
                           ratingCurrent={ratingCurrent}
                           setRatingCurrent={setRatingCurrent}
                           ratingCurrentDisplay={ratingCurrentDisplay}
                           setRatingCurrentDisplay={setRatingCurrentDisplay}
                         />
 
                       </ul>
                     }
                   </div>
                 </li>
               ))}
               {/* 차단전류 */}
               {elecinfos.filter((list) => (list.code == "cutoffCurrent")).map((list, idx) => (
                 <li key={idx}>
                   <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                   <div className={`input__area ${(cutoffCurrent && cutoffCurrentDisplay) ? "autocomplete" : ""}`} >
                     <input type="text" id="inp6" placeholder="텍스트를 입력하세요"
                       value={cutoffCurrent} onChange={(e) => setCutoffCurrent(e.target.value)}
                       onKeyDown={(e) => cutoffCurrentDown(e)}
                       className={(resCutoffCurrentMsg.length <= 0) ? "" : "input-error"}
                     />
                     <p className="input-errortxt">{resCutoffCurrentMsg}</p>
                     {(cutoffCurrent&&cutoffCurrentDisplay) &&
                       <ul className="autocomplete-box">
                         <CutoffCurrentAutoCompltet
                           values={list.values}
                           cutoffCurrent={cutoffCurrent}
                           setCutoffCurrent={setCutoffCurrent}
                           cutoffCurrentDisplay={cutoffCurrentDisplay}
                           setCutoffCurrentDisplay={setCutoffCurrentDisplay}
                         />
 
                       </ul>
                     }
                   </div>
                 </li>
               ))}
               {/* 계통전압 */}
               {elecinfos.filter((list) => (list.code == "ratedCapacity")).map((list, idx) => (
                 <li key={idx}>
                   <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                   <div className={`input__area ${(ratedCapacity && ratedCapacityDisplay) ? "autocomplete" : ""}`} >
                     <input type="text" id="inp8" placeholder="텍스트를 입력하세요"
                       value={ratedCapacity} onChange={(e) => setRatedCapacity(e.target.value)}
                       onKeyDown={(e) => ratedCapacityDown(e)}
                       className={(resRatedCapacityMsg.length <= 0) ? "" : "input-error"}
                     />
                     <p className="input-errortxt">{resRatedCapacityMsg}</p>
                     {(ratedCapacity && ratedCapacityDisplay) &&
                       <ul className="autocomplete-box">
                         <RatedCapacityyAutoCompltet
                           values={list.values}
                           ratedCapacity={ratedCapacity}
                           setRatedCapacity={setRatedCapacity}
                           ratedCapacityDisplay={ratedCapacityDisplay}
                           setRatedCapacityDisplay={setRatedCapacityDisplay}
                         />
 
                       </ul>
                     }
                   </div>
                 </li>
               ))}
               {/* 정격용량 */}
               {elecinfos.filter((list) => (list.code == "gridVoltage")).map((list, idx) => (
                 <li key={idx}>
                   <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                   <div className={`input__area ${(gridVoltage && gridVoltageDisplay) ? "autocomplete" : ""}`} >
                     <input type="text" id="inp7" placeholder="텍스트를 입력하세요"
                       value={gridVoltage} onChange={(e) => setGridVoltage(e.target.value)}
                       onKeyDown={(e) => gridVoltageDown(e)}
                       className={(resGridVoltageMsg.length <= 0) ? "" : "input-error"}
                     />
                     <p className="input-errortxt">{resGridVoltageMsg}</p>
                     {(gridVoltage && gridVoltageDisplay) &&
                       <ul className="autocomplete-box">
                         <GridVoltageAutoCompltet
                           values={list.values}
                           gridVoltage={gridVoltage}
                           setGridVoltage={setGridVoltage}
                           gridVoltageDisplay={gridVoltageDisplay}
                           setGridVoltageDisplay={setGridVoltageDisplay}
                         />
 
                       </ul>
                     }
                   </div>
                 </li>
               ))}
               <li>
                 <p className="tit">첨부파일</p>
                 <div className="input__area">
                   <div className="filebox">
                     <input className="upload-name" placeholder="사진을 첨부하세요" />
                     <label className="js-open-s-in" data-pop="pop-capture" onClick={(e) => CUTIL.jsopen_s_in_Popup(e,isMobile)}><span className="hide">파일찾기</span></label>
                     <input ref={fileRef} className="upload-name" type="file" id="file"
                       accept="image/jpg, image/jpeg, image/png" onChange={(e) => saveFileImage(e)} />
                   </div>
                   <ul className="filelist">
                     {savedFiles.filter((file, idx) => (idx >= curPos) && ((idx < curPos + listSize))).map((img) => (
                       <li key={img.imageId}>
                         <span>{img.name}</span>
                         <button type="button" className="btn btn-delete" onClick={(e) => onClickAttachFileDelete(img)}>
                           <span className="hide" >삭제</span>
                         </button>
                       </li>
                     ))}
                   </ul>
                 </div>
               </li>
               <li>
                 <p className="tit">메모</p>
                 <div className="input__area">
                   <textarea placeholder="메모를 입력하세요" value={memo} onChange={(e) => setMemo(e.target.value)}></textarea>
                 </div>
               </li>
             </ul>
           </div>
           <div className="btn__wrap mt-32">
             <button type="button" className="bg-gray js-close" onClick={(e) => onClickclose(e)}><span>취소</span></button>
             <button type="button" onClick={(e) => onClickSaved(e, spgName)}><span>저장</span></button>
           </div>
         </div >
       </div >
       {/*<!-- //개별 등록 팝업 -->*/}
       <CapturePop 
       savedFiles = {savedFiles}
       setSavedFiles= {setSavedFiles}
        />
     </>
   )
 }
 
 
 
 
 //전격전압 vules
 function RatingVoltageAutoCompltet(props) {
   const data = props.values;
   const ratingVoltage = props.ratingVoltage;
   const setRatingVoltage = props.setRatingVoltage;
   const ratingVoltageDisplay = props.ratingVoltageDisplay;
   const setRatingVoltageDisplay = props.setRatingVoltageDisplay;
   //
   function autoClick(e, data) {
     setRatingVoltage(data)
     setRatingVoltageDisplay(false)
   }
   //
   return (
     <>
       {(ratingVoltage && ratingVoltageDisplay) && data.filter((data) => (data.indexOf(ratingVoltage.toLowerCase()) > -1)).map((data, idx) => (
         <li key={idx}>
           <a onClick={(e) => autoClick(e, data)}>
             < span className="highlight">{data}</span>
           </a>
         </li>
       ))
       }
 
     </>
   )
 }
 //전격전압 vules
 function RatingCurrentAutoCompltet(props) {
   const data = props.values;
   const ratingCurrent = props.ratingCurrent;
   const setRatingCurrent = props.setRatingCurrent;
   const ratingCurrentDisplay = props.ratingCurrentDisplay;
   const setRatingCurrentDisplay = props.setRatingCurrentDisplay;
   //
   function autoClick(e, data) {
     setRatingCurrent(data)
     setRatingCurrentDisplay(false)
   }
   //
   return (
     <>
       {(ratingCurrent&&ratingCurrentDisplay) && data.filter((data) => (data.indexOf(ratingCurrent.toLowerCase()) > -1)).map((data, idx) => (
         <li key={idx}>
           <a onClick={(e) => autoClick(e, data)} ><span className="highlight">{data}</span></a>
         </li>
       ))}
 
     </>
   )
 }
 //차단전류 vules 
 function CutoffCurrentAutoCompltet(props) {
   const data = props.values
   const cutoffCurrent = props.cutoffCurrent;
   const setCutoffCurrent = props.setCutoffCurrent;
   const cutoffCurrentDisplay = props.cutoffCurrentDisplay;
   const setCutoffCurrentDisplay = props.setCutoffCurrentDisplay;
   //
   function autoClick(e, data) {
     setCutoffCurrent(data)
     setCutoffCurrentDisplay(false)
   }
   //
   return (
     <>
       {(cutoffCurrent&&cutoffCurrentDisplay) && data.filter((data) => (data.indexOf(cutoffCurrent.toLowerCase()) > -1)).map((data, idx) => (
         <li key={idx}>
           <a onClick={(e) => autoClick(e, data)} ><span className="highlight">{data}</span></a>
         </li>
       ))}
 
     </>
   )
 }
 //계통전압 vules
 function RatedCapacityyAutoCompltet(props) {
   const data = props.values
   const ratedCapacity = props.ratedCapacity;
   const setRatedCapacity = props.setRatedCapacity;
   const ratedCapacityDisplay = props.ratedCapacityDisplay;
   const setRatedCapacityDisplay = props.setRatedCapacityDisplay;
   //
   function autoClick(e, data) {
     setRatedCapacity(data)
     setRatedCapacityDisplay(false)
   }
   //
   return (
     <>
       {(ratedCapacity&&ratedCapacityDisplay) && data.filter((data) => (data.indexOf(ratedCapacity.toLowerCase()) > -1)).map((data, idx) => (
         <li key={idx}>
           <a onClick={(e) => autoClick(e, data)}><span className="highlight">{data}</span></a>
         </li>
       ))}
 
     </>
   )
 }
 //정격용량 vules
 function GridVoltageAutoCompltet(props) {
   const data = props.values;
   const gridVoltage = props.gridVoltage;
   const setGridVoltage = props.setGridVoltage;
   const gridVoltageDisplay = props.gridVoltageDisplay;
   const setGridVoltageDisplay = props.setGridVoltageDisplay;
 
   function autoClick(e, data) {
     setGridVoltage(data)
     setGridVoltageDisplay(false)
   }
   return (
     <>
       {(gridVoltage&&gridVoltageDisplay) && data.filter((data) => (data.indexOf(gridVoltage.toLowerCase()) > -1)).map((data, idx) => (
         <li key={idx}>
           <a onClick={(e) => autoClick(e, data)}><span className="highlight">{data}</span></a>
         </li>
       ))}
 
     </>
   )
 }
  
 
 function ScanpPop(props) {
 
  const cameraRef: any = useRef(null);
  const galleryRef: any = useRef(null);

  function onInputCamera(e) {
    cameraRef.current.click();
  }
  function onInputGallery(e) {
    galleryRef.current.click();
  }

  function saveFileCameraImage(e) {
    const file = e.target.feils[0]
    //  console.log("카메라 사진:", file)

  }
  function saveFileGalleryImage(e) {
    const file = e.target.feils[0]
    //  console.log("겔러리 사진:", file)
  }

  return (
    <>
      <div id="pop-scan" className="popup-layer js-layer layer-out hidden popup-bottom page-list-in">
        <h1 className="hide">카드스캔</h1>
        <div className="popup__body">
          <ul>
            <li>
              <input ref={cameraRef} type="file" id="camera" accept="image/*"
                capture={"environment"} onChange={(e) => saveFileCameraImage(e)} style={{ "display": "none" }} />
              <a onClick={(e) => onInputCamera(e)}><span className="icon-camera">사진 찍기</span></a>
            </li>
            <li>
              <input ref={galleryRef} type="file" id="gallery" accept="image/*"
                onChange={(e) => saveFileGalleryImage(e)} style={{ "display": "none" }} />
              <a onClick={(e) => onInputGallery(e)} ><span className="icon-photo">앨범에서 가져오기</span></a>
            </li>
          </ul>
        </div>
        <div className="popup__footer">
          <button className="button btn-close js-close"><span>닫기</span></button>
        </div>
      </div>
    </>
  )

}


 function CapturePop(props) {

  const savedFiles = props.savedFiles
   const setSavedFiles=props.setSavedFiles
 
  const cameraRef: any = useRef(null);
  const galleryRef: any = useRef(null);

  function onInputCamera(e) {
    cameraRef.current.click();
  }
  function onInputGallery(e) {
    galleryRef.current.click();
  }

  const handleChangeFile = (e) => {
    const file = e.target.files[0]
    const formData = new FormData();
    formData.append("files", file);
    var fileVal = {
      imageId: "INS_" + savedFiles.length,
      name: file.name,
      url: URL.createObjectURL(file),
      type: "INS",
      fileForm: formData,
    }
    setSavedFiles([...savedFiles, fileVal]);
    e.target.value = '';
      const btn = document.getElementById("js-close");
      btn.click();
  }

  return (
    <>
      <div id="pop-capture" className="popup-layer js-layer layer-out hidden popup-bottom page-list-in">
        <h1 className="hide">카드스캔</h1>
        <div className="popup__body">
          <ul>
            <li>
              <input ref={cameraRef} type="file" id="camera" accept="image/*"
                capture={"environment"} onChange={(e) => handleChangeFile(e)} style={{ "display": "none" }} />
              <a onClick={(e) => onInputCamera(e)}><span className="icon-camera">사진 찍기</span></a>
            </li>
            <li>
              <input ref={galleryRef} type="file" id="gallery" accept="image/*"
                onChange={(e) => handleChangeFile(e)} style={{ "display": "none" }} />
              <a onClick={(e) => onInputGallery(e)} ><span className="icon-photo">앨범에서 가져오기</span></a>
            </li>
          </ul>
        </div>
        <div className="popup__footer">
          <button id="js-close" className="button btn-close js-close"><span>닫기</span></button>
        </div>
      </div>
    </>
  )

}
