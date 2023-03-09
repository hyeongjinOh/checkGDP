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

import React, { useState, useEffect } from "react";
import { useAsync } from "react-async";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
// design
import styled from "styled-components";
import $ from "jquery";
import "/static/css/login.css";
// recoil
import { langState, getApiLangState } from "../../../recoil/langState";
import { userInfoState, authState } from "../../../recoil/userState";
import { loadingBoxState, } from "../../../recoil/menuState";
// utils
import { useTrans } from "../../../utils/langs/useTrans";
import * as i18n from "../../../utils/langs/i18nUtils";
import * as HttpUtil from "../../../utils/api/HttpUtil";
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const";
import JoinDone from "./JoinDone";
import AutoComplete from "../../common/autocomplete/AutoComplete";
import JoinAutoComplete from "../../common/autocomplete/JoinAutoComplete";

/**
 * @brief EHP 회원가입 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function Join(props) {
  const isRunYn = props.isRunYn;
  const layerList = props.layerList;
  const setCertification = props.setCertification;
  const [isJoin, setIsJoin] = useState(isRunYn); // false
  // use recoil
  //const setRecoilLangs = useSetRecoilState(langState); // recoil langState
  const apiLang = useRecoilValue(getApiLangState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  // upadata
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [department, setDepartment] = useState("");
  const [allCheck, setAllCheck] = useState(false);
  const [isAgreeTos, setIsAgreeTos] = useState(false);
  const [isAgreePersonalInfo, setIsAgreePersonalInfo] = useState(false);
  const [isAgreeData, setIsAgreeData] = useState(false);
  // const [isAgreeMailReceipt, setIsAgreeMailReceipt] = useState(false);

  const strAgreeTos = isAgreeTos ? "true" : "false";
  const strAgreePersonalInfo = isAgreePersonalInfo ? "true" : "false";
  const strAgreeData = isAgreeData ? "true" : "false";
  // const strAgreeMailReceipt = isAgreeMailReceipt ? "true" : "false";

  const [classificationItem, setclassificationItem] = useState([]);
  const [classificationCode, SetClassificationCode] = useState("");
  //password 확인

  const [companyItem, setCompanyItem] = useState([]);
  const [zoneItem, setZoneItem] = useState([]);

  const [directInputCompany, setDirectInputCompany] = useState(false);
  const [directInputZone, setDirectInputZone] = useState(false);

  //20220824 추가
  const [errorList, setErrorList] = useState([]);

  // const layerList = ["join-terms", "join-ok"];
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
      classificationCode: classificationCode, // 20221031 업종 추가
      agreeTos: strAgreeTos,
      agreePersonalInfo: strAgreePersonalInfo,
      agreeData: strAgreeData,
      // agreeMailReceipt: strAgreeMailReceipt,
      language: apiLang
      // (langs ==='')?Korean
    },
  });

  // 에러 유무 체크 // 에러 유무 체크 // 에러 유무 체크 // 에러 유무 체크 // 에러 유무 체크 // 에러 유무 체크 // 에러 유무 체크 // 에러 유무 체크 // 에러 유무 체크
  useEffect(() => {
    if (data) {
      // clog("IN SignUp : ERROR CODE : " + data.codeNum);
      if (data.codeNum == CONST.API_200) {
        clog("성공!");
        // setResErrorCode(CONST.API_200);
        // setIsJoin(true);
        //certification
        var logCertification = document.getElementById("join-oks");
        var joinClose = document.getElementById("join");
        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(joinClose)) joinClose.classList.add("hidden");
        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");
        if (!CUTIL.isnull(logCertification)) logCertification.click();

      } else {
        clog("error - join");
        //20220824 추가
        setErrorList(data.errorList)

      }
    }
  }, [data]);

  useEffect(() => {
    setCertification(userId)
  }, [userId])

  // password validattion 체크 이벤트 ======================== password validattion 체크 이벤트  password validattion 체크 이벤트
  async function onClickJoin(e) {
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      httpMethod: "POST",
      appPath: "/api/v2/user",
      appQuery: {
        userId: userId,
        password: password + confirmPassword, // password 와 confirmPassword 가 다르면 error 만든 비동기 api
        userName: userName,
        phoneNumber: phoneNumber,
        companyName: companyName,
        zoneName: zoneName,
        department: department,
        classificationCode: classificationCode, // 20221031 업종 추가
        agreeTos: strAgreeTos,
        agreePersonalInfo: strAgreePersonalInfo,
        agreeData: strAgreeData,
        // agreeMailReceipt: strAgreeMailReceipt,
        language: apiLang
      },
    });
    if (data && password == confirmPassword) {
      if (data.codeNum == CONST.API_200) {

      }
      // 비밀번호 확인
    } else if (data && password != confirmPassword) {
      if ((password == "" && confirmPassword == "") || password !== confirmPassword || (password != "" && confirmPassword == "" && data.codeNum == CONST.API_200)
      ) {
        $("#confirmPassword").addClass("input-error");
        //$("#password").addClass("input-error")
        if ((password == "" && confirmPassword == "") || (password != "" && confirmPassword == "")
        ) {
          //setResConfirmPasswordMsg("필수 항목입니다.");
          //setResPasswordMsg("동일한 비밀번호를 입력 해주세요.");
        } else if ((confirmPassword != "" && password == "") || password != confirmPassword
        ) {
          /*    $("#confText").addClass("input-errortxt").text("동일한 비밀번호를 입력 해주세요.")
             setResConfirmPasswordMsg("동일한 비밀번호를 입력 해주세요.");
             setResPasswordMsg("동일한 비밀번호를 입력 해주세요."); */
        }

        //20220824 추가
        setErrorList(data.body.errorList)

        clog("error 전송 실패");

      }
    }
  }




  function layerClose(tagId) {
    var othLayer = tagId;
    //닫기 버튼 , 배경 클릭 시
    $("#" + othLayer)
      .children()
      .children(".js-close")
      .trigger("click", function (ee) {
        $("#" + othLayer).addClass("hidden"); //모든 팝업 감추기
        $("body").css("overflow-y", "none"); //body 스크롤 자동 원복
      });
    //제일 바깥쪽 팝업을 닫았을때만 배경 감추기 (팝업안에 팝업이 또 있는 경우는 배경 살림)
    $("#" + othLayer + ".layer-out")
      .children()
      .children(".js-close")
      .on("click", function (ee) {
        $(".dimm").stop().hide().css("z-index", "11");
      });


  }

  /*   function onClickCancel(e) {
  
      //20220824 추가
      setErrorList([]);
  
      setUserId("");
      setPasswordData({
        password: "",
        confirmPassword: "",
      });
      setUserName("");
      setPhoneNumber("");
      setCompanyName("");
      setZoneName("");
      setDepartment("");
      setAllCheck(false);
      setIsAgreeTos(false);
      setIsAgreePersonalInfo(false);
      setIsAgreeData(false);
      setIsAgreeMailReceipt(false);
      setDirectInputCompany(false);
      setDirectInputZone(false);
      layerList.map((olayer) => {
        layerClose(olayer);
      });
      if (zoneName !== "") {
        setDirectInputZone(true);
      }
    } */

  function layerOpen(e) {
    e.preventDefault();
    var actTag = e.target.tagName == "BUTTON" ? e.target : e.currentTarget;
    var activeLayer = actTag.getAttribute("data-pop");
    //
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

    var mql2 = window.matchMedia("screen and (min-width: 501px)");
    if (mql2.matches) {
      $("body").css("overflow-y", "hidden"); //501이상에서 배경고정
    } else {
      $("body").css("overflow-y", "auto"); //501이하에서 배경 스크롤
    }

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

  useEffect(() => {
    if (directInputZone === true) {
      setDirectInputZone(false);
      setZoneItem([])
    }
  }, [companyItem])


  // comapany API
  const { data: retList } = useAsync({
    promiseFn: HttpUtil.PromiseHttp,
    httpMethod: "GET",
    appPath: "/api/v2/product/companies/signup",
    appQuery: {
      language: apiLang,
    }
  });
  useEffect(() => {
    if (retList) {
      if (retList.codeNum == CONST.API_200) {
        // setCompanyItem(retList.body.map((comp) => ({ ...comp, "autofield": comp.companyName })));
        setCompanyItem(retList.body)

      }
    }
  }, [retList])

  // 회사 초기화
  function resetAutoCompanyInfo(e) {
    setDirectInputCompany(true)
  }

  // 회사 선택시 사업장 API
  async function handleSetAutoComplete(autoInfo) {
    setErrorList(
      errorList.filter((err) => (err.field !== "companyName"))
    )
    if (CUTIL.isnull(autoInfo)) return;
    setCompanyName(autoInfo.companyName);
    setRecoilIsLoadingBox(true);
    const data = await HttpUtil.PromiseHttp({
      httpMethod: "GET",
      appPath: `/api/v2/product/company/zones/signup?companyId=${autoInfo.companyId}`,
      appQuery: {},
      watch: autoInfo.companyId
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        setZoneItem(data.body);
        setDirectInputCompany(false)
      } else { // api if need error handle
        setErrorList(data.body.errorList);
        setDirectInputCompany(false)
        setDirectInputZone(true);
      }
    }
    setRecoilIsLoadingBox(false);
  }

  function zoneClick(e) {
    var comTag = e.target.tagName == "LI" ? e.target : e.currentTarget;
    // 셀렉트 선택 시 data
    var value = comTag.getAttribute("data-value");
    setErrorList(
      errorList.filter((err) => (err.field !== "zoneName"))
    )
    setZoneName(value);
  }

  // 사업장 단일 직접입력 시나리오
  const onChangeZoneInput = (e) => {
    if (directInputZone === false) {
      setZoneName("");
      setDirectInputZone(true);
    }
  }

  // 사업장 단일 취소
  function onDirectCloseZone(e) {
    if ((directInputZone === true)) {
      setDirectInputZone(false)
    }
  }
  //
  async function classificationCodeSel(e) {
    CUTIL.onClickSelect(e, CUTIL.selectOption)
    let data: any = [];
    data = await HttpUtil.PromiseHttp({
      httpMethod: "GET",
      appPath: `/api/v2/user/classification`,
      appQuery: {},
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        setclassificationItem(data.body)
      } else { // api if need error handle
        setErrorList(data.errorList);

      }
    }

  }


  // 체크 박스
  const allchecked = () => {
    if (allCheck === false) {
      setAllCheck(true);
      setIsAgreeTos(true);
      setIsAgreePersonalInfo(true);
      setIsAgreeData(true);
      // setIsAgreeMailReceipt(true);
      setErrorList(
        errorList.filter((err) => (err.field !== "isAgreeData") && (err.field !== "isAgreePersonalInfo") && (err.field !== "isAgreeTos"))
      )
    } else {
      setAllCheck(false);
      setIsAgreeTos(false);
      setIsAgreePersonalInfo(false);
      setIsAgreeData(false);
      // setIsAgreeMailReceipt(false);
    }
  };
  // 전체체크 자동해제
  useEffect(() => {
    if (
      isAgreeTos === true &&
      isAgreePersonalInfo === true &&
      isAgreeData === true
      // isAgreeMailReceipt === true
    ) {
      setAllCheck(true);
    } else {
      setAllCheck(false);
    }
  }, [isAgreeTos, isAgreePersonalInfo, isAgreeData]);



  // =============== 20220824수정 ===========================================================================================================
  function handleSetUserId(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "userId"))
    )
    setUserId(e.target.value);
  }
  function handleSetPasswordData(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "password"))
    )
    setPassword(e.target.value);
  }
  function handleSetConfirmPasswordData(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "confirmPassword"))
    )
    setConfirmPassword(e.target.value);
  }

  function handleSetPhoneNumber(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "phoneNumber"))
    )
    setPhoneNumber(e.target.value);
  }
  function handleSetUserName(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "userName"))
    )
    setUserName(e.target.value);
  }
  function handleSetCompanyName(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "companyName"))
    )
    setCompanyName(e.target.value);
    if (companyName == "") {
      setZoneItem([]);
    }
  }
  function handleSetZoneName(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "zoneName"))
    )
    setZoneName(e.target.value);
  }
  function handleSetclassIficationCode(code) {
    setErrorList(
      errorList.filter((err) => (err.field !== "classificationCode"))
    )
    SetClassificationCode(code);
  }
  function handleSetIsAgreeTos(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "isAgreeTos"))
    )
    setIsAgreeTos(e.target.checked);

  }
  function handleSetIsAgreePersonalInfo(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "isAgreePersonalInfo"))
    )
    setIsAgreePersonalInfo(e.target.checked);
  }
  function handleSetIsAgreeData(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "isAgreeData"))
    )
    setIsAgreeData(e.target.checked);
  }
  // =============== 20220824수정 end ============================================================================================================
  return (
    <>
      {/* <!--220615 popup-layer 클래스 변경--> */}
      {/* <!-- layer-out 클래스 : 팝업 안에 팝업일 경우는 생략되었음 / 20220705 login__popup 클래스 추가 --> */}
      <div id="join" className="popup-layer js-layer layer-out hidden w560 login__popup">
        {/*<!-- layer-out 클래스 : 팝업 안에 팝업일 경우는 생략 / w560 클래스 : 팝업 사이즈 -->*/}
        <div className="popup__head">
          <h1>회원가입</h1>
          <button className="btn btn-close js-close" onClick={(e) => window.location.reload()}><span className="hide">닫기</span></button>
        </div>
        <div className="popup__body">
          <form action="" method="" name="popjoin" autoComplete="off">
            <ul className="form__input mt-9">
              <li>
                <label htmlFor="userId2" className="star">E-mail (아이디)</label>
                <div className="input__area">
                  {/* id="userName"은 크롬 자동저장 시  userId를 받기 위해서 사용 */}
                  <input type="text" id="id" placeholder="ex) abc@company.com"
                    className={(errorList.filter(err => (err.field === "userId")).length > 0) ? "input-error" : ""}
                    value={userId} onChange={(e) => handleSetUserId(e)} />
                  {(errorList.filter(err => (err.field === "userId")).length > 0) ?
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "userId")).map((err) => err.msg)}</p>
                    :
                    <p className="input-errortxt guidetxt">*회사 이메일을 입력해주세요.</p>
                  }
                </div>
              </li>
              <li>
                <label htmlFor="userpw" className="star">비밀번호</label>
                <div className="input__area">
                  <input type="password" id="password" placeholder="10~16자 텍스트, 영문/숫자를 포함하여 입력하세요."
                    value={password} onChange={(e) => handleSetPasswordData(e)}
                    className={(errorList.filter(err => (err.field === "password")).length > 0) ? "input-error" : ""}
                  />
                  {((password != confirmPassword)) ?
                    <p className="input-errortxt">비빌번호가 일치하지 않습니다.</p>
                    :
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "password")).map((err) => err.msg)}</p>
                  }
                </div>
              </li>
              <li>
                <label htmlFor="userpw2" className="star">
                  비밀번호 확인
                </label>
                <div className="input__area">
                  {(!password) ?
                    // { /미입력 시 disabled 적용 /
                    <input type="password" id="userpw2" disabled readOnly />
                    :
                    <input type="password" id="confirmPassword" placeholder="비밀번호와 동일하게 입력해주세요" value={confirmPassword}
                      onChange={(e) => handleSetConfirmPasswordData(e)}
                      className={(errorList.filter(err => (err.field === "confirmPassword")).length > 0) ? "input-error" : ""}

                    />
                  }
                  {((password != confirmPassword)) ?
                    <p className="input-errortxt">비빌번호가 일치하지 않습니다.</p>
                    :
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "password")).map((err) => err.msg)}</p>
                  }
                </div>
              </li>
              <li>
                <label htmlFor="username3" className="star">이름</label>
                <div className="input__area">
                  <input type="text" id="name" placeholder="이름을 입력하세요" value={userName}
                    onChange={(e) => handleSetUserName(e)}
                    className={(errorList.filter(err => (err.field === "userName")).length > 0) ? "input-error" : ""}
                  />
                  <p className="input-errortxt">{errorList.filter(err => (err.field === "userName")).map((err) => err.msg)}</p>
                </div>
              </li>
              <li>
                <label htmlFor="userphone2" className="star">연락처</label>
                <div className="input__area">
                  <input type="text" id="phoneNumber" placeholder="숫자만 입력하세요"
                    value={phoneNumber}
                    onChange={(e) => handleSetPhoneNumber(e)}
                    className={(errorList.filter(err => (err.field === "phoneNumber")).length > 0) ? "input-error" : ""}
                  />
                  <p className="input-errortxt">{errorList.filter(err => (err.field === "phoneNumber")).map((err) => err.msg)}</p>
                </div>
              </li>
              <li>
                <label htmlFor="userId2" className="star">회사</label>
                <div className={`input__area`} >
                  <input type="text" id="inp8" placeholder="텍스트를 입력하세요"
                    value={companyName} onChange={(e) => handleSetCompanyName(e)}
                    onKeyDown={(e) => resetAutoCompanyInfo(e)}
                    className={(errorList.filter(err => (err.field === "companyName")).length > 0) ? "input-error" : ""}
                  />
                  <p className="input-errortxt">{errorList.filter(err => (err.field === "companyName")).map((err) => err.msg)}</p>
                  {(companyName && directInputCompany) &&
                    <ul className="autocomplete-box">
                      <CompanyAutoCompltet
                        workList={companyItem}
                        companyName={companyName}
                        setCompanyName={setCompanyName}
                        directInputCompany={directInputCompany}
                        setDirectInputCompany={setDirectInputCompany}
                        handleSetAutoComplete={handleSetAutoComplete}
                      />
                    </ul>
                  }
                </div>
              </li>
              <li>
                <label htmlFor="userId2" className="star">사업장 </label>
                <div className="input__area">
                  {(!directInputZone) ?
                    <div id="zoneCSS"
                      className={`select ${(errorList.filter(err => (err.field === "zoneName")).length > 0) ? " input-error" : ""}`}
                      onClick={(!companyName) ? null : (e) => CUTIL.onClickSelect(e, CUTIL.selectOption)} >
                      <div className="selected">
                        <div id="zoneName" className="selected-value">
                          사업장을 선택해주세요.
                        </div>
                        <div className="arrow"></div>
                      </div>
                      <ul>
                        <li className="option hide" data-value={""} >사업장을 선택해주세요.</li>
                        <li className="option" onClick={(e) => onChangeZoneInput(e)} >직접 입력 </li>
                        {(zoneItem) && zoneItem.map((zone, idx) => (
                          <li id="directCloseZn" className="option" data-value={zone.zoneName}
                            key={"zone_" + idx} onClick={(e) => zoneClick(e)}>
                            {zone.zoneName}
                          </li>
                        ))}
                      </ul>
                    </div>
                    :
                    <div id="directDivZn"
                      className={(errorList.filter(err => (err.field === "zoneName")).length > 0) ? "input__direct input-error" : "input__direct"}
                    >
                      <input type="text" id="directInputZn" placeholder="사업장 이름을 직접 입력하세요" value={zoneName}
                        onChange={(e) => handleSetZoneName(e)}
                        className={(errorList.filter(err => (err.field === "zoneName")).length > 0) ? "input-error" : ""}
                      />
                      <button type="button" className="btn btn-delete" onClick={(directInputZone) ? (e) => onDirectCloseZone(e) : null} >
                        <span className="hide">입력 창 닫기</span>
                      </button>
                    </div>
                  }
                  <p className="input-errortxt">{errorList.filter(err => (err.field === "zoneName")).map((err) => err.msg)}</p>
                </div>
              </li>
              <li>
                <label htmlFor="part">부서</label>
                <div className="input__area">
                  <input type="text" id="part" placeholder="ex) 기술팀"
                    value={department} onChange={(e) => setDepartment(e.target.value)} />
                </div>
              </li>
              {/* <!--221028 업종 추가--> */}
              <li>
                <label htmlFor="part" className="star">업종</label>
                <div className="input__area">
                  <div className={`select ${(errorList.filter(err => (err.field === "classificationCode")).length > 0) ? "input-error" : ""}`}
                    onClick={(e) => classificationCodeSel(e)}>
                    <div className="selected">
                      <div className="selected-value">업종을 선택해주세요.</div>
                      <div className="arrow"></div>
                    </div>
                    <ul>
                      {classificationItem.map((list, idx) => (
                        <li key={"class_" + idx.toString()} className="option" onClick={(e) => handleSetclassIficationCode(list.code)}>{list.classification}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="input-errortxt">{errorList.filter(err => (err.field === "classificationCode")).map((err) => err.msg)}</p>
                </div>
              </li>
              <li>
                <ul className="checkBox column mt-8 ">
                  <li>
                    <input type="checkbox" id="agreeall" name="agreeall" checked={allCheck} onChange={allchecked} />
                    <label htmlFor="agreeall">
                      <strong>
                        e-Health Portal 시스템 관련 이용약관, 개인 정보처리방침, 데이터의 수집 이용 및 제공에 모두 동의합니다.{/* , 메일수신(선택) */}
                      </strong>
                    </label>
                  </li>
                  <li className="ml-50">
                    <input type="checkbox" id="agree1" name="joinagree" className={(errorList.filter(err => (err.field === "isAgreeTos")).length > 0) ? "input-error" : ""}
                      checked={isAgreeTos} onChange={(e) => handleSetIsAgreeTos(e)} /* onClick={() => agree1MsDown()} */
                    />
                    <label htmlFor="agree1">
                      (필수) 시스템 이용약관
                      <button type="button" className="btn btn-txt ml-8 js-open" data-pop="join-terms" onClick={(e) => layerOpen(e)}>
                        <span className="txtline">이용약관</span>
                      </button>
                    </label>
                  </li>
                  <li className="ml-50">
                    <input type="checkbox" id="agree2" name="joinagree" className={(errorList.filter(err => (err.field === "isAgreePersonalInfo")).length > 0) ? "input-error" : ""}
                      checked={isAgreePersonalInfo} onChange={(e) => handleSetIsAgreePersonalInfo(e)} /* onClick={() => agree2MsDown()} */
                    />
                    <label htmlFor="agree2">
                      (필수) 개인 정보 처리방침
                      <button type="button" className="btn btn-txt ml-8 js-open" data-pop="join-terms" onClick={(e) => layerOpen(e)}>
                        <span className="txtline">이용약관</span>
                      </button>
                    </label>
                  </li>
                  <li className="ml-50">
                    <input type="checkbox" id="agree3" name="joinagree" className={(errorList.filter(err => (err.field === "isAgreeData")).length > 0) ? "input-error" : ""}
                      checked={isAgreeData} onChange={(e) => handleSetIsAgreeData(e)} /* onClick={() => agree3MsDown()} */
                    />
                    <label htmlFor="agree3">
                      (필수) 데이터 수집 및 이용 동의
                      <button type="button" className="btn btn-txt ml-8 js-open" data-pop="join-terms" onClick={(e) => layerOpen(e)}>
                        <span className="txtline">이용약관</span>
                      </button>
                    </label>
                  </li>
                </ul>
              </li>
            </ul>
          </form>
        </div>
        <div className="popup__footer">
          <button type="button" className="js-close bg-gray" onClick={(e) => window.location.reload()} >
            <span>취소</span>
          </button>
          {/* 비밀번호/비밀번호 확인이 다를 경우 */}
          {(password !== confirmPassword) && (
            <button type="button" className="js-open" onClick={(e) => onClickJoin(e)} >
              <span>가입</span>
            </button>
          )}
          {(password == confirmPassword) && (
            <button type="button" className="js-open " onClick={run}>
              <span>가입</span>
            </button>
          )}
        </div>
      </div>
      {/*<!-- 회원가입_이용약관 팝업 -->*/}
      <TermService />

      {/*<!-- 회원가입 완료 팝업 -->*/}
      {/* <SignUpDone /> */}
    </>
  );
}
export default Join;


//2차전압 vules
function CompanyAutoCompltet(props) {
  const data = props.workList
  const companyName = props.companyName;
  const setCompanyName = props.setCompanyName;
  const directInputCompany = props.directInputCompany;
  const setDirectInputCompany = props.setDirectInputCompany;
  const handleSetAutoComplete = props.handleSetAutoComplete;
  //
  function autoClick(e, data) {
    setCompanyName(data)
    setDirectInputCompany(false)
  }
  //
  return (
    <>
      {(data) && (companyName && directInputCompany) && data.filter((data) => (data.companyName.toUpperCase().includes(companyName.toUpperCase()))).map((data, idx) => (
        <li key={idx} onClick={(e) => handleSetAutoComplete(data)} >
          <a >
            {data.companyName.substring(0, data.companyName.toUpperCase().indexOf(companyName.toUpperCase()))}
            <span className="highlight">{
              data.companyName.substring(
                data.companyName.toUpperCase().indexOf(companyName.toUpperCase()),
                data.companyName.toUpperCase().indexOf(companyName.toUpperCase()) + companyName.length)
            }
            </span>
            {data.companyName.substring(data.companyName.toUpperCase().indexOf(companyName.toUpperCase()) + companyName.length)}
          </a>
        </li>
      ))}

    </>
  )
}

function TermService() {

  return (
    <>
      {/* //  <!-- 회원가입_이용약관 팝업 --> */}
      <div id="join-terms" className="popup-layer js-layer hidden w560 login__popup">
        {/* <!-- layer-out 클래스 : 팝업 안에 팝업일 경우는 생략되었음 --> */}
        <div className="popup__head">
          <h1>이용약관</h1>
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        <div className="popup__body">
          <ul className="terms">
            <li>
              <p className="terms__tit">시스템 이용약관</p>
              <div className="box-scroll">
                <p className="renewday">개정일 2021.10.20</p>
                <p className="tit">[제 1장 총칙]</p>
                <p className="tit-middle">제 1조 목적</p>
                <p className="txt">이 약관은 LS ELECTRIC(이하 "회사") e-Health Portal 시스템에서 제공하는 모든 서비스의 이용조건 및 절차에 관한 사항과 기타 필요한 사항을 전기통신사업법 및 동법 시행령이 정하는 대로 준수하고 규정함을 목적으로 합니다.</p>
                <p className="tit-middle">제 2조 정의</p>
                <p className="txt">
                  "이용자"라 함은 시스템에 접속하여 이 약관에 따라 시스템이 제공하는 서비스를 받는 회원 및 비회원을 말합니다. "회원"이라 함은 웹페이지에 개인정보를 제공하여 회원등록을 한 자로서, 시스템의 정보를 지속적으로 제공 받으며, 시스템이 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.
                  "비회원"이라 함은 회원에 가입하지 않고 e-Health Portal 시스템에서 제공하는 서비스를 이용하는 자를 말합니다.
                </p>
                <p className="tit-middle">제 3조 약관의 효력과 변경</p>
                <p className="txt">
                  이 약관은 회사 e-Health Portal 시스템의 초기 서비스 화면에 이용자에게 공시함으로써 효력이 발생합니다. 회사는 사정 변경의 경우와 영업상 중요 사유가 있을 때 약관의 규제 등에 관한 법률 등 관련법을 위반하지 않는 범위에서 이 약관을 변경할 수 있으며, 이 경우에는 적용일자 및 개정사유,
                  변경되는 내용을 명시하여 현행 약관과 함께 초기 서비스 화면에 그 적용일자 7일전부터 적용일자 전일까지 공지합니다.
                </p>
                <p className="tit-middle">제 4조 약관 외 준칙</p>
                <p className="txt">이 약관에 명시되지 않은 사항이 관계 법령에 규정되어 있을 경우에는 그 규정에 따릅니다.</p>
                <p className="tit">[제 2장 회원 가입 및 서비스 이용]</p>
                <p className="tit-middle">제 1조 서비스 이용 계약의 성립</p>
                <p className="txt">
                  회사 e-Health Portal 시스템상 서비스 이용 계약은 이용자가 회원 가입에 따른 서비스 이용 신청에 대한 회사의 이용 승낙과 이용자의 이 약관에 동의한다는 의사표시로 성립됩니다. 이용자가 회원에 가입하여 회사 e-Health Portal 시스템상 서비스를 이용하고자 하는 경우, 회원은 회사에서 요청하는
                  개인 신상정보를 제공해야 합니다. 이용자의 회사 e-Health Portal 시스템상 서비스 이용신청에 대하여 회사가 승낙한 경우, 회사는 회원 이메일과 기타 회사가 필요하다고 인정하는 내용을 이용자에게 통지합니다.
                </p>
                <p className="txt mt10">회사는 다음에 해당하는 서비스 이용 신청에 대하여는 이를 승낙하지 아니합니다.</p>
                <p className="txt mt10">1. 다른 사람의 명의를 사용하여 신청하였을 때<br />2. 본인의 실명으로 신청하지 않았을 때<br />3. 서비스 이용 계약 신청서의 내용을 허위로 기재하였을 때<br />4. 사회의 안녕과 질서 혹은 미풍양속을 저해할 목적으로 신청하였을 때</p>
                <p className="tit-middle">제 2조 서비스 이용 및 제한</p>
                <p className="txt">
                  회사 e-Health Portal 시스템상 서비스 이용은 회사의 업무상 또는 기술상 특별한 지장이 없는 한 연중무휴, 1일 24시간을 원칙으로 합니다. 전항의 서비스 이용시간은 정보통신 시스템 등 정기점검/교체 등 e-Health Portal이 필요한 경우, 회원에게 사전 통지한 후, 제한할 수 있습니다. 서비스 중단의
                  경우에는 회사는 회원이 회사e-Health Portal 시스템에 제출한 전자우편 주소로 개별 통지하거나, 불특정다수 회원에 대하여는 1주일 이상 게시판에 게시함으로써 개별 통지에 갈음할 수 있습니다.
                </p>
                <p className="tit">[제 3장 의무]</p>
                <p className="tit-middle">제 1조 회사의 의무</p>
                <p className="txt">
                  회사는 특별한 사정이 없는 한 회원이 신청한 서비스 제공 개시일에 서비스를 이용할 수 있도록 합니다. 회사는 이 약관에서 정한 바에 따라 계속적, 안정적으로 서비스를 제공할 의무가 있습니다. 회사는 회원으로부터 소정의 절차에 의해 제기되는 의견에 대해서는 적절한 절차를 거쳐 처리하며, 처리시
                  일정 기간이 소요될 경우 회원에게 그 사유와 처리 일정을 알려주어야 합니다. 회사는 회원의 정보를 철저히 보안 유지하며, 양질의 서비스를 운영하거나 개선하는 경우 또는 제품소개 등 회사 내부 목적으로 이용하는 데만 사용하고, 이외의 다른 목적으로 타 기관 및 제3자에게 양도하지 않습니다.
                </p>
                <p className="tit-middle">제 2조 회원의 의무</p>
                <p className="txt">
                  회원 이메일과 비밀번호에 관한 모든 관리의 책임은 회원에게 있습니다. 회원 이메일과 비밀번호를 제3자에게 이용하게 해서는 안됩니다. 회원 이메일과 비밀번호를 도난당 하거나 제3자가 사용하고 있음을 인지하는 경우에는 회원은 반드시 회사에 그 사실을 통보해야 합니다. 회원은 이 약관 및 관계
                  법령에서 규정한 사항을 준수하여야 합니다.
                </p>
                <p className="txt mt-10">이용자는 개인 정보 입력 시 다음 행위를 하여서는 안됩니다.</p>
                <p className="txt mt-10">
                  1. 신청 또는 변경 시 허위내용의 등록<br />2. 회사 e-Health Portal 시스템이 정한 정보 이외의 정보(컴퓨터 프로그램 등)의 송신 또는 게시<br />3. 회사 e-Health Portal 시스템 기타 제3자의 저작권 등 지적재산권에 대한 침해<br />4. 회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는
                  행위<br />5. 외설 또는 폭력적인 메시지, 화상, 음성 기타 공서양속에 반하는 정보를 공개 또는 게시하는 행위
                </p>
                <p className="tit">[제 4장 서비스 이용 계약 해지 및 이용 제한]</p>
                <p className="tit-middle">제 1조 서비스 이용 계약 해지 및 이용 제한</p>
                <p className="txt">회원이 서비스 이용 계약을 해지하고자 하는 때에는 회원 정보 페이지에서 본인이 직접 계약을 해지할 수 있습니다.</p>
                <p className="txt mt-10">회사는 회원이 다음 사항에 해당하는 행위를 하였을 경우, 사전 통지 없이 서비스 이용 계약을 해지하거나 또는 상당한 기간을 정하여 서비스 이용을 중지할 수 있습니다.</p>
                <p className="txt mt-10">
                  1. 공공 질서 및 미풍 양속에 반하는 경우<br />2. 범죄적 행위에 관련되는 경우<br />3. 국익 또는 사회적 공익을 저해할 목적으로 서비스 이용을 계획 또는 실행할 경우<br />4. 타인의 ID(이메일)을 도용한 경우<br />5. 타인의 명예를 손상시키거나 불이익을 주는 경우<br />6. 같은 사용자가 다른
                  ID(이메일)로 이중 등록을 한 경우<br />7. 서비스에 위해를 가하는 등 건전한 이용을 저해하는 경우<br />8. 기타 관련 법령이나 회사가 정한 이용조건에 위배되는 경우
                </p>
                <p className="tit-middle">제 2조 서비스 이용 제한의 해제 절차</p>
                <p className="txt">회사는 긴급하게 서비스 이용을 중지해야 할 필요가 있다고 인정하는 경우에 서비스 이용을 제한할 수 있습니다. 회사는 서비스 이용중지 기간 중에 그 이용중지 사유가 해소된 것이 확인된 경우에 한하여 이용중지 조치를 즉시 해제합니다.</p>
              </div>
            </li>
            <li>
              <p className="terms__tit">개인 정보 처리방침</p>
              <div className="box-scroll">
                <p className="renewday">개정일 2021.10.20</p>
                <p className="tit">총칙</p>
                <p className="txt">LS ELECTRIC(이하 "회사")e-Health Portal 시스템은 이용자의 개인 정보를 보호하기 위하여 「정보통신망 이용 촉진 및 정보보호 등에 관한 법률」 및 「개인정보보호법」 등 관련 법령상의 개인정보 보호 규정을 준수하고 있으며 다음과 같은 개인정보 처리 방침을 가지고 있습니다.</p>
                <p className="txt mt-10">회사는 개인정보 처리방침을 통하여 이용자의 개인정보가 어떠한 목적과 방식으로 수집, 이용되고 있으며, 이용자의 개인정보 보호를 위해 e-Health Portal가 어떠한 조치를 취하고 있는지 알려드립니다.</p>
                <p className="txt mt-10">본 개인정보 처리 방침은 관련 법의 개정이나 회사의 정책에 따라 변경될 수 있으며, 회사는 e-Health Portal 시스템을 통하여 이를 알려드리오니, e-Health Portal 시스템 이용 시에 수시로 확인하여 주시기 바랍니다.</p>
                <p className="txt mt-10">
                  1. 개인정보의 처리 목적<br />
                  2. 처리하는 개인정보의 항목<br />
                  3. 개인정보의 수집방법<br />
                  4. 개인정보의 처리 및 보유기간<br />
                  5. 개인정보처리의 위탁에 관한 사항<br />
                  6. 개인정보의 제3자 제공에 관한 사항<br />
                  7. 개인정보의 파기에 관한 사항<br />
                  8. 정보주체의 권리,의무 및 그 행사방법에 관한 사항<br />
                  9. 개인정보의 안전성 확보 조치에 관한 사항<br />
                  10. 쿠키에 의한 개인정보 수집<br />
                  11. 개인정보 보호책임자에 관한 사항<br />
                  12. 정보주체의 권익침해에 대한 구제 방법<br />
                  13. 개인정보 처리방침의 변경에 관한 사항
                </p>
                <p className="tit-small">1. 개인정보의 처리 목적</p>
                <p className="txt mt-10">회사는 수집한 개인정보를 고객 관리 및 고객 정보를 통한 시장정보분석과 다양한 마케팅 활동(뉴스레터와 세미나, 제품정보, 특별 판매, 교육, 이벤트 관련 정보 등에 대해 e-mail, DM, 전화, SNS, MMS를 통한 안내 등)에 활용합니다.</p>
                <p className="tit-small">2. 처리하는 개인정보의 항목</p>
                <p className="txt mt-10">회사는 기타 판촉/마케팅 활동 등으로 추가로 개인정보를 수집할 수 있으며, 이 경우 해당 페이지에 개인정보의 수집 목적, 수집 항목, 보유 기간을 별도 고지하며 추가 동의를 받습니다.</p>
                <p className="txt mt-10">개인정보 수집 시 필수 항목의 수집ㆍ이용에 대한 동의를 거부하실 수 있으며, 동의를 거부하실 경우 서비스 이용이 제한 될 수 있습니다. 선택 항목의 수집ㆍ이용 동의를 거부 하실 경우에는 서비스 이용은 제한되지 않습니다.</p>
                <p className="txt mt-10">
                  수집하는 개인정보 항목 <br />
                  1. 성명<br />
                  2. 회사명<br />
                  3. 부서명<br />
                  4. 사업장명<br />
                  5. 직위명<br />
                  7. 이메일 주소<br />
                  8. 전화번호(휴대폰 번호)
                </p>
                <p className="tit-small">3. 개인정보의 수집방법</p>
                <p className="txt mt-10">
                  1. 웹사이트를 통한 “이용자”의 직접 입력, “이용자”의 서면 작성<br />
                  2. 로그분석 프로그램을 통한 자동 수집
                </p>
                <p className="tit-small">4. 개인정보의 처리 및 보유기간</p>
                <p className="txt mt-10">
                  회사는 개인정보 수집 시 이용자에게 고지하고 동의 받은 보유 기간이 도래하면 해당 정보를 지체 없이 파기합니다. 다만 상법, 국세기본법, 전자상거래 등에서의 소비자 보호에 관한 법률 등 관련 법령의 규정에 의하여 다음과 같이 거래 관련 권리 의무 관계의 확인 등을 이유로 일정기간 보유하여야 할
                  필요가 있을 경우에는 일정기간 보유합니다. 이 경우 회사는 보관하는 개인정보를 그 보관의 목적으로만 이용하며 보존 기간 및 보존 항목은 아래와 같습니다.
                </p>
                <p className="txt mt-10">
                  1. 계약 또는 청약철회 등에 관한 기록 : 5년(전자상거래 등에서의 소비자보호에 관한 법률)<br />
                  2. 대금 결제 및 재화 등의 공급에 관한 기록 : 5년(전자상거래 등에서의 소비자보호에 관한 법률)<br />
                  3. 소비자 불만 또는 분쟁 처리에 관한 기록 : 3년(전자상거래 등에서의 소비자보호에 관한 법률)<br />
                  4. 납세 증거에 관한 기록 : 5년(국세 기본법)<br />
                  5. 보존 항목 : 이름, 이메일주소, 유선전화번호, 휴대전화번호
                </p>
                <p className="tit-small">5. 개인정보처리의 위탁에 관한 사항</p>
                <p className="txt mt-10">회사는 원활한 개인정보 업무처리 및 보다 나은 서비스 향상을 위해서 다음과 같이 개인정보 처리업무를 외부 전문업체에 위탁하여 운영하고 있습니다.</p>
                <p className="txt mt-10">수탁자</p>
                <p className="txt mt-10">LS ITC<br />그룹웨어 운영 / 정보 전산 처리 및 유지관리 / ERP 시스템 위탁 운영 (전산 아웃소싱)</p>
                <p className="txt mt-10">LG CNS<br />정보 전산 처리 및 유지관리 / 임직원 정보시스템 위탁 운영 (전산 아웃소싱)</p>
                <p className="txt mt-10">삼양정보시스템(SYDS)<br />보안운영 / 정보 전산 처리 및 유지관리 / 협력업체 정보시스템 위탁 운영 (전산 아웃소싱)</p>
                <p className="txt mt-10">
                  e-Health Portal 위탁계약 체결 시 개인정보보호법 제25조에 따라 위탁업무 수행목적 외 개인정보 처리 금지, 기술적•관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리 및 감독, 개인정보보호 관련 법규의 준수, 개인정보에 대한 비밀유지, 손해배상 등 책임과 관한 사항을 계약서에 명시하고, 수탁자가
                  개인정보를 안전하게 처리하는지를 감독하고 있습니다.<br />회사는 위탁하는 업무의 내용이나 수탁자가 변경될 시 지체 없이 본 개인정보 처리(취급)방침을 통해 공개하도록 하겠습니다.
                </p>
                <p className="tit-small">6. 개인정보의 제3자 제공에 관한 사항</p>
                <p className="txt mt-10">
                  회사는 이용자의 동의가 있거나 관련 법령의 규정에 의한 경우를 제외하고는 어떠한 경우에도 "1. 처리하는 개인정보의 항목", "2. 개인정보의 처리 목적"에서 고지한 범위를 넘어 이용자의 개인정보를 이용하거나 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.
                </p>
                <p className="txt mt-10">
                  1. 이용자가 사전에 동의한 경우 2. 관련 법령의 규정에 의하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우<br />
                  3. 계약 이행을 위해 필요한 경우<br />
                  4. 타인에게 정신적, 물질적 피해를 줌으로써 그에 대한 법적 조치를 취하기 위해 이용자의 정보를 공개해야 한다고 판단되는 충분한 근거가 있는 경우<br />
                  5. 통계작성, 마케팅분석 또는 시장조사를 위해 필요한 경우로 특정 개인을 식별할 수 없는 형태로 가공하여 외부 기관 또는 단체 등에 제공하는 경우<br />
                  6. 서비스의 제공에 관한 계약의 이행을 위하여 필요한 개인정보로서 경제적/기술적인 사유로 통상의 동의를 받는 것이 현저히 곤란한 경우
                </p>
                <p className="txt mt-10">개인정보 제3자 제공</p>
                <p className="txt mt-10">
                  1. 개인정보를 제공받는 자: 엘에스일렉트릭 주식회사의 대리점 및 협력사<br />
                  2. 개인정보를 제공받는 자의 개인정보 이용 목적: 고객 관리 및 고객 정보를 통한 마케팅에의 활용 <br />
                  3. 제공하는 개인정보의 항목: 성명, 회사명, 부서명, 사업장명, 사용 기계 부하 정보, 이메일 주소, 국가정보<br />
                  4. 개인정보를 제공받는 자의 개인정보 보유 및 이용 기간: 수집일로부터 5년<br />
                  5. 동의거부권 및 동의 거부에 따른 불이익 안내 <br />
                  : 귀하는 위와 같이 개인정보를 제공하는 데 대한 동의를 거부할 권리가 있습니다. 그러나 동의를 거부할 경우 e-Health Portal App 서비스 이용에 제한이 있을 수 있습니다.
                </p>
                <p className="tit-small">7. 개인정보의 파기에 관한 사항</p>
                <p className="txt mt-10">
                  1. 파기절차<br />
                  o 회원께서 회원가입 등을 위해 입력하신 정보는 목적이 달성된 후 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라 (보유 및 이용기간 참조) 일정 기간 저장된 후 파기합니다.<br />
                  o 동 개인정보는 법률에 의한 경우가 아니고서는, 보유 이외의 다른 목적으로 이용되지 않습니다.
                </p>
                <p className="txt mt-10">
                  2. 파기방법 <br />
                  o 종이에 출력된 개인정보 : 분쇄기로 분쇄하거나 소각<br />
                  o 전자적 파일형태로 저장된 개인정보 : 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제
                </p>
                <p className="tit-small">8. 정보주체의 권리 의무 및 그 행사방법에 관한 사항</p>
                <p className="txt mt-10">
                  이용자 및 법정대리인의 개인정보를 최신의 상태로 정확하게 입력하여 불의의 사고를 예방해 주시기 바랍니다. 이용자 및 법정대리인이 입력한 부정확한 정보로 인해 발생하는 사고의 책임은 이용자 및 법정대리인 자신에게 있으며 타인 정보의 도용 등 허위 정보를 입력할 경우 서비스 이용이 제한 될 수
                  있습니다. 이용자 및 법정대리인은 개인정보를 보호받을 권리와 함께 스스로를 보호하고 타인의 정보를 침해하지 않을 의무도 가지고 있습니다. 이용자 및 법정대리인의 개인 정보가 유출되지 않도록 조심하시고 게시물을 포함한 타인의 개인정보를 훼손하지 않도록 유의해 주십시오. 만약 이 같은 책임을
                  다하지 못하고 타인의 정보 및 존엄성을 훼손할 시에는 『정보통신망 이용촉진 및 정보보호 등에 관한 법률』, 『개인정보보호법』 등에 의해 처벌 받을 수 있습니다.
                </p>
                <p className="txt mt-10">
                  1. 개인정보 열람, 정정, 삭제 요구의 권리:<br />
                  이용자 및 법정대리인은 언제든지 등록되어 있는 자신의 개인정보를 열람하거나 정정, 삭제하실 수 있습니다. 개인정보 열람 및 정정, 삭제를 하고자 할 경우에는 개인정보보호책임자 및 담당자에게 서면, 전화 또는 전자우편주소로 연락하시면 지체 없이 조치하겠습니다.
                </p>
                <p className="txt mt-10">
                  2. 개인정보 수집, 이용, 제공에 대한 동의 철회의 권리:<br />
                  이용자 및 법정대리인은 서비스 이용을 위해 입력하신 개인정보의 수집, 이용, 제공, 저장에 대해 동의하신 내용을 철회하실 수 있습니다.<br />
                  동의 철회는 개인정보보호 담당자에게 서면, 전화 또는 전자우편주소로 연락하시면 본인 확인 절차 후 개인정보의 삭제 등 필요한 조치를 하겠습니다.
                </p>
                <p className="tit-small">9. 개인정보의 안전성 확보 조치에 관한 사항</p>
                <p className="txt mt-10">
                  회사는 고객의 개인정보를 처리함에 있어 개인정보가 분실, 도난, 누출, 변조 또는 훼손되지 않도록 「개인정보보호법 제24조 제2항, 제29조 및 동 법 시행령 제30조에 따라 다음과 같이 안전성 확보에 필요한 기술적, 관리적, 물리적 조치를 하고 있습니다. 단, 고객 개인의 부주의나 인터넷 상의 문제로
                  개인정보가 유출되어 발생한 문제에 대해서는 회사에서 일체의 책임을 지지 않습니다.
                </p>
                <p className="txt mt-10">
                  1. 관리적 조치 <br />
                  o 회사는 개인정보 보호에 대한 내부 업무규정을 마련하여 소속 직원들에게 이를 숙지하고 준수하도록 하고 있습니다. <br />
                  o 회사는 개인정보 관련 취급 직원을 담당자에 한정시키고 있고, 개인정보 취급자에 대해서는 정기 및 수시 교육을 통하여 개인정보를 안전하게 관리하고 있습니다. <br />
                  o 회사는 개인정보 처리(취급)방침에 대한 이행사항 및 담당자의 준수 여부를 감사하기 위한 내부절차를 마련하여 지속적으로 시행하고 있으며, 사내 개인정보보호 전담기구를 통하여 문제 발견 시 즉시 시정 조치하도록 운영하고 있습니다. <br />
                  o 회사는 컴퓨터를 이용하여 이용자의 개인정보를 처리하는 경우 개인정보에 대한 접근권한을 가진 담당자를 지정하여 식별부호(ID) 및 비밀번호를 부여하고, 해당 비밀번호를 정기적으로 갱신하고 있습니다. <br />
                  o 회사는 신규 직원 채용 시 개인정보보호서약서에 서명함으로 소속 직원에 의한 개인정보 유출을 사전에 방지하고, 퇴직시에도 이용자의 개인정보를 취급하였던 담당자가 직무상 알게 된 개인정보를 훼손ㆍ침해 또는 누설하지 않도록 하고 있습니다. <br />
                  o 개인정보 관련 취급자의 업무 인수인계는 보안이 유지된 상태에서 철저하게 이루어지고 있으며, 입사 및 퇴사 후 개인정보 침해사고에 대한 책임을 명확화하고 있습니다.
                </p>
                <p className="txt mt-10">
                  2. 기술적 조치 o 회사는 최신 백신 프로그램을 이용하여 해킹이나 컴퓨터 바이러스 등에 의한 개인정보 침해를 방지하기 위한 조치를 취하고 있습니다.<br />
                  o 회사는 침입차단시스템을 이용하여 외부로부터의 무단 접근을 통제하고 사내 네트워크를 보호하고 있으며, 기타 시스템적으로 보안성을 확보하기 위하여 가능한 모든 기술적 장치를 갖추려 최선의 노력을 다 하고 있습니다.<br />
                  o 회사는 고유식별정보 등 중요 개인정보에 대하여서는 철저히 암호화하여 저장 및 관리하고 있습니다.
                </p>
                <p className="txt mt-10">
                  3. 물리적 조치<br />
                  o 회사는 전산실 및 자료 보관실 등을 특별 보호구역으로 설정하여 출입을 철저히 통제하고 있습니다.
                </p>
                <p className="tit-small">10. 쿠키에 의한 개인정보 수집</p>
                <p className="txt mt-10">회사는 이용자의 정보를 수시로 저장하고 찾아내는 ' 쿠키( cookie)'를 설치 운용합니다. 쿠키란 e-Health Portal 시스템을 운영하는데 이용되는 서버가 이용자의 브라우저에 보내는 아주 작은 텍스트 파일로서 이용자의 컴퓨터 하드디스크에 저장됩니다.</p>
                <p className="txt mt-10">
                  1. 쿠키 사용 목적<br />
                  o 이용자의 접속빈도 또는 머문 시간 등을 분석하여 이용자의 취향과 관심분야를 파악하여 서비스 개선에 활용<br />
                  o 웹사이트 방문 품목들에 대한 정보와 관심 있게 둘러본 품목들에 대한 자취를 추적하여 다음 번 웹사이트 방문 때 맞춤 정보를 제공
                </p>
                <p className="txt mt-10">
                  2. 쿠키 설정 거부 방법<br />
                  o 이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서, 쿠키 설정을 거부하는 방법으로는 사용하시는 웹 브라우저의 옵션을 선택함으로써 모든 쿠키를 허용하거나 쿠키를 저장할 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다. <br />
                  o 설정방법의 예시(웹 브라우저의 경우) : 웹 브라우저 상단의 도구 {'>'} 인터넷 옵션 {'>'} 개인정보에서 변경. 단, 이용자께서 쿠키 설치를 거부하였을 경우 서비스 제공에 어려움이 있을 수 있습니다.<br />
                  o 처리중인 개인정보가 인터넷 홈페이지, P2P, 공유설정 등을 통하여 권한이 없는 자에게 공개되지 않도록 개인정보처리 시스템 및 개인정보처리자의 PC를 설정합니다.<br />
                  o 개인정보 수집, 활용 및 파기 시 그에 대한 법률이 권고하는 기준(정보통신망 이용촉진 및 정보보호 등에 관한 법률 및 개인정보보호법 등 관련 법령)에 따라 수집한 근거를 남기도록 하고 있으며, 이와 관련하여 내부 정책과 프로세스를 규정하고 교육을 실시합니다.
                </p>
                <p className="txt mt-10">
                  3. e-Health Portal 시스템에 광고를 게재하는 배너에서도 광고주나 마케팅회사에 의해 쿠키가 사용되는 경우도 있음을 알려드립니다. 이 경우 당해 쿠키는 시스템 관리와 광고주에게 제공할 통계 집계 등을 위하여 이용자들의 IP 주소를 모으기도 합니다. 당해 쿠키가 수집하는 개인정보에 관한 사항은
                  광고주나 마케팅회사의 개인정보보호방침에 따릅니다.
                </p>
                <p className="tit-small">11. 개인정보보호책임자에 관한 사항</p>
                <p className="txt mt-10">회사는 고객의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 개인정보 보호 책임자를 두고 있습니다/</p>
                <p className="txt mt-10">
                  1. 개인정보 보호 책임자: 송정섭 시니어 매니저 <br />
                  2. 개인정보 보호 담당자 : 변민경 매니저 <br />
                  3. 개인정보 운영 책임자: 채대석 이사 <br />
                  4. 전화번호: 02-2034-4328 <br />
                  5. 이메일 주소: mkbyun@ls-electric.com
                </p>
                <p className="tit-small">12. 정보주체의 권익침해에 대한 구제 방법</p>
                <p className="txt mt-10">개인정보에 관한 상담이 필요한 경우에는 개인정보침해 신고센터, 대검찰청 인터넷 범죄수사센터, 경찰청 사이버테러대응센터 등으로 문의하실 수 있습니다.</p>
                <p className="txt mt-10">
                  1. 개인정보침해신고센터 <br />
                  o 전화 : (국번없이) 118 <br />
                  o URL : http://privacy.kisa.or.kr
                </p>
                <p className="txt mt-10">
                  2. 개인정보분쟁조정위원회 <br />
                  o 전화 : 02-2100-2499 <br />
                  o URL : http://www.kopico.go.kr
                </p>
                <p className="txt mt-10">
                  3. 대검찰청 사이버수사과 <br />
                  o 전화 : (국번없이) 1301 <br />
                  o URL : http://www.spo.go.kr
                </p>
                <p className="txt mt-10">
                  4. 경찰청 사이버안전국 <br />
                  o 전화 : (국번없이) 182 <br />
                  o URL : http://cyberbureau.police.go.kr
                </p>
                <p className="tit-small">13. 개인정보 취급방침의 변경에 관한 사항</p>
                <p className="txt mt-10">이 개인정보처리방침은 법령ㆍ정책 또는 보안 기술의 변경에 따라 내용의 추가ㆍ삭제 및 수정이 있을 시에는 아래와 같은 방법으로 사전 공지하도록 하겠습니다.</p>
                <p className="txt mt-10">• e-Health Portal 시스템 FAQ에 수정내용 공지</p>
              </div>
            </li>
            <li>
              <p className="terms__tit">데이터 수집,이용 및 제3자 제공 동의</p>
              <div className="box-scroll">
                <p className="renewday">개정일 2021.12.01</p>
                <p className="tit-middle">[데이터의 수집 및 이용동의]</p>
                <p className="tit-small">1. 수집 및 이용 목적</p>
                <p className="txt dot">e-Health Portal 시스템의 기능 개선 및 추가 등 신규개발을 위한 분석 및 연구</p>
                <p className="tit-small">2. 수집하는 데이터 항목(필수)</p>
                <p className="txt dot">일반 정보 : 이름, 이메일, 전화번호(휴대폰 번호), 소속 및 지위 등</p>
                <p className="txt dot">사업장 정보 : 사업장 주소지, 사고 이력 정보</p>
                <p className="txt dot">전력 설비 정보 : 전력 설비 정보, 전력 및 센서 데이터, 알람/이벤트 데이터, 전력 설비 사진 등</p>
                <p className="tit-small">3. 보유 및 이용기간</p>
                <p className="txt dot">5년, 단 관련법령에서 달리 정한 경우에는 해당 법령에 따르며, 정보 주체의 요청 시 지체없이 파기함</p>
                <p className="tit-middle">[데이터의 수집 및 이용동의]</p>
                <p className="tit-small">1. 제공목적</p>
                <p className="txt dot">e-Health Portal 시스템의 기능 개선 및 추가 등 신규개발을 위한 분석 및 연구</p>
                <p className="tit-small">2. 제공하는 데이터 항목 (필수)</p>
                <p className="txt dot">일반 정보 : 이름, 이메일, 전화번호(휴대폰 번호), 소속 및 지위 등</p>
                <p className="txt dot">사업장 정보 : 사업장 주소지, 사고 이력 정보</p>
                <p className="txt dot">전력 설비 정보 : 전력 설비 정보, 전력 및 센서 데이터, 알람/이벤트 데이터, 전력 설비 사진 등</p>
                <p className="tit-small">3. 제공받는 자의 보유 및 이용기간</p>
                <p className="txt dot">5년, 단 관련법령에서 달리 정한 경우에는 해당 법령에 따르며, 정보 주체의 요청 시 지체없이 파기함</p>
                <p className="tit-small">4. 제공받는 기관</p>
                <p className="txt dot">LS일렉트릭</p>
              </div>
            </li>
          </ul>
        </div>
        <div className="popup__footer">
          <button type="button" className="js-close"><span>확인</span></button>
        </div>
      </div>
      {/* <!-- //회원가입_이용약관 팝업 -->  */}
    </>
  );
}



function OldDev() {
  /*  // 팝업창 select 콤보박스 리스트 활성화
   $(document).on("click", function (e) {
     const targetElement = e.target as unknown as HTMLElement;
     const isSelect =
       targetElement.classList.contains("ib") || targetElement.closest(".lb");
     if (isSelect) {
       return;
     }
     const allSelectBoxElements = document.querySelectorAll(".lb");
     allSelectBoxElements.forEach((boxElement) => {
       boxElement.classList.remove("active");
     });
   });
 
   $(document).on("click", function (e) {
     const targetElement = e.target as unknown as HTMLElement;
     const isSelect =
       targetElement.classList.contains("lb") || targetElement.closest(".ib");
     if (isSelect) {
       return;
     }
     const allSelectBoxElements = document.querySelectorAll(".ib");
     allSelectBoxElements.forEach((boxElement) => {
       boxElement.classList.remove("active");
     });
   });
 
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
     // clog("OPT VAL : " + optionElement.value);
     //clog("OPT VAL : " + optionElement.getAttribute("data-value"));
     selectedElement.setAttribute(
       "data-value",
       optionElement.getAttribute("data-value")
     );
   } */

  /*  //회사 선택 시 사업장 API 연계까지
   async function companyClick(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "companyName"))
    )
  
    var comTag = e.target.tagName == "LI" ? e.target : e.currentTarget;
    // 셀렉트 선택 시 data
    var companyId = comTag.getAttribute("data-value");
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      httpMethod: "GET",
      appPath: "/api/v2/product/company/zones?companyId=" + companyId,
      appQuery: {
        language: apiLang,
      }
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        setZoneItem(data.body);
      }
    }
    setCompanyName(companyId);
  }
  function zoneClick(e) {
    var comTag = e.target.tagName == "LI" ? e.target : e.currentTarget;
    // 셀렉트 선택 시 data
    var value = comTag.getAttribute("data-value");
    setErrorList(
      errorList.filter((err) => (err.field !== "zoneName"))
    )
    setZoneName(value);
  } */
  // 직접입력 시나리오
  /* const onChangeCommpayZoneInput = (e) => {
    if (directInputCompany === false || directInputZone === false) {

      setErrorList(
        errorList.filter((err) => (err.field !== "companyName"))
      )
      setCompanyName("");
      setZoneName("");
      setDirectInputCompany(true);
      setDirectInputZone(true);
    }
  };
  // 사업장 단일 직접입력 시나리오
  const onChangeZoneInput = (e) => {
    if (directInputZone === false) {
      setZoneName("");
      setDirectInputZone(true);
    }
  };
  // 직접입력 취소 
  function onDirectCloseCom(e) {
    if (directInputCompany === true || directInputZone === true) {
      setDirectInputCompany(false);
      setDirectInputZone(false);
    }
  }
  // 사업장 단일 취소
  function onDirectCloseZone(e) {
    if ((directInputZone === true)) {
      setDirectInputZone(false)
    }
  } */

  return (
    <>
      {/* 회사 명  */}
      {/*          <JoinAutoComplete
                      workList={companyItem}
                      autoInfo={companyInfo}
                      setAutoInfo={handleSetAutoComplete}
                      resetAutoInfo={resetAutoCompanyInfo}
                      errorList={errorList}
                      errorField={"companyName"}
                    /> */}
      {/*<!-- disabled 일 경우, 클래스에 disabled 추가하면 컬러 변경됩니다. -->*/}
      {/*  {(!directInputCompany) ?
                      <div id="companyCSS"
                        
                        className={(errorList.filter(err => (err.field === "companyName")).length > 0) ? "select lb input-error" : "select lb"}
                        onClick={(e) => onClickSelect(e)} >
                        <div className="selected ">
                          <div id="companyName" className="selected-value">회사를 선택해주세요.</div>
                          <div className="arrow"></div>
                        </div>
                        <ul>
                          <li id="directCloseCom" className="option hide" data-value={""} >회사를 선택해주세요.</li>
                          <li id="onDirectCp" className="option" onClick={(e) => onChangeCommpayZoneInput(e)}>직접 입력</li>

                          {companyItem.map((list, idx) => (

                            <li
                              className="option"
                              
                              data-value={list.companyName} key={"comapny_" + idx} onClick={(e) => companyClick(e)}>
                              {list.companyName}
                            </li>

                          ))}
                        </ul>
                      </div>
                      :
                      <div id="directDiv"
                        
                        className={(errorList.filter(err => (err.field === "companyName")).length > 0) ? "input__direct input-error" : "input__direct"}
                      >
                        <input type="text" id="directInputCompany" placeholder="회사 이름을 직접 입력하세요" value={companyName}
                         
                          onChange={(e) => handleSetCompanyName(e.target.value)}
                          className={(errorList.filter(err => (err.field === "companyName")).length > 0) ? "input-error" : ""}
                      
                       
                        />
                        <button type="button" className="btn btn-delete" onClick={(e) => onDirectCloseCom(e)} >
                          <span className="hide">입력 창 닫기</span>
                        </button>
                      </div>
                    }
                   
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "companyName")).map((err) => err.msg)}</p> */}
      {/* 사업장 */}


    </>
  )


}


function JoinOld() {
  // const { snsId, snsName, socialType, snsPhone } = props;



  //  // 소셜 회원가입 -Kakao
  //  async function snsKakao(e) {
  //   let data: any = null;
  //   data = await HttpUtil.PromiseHttp({
  //     httpMethod: "POST",
  //     appPath: "/api/v2/user/sns",
  //     appQuery: {
  //       userId: snsId,
  //       userName: userName,
  //       phoneNumber: phoneNumber,
  //       companyName: companyName,
  //       zoneName: zoneName,
  //       department: department,
  //       nickName: snsName,
  //       socialType: socialType,
  //       agreeTos: strAgreeTos,
  //       agreePersonalInfo: strAgreePersonalInfo,
  //       agreeData: strAgreeData,
  //       agreeMailReceipt: strAgreeMailReceipt,
  //       language: apiLang
  //     },
  //   });
  //   if (data) {
  //     clog("IN SignUp : ERROR CODE : " + data.codeNum);
  //     if (data.codeNum == CONST.API_200) {
  //       clog("성공!");
  //       setResErrorCode(CONST.API_200);
  //       setIsJoin(true);
  //     } else {
  //       clog("error - join");

  //       setResErrorCode(data.codeNum);
  //       setResErrorMsg(data.body.errorList);
  //       setResUserIdMsg("");

  //       //20220824 추가
  //       setErrorList(data.body.errorList)

  //     }
  //   }
  // }
  // // 소셜 회원가입 - Naver
  // async function snsNaver(e) {
  //   let data: any = null;
  //   data = await HttpUtil.PromiseHttp({
  //     httpMethod: "POST",
  //     appPath: "/api/v2/user/sns",
  //     appQuery: {
  //       userId: snsId,
  //       userName: snsName,
  //       phoneNumber: snsPhone,
  //       companyName: companyName,
  //       zoneName: zoneName,
  //       department: department,
  //       nickName: snsName,
  //       socialType: socialType,
  //       agreeTos: strAgreeTos,
  //       agreePersonalInfo: strAgreePersonalInfo,
  //       agreeData: strAgreeData,
  //       agreeMailReceipt: strAgreeMailReceipt,
  //       language: apiLang
  //     },
  //   });
  //   if (data) {
  //     clog("IN SignUp : ERROR CODE : " + data.codeNum);
  //     if (data.codeNum == CONST.API_200) {
  //       clog("성공!");
  //       setResErrorCode(CONST.API_200);
  //       setIsJoin(true);
  //     } else {
  //       clog("error - join");
  //       //20220824 추가
  //       setErrorList(data.body.errorList)
  //     }
  //   }
  // }

  // 소셜로그인 제거
  // <div id="join" className="popup-layer js-layer layer-out hidden w560 login__popup">
  //     {/*<!-- layer-out 클래스 : 팝업 안에 팝업일 경우는 생략 / w560 클래스 : 팝업 사이즈 -->*/}
  //     <div className="popup__head">
  //       <h1>회원가입</h1>
  //       <button className="btn btn-close js-close" onClick={(e) => onClickCancel(e)}><span className="hide">닫기</span></button>
  //     </div>
  //     {!isJoin &&
  //       <div className="popup__body">
  //         <form action="" method="" name="popjoin">
  //           <ul className="form__input mt-9">
  //             <li>
  //               <label htmlFor="userId2" className="star">E-mail (아이디)</label>
  //               <div className="input__area">
  //                 {(!socialType) ?
  //                   <input type="text" id="userId0" placeholder="ex) abc@company.com"
  //                     className={(errorList.filter(err => (err.field === "userId")).length > 0) ? "input-error" : ""}
  //                     value={userId} onChange={(e) => handleSetUserId(e.target.value)} />
  //                   :
  //                   <input type="text" value={snsId} disabled /> // 소셜로그인 email
  //                 }
  //                 <p className="input-errortxt">{errorList.filter(err => (err.field === "userId")).map((err) => err.msg)}</p>
  //               </div>
  //             </li>
  //             {(!socialType) &&
  //               <li>
  //                 <label htmlFor="userpw" className="star">비밀번호</label>
  //                 <div className="input__area">
  //                   <input type="password" id="password" placeholder="10~16자 텍스트, 영문/숫자를 포함하여 입력하세요."
  //                     value={password} onChange={(e) => OnChangePassword(e.target.value)}
  //                     className={(errorList.filter(err => (err.field === "password")).length > 0) ? "input-error" : ""}
  //                   />
  //                   {((password != confirmPassword)) ?
  //                     <p className="input-errortxt">비빌번호가 일치하지 않습니다.</p>
  //                     :
  //                     <p className="input-errortxt">{errorList.filter(err => (err.field === "password")).map((err) => err.msg)}</p>
  //                   }
  //                 </div>
  //               </li>}
  //             {(!socialType) &&
  //               <li>
  //                 <label htmlFor="userpw2" className="star">
  //                   비밀번호 확인
  //                 </label>
  //                 <div className="input__area">
  //                   {(!password) &&
  //                     // { /미입력 시 disabled 적용 /
  //                     <input type="password" id="userpw2" disabled readOnly />
  //                   }
  //                   {(password) &&
  //                     <input type="password" id="confirmPassword" placeholder="비밀번호와 동일하게 입력해주세요" value={confirmPassword}
  //                       onChange={(e) => OnChangeConfirmPasswordInput(e.target.value)}
  //                       className={(errorList.filter(err => (err.field === "confirmPassword")).length > 0) ? "input-error" : ""}

  //                     />
  //                   }
  //                   {((password != confirmPassword)) ?
  //                     <p className="input-errortxt">비빌번호가 일치하지 않습니다.</p>
  //                     :
  //                     <p className="input-errortxt">{errorList.filter(err => (err.field === "password")).map((err) => err.msg)}</p>
  //                   }
  //                 </div>
  //               </li>
  //             }
  //             <li>
  //               <label htmlFor="username3" className="star">이름</label>
  //               <div className="input__area">
  //                 {((!socialType) || (socialType == "KAKAO")) &&
  //                   <input type="text" id="userName" placeholder="이름을 입력하세요" value={userName}
  //                     onChange={(e) => handleSetUserName(e.target.value)}
  //                     className={(errorList.filter(err => (err.field === "userName")).length > 0) ? "input-error" : ""}
  //                   />
  //                 }
  //                 {(socialType == "NAVER") && // 네이버 회원가입시 자동 이름으로disabled 처리
  //                   <input type="text" id="userName" placeholder="이름을 입력하세요" value={snsName} disabled />
  //                 }
  //                 <p className="input-errortxt">{errorList.filter(err => (err.field === "userName")).map((err) => err.msg)}</p>
  //               </div>
  //             </li>
  //             <li>
  //               <label htmlFor="userphone2" className="star">연락처</label>
  //               <div className="input__area">
  //                 {((!socialType) || (socialType == "KAKAO")) &&
  //                   <input type="text" id="phoneNumber" placeholder="숫자만 입력하세요"
  //                     value={phoneNumber}
  //                     onChange={(e) => handleSetPhoneNumber(e.target.value)}
  //                     className={(errorList.filter(err => (err.field === "phoneNumber")).length > 0) ? "input-error" : ""}
  //                   />
  //                 }
  //                 {(socialType == "NAVER") && // 네이버 회원가입시 자동 번호로disabled 처리                    
  //                   <input type="text" id="phoneNumber" placeholder="숫자만 입력하세요" value={snsPhone} disabled />
  //                 }
  //                 <p className="input-errortxt">{errorList.filter(err => (err.field === "phoneNumber")).map((err) => err.msg)}</p>
  //               </div>
  //             </li>
  //             <li>
  //               <label htmlFor="userId2" className="star">회사</label>
  //               {/*          <JoinAutoComplete
  //                   workList={companyItem}
  //                   autoInfo={companyInfo}
  //                   setAutoInfo={handleSetAutoComplete}
  //                   resetAutoInfo={resetAutoCompanyInfo}
  //                   errorList={errorList}
  //                   errorField={"companyName"}
  //                 /> */}
  //               <div className={`input__area`} >
  //                 <input type="text" id="inp8" placeholder="텍스트를 입력하세요"
  //                   value={companyName} onChange={(e) => handleSetCompanyName(e)}
  //                   onKeyDown={(e) => resetAutoCompanyInfo(e)}
  //                   className={(errorList.filter(err => (err.field === "companyName")).length > 0) ? "input-error" : ""}
  //                 />
  //                 <p className="input-errortxt">{errorList.filter(err => (err.field === "companyName")).map((err) => err.msg)}</p>
  //                 {(companyName && directInputCompany) &&
  //                   <ul className="autocomplete-box">
  //                     <CompanyAutoCompltet
  //                       workList={companyItem}
  //                       companyName={companyName}
  //                       setCompanyName={setCompanyName}
  //                       directInputCompany={directInputCompany}
  //                       setDirectInputCompany={setDirectInputCompany}
  //                       handleSetAutoComplete={handleSetAutoComplete}
  //                     />

  //                   </ul>
  //                 }
  //               </div>

  //             </li>
  //             <li>
  //               <label htmlFor="userId2" className="star">사업장 </label>
  //               <div className="input__area">
  //                 {(!directInputZone) ?
  //                   <div id="zoneCSS"
  //                     className={(errorList.filter(err => (err.field === "zoneName")).length > 0) ? "select ib input-error" : "select ib"}
  //                     onClick={(!companyName) ? null : (e) => CUTIL.onClickSelect(e, CUTIL.selectOption)} >
  //                     <div className="selected">
  //                       <div id="zoneName" className="selected-value">
  //                         사업장을 선택해주세요.
  //                       </div>
  //                       <div className="arrow"></div>
  //                     </div>
  //                     <ul>
  //                       <li className="option hide" data-value={""} >사업장을 선택해주세요.</li>
  //                       <li className="option" onClick={(e) => onChangeZoneInput(e)} >직접 입력 </li>
  //                       {(zoneItem) && zoneItem.map((zone, idx) => (
  //                         <li id="directCloseZn" className="option" data-value={zone.zoneName}
  //                           key={"zone_" + idx} onClick={(e) => zoneClick(e)}>
  //                           {zone.zoneName}
  //                         </li>
  //                       ))}
  //                     </ul>
  //                   </div>
  //                   :
  //                   <div id="directDivZn"
  //                     className={(errorList.filter(err => (err.field === "zoneName")).length > 0) ? "input__direct input-error" : "input__direct"}
  //                   >
  //                     <input type="text" id="directInputZn" placeholder="사업장 이름을 직접 입력하세요" value={zoneName}
  //                       onChange={(e) => handleSetZoneName(e.target.value)}
  //                       className={(errorList.filter(err => (err.field === "zoneName")).length > 0) ? "input-error" : ""}
  //                     />
  //                     <button type="button" className="btn btn-delete" onClick={(directInputZone) ? (e) => onDirectCloseZone(e) : null} >
  //                       <span className="hide">입력 창 닫기</span>
  //                     </button>
  //                   </div>
  //                 }
  //                 <p className="input-errortxt">{errorList.filter(err => (err.field === "zoneName")).map((err) => err.msg)}</p>
  //               </div>
  //             </li>
  //             <li>
  //               <label htmlFor="part">부서</label>
  //               <div className="input__area">
  //                 <input type="text" id="part" placeholder="ex) 기술팀"
  //                   value={department} onChange={(e) => setDepartment(e.target.value)} />
  //               </div>
  //             </li>
  //             <li>
  //               <ul className="checkBox column mt-8 ">
  //                 <li>
  //                   <input type="checkbox" id="agreeall" name="agreeall" checked={allCheck} onChange={allchecked} />
  //                   <label htmlFor="agreeall">
  //                     <strong>
  //                       e-Health Portal 시스템 관련 이용약관, 개인 정보처리방침, 데이터의 수집 이용 및 제공에 모두 동의합니다.{/* , 메일수신(선택) */}
  //                     </strong>
  //                   </label>
  //                 </li>
  //                 <li className="ml-50">
  //                   <input type="checkbox" id="agree1" name="joinagree" className={(resAgreeTos.length <= 0) ? "" : "input-error"}
  //                     checked={isAgreeTos} onChange={(e) => setIsAgreeTos(!isAgreeTos)} /* onClick={() => agree1MsDown()} */
  //                   />
  //                   <label htmlFor="agree1">
  //                     (필수) 시스템 이용약관
  //                     <button type="button" className="btn btn-txt ml-8 js-open" data-pop="join-terms" onClick={(e) => layerOpen(e)}>
  //                       <span className="txtline">이용약관</span>
  //                     </button>
  //                   </label>
  //                 </li>
  //                 <li className="ml-50">
  //                   <input type="checkbox" id="agree2" name="joinagree" className={(resAgreePersonalInfo.length <= 0) ? "" : "input-error"}
  //                     checked={isAgreePersonalInfo} onChange={(e) => setIsAgreePersonalInfo(!isAgreePersonalInfo)} /* onClick={() => agree2MsDown()} */
  //                   />
  //                   <label htmlFor="agree2">
  //                     (필수) 개인 정보 처리방침
  //                     <button type="button" className="btn btn-txt ml-8 js-open" data-pop="join-terms" onClick={(e) => layerOpen(e)}>
  //                       <span className="txtline">이용약관</span>
  //                     </button>
  //                   </label>
  //                 </li>
  //                 <li className="ml-50">
  //                   <input type="checkbox" id="agree3" name="joinagree" className={(resAgreeData.length <= 0) ? "" : "input-error"}
  //                     checked={isAgreeData} onChange={(e) => setIsAgreeData(!isAgreeData)} /* onClick={() => agree3MsDown()} */
  //                   />
  //                   <label htmlFor="agree3">
  //                     (필수) 데이터 수집 및 이용 동의
  //                     <button type="button" className="btn btn-txt ml-8 js-open" data-pop="join-terms" onClick={(e) => layerOpen(e)}>
  //                       <span className="txtline">이용약관</span>
  //                     </button>
  //                   </label>
  //                 </li>
  //                 {/*    <li className="ml-50">
  //                   <input type="checkbox" id="agree4" name="joinagree"
  //                     checked={isAgreeMailReceipt} onChange={(e) => setIsAgreeMailReceipt(!isAgreeMailReceipt)}
  //                   />
  //                   <label htmlFor="agree4">
  //                     (선택) 메일 수신 동의
  //                     <p className="txt-lightgray fontRegular mt-3">
  //                       수신 동의 시 LS ELECTRIC 뉴스레터를 메일로 보내드립니다.
  //                     </p>
  //                   </label>
  //                 </li> */}
  //               </ul>
  //             </li>
  //           </ul>
  //         </form>
  //       </div>
  //     }
  //     {/* 회원가입 완료 시 팝업 */}
  //     {
  //       (isJoin) && (
  //         // <!--220615 popup__body 클래스 joinok-h 추가 -->
  //         <div className="popup__body joinok-h">
  //           <div className="complete-txt">
  //             <p className="joinok">회원가입이 완료되었습니다.</p>
  //             {/* <!--220615 button 위치 이동 --> */}
  //             <button type="button" className="js-close" onClick={() => location.reload()}>
  //               <span>로그인</span>
  //             </button>
  //           </div>
  //         </div>
  //       )
  //       // <!--220615 popup__footer 삭제 -->
  //     }
  //     {(!isJoin) && (
  //       <div className="popup__footer">
  //         <button type="button" className="js-close bg-gray" onClick={(e) => onClickCancel(e)} >
  //           <span>취소</span>
  //         </button>
  //         {/* 비밀번호/비밀번호 확인이 다를 경우 */}
  //         {(password !== confirmPassword) && (!socialType) && (
  //           <button type="button" className="js-open" onClick={(e) => onClickJoin(e)} >
  //             <span>가입</span>
  //           </button>
  //         )}
  //         {(password == confirmPassword) && (!socialType) && (
  //           <button type="button" className="js-open " onClick={run}>
  //             <span>가입</span>
  //           </button>
  //         )}
  //         {(socialType == "KAKAO") && (
  //           <button type="button" className="js-open " onClick={(e) => snsKakao(e)} >
  //             <span>가입</span>
  //           </button>
  //         )}
  //         {(socialType == "NAVER") && (
  //           <button type="button" className="js-open " onClick={(e) => snsNaver(e)} >
  //             <span>가입</span>
  //           </button>
  //         )}
  //       </div>
  //     )}
  //   </div>
}