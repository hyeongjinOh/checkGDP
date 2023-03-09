/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-24
 * @brief EHP 설비수명 - 수명인자 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";


// utils
import clog from "../../../../utils/logUtils";
import * as CONST from "../../../../utils/Const"
import * as HTTPUTIL from "../../../../utils/api/HttpUtil"
import * as CUTIL from "../../../../utils/commUtils"

//component
function NoDeviceLifeViewTest(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //props
  const curTree = props.curTree;
  const setParentIsMobile = props.setIsMobile;
  const setParentPopWin = props.setPopWin;





  return (
    <>
      {/*<!--area__right, 오른쪽 영역-->*/}
      <div className="area__right" >
        <p className="txt-ready">
          <span>전기실을 선택해주세요.</span>
        </p>
      </div>
      {/*<!--//area__right, 오른쪽 영역-->*/}
    </>
  )
};
export default NoDeviceLifeViewTest;

