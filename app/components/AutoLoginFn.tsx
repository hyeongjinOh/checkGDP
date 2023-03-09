/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */  
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-05-29
 * @brief Local Clock 시계 컴포넌트
 * 10초당 AutoLogin check 및 로그인 연장 (조건에 따라)
 *
 ********************************************************************/
import React, {useState, useEffect, useRef} from "react";
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
// recoil state
import { userInfoState, authState, autoLoginState, autoLoginLockState, } from '../recoil/userState';
//utils
import clog from "../utils/logUtils"
import * as CONST from "../utils/Const"
import * as CUTIL from "../utils/commUtils"
import refreshTokenFn from "./refreshToken";
import * as USERUTILS from "../utils/user/userUtils"
//
import useInterval from "../utils/hooks/useInterval";

 /**
  * @brief AutoLogin 컴포넌트
  * @param 
  * @returns react components
  */
export function AutoLoginFn() {
  const isAuth = useRecoilValue(authState); // recoil value
  const userInfo = useRecoilValue(userInfoState); // recoil userState
  const setRecoilUserInfo = useSetRecoilState(userInfoState); // recoil userState
  //
  const tokenTime = (isAuth)
        ?Date.parse(userInfo.loginInfo.tokenExpireTime)
        :Date.parse(CUTIL.curTimeString()); // UTC 기준

  //const [count, setCount] = useState(0);
  const savedCallback:any = useRef();


  async function callback() {
    const keepLoginYn = localStorage.getItem(CONST.STR_KEEP_LOGIN_YN);
    const curTime = Date.parse(CUTIL.curTimeString());  // UTC 기준
    const diffSec = Math.round((tokenTime-curTime)/1000);
/*
    clog("CALL BACK REFRESH SESSION : " + sessionStorage.getItem('refreshToken') + " : KEEP LOGIN : " + keepLoginYn);
    clog("CALL BACK IS AUTH : " + isAuth);
    clog("CALL BACK TOKEN TIME : " + userInfo.loginInfo.tokenExpireTime);
    
    //data = (isAuth)&&SilentLoginFn();
*/
    let isAutoRun:boolean = false;
    let isSAutoRun:boolean = false;
    //isAutoRun = (isAuth && (keepLoginYn == "Y"))?true:false;
    // isAuth : false 인경우
    // 0. tokenExpireTime이 경과한 경우
    // 0. token이 없는 경우 : 로그인 페이지 인 경우
    isAutoRun = ( (keepLoginYn == "Y" ))?true:false;

    const lsUserId = localStorage.getItem(CONST.STR_USERID); // to localStorage
    const lsRefreshToken = localStorage.getItem(CONST.STR_REFRESHTOKEN); // to localStorage
    const lsRefreshTokenExpireTime = localStorage.getItem(CONST.STR_REFRESHTOKEN_EXPIRETIME); // to localStorage
    let data:any = null;

    //clog("IN AUTOLOGIN : CALL BACK IS USERID : " + lsUserId);
    if ( isAutoRun ) {
      //clog("AUTOLOGIN : DIFF : " + CONST.NUM_DIFFTIME_SEC + " : " + diffSec);
      if ( isAuth ) {
        if ( (diffSec > 0) && (diffSec <= CONST.NUM_DIFFTIME_SEC)  ) { // 토큰 만료 10분전
          clog("KEEPLOGIN : ExpireTime 연장 : " + CONST.NUM_DIFFTIME_SEC + " : " + diffSec);
          isSAutoRun = true;
        } else {
        // 로그인 유지이고....tokenExpireTime이 경과 안한경우
        // clog("KEEPLOGIN : SLEEP : " + CONST.NUM_DIFFTIME_SEC + " : " + userInfo.loginInfo.tokenExpireTime);
        }
      } else {
        // 로그인 유지이고....token이 없는 경우
        if ( ( lsUserId != null ) && (lsUserId.length > 0 ) ) {
          isSAutoRun = true;
        }
      }
    }
    if ( isSAutoRun ) {
      data = await refreshTokenFn();
      if (data) {
        if ( data.codeNum == 200 ) {
          clog("CALL BACK IS USERID : " + lsUserId);
          clog("CALL BACK IS NEW TOKEN : " + data.body.token);
          clog("CALL BACK IS NEW TOKEN : " + data.body.tokenExpireTime);
          //////////////////////////////////////sessionStorage
          sessionStorage.setItem(CONST.STR_TOKEN, data.body.token);
          sessionStorage.setItem(CONST.STR_TOKEN_EXPIRETIME, data.body.tokenExpireTime);
          /////////////////////////////////////localStorage
          ////localStorage.setItem(CONST.STR_USERID, lsUserId);
          ////localStorage.setItem(CONST.STR_USERROLE, data.body.role);
          ////localStorage.setItem(CONST.STR_REFRESHTOKEN, data.body.refreshToken);
          ////localStorage.setItem(CONST.STR_REFRESHTOKEN_EXPIRETIME, data.body.refreshTokenExprieTime);

          const loginInfo = {
            "role" : userInfo.loginInfo.role,
            "token" : data.body.token,
            "tokenExpireTime":data.body.tokenExpireTime,
            "refreshToken": lsRefreshToken,
            "refreshTokenExpireTime": lsRefreshTokenExpireTime
          };
          (async()=>{ // IFFE(Immediately Invoked Function Expression)은 함수가 정의되자마자 실행되는 자바스크립트 기술입니다.
            const detailUserInfo = await USERUTILS.getDetailUserInfoR(loginInfo);
            setRecoilUserInfo({
              loginTime: detailUserInfo.loginTime,
              userId: detailUserInfo.userId,
              email : detailUserInfo.email,
              userName: detailUserInfo.userName,
              phoneNumber: detailUserInfo.phoneNumber,
              companyName: detailUserInfo.companyName,
              zoneName: detailUserInfo.zoneName,
              department: detailUserInfo.department,
              role : detailUserInfo.role,
              language : detailUserInfo.language,
              classificationCode : detailUserInfo.classificationCode,
              classification : detailUserInfo.classification,
              //socialDtoOut: detailUserInfo.socialDtoOut,
              agreeMailReceipt: detailUserInfo.agreeMailReceipt,
              agreeTos: detailUserInfo.agreeTos,
              agreePersonalInfo: detailUserInfo.agreePersonalInfo,
              agreeData: detailUserInfo.agreeData,
              loginInfo: loginInfo,
            });
          })();          
        

        } else { // api if
          // need error handle
        }
      }
    }
  } // end of Function
  useEffect(() => {
    callback();
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    let id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, []);
 
}

export default AutoLoginFn;
