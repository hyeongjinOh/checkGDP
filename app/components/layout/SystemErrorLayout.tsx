/**
 * @url /systemerror
 * @CONST CONST.URL_SYSTEM_ERROR
 * @menu 없음
 * @mapping 서비스 점검 화면
 */
import React, {useState, useEffect} from "react";
// recoil
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, userInfoState } from '../../recoil/userState';
// css
import "/static/css/style.css"
import "/static/css/content.css"
// utils
import clog from "../../utils/logUtils";
import * as USERUTILS from "../../utils/user/userUtils"
import * as CONST from "../../utils/Const";
// component
import Header from "../header/Header";
import SystemError from "../common/systemerror/SystemError"

function SystemErrorLayout() {
  return (
    <>
    <div id="wrap">
    {/*<!-- #wrap -->*/}
      <Header />
      <SystemError  />
    </div>
    </>
  );
}

export default SystemErrorLayout;