
/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author HyeongJin O
 * @contact hjoh@detech.co.kr
 * @date 2022-09-28
 * @brief EHP 사용자 메일 인증 실패 개발
 *
 ********************************************************************/
import React, { useEffect } from "react";
import { useAsync } from "react-async";
// recoil
import {
  useRecoilValue,
  useRecoilState,
  useSetRecoilState,
  useResetRecoilState,
} from "recoil";
import { langState, getApiLangState } from "../../../recoil/langState";
// utils
import * as HttpUtil from "../../../utils/api/HttpUtil";
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const";

/**
 * @brief EHP 이메일 인증 실패 컴포넌트
 * @param - 
 * @returns react components
 */

function NoEhpCertification() {
  // recoil
  const apiLang = useRecoilValue(getApiLangState);
  const userId = localStorage.getItem(CONST.STR_EMAIL)
  const { data: data, run } = useAsync({
    //promiseFn: HttpUtil.getUsers,
    deferFn: HttpUtil.Http,
    httpMethod: "POST",
    appPath: "/api/v2/auth/key",
    appQuery: {
      userId: userId,
      language: apiLang,
      // (langs ==='')?Korean
    },
  });


  useEffect(() => {
    if (data) {
      if (data.codeNum == CONST.API_200) {
        alert("메일 전송을 완료 하였습니다.")
      }else{
        alert(data.errorList.map((err)=>err.msg));
      }
    }
  }, [data])


  return (
    <>

      {/*<!-- .login__right, 오른쪽영역 / 220923 인증완료추가 -->*/}
      <div className="login__right webmailok">
        <h2>
          <p className="tit">인증 실패</p>
        </h2>
        <div className="login__form">
          <form action="#" method="" name="loginform">
            <fieldset>
              <p className="login__info">메일 인증이 실패 되었습니다.</p>
              <button type="button" className="btn-login js-open" data-pop={"join-ok"} onClick={run}><span>인증메일 재발송</span></button>
            </fieldset>
          </form>
        </div>
      </div>
      {/*<!-- //.login__right, 오른쪽영역 -->*/}
      <JoinDone />
    </>
  )
}

export default NoEhpCertification;

function JoinDone(props) {
  // recoil
  const apiLang = useRecoilValue(getApiLangState);
  const userId = localStorage.getItem(CONST.STR_EMAIL)
  const { data: data, run } = useAsync({
    //promiseFn: HttpUtil.getUsers,
    deferFn: HttpUtil.Http,
    httpMethod: "POST",
    appPath: "/api/v2/auth/key",
    appQuery: {
      userId: userId,
      language: apiLang,
      // (langs ==='')?Korean
    },
  });


  useEffect(() => {
    if (data) {
      if (data.codeNum == CONST.API_200) {
        alert("메일 전송을 완료 하였습니다.")
      }
    }
  }, [data])



  return (
    <>
      {/* <!-- 회원가입 완료 팝업 추가 220923 --> */}
      <div id="join-ok" className="popup-layer js-layer layer-out hidden w560 login__popup">
        <div className="popup__head">
          <h1>회원가입</h1>
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        <div className="popup__body joinok-h webmail">
          <div className="complete-txt">
            <p className="joinok">회원가입이 완료되었습니다.<br />‘{localStorage.getItem(CONST.STR_EMAIL)}’ 메일 주소로 인증 메일이 전송 되었으니,<br />인증 후 계속 진행해 주세요.</p>
            <button id="certification" type="button" onClick={run} ><span>인증메일 재발송</span></button>
            <div className="joininfo">
              <p className="tit">인증 메일이 도착하지 않으셨나요?</p>
              <p className="txt">스팸메일함을 확인하거나, 잠시후 다시 시도해 주시기 바랍니다.</p>
            </div>
          </div>
        </div>
      </div>
      {/* <!-- //회원가입 완료 팝업 추가 220923 --> */}
    </>
  )
}





