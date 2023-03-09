/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-09-22
 * @brief EHP 사용자 관리 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";


// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"
/**
 * @brief EHP 사용자 관리 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
//component
function NoUserView(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //props
  const curTree = props.curTree;
  const setParentIsMobile = props.setIsMobile;
  const setParentPopWin = props.setPopWin;


  return (
  <>
    {/*<!--area__right, 오른쪽 영역-->*/}
    <div className="area__right_content workplace__info workplace__main info__input newtype" >      
      <p className="txt-ready">
        <span>회사를 선택해주세요.</span>
      </p>
    </div>
    {/*<!--//area__right, 오른쪽 영역-->*/}
  </>
  )
};
export default NoUserView;