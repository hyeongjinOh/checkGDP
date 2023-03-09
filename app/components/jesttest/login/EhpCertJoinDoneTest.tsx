/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved.
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-09-28
 * @brief EHP 회원가입 인증 화면 컴포넌트
 *
 ********************************************************************/

import React, { useState, useEffect } from "react";
import { useAsync } from "react-async";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
// design
import styled from "styled-components";
import $ from "jquery";
import "/static/css/login.css";
// recoil
import { langState, getApiLangState } from "../../../recoil/langState";
import { userInfoState, authState } from "../../../recoil/userState";
// utils
import { useTrans } from "../../../utils/langs/useTrans";
import * as i18n from "../../../utils/langs/i18nUtils";
import * as HttpUtil from "../../../utils/api/HttpUtil";
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const";

/**
 * @brief EHP 회원가입 인증 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
function JoinDone(props) {
    // recoil
    const apiLang = useRecoilValue(getApiLangState);
    const userId = sessionStorage.getItem(CONST.STR_USERID)
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
                        <p className="joinok">회원가입이 완료되었습니다.<br />‘{sessionStorage.getItem(CONST.STR_USERID)}’ 메일 주소로 인증 메일이 전송 되었으니,<br />인증 후 계속 진행해 주세요.</p>
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

export default JoinDone;