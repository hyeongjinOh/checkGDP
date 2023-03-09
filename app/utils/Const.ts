import * as env from "./envUtils";

export const defWidth = 1920;
//LIST COUNT
export const NUM_WLISTCNT = 10;
export const NUM_MLISTCNT = 3;

//AUTO LOGIN
export const NUM_DIFFTIME_SEC_DEV = 600; //85000;
export const NUM_DIFFTIME_SEC_PROD = 600;
export const NUM_DIFFTIME_SEC = env.isDevelopmentMode
  ? NUM_DIFFTIME_SEC_DEV
  : NUM_DIFFTIME_SEC_PROD;

//LANGUAGES
export const STR_LANG_KOR = "ko_KR";
export const STR_LANG_ENG = "en_US";
export const STR_LANG_CHA = "cn_CH";
export const STR_LANG_JPA = "jp_JA";
//
export const STR_APILANG_KOR = "Korean";
export const STR_APILANG_ENG = "English";
export const STR_APILANG_CHA = "Chinese";
export const STR_APILANG_JPA = "jp_JA";

//Korean, English, Chinese

//ROLE
export const USERROLE_ADMIN = "ROLE_ADMIN";
export const USERROLE_ENGINEER = "ROLE_ENGINEER";
export const USERROLE_USER = "ROLE_USER";
export const USERROLE_NONE = "ROLE_NONE";

//LOGIN STRING KEY
export const STR_USERID = "userId";
export const STR_USERROLE = "role";
export const STR_TOKEN = "token";
export const STR_TOKEN_EXPIRETIME = "tokenExpireTime";
export const STR_REFRESHTOKEN = "refreshToken";
export const STR_REFRESHTOKEN_EXPIRETIME = "refreshTokenExpireTime";
export const STR_KEEP_LOGIN_YN = "keepLoginYn";
export const STR_EHP_MENULIST = "ehpMenuList";
export const STR_EHP_DASHBODRD_CARDORDER = "ehpDashboardCardorder";
export const STR_EHP_DASHBODRD_PIN = "ehpDashboardPin";

// URL PARAM
export const STR_PARAM_DATA = "EHP_EX_DATA";
export const STR_PARAM_PDFID = "EHP_PDF_ID";
export const STR_PARAM_PDFNM = "EHP_PDF_NM";
export const STR_EMAIL = "email";
export const STR_KEY = "key";

//MENU URL
export const URL_EHP = "/";
export const URL_LOGIN = "/login";
export const URL_DASHBOARD = "/dashboard"; // dashboard 추가
export const URL_MAIN_DASHBOARD = "/main";
export const URL_CHECKHISTORY = "/checkhistory";
export const URL_REPORTVIEW = "/reportview";
export const URL_ADMIN = "/admin";
export const URL_ADMIN_SITE = "/adminsite";
export const URL_ADMIN_ITEM = "/adminitem";
export const URL_ADMIN_USER = "/adminuser";
export const URL_APPROVALMANAGEMENT = "/approvalmanagement";
export const URL_USERMANAGEMENT = "/usermanagement";
export const URL_SITEMANAGEMENT = "/sitemanagement";
export const URL_MESSAGEMANAGEMENT = "/messagemanagement";
export const URL_MENUMANAGEMENT = "/menumanagement";
export const URL_CHECKSHEETMANAGEMENT = "/checksheetmanagement";
export const URL_ECONSULTMANAGEMENT = "/econsultmanagement";
////
export const URL_WORKORDERSERVICE = "/workorderservice"; // workorder 교체 요청 // 사용안함
export const URL_SERVICEWORKORDER = "/serviceworkorder"; // workorder
export const URL_EHCWORKORDER = "/ehcworkorder"; // ehc workorder
export const URL_REQUESTWORKORDER = "/requestworkorder"; // 점검출동 workorder
export const URL_HISTORYWORKORDER = "/historyworkorder"; // 사고이력 workorder
export const URL_DEVICECHANGEWORKORDER = "/devicechangeworkorder"; // 노후교체 workorder
//---
export const URL_SERVICEINSPECTION = "/serviceinspection"; // 점검출동요청
export const URL_INSPECTIONCALLSERVICE = "/inspectioncallservice"; // 점검출동요청 교체 요청
export const URL_DEVICESTATUS = "/devicestatus"; // 노후교체 컨설팅
//---
//
export const URL_DEVICESLIFE = "/devicelife";
export const URL_DEVICESLIFEREPORT = "/devicelifereport";
////
export const URL_INTRODUCTIONINQUIRT = "/introductioninquiry";
export const URL_EHC_INTRO = "/ehcintro";
export const URL_HELP = "/help";
export const URL_LANDING = "/landing";

export const URL_NOT_FOUND = "/notfound";
export const URL_SYSTEM_ERROR = "/systemerror";
//
export const URL_COMM_PDFVIEWER = "/pdfviewer";
export const URL_VERIFYEMAIL = "/verifyEmail";
//

//API RESULT
export const API_200 = 200; // HTTP 200
export const API_999 = 999; // unknown system error

//APP FIELD DATA
export const FLD_AUTOFIELD = "autofield";
export const FLD_MSG_DELETE_COMMON = "요청하신 정보가 삭제되었습니다.";
