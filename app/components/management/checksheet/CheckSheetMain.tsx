/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-10-01
 * @brief EHP Check Sheet 관리 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
import { loadingBoxState } from "../../../recoil/menuState";
import { langState } from '../../../recoil/langState';

//utils
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils"

//component
import CheckSheetTree from "./CheckSheetTree"
import SpgCheckCRUD from "./spgcheck/SpgCheckCRUD"
/**
 * @brief EHP Check Sheet 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */


function MenuMain(props){
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
  
  //
  const [isMobile, setIsMobile] = useState(false);
  const [adminType, setAdminType] = useState("SPG-VCB"); // SPG
  // LIST, CREATE, UPDATE, DELETE, READ, BATCH, SET
  const [workMode, setWorkMode] = useState("INIT"); 
  
  const defaultTree={ 
    spg:{spgId:"", spgName:""}, 
    reload : false
  };
  const [selTree, setSelTree] = useState(defaultTree);
  //
  const [spgVersion, setSpgVersion] = useState(null);
  const [versionList, setVersionList] = useState(null);
  function handleSelTree(adminType, treeInfo) {
    // => 선택 후, version 정보 가지고 오는 형태로 바꿈.....
    setSpgVersion(null);
    setVersionList(null);
    //
    setAdminType(adminType);
    setSelTree(treeInfo);
    //
    clog("IN MAIN : HANDLE TREE : " + JSON.stringify(treeInfo) + "" + workMode);
    if ( (treeInfo.reload)||((treeInfo.spg.spgName.length > 0) && (workMode === "LIST")) ) {
    //if ( (treeInfo.spg.spgName.length > 0) ) {
      doGetSpgVersion(treeInfo);
    }
  }

  async function doGetSpgVersion(tree) {
    //clog("doGetSpgVersion : " + JSON.stringify(tree));
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod" : "GET",
      "appPath" : `/api/v2/checksheet/spg/versions`,
      "appQuery" : {
        "spgName" : tree.spg.spgName,
      },
      "userToken" : userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
      "watch" : workMode+selTree
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        clog("doGetSpgVersion : " + JSON.stringify(data.body));
        setVersionList(data.body);
        data.body.filter((sver)=>sver.enabled).map((sver, idx)=>{
          if (idx === 0 ) setSpgVersion(sver);
        })
      }
    }

    return data;
  }

  function handleSpgVersion(version) {
    clog("IN MAIN : HANDLE TREE : " + JSON.stringify(selTree) + "" + workMode);
    if ( (selTree.reload)||((selTree.spg.spgName.length > 0) && (workMode === "LIST")) ) {
    //if ( (treeInfo.spg.spgName.length > 0) ) {
      doGetSpgVersion(selTree);
    }
  }


  clog("CHECK SPG MAIN : INIT : " + workMode);
  return(
  <>
  {/* <!--area__left, 왼쪽 영역--> */}
  <CheckSheetTree
    selTree={selTree}
    setSelTree={handleSelTree}
    workMode={workMode}
    setWorkMode={setWorkMode}
    adminType={adminType}
    setAdminType={setAdminType}
    setPopWin={props.setPopWin}
  />
  {/* <!--area__right, 오른쪽 영역--> */}
  {(adminType.includes("SPG"))&&<SpgCheckCRUD
    isMobile={isMobile}
    setIsMobile={setIsMobile}
    selTree={selTree}
    setSelTree={handleSelTree}
    workMode={workMode}
    setWorkMode={setWorkMode}
    adminType={adminType}
    setPopWin={props.setPopWin}
    //
    //pageInfo={pageInfo}
    //setPageInfo={setPageInfo}
    versionList={versionList}
    spgVersion={spgVersion}
    setSpgVersion={setSpgVersion}
    //setSpgVersion={handleSpgVersion}
  />}

  {/*<!--//area__right, 오른쪽 영역--> */}
  </>
  )
}

export default MenuMain;