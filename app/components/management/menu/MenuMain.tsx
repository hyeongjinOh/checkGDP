/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-09-20
 * @brief EHP 메뉴 관리 개발
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
import MenuTree from "./MenuTree"
import AuthCRUD from "./auth/AuthCRUD";
import LangCRUD from "./lang/LangCRUD";
/**
 * @brief EHP 메뉴 관리 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function MenuMain(props){
  //
  const [isMobile, setIsMobile] = useState(false);
  const [adminType, setAdminType] = useState("AUTH"); // AUTH, LANG
  // LIST, CREATE, UPDATE, DELETE, READ, BATCH, SET
  const [workMode, setWorkMode] = useState("READ"); 

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
  <MenuTree
    selTree={selTree}
    setSelTree={handleSelTree}
    workMode={workMode}
    setWorkMode={setWorkMode}
    adminType={adminType}
    setAdminType={setAdminType}
  />
  {/* <!--area__right, 오른쪽 영역--> */}
  {(adminType==="AUTH")&&<AuthCRUD
    isMobile={isMobile}
    setIsMobile={setIsMobile}
    selTree={selTree}
    setSelTree={handleSelTree}
    workMode={workMode}
    setWorkMode={setWorkMode}
    setPopWin={props.setPopWin}
  />}
  {(adminType==="LANG")&&<LangCRUD
    isMobile={isMobile}
    setIsMobile={setIsMobile}
    selTree={selTree}
    setSelTree={handleSelTree}
    workMode={workMode}
    setWorkMode={setWorkMode}
    setPopWin={props.setPopWin}
  />}
  {/*<!--//area__right, 오른쪽 영역--> */}
  </>
  )
}

export default MenuMain;