/**
 * @url /notfound
 * @CONST CONST.URL_NOT_FOUND
 * @menu 없음
 * @mapping 404 오류 화면
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
import NotFound from "../common/notfound/NotFound"

function NotFoundLayout() {
  return (
    <>
    <div id="wrap">
    {/*<!-- #wrap -->*/}
      <Header />
      <NotFound  />
    </div>
    </>
  );
}

export default NotFoundLayout;