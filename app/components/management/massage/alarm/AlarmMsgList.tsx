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
function AlarmMsgList(props) {
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
    appPath: `/api/v2/message/noticemessages?${appPath}`,
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
      //clog("IN Alarm MESSAGE LIST : RES : " + JSON.stringify(retData));
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
      <PopupAlarmMessageInsert
        htmlHeader={<h1>알람 메세지</h1>}
        listReload={listReload}
        setListReload={handleListReload} // list reload
      />
    );
  }, [listReload])

  function onClickInsertAlarmMessage(e) {
    var popupVal = e.target.getAttribute("data-pop");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-message-add");
    popupVal = e.target.getAttribute("data-ds-height");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "694");

    setParentPopWin("pop-message-add",
      <PopupAlarmMessageInsert
        htmlHeader={<h1>알람 메세지</h1>}
        listReload={listReload}
        setListReload={handleListReload} // list reload
      />
    );
    CUTIL.jsopen_Popup(e);
  }

  function onClickViewAlarmMessage(e, message) {
    var popupVal = e.target.getAttribute("data-pop");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-message");
    popupVal = e.target.getAttribute("data-ds-height");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "683");

    setParentPopWin("pop-message",
      <PopupAlarmMessageView
        htmlHeader={<h1>알람 메세지</h1>}
        alarmMessage={message}
        listReload={listReload}
        setListReload={handleListReload} // list reload
        setPopWin={props.setPopWin}
      />
    );
    CUTIL.jsopen_Popup(e);
  }

  function onClickDeleteAlarmMessage(e, message) {
    var popupVal = e.target.getAttribute("data-pop");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-delete");
    popupVal = e.target.getAttribute("data-ds-height");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "200");

    setParentPopWin("pop-delete",
      <PopupAlarmMessageDelete
        htmlHeader={<h1>삭제</h1>}
        alarmMessage={message}
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
          <h2>알람 메세지</h2>
        </div>
        <div className="tbl__top mb-16">
          <div className="right">
            <button type="button"
              className="bg-gray js-open"
              data-pop="pop-message-add"
              /* onClick={(e) => onClickInsertAlarmMessage(e)}  */
              disabled // 사용 시 제거 및 onClick 주석 해체
            >
              <span>추가</span>
            </button>
          </div>
        </div>
        {/*<!--테이블-->*/}
        <div className="tbl-list message-list">
          <table summary="이름,종류,메세지,요약,언어,삭제 항목으로 구성된 Alarmr 메세지 리스트 입니다.">
            <caption>
              알람 메세지 리스트
            </caption>
            <colgroup>
              <col style={{ "width": "12%" }} />
              <col style={{ "width": "10%" }} />
              <col style={{ "width": "" }} />
              <col style={{ "width": "" }} />
              <col style={{ "width": "190px" }} />
              <col style={{ "width": "6%" }} />
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="txt-left">메세지코드</th>
                <th scope="col" className="txt-left">분류</th>
                <th scope="col" className="txt-left">메세지</th>
                <th scope="col" className="txt-left">링크</th>
                <th scope="col" className="txt-left">언어</th>
                <th scope="col">삭제</th>
              </tr>
            </thead>
            <tbody>
              {messageList.map((msg, idx) => (
                <tr key={`msg_tr_${idx.toString()}`}>
                  <td className="txt-left js-open" data-pop="pop-message" onClick={(e) => onClickViewAlarmMessage(e, msg)}>
                    <strong>{msg.code}</strong></td>
                  <td className="txt-left js-open" data-pop="pop-message" onClick={(e) => onClickViewAlarmMessage(e, msg)}>
                    <strong>{msg.category}</strong></td>
                  <td className="txt-left js-open" data-pop="pop-message" onClick={(e) => onClickViewAlarmMessage(e, msg)}>{msg.messageKorean}</td>
                  <td className="txt-left js-open" data-pop="pop-message" onClick={(e) => onClickViewAlarmMessage(e, msg)}>{msg.link}</td>
                  <td className="txt-left js-open" data-pop="pop-message" onClick={(e) => onClickViewAlarmMessage(e, msg)}>
                    {/*<!--선택된 언어에 클래스 on-->*/}
                    <ul className="messagelang">
                      <li className={(!CUTIL.isnull(msg.messageKorean) && msg.messageKorean.length > 0) ? "on" : ""}>한국어</li>
                      <li className={(!CUTIL.isnull(msg.messageEnglish) && msg.messageEnglish.length > 0) ? "on" : ""}>English</li>
                      <li className={(!CUTIL.isnull(msg.messageChinese) && msg.messageChinese.length > 0) ? "on" : ""}>中文</li>
                    </ul>
                  </td>
                  <td>
                    <button type="button"
                      className="btn btn-delete-gr js-open"
                      data-pop="pop-delete"
                      /* onClick={(e) => onClickDeleteAlarmMessage(e, msg)} */
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
          componentName={"AlarmMESSAGELIST"}
          pageInfo={pageInfo}
          handleFunc={handleCurPage}
        />
      </div>
    </>
  )
};
export default AlarmMsgList;

function PopupAlarmMessageInsert(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //props  
  const listReload = props.listReload;
  const setParentListReload = props.setListReload;

  const defaultVal = {
    "code": "",
    "category": "",
    "messageKorean": "",
    "messageEnglish": "",
    "messageChinese": "",
    "link": "",
    "language": ""

  }
  const [alarmMessage, setAlarmMessage] = useState(defaultVal);
  useEffect(() => {
    setAlarmMessage(defaultVal);
  }, [listReload]);

  function callbackSetAlarmDescriptionKor(val) {
    setAlarmMessage({ ...alarmMessage, messageKorean: val });
  }
  function callbackSetAlarmDescriptionEng(val) {
    setAlarmMessage({ ...alarmMessage, messageEnglish: val });
  }
  function callbackSetAlarmDescriptionCha(val) {
    setAlarmMessage({ ...alarmMessage, messageChinese: val });
  }
  const [errorList, setErrorList] = useState([]);


  async function onClickdoSaveAlarmMessage(e) {
    const errList = [];
    var doCnt = 0;
    var doneCnt = 0;
    var succCnt = 0;

    let data: any = null;
    setRecoilIsLoadingBox(true);
    doCnt++;
    data = await doSaveAlarmMessage({
      "category": alarmMessage.category,
      "code": alarmMessage.code,
      "message": alarmMessage.messageKorean,
      "link": alarmMessage.link,
      "language": CONST.STR_APILANG_KOR
    });
    if (data) {
      doneCnt++;
      if (data.codeNum == CONST.API_200) {
        succCnt++;
        clog("IN Alarm MSG : KOR INSERT : " + JSON.stringify(data.body));
      } else { // api if korean
        // need error handle
        data.body.errorList.map((elist) => (
          errList.push({ "field": elist.field + CONST.STR_APILANG_KOR, "msg": elist.msg })
        ))
      }
      CUTIL.sleep(500);
      doCnt++;
      let edata = await doSaveAlarmMessage({
        "category": alarmMessage.category,
        "code": alarmMessage.code,
        "message": alarmMessage.messageEnglish,
        "link": alarmMessage.link,
        "language": CONST.STR_APILANG_ENG
      });
      if (edata) {
        doneCnt++;
        if (edata.codeNum == CONST.API_200) {
          succCnt++;
          clog("IN Alarm MSG : ENG INSERT : " + JSON.stringify(data.body));
        } else { //english
          edata.body.errorList.map((elist) => (
            errList.push({ "field": elist.field + CONST.STR_APILANG_ENG, "msg": elist.msg })
          ))
        }
        CUTIL.sleep(500);
        doCnt++;
        let cdata = await doSaveAlarmMessage({
          "category": alarmMessage.category,
          "code": alarmMessage.code,
          "message": alarmMessage.messageChinese,
          "link": alarmMessage.link,
          "language": CONST.STR_APILANG_CHA
        });
        if (cdata) {
          doneCnt++;
          if (cdata.codeNum == CONST.API_200) {
            succCnt++;
            clog("IN Alarm MSG : CHA INSERT : " + JSON.stringify(data.body));
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

  async function doSaveAlarmMessage(cmsg) {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "POST",
      "appPath": `/api/v2/message/noticemessage`,
      appQuery:
      {
        "code": cmsg.code,
        "category": cmsg.category,
        "message": cmsg.message,
        "link": cmsg.link,
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
            <p className="tit">메세지코드</p>
            <div className="input__area">
              <input type="text"
                className={(errorList.filter(err => err.field.includes("code")).length > 0) ? "input-error" : ""}
                value={alarmMessage.code}
                onChange={(e) => setAlarmMessage({ ...alarmMessage, code: e.target.value })}
              />
              <p className="input-errortxt">{errorList.filter((err, idx) => err.field.includes("code") && (idx === 0)).map((err) => err.msg)}</p>
            </div>
          </li>
          <li>
            <p className="tit">분류</p>
            <div className="input__area">
              <input type="text"
                className={(errorList.filter(err => err.field.includes("category")).length > 0) ? "input-error" : ""}
                value={alarmMessage.category}
                onChange={(e) => setAlarmMessage({ ...alarmMessage, category: e.target.value })}
              />
              <p className="input-errortxt">{errorList.filter((err, idx) => err.field.includes("category") && (idx === 0)).map((err) => err.msg)}</p>
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
                value={alarmMessage.messageKorean}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetAlarmDescriptionKor)}
                onChange={(e) => setAlarmMessage({ ...alarmMessage, messageKorean: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageKorean")).map((err) => err.msg)}</p>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">영문 (English)</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "messageEnglish")).length > 0) ? "input-error" : ""}
                value={alarmMessage.messageEnglish}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetAlarmDescriptionEng)}
                onChange={(e) => setAlarmMessage({ ...alarmMessage, messageEnglish: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageEnglish")).map((err) => err.msg)}</p>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">중문 (中文)</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "messageChinese")).length > 0) ? "input-error" : ""}
                value={alarmMessage.messageChinese}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetAlarmDescriptionCha)}
                onChange={(e) => setAlarmMessage({ ...alarmMessage, messageChinese: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageChinese")).map((err) => err.msg)}</p>
            </div>
          </li>
        </ul>
        <ul className="form__input">
          <li>
            <p className="tit">링크</p>
            <div className="input__area">
              <input type="text"
                className={(errorList.filter(err => err.field.includes("link")).length > 0) ? "input-error" : ""}
                value={alarmMessage.link}
                onChange={(e) => setAlarmMessage({ ...alarmMessage, link: e.target.value })}
              />
              <p className="input-errortxt">{errorList.filter((err, idx) => err.field.includes("link") && (idx === 0)).map((err) => err.msg)}</p>
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
          onClick={(e) => onClickdoSaveAlarmMessage(e)}
        >
          <span>완료</span>
        </button>
      </div>
    </>
  )
}



function PopupAlarmMessageView(props) {
  const setParentPopWin = props.setPopWin;
  const [alarmMessage, setAlarmMessage] = useState(null);
  //const onClickUpdateAlarmMessage = props.onClickUpdateAlarmMessage;
  const listReload = props.listReload;
  const setParentListReload = props.setListReload;
  const [updateCount, setUpdateCount] = useState(0);
  useEffect(() => {
    setAlarmMessage(props.alarmMessage);
    setUpdateCount(0)
  }, [props.alarmMessage])

  function onClickUpdateAlarmMessage(e, message) {
    var popupVal = e.target.getAttribute("data-pop");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-message-edit");
    popupVal = e.target.getAttribute("data-ds-height");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "683");

    CUTIL.jsclose_Popup("pop-message");

    setParentPopWin("pop-message-edit",
      <PopupAlarmMessageUpdate
        htmlHeader={<h1>알람 메세지</h1>}
        alarmMessage={message}
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
      {/*<!-- Alarm 메세지 팝업 -->*/}
      {(alarmMessage) && <div className="popup__body">
        <ul className="form__input">
          <li>
            <p className="tit">메세지코드</p>
            <div className="input__area">
              <input type="text" value={alarmMessage.code} disabled />
            </div>
          </li>
          <li>
            <p className="tit">분류</p>
            <div className="input__area">
              <input type="text" value={CUTIL.isnull(alarmMessage.category) ? "" : alarmMessage.category} disabled />
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
              <textarea value={CUTIL.isnull(alarmMessage.messageKorean) ? "" : alarmMessage.messageKorean} readOnly></textarea>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">영문 (English)</p>
            <div className="input__area">
              <textarea value={CUTIL.isnull(alarmMessage.messageEnglish) ? "" : alarmMessage.messageEnglish} readOnly></textarea>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">중문 (中文)</p>
            <div className="input__area">
              <textarea value={CUTIL.isnull(alarmMessage.messageChinese) ? "" : alarmMessage.messageChinese} readOnly></textarea>
            </div>
          </li>
        </ul>
        <ul className="form__input">
          <li>
            <p className="tit">링크</p>
            <div className="input__area">
              <input type="text" value={alarmMessage.link} disabled />
            </div>
          </li>
        </ul>
      </div>}
      <div className="popup__footer">
        <button type="button"
          className="bg-gray js-open btn-close"
          data-pop="pop-message-edit"
          onClick={(e) => onClickUpdateAlarmMessage(e, alarmMessage)}
        >
          <span>수정</span>
        </button>
        <button type="button" className=""
          onClick={(e) => onClickCancel(e)}
        >
          <span>확인</span>
        </button>
      </div>
      {/*<!-- //Alarm 메세지 팝업 -->*/}
    </>
  )
}


function PopupAlarmMessageUpdate(props) {
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
  const [alarmMessage, setAlarmMessage] = useState(null);
  useEffect(() => {
    setAlarmMessage(props.alarmMessage);
  }, [updateCount, props.alarmMessage])

  function callbackSetAlarmDescriptionKor(val) {
    setAlarmMessage({ ...alarmMessage, messageKorean: val });
  }
  function callbackSetAlarmDescriptionEng(val) {
    setAlarmMessage({ ...alarmMessage, messageEnglish: val });
  }
  function callbackSetAlarmDescriptionCha(val) {
    setAlarmMessage({ ...alarmMessage, messageChinese: val });
  }
  function callbackSetAlarmSummaryKor(val) {
    setAlarmMessage({ ...alarmMessage, link: val });
  }
  function callbackSetAlarmSummaryEng(val) {
    setAlarmMessage({ ...alarmMessage, link: val });
  }
  function callbackSetAlarmSummaryCha(val) {
    setAlarmMessage({ ...alarmMessage, link: val });
  }
  const [errorList, setErrorList] = useState([]);

  async function onClickDoUpdateAlarmMessage(e) {
    const errList = [];
    var doCnt = 0;
    var doneCnt = 0;
    var succCnt = 0;

    let data: any = null;
    setRecoilIsLoadingBox(true);
    doCnt++;
    data = await doUpdateAlarmMessage({
      "category": alarmMessage.category,
      "code": alarmMessage.code,
      "message": alarmMessage.messageKorean,
      "link": alarmMessage.link,
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
      let edata = await doUpdateAlarmMessage({
        "category": alarmMessage.category,
        "code": alarmMessage.code,
        "message": alarmMessage.messageEnglish,
        "link": alarmMessage.link,
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
        let cdata = await doUpdateAlarmMessage({
          "category": alarmMessage.category,
          "code": alarmMessage.code,
          "message": alarmMessage.messageChinese,
          "link": alarmMessage.link,
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
            <PopupAlarmMessageView
              htmlHeader={<h1>알람 메세지</h1>}
              alarmMessage={alarmMessage}
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


  async function doUpdateAlarmMessage(cmsg) {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": `/api/v2/message/noticemessage`,
      appQuery:
      {
        "category": cmsg.category,
        "code": cmsg.code,
        "message": cmsg.message,
        "link": cmsg.link,
        "language": cmsg.language
      },

      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum !== CONST.API_200) {
        alert(`ERROR : ${cmsg.language} : ` + JSON.stringify(data.body.errorList));
      }
    }

    return data;
  }

  function onClickCancel(e) {
    var popupVal = e.target.getAttribute("data-pop");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-message");
    popupVal = e.target.getAttribute("data-ds-height");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-ds-height", "683");

    CUTIL.jsclose_Popup("pop-message-edit");
    setParentPopWin("pop-message-edit", null);

    CUTIL.jsopen_Popup(e);
    setErrorList([]);
    setParentUpdateCount(updateCount+1);
  }

  return (
    <>
      {/*<!-- Alarm 메세지 팝업 -->*/}
      {(alarmMessage) && <div className="popup__body">
        <ul className="form__input">
          <li>
            <p className="tit">메세지코드</p>
            <div className="input__area">
              <input type="text"
                className={(errorList.filter(err => err.field.includes("code")).length > 0) ? "input-error" : ""}
                value={alarmMessage.code}
                //onChange={(e) => setAlarmMessage({ ...alarmMessage, code: e.target.value })}
                readOnly
                disabled
              />
              <p className="input-errortxt">{errorList.filter((err, idx) => err.field.includes("code") && (idx === 0)).map((err) => err.msg)}</p>
            </div>
          </li>
          <li>
            <p className="tit">분류</p>
            <div className="input__area">
              <input type="text"
                className={(errorList.filter(err => err.field.includes("category")).length > 0) ? "input-error" : ""}
                value={CUTIL.isnull(alarmMessage.category) ? "" : alarmMessage.category}
                onChange={(e) => setAlarmMessage({ ...alarmMessage, category: e.target.value })}
              />
              <p className="input-errortxt">{errorList.filter((err, idx) => err.field.includes("category") && (idx === 0)).map((err) => err.msg)}</p>
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
                value={CUTIL.isnull(alarmMessage.messageKorean) ? "" : alarmMessage.messageKorean}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetAlarmDescriptionKor)}
                onChange={(e) => setAlarmMessage({ ...alarmMessage, messageKorean: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageKorean")).map((err) => err.msg)}</p>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">영문 (English)</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "messageEnglish")).length > 0) ? "input-error" : ""}
                value={CUTIL.isnull(alarmMessage.messageEnglish) ? "" : alarmMessage.messageEnglish}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetAlarmDescriptionEng)}
                onChange={(e) => setAlarmMessage({ ...alarmMessage, messageEnglish: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageEnglish")).map((err) => err.msg)}</p>
            </div>
          </li>
          <li className="sub-input">
            <p className="tit">중문 (中文)</p>
            <div className="input__area">
              <textarea placeholder=""
                className={(errorList.filter(err => (err.field === "messageChinese")).length > 0) ? "input-error" : ""}
                value={CUTIL.isnull(alarmMessage.messageChinese) ? "" : alarmMessage.messageChinese}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetAlarmDescriptionCha)}
                onChange={(e) => setAlarmMessage({ ...alarmMessage, messageChinese: e.target.value })}>
              </textarea>
              <p className="input-errortxt">{errorList.filter(err => (err.field === "messageChinese")).map((err) => err.msg)}</p>
            </div>
          </li>
        </ul>
        <ul className="form__input">
          <li>
            <p className="tit">링크</p>
            <div className="input__area">
              <input type="text" value={alarmMessage.link}
                onChange={(e) => setAlarmMessage({ ...alarmMessage, link: e.target.value })} />
            </div>
          </li>
        </ul>
      </div>}
      <div className="popup__footer">
        <button type="button"
          className="bg-gray js-close btn-close"
          onClick={(e) => onClickCancel(e)}
        >
          <span>취소</span>
        </button>
        <button type="button"
          onClick={(e) => onClickDoUpdateAlarmMessage(e)}
        >
          <span>완료</span>
        </button>
      </div>
      {/*<!-- //Alarm 메세지 팝업 -->*/}
    </>
  )
}

function PopupAlarmMessageDelete(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //props  
  const setParentListReload = props.setListReload;
  const [alarmMessage, setAlarmMessage] = useState(null);
  useEffect(() => {
    setAlarmMessage(props.alarmMessage);
  }, [props.alarmMessage])


  async function onClickDoDeleteAlarmMessage(e, message) {
    let data: any = null;
    setRecoilIsLoadingBox(true);
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "DELETE",
      "appPath": `/api/v2/message/noticemessage`,
      appQuery: {
        "code": message.code,
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
          onClick={(e) => onClickDoDeleteAlarmMessage(e, alarmMessage)}
        >
          <span>확인</span>
        </button>
      </div>
      {/*<!-- // 항목삭제 팝업 -->*/}
    </>
  )
}