/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author JiHoon Park
 * @contact jhpark@detech.co.kr
 * @date 2022-10-25
 * @brief EHPworkorder - EhealthCheck 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";

//utils
import * as CONST from "../../../../utils/Const"
import * as HTTPUTIL from "../../../../utils/api/HttpUtil"
import clog from "../../../../utils/logUtils";
import * as CUTIL from "../../../../utils/commUtils"

//component
import EhealthCheckTree from "./EhealthCheckTree";
import EhealthCheckCRUD from "./EhelthCheckCRUD";
/**
 * @brief EHP WorkOrder - EhealthCheck 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */


function EhealthCheckMain(props){
  //
  const [isMobile, setIsMobile] = useState(false);
  const [adminType, setAdminType] = useState("EHC"); // EHC, INSPECTION, HISTORY, CHANGE
  // LIST, CREATE, UPDATE, DELETE, READ, BATCH, SET
  const [workMode, setWorkMode] = useState("LIST"); 
  const [isTreeOpen, setIsTreeOpen] = useState(true);

  const defaultTree={ 
    company:{companyId:"", companyName:""}, 
    zone:{zoneId:"", zoneName:""}, 
    subZone:{subZoneId:"", subZoneName:""}, 
    reload : false
  };
  const [selTree, setSelTree] = useState(defaultTree);

  function handleSelTree(adminType, treeInfo) {
    clog("IN SITETREE : handleCurTree : " + adminType);
    setAdminType(adminType);
    setSelTree(treeInfo);
  }
  clog("IN EHC MAIN : " + adminType + " : " + workMode);
  return(
  <>
  {/* <!--area__left, 왼쪽 영역--> */}
  {<EhealthCheckTree
    isTreeOpen={isTreeOpen}
    setIsTreeOpen={setIsTreeOpen}
    selTree={selTree}
    setSelTree={handleSelTree}
    workMode={workMode}
    setWorkMode={setWorkMode}
    adminType={adminType}
    setAdminType={setAdminType}
  />
  }
  {/* <!--area__right, 오른쪽 영역-->*/}
  {(adminType==="EHC")&&<EhealthCheckCRUD
    isTreeOpen={isTreeOpen}
    isMobile={isMobile}
    setIsMobile={setIsMobile}
    selTree={selTree}
    setSelTree={handleSelTree}
    workMode={workMode}
    setWorkMode={setWorkMode}
    setNodata={props.setNodata}
    setPopWin={props.setPopWin}
  />}
  {/*{(adminType==="LANG")&&<LangCRUD
    isMobile={isMobile}
    setIsMobile={setIsMobile}
    selTree={selTree}
    setSelTree={handleSelTree}
    workMode={workMode}
    setWorkMode={setWorkMode}
    setPopWin={props.setPopWin}
  />}
  <!--//area__right, 오른쪽 영역--> */}
  </>
  )
}

export default EhealthCheckMain;