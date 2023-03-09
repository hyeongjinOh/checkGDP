/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-07-09
 * @brief Javascript 파일 처리 함수
 *
 ********************************************************************/
import * as HTTPUTILS from "../api/HttpUtil"
import clog from "../logUtils";

/* 
function saveToFile_Chrome(fileName, content) {
    var blob = new Blob([content], { type: 'text/plain' });
    var objURL = window.URL.createObjectURL(blob);
            
    window.Url
    // 이전에 생성된 메모리 해제
    if (window.__Xr_objURL_forCreatingFile__) {
        window.URL.revokeObjectURL(window.__Xr_objURL_forCreatingFile__);
    }
    window.__Xr_objURL_forCreatingFile__ = objURL;
    var a = document.createElement('a');
    a.download = fileName;
    a.href = objURL;
    a.click();
}
*/

export function saveToFile_Chrome(fileName, content) {
    //var blob = new Blob([content], { type: 'text/plain' });
    //20221020 jhpark 수정
    var blob = new Blob([content], { type: 'multipart/form-data' });

    var objURL = window.URL.createObjectURL(blob);
            
    var a = document.createElement('a');
    a.download = fileName;
    clog("IN FILE  UTILS : " +  " : " + __dirname);
    clog("IN FILE  UTILS : " +  " : " + __filename);
    clog("IN FILE  UTILS : " +  " : " + a.download);
    a.href = objURL;
    a.style.display = "none";
    // for new window
    a.target = "_blank";
    a.rel='noreferrer';
    //
    document.body.appendChild(a); //
    a.click();
    a.remove(); //
    window.URL.revokeObjectURL(objURL);

}