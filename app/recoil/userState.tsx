import { atom, selector, DefaultValue } from "recoil";
import * as CONST from "../utils/Const"
import * as CUTIL from "../utils/commUtils"
import clog from "../utils/logUtils";
import { userInfo } from "os";

// isAuthentication
// Authentication : 인증
// Authorization : 권한부여
export interface loginInfoType {  
  role : string;
  token: string;
  tokenExpireTime: string;
  refreshToken:string;
  refreshTokenExpireTime:string;
}

export interface userInfoType {
  loginTime : string;
  userId : string;
  email : string,
  userName: string,
  phoneNumber: string,
  companyName: string,
  zoneName: string,
  department: string,
  role : string,
  language : string,
  classificationCode : number,
  classification : string
  //socialDtoOut: {},
  agreePersonalInfo: boolean,
  agreeData: boolean,
  agreeMailReceipt: boolean,
  agreeTos: boolean,
  loginInfo : loginInfoType;
}

export const userInfoState = atom<userInfoType>({
  key: 'userInfoState',
  // key의 값은 항상 고유값이어야 합니다.
  default: {
    loginTime:"", 
    userId:"", 
    email : "",
    userName: "",
    phoneNumber: "",
    companyName: "",
    zoneName: "",
    department: "",
    role : "",
    language : "",
    classificationCode : -1,
    classification : "",
    //socialDtoOut: {},
    agreeMailReceipt: false,
    agreeTos: false,
    agreePersonalInfo: false,
    agreeData: false,
  
    loginInfo:{role:"", token:"", tokenExpireTime:"", refreshToken:"", refreshTokenExpireTime:""}
  }
});
// 20220801 by sjpark 
export const userInfoLoginState = selector({
  key: 'userInfoSessionState',
  // key의 값은 항상 고유값이어야 합니다.
  
  get:({get})=>{
    const isAuth = get(authState);
    const userInfo = get(userInfoState);
    let tmpUserInfo = userInfo;
    clog("IN RECOIL : USERINFOLOGINSTATE : " + isAuth + " : USERID : " + userInfo.userId);
    const sesToken = sessionStorage.getItem(CONST.STR_TOKEN);
    const sesUserId = localStorage.getItem(CONST.STR_USERID);

    if ( isAuth && (userInfo.userId.length <= 0) ) {
      return {
        loginTime : userInfo.loginTime, 
        userId:(isAuth && (userInfo.userId.length <= 0))?sesUserId:userInfo.userId,
        email : userInfo.email, 
        userName: userInfo.userName, 
        phoneNumber: userInfo.phoneNumber, 
        companyName: userInfo.companyName, 
        zoneName: userInfo.zoneName, 
        department: userInfo.department,
        role : userInfo.role,
        language : userInfo.language,
        classificationCode : userInfo.classificationCode,
        classification : userInfo.classification,
        agreeMailReceipt: userInfo.agreeMailReceipt,
        agreeTos: userInfo.agreeTos,
        agreePersonalInfo: userInfo.agreePersonalInfo,
        agreeData: userInfo.agreeData,

        loginInfo:{role:"", 
          token:(isAuth && (userInfo.userId.length <= 0))?sesToken:userInfo.loginInfo.token,
          tokenExpireTime:userInfo.loginInfo.tokenExpireTime,
          refreshToken:userInfo.loginInfo.refreshToken,
          refreshTokenExpireTime:userInfo.loginInfo.refreshTokenExpireTime,
        }
      }
    } // isAuth 체크
    return userInfo;
  },
});


//authState
export const authState1 = selector({
  key: 'authState1',
  // key의 값은 항상 고유값이어야 합니다.
  get:({get}) => {
    const userInfo = get(userInfoState);
    
    return ((userInfo.loginInfo.token.length>0)?true:false);
  },
});



export const authState = selector({
  key: 'authState',
  // key의 값은 항상 고유값이어야 합니다.
  get:({get}) => {
    // 로그인 유지와 상관없이 동작
    const curTime = Date.parse(CUTIL.curTimeString());  // UTC 기준
    const userInfo = get(userInfoState);
    //
    let tokenTime = Date.parse(userInfo.loginInfo.tokenExpireTime);
    let diffSec = Math.round((tokenTime-curTime)/1000);
    // 의미없는 체크 인가?
    if ( userInfo.loginInfo.token.length > 0 ) {
      if (diffSec <= 0 ) return false; // 
    }
    // 리프레쉬 등 
    const sesToken = sessionStorage.getItem(CONST.STR_TOKEN);
    const sesTokenExpireTime = sessionStorage.getItem(CONST.STR_TOKEN_EXPIRETIME);
    clog("IN RECOIL : AUTHSTATE : SESSION TOKEN : " + sesToken);
    clog("IN RECOIL : AUTHSTATE : SESSION TOKEN EXTIME : " + sesTokenExpireTime);
    tokenTime = Date.parse(sesTokenExpireTime);
    diffSec = Math.round((tokenTime-curTime)/1000);
    // 사용자 정보 재저장?
    if ( sesToken == null ) {
      return false; // 
    } else if ( (sesToken)&&(sesToken.length > 0) ) {
      if (diffSec <= 0 ) return false; // 
    }
    /*
    const userId = localStorage.getItem(CONST.STR_USERID);
    const userRole = localStorage.getItem(CONST.STR_USERROLE);
    const refreshToken = localStorage.getItem(CONST.STR_REFRESHTOKEN);
    const refreshTokenExpireTime = localStorage.getItem(CONST.STR_REFRESHTOKEN_EXPIRETIME);
    clog("IN RECOIL : LOCAL SESSION userId : " + userId);
    */
    
    return true;
  },
});


//authStateWithLocalStorage
export const authStateWithLocalStorage = selector({
  key: 'authStateWithLocalStorage',
  // key의 값은 항상 고유값이어야 합니다.
  get:({get}) => {
    const userInfo = get(userInfoState);
    const refreshToken = localStorage.getItem(CONST.STR_REFRESHTOKEN); // to localStorage
    const refreshTokenExpireTime = localStorage.getItem(CONST.STR_REFRESHTOKEN_EXPIRETIME); // to localStorage
   
    return ((refreshToken.length>0)?true:false);
  },
});

export interface autoLoginType {
  attemptTimes : number;
  attemptLastTime : string;
}

export const autoLoginState = atom<autoLoginType>({
  key: 'autoLoginState',
  // key의 값은 항상 고유값이어야 합니다.
  default: {attemptTimes:0, attemptLastTime: ""}
});



export const autoLoginLockState = atom<boolean>({
  key: 'autoLoginLockState',
  // key의 값은 항상 고유값이어야 합니다.
  default: false
});