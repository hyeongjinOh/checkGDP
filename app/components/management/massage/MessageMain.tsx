/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-09-05
 * @brief EHP 메시지 관리 개발
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
import MessageTree from "./MessageTree"
import CheckCRUD from "./check/CheckCRUD"
import ErrorCRUD from "./error/ErrorCRUD"
import HttpCRUD from "./http/HttpCRUD"
import AlarmCRUD from "./alarm/AlarmCRUD";
/**
 * @brief EHP 메시지 관리 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
function MessageMain(props){
  //
  const [isMobile, setIsMobile] = useState(false);
  const [adminType, setAdminType] = useState("CHECK"); // CHECK, ERROR, HTTP
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
  {/* <!--area__left, 왼쪽 영역--> */}
  <MessageTree
    selTree={selTree}
    setSelTree={handleSelTree}
    workMode={workMode}
    setWorkMode={setWorkMode}
    adminType={adminType}
    setAdminType={setAdminType}
    setPopWin={props.setPopWin}
  />
  {/* <!--area__right, 오른쪽 영역--> */}
  {(adminType==="CHECK")&&<CheckCRUD
    isMobile={isMobile}
    setIsMobile={setIsMobile}
    selTree={selTree}
    setSelTree={handleSelTree}
    workMode={workMode}
    setWorkMode={setWorkMode}
    setPopWin={props.setPopWin}
  />}
  {(adminType==="ERROR")&&<ErrorCRUD
    isMobile={isMobile}
    setIsMobile={setIsMobile}
    selTree={selTree}
    setSelTree={handleSelTree}
    workMode={workMode}
    setWorkMode={setWorkMode}
    setPopWin={props.setPopWin}
  />}
  {(adminType==="HTTP")&&<HttpCRUD
    isMobile={isMobile}
    setIsMobile={setIsMobile}
    selTree={selTree}
    setSelTree={handleSelTree}
    workMode={workMode}
    setWorkMode={setWorkMode}
    setPopWin={props.setPopWin}
  />}
    {(adminType==="ALARM")&&<AlarmCRUD
    isMobile={isMobile}
    setIsMobile={setIsMobile}
    selTree={selTree}
    setSelTree={handleSelTree}
    workMode={workMode}
    setWorkMode={setWorkMode}
    setPopWin={props.setPopWin}
  />}
  </>
  )
}

export default MessageMain;