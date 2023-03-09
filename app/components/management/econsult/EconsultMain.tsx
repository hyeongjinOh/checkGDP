/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-11-05
 * @brief EHP 이메일 상담 관리 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";

//utils
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils"

//component
import EconsultCRUD from "./EconsultCRUD";
/**
 * @brief EHP 이메일 상담 관리 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */


function EconsultMain(props){
  //
  const [isMobile, setIsMobile] = useState(false);
  const [adminType, setAdminType] = useState("EMAIL"); // CHECK, ERROR, HTTP
  // LIST, CREATE, UPDATE, DELETE, READ, BATCH, SET
  const [workMode, setWorkMode] = useState("LIST"); 

  const defaultTree={ 
    menu:{menuId:"", menuName:""}, 
    reload : false
  };
  const [selTree, setSelTree] = useState(defaultTree);

  function handleSelTree(adminType, treeInfo) {
    clog("IN SITETREE : handleCurTree : " + adminType);
    setAdminType(adminType);
    setSelTree(treeInfo);
  }

  return(
  <>
  {/* <!--area__right, 오른쪽 영역--> */}
  {(adminType==="EMAIL")&&<EconsultCRUD
    isMobile={isMobile}
    setIsMobile={setIsMobile}
    selTree={selTree}
    setSelTree={handleSelTree}
    workMode={workMode}
    setWorkMode={setWorkMode}
    setPopWin={props.setPopWin}
    handleNodata={props.handleNodata}
  />}
  </>
  )
}

export default EconsultMain;