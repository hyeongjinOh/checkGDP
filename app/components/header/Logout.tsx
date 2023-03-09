
/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author JiHoon Park
 * @contact jhpark@detech.co.kr
 * @date 2022-08-17
 * @brief  로그아웃 컴포넌트
 * 
 *
 ********************************************************************/
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
//
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { urlState } from '../../recoil/menuState';
//
import { userInfoState, userInfoLoginState } from "../../recoil/userState";
//
import * as CONST from "../../utils/Const"
import * as HttpUtil from "../../utils/api/HttpUtil";
import axios from "axios";
import clog from "../../utils/logUtils";


 /**
 * @brief 로그아웃 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */



function Logout(props) {
  //const [userInfo, setRecoilUserInfo] = useRecoilState(userInfoState);
  const userInfo = useRecoilValue(userInfoLoginState);

  const resetRecoilUserInfo = useResetRecoilState(userInfoState);
  const setRecoilUrl = useSetRecoilState(urlState);

  const isOpen = props.userInfoPopup;
  //
  const navigate = useNavigate();
  //
  async function onClickLogout(e) {
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
        //
        setRecoilUrl(CONST.URL_LOGIN);
        navigate(CONST.URL_EHP);

      } else {
      }
    }
  }



  return (
    <React.Fragment>
      {/*<!--220708, 로그아웃 팝업  -->*/}
      <div id="pop-logout" className="popup-layer js-layer layer-out hidden popup-basic popup-logout">
        <div className="page-detail">
          <div className="popup__head">
            <h1>Logout</h1>
            <button className="btn btn-close"><span className="hide">닫기</span></button>
          </div>
          <div className="popup__body">
            <p>로그아웃하시겠습니까</p>
          </div>
          <div className="popup__footer">
            <button type="button" className="bg-gray js-close"><span>취소</span></button>
            <button type="button" className="js-close" onClick={(e) => onClickLogout(e)}><span>확인</span></button>
          </div>
        </div>
      </div>
      {/*<!--//220708, 로그아웃 팝업  -->*/}
    </React.Fragment>
  )
}


export default Logout;