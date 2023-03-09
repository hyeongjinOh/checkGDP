/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-09-01
 * @brief EHP 사업장 관리 개발
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
/**
 * @brief EHP 사업장 관리 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
//component
import SiteTree from "./SiteTree"
import MngtSite from "./MngtSite";
import MngtZone from "./zone/MngtZone";


function SiteMain(props){


  //
  const [isMobile, setIsMobile] = useState(false);
  const [adminType, setAdminType] = useState("COMPANY"); // COMPANY, ZONE
  // LIST, CREATE, UPDATE, DELETE, READ, BATCH
  const [workMode, setWorkMode] = useState("READ"); 

  const defaultTree =()=>(setSelTree({ 
    company:{companyId:"", companyName:""}, 
    reload : false
  }));
  const [selTree, setSelTree] = useState({ 
    company:{companyId:"", companyName:""}, 
    reload : false    
  });

  function handleSelTree(adminType, treeInfo) {
    clog("IN SITETREE : handleCurTree : " + adminType);
    setAdminType(adminType);
    setSelTree(treeInfo);
  }

  return(
  <>
  {/* <!--area__left, 왼쪽 영역--> */}
  <SiteTree
    selTree={selTree}
    setSelTree={handleSelTree}
    workMode={workMode}
    setWorkMode={setWorkMode}
    adminType={adminType}
    setAdminType={setAdminType}
  />
  {/* <!--area__right, 오른쪽 영역--> */}
  {(adminType==="COMPANY")&&<MngtSite
    isMobile={isMobile}
    setIsMobile={setIsMobile}
    selTree={selTree}
    setSelTree={handleSelTree}
    workMode={workMode}
    setWorkMode={setWorkMode}
    setPopWin={props.setPopWin}
  />}
    {(adminType==="ZONE")&&<MngtZone
    isMobile={isMobile}
    setIsMobile={setIsMobile}
    selTree={selTree}
    setSelTree={handleSelTree}
    workMode={workMode}
    setWorkMode={setWorkMode}
    setPopWin={props.setPopWin}
  />}
  {/* <!--//area__right, 오른쪽 영역--> */}
  </>
  )
}

export default SiteMain;