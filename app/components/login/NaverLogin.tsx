/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved.
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-07-28
 * @brief EHP 소셜로그인 - Naver 개발
 *
 ********************************************************************/
import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom";
import { useSetRecoilState, } from "recoil";
// recoil
import { userInfoState, authState } from "../../recoil/userState";
import { urlState } from "../../recoil/menuState";
// utils
import * as CONST from "../../utils/Const";
import * as USERUTILS from "../../utils/user/userUtils"
import clog from "../../utils/logUtils";
import * as CUTIL from "../../utils/commUtils";
import * as HttpUtil from "../../utils/api/HttpUtil";
import { APIBASE_DEV } from "../../utils/api/HttpConf";

export default function NaverLogin(props) {
  // 네이버 로그인
  const { setSnsId, setSnsName, setSocialType, setSnsPhone } = props;
  const setRecoilUserInfo = useSetRecoilState(userInfoState); // recoil userState
  const setRecoilUrl = useSetRecoilState(urlState);
  const navigate = useNavigate();
  const naverScript = document.createElement("script");
  naverScript.src = "https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2-nopolyfill.js"
  naverScript.type = "text/javascript"
  document.head.appendChild(naverScript);

  useEffect(()=>{
    naverScript.onload = () => {
      const naverLogin = new window.naver.LoginWithNaverId({
        clientId: "bsmzmBOFqXd9bxOeNZVt",
        // callbackUrl: "http://localhost:8081", // 개발 url
         callbackUrl: "https://e-portal.ls-electric.com", //서버 url
        isPopup: false,
        loginButton: { color: "green", type: 1, height: 50 },
        callbackHandle: true,
      });
      naverLogin.init();
      naverLogin.getLoginStatus(function (status) {
        if (status) {
          
          async function onClickNaver() {
            let data: any = null;
            data = await HttpUtil.PromiseHttp({
              httpMethod: "POST",
              appPath: "/api/v2/auth/oauth/naver/login",
              appQuery: {
                "access_token": naverLogin.accessToken.accessToken
              },
            });
            if (data) {
              if (data.codeNum == 200) {
                if (data.data.msg == "success") {
                  sessionStorage.setItem(CONST.STR_TOKEN, data.body.token);
                  sessionStorage.setItem(CONST.STR_TOKEN_EXPIRETIME, data.body.tokenExpireTimes);
                  // localStorage.setItem(CONST.STR_USERID, userId);
                  localStorage.setItem(CONST.STR_USERROLE, data.body.role);
                  localStorage.setItem(CONST.STR_REFRESHTOKEN, data.body.refreshToken);
                  localStorage.setItem(CONST.STR_REFRESHTOKEN_EXPIRETIME, data.body.refreshTokenExpireTimes);
                  (async () => { // IFFE(Immediately Invoked Function Expression)은 함수가 정의되자마자 실행되는 자바스크립트 기술입니다.
                    const detailUserInfo = await USERUTILS.getDetailUserInfoR(data.body);
                    setRecoilUserInfo({
                      loginTime: detailUserInfo.loginTime,
                      userId: detailUserInfo.userId,
                      email: detailUserInfo.email,
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
                      loginInfo: data.body,
                    });
                  })();
                  setRecoilUrl(CONST.URL_DASHBOARD);
                  navigate("/");
                  localStorage.setItem("naver", naverLogin.accessToken.accessToken);
                } else if (data.data.msg == "fail") {
                  const { mobile } = naverLogin.user;
                  if (CUTIL.isnull(mobile)) return;
                  const phone0 = JSON.stringify(mobile).split("-")[0].substring(1, 4);
                  const phone1 = JSON.stringify(mobile).split("-")[1]
                  const phone2 = JSON.stringify(mobile).split("-")[2].substring(1, 4);
                  const phone = phone0 + phone1 + phone2
                  setSnsId(data.body.email);
                  setSnsName(data.body.name);
                  setSocialType(data.body.social);
                  setSnsPhone(phone);
                  const btn = document.getElementById('naverjoin');
                  btn.click();
                }
              }
            }
          }
          onClickNaver();
        } else {
          // clog("callback 처리에 실패하였습니다.");
  
        }
      });
    }
    
  },[])
  


  return (
    <>
      <button id='naverIdLogin' type="button" className="btn btn-sns naver" >
        <span className="hide">네이버계정으로 로그인</span>
      </button>
    </>
  )
}