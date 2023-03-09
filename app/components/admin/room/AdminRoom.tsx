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
import RoomView from "./RoomView";
import RoomInsert from "./RoomInsert";
import RoomUpdate from "./RoomUpdate";
/**
 * @brief EHP 사업장 전기실 관리 - 전기실 컴포넌트 , 반응형 동작
 * @param -
 * @returns react components
 */

function AdminRoom(props) {
  //const [isMobile, setIsMobile] = useState(false);
  //const [adminType, setAdminType] = useState("ZONE"); // ZONE, SUBZONE, ROOM
  const isMobile = props.isMobile;
  const adminType = props.adminType;
  const curTree = props.curTree;
  const workMode = props.workMode;  

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
  clog("IN ADMINROOM : INIT : " + isMobile + " : adminType : " + adminType + " : workMode : " + workMode);

  return (
  <>
    {/*<!--탭별 내용 영역 : 선택된 탭에 current 자동 생성, 첫번째 내용에는 current 넣기(기본노출내용) -->*/}
    {/*<!-- Tab1 -->*/}
      {/*(curTree.room.roomId.length > 0)
        &&<RoomView
          setIsMobile={props.setIsMobile}
          curTree={curTree}
          setPopWin={props.setPopWin}
        />
    */}

      {(workMode==="READ")&&<RoomView
          isMobile={isMobile}
          curTree={curTree}
          setIsMobile={props.setIsMobile}
          setCurTree={props.setCurTree} // adminType 변경됨
          setWorkMode={props.setWorkMode}
          setCurTabMenu={props.setCurTabMenu}
          setPopWin={props.setPopWin}
        />
      }
      {(workMode==="CREATE")&&<RoomInsert
          isMobile={isMobile}
          curTree={curTree}
          setIsMobile={props.setIsMobile}
          setCurTree={props.setCurTree} // adminType 변경됨
          setWorkMode={props.setWorkMode}
          setPopWin={props.setPopWin}
        />
      }
      {(workMode==="UPDATE")&&<RoomUpdate
          isMobile={isMobile}
          curTree={curTree}
          setIsMobile={props.setIsMobile}
          setCurTree={props.setCurTree} // adminType 변경됨
          setWorkMode={props.setWorkMode}
          setPopWin={props.setPopWin}
        />
      }

  </>
  )
};
export default AdminRoom;