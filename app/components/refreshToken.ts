/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */  
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-05-29
 * @brief refreshToken module
  *
 ********************************************************************/
//utils
import * as CONST from "../utils/Const"
import clog from "../utils/logUtils"
import * as cUtils from "../utils/commUtils"
import * as HttpUtil from "../utils/api/HttpUtil";
//
import useInterval from "../utils/hooks/useInterval";

 /**
  * @brief AutoLogin 컴포넌트
  * @param 
  * @returns react components
  */
export async function refreshTokenFn() {
  const userId = localStorage.getItem(CONST.STR_USERID); // to localStorage
  const refreshToken = localStorage.getItem(CONST.STR_REFRESHTOKEN); // to localStorage
  const refreshTokenExpireTime = localStorage.getItem(CONST.STR_REFRESHTOKEN_EXPIRETIME); // to localStorage
  let data:any = null;

  clog("IN AUTOLOGIN SUB IS USERID : " + userId);
  clog("IN AUTOLOGIN SUB TOKEN : " + refreshToken);
  clog("IN AUTOLOGIN SUB TOKEN : " + refreshTokenExpireTime);

  data = await HttpUtil.PromiseHttp({
    "httpMethod" : "POST", 
    "appPath" : `/api/v2/auth/token?token=${refreshToken}`, 
    "appQuery" : {"token":refreshToken},
    "userToken" : "",
  });

  if (data) {
    if ( data.codeNum == 200 ) {
    } else { // api if
      // need error handle
    }
  }
  return data;
}


export default refreshTokenFn;
