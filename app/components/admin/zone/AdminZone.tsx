/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author JiHoon Park
 * @contact jhpark@detech.co.kr
 * @date 2022-07-19
 * @brief EHP 회사/사업장/세부사업장 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";

// utils
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils"

//component
import AdminTree from "../AdminTree"
import ZoneView from "./ZoneView";
import NoZoneView from "./NoZoneView";
import ZoneList from "./ZoneList";
import ZoneInsert from "./ZoneInsert";
import ZoneInsertAdmin from "./ZoneInsertAdmin";
import CompZoneInsertAdmin from "./CompZoneInsertAdmin";

/**
 * @brief EHP 사업장 전기실 관리 - 회사/사업장 컴포넌트 , 반응형 동작
 * @param -
 * @returns react components
 */


function AdminZone(props) {
  //const [isMobile, setIsMobile] = useState(false);
  //const [adminType, setAdminType] = useState("ZONE"); // ZONE, SUBZONE, ROOM
  //props
  const isMobile = props.isMobile;
  const adminType = props.adminType;
  const setParentAdminType = props.setAdminType;
  const curTree = props.curTree;
  const setParentCurTree = props.setCurTree;
  const workMode = props.workMode;
  const setParentWorkMode = props.setWorkMode;
  
/*
  const [curTree, setCurTree] = useState({ 
    company:{companyId:"", companyName:""}, 
    zone:{zoneId:"", zoneName:""}, 
    subZone:{subZoneId:"", subZoneName:""}, 
    room:{roomId:"", roomName:""}, 
    spg:{spgId:-1, spgName:""}
  });


  function handleCurTree(adminType, treeInfo) {
    clog("IN SITETREE : handleCurTree : " + adminType);
    setParentAdminType(adminType);
    setCurTree(treeInfo);
  }
*/
  //clog("IN ADMINZONE : INIT : " + isMobile + " : adminType : " + adminType + " : " + JSON.stringify(curTree));
  //clog("IN ADMINZONE : INIT : " + isMobile + " : adminType : " + adminType + " : " + workMode);
  return (
  <>
    {/*<!--탭별 내용 영역 : 선택된 탭에 current 자동 생성, 첫번째 내용에는 current 넣기(기본노출내용) -->*/}
    {/*<!-- Tab1 -->*/}
      {(curTree.zone.zoneId.length > 0)
        ?((workMode==="READ")||(workMode==="INSREAD"))&&
        <ZoneView
          isMobile={props.isMobile}
          workMode={props.workMode}
          curTree={curTree}
          setIsMobile={props.setIsMobile}
          setAdminType={props.setAdminType}
          setWorkMode={props.setWorkMode}
          setPopWin={props.setPopWin}
        />
        :((workMode==="READ")||(workMode==="INSREAD"))&&
        <NoZoneView
          setIsMobile={props.setIsMobile}
          curTree={curTree}
          setPopWin={props.setPopWin}
        />
      }
      {(workMode==="LIST")&&
        <ZoneList
          isMobile={props.isMobile}
          setIsMobile={props.setIsMobile}
          curTree={curTree}
          setCurTree={props.setCurTree} // adminType 변경됨
          setWorkMode={props.setWorkMode}
          setPopWin={props.setPopWin}       
        />
      }
      {(workMode==="CREATE")&&
        <ZoneInsert
          isMobile={props.isMobile}
          setIsMobile={props.setIsMobile}
          curTree={curTree}
          setCurTree={props.setCurTree} // adminType 변경됨
          setWorkMode={props.setWorkMode}
          setPopWin={props.setPopWin}       
        />
      }
      {/**ADMIN MODE */}
      {(workMode==="ADMIN_CREATE")&&
        <ZoneInsertAdmin
          isMobile={props.isMobile}
          setIsMobile={props.setIsMobile}
          curTree={curTree}
          setCurTree={props.setCurTree} // adminType 변경됨
          setWorkMode={props.setWorkMode}
          setPopWin={props.setPopWin}       
        />
      }
      {(workMode==="ADMIN_COMP_CREATE")&&
        <CompZoneInsertAdmin
          isMobile={props.isMobile}
          setIsMobile={props.setIsMobile}
          curTree={curTree}
          setCurTree={props.setCurTree} // adminType 변경됨
          setWorkMode={props.setWorkMode}
          setPopWin={props.setPopWin}       
        />
      }

  </>
  )
};
export default AdminZone;