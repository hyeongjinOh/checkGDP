/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-08-30
 * @brief EHP ManageMent - ApprovalManageMent 개발
 *
 ********************************************************************/
import React, { useEffect, useState } from "react";
//
import { useAsync } from "react-async";
// recoil && state
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
//

import NewSubscriberApprovalManageMnet from "./UserApproval";
import SiteApprovalManageMent from "./SiteApproval";
import CheckApprovalManageMent from "./CheckItemApproval";
/**
 * @brief EHP ManageMent - ApprovalManageMent 개발 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */

function ApprovalMain(props) {
  //recoil
  //
  return (
    <>
      {/*<!--area__left, 왼쪽 영역-->*/}
      <div className="area__left">
        <NewSubscriberApprovalManageMnet
          setPopWin={props.setPopWin} //pop
        />
      </div>
      {/*<!--//area__left, 왼쪽 영역-->*/}

      {/*<!--area__right, 가운데 영역-->*/}
      <div className="area__right">
        <SiteApprovalManageMent 
          setPopWin={props.setPopWin} //pop
        />
      </div>
      {/*<!--//area__right, 가운데 영역-->*/}

      {/*<!--area__right-end, 제일 오른쪽 영역-->*/}
      <div className="area__right-end">
        <CheckApprovalManageMent 
        setPopWin={props.setPopWin} //pop
        />
      </div>
      {/*<!--//area__right-end, 제일 오른쪽 영역-->*/}
    </>
  )
};
export default ApprovalMain;


