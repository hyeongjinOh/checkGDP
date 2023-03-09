/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author JiHoon Park
 * @contact jhpark@detech.co.kr
 * @date 2022-07-19
 * @brief EHP 회사/사업장/세부사업장 개발
 *
 ********************************************************************/
 import React, { useCallback, useEffect, useRef, useState } from "react";
 import { useAsync } from "react-async";
 // recoil
 import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
 import { userInfoLoginState } from "../../../../recoil/userState";
 
 
 // utils
 import clog from "../../../../utils/logUtils";
 import * as CONST from "../../../../utils/Const"
 import * as HTTPUTIL from "../../../../utils/api/HttpUtil"
 import * as CUTIL from "../../../../utils/commUtils"
 // component
 import EhpPagination from "../../../common/pagination/EhpPagination";
 
 //
 import * as XLSX from 'xlsx';
 import * as FileSaver from "file-saver";
import { loadingBoxState } from "../../../../recoil/menuState";
import { spawn } from "child_process";
 
 
 //component
 function DeviceList(props) {
   const isMobile = props.isMobile;
   const curTree = props.curTree;
   const workMode = props.workMode;
   const setParentIsMobile = props.setIsMobile;
   const setParentWorkMode = props.setWorkMode;
   const setParentPopWin = props.setPopWin;
  const  reWork= props.reWork;
  const setReWork= props.setReWork;
   // by hjo - 20220920 - 추가 hook
   const setListWork = props.setListWork;
   const listItem = props.listItem;
   const setListItem = props.setListItem;
 
   const restart = props.restart;
   const setRestart = props.setRestart;
 
   //mobile check
   const mobileRef = useRef(null); // Mobile Check용
   const searchRef = useRef(null); // searchBox pop Check용
   const [isSearchPop, setIsSearchPop] = useState(false);
 
   useEffect(() => { // resize handler
     function handleResize() {
       if (CUTIL.isnull(mobileRef)) return;
       const mobileTag = mobileRef.current;
       if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
         setParentIsMobile(true);
       } else {
         setParentIsMobile(false);
       }
       // search popup check......
       if (CUTIL.isnull(searchRef)) return;
       const searchTag = searchRef.current;
       // clog("handleResize : " + searchTag.clientHeight + " X " + searchTag.clientWidth);
       if (!CUTIL.isnull(searchTag)) {
         if ((searchTag.clientHeight <= 0) && (searchTag.clientWidth <= 0)) {
           setIsSearchPop(true);
         } else {
           setIsSearchPop(false);
         }
       }
     }
     window.addEventListener("resize", handleResize);
     return () => {
       window.removeEventListener('resize', handleResize);
     }
   }, []);
   
 
   //
   const [searchText, setSearchText] = useState("");
   const [searchTextField, setSearchTextField] = useState({
     searchField: "",
     searchText: ""
   });
   const [deviceList, setDeviceList] = useState([]);
   const defaultPageInfo = { "size": 15, "totalElements": 0, "totalPages": 0, "number": 0, "psize": 10 };
   const [sortData, setSortData] = useState({ "sortField": "rownumber", "sort": "ASC" });
   const [pageInfo, setPageInfo] = useState(defaultPageInfo);
   const [listChang, setListChang] = useState(false);
   //
   const [checkItem, setCheckItem] = useState([]);
   const [errorList, setErrorList] = useState([])
   const [excelData, setExcelData] = useState([]);
 
   /*
   appPath = appPath + '&page=' + curPage + '&size=' + listSize
   appPath = appPath + '&sort=' + sortData.sortField + ',' + sortData.sort;
   // // 검색 
   if (!CUTIL.isnull(searchType) && (searchType.length > 0) && (searchRText.length > 0)) {
     appPath = appPath + '&' + searchType + '=' + searchRText;
     clog("검색 액션 : " + appPath);
   }
   */
   
   //////////////////////////////////
   // 일괄 삭제 이벤트 및 팝업
   function listCheckDelPop(e, delList) {
     var itemId = []
 
     for (let i = 0; i < delList.length; i++) {
       itemId.push(delList[i].itemId)
     }
     CUTIL.jsopen_Popup(e)
   };
   // 단일 삭제 이벤트 및 팝업
   function listDelPop(e, delList) {
    setReloadList(false);
     setParentPopWin("pop-delete",
       <DeletePopup
         htmlHeader={<h1>기기 삭제</h1>}
         listItem={delList.itemId}
         setListChang={setListChang}
         mobileRef={mobileRef}
         setParentPopWin={setParentPopWin}
         setListWork={setListWork}
         setListItem={setListItem}
         pageInfo={pageInfo}
         setPageInfo={setPageInfo}
         deviceList={deviceList}
         setDeviceList={setDeviceList}
         setReloadList={setReloadList}
         errorList={errorList}
         setErrorList={setErrorList}
         setCheckItem={setCheckItem}
         handleCurPage={handleCurPage}
       />
     )
 
     CUTIL.jsopen_Popup(e)
   };
   const [reloadList, setReloadList] = useState(false);
   const { data: retDevice, error, isLoading, reload, run, } = useAsync({
     promiseFn: HTTPUTIL.PromiseHttp,
     httpMethod: "GET",
     //appPath: '/api/v2/product/company/zone/subzone/room/panel/itemManageList?' + appPath,
     appQuery: {},
     //watch: appPath + reloadList + restart + curTree.reload
   });
   
   function handleCurPage(page) {
     setPageInfo({ ...pageInfo, number: page });
   }
   //
   function onClickGoSearch(e) {
     setSearchTextField({
       searchField: "",
       searchText: ""
     });
 
     var searchTypeDiv = document.querySelector("#search_selected-value");
 
     clog("onClickGoSearch : DEVICE : " + searchTypeDiv);
 
     if (CUTIL.isnull(searchTypeDiv)) return;
     var selSearchType = searchTypeDiv.getAttribute("data-value");
     setSearchTextField({
       searchField: selSearchType,
       searchText: searchText
     });
     // search시 필터 적용
     /*
     setSearchFilterList(
       filterList.filter((filter) => filter.checked)
     );
     */
   }
   //
   //chcek All
   const checkedAll = useCallback((checked) => {
     if (checked) {
       const checkedArray = [];
       deviceList.forEach((list) => { checkedArray.push(list) });
       setCheckItem(checkedArray);
     } else {
       setCheckItem([]);
     }
   }, [deviceList])
   // check singe
   const checkedList = useCallback((checked, list) => {
     if (checked) {
       setCheckItem([...checkItem, list]);
     } else {
       setCheckItem(checkItem.filter((el) => el !== list));
     }
   }, [checkItem])
 
 
   //
   function onClickSelectOnly(e, device) {
     setDeviceList(
       deviceList.map((dev) => (dev.itemId === device.itemId) ? { ...dev, selected: true } : { ...dev, selected: false })
     );
   }
   function onClickSort(sort) {
     var selSort = (sortData.sort === "ASC") ? "DESC" : "ASC";
     if (sort !== sortData.sortField) { // 정렬필드가 변경된 경우
       selSort = "DESC";
     }
     setSortData({
       "sortField": sort,
       "sort": selSort
     });
    // list 수정
   }
   function onClickDeviceChang(e, device) {
     setListWork("UPDATE");
     if (CUTIL.isnull(device)) return;
     setListItem(device)
     setReWork(curTree.room.roomId);
     setRestart(false);
 
   }
 // 엑셀 다운로드 시 리스트 API
   async function excelList(e) {
     let appPath = "roomId=" + curTree.room.roomId;
     appPath = appPath + '&page=' + pageInfo.number + '&size=' + pageInfo.totalElements;
     let data: any = null;
     data = await HTTPUTIL.PromiseHttp({
       "httpMethod": "GET",
       appPath: '/api/v2/product/company/zone/subzone/room/panel/itemManageList?' + appPath,
       appQuery: {},
       watch: appPath
     });
 
     if (data) {
       if (data.codeNum == CONST.API_200) {
         excelDownloadSaved(data.body)
       }
 
     }
 
   }
 
   function excelDownloadSaved (excelData: any){
     const excelFileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'; // 파일 타입 및 유니코드
     // const book = XLSX.utils.book_new();
     const excelFileExtension = '.xlsx'; // 확장자 명
     const excelFileName = curTree.company.companyName + "_" + curTree.zone.zoneName + "_" + curTree.subZone.subZoneName + "_" + curTree.room.roomName + "_" + "DeviceList" // 파일명
     const excelSheet = XLSX.utils.aoa_to_sheet([
       ['no', '기기유형', 'Panel명', "정격전압(kV)", "2차전압(kV)", "정격전류(A)", "차단전류(kA)", "정격용량(kVA)", "모델명", "시리얼번호", "제조사", "메모"]
     ]
     );
     excelData.map((sheet: any) => {
       XLSX.utils.sheet_add_aoa(
         excelSheet,
         [
           [
             sheet.rowNumber,
             sheet.spg.spgName,
             sheet.panel.panelName,
             sheet.ratingVoltage,
             sheet.secondaryVoltage,
             sheet.ratingCurrent,
             sheet.cutoffCurrent,
             sheet.ratedCapacity,
             sheet.itemName,
             sheet.serialNo,
             sheet.manufacturer,
             sheet.memo,
           ]
         ],
         { origin: -1 }
       );
             excelSheet['!cols'] = [ //< --행 사이즈
               { width: 8, },
               { width: 10 , },
               { width: 20 , },
               { width: 13 , },
               { width: 13 , },
               { width: 13 , },
               { width: 13 , },
               { width: 13 , },
               { width: 30 , },
               { width: 30 , },
               { width: 30 , },
               { width: 30 , },
             ] 
       return false;
     });
     // wb == workBook 약자
     const wb: any = { Sheets: { Sheet: excelSheet }, SheetNames: ["Sheet"] };
     const excelButter = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
     const excelFile = new Blob([excelButter], { type: excelFileType });
     FileSaver.saveAs(excelFile, excelFileName + excelFileExtension);
     // XLSX.utils.book_append_sheet(book, excelSheet, "Sheet"); 
     // XLSX.writeFile(book, excelFileName + excelFileExtension);
   }
 
   // 
 
   /* // 기존 모바일 리스트 팝업
      function onClickDeviceDetailView(e, device) { 
       setParentPopWin("pop-list-view",
         <MobileDeviceDetail
           htmlHeader={<h1>{device.itemName}</h1>}
           deviceInfo={device}
         />
       );
       //deviceList.filter((dev))
       clog("onClickDeviceDetailView : " + JSON.stringify(device));
       CUTIL.jsopen_m_Popup(e);
     } */
 
   function onClickDeviceTab(e, workMode) {
     clog("DeviceList : onClickDeviceTab : " + workMode + " : " + isMobile);
     CUTIL.jsopen_s_Popup(e, isMobile);
     setParentWorkMode(workMode);
   }
   clog("IN DEVICE : INIT : page Info : " + JSON.stringify(pageInfo) + " : " + isSearchPop + " : " + workMode);
 
 
   return (
     <>
       {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)-->*/}
 
       <div className="area__right" ref={mobileRef}>
         <ul className="page-loca">
           <li>데이타솔루션</li>
           <li>학동1</li>
           <li>1공장</li>
           <li>전기실1</li>
         </ul>
         <h2>전기실1</h2>
         <div className="inline mb-18">
           {/*<!--목록이동 버튼, 활성화되면 active 클래스 추가-->*/}
           <a
             className={`move-list ${(workMode === "LIST") ? "active" : ""}`}
             onClick={(e) => onClickDeviceTab(e, "LIST")}
           >Device List</a>
           <ul className="tab__small">
             {/*<!-- 선택된 탭 on -->*/}
             <li className={(workMode === "BATCH") ? "on" : ""}>
               <a className="icon-add"
                 onClick={(e) => onClickDeviceTab(e, "BATCH")}
               >일괄등록</a>
             </li>
             <li className={(workMode === "CREATE") ? "on" : ""}>
               <a className="icon-pen"
                 onClick={(e) => onClickDeviceTab(e, "CREATE")}
               >개별등록</a>
             </li>
           </ul>
         </div>
 
         {/*<!--area__right_content, 오른쪽 컨텐츠 영역-->*/}
         <div className="area__right_content hcal-170">
           {/*<!--검색영역-->*/}
           <div
             className="inline right search-small mb-16 p-0 js-open-m open"
             data-pop="pop-search-small"
           >
             <p className="title">
               <span className="txt-black">검색</span>
             </p>
             <div className="searcharea">
               <div className="searchinput">
                 <div className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)} ref={searchRef}>
                   <div className="selected">
                     <div id="search_selected-value" className="selected-value" data-value="itemName">모델 명</div>
                     <div className="arrow"></div>
                   </div>
                   <ul>
                     <li className="option" data-value="itemName">모델 명</li>
                     <li className="option" data-value="serialNo">시리얼번호</li>
                   </ul>
                 </div>
                 <div className="input__direct">
                   <input type="text" placeholder="검색어를 입력하세요" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                   {(searchText.length > 0) &&
                     <button type="button" className="btn btn-delete" onClick={(e) => setSearchText("")}><span className="hide">입력 창 닫기</span></button>
                   }
                 </div>
                 <button type="button" id="btn-search" className="btn-search" data-pop="pop-search-small" onClick={(e) => (isSearchPop) ? CUTIL.jsopen_m_Popup(e): onClickGoSearch(e)}><span>조회</span></button>
                 {/* <!--220919 다운로드, 삭제버튼 추가 --> */}
                 <button type="button" className="btn btn-filedown" onClick={(e) => excelList(e)}><span className="hide">다운로드</span></button>
                 <button type="button" className={`btn btn-delete-bg  ${(checkItem.length <= 0) ? "" : "bg-blue on"} ml-10 js-open`} data-pop={"pop-delete"} onClick={(checkItem.length <= 0) ? null : (e) => listCheckDelPop(e, checkItem)}><span className="hide">삭제</span></button>
               </div>
             </div>
           </div>
           <div className="tbl-list hcal-96">
             <table summary="등록 순,기기 명,Panel 명,모델 명,시리얼 번호,정격전압,정격전류,차단전류,정격용량,계통전압,첨부파일,메모 항목으로 구성된 전기실목록 입니다.">
               <caption>
                 Basice-HCList
               </caption>
               <colgroup>
                 <col style={{}} />
               </colgroup>
               <thead>
                 <tr>
                   {/* <!--220919 첫번째 컬럼 체크박스 추가--> */}
                   <th scope="col" className="d-lm-none wmax-20">
                     <input type="checkbox" id="t_all"/>
                     <label htmlFor="t_all">
                       <span className="hide">선택</span>
                     </label>
                   </th>
                   <th scope="col" className={`"asc" : "desc" : "asc"} txt-left`}>
                     <span>등록 순</span>
                   </th>
                   <th scope="col" className={`"asc" : "desc" : "asc"} txt-left`}>
                    <span>기기 명</span>
                   </th>
                   <th scope="col" className={`"asc" : "desc" : "asc"} txt-left`}>
                   <span>Panel 명</span>
                   </th>
                   <th scope="col" className={`"asc" : "desc" : "asc"} txt-left`}>
                    <span>모델 명1</span>
                    </th>
                   <th scope="col" className={`"asc" : "desc" : "asc"} txt-left`}>
                    <span>시리얼 번호</span>
                    </th>
                   <th scope="col" className={` sort "asc" : "desc" : "asc"} txt-left d-lm-none`}>                   
                    <span className="">정격전압 (kV)</span>
                    </th>
                   <th scope="col" className={`"asc" : "desc" : "asc"} txt-left d-lm-none`}>
                    <span className="">2차전압 (kV)</span>
                    </th>
                   <th scope="col" className={`"asc" : "desc" : "asc"} txt-left d-lm-none`}>
                    <span className="">정격전류 (A)</span>
                    </th>
                   <th scope="col" className={`"asc" : "desc" : "asc"} txt-left d-lm-none`}>
                    <span className="">차단전류 (kA)</span>
                    </th>
                   <th scope="col" className={`"asc" : "desc" : "asc"} txt-left d-lm-none`}>
                    <span className="">정격용량 (kVA)</span>
                    </th>
                   <th scope="col" className="d-lm-none">첨부파일</th>
                   <th scope="col" className="d-lm-none"><span>삭제</span></th>
                 </tr>
               </thead>
               <tbody>
                 {/*<!--tr 내 data-pop="pop-list-view" 화면사이즈 줄었을 때 리스트 내용 팝업-->*/}
                 {(deviceList) && deviceList.map((device, idx) => (
                   <tr key={`dv_${idx.toString()}`}
                     className={`js-open-m ${(device.hasOwnProperty("selected")) ? (device.selected) ? "focused" : "" : ""}`}
                     data-pop="pop-list-view"
                   //  onClick={(e) => (isSearchPop) ? onClickDeviceDetailView(e, device) : onClickSelectOnly(e, device)}
 
                   >
                     {/* <!--220919 첫번째 컬럼 체크박스 추가--> */}
                     <td className="d-lm-none wmax-20">
                       <input type="checkbox" id={"t_" + idx} checked={checkItem.includes(device) ? true : false}
                         onChange={(e) => checkedList(e.target.checked, device)}
 
                       />
                       <label htmlFor={"t_" + idx}>
                         <span className="hide">선택</span></label>
                     </td>
                     <td className="txt-left" onClick={(e) => onClickDeviceChang(e, device)}>{device.rowNumber}</td>
                     <td className="txt-left" onClick={(e) => onClickDeviceChang(e, device)}>{device.spg.spgName}</td>
                     <td className="txt-left" onClick={(e) => onClickDeviceChang(e, device)}>
                       <p className="ellipsis wmax-140">
                         <span className="tooltip">
                           {/* <!--기존 내용--> */}
                           {device.panel.panelName}
                           {/* <!--툴팁 내용--> */}
                           <span className="tooltip-text"> {device.panel.panelName}</span>
                         </span>
                       </p>
                     </td>
                     <td className="txt-left" onClick={(e) => onClickDeviceChang(e, device)}>
                       <p className="ellipsis wmax-140">
                         <span className="tooltip">
                           {/* <!--기존 내용--> */}
                           {device.itemName}
                           {/* <!--툴팁 내용--> */}
                           <span className="tooltip-text" onClick={(e) => onClickDeviceChang(e, device)}>{device.itemName} </span>
                         </span>
                       </p>
                     </td>
                     <td className="txt-left" onClick={(e) => onClickDeviceChang(e, device)}>
                       <p className="ellipsis wmax-140">
                         <span className="tooltip">
                           {/* <!--기존 내용--> */}
                           {device.serialNo}
                           {/* <!--툴팁 내용--> */}
                           <span className="tooltip-text" onClick={(e) => onClickDeviceChang(e, device)}> {device.serialNo}</span>
                         </span>
                       </p>
                     </td>
                     <td className="txt-left d-lm-none" onClick={(e) => onClickDeviceChang(e, device)}>{(device.ratingVoltage) ? device.ratingVoltage : "-"}</td>
                     <td className="txt-left d-lm-none" onClick={(e) => onClickDeviceChang(e, device)}>{(device.secondaryVoltage) ? device.secondaryVoltage : "-"}</td>
                     <td className="txt-left d-lm-none" onClick={(e) => onClickDeviceChang(e, device)}>{(device.ratingCurrent) ? device.ratingCurrent : "-"}</td>
                     <td className="txt-left d-lm-none" onClick={(e) => onClickDeviceChang(e, device)}>{(device.cutoffCurrent) ? device.cutoffCurrent : "-"}</td>
                     <td className="txt-left d-lm-none" onClick={(e) => onClickDeviceChang(e, device)}>{(device.ratedCapacity) ? device.ratedCapacity : "-"}</td>
                     <td className="d-lm-none" onClick={(e) => onClickDeviceChang(e, device)}>
                       {(device.imageId.length >= 1) ?
                         <button type="button" className="btn btn-photo" ><span className="hide">첨부파일</span></button>
                         :
                         <button type="button" className="btn btn-photo" disabled><span className="hide">첨부파일</span></button>
                       }
 
                     </td>
                     <td className="d-lm-none">
                       {/* <!--220919 클래스 및 문구수정--> */}
                       <button type="button" className="btn btn-delete-gr js-open" data-pop={"pop-delete"} onClick={(e) => listDelPop(e, device)}><span className="hide">삭제</span></button>
                     </td>
                     {/* <td className="d-lm-none" onClick={(e) => onClickDeviceChang(e, device)}>
                       {(device.memo != '') ?
                         <button type="button" className="btn btn-memo" ><span className="hide">메모</span></button>
                         :
                         <button type="button" className="btn btn-memo" disabled><span className="hide">메모</span></button>
                       }
                     </td> */}
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           {(pageInfo) && <EhpPagination
             componentName={"DEVICELIST"}
             pageInfo={pageInfo}
             handleFunc={handleCurPage}
           />}
         </div>
       </div>
       {/*<!--//area__right, 오른쪽 영역-->*/}
 
 
 
     </>
   )
 
 }
 export default DeviceList;
 
 function MobileSearchPopup(props) {
   const searchText = props.searchText;
   const setSearchText = props.setSearchText;
   const onClickGoSearch = props.onClickGoSearch;
   return (
     <>
       <div className="popup__body">
         <div className="form__input mb-0">
           <div className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
             <div className="selected">
               <div className="selected-value" data-value="itemName">모델 명</div>
               <div className="arrow"></div>
             </div>
             <ul>
               <li className="option" data-value="itemName">모델 명</li>
               <li className="option" data-value="serialNo">시리얼번호</li>
             </ul>
           </div>
           <input type="text" placeholder="검색어를 입력하세요" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
         </div>
       </div>
       <div className="popup__footer">
         <button type="button" className="bg-gray js-close">
           <span>취소</span>
         </button>
         <button type="button" className="js-close" onClick={(e) => onClickGoSearch(e)}>
           <span>적용</span>
         </button>
       </div>
     </>
   )
 }
 
 
 
 
 
 function MobileDeviceList(props) {
     //recoil
     const userInfo = useRecoilValue(userInfoLoginState);
   //const zoneInfo = props.zoneInfo;
   const searchText = props.searchText;
   const setSearchText = props.setSearchText;
   const workMode = props.workMdoe;
   const curTree = props.curTree;
   const deviceList = props.deviceList;
   const pageInfo = props.pageInfo;
   const handleCurPage = props.setPageInfo;
   const onClickGoSearch = props.onClickGoSearch;
   const onClickDeviceDetailView = props.onClickDeviceDetailView;
   const onClickDeviceTab = props.onClickDeviceTab;
   const sortData = props.sortData;
   const onClickSort = props.onClickSort;
 
   const onClickDeviceChang = props.onClickDeviceChang;
   const listDelPop = props.listDelPop;

    // 엑셀 다운로드 시 리스트 API
    async function excelList(e) {
      let appPath = "roomId=" + curTree.room.roomId;
      appPath = appPath + '&page=' + pageInfo.number + '&size=' + pageInfo.totalElements;
      let data: any = null;
      data = await HTTPUTIL.PromiseHttp({
        "httpMethod": "GET",
        appPath: '/api/v2/product/company/zone/subzone/room/panel/itemManageList?' + appPath,
        appQuery: {},
        watch: appPath
      });
  
      if (data) {
        if (data.codeNum == CONST.API_200) {
          excelDownloadSaved(data.body)
        }
  
      }
  
    }
  
    const excelDownloadSaved = useCallback((excelData: any) => {
      const excelFileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'; // 파일 타입 및 유니코드
      // const book = XLSX.utils.book_new();
      const excelFileExtension = '.xlsx'; // 확장자 명
      const excelFileName = curTree.company.companyName + "_" + curTree.zone.zoneName + "_" + curTree.subZone.subZoneName + "_" + curTree.room.roomName + "_" + "DeviceList" // 파일명
      const excelSheet = XLSX.utils.aoa_to_sheet([
        ['no', '기기유형', 'Panel명', "정격전압(kV)", "2차전압(kV)", "정격전류(A)", "차단전류(kA)", "정격용량(kVA)", "모델명", "시리얼번호", "제조사", "메모"]
      ]
      );
      excelData.map((sheet: any) => {
        XLSX.utils.sheet_add_aoa(
          excelSheet,
          [
            [
              sheet.rowNumber,
              sheet.spg.spgName,
              sheet.panel.panelName,
              sheet.ratingVoltage,
              sheet.secondaryVoltage,
              sheet.ratingCurrent,
              sheet.cutoffCurrent,
              sheet.ratedCapacity,
              sheet.itemName,
              sheet.serialNo,
              sheet.manufacturer,
              sheet.memo,
            ]
          ],
          { origin: -1 }
        );
              excelSheet['!cols'] = [ //< --행 사이즈
                { width: 8, },
                { width: 10 , },
                { width: 20 , },
                { width: 13 , },
                { width: 13 , },
                { width: 13 , },
                { width: 13 , },
                { width: 13 , },
                { width: 30 , },
                { width: 30 , },
                { width: 30 , },
                { width: 30 , },
              ] 
        return false;
      });
      // wb == workBook 약자
      const wb: any = { Sheets: { Sheet: excelSheet }, SheetNames: ["Sheet"] };
      const excelButter = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const excelFile = new Blob([excelButter], { type: excelFileType });
      FileSaver.saveAs(excelFile, excelFileName + excelFileExtension);
      // XLSX.utils.book_append_sheet(book, excelSheet, "Sheet"); 
      // XLSX.writeFile(book, excelFileName + excelFileExtension);
    }, []);
  
 
 
   return (
     <>
       {/*<!-- 모바일 오른쪽 영역 area-right 팝업, 767이하에서는 팝업으로 노출 / 사업장 정보 페이지에서는 page-info 클래스 추가 -->*/}
       <div className="popup__body">
         <ul className="page-loca">
           <li>{curTree.company.companyName}</li>
           <li>{curTree.zone.zoneName}</li>
           <li>{curTree.subZone.subZoneName}</li>
           <li>{curTree.room.roomName}</li>
         </ul>
         <div className="page-top">
           <h2>{curTree.room.roomName}</h2>
         </div>
 
         <div className="area__right_content workplace__info">
           {/*<!--목록이동 버튼, 활성화되면 active 클래스 추가-->*/}
    {/*        <a
             className="move-list active"
           // onClick={(e) => onClickDeviceTab(e, "LIST")}
           >Device List</a> */}
           <ul className="tab__small">
 
             {/*<!-- 선택된 탭 on -->*/} {/*<!--일괄등록 관련 팝업 추가, 220801-->*/}
 {/* 
             <li className={(workMode === "BATCH") ? "on" : ""}>
               <a
                 className="icon-add js-open-s"
                 data-pop="pop-devicealladd"
                 onClick={(e) => onClickDeviceTab(e, "BATCH")}
               >일괄등록</a></li> */}
             <li className={(workMode === "CREATE") ? "on" : ""}>
               <a className="icon-pen js-open-s"
                 data-pop="pop-deviceadd"
                 onClick={(e) => onClickDeviceTab(e, "CREATE")}
               >개별등록</a>
             </li>
           </ul>
           <div className="area__right_content hcal-170">
             {/*<!--검색영역-->*/}
             <div className="inline right search-small mb-16 p-0 js-open-m open"
               data-pop="pop-search-small"
             
             >
               <p className="title">
                 <span>검색</span>
               </p>
               <div className="searcharea">
                 <div className="searchinput">
                   <div className="select">
                     <div className="selected">
                       <div id="search_selected-value" className="selected-value" data-value="itemName">모델 명</div>
                       <div className="arrow"></div>
                     </div>
                     <ul>
                       <li className="option" data-value="itemName">모델 명</li>
                       <li className="option" data-value="serialNo">시리얼번호</li>
                     </ul>
                   </div>
                   <div className="input__direct">
                     <input type="text" placeholder="검색어를 입력하세요"
                       className="w274"
                       value={searchText}
                       onChange={(e) => setSearchText(e.target.value)}
                     />
                     <button type="button" className="btn btn-delete"><span className="hide">입력 창 닫기</span></button>
                   </div>
                   <button type="button" className="btn-search"   data-pop="pop-search-small"  onClick={(e) => CUTIL.jsopen_m_Popup(e)}><span>조회</span></button>
                   {/* <!--220919 다운로드, 삭제버튼 추가 --> */}
                   <button type="button" className="btn btn-filedown" onClick={(e)=>excelList(e)} ><span className="hide">다운로드</span></button>
                   {/*<button type="button" className="btn btn-delete-bg ml-10"><span className="hide">삭제</span></button> */}
                   {/* <!--체크박스 선택시 bg-blue 클래스 추가 : 컬러 블루로 변경됨 --> */}
                   {/* <button type="button" className="btn btn-delete-bg bg-blue ml-10"><span className="hide">삭제</span></button> */}
                 </div>
               </div>
             </div>
 
             <div className="tbl-list hcal-96">
               <table summary="등록 순,기기 명,Panel 명,모델 명,시리얼 번호,정격전압,정격전류,차단전류,정격용량,계통전압,첨부파일,메모 항목으로 구성된 전기실목록 입니다.">
                 <caption>
                   Basice-HCList
                 </caption>
                 <colgroup >
                   <col style={{ "width": "30%" }} />
                   <col style={{ "width": "70%" }} />
                 </colgroup>
                 <thead>
                   <tr>
                     {/* <!--220919 첫번째 컬럼 체크박스 추가--> */}
                     <th scope="col" className="d-lm-none wmax-20">
                       <input type="checkbox" id="t_all" />
                       <label htmlFor="t_all">
                         <span className="hide">선택</span>
                       </label>
                     </th>
                     <th scope="col" className={`sort ${(sortData.sortField === "rownumber") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left`}
                       onClick={(e) => onClickSort("rownumber")}>
                       <span>등록 순</span>
                     </th>
                     <th scope="col" className={` sort ${(sortData.sortField === "spgName") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left d-sm-none`}
                   onClick={(e) => onClickSort("spgName")}>
                    <span>기기 명</span>
                   </th>
                   <th scope="col" className={` sort ${(sortData.sortField === "panelName") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left d-sm-none`}
                   onClick={(e) => onClickSort("panelName")}>
                   <span>Panel 명</span>
                   </th>
                   <th scope="col" className={` sort ${(sortData.sortField === "itemName") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left`}
                   onClick={(e) => onClickSort("itemName")}>
                    <span>모델 명</span>
                    </th>
                   <th scope="col" className={` sort ${(sortData.sortField === "serialNo") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left d-sm-none`}
                   onClick={(e) => onClickSort("serialNo")}>
                    <span>시리얼 번호</span>
                    </th>
                   <th scope="col" className={` sort ${(sortData.sortField === "ratingVoltage") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left d-lm-none`}
                   onClick={(e) => onClickSort("ratingVoltage")}>
                   {/* <span> 정격전압</span> */}
                    <span className="">정격전압 (kV)</span>
                    </th>
                   <th scope="col" className={` sort ${(sortData.sortField === "secondaryVoltage") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left d-lm-none`}
                   onClick={(e) => onClickSort("secondaryVoltage")}>
                    <span className="">2차전압 (kV)</span>
                    </th>
                   <th scope="col" className={` sort ${(sortData.sortField === "ratingCurrent") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left d-lm-none`}
                   onClick={(e) => onClickSort("ratingCurrent")}>
                    <span className="">정격전류 (A)</span>
                    </th>
                   <th scope="col" className={` sort ${(sortData.sortField === "cutoffCurrent") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left d-lm-none`}
                    onClick={(e) => onClickSort("cutoffCurrent")}>
                    <span className="">차단전류 (kA)</span>
                    </th>
                   <th scope="col" className={` sort ${(sortData.sortField === "ratedCapacity") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left d-lm-none`}
                    onClick={(e) => onClickSort("ratedCapacity")}>
                    <span className="">정격용량 (kVA)</span>
                    </th>
                     {/* <th scope="col" className="txt-left d-lm-none">정격전압<span className="fontRegular">(kV)</span></th> */}
                     <th scope="col" className="d-lm-none">첨부파일</th>
                     <th scope="col" className="d-lm-none"><span>Memo</span></th>
                   </tr>
                 </thead>
                 <tbody>
                   {/*<!--tr 내 data-pop="pop-list-view" 화면사이즈 줄었을 때 리스트 내용 팝업-->*/}
                   {(deviceList) && deviceList.map((device, idx) => (
                     <tr key={`dv_${idx.toString()}`}
                       className={`js-open-m ${(device.hasOwnProperty("selected")) ? (device.selected) ? "focused" : "" : ""}`}
                       data-pop="pop-list-view"
                     //  onClick={(e) => (isSearchPop) ? onClickDeviceDetailView(e, device) : onClickSelectOnly(e, device)}
                     >
                       {/* <!--220919 첫번째 컬럼 체크박스 추가--> */}
                       <td className="d-lm-none wmax-20">
                         <input type="checkbox" id={"t_" + idx} />
                         <label htmlFor={"t_" + idx}>
                           <span className="hide">선택</span></label>
                       </td>
                       <td className="txt-left " onClick={(e) => onClickDeviceChang(e, device)}>{device.rowNumber}</td>
                       <td className="txt-left  d-sm-none" onClick={(e) => onClickDeviceChang(e, device)}>{device.spg.spgName}</td>
                       <td className="txt-left  d-sm-none" onClick={(e) => onClickDeviceChang(e, device)}>
                         <p className="ellipsis wmax-140">
                           <span className="tooltip">
                             {/* <!--기존 내용--> */}
                             {device.panel.panelName}
                             {/* <!--툴팁 내용--> */}
                             <span className="tooltip-text" onClick={(e) => onClickDeviceChang(e, device)}> {device.panel.panelName}</span>
                           </span>
                         </p>
                       </td>
                       <td className="txt-left " onClick={(e) => onClickDeviceChang(e, device)}>
                         <p className="ellipsis wmax-140">
                           <span className="tooltip">
                             {/* <!--기존 내용--> */}
                             {device.itemName}
                             {/* <!--툴팁 내용--> */}
                             <span className="tooltip-text" onClick={(e) => onClickDeviceChang(e, device)}>{device.itemName} </span>
                           </span>
                         </p>
                       </td>
                       <td className="txt-left  d-sm-none" onClick={(e) => onClickDeviceChang(e, device)}>
                         <p className="ellipsis wmax-140">
                           <span className="tooltip">
                             {/* <!--기존 내용--> */}
                             {device.serialNo}
                             {/* <!--툴팁 내용--> */}
                             <span className="tooltip-text" onClick={(e) => onClickDeviceChang(e, device)}> {device.serialNo}</span>
                           </span>
                         </p>
                       </td>
                       <td className="txt-left d-lm-none" onClick={(e) => onClickDeviceChang(e, device)}>{(device.ratingVoltage) ? device.ratingVoltage : "-"}</td>
                       <td className="txt-left d-lm-none" onClick={(e) => onClickDeviceChang(e, device)}>{(device.secondaryVoltage) ? device.secondaryVoltage : "-"}</td>
                       <td className="txt-left d-lm-none" onClick={(e) => onClickDeviceChang(e, device)}>{(device.ratingCurrent) ? device.ratingCurrent : "-"}</td>
                       <td className="txt-left d-lm-none" onClick={(e) => onClickDeviceChang(e, device)}>{(device.cutoffCurrent) ? device.cutoffCurrent : "-"}</td>
                       <td className="txt-left d-lm-none" onClick={(e) => onClickDeviceChang(e, device)}>{(device.ratedCapacity) ? device.ratedCapacity : "-"}</td>
                       <td className="d-lm-none" onClick={(e) => onClickDeviceChang(e, device)}>
                         {(device.imageId.length >= 1) ?
                           <button type="button" className="btn btn-photo" ><span className="hide">첨부파일</span></button>
                           :
                           <button type="button" className="btn btn-photo" disabled><span className="hide">첨부파일</span></button>
                         }
 
                       </td>
                       <td className="d-lm-none">
                         {/* <!--220919 클래스 및 문구수정--> */}
                         <button type="button" className="btn btn-delete-gr js-open" data-pop={"pop-delete"} onClick={(e) => listDelPop(e, device)}><span className="hide">삭제</span></button>
                       </td>
                       {/* <td className="d-lm-none" onClick={(e) => onClickDeviceChang(e, device)}>
                       {(device.memo != '') ?
                         <button type="button" className="btn btn-memo" ><span className="hide">메모</span></button>
                         :
                         <button type="button" className="btn btn-memo" disabled><span className="hide">메모</span></button>
                       }
                     </td> */}
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             {(pageInfo) && <EhpPagination
               componentName={"DEVICELIST"}
               pageInfo={pageInfo}
               handleFunc={handleCurPage}
             />}
           </div>
         </div>
       </div>
       {/*<!--//area__right, 오른쪽 영역-->*/}
 
     </>
   )
 
 }
 
 // 리스트 삭제
 function DeletePopup(props) {
   // 
   const userInfo = useRecoilValue(userInfoLoginState);
   //
   const listItem = props.listItem
   const setReloadList = props.setReloadList;
   const setCheckItem = props.setCheckItem;
   const handleCurPage = props.handleCurPage;
   //
   const [delItme, setDelItme] = useState<string>(null);
 
   // 삭제 API
   async function listDel(itemId) {
     let data: any = null;
     data = await HTTPUTIL.PromiseHttp({
       "httpMethod": "DELETE",
       appPath: `/api/v2/product/company/zone/subzone/room/panel/item/${encodeURIComponent(itemId)}`,
       /* appQuery: {
            itemId: itemId
          }, */       
     });
     if (data) {
       if (data.codeNum == CONST.API_200) {
         setDelItme(data.body);
         handleCurPage(0);
         setReloadList(true);

       } else {
         alert(data.errorList[0].msg)
       }
     }
   }
   // 완료 후 팝업
 
   function listDelDone(e) {
     var btnCommentClose = document.getElementById("pop-delete");
 
     var body = document.body
     var dimm = body.querySelector(".dimm");
 
     if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
     if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
     if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "delItme: none; z-index: 11; ");
     setDelItme(null)
     setReloadList(true);
     setCheckItem([]);
 
   }
 
   return (
 
     <>
       <div className="popup__body">
         <p>
           <span className="font-16">{(!delItme) ? "해당 기기를 삭제하시겠습니까?" : "삭제되었습니다."}</span><br />
           <span className="fontRegular"></span>
         </p>
         <dl>
           <dt></dt>
           <dd></dd>
         </dl>
       </div>
       <div className="popup__footer">
         {(!delItme) &&
           <button type="button" className="bg-gray btn-close" onClick={(e) => PopClols("pop-delete")}><span>취소</span></button>
         }
         {(!delItme) ?
           <button type="button" className="" onClick={(e) => listDel(listItem)}>
             <span>확인</span>
           </button>
           :
           <button type="button" className="btn-close" onClick={(e) => listDelDone(e)}>
             <span>확인</span>
           </button>
         }
       </div>
     </>
   )
 }
 // 일괄 삭제
 function CheckDeletePopup(props) {
   // 
   const userInfo = useRecoilValue(userInfoLoginState);
   const setRecoilIsLoadingBox = props.setRecoilIsLoadingBox
   //
   const listItem = props.listItem
    const setReloadList = props.setReloadList;
   const setCheckItem = props.setCheckItem
   const handleCurPage = props.handleCurPage;
   //
   const [delItme, setDelItme] = useState<string>(null);
 
   // 삭제 API
   async function listDel(itemId) {
    var btnCommentClose = document.getElementById("pop-delete");
    if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
    
     let data: any = [];
     setRecoilIsLoadingBox(true);
     for (let i = 0; i < itemId.length; i++) {
       data = await HTTPUTIL.PromiseHttp({
         "httpMethod": "DELETE",
         appPath: `/api/v2/product/company/zone/subzone/room/panel/item/${encodeURIComponent(itemId[i])}`,
         /*     appQuery: {
               itemId: 
             }, */
       });
     }
 
     if (data) {
       if (data.codeNum == CONST.API_200) {
         setDelItme("삭제되었습니다.");
         handleCurPage(0)
         setReloadList(true);
         setRecoilIsLoadingBox(false);
         var btnCommentClose = document.getElementById("pop-delete");
         if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.remove("hidden");
       } else {
        // console.log("data",data)
         alert(data.errorList[0].msg);
       }
     }

   }
   // 완료 후 팝업
 
   function listDelDone(e) {
     var btnCommentClose = document.getElementById("pop-delete");
 
     var body = document.body
     var dimm = body.querySelector(".dimm");
     if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
     if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
     if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "delItme: none; z-index: 11; ");
     setDelItme(null);
     setCheckItem([]);
 
 
   }
 
 
 
 
   return (
 
     <>
       <div className="popup__body">
         <p>
           <span className="font-16">{(!delItme) ? "해당 기기를 삭제하시겠습니까?" : delItme}</span><br />
           <span className="fontRegular"></span>
         </p>
         <dl>
           <dt></dt>
           <dd></dd>
         </dl>
       </div>
       <div className="popup__footer">
         {(!delItme) &&
           <button type="button" className="bg-gray btn-close" onClick={(e) => PopClols("pop-delete")} ><span>취소</span></button>
         }
         <button type="button" className="" onClick={(!delItme) ? (e) => listDel(listItem) : (e) => listDelDone(e)}>
           <span>확인</span>
         </button>
       </div>
     </>
   )
 }
 
 function PopClols(id) {
   const btnCommentClose = document.getElementById(id);
 
   var body = document.body
   var dimm = body.querySelector(".dimm");
 
   if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
   if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
   if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "delItme: none; z-index: 11; ");
 
 }
 ///
 
 
 // function MobileDeviceDetail(props) {
 //   const device = props.hasOwnProperty("deviceInfo") ? props.deviceInfo : null;
 
 //   function onSumit(e) {
 //     var btnCommentClose = document.getElementById("pop-list-view");
 //     var body = document.body
 //     if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
 //     if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;")
 
 //   }
 
 //   return (
 //     <>
 //       {/*<!--리스트 상세 보기 팝업, 220804 수정 (항목 수정 추가 및 클래스 추가)-->*/}
 //       {/*
 //       <div id="pop-list-view" className="popup-layer js-layer layer-out hidden page-report page-detail page-workplace page-info page-list-view">
 //         <div className="popup__head">
 //           <h1>{(device)?device.itemName:"-"}</h1>
 //           <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
 //     </div>*/}
 //       {(device) && <div className="popup__body">
 //         <div className="area__right_content workplace__info">
 //           <div className="content__info">
 //             <h3 className="hide">리스트 상세 정보</h3>
 //             <ul>
 //               <li>
 //                 <p className="tit">기기 명</p>
 //                 <p className="txt">{device.spg.spgName}</p>
 //               </li>
 //               <li>
 //                 <p className="tit">모델 명</p>
 //                 <p className="txt">{device.itemName}</p>
 //               </li>
 //               <li>
 //                 <p className="tit">시리얼 번호</p>
 //                 <p className="txt">{device.serialNo}T</p>
 //               </li>
 //               <li>
 //                 <p className="tit">정격전압 <span className="fontRegular">(kV)</span></p>
 //                 <p className="txt">{(device.ratingVoltage) ? device.ratingVoltage : "-"}</p>
 //               </li>
 //               <li>
 //                 <p className="tit">정격전류 <span className="fontRegular">(A)</span></p>
 //                 <p className="txt">{(device.ratingCurrent) ? device.ratingCurrent : "-"}</p>
 //               </li>
 //               <li>
 //                 <p className="tit">차단전류 <span className="fontRegular">(kA)</span></p>
 //                 <p className="txt">{(device.cutoffCurrent) ? device.cutoffCurrent : "-"}</p>
 //               </li>
 //               <li>
 //                 <p className="tit">정격용량 <span className="fontRegular">(kVA)</span></p>
 //                 <p className="txt">{(device.gridVoltage) ? device.gridVoltage : "-"}</p>
 //               </li>
 //               <li>
 //                 <p className="tit">계통전압 <span className="fontRegular">(kV)</span></p>
 //                 <p className="txt">{(device.ratedCapacity) ? device.cutoffCurrent : "-"}</p>
 //               </li>
 //               <li>
 //                 <p className="tit">첨부파일</p>
 //                 {/*<p className="txt">*/}
 //                 <ul className="filelist down">
 //                   {(device.imageId)
 //                     ? <li>
 //                       <span>{device.imageId}</span>
 //                       <button type="button" className="btn btn-filedown"><span className="hide">삭제</span></button>
 //                     </li>
 //                     : <li>
 //                       <span>{"없음"}</span>
 //                       <button type="button" className="btn btn-filedown" disabled={true}><span className="hide">삭제</span></button>
 //                     </li>
 //                   }
 //                 </ul>
 //                 {/*</p>*/}
 //               </li>
 //               <li>
 //                 <p className="tit">메모</p>
 //                 <p className="txt">{(device.memo && (device.memo.length > 0)) ? device.memo : "-"}</p>
 //               </li>
 //             </ul>
 //           </div>
 //           <div className="btn__wrap">
 //             <button type="button" className="js-close" onClick={(e) => onSumit(e)}><span>확인</span></button>
 //           </div>
 //         </div>
 //       </div>
 //       }
 //       {/*</div>*/}
 //       {/*<!--//리스트 상세 보기 팝업-->*/}
 //     </>
 //   )
 // }
 
 
 