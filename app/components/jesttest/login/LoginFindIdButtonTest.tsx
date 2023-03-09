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
import { useNavigate } from 'react-router-dom';
import { useAsync } from "react-async";
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
// design
import styled from "styled-components";
import $ from "jquery"
import "/static/css/login.css"
// recoil
import { langState } from '../../../recoil/langState';
import { userInfoState, authState, } from '../../../recoil/userState';
// utils
import { useTrans } from "../../../utils/langs/useTrans";
import * as i18n from '../../../utils/langs/i18nUtils';
import * as HttpUtil from "../../../utils/api/HttpUtil";
import clog from "../../../utils/logUtils"
import * as cUtils from "../../../utils/commUtils"
import * as CONST from "../../../utils/Const"
//
import FindId from "./FindIdTest"
import FindPw from "./FindPwMatchTest"

/**
 * @brief EHP 로그인 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
function Login() {
  // use recoil
  const setRecoilLangs = useSetRecoilState(langState); // recoil langState
  //---------------------------
  const setRecoilUserInfo = useSetRecoilState(userInfoState); // recoil userState
  //
  const isAuth = useRecoilValue(authState);
  //
  const [userId, setUserId] = useState(""); //test@test.com
  const [userPw, setUserPw] = useState("1234qwer!@"); //1234qwer!@
  const [resErrorCode, setResErrorCode] = useState(200);
  const [resErrorMsg, setResErrorMsg] = useState("");
  //
  const layerList = ["findId", "findPw"];
  // 로그인 유지
  //clog("IN LOGIN LOGIN KEEP : " + 
  const [keepLoginYn, setKeepLoginYn]
    = useState((localStorage.getItem(CONST.STR_KEEP_LOGIN_YN) == null) ? "N" : localStorage.getItem(CONST.STR_KEEP_LOGIN_YN));

  const navigate = useNavigate();
  // useTrans 기능 축약 // hook 위치 중요
  const t = useTrans();
  // useAsync call axios
  const { data: data, error, isLoading, reload, run } = useAsync({
    //promiseFn: HttpUtil.getUsers,
    deferFn: HttpUtil.Http,
    httpMethod: "POST",
    appPath: "/api/v2/auth/login",
    appQuery: { userId: userId, password: userPw, },
  });
  useEffect(() => {
    let errL = "";
    if (data) {
      if (data.codeNum == 200) {
        localStorage.setItem(CONST.STR_USERID, userId);
        localStorage.setItem(CONST.STR_REFRESHTOKEN, data.body.refreshToken);
        localStorage.setItem(CONST.STR_REFRESHTOKEN_EXPIRETIME, data.body.refreshTokenExpireTime);
        /* setRecoilUserInfo({
          "userId": userId,
          "loginTime": cUtils.curTimeString(),
          "userInfo": data.body
        }); */
      } else if (data && data.codeNum == -999) {
        setResErrorCode(data.codeNum);
        errL = "Connection error!!!";
        setResErrorMsg(errL + "-" + resErrorCode);
      } else {
        setResErrorCode(data.codeNum);
        data.errorList.map((el) => {
          errL = errL + el.msg;
        });
        setResErrorMsg(errL + "-" + resErrorCode);
      }
    }
  });

  if (isLoading) return <div>로딩중..</div>;
  if (error) { // 에러가 안잡힌다.
    { clog("IN LOGIN : ERR : " + error.name) }
    { clog("IN LOGIN : ERR : " + error.stack) }
    { clog("IN LOGIN : ERR : " + JSON.stringify(error)) }
  }

  if (isAuth) { navigate("/"); }

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
    $("#" + activeLayer + ".popup-layer").css("top", ($(window).height() - $("#" + activeLayer).outerHeight()) / 2 + $(window).scrollTop() + "px");
    $("#" + activeLayer + ".popup-layer").css("left", ($(window).width() - $("#" + activeLayer).outerWidth()) / 2 + $(window).scrollLeft() + "px");

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
          </div>
          <p className="left__bottom">LS ELECTRIC ©</p>
        </div>
        {/*<!-- //.login__left, 왼쪽영역 -->*/}

        {/*<!-- .login__right, 오른쪽영역 -->*/}
        <div className="login__right">

          <div className="login__form">
            <form action="#" method="" name="loginform">
              <fieldset>
                <legend>로그인 정보 입력</legend>


                <ul className="form__etc">
                  <li>
                    {/*<!--레이어팝업일 경우 클래스에js-open 추가/data-pop 값으로 호출 -->*/}
                    <button type="button" className="btn btn-txt js-open" data-pop="findId" onClick={(e) => layerOpen(e)}><span role="findid">아이디 찾기</span></button>
                    <button type="button" className="btn btn-txt js-open" data-pop="findPw" onClick={(e) => layerOpen(e)}><span role="findpw">비밀번호 찾기</span></button>
                  </li>
                </ul>
                {/*button type="button" className="btn-login"><span>로그인</span></button>*/}
                <button type="button" className="btn-login" onClick={run}><span>로그인</span></button>
              </fieldset>
            </form>
          </div>
          <ul className="join">

          </ul>
          <div className="select-lang">

          </div>
        </div>
        {/*<!-- //.login__right, 오른쪽영역 -->*/}
      </div>
      {/*<!-- //#login -->*/}


      {/*<!-- 아이디 찾기 팝업 -->*/}
      <FindId layerList={layerList} isRunYn={false} />

      {/*<!-- 비밀번호 찾기 팝업 -->*/}
      <FindPw layerList={layerList} isRunYn={false} />


      <div className="dimm"></div> {/*<!-- 레이어팝업 배경 -->*/}


    </>
  );


} export default Login;


