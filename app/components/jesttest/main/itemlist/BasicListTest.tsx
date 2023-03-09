/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-05-27
 * @brief EHP List 컴포넌트
 *
 ********************************************************************/
import React, { useState, useEffect } from "react";
//
import { useAsync } from "react-async";
// recoli & state
import { useRecoilValue } from "recoil";
import { userInfoState, authState, } from '../../../../recoil/userState';
//
import { useTrans } from "../../../../utils/langs/useTrans";
//utils
import * as HttpUtil from "../../../../utils/api/HttpUtil";
import clog from "../../../../utils/logUtils"
//
import $ from "jquery";
//components
import Pagination from "../../../common/pagination/Pagination"
/**
 * @brief EHP List 컴포넌트, 반응형 동작
 * @param param0 curTreeData : Tree에서 선택한 SPG
 * @param param1
 * @returns react components
 */
function BasicListTest() {
  const userInfo = useRecoilValue(userInfoState);
  //const { company, zone, room, spg } = props.curTreeData;
  const [curPage, setCurPage] = useState(0);
  const pageSize = 10;
  const listSize = 10;
  const [itemCheckList, setItemCheckList] = useState([]);
  const [retPageInfo, setRetPageInfo] = useState({
    "size": 0,
    "totalElements": 0,
    "totalPages": 0,
    "number": 0
  });

  const checkSearchType = [
    { key: 0, type: "itemName", text: "기기 명" },
    { key: 1, type: "serialNo", text: "제조번호" },
    { key: 2, type: "responsible", text: "담당자" },
  ];
  const [searchType, setSearchType] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchRText, setSearchRText] = useState("");
  //
  const [newRegistered, setNewRegistered] = useState(true);
  const [itemExisted, setItemExisted] = useState(true);

  const [resErrorCode, setResErrorCode] = useState(200);
  const [resErrorMsg, setResErrorMsg] = useState("검색결과가 없습니다.");

  const [sortData, setSortData] = useState({ "sortField": "itemName", "sort": "ASC" });

  const strNewRegistered = (newRegistered) ? 'true' : 'false';
  const strItemExisted = (itemExisted) ? 'true' : 'false';
  let appPath = 'page=' + curPage + '&size=' + listSize;
  //appPath = appPath + '&companyId=' + company.companyId + '&zoneId=' + zone.zoneId + '&roomId=' + room.roomId + '&spgId=' + spg.spgId;
  appPath = appPath + '&companyId=' + "LS청주" + '&zoneId=' + "1공장" + '&roomId=' + "전기실1" + '&spgId=' + "VCB";
  appPath = appPath + '&newRegistered=' + strNewRegistered;
  appPath = appPath + '&itemExisted=' + strItemExisted;
  appPath = appPath + '&sort=' + sortData.sortField + ',' + sortData.sort;


  //appPath = appPath + '&newRegistered='+(newRegistered==true)?'true':'false';
  //appPath = appPath + '&itemExisted='+(itemExisted==true)?'true':'false';
  useEffect(() => {
    setSearchText("");
    setSearchRText("");
  }, []);
  if ((searchType.length > 0) && (searchRText.length > 0)) {
    appPath = appPath + '&' + searchType + '=' + searchRText;
  }
  const { data: data, error, isLoading, reload, run } = useAsync({
    promiseFn: HttpUtil.PromiseHttp,
    //deferFn: HttpUtil.Http,
    httpMethod: "GET",
    appPath: "/api/v2/item/basic?" + appPath,
    appQuery: {
      /*
      page: curPage,
      size: listSize,
      companyId: company.companyId, 
      zoneId: zone.zoneId,
      roomId: room.roomId,
      spgId: spg.spgId,
      newRegistered : true,
      itemExisted : true,
      itemName : "",
""
      */
    },

    watch: appPath
    //watch: curPage+pageSize+company.companyId+zone.zoneId+room.roomId+spg.spgId,
  });

  useEffect(() => {
    let errList = "";
    if (data) {
      if (data.codeNum == 200) {
        //clog("IN BASIC LIST : " + JSON.stringify(data.data.page));
        setItemCheckList(data.body); // list
        setRetPageInfo(data.data.page);
      } else {
        setResErrorCode(data.codeNum);
        data.errorList.map((errMsg, idx) => (
          errList = errList + errMsg
        ));
        setResErrorMsg(errList);
      }
    }
  }, [data]);
  //if (isLoading) return (<div>Loading.....</div>);

  //
  function onClickGoSearch(e) {
    var selSearchKey = $("#search_selected-value").attr("data-value");

    var selSearchType;
    checkSearchType.filter((data, idx) => (data.key === parseInt(selSearchKey))).map((stype, idx) => (
      selSearchType = stype.type
    ));
    setSearchType(selSearchType);
    //setSearchText(searchText);
    setSearchRText(searchText);

  }


  //selet  Action
  function onClickSearchSelect(e) {
    // select active 액션
    const selectBoxElements = document.querySelectorAll("#search_select");
    //
    function toggleSelectBox(selectBox) {
      selectBox.classList.toggle("active");
    }
    // option 선택 시  값 변경 액션
    function selectOption(optionElement) {
      const selectBox = optionElement.closest("#search_select");
      //option 값 selected-value 로 변경
      const selectedElement = selectBox.querySelector(".selected-value ");
      selectedElement.textContent = optionElement.textContent;
      // by sjpark
      selectedElement.setAttribute("data-value", optionElement.value)
      //setSelectedPeriod(optionElement.value);
      //clog("selected-data : " + selectedElement.getAttribute("data-value"));
    }
    // 펼쳐졌을 시 otption 값
    selectBoxElements.forEach((selectBoxElement) => {
      const targetElement = e.target;
      const isOptionElement = selectBoxElement.classList.contains("option");
      if (isOptionElement.valueOf) {
        selectOption(targetElement);
      }
      toggleSelectBox(selectBoxElement);
    });
    //select active remove 옵션
    const targetElement = e.target;
    const isSelect = targetElement.classList.contains("search_select") || targetElement.closest("#search_select");
    if (isSelect) {
      return;
    }
    const allSelectBoxElements = document.querySelectorAll("#search_select");
    allSelectBoxElements.forEach((boxElement) => {
      boxElement.classList.remove("active");
    });
  }

  // sort 액션
  function onClickSort(e) {
    var actTag = (e.target.tagName == "TH") ? e.target : e.currentTarget;
    var selSortField = actTag.getAttribute("data-value");
    var selSort = (sortData.sort === "ASC") ? "DESC" : "ASC";
    if (selSortField !== sortData.sortField) { // 정렬필드가 변경된 경우
      selSort = "DESC";
    }

    // clog("onClickSort sort field: " + sortData.sortField);
    // clog("onClickSort sort : " + sortData.sort);

    setSortData({
      "sortField": selSortField,
      "sort": selSort
    });

  }



  return (
    <>
      <div className="box__header">
        <p className="box__title"><span className="txt-purple">Basic</span> e-HC List</p>
        {/* <!--220530 설정버튼 삭제됨. box__etc 태그 전체 삭제--> */}
      </div>
      <div className="box__body">
        {/* <!-- 리스트 위 항목 --> */}
        <div className="tbl__top">
          <div className="left">
            <span deta-testid="add">등록 항목</span>
            <ul className="checkBox">
              <li>
                <input data-testid="check1" type="checkbox" id="chk1" name="chklist" checked={newRegistered} onChange={(e) => setNewRegistered(!newRegistered)} readOnly />
                <label htmlFor="chk1">새 등록</label>
              </li>
              <li>
                <input data-testid="check2" type="checkbox" id="chk2" name="chklist" checked={itemExisted} onChange={(e) => setItemExisted(!itemExisted)} readOnly />
                <label htmlFor="chk2">기 등록</label>
              </li>
            </ul>
          </div>
          <div className="right">
            <div className="searcharea">
              {/* <!--220530, div class="searchinput" 추가 : 모바일에서 숨기기 위해서 생성--> */}
              <div className="searchinput" >
                <span>검색</span>
                <div id="search_select" className="select" onClick={(e) => onClickSearchSelect(e)}>
                  <div className="selected">
                    <div id="search_selected-value" className="selected-value" data-value='0'>기기 명</div>
                    <div className="arrow"></div>
                  </div>
                  <ul>
                    {checkSearchType.map((pval, idx) => (
                      <li className="option" key={"search_pval_" + idx} value={pval.key}>{pval.text}</li>
                    ))}
                  </ul>
                </div>
                <input type="text" placeholder="검색어를 입력하세요" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
              </div>
              <button data-testid="basicListTestbutton" type="button" className="btn-search" onClick={(e) => onClickGoSearch(e)}><span>조회</span></button>
            </div>
          </div>
        </div>
        {/* <!-- 기본 리스트 형식 테이블, 기본 중앙정렬, td가 전체적으로 좌측일 경우 tbl-list에 txt-left 클래스 추가, 우측일때 txt-right추가 --> */}
        <div className="tbl-list">
          <table data-testid="table" summary="기기 명, 제조번호, 담당자, 최근점검일, Step, Report, Memo, 성적서, 임시저장, 점검 진행 항목으로 구성된 Basic e-HC List 입니다.">
            <caption>
              Basice-HCList
            </caption>
            <colgroup>
              {/* <col style="" /> */}
            </colgroup>
            <thead>
              <tr>
                {/*<!--sort 오름차순-->*/}
                <th scope="col"
                  className={(sortData.sortField === "itemName") ? (sortData.sort === "ASC") ? "sort asc" : "sort desc" : "sort asc"}
                  onClick={(e) => onClickSort(e)} data-value="itemName"><span data-testid="itemName">기기 명</span></th>
                {/*<!--sort 내림차순-->*/}
                {/*<!--220531, 클래스 d-sm-none 을 d-lm-none으로 수정-->*/}
                <th scope="col"
                  className={(sortData.sortField === "serialNo") ? (sortData.sort === "ASC") ? "sort asc d-lm-none" : "sort desc d-lm-none" : "sort asc d-lm-none"}
                  onClick={(e) => onClickSort(e)} data-value="serialNo" ><span>제조번호</span></th>
                {/*<!--220531, 클래스 d-sm-none 을 d-lm-none으로 수정-->*/}
                <th scope="col"
                  className={(sortData.sortField === "responsible") ? (sortData.sort === "ASC") ? "sort asc d-lm-none" : "sort desc d-lm-none" : "sort asc d-lm-none"}
                  onClick={(e) => onClickSort(e)} data-value="responsible" data-testid="manager"><span>담당자</span></th>
                <th scope="col"
                  className={(sortData.sortField === "updatedTime") ? (sortData.sort === "ASC") ? "sort asc" : "sort desc" : "sort asc"}
                  onClick={(e) => onClickSort(e)} data-value="updatedTime"><span>최근 점검일</span></th>
                {/*<!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none-->*/}
                <th scope="col" className="d-sm-none"><span>Step</span></th>
                {/*<!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none-->*/}
                <th scope="col" className="d-sm-none"><span>Report</span></th>
                {/*<!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none-->*/}
                <th scope="col" className="d-sm-none"><span>Memo</span></th>
                {/*<!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none-->*/}
                <th scope="col" className="d-sm-none"><span>성적서</span></th>
                {/*<!--비활성화일경우 클래스에 disabled -->*/}
                {/*<!--220531, 클래스 d-sm-none 을 d-lm-none으로 수정-->*/}
                <th scope="col"
                  className={(sortData.sortField === "isTempSave") ? (sortData.sort === "ASC") ? "sort asc d-lm-none" : "sort desc d-lm-none" : "sort asc d-lm-none"}
                  onClick={(e) => onClickSort(e)} data-value="isTempSave"><span>임시저장</span></th>
                {/* 임시 저장 disabled 처리 */}
                {/* {((itemCheckList == null) || (!itemCheckList === true))
                    ? <th className= "sort asc d-lm-none disabled"><span >임시저장</span></th>
                    : <th className={(sortData.sortField === "isTempSave") ? (sortData.sort === "ASC") ? "sort asc d-lm-none" : "sort desc d-lm-none" : "sort asc d-lm-none"}
                    onClick={(e) => onClickSort(e)} data-value="isTempSave"><span >임시저장</span></th>
                  } */}
                <th scope="col"><span>점검 진행</span></th>
              </tr>
            </thead>
            <tbody>
              {
                ((resErrorCode != 200) || (retPageInfo.totalElements <= 0)) &&
                <tr><td>{resErrorMsg}</td></tr>
              }
              {itemCheckList.map((item, idx) => (
                <tr key={item.id + "_" + idx}>
                  {/* <!--기본 중앙 정렬 / td 개별적으로 좌측정렬일경우 txt-left , 우측 txt-right, 중앙 txt-center --> */}
                  <td className="txt-left">{item.itemName}</td>
                  {/* <!--말줄임들어갈 경우 p class="ellipsis" 태그로 감쌈 --> */}
                  {/* <!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none--> */}
                  <td className="txt-left d-sm-none"><p className="ellipsis">{item.serialNo}</p></td>
                  {/* <!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none--> */}
                  <td className="d-sm-none">{item.responsible}</td>
                  <td>2021-10-25</td>
                  {/* <!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none--> */}
                  <td className="d-sm-none">
                    {/* <!--기본:모든단계안된경우 icon-step 만 / 전단계모두완료 all 추가 / 1단계만 one 추가 / 2단계만 two 추가--> */}
                    {clog("XXXXXX : " + JSON.stringify(item))}
                    <ul className="icon-step all">
                      <li><span className="hide">1단계</span></li>
                      <li><span className="hide">2단계</span></li>
                      <li><span className="hide">3단계</span></li>
                    </ul>
                  </td>
                  {/* <!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none--> */}
                  <td className="d-sm-none">
                    <button type="button" className="btn btn-file"><span className="hide">파일다운로드</span></button>
                  </td>
                  {/* <!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none--> */}
                  <td className="d-sm-none">
                    <button type="button" className="btn btn-memo"><span className="hide">메모</span></button>
                  </td>
                  {/* <!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none--> */}
                  <td className="d-sm-none">
                    <button type="button" className="btn btn-file"><span className="hide">성적서</span></button>
                  </td>
                  {/* <!--220530, 클래스 d-sm-none 추가 : 모바일버전에서 display:none--> */}
                  <td className="d-sm-none">
                    <button type="button" className="btn btn-down"><span className="hide">임시저장</span></button>
                  </td>
                  <td>
                    <button type="button" className="bg-purple"><span>시작</span></button>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
        <Pagination
          componentName={"BASIC"}
          pageSize={pageSize}
          totalCount={retPageInfo.totalElements}
          curPage={curPage}
          listSize={listSize}
          handleFunc={setCurPage}
        />
      </div>
    </>
  )
}

export default BasicListTest;