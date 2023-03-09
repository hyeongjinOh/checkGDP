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
// component
import EhpPagination from "../../../common/pagination/EhpPagination";


//component
function DeviceListTest(props) {
  //recoil
  // const userInfo = useRecoilValue(userInfoLoginState);
  //props
  const isMobile = props.isMobile;
  const curTree = props.curTree;
  const workMode = props.workMode;
  //  const setParentIsMobile = props.setIsMobile;
  const setParentWorkMode = props.setWorkMode;
  const setParentPopWin = props.setPopWin;
  //
  //mobile check
  const mobileRef = useRef(null); // Mobile Check용
  const searchRef = useRef(null); // searchBox pop Check용
  const [isSearchPop, setIsSearchPop] = useState(false);

  /*    useEffect(() => { // resize handler
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
         clog("handleResize : " + searchTag.clientHeight + " X " + searchTag.clientWidth);
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
     useEffect(() => { // re-rendering mobile check
       if (CUTIL.isnull(mobileRef)) return;
       const mobileTag = mobileRef.current;
       if (!CUTIL.isnull(mobileTag)) {
         if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
           setParentIsMobile(true);
         } else {
           setParentIsMobile(false);
         }
       }
     }, []); */
  //
  useEffect(() => { // search box popup check
    if (CUTIL.isnull(searchRef)) return;
    const searchTag = searchRef.current;
    if (!CUTIL.isnull(searchTag)) {
      if ((searchTag.clientHeight <= 0) && (searchTag.clientWidth <= 0)) {
        setIsSearchPop(true);
      } else {
        setIsSearchPop(false);
      }
    }
  }, []);

  //
  const [searchText, setSearchText] = useState("");
  const [searchTextField, setSearchTextField] = useState({
    searchField: "",
    searchText: ""
  });
  const [deviceList, setDeviceList] = useState(null);
  const defaultPageInfo = { "size": 20, "totalElements": 0, "totalPages": 0, "number": 0 };
  const [sortData, setSortData] = useState({ "sortField": "rownumber", "sort": "ASC" });
  const [pageInfo, setPageInfo] = useState(defaultPageInfo);

  /*    let appPath = "roomId=" + curTree.room.roomId;
     appPath = appPath + '&page=' + pageInfo.number + '&size=' + pageInfo.size;
     appPath = appPath + '&sort=' + sortData.sortField + ',' + sortData.sort;
     if (searchTextField.searchText.length > 0) {
       appPath = appPath + `&${searchTextField.searchField}=` + searchTextField.searchText;
     } */
  /*
  appPath = appPath + '&page=' + curPage + '&size=' + listSize
  appPath = appPath + '&sort=' + sortData.sortField + ',' + sortData.sort;
  // // 검색 
  if (!CUTIL.isnull(searchType) && (searchType.length > 0) && (searchRText.length > 0)) {
    appPath = appPath + '&' + searchType + '=' + searchRText;
    clog("검색 액션 : " + appPath);
  }
  */
  /*  useEffect(() => {
     setParentPopWin("pop-search-small",
       <MobileSearchPopup
         searchText={searchText}
         setSearchText={setSearchText}
         onClickGoSearch={onClickGoSearch}
       />
     );
   }) */ // searchText 이벤트 반영하기 위해서, 모든 스테이트 반영
  //////////////////////////////////
  const { data: retDevice, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: '/api/v2/product/company/zone/subzone/room/panel/itemManageList?',
    appQuery: {},
    // userToken: userInfo.loginInfo.token,
  });

  useEffect(() => {
    if (retDevice) {
      if (retDevice.codeNum == CONST.API_200) {
        setDeviceList(retDevice.body);
        setPageInfo(retDevice.data.page);
        setParentPopWin("pop-list",
          <MobileDeviceList
            curTree={curTree}
            workMode={workMode}
            searchText={searchText}
            setSearchText={setSearchText}
            onClickGoSearch={onClickGoSearch}
            deviceList={retDevice.body}
            pageInfo={retDevice.data.page}
            setPageInfo={handleCurPage}
            onClickDeviceDetailView={onClickDeviceDetailView}
            onClickDeviceTab={onClickDeviceTab}
            sortData={sortData}
            onClickSort={onClickSort}
          />
        );
      }
    }
  }, [retDevice]);

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

  function onClickSelectOnly(e, device) {
    setDeviceList(
      deviceList.map((dev) => (dev.itemId === device.itemId) ? { ...dev, selected: true } : { ...dev, selected: false })
    );
  }
  function onClickSort(e) {
    var actTag = (e.target.tagName == "TH") ? e.target : e.currentTarget;
    var selSortField = actTag.getAttribute("data-value");
    var selSort = (sortData.sort === "ASC") ? "DESC" : "ASC";
    if (selSortField !== sortData.sortField) { // 정렬필드가 변경된 경우
      selSort = "DESC";
    }
    setSortData({
      "sortField": selSortField,
      "sort": selSort
    });
  }

  function onClickDeviceDetailView(e, device) {
    setParentPopWin("pop-list-view",
      <MobileDeviceDetail
        htmlHeader={<h1>{device.itemName}</h1>}
        deviceInfo={device}
      />
    );
    //deviceList.filter((dev))
    clog("onClickDeviceDetailView : " + JSON.stringify(device));
    //CUTIL.jsopen_m_Popup(e);
  }

  function onClickDeviceTab(e, workMode) {
    clog("DeviceList : onClickDeviceTab : " + workMode + " : " + isMobile);
    //CUTIL.jsopen_s_Popup(e, isMobile);
    setParentWorkMode(workMode);
  }
  clog(deviceList);
  clog("IN DEVICE : INIT : page Info : " + JSON.stringify(pageInfo) + " : " + isSearchPop + " : " + workMode);

  return (
    <>
      {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)-->*/}
      {
        <div className="area__right" ref={mobileRef}>
          <ul className="page-loca">
            {/*       <li>{curTree.company.companyName}</li>
             <li>{curTree.zone.zoneName}</li>
             <li>{curTree.subZone.subZoneName}</li>
             <li>{curTree.room.roomName}</li> */}
          </ul>
          {/* <h2>{curTree.room.roomName}</h2> */}
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
            /* onClick={(e) => (isSearchPop) && CUTIL.jsopen_m_Popup(e)} */
            >
              <p className="title">
                <span className="txt-black">검색</span>
              </p>
              <div className="searcharea">
                <div className="searchinput">
                  <div className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)} ref={searchRef}>
                    <div className="selected">
                      <div id="search_selected-value" className="selected-value" data-value="itemName">기기 명</div>
                      <div className="arrow"></div>
                    </div>
                    <ul>
                      <li className="option" data-value="itemName">기기 명</li>
                      <li className="option" data-value="serialNo">제조번호</li>
                    </ul>
                  </div>
                  <div className="input__direct">
                    <input type="text" data-testid="searchTest" placeholder="검색어를 입력하세요" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                    {(searchText.length > 0) &&
                      <button type="button" className="btn btn-delete" onClick={(e) => setSearchText("")}><span className="hide">입력 창 닫기</span></button>
                    }
                  </div>
                  <button type="button" data-testid="searchButton" className="btn-search" onClick={(e) => onClickGoSearch(e)}><span>조회</span></button>
                  <button type="button" className="btn btn-filedown"><span className="hide">다운로드</span></button>
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
                    <th scope="col" className={`sort ${(sortData.sortField === "rownumber") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left`}
                      onClick={(e) => onClickSort(e)} data-value={"rownumber"}>
                      <span>등록 순</span>
                    </th>
                    <th scope="col" className="txt-left">기기 명</th>
                    <th scope="col" className="txt-left">Panel 명</th>
                    <th scope="col" className="txt-left"><span>모델 명</span></th>
                    <th scope="col" className="txt-left"><span>시리얼 번호</span></th>
                    <th scope="col" className="txt-left d-lm-none">정격전압</th>
                    <th scope="col" className="txt-left d-lm-none">정격전류</th>
                    <th scope="col" className="txt-left d-lm-none">차단전류</th>
                    <th scope="col" className="txt-left d-lm-none">정격용량</th>
                    <th scope="col" className="txt-left d-lm-none">계통전압</th>
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
                      onClick={(e) => (isSearchPop) ? onClickDeviceDetailView(e, device) : onClickSelectOnly(e, device)}
                    >
                      {/* <td className="txt-left">{(idx + 1) + (pageInfo.number * pageInfo.size)}</td> */}
                      <td className="txt-left">{device.rowNumber}</td>
                      <td className="txt-left">{device.spg.spgName}</td>
                      <td className="txt-left">
                        <p className="ellipsis wmax-140">
                          <span className="tooltip">
                            {/* <!--기존 내용--> */}
                            {device.panel.panelName}
                            {/* <!--툴팁 내용--> */}
                            <span className="tooltip-text"> {device.panel.panelName}</span>
                          </span>
                        </p>
                      </td>
                      <td className="txt-left">
                        <p className="ellipsis wmax-140">
                          <span className="tooltip">
                            {/* <!--기존 내용--> */}
                            {device.itemName}
                            {/* <!--툴팁 내용--> */}
                            <span className="tooltip-text">{device.itemName} </span>
                          </span>
                        </p>
                      </td>
                      <td className="txt-left">
                        <p className="ellipsis wmax-140">
                          <span className="tooltip">
                            {/* <!--기존 내용--> */}
                            {device.serialNo}
                            {/* <!--툴팁 내용--> */}
                            <span className="tooltip-text"> {device.serialNo}</span>
                          </span>
                        </p>
                      </td>
                      <td className="txt-left d-lm-none">{(device.ratingVoltage) ? device.ratingVoltage : "-"}</td>
                      <td className="txt-left d-lm-none">{(device.ratingCurrent) ? device.ratingCurrent : "-"}</td>
                      <td className="txt-left d-lm-none">{(device.cutoffCurrent) ? device.cutoffCurrent : "-"}</td>
                      <td className="txt-left d-lm-none">{(device.gridVoltage) ? device.gridVoltage : "-"}</td>
                      <td className="txt-left d-lm-none">{(device.ratedCapacity) ? device.ratedCapacity : "-"}</td>
                      <td className="d-lm-none">
                        <button type="button"
                          className="btn btn-photo"
                          disabled={(device.imageId) ? true : false}
                        >
                          <span className="hide">첨부파일</span>
                        </button>
                      </td>
                      <td className="d-lm-none">
                        <button type="button"
                          className="btn btn-memo"
                          disabled={(device.memo && (device.memo.length > 0)) ? true : false}
                        >
                          <span className="hide">메모</span>
                        </button>
                      </td>
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
      }
      {/*<!--//area__right, 오른쪽 영역-->*/}
    </>
  )

}
export default DeviceListTest;

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
              <div className="selected-value" data-value="itemName">기기 명</div>
              <div className="arrow"></div>
            </div>
            <ul>
              <li className="option" data-value="itemName">기기 명</li>
              <li className="option" data-value="serialNo">제조번호</li>
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

  return (
    <>
      {/*<!-- 모바일 오른쪽 영역 area-right 팝업, 767이하에서는 팝업으로 노출 / 사업장 정보 페이지에서는 page-info 클래스 추가 -->*/}
      {
        <div className="popup__body">
          <ul className="page-loca">
            <li>{curTree.company.companyName}</li>
            <li>{curTree.zone.zoneName} 사업장</li>
            <li>{curTree.subZone.subZoneName}</li>
            <li>{curTree.room.roomName}</li>
          </ul>
          <div className="page-top">
            <h2>{curTree.room.roomName}</h2>
          </div>

          <div className="area__right_content workplace__info">
            <ul className="tab__small">
              {/*<!-- 선택된 탭 on -->*/} {/*<!--일괄등록 관련 팝업 추가, 220801-->*/}
              <li className={(workMode === "BATCH") ? "on" : ""}>
                <a
                  className="icon-add js-open-s"
                  data-pop="pop-devicealladd"
                  onClick={(e) => onClickDeviceTab(e, "BATCH")}
                >일괄등록</a></li>
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
              /* onClick={(e) => CUTIL.jsopen_m_Popup(e)} */
              >
                <p className="title">
                  <span>검색</span>
                </p>
                <div className="searcharea">
                  <div className="searchinput">
                    <div className="select">
                      <div className="selected">
                        <div id="search_selected-value" className="selected-value" data-value="itemName">기기 명</div>
                        <div className="arrow"></div>
                      </div>
                      <ul>
                        <li className="option" data-value="itemName">기기 명</li>
                        <li className="option" data-value="serialNo">제조번호</li>
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
                    <button type="button" className="btn-search" onClick={(e) => onClickGoSearch(e)}><span>조회</span></button>
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
                      <th scope="col" className={`sort ${(sortData.sortField === "rownumber") ? (sortData.sort === "ASC") ? "asc" : "desc" : "asc"} txt-left`}
                        onClick={(e) => onClickSort(e)} data-value={"rownumber"}>
                        <span>등록 순</span>
                      </th>
                      <th scope="col" className="txt-left">기기 명</th>
                      <th scope="col" className="txt-left">Panel 명</th>
                      <th scope="col" className="txt-left"><span>모델 명</span></th>
                      <th scope="col" className="txt-left"><span>시리얼 번호</span></th>
                      <th scope="col" className="txt-left d-lm-none">정격전압</th>
                      <th scope="col" className="txt-left d-lm-none">정격전류</th>
                      <th scope="col" className="txt-left d-lm-none">차단전류</th>
                      <th scope="col" className="txt-left d-lm-none">정격용량</th>
                      <th scope="col" className="txt-left d-lm-none">계통전압</th>
                      <th scope="col" className="d-lm-none">첨부파일</th>
                      <th scope="col" className="d-lm-none"><span>Memo</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/*<!--tr 내 data-pop="pop-list-view" 화면사이즈 줄었을 때 리스트 내용 팝업-->*/}
                    {/*<!--tr 포커스 갔을 때 클래스 focused-->*/}
                    {(deviceList) && deviceList.map((device, idx) => (
                      <tr key={`dv_m_${idx.toString()}`}
                        className={`js-open-m ${(device.hasOwnProperty("selected")) ? (device.selected) ? "focused" : "" : ""}`}
                        data-pop="pop-list-view"
                        onClick={(e) => onClickDeviceDetailView(e, device)}
                      >
                        {/* <td className="txt-left">{(idx + 1) + (pageInfo.number * pageInfo.size)}</td> */}
                        <td className="txt-left">{device.rowNumber}</td>
                        <td className="txt-left">{device.spg.spgName}</td>
                        <td className="txt-left">
                          <p className="ellipsis wmax-140">
                            <span className="tooltip">
                              {/* <!--기존 내용--> */}
                              {device.panel.panelName}
                              {/* <!--툴팁 내용--> */}
                              <span className="tooltip-text"> {device.panel.panelName}</span>
                            </span>
                          </p>
                        </td>
                        <td className="txt-left">
                          <p className="ellipsis wmax-140">
                            <span className="tooltip">
                              {/* <!--기존 내용--> */}
                              {device.itemName}
                              {/* <!--툴팁 내용--> */}
                              <span className="tooltip-text">{device.itemName} </span>
                            </span>
                          </p>
                        </td>
                        <td className="txt-left">
                          <p className="ellipsis wmax-140">
                            <span className="tooltip">
                              {/* <!--기존 내용--> */}
                              {device.serialNo}
                              {/* <!--툴팁 내용--> */}
                              <span className="tooltip-text"> {device.serialNo}</span>
                            </span>
                          </p>
                        </td>
                        <td className="txt-left d-lm-none">{(device.ratingVoltage) ? device.ratingVoltage : "-"}</td>
                        <td className="txt-left d-lm-none">{(device.ratingCurrent) ? device.ratingCurrent : "-"}</td>
                        <td className="txt-left d-lm-none">{(device.cutoffCurrent) ? device.cutoffCurrent : "-"}</td>
                        <td className="txt-left d-lm-none">{(device.gridVoltage) ? device.gridVoltage : "-"}</td>
                        <td className="txt-left d-lm-none">{(device.ratedCapacity) ? device.cutoffCurrent : "-"}</td>
                        <td className="d-lm-none">
                          <button type="button"
                            className="btn btn-photo"
                            disabled={(device.imageId) ? true : false}
                          >
                            <span className="hide">첨부파일</span>
                          </button>
                        </td>
                        <td className="d-lm-none">
                          <button type="button"
                            className="btn btn-memo"
                            disabled={(device.memo && (device.memo.length > 0)) ? true : false}
                          >
                            <span className="hide">메모</span>
                          </button>
                        </td>
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
      }
      {/*<!--//area__right, 오른쪽 영역-->*/}
    </>
  )

}


function MobileDeviceDetail(props) {
  const device = props.hasOwnProperty("deviceInfo") ? props.deviceInfo : null;

  function onSumit(e) {
    var btnCommentClose = document.getElementById("pop-list-view");
    var body = document.body
    if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
    if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;")

  }

  return (
    <>
      {/*<!--리스트 상세 보기 팝업, 220804 수정 (항목 수정 추가 및 클래스 추가)-->*/}
      {/*
      <div id="pop-list-view" className="popup-layer js-layer layer-out hidden page-report page-detail page-workplace page-info page-list-view">
        <div className="popup__head">
          <h1>{(device)?device.itemName:"-"}</h1>
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
    </div>*/}
      {(device) && <div className="popup__body">
        <div className="area__right_content workplace__info">
          <div className="content__info">
            <h3 className="hide">리스트 상세 정보</h3>
            <ul>
              <li>
                <p className="tit">기기 명</p>
                <p className="txt">{device.spg.spgName}</p>
              </li>
              <li>
                <p className="tit">모델 명</p>
                <p className="txt">{device.itemName}</p>
              </li>
              <li>
                <p className="tit">시리얼 번호</p>
                <p className="txt">{device.serialNo}T</p>
              </li>
              <li>
                <p className="tit">정격전압 <span className="fontRegular">(kV)</span></p>
                <p className="txt">{(device.ratingVoltage) ? device.ratingVoltage : "-"}</p>
              </li>
              <li>
                <p className="tit">정격전류 <span className="fontRegular">(A)</span></p>
                <p className="txt">{(device.ratingCurrent) ? device.ratingCurrent : "-"}</p>
              </li>
              <li>
                <p className="tit">차단전류 <span className="fontRegular">(kA)</span></p>
                <p className="txt">{(device.cutoffCurrent) ? device.cutoffCurrent : "-"}</p>
              </li>
              <li>
                <p className="tit">정격용량 <span className="fontRegular">(kVA)</span></p>
                <p className="txt">{(device.gridVoltage) ? device.gridVoltage : "-"}</p>
              </li>
              <li>
                <p className="tit">계통전압 <span className="fontRegular">(kV)</span></p>
                <p className="txt">{(device.ratedCapacity) ? device.cutoffCurrent : "-"}</p>
              </li>
              <li>
                <p className="tit">첨부파일</p>
                {/*<p className="txt">*/}
                <ul className="filelist down">
                  {(device.imageId)
                    ? <li>
                      <span>{device.imageId}</span>
                      <button type="button" className="btn btn-filedown"><span className="hide">삭제</span></button>
                    </li>
                    : <li>
                      <span>{"없음"}</span>
                      <button type="button" className="btn btn-filedown" disabled={true}><span className="hide">삭제</span></button>
                    </li>
                  }
                </ul>
                {/*</p>*/}
              </li>
              <li>
                <p className="tit">메모</p>
                <p className="txt">{(device.memo && (device.memo.length > 0)) ? device.memo : "-"}</p>
              </li>
            </ul>
          </div>
          <div className="btn__wrap">
            <button type="button" className="js-close" onClick={(e) => onSumit(e)}><span>확인</span></button>
          </div>
        </div>
      </div>
      }
      {/*</div>*/}
      {/*<!--//리스트 상세 보기 팝업-->*/}
    </>
  )
}


