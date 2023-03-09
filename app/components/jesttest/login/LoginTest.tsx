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
import React, { useState } from "react";
import { useAsync } from "react-async";
import { useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";

import styled from "styled-components";
import "/static/css/style.css"
import $ from "jquery"
import { useTrans } from "../../../utils/langs/useTrans";
import * as HttpUtil from "../../../utils/api/HttpUtil";
import MainLayout from "../../../components/layout/MainLayout";

import { langState } from '../../../recoil/langState';
import * as i18n from '../../../utils/langs/i18nUtils';
import { tokenToString } from "typescript";
import TreeMenu from "../../main/treemenu/TreeMenu";


/**
 * @brief EHP 로그인 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
function Login() {
  // use recoil
  const [langs, setLangs] = useRecoilState(langState);
  const [userId, setUserId] = useState("test1@test.com");
  const [userPw, setUserPw] = useState("1234qwer!@");
  const { data: data, error, isLoading, reload, run } = useAsync({
    //promiseFn: HttpUtil.getUsers,
    deferFn: HttpUtil.Http,
    httpMethod: "POST",
    appPath: "/api/v2/auth/login",
    appQuery: {
      userId: userId,
      password: userPw,
    },
  });
  // useTrans 기능 축약
  const t = useTrans();

  async function exchgLanguage(e, lang: string) {
    console.log("login comp : exchange : " + lang);
    //await i18n.init(langs as string);
    await i18n.changeLang(lang);
    // global state 저장/변경
    setLangs(lang);
  }

  if (isLoading) return <div>로딩중..</div>;
  if (error) return <div>Error</div>;
  /*   { // 에러가 안잡힌다.
      { console.log("IN LOGIN : ERR : " + error.name) }
      { console.log("IN LOGIN : ERR : " + error.stack) }
      { console.log("IN LOGIN : ERR : " + JSON.stringify(error)) }
    };  */
  if (data) {
    localStorage.setItem("tonke", data.body.token)
    return (
      <MainLayout />
    );
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
            {/*<p>Welcome to LS ELECTRIC</p>*/}
            <p>{t("MESSEAGE.T1오신걸환영합니다")}</p>
            <h1>e-Health Checker</h1>
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
                    <div className="input__area">
                      <input type="text" id="userId" placeholder="아이디" value={userId} onChange={(e) => setUserId(e.target.value)} />
                    </div>
                  </li>
                  <li>
                    <label htmlFor="userPw" className="hide">비밀번호 입력</label>
                    <div className="input__area">
                      <input type="password" id="userPw" placeholder="비밀번호" value={userPw} onChange={(e) => setUserPw(e.target.value)} />
                    </div>
                  </li>
                </ul>
                <button type="button" data-testid="loginButton" className="btn-login" onClick={run}><span>로그인</span></button>
              </fieldset>
            </form>
          </div>
          <ul className="join">
            <li>
              <p>아직 회원이 아니신가요?</p>
              <button type="button" className="btn btn-txt js-open" data-pop="join" >
                <span>회원가입</span>
              </button>
            </li>
            <li className="join__sns">
              <button test-id={"kakao"} type="button" className="btn btn-sns kakao"  >
                <span className="hide">카카오계정으로 로그인</span>
              </button>
              <button test-id={'naverIdLogin'} type="button" className="btn btn-sns naver"  >
                <span className="hide">네이버계정으로 로그인</span>
              </button>
            </li>
          </ul>


        </div>
        {/*<!-- //.login__right, 오른쪽영역 -->*/}
      </div>
      {/*<!-- //#login -->*/}
    </>
  );


}


export default Login;