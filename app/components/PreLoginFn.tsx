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
 import * as USERUTILS from "../utils/user/userUtils"
 import refreshTokenFn from "./refreshToken";
 //
 import useInterval from "../utils/hooks/useInterval";
 
  /**
   * @brief AutoLogin 컴포넌트
   * @param 
   * @returns react components
   */
 export function PreLoginFn() {
   const isAuth = useRecoilValue(authState); // recoil value
   const userInfo = useRecoilValue(userInfoState); // recoil userState
   const setRecoilUserInfo = useSetRecoilState(userInfoState); // recoil userState

   const savedCallback:any = useRef();
 
 
   async function callback() {
     const keepLoginYn = localStorage.getItem(CONST.STR_KEEP_LOGIN_YN);
     const curTime = Date.parse(CUTIL.curTimeString());  // UTC 기준
     clog("PRELOGIN CALL BACK IS KEEPLOGINYN : " + keepLoginYn);
     let isAutoRun:boolean = false;
     isAutoRun = ( (keepLoginYn == "Y" ) && !isAuth )?true:false;
    
     const userId = localStorage.getItem('userId'); // to localStorage
     const refreshToken = localStorage.getItem('refreshToken'); // to localStorage
     const refreshTokenExpireTime = localStorage.getItem('refreshTokenExpireTime'); // to localStorage
     let data:any = null;
     if ( isAutoRun ) {
       data = await refreshTokenFn();
       if (data) {
         if ( data.codeNum == 200 ) {
           clog("CALL BACK IS USERID : " + userId);
           clog("CALL BACK IS NEW TOKEN : " + data.body.token);
           clog("CALL BACK IS NEW TOKEN : " + data.body.tokenExpireTime);
           const loginInfo = {
            "role" : userInfo.loginInfo.role,
            "token" : data.body.token,
            "tokenExpireTime":data.body.tokenExpireTime,
            "refreshToken": refreshToken,
            "refreshTokenExpireTime": refreshTokenExpireTime
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
     savedCallback.current = callback;
   });
 
   useEffect(() => {
    savedCallback.current();
   }, []);
  
 }
 
 export default PreLoginFn;
 