/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-10-12
 * @brief EHP 이메일 상담 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
//
import { useAsync } from "react-async";
// recoil && state
import { useRecoilValue, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
//
import * as HTTPUTIL from "../../../utils/api/HttpUtil";
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const"
import { useNavigate } from "react-router-dom";
//
import EhpDtlPostCode from "../../common/postcode/EhpDtlPostCode";

import { ko } from "date-fns/esm/locale";

/**
 * @brief EHP 이메일 상담 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function InquiryView(props) {
  // recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //화면 이동
  const navigate = useNavigate();
  //props
  const setParentPopWin = props.setPopWin;
  //
  const [userItem, setUserItem] = useState(null)

  //  
  const [subject, setSubject] = useState("");
  const [malfunctionItem] = useState([
    { "id": 0, "fnName": "e-Health Portal 문의", "value": "" },
    { "id": 1, "fnName": "기타 문의", "value": "" },
  ]);
  /*   const [agreeMailReceipt, setAgreeMailReceipt] = useState(true);
    const [agreePortalAlarm, setAgreePortalAlarm] = useState(false); */
  const [agreePersonalInfoSel, setAgreePersonalInfoSel] = useState("true");


  const [errorList, setErrorList] = useState([])
  const [content, setContent] = useState("")
  const [malfunction, setMalfunction] = useState("");
  const agreePersonalInfo = (agreePersonalInfoSel == "true") ? true : false;
  const [savedFiles, setSavedFiles] = useState([]);

  const [curPos] = useState(0);
  const [listSize] = useState(10);
  const fileRef: any = useRef();

  const [success, setSuccess] = useState("");

  const errorRef: any = useRef();
  // user Info API
  const { data: data, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/user`,//${appPath}`
    appQuery: {},
    userToken: userInfo.loginInfo.token,

  });

  useEffect(() => {
    // error page 이동
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, data);

    if (ERR_URL.length > 0) navigate(ERR_URL);

    if (data) {
      if (data.codeNum == CONST.API_200) {
        setUserItem(data.body);
        // setCompanyDto(data.body);

      }
    }
  }, [data]);

  // 내용
  function handlesSubject(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "subject"))
    )

    setSubject(e.target.value);
  }

  // 문의 유형 API

  // 문의 유형 선택 - select
  function malfunctionSelect(malfunction) {
    setErrorList(
      errorList.filter((err) => (err.field !== "consultType"))
    )
    setMalfunction(malfunction.fnName);
  }
  // 내용
  function handleContent(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "content"))
    )

    setContent(e.target.value);
  }

  // 첨부파일 
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
    if (savedFiles.length <= 9) {
      setSavedFiles([...savedFiles, fileVal]);
      e.target.value = ''; // file name 초기화
    } else {
      alert("첨부파일은 10개 까지 가능합니다.");
    }

  };
  // 이미지 삭제
  function onClickAttachFileDelete(delFile) {
    //var delFile = savedFiles[idx];
    if (!delFile.hasOwnProperty("type")) {
      URL.revokeObjectURL(delFile.url);
    }
    setSavedFiles(savedFiles.filter(file => file.imageId !== delFile.imageId));
  }
  //동의
  function handleAgreePersonalInfoSelSel(e) {

    setAgreePersonalInfoSel(e.target.value)
  }



  // 요청 팝업
  useEffect(() => {
    setParentPopWin("pop-small",
      <RequestDoenPop
        htmlHeader={(data) && <h1>{(success) ? "저장" : "이메일 상담"}</h1>}
        success={success}
        data={data}
        requestSaved={requestSaved}
        requestDone={requestDone}
      />
    )
  })
  // 미동의
  function disagreePop(e) {
    setParentPopWin("pop-small",
      <DisagreePop
        htmlHeader={<h1>에러</h1>}
        success={success}
        requestSaved={requestSaved}
        requestDone={requestDone}
      />
    )
    CUTIL.jsopen_Popup(e)


  }
  // 요청 점검  API
  async function requestSaved(e, userItem) {
    let data: any = {};
    data = await HTTPUTIL.PromiseHttp({
      httpMethod: "POST",
      appPath: `/api/v2/board/consult`,
      appQuery: {
        userIdPk: userItem.userIdPk,
        /*      agreeMailReceipt: agreeMailReceipt,
             agreePortalAlarm: false, */
        agreePersonalInfo: agreePersonalInfo,
        consultType: malfunction,
        subject: subject,
        content: content

      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        if (savedFiles.length == 0) {
          setSuccess(data.data.msg)

        } else {
          savedFiles.map((file, idx) => {

            if (file.hasOwnProperty("type") && (file.type == "INS")) {
              saveFiles(data.body.id, file.fileForm);
            }

          });
          setSuccess(data.data.msg)
        }
      } else {
        setErrorList((data.errorList == null) ? [] : data.errorList);
        var btnCommentClose = document.getElementById("pop-small");
        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");
        errorRef.current.focus();
      }
    }

  }

  // 첨부파일 API
  async function saveFiles(itemId, fileFormData) {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "POST",
      "appPath": `/api/v2/board/consult/files?consultId=${itemId}`,
      appQuery: fileFormData,
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == 200) {
        clog("IN CHECK ITEM LAST : saveFiles : "+ JSON.stringify(data));

      } else { // api if
        // need error handle
        alert(data.errorList.map((err) => err.msg))
      }
    }
    //return data;

  }

  function requestDone(e) {

    window.location.reload();
  }

  return (
    <>
      <div className="box__header">
        <h2>이메일 상담</h2>
        <p className="box__title">e-Health Portal 및 제품에 대하여 이메일 상담을 제공해 드립니다.</p>
        <ul className="box__info">
          <li>e-Health Portal 이용 중에 생긴 불편한 점이나 문의사항을 보내주세요. 궁금하신 점을 남겨주시면 최초 접수된 문의 건부터 순차적으로 답변을 받으실 수 있습니다.</li>
          <li>이메일 상담은 실시간 상담이 아니며, 상담이 집중될 경우 답변이 지연될 수 있습니다.</li>
          <li>네트워크 장애 등으로 내용 저장이 안 될 수 있으니 메모장 등에서 작성하여 등록해 주시기 바랍니다.</li>
        </ul>
      </div>
      <div className="box__body">
        {(userItem) &&

          <div className="info__input">
            <div className="page-top">
              <h3>
                <span>1. 상담 입력</span>
                <span className="txt-info"><span className="txt-red mr-4">*</span>필수 입력 사항</span>
              </h3>
            </div>
            <div className="content__info">
              <ul className="form__input">
                <li>
                  <p className="tit star">제목</p>
                  <input className="hide" ref={errorRef} />
                  <div className="input__area">
                    <p className="txtnum">{subject.length} / 100</p>
                    <input type="text"
                      value={subject}
                      onKeyPress={(e) => CUTIL.beforeHandleComment(e, 100)}
                      onKeyUp={(e) => CUTIL.afterHandleComment(e, 100, setSubject)}
                      onChange={(e) => handlesSubject(e)}
                      className={`${(errorList.filter(err => (err.field === "subject")).length > 0) && " input-error"}`}
                    />
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "subject")).map((err) => err.msg)}</p>
                  </div>
                </li>
                <li>
                  <p className="tit star">문의 유형</p>
                  <div className="input__area">
                    <div className={`select ${(errorList.filter(err => (err.field === "consultType")).length > 0) && " input-error"}`} onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                      <div className="selected">
                        <div className="selected-value">선택</div>
                        <div className="arrow"></div>
                      </div>
                      <ul>
                        {(malfunctionItem) && malfunctionItem.map((type, idx) => (
                          <li key={"malfunction_" + idx.toString()} className="option" onClick={(e) => malfunctionSelect(type)}>{type.fnName}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
                <li>
                  <p className="tit">이름</p>
                  <div className="input__area">
                    <input readOnly type="text" value={userItem.userName} disabled />
                  </div>
                </li>
                <li>
                  <p className="tit">E-MAIL</p>
                  <div className="input__area">
                    <input readOnly type="text" value={userItem.userId} disabled />
                  </div>
                </li>
                <li>
                  <p className="tit">연락처</p>
                  <div className="input__area">
                    <input readOnly type="text" value={userItem.phoneNumber} disabled />
                  </div>
                </li>
                {/*   <li>
                  <p className="tit">진행사항 안내</p>
                  <div className="input__area">
                    <ul className="checkBox">
                      <li>
                        <input readOnly type="checkbox" id="chk1" name="chklist" checked={agreeMailReceipt} onChange={(e) => setAgreeMailReceipt(!agreeMailReceipt)} />
                        <label htmlFor="chk1">이메일 수신</label>
                      </li>
                      <li>
                        <input readOnly type="checkbox" id="chk2" name="chklist" checked={agreePortalAlarm} onChange={(e) => setAgreePortalAlarm(!agreePortalAlarm)} />
                        <label htmlFor="chk2">e-Health portal 알림</label>
                      </li>
                    </ul>
                  </div>
                </li> */}
                <li>
                  <p className="tit">내용</p>
                  <div className="input__area">
                    <textarea className={`h130 ${(errorList.filter((err) => (err.field == "content")).length > 0) ? "input-error" : ""} `} placeholder="텍스트를 입력하세요." value={content} onChange={(e) => handleContent(e)}></textarea>
                    {/* <p className="input-errortxt top-148">{errorList.filter((err) => (err.field == "content")).map((err) => (err.msg))}</p> */}
                    <p className="input-errortxt top-148">필수 입력 항목입니다.</p>

                  </div>
                </li>
                <li>
                  <p className="tit">첨부파일</p>
                  <div className="input__area">
                    <div className="filebox">
                      <input readOnly className="upload-name" placeholder="사진을 첨부하세요" />
                      <label onClick={(e) => handleFileUpload(e)}><span className="hide">파일찾기</span></label>
                      <input ref={fileRef} type="file" id="file"
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
                    <p className="txt-info mt-16 mb-0"> 첨부파일은 10개 이하, 전체 120M까지 가능합니다</p>
                    {/* <p className="txt-info">첨부파일은 JPG/GIF 이미지파일과 압축파일(zip, rar, arj)로 첨부해주시기 바랍니다.</p> */}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        }
        <div className="info__input">
          <div className="page-top">
            <h3>
              <span className="star">동의</span>
              <span className="txt-info"><span className="txt-red mr-4">*</span>필수 입력 사항</span>
            </h3>
          </div>
          <div className="content__info">
            <ul className="form__input">
              <li className="column">
                <p className="tit mt-0">'개인정보 처리 방침' 공지 및 '개인정보 처리 방침' 에 동의하십니까?</p>
                <div className="input__area">
                  <ul className="terms">
                    <li className="mb-0">
                      <div className="box-scroll">
                        <p className="txt">
                          [개인정보 처리방침 개요]
                          <br /><br />
                          LS ELECTRIC은 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 준수하여야 할 관련 법규상의 개인정보보호규정을 준수하며, 개인정보보호법 제30조, 정보통신망이용촉진 및 정보보호에 관한 법률 제27조의2에 따라 고객의 개인정보 보호 및 권익을 보호하고
                          개인정보와 관련한 고객의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 제정하고 이를 준수하고 있습니다.
                          <br /><br />
                          - LS ELECTRIC은 개인정보처리방침을 LS ELECTRIC 홈페이지(http://www.ls-electric.com)
                        </p>
                      </div>
                    </li>
                    <li>
                      <div className="input__area mt-8 txt-right">
                        <div className="radioBox">
                          <label htmlFor="rd1"><input type="radio" id="rd1" name="rd" value={"true"} checked={(agreePersonalInfoSel == "true") ? true : false} onChange={(e) => handleAgreePersonalInfoSelSel(e)} />동의</label>
                          <label htmlFor="rd2"><input type="radio" id="rd2" name="rd" value={"false"} checked={(agreePersonalInfoSel == "false") ? true : false} onChange={(e) => handleAgreePersonalInfoSelSel(e)} />동의하지 않습니다.</label>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="mt-80">
                <div className="btn__wrap right w100p">
                  {/* <button type="button" className="bg-gray js-open" data-pop="pop-cancel"><span>취소</span></button> */}
                  {(agreePersonalInfoSel == "true") ?
                    <button type="button" className=" js-open" data-pop="pop-small" onClick={(e) => CUTIL.jsopen_Popup(e)}><span data-pop="pop-small">요청</span></button>
                    :
                    <button type="button" className=" js-open" data-pop="pop-small" onClick={(e) => disagreePop(e)}><span data-pop="pop-small">요청</span></button>
                  }
                </div>
              </li>
            </ul>
          </div>
        </div>
        <ul className="box__info nobg mt-90 d-sm-block">
          <li>e-Health Portal 이용 중에 생긴 불편한 점이나 문의사항을 보내주세요. 궁금하신 점을 남겨주시면 최초 접수된 문의 건부터 순차적으로 답변을 받으실 수 있습니다.</li>
          <li>이메일 상담은 실시간 상담이 아니며, 상담이 집중될 경우 답변이 지연될 수 있습니다.</li>
          <li>네트워크 장애 등으로 내용 저장이 안 될 수 있으니 메모장 등에서 작성하여 등록해 주시기 바랍니다.</li>
        </ul>
      </div>

    </>
  )
}

export default InquiryView;


function RequestDoenPop(props) {
  // recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //props

  const success = props.success;
  const requestSaved = props.requestSaved;
  const requestDone = props.requestDone;
  const data = (props.data == null) ? null : props.data;


  const [userItem, setUserItem] = useState(null);

  useEffect(() => {
    setUserItem((data) && data.body);
  }, [(data) && data.body])

  return (
    <>
      <div className="popup__body">
        <p>{(success) ? "저장 되었습니다." : "이메일 상담 문의를  하시겠습니까?"}</p>
      </div>
      <div className="popup__footer">
        {(!success) &&
          <button type="button" className="bg-gray js-close" onClick={(e) => close(e)}><span>취소</span></button>
        }
        {(!success) ?
          <button type="button" onClick={(e) => requestSaved(e, userItem)}><span>확인</span></button>
          :
          <button type="button" onClick={(e) => requestDone(e)}><span>확인</span></button>
        }
      </div>
    </>
  )
}

function DisagreePop(props) {
  // recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //props

  const success = props.success;
  const requestSaved = props.requestSaved;
  const requestDone = props.requestDone;




  return (
    <>
      <div className="popup__body">
        <p>개인정보 처리 방침을 동의 후 요청 하세요</p>
      </div>
      <div className="popup__footer">

        <button type="button" onClick={(e) => close(e)}><span>확인</span></button>
      </div>
    </>
  )
}

function close(e) {
  var btnCommentClose = document.getElementById("pop-small");
  var body = document.body
  var dimm = body.querySelector(".dimm");

  if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
  if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
  if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");


}

