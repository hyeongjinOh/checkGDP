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
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"

//component
import EhpPagination from "../../common/pagination/EhpPagination";
import HilightSpan from "../../common/highlight/HilightSpan"

/**
 * @brief EHP 사업장 전기실 관리 - 회사/사업장 List 컴포넌트 , 반응형 동작
 * @param -
 * @returns react components
 */

function ZoneList(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //props
  const curTree = props.curTree;
  const setParentIsMobile = props.setIsMobile;
  const setParentWorkMode = props.setWorkMode;
  const setParentPopWin = props.setPopWin;
  //화면 이동
  const navigate = useNavigate();
  //mobile check
  const mobileRef = useRef(null); // Mobile Check용
  useEffect(() => { // resize handler
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
  }, []);
  useEffect(() => { // re-rendering mobile check
    if (CUTIL.isnull(mobileRef)) return;
    const mobileTag = mobileRef.current;
    if ( !CUTIL.isnull(mobileTag) ) {
      if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
        setParentIsMobile(true);
      } else {
        setParentIsMobile(false);
      }
    }
  }, []);
  //
  const [companyZoneList, setCompanyZoneList] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchTextField, setSearchTextField] = useState({
    searchField: "",
    searchText: ""
  });
  const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0 };
  const [pageInfo, setPageInfo] = useState(defaultPageInfo);
  function handleCurPage(page) {
    setPageInfo({ ...pageInfo, number: page });
  }

  let appPath = "";
  appPath = 'page=' + pageInfo.number + '&size=' + pageInfo.size;
  if (searchTextField.searchText.length > 0) {
    appPath = appPath + `&search=` + searchTextField.searchText;
  }

  clog("IN ZONELIST : " + appPath);
  ////////////////////////////////////////////////////////////////////////////
  const { data: retList, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/companyzones?${appPath}`,
    appQuery: {},
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch : curTree.company.companyId+appPath
  });

  useEffect(()=>{
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retList);
    clog("IN ZONELIST :  > " + isLoading + " : "  + JSON.stringify(retList));

    if (ERR_URL.length > 0) navigate(ERR_URL);
  
    if ( retList ) {
      if (retList.codeNum == CONST.API_200) {
        clog("IN COMPZONELIST : RES : " + JSON.stringify(retList.data.page));
        setParentPopWin("pop-area-rigth", 
        //setParentPopWin("pop-area-right-page-info", 
          <MobileZoneList
            htmlHeader={<h1>사업장 추가</h1>}
            searchText={searchText} 
            setSearchText={setSearchText}
            searchTextField={searchTextField}
            companyZoneList={retList.body} 
            pageInfo={retList.data.page}
            setPageInfo={handleCurPage}
            onClickGoSearch={onClickGoSearch}
            onClickZoneInsert={onClickZoneInsert}
            onClickWorkPlaceAprv={onClickWorkPlaceAprv}
          />
        )
        setCompanyZoneList(retList.body);
        setPageInfo(retList.data.page);
      }/* else {
        clog("------------RESPONSE ERROR>..............................");
        navigate(CONST.URL_NOT_FOUND);
      }*/
    }/* else { // system error 처리
      clog("----------CONNECTION ERROR>..............................");
      navigate(CONST.URL_NOT_FOUND);
    }*/
  }, [curTree, retList, searchText])
  /*
  //////////////////////////////////////////////////////////////////////////
  clog("IN SITEIVEW : INIT : curTree : " + JSON.stringify(curTree));
  (zoneInfo)
  ?clog("IN SITEIVEW : INIT : companyInfo : " + JSON.stringify(zoneInfo.company) + " : zoneInfo : " + JSON.stringify(zoneInfo.zone))
  :clog("IN SITEIVEW : INIT : companyInfo : " + "null");
  //clog("IN SITEIVEW : INIT : zoneInfo : " + (zoneInfo)?JSON.stringify(zoneInfo.zone):"null");
  */
  function onClickZoneInsert(e) {
    setParentWorkMode("CREATE");
  }

  function onClickGoSearch(e) {
    setSearchTextField({
      searchField: "",
      searchText: ""
    });
/*
    var searchTypeDiv = document.querySelector("#search_selected-value");
    clog("onClickGoSearch : DEVICE : " + searchTypeDiv);
    if (CUTIL.isnull(searchTypeDiv)) return;
    var selSearchType = searchTypeDiv.getAttribute("data-value");
*/
    setSearchTextField({ // 상태변경으로 리스트 재시작 + 검색
      searchField: "",
      searchText: searchText
    });
    // search시 필터 적용
    /*
    setSearchFilterList(
      filterList.filter((filter) => filter.checked)
    );
    */
  }

  function onClickWorkPlaceAprv(e, czoneInfo) {
    setParentPopWin("pop-workplace", 
      <WorkPlacePopup
        htmlHeader={<h1>사업장 허용 요청</h1>}
        czoneInfo={czoneInfo}
        curTree={props.curTree}
        setCurTree={props.setCurTree}
        setWorkMode={props.setWorkMode}
      />
    );
    CUTIL.jsopen_Popup(e);
  }


  return (
  <>
  {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)-->*/}
  {
    <div className="area__right" ref={mobileRef}>
      <h2>사업장 추가</h2>
      {/*<!--사업장 추가내 검색,신규등록 탭-->*/}
      <ul className="tab__small">
        {/*<!-- 선택된 탭 on -->*/}
        <li className="on"><a href="#" className="icon-search">검색</a></li>
        <li><a href="#" className="icon-pen" onClick={(e)=>onClickZoneInsert(e)}>신규등록</a></li>
      </ul>

      {/*<!--area__right_content, 오른쪽 컨텐츠 영역-->*/}
      <div className="area__right_content">
        {/*<!--검색영역-->*/}
        <div className="searcharea">
          <div className="searchinput">
            <span className="hide">검색</span>
            <div className="input__direct">
              <input type="text" placeholder="검색어를 입력하세요" className="w274" value={searchText} onChange={(e)=>setSearchText(e.target.value)}/>
              {(searchText.length > 0) &&
                <button type="button" className="btn btn-delete" onClick={(e)=>setSearchText("")}><span className="hide">입력 창 닫기</span></button>
              }
              
            </div>
            <button type="button" className="btn-search" onClick={(e)=>onClickGoSearch(e)}><span>조회</span></button>
          </div>
        </div>

        {/*<!--검색결과 테이블, tbl-list 클래스에 type3 추가-->*/}
        {/*<!--검색어 하이라이트 : span className="highlight" -->*/}
        <div className="tbl-list type3 w800">
          <table summary="사업장명, 지역명, 주소 항목으로 구성된 상업장 추가 리스트 입니다.">
            <caption>
              사업장 추가 리스트
            </caption>
            <colgroup>
              <col style={{"width": "90%"}} />
              <col style={{"width": "10%"}} />
            </colgroup>
            <tbody>
              {(companyZoneList)&&companyZoneList.map((czones, idx)=>(
              <tr key={`tr_${idx.toString()}`}>
                <td>
                  <ul>
                    <li>
                      <p className="placename">
                        <HilightSpan key={`comp_${idx.toString()}`} word={czones.companyName} keyword={searchTextField.searchText}/>
                      </p>
                      <p className="location">
                        <HilightSpan key={`zone_${idx.toString()}`} word={czones.zoneName} keyword={searchTextField.searchText}/>
                      </p>
                    </li>
                    <li className="address">{czones.zoneAddress}</li>
                  </ul>
                </td>
                <td>
                  <button type="button" 
                    className="btn-add center js-open" 
                    data-pop="pop-workplace"
                    onClick={(e)=>onClickWorkPlaceAprv(e, czones)}  
                  >
                    <span className="hide">사업장 추가</span>
                  </button>
                </td>
              </tr>
              ))}
            </tbody>
          </table>
          {(pageInfo) && <EhpPagination
            componentName={"ZONELIST"}
            pageInfo={pageInfo}
            handleFunc={handleCurPage}
          />}
        </div>
      </div>
      {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
    </div>  
  } 
  {/*<!--//area__right, 오른쪽 영역-->*/}    
  </>
  )

}
export default ZoneList;

function MobileZoneList(props) {
  const companyZoneList = props.companyZoneList;
  const pageInfo = props.pageInfo;
  const handleCurPage = props.setPageInfo;
  const searchText = props.searchText;
  const setSearchText = props.setSearchText;
  const searchTextField = props.searchTextField;
  const onClickGoSearch = props.onClickGoSearch;
  const onClickZoneInsert = props.onClickZoneInsert;
  const onClickWorkPlaceAprv = props.onClickWorkPlaceAprv;
  return (
  <>
  {/**mobile */}
    <div className="popup__body">
      {/*<!--area__right, 오른쪽 영역-->*/}
      <div className="area__right" id="pop-area-right">
        {/*<!--사업장 추가내 검색,신규등록 탭-->*/}
        <ul className="tab__small">
          {/*<!-- 선택된 탭 on -->*/}
          <li className="on"><a href="#" className="icon-search">검색</a></li>
          <li><a href="#" className="icon-pen" onClick={(e)=>onClickZoneInsert(e)}>신규등록</a></li>
        </ul>

        {/*<!--area__right_content, 오른쪽 컨텐츠 영역-->*/}
        <div className="area__right_content">
          {/*<!--검색영역-->*/}
          <div className="searcharea">
            <div className="searchinput">
              <span className="hide">검색</span>
              <div className="input__direct">
                <input type="text" placeholder="검색어를 입력하세요" className="w274" value={searchText} onChange={(e)=>setSearchText(e.target.value)}/>
                {(searchText.length > 0)&&
                <button type="button" className="btn btn-delete" onClick={(e)=>setSearchText("")}><span className="hide">입력 창 닫기</span></button>
                }
              </div>
              <button type="button" className="btn-search" onClick={(e)=>onClickGoSearch(e)}><span>조회</span></button>
            </div>
          </div>

          {/*<!--검색결과 테이블, tbl-list 클래스에 type3 추가-->*/}
          {/*<!--검색어 하이라이트 : span className="highlight" -->*/}
          <div className="tbl-list type3 w800">
            <table summary="사업장명, 지역명, 주소 항목으로 구성된 상업장 추가 리스트 입니다.">
              <caption>
                사업장 추가 리스트
              </caption>
              <colgroup>
                <col style={{"width": "90%"}} />
                <col style={{"width": "10%"}} />
              </colgroup>
              <tbody>
                {(companyZoneList)&&companyZoneList.map((czones, idx)=>(
                <tr key={`tr_m_${idx.toString()}`}>
                  <td>
                    <ul>
                      <li>
                        <p className="placename">
                          <HilightSpan key={`comp_${idx.toString()}`} word={czones.companyName} keyword={searchTextField.searchText}/>
                        </p>
                        <p className="location">
                          <HilightSpan key={`zone_${idx.toString()}`} word={czones.zoneName} keyword={searchTextField.searchText}/>
                        </p>
                      </li>
                      <li className="address">{czones.zoneAddress}</li>
                    </ul>
                  </td>
                  <td>
                    <button type="button" 
                      className="btn-add center" 
                      data-pop="pop-workplace"
                      onClick={(e)=>onClickWorkPlaceAprv(e, czones)}
                    >
                      <span className="hide">사업장 추가</span>
                    </button>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
            {(pageInfo) && <EhpPagination
              componentName={"ZONELIST"}
              pageInfo={pageInfo}
              handleFunc={handleCurPage}
            />}
          </div>
        </div>
        {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
      </div>
    </div>
  </>
  )
}


function WorkPlacePopup(props) {
  // recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //
  const curTree = props.curTree;
  const czoneInfo = props.czoneInfo;
  const setParentCurTree = props.setCurTree;
  const setParentWorkMode = props.setWorkMode;

  async function onClickApproval(czone) {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "POST",
      "appPath": "/api/v2/product/usertree",
      appQuery : {
        "product": "zone",
        "productName": czone.zoneName,
        "productParentId": czone.companyId,
        "approval": 1, //0 : 거절, 1 : 요청, 2 : 승인, 
        "isontree": true
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        clog("IN APPROVAL : RES : " + JSON.stringify(data.body));
        setParentCurTree("ZONE", // 정보수정 시 자신 호출
          {
            ...curTree,
            //subZone: { "subZoneId": subZone.subZoneId, "subZoneName": subZone.subZoneName },
            reload : true
          }
        );
        setParentWorkMode("LIST");
      } else { // api if
        // need error handle
        alert(data.body.errorList[0].msg);
      }
      CUTIL.jsclose_Popup("pop-workplace");
    }
  }

  function onClickCancel(e) {
    CUTIL.jsclose_Popup("pop-workplace");
  }

  return (
  <>
  <div className="popup__body">
    <p>
      담당자에게 사업장 등록을 요청하시겠습니까?<br />
      담당자 확인 후 사업장 접근이 가능합니다.
    </p>
  </div>
  <div className="popup__footer">
    <button type="button"
      className="bg-gray btn btn-close js-close"
      onClick={(e)=>onClickCancel(e)}
    >
      <span>취소</span>
    </button>
    <button
      type="button"
      className={"btn-close"}
      onClick={(e)=>onClickApproval(czoneInfo)}
    >
      <span>확인</span>
    </button>
  </div>
  </>

  )
}