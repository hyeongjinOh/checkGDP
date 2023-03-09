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

// utils
import clog from "../../../../utils/logUtils";
import * as CUTIL from "../../../../utils/commUtils"

//component
import NoSpgView from "../common/NoSpgView";
import SpgCheckList from "./SpgCheckList";
import SpgCheckNewList from "./SpgCheckNewList";
/**
 * @brief EHP Check Sheet 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function CheckCRUD(props) {
  //const [isMobile, setIsMobile] = useState(false);
  //const [adminType, setAdminType] = useState("ZONE"); // ZONE, SUBZONE, ROOM
  //props
  const versionList = props.versionList;
  const spgVersion = props.spgVersion;
  //
  const isMobile = props.isMobile;
  const adminType = props.adminType;
  const setParentAdminType = props.setAdminType;
  const selTree = props.selTree;
  const setParentSelTree = props.setSelTree;
  const workMode = props.workMode;
  const setParentWorkMode = props.setWorkMode;
  
  return (
  <>
    {/*<!--탭별 내용 영역 : 선택된 탭에 current 자동 생성, 첫번째 내용에는 current 넣기(기본노출내용) -->*/}
    {((workMode==="INIT")||(CUTIL.isnull(spgVersion)===null))&&<NoSpgView
        isMobile={props.isMobile}
        setIsMobile={props.setIsMobile}
        selTree={selTree}
        setSelTree={props.setSelTree} // adminType 변경됨
        //setAdminType={props.setAdminType}
        workMode={props.workMode}
        setWorkMode={props.setWorkMode}
        setPopWin={props.setPopWin}
      />
    }
        
    {(selTree.spg.spgName.length > 0)
      &&(workMode==="LIST")
      &&(spgVersion)
      &&<SpgCheckList
        isMobile={props.isMobile}
        setIsMobile={props.setIsMobile}
        selTree={selTree}
        setSelTree={props.setSelTree} // adminType 변경됨
        adminType={props.adminType}
        //setAdminType={props.setAdminType}
        workMode={props.workMode}
        setWorkMode={props.setWorkMode}
        setPopWin={props.setPopWin}
        //
        //pageInfo={props.pageInfo}
        //setPageInfo={props.setPageInfo}
        versionList={props.versionList}
        spgVersion={props.spgVersion}
        setSpgVersion={props.setSpgVersion}
      />
    }

  {(selTree.spg.spgName.length > 0)
      &&(workMode==="NLIST")
      /*&&(spgVersion)*/
      &&<SpgCheckNewList
        isMobile={props.isMobile}
        setIsMobile={props.setIsMobile}
        selTree={selTree}
        setSelTree={props.setSelTree} // adminType 변경됨
        adminType={props.adminType}
        //setAdminType={props.setAdminType}
        workMode={props.workMode}
        setWorkMode={props.setWorkMode}
        setPopWin={props.setPopWin}
        //
        //pageInfo={props.pageInfo}
        //setPageInfo={props.setPageInfo}
        versionList={props.versionList}
        spgVersion={props.spgVersion}
        setSpgVersion={props.setSpgVersion}
      />
    }
  </>
  )
};
export default CheckCRUD;