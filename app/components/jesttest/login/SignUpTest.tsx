/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved.
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-06-08
 * @brief EHP 회원가입 화면 컴포넌트
 *
 ********************************************************************/

import React, { useState, useEffect, useRef } from "react";
import { useAsync } from "react-async";
import { useRecoilValue, useSetRecoilState } from "recoil";
// design
import styled from "styled-components";
import $ from "jquery";
import "/static/css/login.css";
// recoil
import { langState } from "../../../recoil/langState";
import { userInfoState, authState } from "../../../recoil/userState";
// utils
import { useTrans } from "../../../utils/langs/useTrans";
import * as i18n from "../../../utils/langs/i18nUtils";
import * as HttpUtil from "../../../utils/api/HttpUtil";
import clog from "../../../utils/logUtils";
/**
 * @brief EHP 회원가입 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function SignUp() {
  // use recoil
  const setRecoilLangs = useSetRecoilState(langState); // recoil langState
  //---------------------------
  const setRecoilUserInfo = useSetRecoilState(userInfoState); // recoil userState
  //
  const isAuth = useRecoilValue(authState);
  //ERROR
  const [resErrorCode, setResErrorCode] = useState(200);
  const [resErrorMsg, setResErrorMsg] = useState([{ field: "", msg: "" }]);
  const [resUserIdMsg, setResUserIdMsg] = useState("");
  const [resPasswordMsg, setResPasswordMsg] = useState("");
  const [resConfirmPasswordMsg, setResConfirmPasswordMsg] = useState("");
  const [resUserNameMsg, setResUserNameMsg] = useState("");
  const [resPhoneNumberMsg, setResPhoneNumberMsg] = useState("");
  const [resCompanyNameMsg, setResCompanyNameMsg] = useState("");
  const [resZoneNameMsg, setResZoneNameMsg] = useState("");
  const [resAgreeTos, setResAgreeTos] = useState(false);
  const [resAgreePersonalInfo, setResAgreePersonalInfo] = useState("");
  const [resAgreeData, setResAgreeData] = useState("");

  // upadata
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [department, setDepartment] = useState("");
  const [agreeTos, setAgreeTos] = useState(false);
  const [agreePersonalInfo, setAgreePersonalInfo] = useState(false);
  const [agreeData, setAgreeData] = useState(false);
  const [agreeMailReceipt, setAgreeMailReceipt] = useState(false);

  const strAgreeTos = agreeTos ? "true" : "false";
  const strAgreePersonalInfo = agreePersonalInfo ? "true" : "false";
  const strAgreeData = agreeData ? "true" : "false";
  const strAgreeMailReceipt = agreeMailReceipt ? "true" : "false";

  const [companyItem, setCompanyItem] = useState([]);
  const [zoneItem, setZoneItem] = useState([]);
  let [com, setCom] = useState([]);

  const { data: data, run } = useAsync({
    //promiseFn: HttpUtil.getUsers,
    deferFn: HttpUtil.Http,
    httpMethod: "POST",
    appPath: "/api/v2/user",
    appQuery: {
      userId: userId,
      password: password,
      userName: userName,
      phoneNumber: phoneNumber,
      companyName: companyName,
      zoneName: zoneName,
      department: department,
      agreeTos: strAgreeTos,
      agreePersonalInfo: strAgreePersonalInfo,
      agreeData: strAgreeData,
      agreeMailReceipt: strAgreeMailReceipt,
    },
  });

  useEffect(() => {
    let errL = "";
    if (data) {
      clog("IN SignUp : ERROR CODE : " + data.codeNum);

      if (
        (password == "" && confirmPassword == "") ||
        password !== confirmPassword ||
        (password != "" && confirmPassword == "")
      ) {
        $("#confirmPassword").addClass("input-error");
        if (
          (password == "" && confirmPassword == "") ||
          (password != "" && confirmPassword == "")
        ) {
          $("#confText").addClass("input-errortxt").text("필수 항목입니다.");
        } else if (confirmPassword != "" && password == "") {
          $("#confText")
            .addClass("input-errortxt")
            .text("동일한 비밀번호를 입력 해주세요.");
        }
        clog("!@#######");

      }
      if (data.codeNum == 200) {
        if (
          (password == "" && confirmPassword == "") ||
          password !== confirmPassword ||
          (password != "" && confirmPassword == "")
        ) {
          $("#confirmPassword").addClass("input-error");
          if (
            (password == "" && confirmPassword == "") ||
            (password != "" && confirmPassword == "")
          ) {
            $("#confText").addClass("input-errortxt").text("필수 항목입니다.");
          } else if (confirmPassword != "" && password == "") {
            $("#confText")
              .addClass("input-errortxt")
              .text("동일한 비밀번호를 입력 해주세요.");
          }
          clog("!@###");

        }
        //
      } else {
        clog("error kkkkkkkkkkkk");
        setResErrorCode(data.codeNum);
        setResErrorMsg(data.errorList);
        setResUserIdMsg("");
        setResPasswordMsg("");
        setResConfirmPasswordMsg("");
        setResUserNameMsg("");
        setResPhoneNumberMsg("");
        setResCompanyNameMsg("");
        setResZoneNameMsg("");
        setResAgreeTos(false);
        setResAgreePersonalInfo("");
        setResAgreeData("");

        data.errorList.map((errMsg) => {
          errMsg.field === "userId" && setResUserIdMsg(errMsg.msg);
          errMsg.field === "password" && setResPasswordMsg(errMsg.msg);
          errMsg.field === "confirmPassword" &&
            setResConfirmPasswordMsg(errMsg.msg);
          errMsg.field === "userName" && setResUserNameMsg(errMsg.msg);
          errMsg.field === "phoneNumber" && setResPhoneNumberMsg(errMsg.msg);
          errMsg.field === "companyName" && setResCompanyNameMsg(errMsg.msg);
          errMsg.field === "zoneName" && setResZoneNameMsg(errMsg.msg);
          errMsg.field === "agreeTos" && setResAgreeTos(true);
          errMsg.field === "agreePersonalInfo" &&
            setResAgreePersonalInfo(errMsg.msg);
          errMsg.field === "agreeData" && setResAgreeData(errMsg.msg);
        });
      }
    }
  }, [data]);

  const layerList = ["findId", "findPw", "join", "join-ok"];

  const [suUserName, setSuUserName] = useState("");
  // 다국어 설정 변경 및 recoil 상태 변경
  async function exchgLanguage(e, lang: string) {
    // $(".navbar__menu li.active ul li").removeClass("active");
    $(".select-lang button.btn.btn-txt").removeClass("on");
    var tmpTag = e.target.tagName == "BUTTON" ? e.target : e.currentTarget;
    clog("login comp : exchange : " + tmpTag.tagName);
    tmpTag.className = "btn btn-txt on";

    await i18n.changeLang(lang);
    setRecoilLangs(lang);
  }

  function onClickCancel() {
    setResErrorCode(200);
    setUserId("");
    setPassword("");
    setConfirmPassword("");
    setUserName("");
    setPhoneNumber("");
    setCompanyName("");
    setZoneName("");
    setDepartment("");
    setAgreeTos(false);
    setAgreePersonalInfo(false);
    setAgreeData(false);
    setAgreeMailReceipt(false);
    setResUserIdMsg("");
    setResPasswordMsg("");
    setResConfirmPasswordMsg("");
    setResUserNameMsg("");
    setResPhoneNumberMsg("");
    setResCompanyNameMsg("");
    setResZoneNameMsg("");

    layerList.map((olayer) => {
      layerClose(olayer);
    });
    $("#confirmPassword").removeClass();
  }

  function layerClose(tagId) {
    var othLayer = tagId;
    //닫기 버튼 , 배경 클릭 시
    // $("#" + othLayer)
    //   .children()
    //   .children(".js-close")
    //   .trigger("click", function (ee) {
    //     $("#" + othLayer).addClass("hidden"); //모든 팝업 감추기
    //     $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
    //   });
    // //제일 바깥쪽 팝업을 닫았을때만 배경 감추기 (팝업안에 팝업이 또 있는 경우는 배경 살림)
    // $("#" + othLayer + ".layer-out")
    //   .children()
    //   .children(".js-close")
    //   .on("click", function (ee) {
    //     $(".dimm").stop().hide().css("z-index", "11");
    //   });
  }
  function layerOpen(e) {
    e.preventDefault();
    var actTag = e.target.tagName == "BUTTON" ? e.target : e.currentTarget;
    var activeLayer = actTag.getAttribute("data-pop");
    //var activeLayer = $(this).attr("data-pop");
    // close other layer
    layerList.map((olayer) => {
      layerClose(olayer);
    });

    // 레이어 팝업 화면 가운데 정렬
    $("#" + activeLayer + ".popup-layer").css("position", "absolute");
    $("#" + activeLayer + ".popup-layer").css(
      "top",
      ($(window).height() - $("#" + activeLayer).outerHeight()) / 2 +
      $(window).scrollTop() +
      "px"
    );
    $("#" + activeLayer + ".popup-layer").css(
      "left",
      ($(window).width() - $("#" + activeLayer).outerWidth()) / 2 +
      $(window).scrollLeft() +
      "px"
    );

    // $(".popup-layer").addClass("hidden"); //모든 팝업 감추기(팝업안에 팝업이 또 있을때는 해당 안됨)
    $("#" + activeLayer).removeClass("hidden"); //호출한 팝업만 부르기
    $(".dimm").stop().show().css("z-index", "30"); //배경 가져오기
    $("body").css("overflow-y", "hidden"); //body 스크롤 숨기기(화면고정)

    //닫기 버튼 , 배경 클릭 시
    $("#" + activeLayer)
      .children()
      .children(".js-close")
      .on("click", function (ee) {
        $("#" + activeLayer).addClass("hidden"); //모든 팝업 감추기
        $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
      });

    //제일 바깥쪽 팝업을 닫았을때만 배경 감추기 (팝업안에 팝업이 또 있는 경우는 배경 살림)
    $("#" + activeLayer + ".layer-out")
      .children()
      .children(".js-close")
      .on("click", function (ee) {
        $(".dimm").stop().hide().css("z-index", "11");
      });
  }

  // select active 액션
  function toggleSelectBox(selectBox) {
    selectBox.classList.toggle("active");
  }

  // option 선택 시  값 변경 액션
  function selectOption(optionElement) {
    const selectBox = optionElement.closest(".select");
    //option 값 selected-value 로 변경
    const selectedElement = selectBox.querySelector(".selected-value ");
    selectedElement.textContent = optionElement.textContent;
    // by sjpark
    //selectedElement.textContent = optionElement.textContent;
    clog("OPT VAL : " + optionElement.value);
    //clog("OPT VAL : " + optionElement.getAttribute("data-value"));
    selectedElement.setAttribute(
      "data-value",
      optionElement.getAttribute("data-value")
    );
  }

  async function onClickSelect1(e) {
    const selectBoxElement = e.currentTarget;
    const targetElement = e.target;
    const isOptionElement = targetElement.classList.contains("option");
    if (isOptionElement) {
      selectOption(targetElement);
    }
    toggleSelectBox(selectBoxElement);
    clog("!!");
    //회사 이름 API
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      httpMethod: "GET",
      appPath: "/api/v2/companies",
    });
    clog(data);
    setCompanyItem(data.body);
  }

  function onClickSelect2(e) {
    const selectBoxElement = e.currentTarget;
    const targetElement = e.target;
    const isOptionElement = targetElement.classList.contains("option");
    if (isOptionElement) {
      selectOption(targetElement);
    }
    toggleSelectBox(selectBoxElement);
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //회사 선택 시 사업장 API 연계까지
  async function companyClick(e) {
    var comTag = e.target.tagName == "LI" ? e.target : e.currentTarget;
    var zValue = comTag.getAttribute("data-value");
    // companyId 값 받아오기
    var com = comTag.getAttribute("data-id");
    let appPath = "companyId=" + com;
    let zone: any = null;
    zone = await HttpUtil.PromiseHttp({
      httpMethod: "GET",
      appPath: "/api/v2/product/zones?" + appPath,
    });
    setZoneItem(zone.body);
    setCompanyName(zValue);
    clog(zValue);
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  async function zoneClick(e) {
    var comTag = e.target.tagName == "LI" ? e.target : e.currentTarget;
    var zValue = comTag.getAttribute("data-value");
    // companyId 값 받아오기

    setZoneName(zValue);
    clog(zValue);
  }

  const [checkedInputs, setCheckedInputs] = useState([]);
  const changeHandler = (checked, id) => {
    if (checked == true) {
      setCheckedInputs([...checkedInputs, id]);
    } else {
      // 체크 해제
      setCheckedInputs(checkedInputs.filter((el) => el !== id));
    }
  };

  //직접입력 시니리오
  function replaceCpText(e) {
    console.log("회사명 직접입력을 선택함");
    const transCompanyInput = document.getElementById("companyInput");
    console.log("zzzzz");

    transCompanyInput.innerHTML =
      `<input type='text' id='companyName' placeholder='회사 이름을 입력해주세요' name="cpname" data-value=` +
      setCompanyName(e.target.value) +
      ` />`;

    const transZoneInput = document.getElementById("zoneInput");
    transZoneInput.innerHTML =
      `<input type="text" id="znTextInput1" placeholder="사업장 이름을 입력해주세요" data-value=` +
      setZoneName(e.target.value) +
      ` />`;
  }

  function replaceZnText(e) {
    console.log("사업장 직접입력을 선택함");
    const transZoneInput = document.getElementById("zoneInput");
    transZoneInput.innerHTML =
      `<input type="text" id="znTextInput1" placeholder="사업장 이름을 입력해주세요" data-value=` +
      setZoneName(e.target.value) +
      ` />`;
  }

  /* function replaceText(e) {
    const transCompanyInput = document.getElementById("companyInput");
    const transZoneInput = document.getElementById("zoneInput");
 
    transCompanyInput.innerHTML = `<input type="text"id='' placeholder="회사 이름을 입력해주세요" />`;
    transZoneInput.innerHTML = `<input type="text"  placeholder="사업장 이름을 입력해주세요" />`;
 
    // clog(e.tagId)
  } */

  /*  const savedCallback:any = useRef();
   useEffect(() => {
     savedCallback.current = onClickSettingPutCallback;
   });
 
   async function onClickSettingPutCallback(e, putPeriod) {
     //alert("selected-data : " + selectedPeriod);
     let data:any = null;
     data = await HttpUtil.PromiseHttp({
       "httpMethod" : "PUT", 
       "appPath" : "/api/v2/item/status/period", 
       "appQuery" : {
         companyId: company.companyId,
         zoneId: zone.zoneId,
         roomId: room.roomId,
         spgId: spg.spgId,
         //period: selectedPeriod
         period : putPeriod
       },
       userToken : userInfo.userInfo.token,
     });
     if (data) {
       if ( data.codeNum == 200 ) {
         clog("IN STATUS : PUT PERIOD CALLBACK : " + JSON.stringify(data));
       } else { // api if
         // need error handle
       }
     }
     //return data;
   } */

  return (
    <>
      <div id="join" className="popup-layer js-layer layer-out hidden w560">
        {" "}
        {/*<!-- layer-out 클래스 : 팝업 안에 팝업일 경우는 생략 / w560 클래스 : 팝업 사이즈 -->*/}
        <div className="popup__head">
          <h1>회원가입</h1>
          <button
            role="cancelbutton1"
            className="btn btn-close js-close"
            onClick={(e) => onClickCancel()}
          >
            <span className="hide">닫기</span>
          </button>
        </div>
        <div className="popup__body">
          <form action="" method="" name="popjoin">
            <ul className="form__input mt-9">
              <li>
                <label htmlFor="userId2" className="star">
                  E-mail (아이디)
                </label>
                <div className="input__area">
                  <input
                    data-testid="testId"
                    type="text"
                    id="userId"
                    placeholder="ex) abc@company.com"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className={resUserIdMsg.length <= 0 ? "" : "input-error"}
                  />
                  {/* <p className="input-errortxt">이미 존재하는 메일 주소입니다.</p> */}
                  <p className="input-errortxt">{resUserIdMsg}</p>
                </div>
              </li>

              <li>
                <label htmlFor="userpw" className="star">
                  비밀번호
                </label>
                <div className="input__area">
                  <input
                    data-testid="testPassword"
                    type="text"
                    id="password"
                    placeholder="ex) 10~16자 텍스트, 영문/숫자/특수문자  포함"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={resPasswordMsg.length <= 0 ? "" : "input-error"}
                  />
                  {/* <p className="input-errortxt">10~16자 텍스트, 영문 / 숫자를 포함하여 입력해 주세요.</p> */}
                  <p className="input-errortxt">{resPasswordMsg}</p>
                </div>
              </li>

              <li>
                <label htmlFor="userpw2" className="star">
                  비밀번호 확인
                </label>
                <div className="input__area">
                  <input
                    data-testid="passwordConfirm"
                    type="text"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={
                      resConfirmPasswordMsg.length <= 0 ? "" : "input-error"
                    }
                  />
                  {/* <p className="input-errortxt">10~16자 텍스트, 영문 / 숫자를 포함하여 입력해 주세요.</p> */}
                  {/* {(password != confirmPassword) && <p className="input-errortxt">비밀번호가 다릅니다</p>}
                     {(confirmPassword == '') && <p className="input-errortxt">필수 항목입니다.</p>} */}
                  <p id="confText" className="input-errortxt"></p>
                </div>
              </li>

              <li>
                <label htmlFor="username3" className="star">
                  이름
                </label>
                <div className="input__area">
                  <input
                    data-testid="testName"
                    type="text"
                    id="userName"
                    placeholder="이름을 입력하세요"
                    // className="input-error"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className={resUserNameMsg.length <= 0 ? "" : "input-error"}
                  />
                  {/* <p className="input-errortxt">필수 입력 항목입니다.</p> */}
                  <p className="input-errortxt">{resUserNameMsg}</p>
                </div>
              </li>

              {/*<input type="tel" id="userphone2" telOnly="true" placeholder="숫자만 입력하세요" value="숫자만 입력하세요" className="input-error" />
             <!--telOnly="true" 숫자만 입력할때-->*/}
              <li>
                <label htmlFor="userphone2" className="star">
                  연락처
                </label>
                <div className="input__area">
                  <input
                    data-testid="testPhone"
                    type="text"
                    id="phoneNumber"
                    placeholder="숫자만 입력하세요"
                    // value="숫자만 입력하세요" className="input-error"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={
                      resPhoneNumberMsg.length <= 0 ? "" : "input-error"
                    }
                  />
                  <p className="input-errortxt">{resPhoneNumberMsg}</p>
                </div>
              </li>

              <li>
                <label htmlFor="userId2" className="star">
                  회사
                </label>
                <div id="companyInput" className="input__area ">
                  {/*                     
                   <input type="text"
                      value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                      className={(resCompanyNameMsg.length <= 0) ? "" : "input-error"}
                    />  
                    */}

                  {/* <p className="input-errortxt">10~16자 텍스트, 영문 / 숫자를 포함하여 입력해 주세요.</p> 
                    <p className="input-errortxt">{resCompanyNameMsg}</p>*/}
                  {/*<!-- disabled 일 경우, 클래스에 disabled 추가하면 컬러 변경됩니다. -->*/}
                  <div className="select" onClick={(e) => onClickSelect1(e)}>
                    <div className="selected ">
                      <div className="selected-value">회사를 선택하시오.</div>
                      <div className="arrow"></div>
                    </div>
                    <ul>
                      {companyItem.map((company) => (
                        <li
                          data-testid="testCom"
                          className="option"
                          data-value={company.companyName}
                          data-id={company.companyId}
                          id="companyName"
                          key={company.companyId}
                          onClick={(e) => companyClick(e)}
                        >
                          {company.companyName}
                        </li>
                      ))}
                      {/* 
                        <li className="option">option 1</li>
                        <li className="option">option 2</li>
                        <li className="option">option 3</li>
                        <li className="option">loooooooooooooooooong text option</li>
                         */}
                      <li className="option" onClick={(e) => replaceCpText(e)}>
                        직접 입력
                      </li>
                    </ul>
                  </div>
                  <p className="input-errortxt">필수 입력 항목입니다.</p>
                </div>
              </li>

              <li>
                <label htmlFor="userId2" className="star">
                  사업장
                </label>
                <div id="zoneInput" className="input__area">
                  {/*                   <input type="text" id="zoneName" placeholder="숫자만 입력하세요"
                      // value="숫자만 입력하세요" className="input-error"
                      value={zoneName} onChange={(e) => setZoneName(e.target.value)}
                      className={(resZoneNameMsg.length <= 0) ? "" : "input-error"}
  
                    /> */}
                  <p className="input-errortxt">{resZoneNameMsg}</p>
                  {/*<!-- disabled 일 경우, 클래스에 disabled 추가하면 컬러 변경됩니다. -->*/}
                  <div className="select" onClick={(e) => onClickSelect2(e)}>
                    <div className="selected">
                      <div className="selected-value">사업장을 선택하시오.</div>
                      <div className="arrow"></div>
                    </div>
                    <ul>
                      {companyItem &&
                        zoneItem.map((zone) => (
                          <li
                            data-testid="testZone"
                            className="option"
                            id="zoneName"
                            key={zone.id}
                            data-value={zone.zoneName}
                            onClick={(e) => zoneClick(e)}
                          >
                            {zone.zoneName}{" "}
                          </li>
                        ))}
                      {/* <li className="option">option 1</li>
                          <li className="option">option 2</li>
                          <li className="option">option 3</li>
                          <li className="option">loooooooooooooooooong text option</li>
                          */}
                      <li className="option" onClick={(e) => replaceZnText(e)}>
                        직접 입력
                      </li>
                      {/* <li className="option" onClick={(e) => replaceText2(e)} >직접 입력</li> */}
                    </ul>
                  </div>
                  <p className="input-errortxt">필수 입력 항목입니다.</p>
                </div>
              </li>

              <li>
                <label htmlFor="part">부서</label>
                <div className="input__area">
                  <input
                    type="text"
                    id="part"
                    placeholder="ex) 기술팀"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
              </li>

              <li>
                <ul className="checkBox column mt-8">
                  <li>
                    <input
                      data-testid="check0"
                      type="checkbox"
                      id="agreeall"
                      name="agreeall"
                      checked={
                        agreeTos ||
                        agreePersonalInfo ||
                        agreeData ||
                        agreeMailReceipt
                      }
                      onChange={(e) => {
                        setAgreeTos(!agreeTos),
                          setAgreePersonalInfo(!agreePersonalInfo),
                          setAgreeData(!agreeData),
                          setAgreeMailReceipt(!agreePersonalInfo);
                      }}
                    />
                    <label htmlFor="agreeall">
                      <strong>
                        e-Health Portal 시스템 관련 이용약관, 개인 정보
                        처리방침, 데이터의 수집 이용 및 제공, 메일 수신(선택)에
                        모두 동의합니다.
                      </strong>{" "}
                    </label>
                  </li>
                  <li className="ml-50">
                    <input
                      data-testid="check1"
                      type="checkbox"
                      id="agree1"
                      name="joinagree"
                      checked={agreeTos}
                      onChange={(e) => setAgreeTos(!agreeTos)}
                      className="input-error"
                    />
                    <label htmlFor="agree1">
                      (필수) 시스템 이용약관
                      <button
                        type="button"
                        className="btn btn-txt ml-8 js-open"
                        data-pop="join-terms"
                        onClick={(e) => layerOpen(e)}
                      >
                        <span className="txtline">이용약관</span>
                      </button>
                    </label>
                  </li>
                  <li className="ml-50">
                    <input
                      data-testid="check2"
                      type="checkbox"
                      id="agree2"
                      name="joinagree"
                      checked={agreePersonalInfo}
                      onChange={(e) => setAgreePersonalInfo(!agreePersonalInfo)}
                    />
                    <label htmlFor="agree2">
                      (필수) 개인 정보 처리방침
                      <button
                        type="button"
                        className="btn btn-txt ml-8 js-open"
                        data-pop="join-terms"
                        onClick={(e) => layerOpen(e)}
                      >
                        <span className="txtline">이용약관</span>
                      </button>
                    </label>
                  </li>
                  <li className="ml-50">
                    <input
                      data-testid="check3"
                      type="checkbox"
                      id="agree3"
                      name="joinagree"
                      checked={agreeData}
                      onChange={(e) => setAgreeData(!agreeData)}
                    />
                    <label htmlFor="agree3">
                      (필수) 데이터 수집 및 이용 동의
                      <button
                        type="button"
                        className="btn btn-txt ml-8 js-open"
                        data-pop="join-terms"
                        onClick={(e) => layerOpen(e)}
                      >
                        <span className="txtline">이용약관</span>
                      </button>
                    </label>
                  </li>
                  <li className="ml-50">
                    <input
                      data-testid="check4"
                      type="checkbox"
                      id="agree4"
                      name="joinagree"
                      checked={agreeMailReceipt}
                      onChange={(e) => setAgreeMailReceipt(!agreePersonalInfo)}
                    />
                    <label htmlFor="agree4">
                      (선택) 메일 수신 동의
                      <p className="txt-lightgray fontRegular mt-3">
                        수신 동의 시 LS ELECTRIC 뉴스레터를 메일로 보내드립니다.
                      </p>
                    </label>
                  </li>
                </ul>
              </li>
            </ul>
          </form>
        </div>
        <div className="popup__footer">
          <button
            role="cancelbutton2"
            type="button"
            className="js-close bg-gray"
            onClick={(e) => onClickCancel()}
          >
            <span>취소</span>
          </button>
          {
            <button
              data-testid="signButton"
              role="button"
              type="button"
              className="js-open"
              data-pop="join-ok"
              onClick={run}
            //onClick={(e) => layerOpen(e)}
            >
              <span>가입</span>
            </button>
          }
        </div>
      </div>
      {/*<!-- 회원가입_이용약관 팝업 -->*/}
      <TermService />

      {/*<!-- 회원가입 완료 팝업 -->*/}
      <SignUpDone />
    </>
  );
}
export default SignUp;

function TermService() {
  return (
    <>
      {/*<!-- 회원가입_이용약관 팝업 -->*/}
      <div id="join-terms" className="popup-layer js-layer hidden w560">
        {" "}
        {/*<!-- layer-out 클래스 : 팝업 안에 팝업일 경우는 생략되었음 -->*/}
        <div className="popup__head">
          <h1>이용약관</h1>
          <button className="btn btn-close js-close">
            <span className="hide">닫기</span>
          </button>
        </div>
        <div className="popup__body">
          <ul className="terms">
            <li>
              <p className="terms__tit">시스템 이용약관</p>
              <div className="box-scroll">
                <p className="renewday">개정일 2021.10.20</p>
                <p className="tit">[제 1장 총칙]</p>
                <p className="tit-middle">제 1조 목적</p>
                <p className="txt">
                  이 약관은 LS ELECTRIC(이하 "회사") e-Health Checker 시스템에서
                  제공하는 모든 서비스의 이용조건 및 절차에 관한 사항과 기타
                  필요한 사항을 전기통신사업법 및 동법 시행령이 정하는 대로
                  준수하고 규정함을 목적으로 합니다.
                </p>
                <p className="tit-middle">제 2조 정의</p>
                <p className="txt">
                  "이용자"라 함은 시스템에 접속하여 이 약관에 따라 시스템이
                  제공하는 서비스를 받는 회원 및 비회원을 말합니다. "회원"이라
                  함은 웹페이지에 개인정보를 제공하여 회원등록을 한 자로서,
                  시스템의 정보를 지속적으로 제공 받으며, 시스템이 제공하는
                  서비스를 계속적으로 이용할 수 있는 자를 말합니다. "비회원"이라
                  함은 회원에 가입하지 않고 e-Health Checker 시스템에서 제공하는
                  서비스를 이용하는 자를 말합니다.
                </p>
                <p className="tit-middle">제 3조 약관의 효력과 변경</p>
                <p className="txt">
                  이 약관은 회사 e-Health Checker 시스템의 초기 서비스 화면에
                  이용자에게 공시함으로써 효력이 발생합니다. 회사는 사정 변경의
                  경우와 영업상 중요 사유가 있을 때 약관의 규제 등에 관한 법률
                  등 관련법을 위반하지 않는 범위에서 이 약관을 변경할 수 있으며,
                  이 경우에는 적용일자 및 개정사유, 변경되는 내용을 명시하여
                  현행 약관과 함께 초기 서비스 화면에 그 적용일자 7일전부터
                  적용일자 전일까지 공지합니다.
                </p>
                <p className="tit-middle">제 4조 약관 외 준칙</p>
                <p className="txt">
                  이 약관에 명시되지 않은 사항이 관계 법령에 규정되어 있을
                  경우에는 그 규정에 따릅니다.
                </p>
                <p className="tit">[제 2장 회원 가입 및 서비스 이용]</p>
                <p className="tit-middle">제 1조 서비스 이용 계약의 성립</p>
                <p className="txt">
                  회사 e-Health Checker 시스템상 서비스 이용 계약은 이용자가
                  회원 가입에 따른 서비스 이용 신청에 대한 회사의 이용 승낙과
                  이용자의 이 약관에 동의한다는 의사표시로 성립됩니다. 이용자가
                  회원에 가입하여 회사 e-Health Checker 시스템상 서비스를
                  이용하고자 하는 경우, 회원은 회사에서 요청하는 개인 신상정보를
                  제공해야 합니다. 이용자의 회사 e-Health Checker 시스템상
                  서비스 이용신청에 대하여 회사가 승낙한 경우, 회사는 회원
                  이메일과 기타 회사가 필요하다고 인정하는 내용을 이용자에게
                  통지합니다.
                </p>
                <p className="txt mt10">
                  회사는 다음에 해당하는 서비스 이용 신청에 대하여는 이를
                  승낙하지 아니합니다.
                </p>
                <p className="txt mt10">
                  1. 다른 사람의 명의를 사용하여 신청하였을 때<br />
                  2. 본인의 실명으로 신청하지 않았을 때<br />
                  3. 서비스 이용 계약 신청서의 내용을 허위로 기재하였을 때<br />
                  4. 사회의 안녕과 질서 혹은 미풍양속을 저해할 목적으로
                  신청하였을 때
                </p>
                <p className="tit-middle">제 2조 서비스 이용 및 제한</p>
                <p className="txt">
                  회사 e-Health Checker 시스템상 서비스 이용은 회사의 업무상
                  또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간을
                  원칙으로 합니다. 전항의 서비스 이용시간은 정보통신 시스템 등
                  정기점검/교체 등 e-Health Checker가 필요한 경우, 회원에게 사전
                  통지한 후, 제한할 수 있습니다. 서비스 중단의 경우에는 회사는
                  회원이 회사e-Health Checker 시스템에 제출한 전자우편 주소로
                  개별 통지하거나, 불특정다수 회원에 대하여는 1주일 이상
                  게시판에 게시함으로써 개별 통지에 갈음할 수 있습니다.
                </p>
                <p className="tit">[제 3장 의무]</p>
                <p className="tit-middle">제 1조 회사의 의무</p>
                <p className="txt">
                  회사는 특별한 사정이 없는 한 회원이 신청한 서비스 제공
                  개시일에 서비스를 이용할 수 있도록 합니다. 회사는 이 약관에서
                  정한 바에 따라 계속적, 안정적으로 서비스를 제공할 의무가
                  있습니다. 회사는 회원으로부터 소정의 절차에 의해 제기되는
                  의견에 대해서는 적절한 절차를 거쳐 처리하며, 처리시 일정
                  기간이 소요될 경우 회원에게 그 사유와 처리 일정을 알려주어야
                  합니다. 회사는 회원의 정보를 철저히 보안 유지하며, 양질의
                  서비스를 운영하거나 개선하는 경우 또는 제품소개 등 회사 내부
                  목적으로 이용하는 데만 사용하고, 이외의 다른 목적으로 타 기관
                  및 제3자에게 양도하지 않습니다.
                </p>
                <p className="tit-middle">제 2조 회원의 의무</p>
                <p className="txt">
                  회원 이메일과 비밀번호에 관한 모든 관리의 책임은 회원에게
                  있습니다. 회원 이메일과 비밀번호를 제3자에게 이용하게 해서는
                  안됩니다. 회원 이메일과 비밀번호를 도난당 하거나 제3자가
                  사용하고 있음을 인지하는 경우에는 회원은 반드시 회사에 그
                  사실을 통보해야 합니다. 회원은 이 약관 및 관계 법령에서 규정한
                  사항을 준수하여야 합니다.
                </p>
                <p className="txt mt-10">
                  이용자는 개인 정보 입력 시 다음 행위를 하여서는 안됩니다.
                </p>
                <p className="txt mt-10">
                  1. 신청 또는 변경 시 허위내용의 등록
                  <br />
                  2. 회사 e-Health Checker 시스템이 정한 정보 이외의 정보(컴퓨터
                  프로그램 등)의 송신 또는 게시
                  <br />
                  3. 회사 e-Health Checker 시스템 기타 제3자의 저작권 등
                  지적재산권에 대한 침해
                  <br />
                  4. 회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위
                  <br />
                  5. 외설 또는 폭력적인 메시지, 화상, 음성 기타 공서양속에
                  반하는 정보를 공개 또는 게시하는 행위
                </p>
                <p className="tit">
                  [제 4장 서비스 이용 계약 해지 및 이용 제한]
                </p>
                <p className="tit-middle">
                  제 1조 서비스 이용 계약 해지 및 이용 제한
                </p>
                <p className="txt">
                  회원이 서비스 이용 계약을 해지하고자 하는 때에는 회원 정보
                  페이지에서 본인이 직접 계약을 해지할 수 있습니다.
                </p>
                <p className="txt mt-10">
                  회사는 회원이 다음 사항에 해당하는 행위를 하였을 경우, 사전
                  통지 없이 서비스 이용 계약을 해지하거나 또는 상당한 기간을
                  정하여 서비스 이용을 중지할 수 있습니다.
                </p>
                <p className="txt mt-10">
                  1. 공공 질서 및 미풍 양속에 반하는 경우
                  <br />
                  2. 범죄적 행위에 관련되는 경우
                  <br />
                  3. 국익 또는 사회적 공익을 저해할 목적으로 서비스 이용을 계획
                  또는 실행할 경우
                  <br />
                  4. 타인의 ID(이메일)을 도용한 경우
                  <br />
                  5. 타인의 명예를 손상시키거나 불이익을 주는 경우
                  <br />
                  6. 같은 사용자가 다른 ID(이메일)로 이중 등록을 한 경우
                  <br />
                  7. 서비스에 위해를 가하는 등 건전한 이용을 저해하는 경우
                  <br />
                  8. 기타 관련 법령이나 회사가 정한 이용조건에 위배되는 경우
                </p>
                <p className="tit-middle">
                  제 2조 서비스 이용 제한의 해제 절차
                </p>
                <p className="txt">
                  회사는 긴급하게 서비스 이용을 중지해야 할 필요가 있다고
                  인정하는 경우에 서비스 이용을 제한할 수 있습니다. 회사는
                  서비스 이용중지 기간 중에 그 이용중지 사유가 해소된 것이
                  확인된 경우에 한하여 이용중지 조치를 즉시 해제합니다.
                </p>
              </div>
            </li>
            <li>
              <p className="terms__tit">개인 정보 처리방침</p>
              <div className="box-scroll">
                <p className="renewday">개정일 2021.10.20</p>
                <p className="tit">총칙</p>
                <p className="txt">
                  LS ELECTRIC(이하 "회사")e-Health Checker 시스템은 이용자의
                  개인 정보를 보호하기 위하여 「정보통신망 이용 촉진 및 정보보호
                  등에 관한 법률」 및 「개인정보보호법」 등 관련 법령상의
                  개인정보 보호 규정을 준수하고 있으며 다음과 같은 개인정보 처리
                  방침을 가지고 있습니다.
                </p>
                <p className="txt mt-10">
                  회사는 개인정보 처리방침을 통하여 이용자의 개인정보가 어떠한
                  목적과 방식으로 수집, 이용되고 있으며, 이용자의 개인정보
                  보호를 위해 e-Health Checker가 어떠한 조치를 취하고 있는지
                  알려드립니다.
                </p>
                <p className="txt mt-10">
                  본 개인정보 처리 방침은 관련 법의 개정이나 회사의 정책에 따라
                  변경될 수 있으며, 회사는 e-Health Checker 시스템을 통하여 이를
                  알려드리오니, e-Health Checker 시스템 이용 시에 수시로
                  확인하여 주시기 바랍니다.
                </p>
                <p className="txt mt-10">
                  1. 개인정보의 처리 목적
                  <br />
                  2. 처리하는 개인정보의 항목
                  <br />
                  3. 개인정보의 수집방법
                  <br />
                  4. 개인정보의 처리 및 보유기간
                  <br />
                  5. 개인정보처리의 위탁에 관한 사항
                  <br />
                  6. 개인정보의 제3자 제공에 관한 사항
                  <br />
                  7. 개인정보의 파기에 관한 사항
                  <br />
                  8. 정보주체의 권리,의무 및 그 행사방법에 관한 사항
                  <br />
                  9. 개인정보의 안전성 확보 조치에 관한 사항
                  <br />
                  10. 쿠키에 의한 개인정보 수집
                  <br />
                  11. 개인정보 보호책임자에 관한 사항
                  <br />
                  12. 정보주체의 권익침해에 대한 구제 방법
                  <br />
                  13. 개인정보 처리방침의 변경에 관한 사항
                </p>
                <p className="tit-small">1. 개인정보의 처리 목적</p>
              </div>
            </li>
            <li>
              <p className="terms__tit">데이터 수집,이용 및 제3자 제공 동의</p>
              <div className="box-scroll">
                <p className="renewday">개정일 2021.12.01</p>
                <p className="tit-middle">[데이터의 수집 및 이용동의]</p>
                <p className="tit-small">1. 수집 및 이용 목적</p>
                <p className="txt dot">
                  e-Health Checker 시스템의 기능 개선 및 추가 등 신규개발을 위한
                  분석 및 연구
                </p>
                <p className="tit-small">2. 수집하는 데이터 항목(필수)</p>
                <p className="txt dot">
                  일반 정보 : 이름, 이메일, 전화번호(휴대폰 번호), 소속 및 지위
                  등
                </p>
                <p className="txt dot">
                  사업장 정보 : 사업장 주소지, 사고 이력 정보{" "}
                </p>
                <p className="txt dot">
                  전력 설비 정보 : 전력 설비 정보, 전력 및 센서 데이터,
                  알람/이벤트 데이터, 전력 설비 사진 등{" "}
                </p>
                <p className="tit-small">3. 보유 및 이용기간</p>
                <p className="txt dot">
                  5년, 단 관련법령에서 달리 정한 경우에는 해당 법령에 따르며,
                  정보 주체의 요청 시 지체없이 파기함
                </p>
                <p className="tit-middle">[데이터의 수집 및 이용동의]</p>
                <p className="tit-small">1. 제공목적</p>
                <p className="txt dot">
                  e-Health Checker 시스템의 기능 개선 및 추가 등 신규개발을 위한
                  분석 및 연구
                </p>
                <p className="tit-small">2. 제공하는 데이터 항목 (필수)</p>
                <p className="txt dot">
                  일반 정보 : 이름, 이메일, 전화번호(휴대폰 번호), 소속 및 지위
                  등{" "}
                </p>
                <p className="txt dot">
                  사업장 정보 : 사업장 주소지, 사고 이력 정보{" "}
                </p>
                <p className="txt dot">
                  전력 설비 정보 : 전력 설비 정보, 전력 및 센서 데이터,
                  알람/이벤트 데이터, 전력 설비 사진 등{" "}
                </p>
                <p className="tit-small">3. 제공받는 자의 보유 및 이용기간 </p>
                <p className="txt dot">
                  5년, 단 관련법령에서 달리 정한 경우에는 해당 법령에 따르며,
                  정보 주체의 요청 시 지체없이 파기함
                </p>
                <p className="tit-small">4. 제공받는 기관 </p>
                <p className="txt dot">LS일렉트릭</p>
              </div>
            </li>
          </ul>
        </div>
        <div className="popup__footer">
          <button type="button" className="js-close">
            <span>확인</span>
          </button>
        </div>
      </div>
      {/*<!-- //회원가입_이용약관 팝업 -->*/}
    </>
  );
}

function SignUpDone() {
  return (
    <>
      {/*<!-- 회원가입 완료 팝업 -->*/}

      <div id="join-ok" className="popup-layer js-layer hidden">
        {" "}
        {/*<!-- layer-out 클래스 : 팝업 안에 팝업일 경우는 생략되었음 -->*/}
        <div className="popup__head">
          <h1>회원가입</h1>
          <button className="btn btn-close js-close">
            <span className="hide">닫기</span>
          </button>
        </div>
        <div className="popup__body">
          <div className="complete-txt">
            <p className="joinok">회원가입이 완료되었습니다.</p>
          </div>
        </div>
        <div className="popup__footer">
          <button type="button" className="js-close">
            <span>로그인</span>
          </button>
        </div>
      </div>
      {/*<!— //회원가입 완료 팝업 —>*/}
    </>
  );
}