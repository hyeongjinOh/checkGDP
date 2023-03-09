
/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author HyeongJin O
 * @contact hjoh@detech.co.kr
 * @date 2022-09-28
 * @brief EHP 사용자 메일 인증 개발
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
// utils
import { useTrans } from "../../../utils/langs/useTrans";
import * as i18n from "../../../utils/langs/i18nUtils";
import * as HttpUtil from "../../../utils/api/HttpUtil";
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const";
import OkEhpCertification from "./OkEhpCertification";
import NoEhpCertification from "./NoEhpCertification";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

/**
 * @brief EHP 이메일 인증 컴포넌트
 * @param - 
 * @returns react components
 */


function EhpCertification() {
  // recoil
  const apiLang = useRecoilValue(getApiLangState);

  const [ok, setOk] = useState("");
  // params 
  const location = useLocation();
  //params - search
  const params = new URLSearchParams(location.search);
  const navigate = useNavigate();

  let email = params.get(CONST.STR_EMAIL);
  let key = params.get(CONST.STR_KEY);


  const { data: data, run } = useAsync({
    promiseFn: HttpUtil.PromiseHttp,
    // deferFn: HttpUtil.Http,
    httpMethod: "POST",
    appPath: "/api/v2/auth/key/valid",
    appQuery: {
      userId: email,
      token: key,
      language: apiLang,
      // (langs ==='')?Korean
    },
  });


  useEffect(() => {
    if (data) {
      if (data.codeNum == CONST.API_200) {
        setOk("ok");
      } else {
        localStorage.setItem(CONST.STR_EMAIL, email);
        if (data.errorList.filter((err) => err.field == "userId")) {
          alert(data.errorList.map(err => err.msg ))
          navigate("/");
        } else {
          setOk("no");
        }

      }
    }
  }, [data])





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
            <p>Welcome to LS ELECTRIC</p>
               {/* <!--221214, h1 영역 수정(이미지로)--> */}
            <h1><img src={require("/static/img/logo_login_title.png")} alt="e-Health Portal" /></h1>
          </div>
          <p className="left__bottom">LS ELECTRIC ©</p>
        </div>
        {/*<!-- //.login__left, 왼쪽영역 -->*/}

        {/*<!-- .login__right, 오른쪽영역 / 220923 인증완료추가 -->*/}
        {(ok == "") &&
          <div className="login__right webmailok">
            <h2>
              <p className="tit">인증 중입니다</p>
            </h2>
            <div className="login__form">
              <form action="#" method="" name="loginform">
                <fieldset>
                  {/* <p className="login__info">메일 인증이 정상적으로 완료 되었습니다.</p> */}
                  {/* <button type="button" className="btn-login"><span>로그인하기</span></button> */}
                  {/*   <button type="button" className="btn-login" onClick={(e) => pages("ok")} ><span>페이지 테스트1</span></button>
                  <button type="button" className="btn-login" onClick={(e) => pages("no")} ><span>페이지 테스트2</span></button> */}
                </fieldset>
              </form>
            </div>
          </div>
        }
        {(ok == "ok") &&
          <OkEhpCertification />
        }
        {(ok == "no") &&
          <NoEhpCertification />
        }
        {/*<!-- //.login__right, 오른쪽영역 -->*/}
      </div>

      {/*<!-- //#login -->*/}
      {/* <!-- 220602 로딩(전체) --> */}
      {/* <!-- //220602 로딩(전체) -- */}
    </>
  )
}

export default EhpCertification;





