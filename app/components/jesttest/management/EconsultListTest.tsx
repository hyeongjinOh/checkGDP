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
import axios from 'axios';

import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
import { loadingBoxState } from "../../../recoil/menuState";
import { langState } from '../../../recoil/langState';
// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as CUTIL from "../../../utils/commUtils"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"

//component
import EhpPagination from "../../common/pagination/EhpPagination";
import { useTrans } from "../../../utils/langs/useTrans";

function EconsultList(props) {
    //transe, navigate
    const navigate = useNavigate();
    const t = useTrans();
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
    //props
    const isMobile = props.isMobile;
    const adminType = props.adminType;
    const setParentAdminType = props.setAdminType;
    //const selTree = props.selTree;
    const setParentSelTree = props.setSelTree;
    const workMode = props.workMode;
    const setParentWorkMode = props.setWorkMode;
    const setParentPopWin = props.setPopWin;
    const setParentNodata = props.handleNodata;

    //
    //
    const [consultList, setConsultList] = useState([]);
    const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0, "psize": 10, "listReload": false };
    const [pageInfo, setPageInfo] = useState(defaultPageInfo);
    function handleCurPage(page) {
        setPageInfo({ ...pageInfo, number: page });
    }
    // date List
    const consultTypeList = [
        { "id": 0, "ctDisp": "전체", "ctVal": "" },
        { "id": 2, "ctDisp": "e-Health Portal 문의", "ctVal": "CONSULT" },
        { "id": 3, "ctDisp": "기타 문의", "ctVal": "ETC" },
    ];
    const [consultType, setConsultType] = useState(consultTypeList[0]);
    //
    let appPath = "";
    //appPath = 'page=' + pageInfo.number + '&size=' + pageInfo.size;
    /////////////////
    const searchFieldList = [
        { "id": 0, "sfDisp": "제목", "sfVal": "subject" },
        { "id": 1, "sfDisp": "문의내용", "sfVal": "content" },
        { "id": 2, "sfDisp": "답변", "sfVal": "reply" },
    ];
    const [searchField, setSearchField] = useState(searchFieldList[0]);
    const [searchText, setSearchText] = useState("");
    const [searchData, setSearchData] = useState({
        "consultType": null,
        "searchField": null,
        "searchText": "",
    });
    const [fieldList, setFieldList] = useState([
        { "id": 0, "fdDisp": "문의 유형", "fdVal": "consultType", "sort": "asc", "click": false },
        { "id": 1, "fdDisp": "제목", "fdVal": "subject", "sort": null, "click": false },
        { "id": 2, "fdDisp": "이름", "fdVal": "-", "sort": null, "click": false },
        { "id": 3, "fdDisp": "E-mail(ID)", "fdVal": "-", "sort": null, "click": false },
        { "id": 4, "fdDisp": "연락처", "fdVal": "-", "sort": null, "click": false },
        { "id": 5, "fdDisp": "문의일자", "fdVal": "requestedDate", "sort": "asc", "click": false },
        { "id": 6, "fdDisp": "답변여부", "fdVal": "replyYn", "sort": "sort", "click": false },
        { "id": 7, "fdDisp": "답변일자", "fdVal": "responseDate", "sort": "asc", "click": false },
    ]);

    if (searchData.consultType) {
        if (searchData.consultType.ctVal.length > 0) {
            appPath = appPath + `&consultType=${searchData.consultType.ctVal}`;
            //appPath = appPath + `&CONSULT=${searchData.consultType.ctVal}`;
        }
    }
    //text검색
    if (searchData.searchField) {
        if ((searchData.searchField.sfVal.length > 0) && (searchData.searchText.length > 0)) {
            appPath = appPath + `&stringSearch=${searchData.searchField.sfVal}&searchLike=${searchData.searchText}`;
        }
    }
    //필드 정렬
    fieldList.filter(fd => fd.click && fd.sort).map((fd) => {
        appPath = appPath + `&sort=${fd.fdVal},${fd.sort}`
    })

    clog("IN EHC LIST : APP PATH : " + appPath + " : " + JSON.stringify(pageInfo));
    //clog("IN EHC LIST : SEARCH TEXT : " + searchText);
    const [listReload, setListReload] = useState(false);
    const [errorList, setErrorList] = useState([]);
    /* page 정보 초기화
    useEffect(()=>{
      handleCurPage(0);
    }, [appPath, listReload]);//
    */
    const { data: retData, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/board/consult?page=${pageInfo.number}&size=${pageInfo.size}&${appPath}`,
        //appPath: `/api/v2/board/consult?${appPath}`,
        appQuery: {
            //"serviceStatus":serviceStatus,
        },
        userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        watch: pageInfo.number + pageInfo.size + appPath + listReload
        //watch: appPath+listReload
    });

    useEffect(() => {
        setRecoilIsLoadingBox(true);
        if (retData) {
            setRecoilIsLoadingBox(false);
            const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
            if (ERR_URL.length > 0) {
                navigate(ERR_URL);
            }
            //setRecoilIsLoadingBox(false);
            if (retData.codeNum == CONST.API_200) {
                clog("IN WF EHC COUNT : RES : " + JSON.stringify(retData.data.page));
                setParentNodata(retData.data.page);
                setPageInfo({ ...retData.data.page, psize: (isMobile) ? CONST.NUM_MLISTCNT : CONST.NUM_WLISTCNT, "listReload": false },); //5, 10
                setConsultList(retData.body);
                setListReload(false);
            }
        }
    }, [retData])
    //////////////////

    // option 선택 시  값 변경 액션
    function selectOptionConsultType(optionElement) { // 확장 가능
        const selectBox = optionElement.closest(".select");
        const selectedElement = selectBox.querySelector(".selected-value ");
        selectedElement.textContent = optionElement.textContent;
        var optionData = optionElement.getAttribute("data-value");
        selectedElement.setAttribute("data-value", optionData);
        setConsultType(JSON.parse(optionData));
        // init
    }
    // option 선택 시  값 변경 액션
    // option 선택 시  값 변경 액션
    function selectOptionSearchField(optionElement) { // 확장 가능
        const selectBox = optionElement.closest(".select");
        const selectedElement = selectBox.querySelector(".selected-value ");
        selectedElement.textContent = optionElement.textContent;
        var optionData = optionElement.getAttribute("data-value");
        selectedElement.setAttribute("data-value", optionData);
        //
        var sf = JSON.parse(optionData);
        if (sf.sfVal.length <= 0) setSearchText("");
        setSearchField(JSON.parse(optionData));
        //
    }

    function onClickSortField(fieldVal) {
        handleCurPage(0);
        //setConsultList([]);
        setFieldList(
            fieldList.map(fd =>
                (fd.fdVal === fieldVal)
                    ? { ...fd, "sort": (fd.sort === "asc") ? "desc" : "asc", "click": true }
                    : { ...fd, "sort": "asc", "click": false }) // 단일 필드 정렬만....
        );
        //handleCurPage(0);
    }

    function onClickSearch(e) {
        goSearch(e);
    }

    function goSearch(e) {
        clog("goSearch : " + JSON.stringify(searchField));
        handleCurPage(0);
        setSearchData({
            "consultType": consultType,
            "searchField": searchField,
            "searchText": searchText,
        });
    }


    function onClickAnswerOk(e, consult) {
        e.stopPropagation();
        //e.preventDefault();

        var popupVal = e.target.getAttribute("data-pop");
        if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-answer-ok");

        setParentPopWin("pop-answer-ok",
            <MobileEmailConsultAnswerOk
                htmlHeader={<h1>답변하기</h1>}
                consultInfo={consult}
            />
        );
        CUTIL.jsopen_Popup(e);
    }

    function onClickAnswer(e, consult) {
        e.stopPropagation();
        var popupVal = e.target.getAttribute("data-pop");
        if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-answer");

        setParentPopWin("pop-answer",
            <MobileEmailConsultAnswer
                htmlHeader={<h1>답변하기</h1>}
                consultInfo={consult}
                listReload={listReload}
                setListReload={setListReload}
            />
        );
        CUTIL.jsopen_Popup(e);
    }

    return (
        <>
            {/*<!--오른쪽 영역-->*/}
            <div className="area__right w100p">
                <h2 className="mb-0 ml-8 font-20">이메일 상담</h2>
                <div className="search pt-28 pb-26">
                    <ul className="form__input">
                        <li>
                            <label htmlFor="f1">문의 유형</label>
                            <div className="input__area">
                                <div className="select w186" onClick={(e) => CUTIL.onClickSelect(e, selectOptionConsultType)}>
                                    <div className="selected">
                                        <div className="selected-value">{consultTypeList[0].ctDisp}</div>
                                        <div className="arrow"></div>
                                    </div>
                                    <ul>
                                        {consultTypeList.map((ctype, idx) => (
                                            <li key={`li_${idx.toString()}`}
                                                className="option" data-value={JSON.stringify(ctype)}>{ctype.ctDisp}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="tbl__top mb-16 mt-36">
                    <div className="right">
                        <div className="searcharea">
                            <div className="searchinput">
                                <span>검색</span>
                                <div className="select" onClick={(e) => CUTIL.onClickSelect(e, selectOptionSearchField)}>
                                    <div className="selected">
                                        <div className="selected-value">{searchFieldList[0].sfDisp}</div>
                                        <div className="arrow"></div>
                                    </div>
                                    <ul>
                                        {searchFieldList.map((slist, idx) =>
                                            <li key={`li_${idx.toString()}`} className="option" data-value={JSON.stringify(slist)}>{slist.sfDisp}</li>
                                        )}
                                    </ul>
                                </div>
                                <div className="input__direct">
                                    <input type="text" placeholder="검색어를 입력하세요"
                                        defaultValue={searchText}
                                    />
                                    <button type="button"
                                        className="btn btn-delete"
                                        data-testid="econsultInput"
                                    >
                                        <span className="hide">입력 창 닫기</span>
                                    </button>
                                </div>
                            </div>
                            <button type="button"
                                data-testid="econsultSearch"
                                className="btn-search"
                                onClick={(e) => onClickSearch(e)}
                            ><span>조회</span></button>
                        </div>
                    </div>
                </div>
                {/*<!--테이블-->*/}
                <p className="nodata__txt">
                    {t("MESSAGE.데이터를찾을수없습니다")}
                </p>
                <div className="tbl-list checksheet-list">
                    <table summary="문의 유형,제목,이름,E-mail(ID),연락처,문의일자,답변여부,답변일자 항목으로 구성된 이메일 상담리스트 입니다.">
                        <caption>
                            이메일 상담리스트
                        </caption>
                        <colgroup>
                            <col style={{ "width": "12%" }} />
                            <col style={{ "width": "32%" }} />
                            <col style={{ "width": "7%" }} />
                            <col style={{ "width": "17%" }} />
                            <col style={{ "width": "8%" }} />
                            <col style={{ "width": "8%" }} />
                            <col style={{ "width": "7%" }} />
                            <col style={{ "width": "8%" }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th scope="col"
                                    className={`${fieldList.filter(fd => fd.fdVal === "consultType").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left`}
                                    onClick={(e) => onClickSortField("consultType")}
                                >
                                    <span>문의 유형</span>
                                </th>
                                <th scope="col" className="txt-left"><span>제목</span></th>
                                <th scope="col" className="txt-left"><span>이름</span></th>
                                <th scope="col" className="txt-left"><span>E-mail(ID)</span></th>
                                <th scope="col" className="txt-left"><span>연락처</span></th>
                                <th scope="col"
                                    className={`${fieldList.filter(fd => fd.fdVal === "requestedDate").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left`}
                                    onClick={(e) => onClickSortField("requestedDate")}
                                >
                                    <span>문의일자</span>
                                </th>
                                <th scope="col"
                                    className={`${fieldList.filter(fd => fd.fdVal === "replyYn").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left`}
                                    onClick={(e) => onClickSortField("replyYn")}
                                >
                                    <span>답변여부</span>
                                </th>
                                <th scope="col"
                                    className={`${fieldList.filter(fd => fd.fdVal === "responseDate").map(fd => (fd.sort) ? `sort ${fd.sort}` : "")} txt-left`}
                                    onClick={(e) => onClickSortField("responseDate")}
                                >
                                    <span>답변일자</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {consultList.map((consult, idx) => (
                                <tr key={`tr_${idx.toString()}`}>
                                    <td className="txt-left">{consult.consultType}</td>
                                    <td className="txt-left">
                                        <p className="ellipsis">{consult.subject}</p>
                                    </td>
                                    <td className="txt-left">{consult.user.name}</td>
                                    <td className="txt-left"><p className="ellipsis">{consult.user.userId}</p></td>
                                    <td className="txt-left">{consult.user.phoneNumber}</td>
                                    <td className="txt-left">{CUTIL.utc2formedstr(consult.requestedDate, "yyyy-MM-DD")}</td>
                                    <td className="txt-left">
                                        {(consult.replyYn)
                                            ? <button type="button" className="bg-gray js-open" data-pop="pop-answer-ok" onClick={(e) => onClickAnswerOk(e, consult)}>
                                                <span>답변 완료</span>
                                            </button>
                                            : <button type="button" className="bg-blue js-open" data-pop="pop-answer" onClick={(e) => onClickAnswer(e, consult)}>
                                                <span>답변하기</span>
                                            </button>
                                        }
                                    </td>
                                    <td className="txt-left">{CUTIL.utc2formedstr(consult.responseDate, "yyyy-MM-DD")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="popup__body">
                    <ul className="form__input">
                        <li>
                            <p className="tit">유형</p>
                            <div className="input__area">
                                <input type="text" value={"기타 문의"} disabled />
                            </div>
                        </li>
                        <li className="mt-8">
                            <p className="tit">제목</p>
                            <div className="input__area">
                                <input type="text" value={"안녕하세요 테스트입니다."} disabled />
                            </div>
                        </li>
                        <li className="mt-8">
                            <p className="tit">이름</p>
                            <div className="input__area">
                                <input type="text" value={"test"} disabled />
                            </div>
                        </li>
                        <li className="mt-8">
                            <p className="tit">Email</p>
                            <div className="input__area">
                                <input type="text" defaultValue={"test@test.com"} disabled />
                            </div>
                        </li>
                    </ul>
                    <ul className="form__input">
                        <li className="column">
                            <div className="inline left-right w100p">
                                <p className="tit">문의 내용</p>
                                <p className="font-14">2022-11-17</p>
                            </div>
                            <div className="input__area">
                                <textarea className="h128 line-h22" defaultValue={"안녕하세요 내용 테스트입니다."} readOnly />
                            </div>
                        </li>
                        <li className="sub-input mt-8">
                            <p className="tit w60 mt-3">첨부파일</p>
                            <div className="input__area">
                                <ul className="filelist w100p m-0">
                                    <li>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                    <ul className="form__input mb-0">
                        <li className="column">
                            <div className="inline left-right w100p">
                                <p className="tit">답변 작성</p>
                                <p className="font-14">2022-11-17</p>
                            </div>
                            <div className="input__area">
                                <textarea className="h128 line-h22" defaultValue={"안녕하세요 답변 테스트입니다."} readOnly />
                            </div>
                        </li>
                        <li className="sub-input mt-8">
                            <p className="tit w60 mt-10">첨부파일</p>
                            <div className="input__area">
                                {/*<div className="filebox">
               <input className="upload-name" value="" placeholder="파일을 첨부하세요" />
               <label htmlFor="file"><span className="hide">파일찾기</span></label>
               <input type="file" id="file" />
               </div>*/}
                                <ul className="filelist w100p mt-10">
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="popup__footer">
                    <button type="button"><span>확인</span></button>
                </div>


            </div>
            {/*<!--//탭별  내용 영역-->*/}
        </>
    )
};
export default EconsultList;

function MobileEmailConsultAnswerOk(props) {
    //trans
    const t = useTrans();
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    //props
    const consultInfo = props.consultInfo;
    clog("MobileEmailConsultAnswerOk : " + JSON.stringify(consultInfo));
    ///
    const [consultDetail, setConsultDetail] = useState(null);
    const { data: retData, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/board/consult/${consultInfo.consultId}`,
        appQuery: {
            //"serviceStatus":serviceStatus,
        },
        userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        watch: consultInfo.consultId
    });

    useEffect(() => {
        setRecoilIsLoadingBox(true);
        if (retData) {
            setRecoilIsLoadingBox(false);
            /*
            const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
            if (ERR_URL.length > 0) {
              navigate(ERR_URL);
            }
            */
            clog("IN WF EHC COUNT : RES : " + JSON.stringify(retData.body));
            if (retData.codeNum == CONST.API_200) {
                //setParentNodata(retData.data.page);
                setConsultDetail(retData.body);
                //setPageInfo({ ...retData.data.page, psize: (isMobile) ? CONST.NUM_MLISTCNT : CONST.NUM_WLISTCNT, "listReload":false},); //5, 10
            }
        }
    }, [retData])
    //////////////////
    function onClickFileDownload(e, file) {
        HTTPUTIL.fileDownload(decodeURI(file.name), file.url);
    }

    function onClickClose(e) {
        CUTIL.jsclose_Popup("pop-answer-ok");
    }
    return (
        <>
            {(consultDetail) && <>
                <div className="popup__body">
                    <ul className="form__input">
                        <li>
                            <p className="tit">유형</p>
                            <div className="input__area">
                                <input type="text" value={consultDetail.consultType} disabled />
                            </div>
                        </li>
                        <li className="mt-8">
                            <p className="tit">제목</p>
                            <div className="input__area">
                                <input type="text" value={consultDetail.subject} disabled />
                            </div>
                        </li>
                        <li className="mt-8">
                            <p className="tit">이름</p>
                            <div className="input__area">
                                <input type="text" value={consultDetail.userName} disabled />
                            </div>
                        </li>
                        <li className="mt-8">
                            <p className="tit">Email</p>
                            <div className="input__area">
                                <input type="text" value={consultDetail.email} disabled />
                            </div>
                        </li>
                    </ul>
                    <ul className="form__input">
                        <li className="column">
                            <div className="inline left-right w100p">
                                <p className="tit">문의 내용</p>
                                <p className="font-14">{CUTIL.utc2formedstr(consultDetail.requestedDate, "yyyy-MM-DD")}</p>
                            </div>
                            <div className="input__area">
                                <textarea className="h128 line-h22" value={consultDetail.content} readOnly />
                            </div>
                        </li>
                        <li className="sub-input mt-8">
                            <p className="tit w60 mt-3">첨부파일</p>
                            <div className="input__area">
                                <ul className="filelist w100p m-0">
                                    {consultDetail.files.map((file, idx) => (
                                        <li key={`li_${idx.toString()}`} onClick={(e) => onClickFileDownload(e, file)}>
                                            <span>{file.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </li>
                    </ul>
                    <ul className="form__input mb-0">
                        <li className="column">
                            <div className="inline left-right w100p">
                                <p className="tit">답변 작성</p>
                                <p className="font-14">{CUTIL.utc2formedstr(consultDetail.responseDate, "yyyy-MM-DD")}</p>
                            </div>
                            <div className="input__area">
                                <textarea className="h128 line-h22" value={consultDetail.reply} readOnly />
                            </div>
                        </li>
                        <li className="sub-input mt-8">
                            <p className="tit w60 mt-10">첨부파일</p>
                            <div className="input__area">
                                {/*<div className="filebox">
               <input className="upload-name" value="" placeholder="파일을 첨부하세요" />
               <label htmlFor="file"><span className="hide">파일찾기</span></label>
               <input type="file" id="file" />
               </div>*/}
                                <ul className="filelist w100p mt-10">
                                    {consultDetail.replyFiles.map((file, idx) => (
                                        <li key={`li_${idx.toString()}`} onClick={(e) => onClickFileDownload(e, file)}>
                                            <span>{file.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="popup__footer">
                    <button type="button" onClick={(e) => onClickClose(e)}><span>확인</span></button>
                </div>
            </>
            }
        </>
    )
}



function MobileEmailConsultAnswer(props) {
    //trans, navigate, ref
    const t = useTrans();
    const fileRef: any = useRef();
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    //props
    const consultInfo = props.consultInfo;
    const listReload = props.listReload;
    const setParentListReload = props.setListReload;
    clog("MobileEmailConsultAnswer : " + JSON.stringify(consultInfo));
    ///
    const [errorList, setErrorList] = useState([]);
    const [consultDetail, setConsultDetail] = useState(null);
    const { data: retData, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/board/consult/${consultInfo.consultId}`,
        appQuery: {
            //"serviceStatus":serviceStatus,
        },
        userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        watch: consultInfo.consultId
    });

    useEffect(() => {
        setRecoilIsLoadingBox(true);
        if (retData) {
            setRecoilIsLoadingBox(false);
            /*
            const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
            if (ERR_URL.length > 0) {
              navigate(ERR_URL);
            }
            */
            //clog("IN WF EHC COUNT : RES : " + JSON.stringify(retData.body));
            if (retData.codeNum == CONST.API_200) {
                //setParentNodata(retData.data.page);
                setConsultDetail(retData.body);
                //setPageInfo({ ...retData.data.page, psize: (isMobile) ? CONST.NUM_MLISTCNT : CONST.NUM_WLISTCNT, "listReload":false},); //5, 10
            }
        }
    }, [retData])
    //////////////////
    function onClickFileDownload(e, file) {
        HTTPUTIL.fileDownload(decodeURI(file.name), file.url);
    }

    function onClickClose(e) {
        //setParentListReload(true);
        CUTIL.jsclose_Popup("pop-answer");
        setReply("");
        setReplyFiles([]);

    }
    const [reply, setReply] = useState("");
    const [replyFiles, setReplyFiles] = useState([]);
    useEffect(() => {
        //    setReply("");
        //    setReplyFiles([]);
    }, [listReload]);



    function handleFileUpload(e) {
        fileRef.current.click();
    }
    function onClickDelAddedFile(e, dfile) {
        setReplyFiles( //file.url is unique??
            replyFiles.filter((file) => (file.imageId !== dfile.imageId) && (file.name !== dfile.name))
        )
    }

    function saveFileImage(e) {
        clog("save attach file : " + JSON.stringify(e.target.files.length));
        const files = e.target.files;
        var formData = new FormData();
        formData.append("files", files[0]);
        var fileVal = {
            imageId: "INS_" + replyFiles.length,
            name: files[0].name,
            url: URL.createObjectURL(files[0]),
            type: "INS",
            fileForm: formData,
            srcFile: files[0],
        }
        setReplyFiles([...replyFiles, fileVal]);
    };

    async function onclickDoSaveReply(e) {
        var isOk = confirm(`답변내용을 전송하시겠습니까?`);
        if (!isOk) return;

        setRecoilIsLoadingBox(true);
        let mpartData = new FormData();
        const replyData = {
            "userIdPk": consultDetail.userIdPk,
            "consultId": consultDetail.consultId,
            "reply": reply,
        };
        const blob = new Blob([JSON.stringify(replyData)], { type: "application/json" })
        mpartData.append("replyDtoIn", blob);
        // 또는  formData.append("data", JSON.stringify(value)); 
        // JSON 형식으로 파싱.(백엔드의 요청에 따라 전송방식이 달라진다.)
        replyFiles.map((file) => {
            mpartData.append("files", file.srcFile);
        });
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "POSTF",
            "appPath": "/api/v2/board/consult/reply",
            appQuery: mpartData,
            userToken: userInfo.loginInfo.token,
        });

        if (data) {
            setRecoilIsLoadingBox(false);
            clog("IN E CONSULT: onclickDoSaveReply : " + JSON.stringify(data));
            if (data.codeNum == CONST.API_200) {
                CUTIL.jsclose_Popup("pop-answer");
                setParentListReload(true);
            } else { // api if
                // need error handle
                if (data.body.errorList) setErrorList(data.body.errorList);
            }
        }
        //return data;
    }


    return (
        <>
            {(consultDetail) && <>
                <div className="popup__body">
                    <ul className="form__input">
                        <li>
                            <p className="tit">유형</p>
                            <div className="input__area">
                                <input type="text" value={consultDetail.consultType} disabled />
                            </div>
                        </li>
                        <li className="mt-8">
                            <p className="tit">제목</p>
                            <div className="input__area">
                                <input type="text" value={consultDetail.subject} disabled />
                            </div>
                        </li>
                        <li className="mt-8">
                            <p className="tit">이름</p>
                            <div className="input__area">
                                <input type="text" value={consultDetail.userName} disabled />
                            </div>
                        </li>
                        <li className="mt-8">
                            <p className="tit">Email</p>
                            <div className="input__area">
                                <input type="text" value={consultDetail.email} disabled />
                            </div>
                        </li>
                    </ul>
                    <ul className="form__input">
                        <li className="column">
                            <div className="inline left-right w100p">
                                <p className="tit">문의 내용</p>
                                <p className="font-14">{CUTIL.utc2formedstr(consultDetail.requestedDate, "yyyy-MM-DD")}</p>
                            </div>
                            <div className="input__area">
                                <textarea className="h128 line-h22" value={consultDetail.content} readOnly />
                            </div>
                        </li>
                        <li className="sub-input mt-8">
                            <p className="tit w60 mt-3">첨부파일</p>
                            <div className="input__area">
                                <ul className="filelist w100p m-0">
                                    {consultDetail.files.map((file, idx) => (
                                        <li key={`li_${idx.toString()}`} onClick={(e) => onClickFileDownload(e, file)}>
                                            <span>{file.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </li>
                    </ul>
                    <ul className="form__input mb-0">
                        <li className="column">
                            <p className="tit">답변 작성</p>
                            <p className="txtnum inline right">{`${reply.length} / 1000`}</p>
                            <div className="input__area mt-0">
                                <textarea className={`h128 line-h22 ${(errorList.filter(err => (err.field === "memo")).length > 0) ? "input-error" : ""}`}
                                    value={reply}
                                    onKeyPress={(e) => CUTIL.beforeHandleComment(e, 1000)}
                                    onKeyUp={(e) => CUTIL.afterHandleComment(e, 1000, setReply)}
                                    onChange={(e) => setReply(e.target.value)}
                                />
                                <p className="input-errortxt">{errorList.filter(err => (err.field === "reply")).map((err) => err.msg)}</p>
                            </div>
                        </li>
                        <li className="sub-input mt-8">
                            <p className="tit w60 mt-10">첨부파일</p>
                            <div className="input__area">
                                <div className="filebox">
                                    <input className="upload-name" value="" placeholder="파일을 첨부하세요" readOnly />
                                    <label onClick={(e) => handleFileUpload(e)}><span className="hide">파일찾기</span></label>
                                    <input type="file" id="file"
                                        ref={fileRef}
                                        accept="*/*"
                                        multiple style={{ display: "none" }}
                                        onChange={(e) => saveFileImage(e)} />
                                </div>
                                <ul className="filelist w100p mt-10">
                                    {replyFiles.map((file, idx) => (
                                        <li key={`li_${idx.toString()}`}>
                                            <span>{file.name}</span>
                                            <button type="button" className="btn btn-delete" onClick={(e) => onClickDelAddedFile(e, file)}>
                                                <span className="hide">삭제</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="popup__footer">
                    <button type="button" className="bg-gray js-close" onClick={(e) => onClickClose(e)}><span>취소</span></button>
                    <button type="button" className="js-open" data-pop="pop-send" onClick={(e) => onclickDoSaveReply(e)}><span>전송</span></button>
                </div>
            </>
            }
        </>
    )
}
