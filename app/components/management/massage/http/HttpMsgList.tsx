/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-09-05
 * @brief EHP 메시지 관리 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";
import { loadingBoxState } from "../../../../recoil/menuState";
import { langState } from '../../../../recoil/langState';
// utils
import clog from "../../../../utils/logUtils";
import * as CONST from "../../../../utils/Const"
import * as CUTIL from "../../../../utils/commUtils"
import * as HTTPUTIL from "../../../../utils/api/HttpUtil"

//component
import EhpPagination from "../../../common/pagination/EhpPagination";
/**
 * @brief EHP 메시지 관리 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
function HttpMsgList(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
  //props
  const isMobile = props.isMobile;
  const adminType = props.adminType;
  const setParentAdminType = props.setAdminType;
  const selTree = props.selTree;
  const setParentSelTree = props.setSelTree;
  const workMode = props.workMode;
  const setParentWorkMode = props.setWorkMode;
  const setParentPopWin = props.setPopWin;

  //화면 이동
  const navigate = useNavigate();
  //
  const [messageList, setMessageList] = useState([]);
  const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0, "psize": 10 };
  const [pageInfo, setPageInfo] = useState(defaultPageInfo);
  function handleCurPage(page) {
    setPageInfo({ ...pageInfo, number: page });
  }
  const [codeParam, setCodeParam] = useState("");
  let appPath = "";
  appPath = 'page=' + pageInfo.number + '&size=' + pageInfo.size;
  if (codeParam.length > 0) {
    appPath = appPath + "&menuCode=" + codeParam
  }

  const [listReload, setListReload] = useState(false);
  const [errorList, setErrorList] = useState([]);
  //{menuCode, menuName, errList : {}}
  //[{"field":"menuName","msg":"필수 항목입니다."}]

  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/message/httpmessages?${appPath}`,
    appQuery: {},
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: selTree + appPath + listReload
    //watch: selTree.company.companyId+selTree.reload
  });

  useEffect(() => {
    setRecoilIsLoadingBox(true);
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
    if (ERR_URL.length > 0) {
      setRecoilIsLoadingBox(false);
      navigate(ERR_URL);
    }
    if (retData) {
      setRecoilIsLoadingBox(false);
      //clog("IN CHECK MESSAGE LIST : RES : " + JSON.stringify(retData));
      if (retData.codeNum == CONST.API_200) {
        setListReload(false); // list reload
        setMessageList(retData.body);
        setPageInfo({ ...retData.data.page, psize: (isMobile) ? CONST.NUM_MLISTCNT : CONST.NUM_WLISTCNT }); //5, 10
      }
    }
  }, [selTree, retData])
  //////////////////
  function handleListReload(val, page) {
    if (page > -1) handleCurPage([page]);
    setListReload(val);
  }
  useEffect(() => {
    setParentPopWin("pop-message-add",
      <PopupHttpMessageInsert
        htmlHeader={<h1>HTTP 메세지</h1>}
        listReload={listReload}
        setListReload={handleListReload} // list reload
      />
    );
  }, [listReload])

  function onClickInsertErrorMessage(e) {
    var popupVal = e.target.getAttribute("data-pop");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-message-add");
    popupVal = e.target.getAttribute("data-ds-height");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "796");

    setParentPopWin("pop-message-add",
      <PopupHttpMessageInsert
        htmlHeader={<h1>HTTP 메세지</h1>}
        listReload={listReload}
        setListReload={handleListReload} // list reload
      />
    );
    CUTIL.jsopen_Popup(e);
  }

  function onClickViewHttpMessage(e, message) {
    var popupVal = e.target.getAttribute("data-pop");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-message");
    popupVal = e.target.getAttribute("data-ds-height");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "773");

    setParentPopWin("pop-message",
      <PopupHttpMessageView
        htmlHeader={<h1>HTTP 메세지</h1>}
        httpMessage={message}
        listReload={listReload}
        setListReload={handleListReload} // list reload
        setPopWin={props.setPopWin}
      />
    );
    CUTIL.jsopen_Popup(e);
  }

  function onClickDeleteHttpMessage(e, message) {
    var popupVal = e.target.getAttribute("data-pop");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-delete");

    popupVal = e.target.getAttribute("data-ds-height");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "200");

    setParentPopWin("pop-delete",
      <PopupHttpMessageDelete
        htmlHeader={<h1>삭제</h1>}
        httpMessage={message}
        listReload={listReload}
        setListReload={handleListReload} // list reload
      />
    );
    CUTIL.jsopen_Popup(e);
  }


  return (
    <>
      {/*<!--오른쪽 영역-->*/}
      <div className="area__right_content workplace__info workplace__main info__input newtype">
        <div className="page-top">
          <h2>HTTP 메세지</h2>
        </div>
        <div className="tbl__top mb-16">
          <div className="right">
            <button type="button"
              className="bg-gray js-open"
              data-pop="pop-message-add"
              /* onClick={(e) => onClickInsertErrorMessage(e)} */
              disabled // 사용 시 제거 및 onClick 주석 해체
            >
              <span>추가</span>
            </button>
          </div>
        </div>
        {/*<!--테이블-->*/}
        <div className="tbl-list message-list">
          <table summary="에러코드,메세지,솔루션,HTTP 코드,언어,삭제 항목으로 구성된 HTTP 메세지 리스트 입니다.">
            <caption>
              HTTP 메세지 리스트
            </caption>
            <colgroup>
              <col style={{ "width": "12%" }} />
              <col style={{ "width": "" }} />
              <col style={{ "width": "" }} />
              <col style={{ "width": "9%" }} />
              <col style={{ "width": "190px" }} />
              <col style={{ "width": "6%" }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="txt-left">에러코드</th>
                <th scope="col" className="txt-left">메세지</th>
                <th scope="col" className="txt-left">솔루션</th>
                <th scope="col" className="txt-left">HTTP 코드</th>
                <th scope="col" className="txt-left">언어</th>
                <th scope="col">삭제</th>
              </tr>
            </thead>
            <tbody>
              {messageList.map((msg, idx) => (
                <tr key={`http_tr_${idx.toString()}`}>
                  <td className="txt-left js-open" data-pop="pop-message" onClick={(e) => onClickViewHttpMessage(e, msg)}>{msg.errorCode}</td>
                  <td className="txt-left js-open" data-pop="pop-message" onClick={(e) => onClickViewHttpMessage(e, msg)}>{msg.messageKorean}</td>
                  <td className="txt-left js-open" data-pop="pop-message" onClick={(e) => onClickViewHttpMessage(e, msg)}>{msg.solutionKorean}</td>
                  <td className="txt-left js-open" data-pop="pop-message" onClick={(e) => onClickViewHttpMessage(e, msg)}>{msg.httpCode}</td>
                  <td className="txt-left js-open" data-pop="pop-message" onClick={(e) => onClickViewHttpMessage(e, msg)}>
                    {/*<!--선택된 언어에 클래스 on-->*/}
                    <ul className="messagelang">
                      <li className={(!CUTIL.isnull(msg.messageKorean) && msg.messageKorean.length > 0) ? "on" : ""}>한국어</li>
                      <li className={(!CUTIL.isnull(msg.messageEnglish) && msg.messageEnglish.length > 0) ? "on" : ""}>English</li>
                      <li className={(!CUTIL.isnull(msg.messageChinese) && msg.messageChinese.length > 0) ? "on" : ""}>中文</li>
                    </ul>
                  </td>
                  <td>
                    <button type="button" className="btn btn-delete-gr js-open"
                      data-pop="pop-delete"
                      /* onClick={(e) => onClickDeleteHttpMessage(e, msg)} */
                      disabled // 사용 시 제거 및 onClick 주석 해체
                    >
                      <span className="hide">항목 삭제</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <EhpPagination
          componentName={"HTTPMESSAGELIST"}
          pageInfo={pageInfo}
          handleFunc={handleCurPage}
        />
      </div>
    </>
  )
};
export default HttpMsgList;

function PopupHttpMessageInsert(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //props  
  const listReload = props.listReload;
  const setParentListReload = props.setListReload;

  const defaultVal = {
    "errorCode": "",
    "httpCode": "",
    "messageKorean": "",
    "messageEnglish": "",
    "messageChinese": "",
    "solutionKorean": "",
    "solutionEnglish": "",
    "solutionChinese": "",
  }
  const [httpMessage, setHttpMessage] = useState(defaultVal);
  clog("IN POP INSERT : " + listReload);
  useEffect(() => {
    setHttpMessage(defaultVal);
  }, [listReload]);

  function callbackSetHttpMessageKor(val) {
    setHttpMessage({ ...httpMessage, messageKorean: val });
  }
  function callbackSetHttpSolutionKor(val) {
    setHttpMessage({ ...httpMessage, solutionKorean: val });
  }
  function callbackSetHttpMessageEng(val) {
    setHttpMessage({ ...httpMessage, messageEnglish: val });
  }
  function callbackSetHttpSolutionEng(val) {
    setHttpMessage({ ...httpMessage, solutionEnglish: val });
  }
  function callbackSetHttpMessageCha(val) {
    setHttpMessage({ ...httpMessage, messageChinese: val });
  }
  function callbackSetHttpSolutionCha(val) {
    setHttpMessage({ ...httpMessage, solutionChinese: val });
  }
  const [errorList, setErrorList] = useState([]);

  async function onClickDoSaveHttpMessage(e) {
    const errList = [];
    var doCnt = 0;
    var doneCnt = 0;
    var succCnt = 0;

    let data: any = null;
    setRecoilIsLoadingBox(true);
    doCnt++;
    data = await doSaveHttpMessage({
      "errorCode": httpMessage.errorCode,
      "httpCode": httpMessage.httpCode,
      "message": httpMessage.messageKorean,
      "solution": httpMessage.solutionKorean,
      "language": CONST.STR_APILANG_KOR
    });
    if (data) {
      doneCnt++;
      if (data.codeNum == CONST.API_200) {
        succCnt++;
        clog("IN HTTP MSG : KOR INSERT : " + JSON.stringify(data.body));
      } else { // api if korean
        // need error handle
        data.body.errorList.map((elist) => (
          errList.push({ "field": elist.field + CONST.STR_APILANG_KOR, "msg": elist.msg })
        ))
      }
      CUTIL.sleep(500);
      doCnt++;
      let edata = await doSaveHttpMessage({
        "errorCode": httpMessage.errorCode,
        "httpCode": httpMessage.httpCode,
        "message": httpMessage.messageEnglish,
        "solution": httpMessage.solutionEnglish,
        "language": CONST.STR_APILANG_ENG
      });
      if (edata) {
        doneCnt++;
        if (edata.codeNum == CONST.API_200) {
          succCnt++;
          clog("IN HTTP MSG : ENG INSERT : " + JSON.stringify(data.body));
        } else { //english
          edata.body.errorList.map((elist) => (
            errList.push({ "field": elist.field + CONST.STR_APILANG_ENG, "msg": elist.msg })
          ))
        }
        CUTIL.sleep(500);
        doCnt++;
        let cdata = await doSaveHttpMessage({
          "errorCode": httpMessage.errorCode,
          "httpCode": httpMessage.httpCode,
          "message": httpMessage.messageChinese,
          "solution": httpMessage.solutionChinese,
          "language": CONST.STR_APILANG_CHA
        });
        if (cdata) {
          doneCnt++;
          if (cdata.codeNum == CONST.API_200) {
            succCnt++;
            clog("IN HTTP MSG : CHA INSERT : " + JSON.stringify(data.body));
          } else { //chinese
            //errList.push({"field":});
            cdata.body.errorList.map((elist) => (
              errList.push({ "field": elist.field + CONST.STR_APILANG_CHA, "msg": elist.msg })
            ))
          }
        }
        if (doneCnt === 3) { // KOR/ENG/CHA
          setErrorList(errList);
          if (doCnt === succCnt) {
            setParentListReload(true, 0);
            CUTIL.jsclose_Popup("pop-message-add");
          } else {
          }
          doneCnt = 0;
          setRecoilIsLoadingBox(false);
        }
      }
    }
  }

  async function doSaveHttpMessage(cmsg) {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "POST",
      "appPath": `/api/v2/message/httpmessage`,
      appQuery:
      {
        "errorCode": cmsg.errorCode,
        "httpCode": cmsg.httpCode,
        "message": cmsg.message,
        "solution": cmsg.solution,
        "language": cmsg.language
      },

      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum !== CONST.API_200) {
        //alert(`ERROR : ${cmsg.language} : ` + JSON.stringify(data.body.errorList));
      }
    }

    return data;
  }

  function onClickCancel(e) {
    CUTIL.jsclose_Popup("pop-message-add");
    setParentListReload(true, 0);
  }

  clog("IN HTTP INSER ERR : " + JSON.stringify(errorList));
  return (
    <>
      <div className="popup__body">
        <ul className="form__input">
          <li>
            <p className="tit">에러코드</p>
            <div className="input__area">
              <input type="text"
                className={(errorList.filter(err => err.field.includes("errorCode")).length > 0) ? "input-error" : ""}
                value={httpMessage.errorCode}
                onChange={(e) => setHttpMessage({ ...httpMessage, errorCode: e.target.value })}
              />
              <p className="input-errortxt">{errorList.filter((err, idx) => err.field.includes("errorCode") && (idx === 0)).map((err) => err.msg)}</p>
            </div>
          </li>
        </ul>
        <ul className="form__input">
          <li>
            <p className="tit">메세지</p>
          </li>
          <li className="sub-input">
            <p className="tit">한국어</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "messageKorean")).length > 0) ? "input-error" : ""}
                value={httpMessage.messageKorean}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetHttpMessageKor)}
                onChange={(e) => setHttpMessage({ ...httpMessage, messageKorean: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageKorean")).map((err) => err.msg)}</p>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">영문 (English)</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "messageEnglish")).length > 0) ? "input-error" : ""}
                value={httpMessage.messageEnglish}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetHttpMessageEng)}
                onChange={(e) => setHttpMessage({ ...httpMessage, messageEnglish: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageEnglish")).map((err) => err.msg)}</p>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">중문 (中文)</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "messageChinese")).length > 0) ? "input-error" : ""}
                value={httpMessage.messageChinese}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetHttpMessageCha)}
                onChange={(e) => setHttpMessage({ ...httpMessage, messageChinese: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageChinese")).map((err) => err.msg)}</p>
            </div>
          </li>
        </ul>
        <ul className="form__input">
          <li>
            <p className="tit">솔루션</p>
          </li>
          <li className="sub-input">
            <p className="tit">한국어</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "solutionKorean")).length > 0) ? "input-error" : ""}
                value={httpMessage.solutionKorean}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetHttpSolutionKor)}
                onChange={(e) => setHttpMessage({ ...httpMessage, solutionKorean: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "solutionKorean")).map((err) => err.msg)}</p>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">영문 (English)</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "solutionEnglish")).length > 0) ? "input-error" : ""}
                value={httpMessage.solutionEnglish}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetHttpSolutionEng)}
                onChange={(e) => setHttpMessage({ ...httpMessage, solutionEnglish: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "solutionEnglish")).map((err) => err.msg)}</p>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">중문 (中文)</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "solutionChinese")).length > 0) ? "input-error" : ""}
                value={httpMessage.solutionChinese}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetHttpSolutionCha)}
                onChange={(e) => setHttpMessage({ ...httpMessage, solutionChinese: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "solutionChinese")).map((err) => err.msg)}</p>
            </div>
          </li>
        </ul>
        <ul className="form__input">
          <li>
            <p className="tit">HTTP코드</p>
            <div className="input__area">
              <input type="text"
                className={(errorList.filter(err => err.field.includes("httpCode")).length > 0) ? "input-error" : ""}
                value={httpMessage.httpCode}
                onChange={(e) => setHttpMessage({ ...httpMessage, httpCode: e.target.value })}
              />
              <p className="input-errortxt">{errorList.filter((err, idx) => err.field.includes("httpCode") && (idx === 0)).map((err) => err.msg)}</p>
            </div>
          </li>
        </ul>
      </div>
      <div className="popup__footer">
        <button type="button" className="bg-gray js-close"
          onClick={(e) => onClickCancel(e)}
        >
          <span>취소</span>
        </button>
        <button
          type="button"
          onClick={(e) => onClickDoSaveHttpMessage(e)}
        >
          <span>완료</span>
        </button>
      </div>
    </>
  )
}

function PopupHttpMessageView(props) {
  //props
  const setParentPopWin = props.setPopWin;
  //
  const [httpMessage, setHttpMessage] = useState(null);
  //const onClickUpdateCheckMessage = props.onClickUpdateCheckMessage;
  const listReload = props.listReload;
  const setParentListReload = props.setListReload;
  //
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    setHttpMessage(props.httpMessage);
    setUpdateCount(0);
  }, [props.httpMessage])

  function onClickUpdateHttpMessage(e, message) {
    var popupVal = e.target.getAttribute("data-pop");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-message-edit");
    popupVal = e.target.getAttribute("data-ds-height");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "773");

    CUTIL.jsclose_Popup("pop-message");

    setParentPopWin("pop-message-edit",
      <PopupHttpMessageUpdate
        htmlHeader={<h1>HTTP 메세지</h1>}
        httpMessage={message}
        listReload={listReload}
        setListReload={props.setListReload} // list reload
        updateCount={updateCount}
        setUpdateCount={setUpdateCount}
        setPopWin={props.setPopWin}
      />
    );
    CUTIL.jsopen_Popup(e);
  }

  function onClickCancel(e) {
    //setParentListReload(true);
    CUTIL.jsclose_Popup("pop-message");
    setParentPopWin("pop-message", null);
  }

  //clog("IN VIEW : INIT : " + JSON.stringify(httpMessage));
  return (
    <>
      {/*<!-- e-Health Checker 메세지 팝업 -->*/}
      {(httpMessage) && <div className="popup__body">
        <ul className="form__input">
          <li>
            <p className="tit">에러코드</p>
            <div className="input__area">
              <input type="text" value={httpMessage.errorCode} disabled />
            </div>
          </li>
        </ul>
        <ul className="form__input">
          <li>
            <p className="tit">메세지</p>
          </li>
          <li className="sub-input">
            <p className="tit">한국어</p>
            <div className="input__area">
              <textarea value={CUTIL.isnull(httpMessage.messageKorean) ? "" : httpMessage.messageKorean} readOnly></textarea>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">영문 (English)</p>
            <div className="input__area">
              <textarea value={CUTIL.isnull(httpMessage.messageEnglish) ? "" : httpMessage.messageEnglish} readOnly></textarea>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">중문 (中文)</p>
            <div className="input__area">
              <textarea value={CUTIL.isnull(httpMessage.messageChinese) ? "" : httpMessage.messageChinese} readOnly></textarea>
            </div>
          </li>
        </ul>
        <ul className="form__input">
          <li>
            <p className="tit">솔루션</p>
          </li>
          <li className="sub-input">
            <p className="tit">한국어</p>
            <div className="input__area">
              <textarea value={CUTIL.isnull(httpMessage.solutionKorean) ? "" : httpMessage.solutionKorean} readOnly></textarea>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">영문 (English)</p>
            <div className="input__area">
              <textarea value={CUTIL.isnull(httpMessage.solutionEnglish) ? "" : httpMessage.solutionEnglish} readOnly></textarea>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">중문 (中文)</p>
            <div className="input__area">
              <textarea value={CUTIL.isnull(httpMessage.solutionChinese) ? "" : httpMessage.solutionChinese} readOnly></textarea>
            </div>
          </li>
        </ul>
        <ul className="form__input">
          <li>
            <p className="tit">HTTP코드</p>
            <div className="input__area">
              <input type="text" value={httpMessage.httpCode} disabled />
            </div>
          </li>
        </ul>
      </div>}
      <div className="popup__footer">
        <button type="button"
          className="bg-gray js-open btn-close"
          data-pop="pop-message-edit"
          onClick={(e) => onClickUpdateHttpMessage(e, httpMessage)}
        >
          <span>수정</span>
        </button>
        <button type="button" className="" onClick={(e) => onClickCancel(e)}>
          <span>확인</span>
        </button>
      </div>
      {/*<!-- //e-Health Checker 메세지 팝업 -->*/}
    </>
  )
}


function PopupHttpMessageUpdate(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //props  
  const listReload = props.listReload;
  const setParentListReload = props.setListReload;
  //
  const updateCount = props.updateCount
  const setParentUpdateCount = props.setUpdateCount
  //
  const setParentPopWin = props.setPopWin;
  //
  const [httpMessage, setHttpMessage] = useState(null);
  const [errorList, setErrorList] = useState([]);
  //
  useEffect(() => {
    setHttpMessage(props.httpMessage);
  }, [updateCount, props.httpMessage])

  function callbackSetHttpMessageKor(val) {
    setHttpMessage({ ...httpMessage, messageKorean: val });
  }
  function callbackSetHttpMessageEng(val) {
    setHttpMessage({ ...httpMessage, messageEnglish: val });
  }
  function callbackSetHttpMessageCha(val) {
    setHttpMessage({ ...httpMessage, messageChinese: val });
  }
  function callbackSetHttpSolutionKor(val) {
    setHttpMessage({ ...httpMessage, solutionKorean: val });
  }
  function callbackSetHttpSolutionEng(val) {
    setHttpMessage({ ...httpMessage, solutionEnglish: val });
  }
  function callbackSetHttpSolutionCha(val) {
    setHttpMessage({ ...httpMessage, solutionChinese: val });
  }


  async function onClickDoUpdateHttpMessage(e) {
    const errList = [];
    var doCnt = 0;
    var doneCnt = 0;
    var succCnt = 0;

    let data: any = null;
    setRecoilIsLoadingBox(true);
    doCnt++;
    data = await doUpdateHttpMessage({
      "errorCode": httpMessage.errorCode,
      "httpCode": httpMessage.httpCode,
      "message": httpMessage.messageKorean,
      "solution": httpMessage.solutionKorean,
      "language": CONST.STR_APILANG_KOR
    });
    if (data) {
      doneCnt++;
      if (data.codeNum == CONST.API_200) {
        succCnt++;
        clog("IN HTTP MSG : KOR UPDATE : " + JSON.stringify(data.body));
      } else { // api if korean
        // need error handle
        //errList.push({ "err-field": CONST.STR_APILANG_KOR, "msg": data.body.errorList });
        clog("IN HTTP ERROR : KOR : " + JSON.stringify(data));
        data.body.errorList.map((elist) => (
          errList.push({ "field": elist.field + CONST.STR_APILANG_KOR, "msg": elist.msg })
        ))
      }
      CUTIL.sleep(500);
      doCnt++;
      let edata = await doUpdateHttpMessage({
        "errorCode": httpMessage.errorCode,
        "httpCode": httpMessage.httpCode,
        "message": httpMessage.messageEnglish,
        "solution": httpMessage.solutionEnglish,
        "language": CONST.STR_APILANG_ENG
      });
      if (edata) {
        doneCnt++;
        if (edata.codeNum == CONST.API_200) {
          succCnt++;
          clog("IN HTTP MSG : ENG UPDATE : " + JSON.stringify(data.body));
          //setParentHttpMessage()
        } else { //english
          //errList.push({ "err-field": CONST.STR_APILANG_ENG, "msg": data.body.errorList });
          clog("IN HTTP ERROR : ENG : " + JSON.stringify(edata));
          edata.body.errorList.map((elist) => (
            errList.push({ "field": elist.field + CONST.STR_APILANG_ENG, "msg": elist.msg })
          ))
        }
        CUTIL.sleep(500);
        doCnt++;
        let cdata = await doUpdateHttpMessage({
          "errorCode": httpMessage.errorCode,
          "httpCode": httpMessage.httpCode,
          "message": httpMessage.messageChinese,
          "solution": httpMessage.solutionChinese,
          "language": CONST.STR_APILANG_CHA
        });
        if (cdata) {
          doneCnt++;
          if (cdata.codeNum == CONST.API_200) {
            succCnt++;
            clog("IN HTTP MSG : CHA UPDATE : " + JSON.stringify(data.body));
          } else { //chinese
            cdata.body.errorList.map((elist) => (
              errList.push({ "field": elist.field + CONST.STR_APILANG_CHA, "msg": elist.msg })
            ))
          }
        }
        if (doneCnt === 3) { // KOR/ENG/CHA
          setErrorList(errList);
          setParentListReload(true, -1); // only list reload & page reset done
          ////
          setParentPopWin("pop-message",
            <PopupHttpMessageView
              htmlHeader={<h1>HTTP 메세지</h1>}
              httpMessage={httpMessage}
              listReload={listReload}
              setListReload={props.setListReload} // list reload
              setPopWin={props.setPopWin}
            />
          );
          if (doCnt === succCnt) {
            CUTIL.jsclose_Popup("pop-message-edit");
            var popupVal = e.target.getAttribute("data-pop");
            if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-message");
            CUTIL.jsopen_Popup(e);
          } else {
          }
          doneCnt = 0;
          setRecoilIsLoadingBox(false);
        }
      }
    }
  }

  async function doUpdateHttpMessage(cmsg) {
    clog("doUpdateHttpMessage : " + JSON.stringify(cmsg));
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": `/api/v2/message/httpmessage`,
      appQuery:
      {
        "errorCode": cmsg.errorCode,
        "httpCode": cmsg.httpCode,
        "message": cmsg.message,
        "solution": cmsg.solution,
        "language": cmsg.language
      },

      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum !== CONST.API_200) {
        //alert(`ERROR : ${cmsg.language} : ` + JSON.stringify(data.body.errorList));
      }
    }

    return data;
  }

  function onClickCancel(e) {
    var popupVal = e.target.getAttribute("data-pop");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-message");
    popupVal = e.target.getAttribute("data-ds-height");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "773");

    CUTIL.jsclose_Popup("pop-message-edit");
    setParentPopWin("pop-message-edit", null);

    CUTIL.jsopen_Popup(e);
    setErrorList([]);
    setParentUpdateCount(updateCount + 1);
  }

  clog("IN HTTPMSG : INIT : " + JSON.stringify(errorList));
  return (
    <>
      {/*<!-- e-Health Checker 메세지 팝업 -->*/}
      {(httpMessage) && <div className="popup__body">
        <ul className="form__input">
          <li>
            <p className="tit">에러코드</p>
            <div className="input__area">
              <input type="text"
                className={(errorList.filter(err => err.field.includes("errorCode")).length > 0) ? "input-error" : ""}
                value={httpMessage.errorCode}
                onChange={(e) => setHttpMessage({ ...httpMessage, errorCode: e.target.value })}
                disabled
              />
              <p className="input-errortxt">{errorList.filter((err, idx) => err.field.includes("errorCode") && (idx === 0)).map((err) => err.msg)}</p>
            </div>
          </li>
        </ul>
        <ul className="form__input">
          <li>
            <p className="tit">메세지</p>
          </li>
          <li className="sub-input">
            <p className="tit">한국어</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "messageKorean")).length > 0) ? "input-error" : ""}
                value={CUTIL.isnull(httpMessage.messageKorean) ? "" : httpMessage.messageKorean}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetHttpMessageKor)}
                onChange={(e) => setHttpMessage({ ...httpMessage, messageKorean: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageKorean")).map((err) => err.msg)}</p>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">영문 (English)</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "messageEnglish")).length > 0) ? "input-error" : ""}
                value={CUTIL.isnull(httpMessage.messageEnglish) ? "" : httpMessage.messageEnglish}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetHttpMessageEng)}
                onChange={(e) => setHttpMessage({ ...httpMessage, messageEnglish: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageEnglish")).map((err) => err.msg)}</p>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">중문 (中文)</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "messageChinese")).length > 0) ? "input-error" : ""}
                value={CUTIL.isnull(httpMessage.messageChinese) ? "" : httpMessage.messageChinese}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetHttpMessageCha)}
                onChange={(e) => setHttpMessage({ ...httpMessage, messageChinese: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageChinese")).map((err) => err.msg)}</p>
            </div>
          </li>
        </ul>
        <ul className="form__input">
          <li>
            <p className="tit">솔루션</p>
          </li>
          <li className="sub-input">
            <p className="tit">한국어</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "solutionKorean")).length > 0) ? "input-error" : ""}
                value={CUTIL.isnull(httpMessage.solutionKorean) ? "" : httpMessage.solutionKorean}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetHttpSolutionKor)}
                onChange={(e) => setHttpMessage({ ...httpMessage, solutionKorean: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "solutionKorean")).map((err) => err.msg)}</p>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">영문 (English)</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "solutionEnglish")).length > 0) ? "input-error" : ""}
                value={CUTIL.isnull(httpMessage.solutionEnglish) ? "" : httpMessage.solutionEnglish}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetHttpSolutionEng)}
                onChange={(e) => setHttpMessage({ ...httpMessage, solutionEnglish: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "solutionEnglish")).map((err) => err.msg)}</p>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">중문 (中文)</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "solutionChinese")).length > 0) ? "input-error" : ""}
                value={CUTIL.isnull(httpMessage.solutionChinese) ? "" : httpMessage.solutionChinese}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetHttpSolutionCha)}
                onChange={(e) => setHttpMessage({ ...httpMessage, solutionChinese: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "solutionChinese")).map((err) => err.msg)}</p>
            </div>
          </li>
        </ul>
        <ul className="form__input">
          <li>
            <p className="tit">HTTP코드</p>
            <div className="input__area">
              <input type="text"
                className={(errorList.filter(err => err.field.includes("httpCode")).length > 0) ? "input-error" : ""}
                value={httpMessage.httpCode}
                onChange={(e) => setHttpMessage({ ...httpMessage, httpCode: e.target.value })}
              />
              <p className="input-errortxt">{errorList.filter((err, idx) => err.field.includes("httpCode") && (idx === 0)).map((err) => err.msg)}</p>
            </div>
          </li>
        </ul>
      </div>}
      <div className="popup__footer">
        <button type="button" className="bg-gray js-close btn-close"
          onClick={(e) => onClickCancel(e)}
        >
          <span>취소</span>
        </button>
        <button type="button"
          onClick={(e) => onClickDoUpdateHttpMessage(e)}
        >
          <span>완료</span>
        </button>
      </div>
      {/*<!-- //e-Health Checker 메세지 팝업 -->*/}
    </>
  )
}

function PopupHttpMessageDelete(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //props  
  const setParentListReload = props.setListReload;
  const [httpMessage, setHttpMessage] = useState(null);
  useEffect(() => {
    setHttpMessage(props.httpMessage);
  }, [props.httpMessage])


  async function onClickDoDeleteHttpMessage(e, message) {
    let data: any = null;
    setRecoilIsLoadingBox(true);
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "DELETE",
      "appPath": `/api/v2/message/httpmessage`,
      appQuery: {
        "errorCode": message.errorCode,
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      setRecoilIsLoadingBox(false);
      if (data.codeNum == CONST.API_200) {
        clog("IN COMPANY : onClickDoSaveCompany : " + JSON.stringify(data.body));
        CUTIL.jsclose_Popup("pop-delete");
        setParentListReload(true, 0);
      } else { // api if
        // need error handle
        alert("ERROR : " + JSON.stringify(data.body.errorList));
      }
    }
  }

  function onClickCancel(e) {
    CUTIL.jsclose_Popup("pop-delete");
  }

  return (
    <>
      {/*<!-- 항목삭제 팝업 -->*/}
      <div className="popup__body">
        <p>해당 에러메세지를 삭제하시겠습니까?</p>
      </div>
      <div className="popup__footer">
        <button type="button" className="bg-gray js-close btn-close"
          onClick={(e) => onClickCancel(e)}
        >
          <span>취소</span>
        </button>
        <button type="button" className=""
          onClick={(e) => onClickDoDeleteHttpMessage(e, httpMessage)}
        >
          <span>확인</span>
        </button>
      </div>
      {/*<!-- // 항목삭제 팝업 -->*/}
    </>
  )
}