/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-05-09
 * @brief 비동기 Http 함수
 *
 ********************************************************************/
 import React from 'react';
 import axios from 'axios';
 import { useAsync } from "react-async";
 //
 import * as HttpConf from './HttpConf';
 //
 import clog from "../../utils/logUtils";
 import * as CUTIL from "../../utils/commUtils";
 import * as FILEUTILS from "../../utils/file/fileUtil";
 import * as CONST from "../../utils/Const";
 

function decodeUrlPath(url) {
  var pos = url.indexOf("?");
  if ( pos < 0 ) { // not found
    pos = url.length;
  }
  var spath = url.substring(0, pos);
  var params = url.substring(pos+1, url.length);
  
  var psp = spath.split("/");
  var path = "";
  for (var i = 0; i < psp.length; i ++) {
    if (psp[i].length <= 0) continue;
    path = path + "/" + decodeURIComponent(psp[i]);
  }

  var sp = params.split("&");
  for (var i = 0; i < sp.length; i ++ ) {
    if ( sp[i].length <=0 ) continue;
    if ( i === 0) {
      path = path + "?";
    } else {
      path = path + "&";
    }
    var p = sp[i].indexOf("=");
    if ( p < 0 ) {
      path = path + decodeURIComponent(sp[i]);
    } else {
      path = path + sp[i].substring(0, p) + "=" + decodeURIComponent(sp[i].substring(p+1, sp[i].length));
    }
  }
  return path;
}

function encodeUrlPath(url) {
  var pos = url.indexOf("?");
  if ( pos < 0 ) { // not found
    pos = url.length;
  }
  var spath = url.substring(0, pos);
  var params = url.substring(pos+1, url.length);
  
  var psp = spath.split("/");
  var path = "";
  for (var i = 0; i < psp.length; i ++) {
    if (psp[i].length <= 0) continue;
    path = path + "/" + encodeURIComponent(psp[i]);
  }
  

  var sp = params.split("&");
  for (var i = 0; i < sp.length; i ++ ) {
    if ( sp[i].length <=0 ) continue;
    if ( i === 0) {
      path = path + "?";
    } else {
      path = path + "&";
    }
    var p = sp[i].indexOf("=");
    if ( p < 0 ) {
      path = path + encodeURIComponent(sp[i]);
    } else {
      path = path + sp[i].substring(0, p) + "=" + encodeURIComponent(sp[i].substring(p+1, sp[i].length));
    }
  }

  return path;
}


 /**
  * @brief useAync hook : 비동기 HTTP API 호출 - Action 없이 작동
  * @param param0 httpMethod:<string>: GET|POST|PUT ..
  * @param param1 appPath:<string>: API App Path ..
  * @param param2 appQuery:<json>: API App params ..
  * @returns 
  */
 export async function PromiseHttp({ httpMethod, appPath, appQuery, userToken }: any) {
   return (Http([], { httpMethod, appPath, appQuery, userToken }));
 }
 
 /**
  * @brief useAync hook : 비동기 HTTP API 호출 - Action에 의해 작동
  * @param param0 httpMethod:<string>: GET|POST|PUT ..
  * @param param1 appPath:<string>: API App Path ..
  * @param param2 appQuery:<json>: API App params ..
  * @returns 
  */
 export async function Http(args: any[], { httpMethod, appPath, appQuery, userToken }: any) {
   let response;
   let httpResp: any = {
     status: 500,
     codeNum: CONST.API_999,
     data: "",
     body: "",
     errorList: [{ "field": `cntError`, "msg": `Can't connect to API Server(${HttpConf.APIBASE})!! Plz, Contact Admin....` }]
   };
    let appMethod = (httpMethod === "POST") ? "POST" : (httpMethod === "PUT") ? "PUT" : (httpMethod === "GET") ? "GET" : "DELETE";
    if (httpMethod == "POST") {
      appMethod = "POST";
    } else if (httpMethod == "POSTF") {
      appMethod = "POSTF";
    } else if (httpMethod == "PUT") {
      appMethod = "PUT";
    } else if (httpMethod == "GET") {
     appMethod = "GET";
    } else if (httpMethod == "GETF") {
      appMethod = "GETF";
    } else if (httpMethod == "DELETE") {
      appMethod = "DELETE";
    } else if (httpMethod == "DELETEDATA") {
      appMethod = "DELETEDATA";
    } else {
      //setretData('Unknonw API Method!!!!');
      return ("Unknonw API Method!!!!");
    }
    clog("HTTPUTILS : PATH : " + appPath + " : DATA : " + JSON.stringify(appQuery) + " : TOKEN : " + userToken);
    appPath = encodeUrlPath(appPath);
    //clog("HTTPUTILS : PATH EX : " + appPath + " : DATA : " + JSON.stringify(appQuery) + " : TOKEN : " + userToken);

   try {
     if (appMethod == "POST") {
       response = await axios({
         headers: { "Authorization": userToken },
         method: appMethod, //httpMethod,
         url: HttpConf.APIBASE + appPath,
         data: appQuery
       });
      } else if (appMethod == "POSTF") {
        response = await axios({
          headers: { "Authorization": userToken, "Content-Type": "multipart/form-data" },
          method: "POST", //httpMethod,
          url: HttpConf.APIBASE + appPath,
          data: appQuery
        });
      } else if (appMethod == "PUT") {
        response = await axios({
          headers: { "Authorization": userToken },
          method: appMethod, //httpMethod,
          url: HttpConf.APIBASE + appPath,
          data: appQuery
        });
      } else if (appMethod == "DELETE") {
       response = await axios({
         headers: { "Authorization": userToken },
         method: appMethod, //httpMethod,
         url: HttpConf.APIBASE + appPath,
         params: appQuery
       });
     } else if (appMethod == "DELETEDATA") {
       response = await axios({
         headers: { "Authorization": userToken },
         method: "DELETE", //httpMethod,
         url: HttpConf.APIBASE + appPath,
         data: appQuery
       });
     } else if (appMethod == "GET") {
       response = await axios({
         headers: { "Authorization": userToken },
         method: appMethod, //httpMethod,
         url: HttpConf.APIBASE + appPath,
         //url: HttpConf.APIBASE + encodeURIComponent(appPath),
         params: appQuery
       });
     } else if (appMethod == "GETF") {
       response = await axios({
         //headers : {"Authorization" : userToken},
         method: "GET",
         responseType: "blob",
         //url : HttpConf.APIBASE + appPath,
         url: appPath,
         params: appQuery
       });
     }
     (appMethod == "GETF") && clog(appMethod + " : " + JSON.stringify(response));
     httpResp.status = await response.status;
     httpResp.codeNum = response.data.hasOwnProperty("codeNum") ? await response.data.codeNum : 200;
     httpResp.errorList = response.data.hasOwnProperty("errorList") ? await response.data.errorList : [{ "msg": "" }];
     httpResp.data = await response.data;
     httpResp.body = httpResp.data.hasOwnProperty('list') ? response.data.list : response.data.data;
     //httpResp.body = await httpResp.data.data;
   } catch (err) {
     httpResp.status = await err.response.status;
     //httpResp.codeNum = await err.response.data.codeNum;
     httpResp.codeNum = err.response.data.hasOwnProperty("codeNum") ? await err.response.data.codeNum : 9999;
     httpResp.errorList = err.response.data.hasOwnProperty("errorList") ? await err.response.data.errorList : [{ "msg": "Undefined error!" }];
     httpResp.data = await err.response.data;
     httpResp.body = await err.response.data;
 
     clog('HttpUtils ERR data : ' + JSON.stringify(err.response.status));
     clog('HttpUtils ERR MSG : ' + JSON.stringify(err.response.data.errorList));
     if (err.reponse) {
       clog('HttpUtils ERR data : RESPONSE : ' + "요청이 이루어졌으며 서버가 2XX의 범위를 벗어나는 상태코드로 응답을 함.");
     } else if (err.request) {
       clog('HttpUtils ERR data : REQUEST : ' + "요청이 이루어 졌으나, 응답을 받지 못했습니다. ");
     } else {
       clog('HttpUtils ERR data : ' + "오류를 발생시킨 요청을 설정하는 중에 문제가 발생함");
       clog('HttpUtils ERR data : UNKNOWN : ' + err.message);
     }
   } finally {
     //clog("IN HttpUtil : FINALLY : " + JSON.stringify(httpResp));
     return httpResp;
   }
 }
 
 // 다운로드 파일 이름을 추출하는 함수
 const extractDownloadFilename = (response) => {
   clog("IN HTTP UTILS : extractDownloadFilename : " + JSON.stringify(response));
   const disposition = response.headers["content-disposition"];
   clog("IN HTTP UTILS : extractDownloadFilename : " + disposition);
   let fileName = "검사성적서";
   if (!CUTIL.isnull(disposition)) {
     fileName = decodeURI(
       disposition
         .match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)[1]
         .replace(/['"]/g, "")
     );
   }
   return fileName;
 };
 
 
 export async function fileDownload2(fileName, fileUrl) {
   //let response;
   if (CUTIL.isnull(fileUrl)) return;
   clog("IN HTTP UTILS : " + fileUrl);
 
   try {
     axios({
       //headers : {"Authorization" : userToken},
       url: fileUrl,
       method: "GET",
       responseType: "blob",
       //url : HttpConf.APIBASE + appPath,
     }).then((response) => {
       clog("IN HTTPUTILS : FILEDOWNLOAD : " + JSON.stringify(response));
       // 다운로드(서버에서 전달 받은 데이터) 받은 바이너리 데이터를 blob으로 변환합니다.
       const blob = new Blob([response.data]);
       // 특정 타입을 정의해야 경우에는 옵션을 사용해 MIME 유형을 정의 할 수 있습니다.
       // const blob = new Blob([this.content], {type: 'text/plain'})
 
       // blob을 사용해 객체 URL을 생성합니다.
       const fileObjectUrl = window.URL.createObjectURL(blob);
 
       // blob 객체 URL을 설정할 링크를 만듭니다.
       const link = document.createElement("a");
       link.href = fileObjectUrl;
       link.style.display = "none";
 
       // 다운로드 파일 이름을 지정 할 수 있습니다.
       // 일반적으로 서버에서 전달해준 파일 이름은 응답 Header의 Content-Disposition에 설정됩니다.
       //link.download = extractDownloadFilename(response);
       const disposition = response.headers["content-disposition"];
 
 
       // 다운로드 파일의 이름은 직접 지정 할 수 있습니다.
       link.download = fileName;
 
       // 링크를 body에 추가하고 강제로 click 이벤트를 발생시켜 파일 다운로드를 실행시킵니다.
       document.body.appendChild(link);
       link.click();
       link.remove();
 
       // 다운로드가 끝난 리소스(객체 URL)를 해제합니다.
       window.URL.revokeObjectURL(fileObjectUrl);
       /*출처: https://7942yongdae.tistory.com/174 [프로그래머 YD:티스토리]*/
     });
   } catch (err) {
     clog("IN HTTPUTILS : FILE DOWNLOAD : file download Error......." + fileName);
     clog("IN HTTPUTILS : FILE DOWNLOAD : file download Error......." + JSON.stringify(err.response));
   }
 }
 
 
 export async function fileDownload(fileName, fileUrl) {
   //let response;
   if (CUTIL.isnull(fileUrl)) return;
   clog("IN HTTP UTILS : " + fileUrl);
 
   try {
     axios({
       url: fileUrl,
       method: "GET",
       responseType: "blob",
     }).then((response) => {
       clog("IN HTTPUTILS : FILEDOWNLOAD : " + JSON.stringify(response));
       const disposition = response.headers["content-disposition"]; // for file name
       clog("IN HTTP UTILS : Headers : " + JSON.stringify(response.headers));
       clog("IN HTTP UTILS : Header.disposition : " + disposition);
 
       FILEUTILS.saveToFile_Chrome(fileName, response.data);
     });
   } catch (err) {
     clog("IN HTTPUTILS : FILE DOWNLOAD : file download Error......." + fileName);
     clog("IN HTTPUTILS : FILE DOWNLOAD : file download Error......." + JSON.stringify(err.response));
   }
 }
 
 
 // PDF 다운로드
 export async function fileDownload_EhcReport(reportName, reportId, userToken) {
   let data: any = null;
   data = await PromiseHttp({
     "httpMethod": "GET",
     "appPath": `/api/v2/report/${reportId}`,
     "appQuery": {
     },
     userToken: userToken,
   });
   if (data) {
     if (data.codeNum == 200) {
        clog("donwload db URL : " + data.body.fileLink);
        fileDownload(decodeURI(`${reportName}_진단점검리포트.PDF`), data.body.fileLink);
     } else {
 
     }
   }
 }
 
 export async function fileDownload_WithPdfViewer(reportName, reportId, userToken) {
   if (CUTIL.isnull(reportId)) return;
 
   let data: any = null;
   data = await PromiseHttp({
     "httpMethod": "GET",
     "appPath": `/api/v2/report/${reportId}`,
     "appQuery": {
     },
     userToken: userToken,
   });
   if (data) {
     if (data.codeNum == 200) {
       window.open(
         `${CONST.URL_COMM_PDFVIEWER}?${CONST.STR_PARAM_DATA + CONST.STR_PARAM_PDFNM}=${reportName}_진단점검리포트.PDF&${CONST.STR_PARAM_DATA + CONST.STR_PARAM_PDFID}=${data.body.fileLink}`,
         "_blank",
         "noreferrer");
     }
   }
 }
 
 
 
 function genGUUID() {
   let s0 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   let s1 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   let s2 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   let s3 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   let s4 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   let s5 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   let s6 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   let s7 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   return (s0 + s1 + '-' + s2 + '-' + s3 + '-' + s4 + '-' + s5 + '-' + s6 + s7);
 }
 
 function genUUID() {
   let s0 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   let s1 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   let s2 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   let s3 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   let s4 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   let s5 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   let s6 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   let s7 = ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
   return (s0 + s1 + '-' + s2 + '-' + s3 + '-' + s4 + '-' + s5 + '-' + s6 + s7);
 }
 
 /*
 */
 export async function API_reportView(serialNo) {
   let ret = null;
 
   try {
     await axios.post('https://eaiprod.ls-electric.com/service/rest', {
       request: {
         header: {
           "IF_ID": "IF_SRD_EHEALTH_TRM_0001",
           "IF_GUUID": genGUUID(),
           "IF_UUID": genUUID(),
           "IF_DATETIME": Date.now()
         },
         body: {
           "IF_TOTAL_CNT": "0",
           "IF_SPLIT_CNT": "0",
           "IF_SPLIT_SEQ": "0",
           "IF_REQ_DATA": { "SERIAL": serialNo }
         }
       },
     }).then((resp) => {
       //clog("HEADER : " + JSON.stringify(resp.data.response.header));
       //clog("BODY : " + JSON.stringify(resp.data.response.body));
       //clog("STATUS : " + JSON.stringify(resp.status));
       if (resp.status == 200) {
         ret = resp.data.response.body;
       }
     })
   } catch (err) {
   }
   return ret;
 }
 
 
 
 export function resultCheck(isLoading, result) {
   //clog("result Check : CODE NUM : " + isLoading + " : " + JSON.stringify(result));  
   var err_url = "";
   if (!isLoading) {
     if (result === null) {
       err_url = CONST.URL_SYSTEM_ERROR;
       //clog("result Check : DETAIL : CODE NUM : NULL ");  
     } else if (result.codeNum === CONST.API_999) {
       err_url = CONST.URL_SYSTEM_ERROR;
       //clog("result Check : DETAIL : CODE NUM : 999 : " + CONST.API_999);  
     } else if (result.codeNum !== CONST.API_200) {
       err_url = CONST.URL_NOT_FOUND;
       //clog("result Check : DETAIL : CODE NUM : NOTOK : " + result.codeNum);  
     }
   }
 
   return err_url;
 }