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
import { userInfoLoginState } from "../../../recoil/userState";


// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"

//component
function ZoneList(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const curTree = props.curTree;
    const setParentIsMobile = props.setIsMobile;
    const setParentWorkMode = props.setWorkMode;
    const setParentPopWin = props.setPopWin;
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
        if (!CUTIL.isnull(mobileTag)) {
            if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
                //setParentIsMobile(true);
            } else {
                // setParentIsMobile(false);
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
    const defaultPageInfo = { "size": 20, "totalElements": 0, "totalPages": 0, "number": 0 };
    const [pageInfo, setPageInfo] = useState(defaultPageInfo);

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
        //watch: curTree.company.companyId + appPath
    });

    useEffect(() => {
        if (retList) {
            if (retList.codeNum == CONST.API_200) {
                clog("IN COMPZONELIST : RES : " + JSON.stringify(retList.data.page));
                setParentPopWin("pop-area-rigth",
                    <MobileZoneList
                        htmlHeader={<h1>사업장 추가</h1>}
                        searchText={searchText}
                        setSearchText={setSearchText}
                        companyZoneList={retList.body}
                        page={retList.page}
                        onClickGoSearch={onClickGoSearch}
                        onClickZoneInsert={onClickZoneInsert}
                    />
                )
                setCompanyZoneList(retList.body);
                setPageInfo(retList.data.page);
            }
        }
    }, [curTree, retList, searchText])

    function onClickZoneInsert(e) {
        setParentWorkMode("CREATE");
    }

    function onClickGoSearch(e) {
        setSearchTextField({
            searchField: "",
            searchText: ""
        });

        setSearchTextField({ // 상태변경으로 리스트 재시작 + 검색
            searchField: "",
            searchText: searchText
        });

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
                        <li className="on"><a className="icon-search">검색</a></li>
                        <li><a className="icon-pen" onClick={(e) => onClickZoneInsert(e)}>신규등록</a></li>
                    </ul>

                    {/*<!--area__right_content, 오른쪽 컨텐츠 영역-->*/}
                    <div className="area__right_content">
                        {/*<!--검색영역-->*/}
                        <div className="searcharea">
                            <div className="searchinput">
                                <span className="hide">검색</span>
                                <div className="input__direct">
                                    <input type="text" placeholder="검색어를 입력하세요" className="w274" value={"LS일렉트릭"} onChange={(e) => setSearchText(e.target.value)} />
                                    {(searchText.length > 0) &&
                                        <button type="button" className="btn btn-delete" onClick={(e) => setSearchText("")}><span className="hide">입력 창 닫기</span></button>
                                    }

                                </div>
                                <button type="button" className="btn-search" data-testid="조회" onClick={(e) => onClickGoSearch(e)}><span>조회</span></button>
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
                                    <col style={{ "width": "90%" }} />
                                    <col style={{ "width": "10%" }} />
                                </colgroup>
                                <tbody>
                                    {(companyZoneList) && companyZoneList.map((czones, idx) => (
                                        <tr key={`tr_${idx.toString()}`}>
                                            <td>
                                                <ul>
                                                    <li>
                                                        <p className="placename">
                                                            {/*<span className="highlight">LS</span> 일렉트릭*/}
                                                            {czones.companyName}
                                                        </p>
                                                        <p className="location">{czones.zoneName} 사업장</p>
                                                    </li>
                                                    <li className="address">{czones.zoneAddress}</li>
                                                </ul>
                                            </td>
                                            <td>
                                                <button type="button" className="btn-add center js-open" data-pop="pop-workplace">
                                                    <span className="hide">사업장 추가</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
    const page = props.page;
    const searchText = props.searchText;
    const setSearchText = props.setSearchText;
    const onClickGoSearch = props.onClickGoSearch;
    const onClickZoneInsert = props.onClickZoneInsert;
    return (
        <>
            {/**mobile */}
            {/*<!-- 모바일 오른쪽 영역 area-right 팝업, 767이하에서는 팝업으로 노출 / 사업장 정보 페이지에서는 page-info 클래스 추가 -->
   <div id="pop-area-right" className="popup-layer js-layer layer-out hidden page-detail page-workplace">
     <div className="popup__head">
       <h1>사업장 추가</h1>
       <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
     </div>*/}
            <div className="popup__body">
                {/*<!--area__right, 오른쪽 영역-->*/}
                <div className="area__right" id="pop-area-right">
                    {/*<!--사업장 추가내 검색,신규등록 탭-->*/}
                    <ul className="tab__small">
                        {/*<!-- 선택된 탭 on -->*/}
                        <li className="on"><a href="#" className="icon-search">검색</a></li>
                        <li><a className="icon-pen" onClick={(e) => onClickZoneInsert(e)}>신규등록</a></li>
                    </ul>

                    {/*<!--area__right_content, 오른쪽 컨텐츠 영역-->*/}
                    <div className="area__right_content">
                        {/*<!--검색영역-->*/}
                        <div className="searcharea">
                            <div className="searchinput">
                                <span className="hide">검색</span>
                                <div className="input__direct">
                                    <input type="text" placeholder="검색어를 입력하세요" className="w274" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                                    {(searchText.length > 0) &&
                                        <button type="button" className="btn btn-delete" onClick={(e) => setSearchText("")}><span className="hide">입력 창 닫기</span></button>
                                    }
                                </div>
                                <button type="button" className="btn-search" onClick={(e) => onClickGoSearch(e)}><span>조회</span></button>
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
                                    <col style={{ "width": "90%" }} />
                                    <col style={{ "width": "10%" }} />
                                </colgroup>
                                <tbody>
                                    {(companyZoneList) && companyZoneList.map((czones, idx) => (
                                        <tr key={`tr_m_${idx.toString()}`}>
                                            <td>
                                                <ul>
                                                    <li>
                                                        <p className="placename">
                                                            {/*<span className="highlight">LS</span> 일렉트릭*/}
                                                            {czones.companyName}
                                                        </p>
                                                        <p className="location">{czones.zoneName} 사업장</p>
                                                    </li>
                                                    <li className="address">{czones.zoneAddress}</li>
                                                </ul>
                                            </td>
                                            <td>
                                                <button type="button" className="btn-add center" data-pop="pop-workplace"><span className="hide">사업장 추가</span></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
                </div>
            </div>
            {/*</div>
   <!--//area__right, 오른쪽 영역-->*/}
        </>
    )
}