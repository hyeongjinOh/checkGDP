/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author JiHoon Park
 * @contact jhpark@detech.co.kr
 * @date 2022-11-30
 * @brief EHP My Account - 회원 탈퇴 개발
 *
 ********************************************************************/
import axios from "axios";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useRecoilValue, useResetRecoilState, useSetRecoilState } from "recoil";
import * as CONST from "../../utils/Const"
import * as HttpUtil from "../../utils/api/HttpUtil";
import { userInfoLoginState, userInfoState } from "../../recoil/userState";
import { urlState } from "../../recoil/menuState";
/**
 * @brief My Account - 회원 탈퇴 컴포넌트
 * @param 
 * @returns react components
 */


function UserWithdrawal(props) {
    //const [userInfo, setRecoilUserInfo] = useRecoilState(userInfoState);
    const userInfo = useRecoilValue(userInfoLoginState);
    const userId = props.userId;
    const resetRecoilUserInfo = useResetRecoilState(userInfoState);
    const setRecoilUrl = useSetRecoilState(urlState);
    const isOpen = props.userInfoPopup;
    //
    const navigate = useNavigate();
    //
    async function onClickWithdrawal(e) {
        let data: any = null;
        data = await HttpUtil.PromiseHttp({
            httpMethod: "POST",
            appPath: `/api/v2/auth/logout?userId=${userInfo.userId}`,
            appQuery: {
                userId: userInfo.userId,
            },
            userToken: userInfo.loginInfo.token,
        });

        if (data) {
            if (data.codeNum == 200) {
                // Y/N 체크 필요?
                sessionStorage.removeItem(CONST.STR_TOKEN);
                sessionStorage.removeItem(CONST.STR_TOKEN_EXPIRETIME);
                ////////////////////////
                localStorage.removeItem(CONST.STR_KEEP_LOGIN_YN);
                localStorage.removeItem(CONST.STR_USERID);
                localStorage.removeItem(CONST.STR_USERROLE);
                localStorage.removeItem(CONST.STR_REFRESHTOKEN);
                localStorage.removeItem(CONST.STR_REFRESHTOKEN_EXPIRETIME);
                //
                resetRecoilUserInfo();
               
            } else {
            }
        }

        let data2: any = null;
        data2 = await HttpUtil.PromiseHttp({
            "httpMethod": "DELETE",
            "appPath": "/api/v2/user",
            appQuery: {
                userId: userId,
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data2) {
            if (data2.codeNum == 200) {
                setRecoilUrl(CONST.URL_LOGIN);
                navigate(CONST.URL_EHP);
                alert("사용자 탈퇴가 완료되었습니다.")
            } else {
            }
        }
    }

    return (
        <>
            {/* <!-- 회원탈퇴완료 팝업 --> */}
            {/* <div id="pop-withdrawalcomplete" className="popup-layer js-layer layer-out hidden popup-basic popup-withdrawalcomplete">
                <div className="page-detail">
                    <div className="popup__head">
                        <h1>사용자 탈퇴</h1>
                        <button className="btn btn-close js-close" onClick={(e) => onClickWithdrawal(e)}><span className="hide">닫기</span></button>
                    </div>
                    <div className="popup__body">
                        <p>사용자 탈퇴가 완료되었습니다.</p>
                    </div>
                    <div className="popup__footer">
                        {/* <button type="button" className="bg-gray btn btn-close js-close hide"><span>취소</span></button> */}
            {/*      <br /><br /><br />
                    </div>
                </div>
            </div>  */}

            <div id="pop-withdrawal" className="popup-layer js-layer layer-out hidden popup-basic popup-withdrawal">
                <div className="page-detail">
                    <div className="popup__head">
                        <h1>사용자 탈퇴</h1>
                        <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
                    </div>
                    <div className="popup__body">
                        <p>회원 탈퇴를 하시겠습니까?<br />가입 시 등록된 모든 정보가 삭제됩니다.</p>
                    </div>
                    <div className="popup__footer">
                        <button type="button" className="bg-gray btn btn-close js-close"><span>취소</span></button>
                        <button type="button" className=" js-open" data-pop="pop-withdrawalcomplete" onClick={(e) => onClickWithdrawal(e)}><span>확인</span></button>
                    </div>
                </div>
            </div>


            {/* <!-- //회원탈퇴완료 팝업 --> */}
        </>
    );
}

export default UserWithdrawal;