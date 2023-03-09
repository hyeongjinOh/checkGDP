/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved.
 */
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-05-17
 * @brief EHP Login 화면 컴포넌트
 *
 ********************************************************************/
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAsync } from "react-async";
import {
  useRecoilValue,
  useRecoilState,
  useSetRecoilState,
  useResetRecoilState,
} from "recoil";
// design
import styled from "styled-components";
import $ from "jquery";
import "/static/css/login.css";
// recoil
import { langState, getApiLangState } from "../../recoil/langState";
import { userInfoState, authState } from "../../recoil/userState";
import { urlState } from "../../recoil/menuState";
// utils
import { useTrans } from "../../utils/langs/useTrans";
import * as i18n from "../../utils/langs/i18nUtils";
import * as HttpUtil from "../../utils/api/HttpUtil";
import clog from "../../utils/logUtils";
import * as CUTIL from "../../utils/commUtils";
import * as CONST from "../../utils/Const";
import * as USERUTILS from "../../utils/user/userUtils"
import * as ENV from "../../utils/envUtils"
//
import FindId from "./FindId";
import FindPw from "./FindPw";
import Join from "./join/Join";
//

//
import KakaoLogin from "./KakaoLogin";
import NaverLogin from "./NaverLogin";
import JoinDone from "./join/JoinDone";
import axios from "axios";
import { APIBASE } from "../../utils/api/HttpConf";

/**
 * @brief EHP 로그인 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

// Window & typeof globalThis' 형식에 'Kakao' 속성
declare global {
  interface Window {
    Kakao: any;

  }
  interface Window {
    naver: any;

  }

}


function Login() {
  // trans, navigate, ref
  const navigate = useNavigate();
  const t = useTrans();
  // use recoil
  //const setRecoilLangs = useSetRecoilState(langState); // recoil langState
  const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
  const apiLang = useRecoilValue(getApiLangState);
  //---------------------------
  const [userInfo, setRecoilUserInfo] = useRecoilState(userInfoState); // recoil userState
  //
  const isAuth = useRecoilValue(authState);
  //
  const setRecoilUrl = useSetRecoilState(urlState);
  //
  const [userId, setUserId] = useState(""); //test@test.com
  const [userPw, setUserPw] = useState(""); //1234qwer!@
  const [resErrorCode, setResErrorCode] = useState(200);
  const [resErrorMsg, setResErrorMsg] = useState("");
  //
  const layerList = ["findId", "findPw"];
  const layerListJoin = ["join-ok", "join-terms"];
  //소설 회원가입
  const [snsId, setSnsId] = useState("");
  const [snsName, setSnsName] = useState("");
  const [snsPhone, setSnsPhone] = useState("");
  const [socialType, setSocialType] = useState("");
  //
  const [certification, setCertification] = useState("")

  // 로그인 유지
  // 초기 로그인 유지 여부를 "Y"로 셋팅
  localStorage.setItem(CONST.STR_KEEP_LOGIN_YN, "Y");
  const [keepLoginYn, setKeepLoginYn] = useState(
    (localStorage.getItem(CONST.STR_KEEP_LOGIN_YN) == null) ? "N" : localStorage.getItem(CONST.STR_KEEP_LOGIN_YN)
  );

  // useAsync call axios  
  //clog("IN LOGIN : LANG SETTING : " + apiLang);
  //20220824 추가
  const [errorList, setErrorList] = useState([]);

  const { data: data, error, isLoading, reload, run:runLogin, } = useAsync({
    //promiseFn: HttpUtil.getUsers,
    deferFn: HttpUtil.Http,
    httpMethod: "POST",
    appPath: "/api/v2/auth/login",
    appQuery: {
      userId: userId,
      password: userPw,
      language: apiLang
    },
  });
  useEffect(() => {
    let errL = "";
    if (data) {
      //clog("IN LOGIN : USERINFO : " + JSON.stringify(data.body));
      if (data.codeNum == 200) {
        //
        //USERUTILS.getDetailUserInfo(data.body);
        //////////////////////////////////////sessionStorage
        sessionStorage.setItem(CONST.STR_TOKEN, data.body.token);
        sessionStorage.setItem(CONST.STR_TOKEN_EXPIRETIME, data.body.tokenExpireTime);
        /////////////////////////////////////localStorage
        localStorage.setItem(CONST.STR_USERID, userId);
        localStorage.setItem(CONST.STR_USERROLE, data.body.role);
        localStorage.setItem(CONST.STR_REFRESHTOKEN, data.body.refreshToken);
        localStorage.setItem(CONST.STR_REFRESHTOKEN_EXPIRETIME, data.body.refreshTokenExprieTime);
        (async () => { // IFFE(Immediately Invoked Function Expression)은 함수가 정의되자마자 실행되는 자바스크립트 기술입니다.
          const detailUserInfo = await USERUTILS.getDetailUserInfoR(data.body);
          const lang = CUTIL.frontLangSet(detailUserInfo.language);
          await i18n.changeLang(lang);
          //
          setRecoilLangs(lang);
          //
          setRecoilUserInfo({
            loginTime: detailUserInfo.loginTime,
            userId: detailUserInfo.userId,
            email: detailUserInfo.email,
            userName: detailUserInfo.userName,
            phoneNumber: detailUserInfo.phoneNumber,
            companyName: detailUserInfo.companyName,
            zoneName: detailUserInfo.zoneName,
            department: detailUserInfo.department,
            role: detailUserInfo.role,
            language: detailUserInfo.language,
            classificationCode: detailUserInfo.classificationCode,
            classification: detailUserInfo.classification,
            //socialDtoOut: detailUserInfo.socialDtoOut,
            agreeMailReceipt: detailUserInfo.agreeMailReceipt,
            agreeTos: detailUserInfo.agreeTos,
            agreePersonalInfo: detailUserInfo.agreePersonalInfo,
            agreeData: detailUserInfo.agreeData,
            loginInfo: data.body,
          });
        })();

        //20220920 수정
      } else if (data.codeNum == 999) {
        setResErrorCode(data.codeNum);
        //errL = "Connection error!!!";
        //setResErrorMsg(errL + "-" + resErrorCode);
        setErrorList(data.errorList);
        data.errorList.map((el) => {
          //errL = errL + el.msg;
          errL = el.msg;
        });
        setResErrorMsg(errL);
      } else {

        setResErrorCode(data.codeNum);
        setErrorList(data.errorList);

        data.errorList.map((el) => {
          //errL = errL + el.msg;
          errL = el.msg;
        });
        //setResErrorMsg(errL + "-" + resErrorCode);
        setResErrorMsg(errL);
        // 메일 인증
        if (data.data.errorList[0].msg == "인증되지 않았습니다." && data.data.errorList[0].field == "userId") {
          var logCertification = document.getElementById("join-oks");
          if (!CUTIL.isnull(logCertification)) logCertification.click();
        }

      }
    }
    // });

  }, [data]);

  //if (isLoading) return <div>로딩중..</div>;
  if (error) {
    // 에러가 안잡힌다.
    { clog("IN LOGIN : ERR : " + error.name); }
    { clog("IN LOGIN : ERR : " + error.stack); }
    { clog("IN LOGIN : ERR : " + JSON.stringify(error)); }
  }

  useEffect(() => {
    if (isAuth) {
      const userRole = localStorage.getItem(CONST.STR_USERROLE);
      clog("IN LOGIN : MOVE TO URL : " + userRole);
      if ((userRole) && (userRole === CONST.USERROLE_NONE)) {
        setRecoilUrl(CONST.URL_LANDING);
      } else {
        setRecoilUrl(CONST.URL_DASHBOARD);
      }
      navigate(CONST.URL_DASHBOARD);
    }
  }, []);
  useEffect(() => {
    setCertification(userId);
  }, [userId])

  // 다국어 설정 변경 및 recoil 상태 변경
  async function exchgLanguage(e, lang: string) {
    // $(".navbar__menu li.active ul li").removeClass("active");
    $(".select-lang button.btn.btn-txt").removeClass("on");
    var tmpTag = (e.target.tagName == "BUTTON") ? e.target : e.currentTarget;
    clog("login comp : exchange : " + tmpTag.tagName);
    tmpTag.className = "btn btn-txt on";

    await i18n.changeLang(lang);
    setRecoilLangs(lang);
  }

  function layerClose(tagId) {
    var othLayer = tagId;
    //닫기 버튼 , 배경 클릭 시
    $("#" + othLayer)
      .children()
      .children(".js-close")
      .trigger("click", function (ee) {
        $("#" + othLayer).addClass("hidden"); //모든 팝업 감추기
        $("body").css("overflow-y", "auto"); //body 스크롤 자동 원복
      });
    //제일 바깥쪽 팝업을 닫았을때만 배경 감추기 (팝업안에 팝업이 또 있는 경우는 배경 살림)
    $("#" + othLayer + ".layer-out")
      .children()
      .children(".js-close")
      .on("click", function (ee) {
        $(".dimm").stop().hide().css("z-index", "11");
      });
  }
  function layerOpen(e) {
    e.preventDefault();
    var actTag = (e.target.tagName == "BUTTON") ? e.target : e.currentTarget;
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
      ($(window).height() - $("#" + activeLayer).outerHeight()) / 2 + $(window).scrollTop() + "px"
    );
    $("#" + activeLayer + ".popup-layer").css(
      "left",
      ($(window).width() - $("#" + activeLayer).outerWidth()) / 2 + $(window).scrollLeft() + "px"
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

  function loginSetting(e) {
    //e.preventDefault();
    clog("CLICK : " + e.target.tagName);
    clog("CLICK : " + e.target.checked);
    setKeepLoginYn((e.target.checked) ? "Y" : "N");
    localStorage.setItem(CONST.STR_KEEP_LOGIN_YN, (e.target.checked) ? "Y" : "N");
  }


  //20220824 추가
  function handleSetUserId(val) {
    //20220922 jhpark 수정
    if ((errorList.filter(err => (err.field === "cntError")).length)) {
      setErrorList(
        errorList.filter((err) => (err.field !== "cntError"))
      )
      setUserId(val);
    } else {
      setErrorList(
        errorList.filter((err) => (err.field !== "userId"))
      )
      setUserId(val);
    }
  }
  //20220824 추가
  function handleSetUserPw(val) {
    //20220922 jhpark 수정
    if ((errorList.filter(err => (err.field === "cntError")).length)) {
      setErrorList(
        errorList.filter((err) => (err.field !== "cntError"))
      )
      setUserPw(val);
    } else {
      setErrorList(
        errorList.filter((err) => (err.field !== "password"))
      )
      setUserPw(val);
    }
  }

  function onClickLogin(e) {
    //clog("login click.....");
    runLogin();
  }
  function handleOnKeyPress(e, type) {
    clog("login click.....");
    if (e.key === 'Enter') { // Enter 입력이 되면 클릭 이벤트 실행
      if ( type === "INPUT_PASSWORD" ) {
        onClickLogin(e);
      }
    }
  }


  return (
    <>
      {/*<!-- #login -->*/}
      <div id="login">
        {/*<!-- .login__left, 왼쪽영역 -->*/}
        <div className="login__left">
          <div className="left__top">
            <span className="hide">LS</span>
          </div>
          <div className="left__center">
            {/*  20220711 hjo - 번역 제거 요청 */}
            <p>Welcome to LS ELECTRIC</p>
            {/* <!--221214, h1 영역 수정(이미지로)--> */}
            <h1><img src={require("/static/img/logo_login_title.png")} alt="e-Health Portal" /></h1>
          </div>
          <p className="left__bottom">LS ELECTRIC ©</p>
        </div>
        {/*<!-- //.login__left, 왼쪽영역 -->*/}

        {/*<!-- .login__right, 오른쪽영역 -->*/}
        <div className="login__right">
          <h2>
            <p>
              <span>Welcome to LS ELECTRIC</span>
              <span>
                {/* <!--221214, span 영역 수정(이미지로)--> */}
                <img src={require("/static/img/logo_login_title_color.png")} alt="e-Health Portal" />
              </span>
            </p>
            <p>{t("MESSAGE.로그인해주십시오")}</p>
          </h2>
          <div className="login__form">
            <form action="#" method="" name="loginform">
              <fieldset>
                <legend>로그인 정보 입력</legend>
                <ul className="form__input">
                  <li>
                    <label htmlFor="userId" className="hide">아이디 입력</label>
                    <div className="input__area">
                      {/*<!-- 220520 입력인풋(인풋종류상관없이 전부다.체크박스라디오제외)에 무조건  div className="input__area" 태그로 감쌈... / 전체화면 공통사항임. -->*/}
                      {/*
                           <input type="text" id="userId" placeholder="아이디" />
                           <!--220520 에러문구일 경우 클래스 input-error 추가되고, <p className="input-errortxt"> 생성됨  / 전체화면 공통사항임.-->
                           <p className="input-errortxt">필수 입력 항목입니다.</p>*/}

                      {/*<LoginIdInputArea errCode={resErrorCode} userId={userId} handleFunc={setUserId}/>*/}
                      <input
                        type="text"
                        id="userId"
                        placeholder="아이디"
                        /* className={((resErrorCode == 200) && (userId.length >= 0)) || ((resErrorCode != 200) && (userId.length > 0)) ? "" : "input-error"} */
                        /* 20220922추가 jhpark */
                        className={
                          ((errorList.filter(err => (err.field === "cntError")).length > 0) ||
                            (errorList.filter(err => (err.field === "userId")).length > 0)
                          ) ? "input-error" : ""}
                        value={userId}
                        onChange={(e) => handleSetUserId(e.target.value)}
                      />

                    </div>
                  </li>
                  <li>
                    <label htmlFor="userPw" className="hide">비밀번호 입력</label>
                    <div className="input__area">
                      {/*<input type="password" id="userPw" placeholder="비밀번호" className="input-error" />
                           <!--220520 에러문구일 경우 클래스 input-error 추가되고, <p className="input-errortxt"> 생성됨, 클래스 input-error 넣으면 p태그는 자동으로 노출됨 -->
                           <p className="input-errortxt">아이디 또는 비밀번호가 일치하지 않습니다.</p>*/}
                      {/*<LoginPwInputArea errCode={resErrorCode} errList={resErrorMsg} userPw={userPw} handleFunc={setUserPw}/>*/}
                      <input
                        type="password"
                        id="userPw"
                        placeholder="비밀번호"
                        //className={(resErrorCode == 200) ? "" : "input-error"}
                        /*  20220922추가 jhpark  */
                        className={
                          (
                            (errorList.filter(err => (err.field === "cntError")).length > 0) ||
                            (errorList.filter(err => (err.field === "password")).length > 0) ||
                            (errorList.filter(err => (err.field === "userId")).length > 0)
                          ) ? "input-error" : ""}
                        value={userPw}
                        onChange={(e) => handleSetUserPw(e.target.value)}
                        onKeyDown={(e) => handleOnKeyPress(e, "INPUT_PASSWORD")}
                      />
                      {/* <p className="input-errortxt"> */}
                      <p className="input-errortxt">
                        {/*  20220922추가 jhpark  */}
                        {
                          ((errorList.filter(err => (err.field === "password")).map((err) => err.msg)).length > 0) ?
                            (errorList.filter(err => (err.field === "password")).map((err) => err.msg)) :
                            (errorList.filter(err => (err.field === "cntError")).length > 0) ?
                              (errorList.filter(err => (err.field === "cntError")).map((err) => err.msg)) :
                              (errorList.filter(err => (err.field === "userId")).map((err) => err.msg))
                        }
                      </p>
                      {/* {resErrorMsg} */}
                      {/*아이디 또는 비밀번호가 일치하지 않습니다*/}
                      {/* </p> */}
                    </div>
                  </li>
                </ul>
                <ul className="form__etc">
                  <li >
                    <input
                      type="checkbox"
                      id="idsave"
                      name="chksave"
                      // onChange={(e) => loginSetting(e)}
                      checked={(keepLoginYn == "Y") ? true : false}
                      readOnly
                    />
                    <label htmlFor="idsave" className="hide" >로그인 유지</label>
                  </li>
                  <li>
                    {/*<!--레이어팝업일 경우 클래스에js-open 추가/data-pop 값으로 호출 -->*/}
                    <button
                      type="button"
                      className="btn btn-txt js-open"
                      data-pop="findId"
                      onClick={(e) => layerOpen(e)}
                    >
                      <span>{t("LABEL.아이디찾기")}</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-txt js-open"
                      data-pop="findPw"
                      onClick={(e) => layerOpen(e)}
                    >
                      <span>{t("LABEL.비밀번호찾기")}</span>
                    </button>
                    {/*<button type="button" className="btn btn-txt js-open" data-pop="join" onClick={layerOpen}>
                      <span>회원가입</span>
                    </button> 
                    */}
                  </li>
                </ul>
                {/*<button type="button" className="btn-login" onClick={run}>*/}
                <button type="button" className="btn-login" onClick={(e)=>onClickLogin(e)}>                
                  <span>로그인</span>
                </button>
              </fieldset>
            </form>
          </div>
          <ul className="join">
            <li>
              <p>아직 회원이 아니신가요?</p>
              <button type="button" id={"join-oks"} className="btn btn-txt hide js-open" data-pop="join-ok" onClick={layerOpen}>
                <span>회원가입</span>
              </button>
              {/* <button type="button" id={(socialType == "KAKAO") ? "kakaojoin" : (socialType == "NAVER") ? "naverjoin" : "joins"} className="btn btn-txt js-open" data-pop="join" onClick={layerOpen}> */}
              <button type="button" className="btn btn-txt js-open" data-pop="join" onClick={layerOpen}>
                <span>회원가입</span>
              </button>
            </li>
            <li className="join__sns">
              {/* <KakaoLogin setSnsId={setSnsId} setSnsName={setSnsName} setSocialType={setSocialType} />
              <NaverLogin setSnsId={setSnsId} setSnsName={setSnsName} setSocialType={setSocialType} setSnsPhone={setSnsPhone} /> */}
            </li>
          </ul>
          <div className="select-lang">
            {/*
                 <button type="button" className="btn btn-txt on"><span>한국어</span></button>
                 <button type="button" className="btn btn-txt"><span>English</span></button>
                 <button type="button" className="btn btn-txt"><span>中文</span></button>*/}
            <button
              type="button"
              className={`btn btn-txt ${(langs == CONST.STR_LANG_KOR) ? "on" : ""}`}
              onClick={(e) => (langs !== CONST.STR_LANG_KOR) && exchgLanguage(e, CONST.STR_LANG_KOR)}
            >
              <span>한국어</span>
            </button>{" "}
            {/*<!--선택시 클래스 on-->*/}
            <button
              type="button"
              className={`btn btn-txt ${(langs == CONST.STR_LANG_ENG) ? "on" : ""}`}
              onClick={(e) => (langs !== CONST.STR_LANG_ENG) && exchgLanguage(e, CONST.STR_LANG_ENG)}
            >
              <span>English</span>
            </button>
            <button type="button"
              className={`btn btn-txt ${(langs == CONST.STR_LANG_CHA) ? "on" : ""}`}
              onClick={(e) => (langs !== CONST.STR_LANG_CHA) && exchgLanguage(e, CONST.STR_LANG_CHA)}
            >
              <span>中文</span>
            </button>
          </div>
        </div>
        {/*<!-- //.login__right, 오른쪽영역 -->*/}
      </div>
      {/*<!-- //#login -->*/}
      {/*<!-- 회원가입 팝업 --> */}
      {/* <SignUp /> */}
      <Join layerList={layerListJoin} isRunYn={false} setCertification={setCertification} />
      {(certification) &&
        <JoinDone certification={certification} />
      }
      {/* {(socialType == "KAKAO") && // kakao 회원가입
        <Join layerList={layerListJoin} isRunYn={false} snsId={snsId} snsName={snsName} socialType={socialType} />
      }
      {(socialType == "NAVER") && // naver 회원가입
        <Join layerList={layerListJoin} isRunYn={false} snsId={snsId} snsName={snsName} socialType={socialType} snsPhone={snsPhone} />
      } */}
      {/*<!-- 아이디 찾기 팝업 -->*/}
      <FindId layerList={layerList} isRunYn={false} />
      {/*<!-- 비밀번호 찾기 팝업 -->*/}
      <FindPw layerList={layerList} isRunYn={false} />
      <div className="dimm"></div> {/*<!-- 레이어팝업 배경 -->*/}
    </>
  );
}
export default Login;

function LoginIdInputArea(props) {
  const errCode = props.errCode;
  const userId = props.userId;
  const setUserId = props.handleFunc;
  return (
    <>
      <input
        type="text"
        id="userId"
        placeholder="아이디"
        className={(errCode == 200) ? "" : "input-error"}
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      {/*
           (errCode === 200)?
           "" : 
           <p className="input-errortxt">아이디 또는 비밀번호가 일치하지 않습니다</p>
           */}
    </>
  );
}

function LoginPwInputArea(props) {
  const errCode = props.errCode;
  const errList = props.errList;
  const userPw = props.userPw;
  const setUserPw = props.handleFunc;
  return (
    <>
      <input
        type="password"
        id="userPw"
        placeholder="비밀번호"
        className={errCode == 200 ? "" : "input-error"}
        value={userPw}
        onChange={(e) => setUserPw(e.target.value)}
      />
      {(errCode === 200) ? ("") : (
        <p className="input-errortxt">
          {errList}
          {/*아이디 또는 비밀번호가 일치하지 않습니다*/}
          {/* errList.map((msg, idx)=>(msg))*/}
        </p>
      )}
    </>
  );
}
