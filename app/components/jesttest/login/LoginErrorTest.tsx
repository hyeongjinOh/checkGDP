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

function LoginErrorTest() {
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
          <p className="left__bottom">LS ELECTRIC ©</p>
        </div>
        {/*<!-- //.login__left, 왼쪽영역 -->*/}

        {/*<!-- .login__right, 오른쪽영역 -->*/}
        <div className="login__right">
          <div className="login__form">
            <form action="#" method="" name="loginform">
              <fieldset>
                <legend>로그인 정보 입력</legend>
                <ul className="form__input">
                  <li>
                    <label htmlFor="userId" className="hide">아이디 입력</label>
                    <div className="input__area">{/*<!-- 220520 입력인풋(인풋종류상관없이 전부다.체크박스라디오제외)에 무조건  div className="input__area" 태그로 감쌈... / 전체화면 공통사항임. -->*/}
                      <input type="text" id="userId" placeholder="아이디"
                        className={(resErrorCode == 200) ? "" : "input-error"}
                        data-testid="idInput"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)} />
                    </div>
                  </li>
                  <li>
                    <label htmlFor="userPw" className="hide">비밀번호 입력</label>
                    <div className="input__area">
                      <input type="password" id="userPw" placeholder="비밀번호"
                        className={(resErrorCode == 200) ? "" : "input-error"}
                        data-testid="pwInput"
                        value={userPw}
                        onChange={(e) => setUserPw(e.target.value)} />
                      <p data-testid="idpwErrorMsg" className="input-errortxt">{resErrorMsg}{/*아이디 또는 비밀번호가 일치하지 않습니다*/}</p>
                    </div>
                  </li>
                </ul>
                <ul className="form__etc">
                </ul>
                <button data-testid="idpwButton" type="button" className="btn-login" onClick={run}><span>로그인</span></button>
              </fieldset>
            </form>
          </div>
          <ul className="join">

          </ul>
        </div>
        {/*<!-- //.login__right, 오른쪽영역 -->*/}
      </div>
      {/*<!-- //#login -->*/}

      <div className="dimm"></div> {/*<!-- 레이어팝업 배경 -->*/}

    </>
  );


} export default LoginErrorTest;

function LoginIdInputArea(props) {
  const errCode = props.errCode;
  const userId = props.userId;
  const setUserId = props.handleFunc;
  return (
    <>
      <input type="text" id="userId" placeholder="아이디" className={(errCode == 200) ? "" : "input-error"} value={userId} onChange={(e) => setUserId(e.target.value)} />
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
      <input type="password" id="userPw" placeholder="비밀번호"
        className={(errCode == 200) ? "" : "input-error"}
        value={userPw}
        onChange={(e) => setUserPw(e.target.value)} />
      {
        (errCode === 200) ?
          "" :
          <p className="input-errortxt">{errList}{/*아이디 또는 비밀번호가 일치하지 않습니다*/}
            {/* errList.map((msg, idx)=>(msg))*/}
          </p>
      }
    </>
  );
}

