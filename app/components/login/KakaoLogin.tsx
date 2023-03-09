/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved.
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-07-28
 * @brief EHP 소셜로그인 - Kakao 개발
 *
 ********************************************************************/
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState, useRecoilValue, } from "recoil";
// recoil
import { userInfoState, authState, } from "../../recoil/userState";
import { urlState } from "../../recoil/menuState";
// utils
import * as HttpUtil from "../../utils/api/HttpUtil";
import clog from "../../utils/logUtils";
import * as CONST from "../../utils/Const";
import * as USERUTILS from "../../utils/user/userUtils"

export default function KakaoLogin(props) {

    const { setSnsId, setSnsName, setSocialType } = props;
    const setRecoilUserInfo = useSetRecoilState(userInfoState); // recoil userState
    const setRecoilUrl = useSetRecoilState(urlState);
    //
    const isAuth = useRecoilValue(authState);
    // kakao sdk import
    const navigate = useNavigate();
    const kakaoScript = document.createElement("script");
    kakaoScript.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
    document.head.appendChild(kakaoScript);
    kakaoScript.onload = () => {
        //SDK 초기화
        window.Kakao.init("579b2c4677db8962432b6f7d7a230907");
        // clog("kakao 초기화 :" + window.Kakao.isInitialized());
    }

    function openKakao() {
        window.Kakao.Auth.login({
            success: (auth) => {
                console.log("Kakao 토큰", auth.access_token);

                async function onClickKakao() {
                    let data: any = null;
                    data = await HttpUtil.PromiseHttp({
                        httpMethod: "POST",
                        appPath: "/api/v2/auth/oauth/kakao/login",
                        appQuery: {
                            "access_token": auth.access_token
                        },
                    });
                    if (data) {
                        if (data.codeNum == 200) {
                            if (data.data.msg == "success") {
                                //////////////////////////////////////sessionStorage
                                sessionStorage.setItem(CONST.STR_TOKEN, data.body.token);
                                sessionStorage.setItem(CONST.STR_TOKEN_EXPIRETIME, data.body.tokenExpireTime);
                                /////////////////////////////////////localStorage
                                // localStorage.setItem(CONST.STR_USERID, userId);
                                localStorage.setItem(CONST.STR_USERROLE, data.body.role);
                                localStorage.setItem(CONST.STR_REFRESHTOKEN, data.body.refreshToken);
                                localStorage.setItem(CONST.STR_REFRESHTOKEN_EXPIRETIME, data.body.refreshTokenExprieTime);;
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
                                        role: detailUserInfo.role,
                                        language: detailUserInfo.language,
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
                                localStorage.setItem("kakao", auth.access_token);
                            } else if (data.data.msg == "fail") {

                                clog("JionPage")
                                setSnsId(data.body.email);
                                setSnsName(data.body.nickName);
                                setSocialType(data.body.social);
                                const btn = document.getElementById('kakaojoin')
                                btn.click();
                                // 페이지 이동
                            }
                        }
                    }
                }
                onClickKakao();

            },
            fail: (err) => {
                console.log(err);
            },
        });
    }



    return (
        <>
            <button type="button" className="btn btn-sns kakao" onClick={openKakao} >
                <span className="hide">카카오계정으로 로그인</span>
            </button>
        </>
    )

}

