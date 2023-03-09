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
function ErrorMsgList(props) {
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
    appPath: `/api/v2/message/errormessages?${appPath}`,
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
    if (page > -1) handleCurPage(page);
    setListReload(val);
  }


  useEffect(() => {
    setParentPopWin("pop-message-add",
      <PopupErrorMessageInsert
        htmlHeader={<h1>에러 메세지</h1>}
        listReload={listReload}
        setListReload={handleListReload} // list reload
      />
    );
  }, [listReload])

  function onClickInsertErrorMessage(e) {
    var popupVal = e.target.getAttribute("data-pop");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-message-add");
    popupVal = e.target.getAttribute("data-ds-height");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "553");

    setParentPopWin("pop-message-add",
      <PopupErrorMessageInsert
        htmlHeader={<h1>에러 메세지</h1>}
        listReload={listReload}
        setListReload={handleListReload} // list reload
      />
    );
    CUTIL.jsopen_Popup(e);
  }

  function onClickViewErrorMessage(e, message) {
    var popupVal = e.target.getAttribute("data-pop");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-message");
    popupVal = e.target.getAttribute("data-ds-height");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "557");

    setParentPopWin("pop-message",
      <PopupErrorMessageView
        htmlHeader={<h1>에러 메세지</h1>}
        errorMessage={message}
        listReload={listReload}
        setListReload={handleListReload} // list reload
        setPopWin={props.setPopWin}
      />
    );
    CUTIL.jsopen_Popup(e);
  }

  function onClickDeleteErrorMessage(e, message) {
    var popupVal = e.target.getAttribute("data-pop");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-delete");
    popupVal = e.target.getAttribute("data-ds-height");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "200");

    setParentPopWin("pop-delete",
      <PopupErrorMessageDelete
        htmlHeader={<h1>삭제</h1>}
        errorMessage={message}
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
          <h2>에러 메세지</h2>
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
          <table summary="에러코드,메세지,비고,언어,삭제 항목으로 구성된 에러 메세지 리스트 입니다.">
            <caption>
              에러 메세지 리스트
            </caption>
            <colgroup>
              <col style={{ "width": "12%" }} />
              <col style={{ "width": "" }} />
              <col style={{ "width": "190px" }} />
              <col style={{ "width": "6%" }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="txt-left">에러코드</th>
                <th scope="col" className="txt-left">메세지</th>
                <th scope="col" className="txt-left">언어</th>
                <th scope="col">삭제</th>
              </tr>
            </thead>
            <tbody>
              {messageList.map((msg, idx) => (
                <tr key={`error_tr_${idx.toString()}`}>
                  <td className="txt-left js-open" data-pop="pop-message" onClick={(e) => onClickViewErrorMessage(e, msg)}>{msg.errorCode}</td>
                  <td className="txt-left js-open" data-pop="pop-message" onClick={(e) => onClickViewErrorMessage(e, msg)}>{msg.messageKorean}</td>
                  <td className="txt-left js-open" data-pop="pop-message" onClick={(e) => onClickViewErrorMessage(e, msg)}>
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
                      /* onClick={(e) => onClickDeleteErrorMessage(e, msg)} */
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
          componentName={"ERRORMESSAGELIST"}
          pageInfo={pageInfo}
          handleFunc={handleCurPage}
        />
      </div>
    </>
  )
};
export default ErrorMsgList;

function PopupErrorMessageInsert(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //props  
  const listReload = props.listReload;
  const setParentListReload = props.setListReload;

  const defaultVal = {
    "errorCode": "",
    "messageKorean": "",
    "messageEnglish": "",
    "messageChinese": "",
  }
  const [errorMessage, setErrorMessage] = useState(defaultVal);
  useEffect(() => {
    setErrorMessage(defaultVal);
  }, [listReload]);

  function callbackSetErrorMessageKor(val) {
    setErrorMessage({ ...errorMessage, messageKorean: val });
  }
  function callbackSetErrorMessageEng(val) {
    setErrorMessage({ ...errorMessage, messageEnglish: val });
  }
  function callbackSetErrorMessageCha(val) {
    setErrorMessage({ ...errorMessage, messageChinese: val });
  }
  const [errorList, setErrorList] = useState([]);

  async function onClickDoSaveErrorMessage(e) {
    const errList = [];
    var doCnt = 0;
    var doneCnt = 0;
    var succCnt = 0;

    let data: any = null;
    setRecoilIsLoadingBox(true);
    doCnt++;
    data = await doSaveErrorMessage({
      "errorCode": errorMessage.errorCode,
      "message": errorMessage.messageKorean,
      "language": CONST.STR_APILANG_KOR
    });
    if (data) {
      doneCnt++;
      if (data.codeNum == CONST.API_200) {
        succCnt++;
        clog("IN CHECK MSG : KOR INSERT : " + JSON.stringify(data.body));
      } else { // api if korean
        // need error handle
        data.body.errorList.map((elist) => (
          errList.push({ "field": elist.field + CONST.STR_APILANG_KOR, "msg": elist.msg })
        ))
      }
      CUTIL.sleep(500);
      doCnt++;
      let edata = await doSaveErrorMessage({
        "errorCode": errorMessage.errorCode,
        "message": errorMessage.messageEnglish,
        "language": CONST.STR_APILANG_ENG
      });
      if (edata) {
        doneCnt++;
        if (edata.codeNum == CONST.API_200) {
          succCnt++;
          clog("IN CHECK MSG : ENG INSERT : " + JSON.stringify(data.body));
        } else { //english
          edata.body.errorList.map((elist) => (
            errList.push({ "field": elist.field + CONST.STR_APILANG_ENG, "msg": elist.msg })
          ))
        }
        CUTIL.sleep(500);
        doCnt++;
        let cdata = await doSaveErrorMessage({
          "errorCode": errorMessage.errorCode,
          "message": errorMessage.messageChinese,
          "language": CONST.STR_APILANG_CHA
        });
        if (cdata) {
          doneCnt++;
          if (cdata.codeNum == CONST.API_200) {
            succCnt++;
            clog("IN CHECK MSG : CHA INSERT : " + JSON.stringify(data.body));
          } else { //chinese
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

  async function doSaveErrorMessage(cmsg) {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "POST",
      "appPath": `/api/v2/message/errormessage`,
      appQuery:
      {
        "errorCode": cmsg.errorCode,
        "message": cmsg.message,
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

  return (
    <>
      <div className="popup__body">
        <ul className="form__input">
          <li>
            <p className="tit">에러코드</p>
            <div className="input__area">
              <input type="text"
                className={(errorList.filter(err => err.field.includes("errorCode")).length > 0) ? "input-error" : ""}
                value={errorMessage.errorCode}
                onChange={(e) => setErrorMessage({ ...errorMessage, errorCode: e.target.value })}
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
                value={errorMessage.messageKorean}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetErrorMessageKor)}
                onChange={(e) => setErrorMessage({ ...errorMessage, messageKorean: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageKorean")).map((err) => err.msg)}</p>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">영문 (English)</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "messageEnglish")).length > 0) ? "input-error" : ""}
                value={errorMessage.messageEnglish}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetErrorMessageEng)}
                onChange={(e) => setErrorMessage({ ...errorMessage, messageEnglish: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageEnglish")).map((err) => err.msg)}</p>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">중문 (中文)</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "messageChinese")).length > 0) ? "input-error" : ""}
                value={errorMessage.messageChinese}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetErrorMessageCha)}
                onChange={(e) => setErrorMessage({ ...errorMessage, messageChinese: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageChinese")).map((err) => err.msg)}</p>
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
          onClick={(e) => onClickDoSaveErrorMessage(e)}
        >
          <span>완료</span>
        </button>
      </div>
    </>
  )
}



function PopupErrorMessageView(props) {
  const setParentPopWin = props.setPopWin;
  const [errorMessage, setErrorMessage] = useState(null);
  //const onClickUpdateCheckMessage = props.onClickUpdateCheckMessage;
  const listReload = props.listReload;
  const setParentListReload = props.setListReload;
  //
  const [updateCount, setUpdateCount] = useState(0);

  // 메시지 항목이 변경될때마다..초기화
  useEffect(() => {
    setErrorMessage(props.errorMessage);
    setUpdateCount(0);
  }, [props.errorMessage])

  function onClickUpdateErrorMessage(e, message) {
    var popupVal = e.target.getAttribute("data-pop");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-message-edit");
    popupVal = e.target.getAttribute("data-ds-height");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "557");

    CUTIL.jsclose_Popup("pop-message");

    setParentPopWin("pop-message-edit",
      <PopupErrorMessageUpdate
        htmlHeader={<h1>에러 메세지</h1>}
        errorMessage={message}
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

  return (
    <>
      {/*<!-- e-Health Checker 메세지 팝업 -->*/}
      {(errorMessage) && <div className="popup__body">
        <ul className="form__input">
          <li>
            <p className="tit">에러코드</p>
            <div className="input__area">
              <input type="text" value={CUTIL.isnull(errorMessage.errorCode) ? "" : errorMessage.errorCode} disabled />
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
              <textarea value={CUTIL.isnull(errorMessage.messageKorean) ? "" : errorMessage.messageKorean} readOnly></textarea>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">영문 (English)</p>
            <div className="input__area">
              <textarea value={CUTIL.isnull(errorMessage.messageEnglish) ? "" : errorMessage.messageEnglish} readOnly></textarea>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">중문 (中文)</p>
            <div className="input__area">
              <textarea value={CUTIL.isnull(errorMessage.messageChinese) ? "" : errorMessage.messageChinese} readOnly></textarea>
            </div>
          </li>
        </ul>
      </div>}
      <div className="popup__footer">
        <button type="button"
          className="bg-gray js-open btn-close"
          data-pop="pop-message-edit"
          onClick={(e) => onClickUpdateErrorMessage(e, errorMessage)}
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


function PopupErrorMessageUpdate(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //props  
  const listReload = props.listReload;
  const setParentListReload = props.setListReload;
  //
  const updateCount = props.updateCount;
  const setParentUpdateCount = props.setUpdateCount;
  //
  const setParentPopWin = props.setPopWin;

  const [errorMessage, setErrorMessage] = useState(null);
  clog("IN UPDATE : " + listReload);
  useEffect(() => {
    setErrorMessage(props.errorMessage);
  }, [updateCount, props.errorMessage])

  function callbackSetErrorMessageKor(val) {
    setErrorMessage({ ...errorMessage, messageKorean: val });
  }
  function callbackSetErrorMessageEng(val) {
    setErrorMessage({ ...errorMessage, messageEnglish: val });
  }
  function callbackSetErrorMessageCha(val) {
    setErrorMessage({ ...errorMessage, messageChinese: val });
  }
  const [errorList, setErrorList] = useState([]);

  async function onClickDoUpdateErrorMessage(e) {
    const errList = [];
    var doCnt = 0;
    var doneCnt = 0;
    var succCnt = 0;

    let data: any = null;
    setRecoilIsLoadingBox(true);
    doCnt++;
    data = await doUpdateErrorMessage({
      "errorCode": errorMessage.errorCode,
      "message": errorMessage.messageKorean,
      "language": CONST.STR_APILANG_KOR
    });
    if (data) {
      doneCnt++;
      if (data.codeNum == CONST.API_200) {
        succCnt++;
        clog("IN HTTP MSG : KOR UPDATE : " + JSON.stringify(data.body));
      } else { // api if korean
        // need error handle
        data.body.errorList.map((elist) => (
          errList.push({ "field": elist.field + CONST.STR_APILANG_KOR, "msg": elist.msg })
        ))
      }
      CUTIL.sleep(500);
      doCnt++;
      let edata = await doUpdateErrorMessage({
        "errorCode": errorMessage.errorCode,
        "message": errorMessage.messageEnglish,
        "language": CONST.STR_APILANG_ENG
      });
      if (edata) {
        doneCnt++;
        if (edata.codeNum == CONST.API_200) {
          succCnt++;
          clog("IN HTTP MSG : ENG UPDATE : " + JSON.stringify(data.body));
        } else { //english
          edata.body.errorList.map((elist) => (
            errList.push({ "field": elist.field + CONST.STR_APILANG_ENG, "msg": elist.msg })
          ))
        }
        CUTIL.sleep(500);
        doCnt++;
        let cdata = await doUpdateErrorMessage({
          "errorCode": errorMessage.errorCode,
          "message": errorMessage.messageChinese,
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
          setParentListReload(true, -1);
          setParentPopWin("pop-message",
            <PopupErrorMessageView
              htmlHeader={<h1>에러 메세지</h1>}
              errorMessage={errorMessage}
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

  async function doUpdateErrorMessage(cmsg) {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": `/api/v2/message/errormessage`,
      appQuery:
      {
        "errorCode": cmsg.errorCode,
        "message": cmsg.message,
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
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "557");

    CUTIL.jsclose_Popup("pop-message-edit");
    setParentPopWin("pop-message-edit", null);

    CUTIL.jsopen_Popup(e);
    setErrorList([]);
    setParentUpdateCount(updateCount + 1);
  }

  return (
    <>
      {/*<!-- e-Health Checker 메세지 팝업 -->*/}
      {(errorMessage) && <div className="popup__body">
        <ul className="form__input">
          <li>
            <p className="tit">에러코드</p>
            <div className="input__area">
              <input type="text"
                className={(errorList.filter(err => err.field.includes("errorCode")).length > 0) ? "input-error" : ""}
                value={errorMessage.errorCode}
                // onChange={(e) => setErrorMessage({ ...errorMessage, errorCode: e.target.value })}
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
                value={CUTIL.isnull(errorMessage.messageKorean) ? "" : errorMessage.messageKorean}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetErrorMessageKor)}
                onChange={(e) => setErrorMessage({ ...errorMessage, messageKorean: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageKorean")).map((err) => err.msg)}</p>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">영문 (English)</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "messageEnglish")).length > 0) ? "input-error" : ""}
                value={CUTIL.isnull(errorMessage.messageEnglish) ? "" : errorMessage.messageEnglish}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetErrorMessageEng)}
                onChange={(e) => setErrorMessage({ ...errorMessage, messageEnglish: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageEnglish")).map((err) => err.msg)}</p>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">중문 (中文)</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "messageChinese")).length > 0) ? "input-error" : ""}
                value={CUTIL.isnull(errorMessage.messageChinese) ? "" : errorMessage.messageChinese}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetErrorMessageCha)}
                onChange={(e) => setErrorMessage({ ...errorMessage, messageChinese: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageChinese")).map((err) => err.msg)}</p>
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
          onClick={(e) => onClickDoUpdateErrorMessage(e)}
        >
          <span>완료</span>
        </button>
      </div>
      {/*<!-- //e-Health Checker 메세지 팝업 -->*/}
    </>
  )
}

function PopupErrorMessageDelete(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //props  
  const setParentListReload = props.setListReload;
  const [errorMessage, setErrorMessage] = useState(null);
  useEffect(() => {
    setErrorMessage(props.errorMessage);
  }, [props.errorMessage])


  async function onClickDoDeleteErrorMessage(e, message) {
    let data: any = null;
    setRecoilIsLoadingBox(true);
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "DELETE",
      "appPath": `/api/v2/message/errormessage`,
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
          onClick={(e) => onClickDoDeleteErrorMessage(e, errorMessage)}
        >
          <span>확인</span>
        </button>
      </div>
      {/*<!-- // 항목삭제 팝업 -->*/}
    </>
  )
}