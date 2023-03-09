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
import clog from "../../utils/logUtils";
import * as CUTIL from "../../utils/commUtils"

//component
import AdminTree from "./AdminTree"
import ZoneView from "./zone/ZoneView";
import NoZoneView from "./zone/NoZoneView";
import SubZoneView from "./subZone/SubZoneView";
import RoomView from "./room/RoomView";

/**
 * @brief EHP 운영 관리 컴포넌트 , 반응형 동작
 * @param -
 * @returns react components
 */


function AdminSite(props) {
  const [isMobile, setIsMobile] = useState(false);
  const [adminType, setAdminType] = useState("ZONE"); // ZONE, SUBZONE, ROOM

  const [curTree, setCurTree] = useState({ 
    company:{companyId:"", companyName:""}, 
    zone:{zoneId:"", zoneName:""}, 
    subZone:{subZoneId:"", subZoneName:""}, 
    room:{roomId:"", roomName:""}, 
    spg:{spgId:-1, spgName:""}
  });


  function handleCurTree(adminType, treeInfo) {
    clog("IN SITETREE : handleCurTree : " + adminType);
    setAdminType(adminType);
    setCurTree(treeInfo);
  }

  clog("IN ADMINSITE : INIT : " + isMobile + " : adminType : " + adminType + " : " + JSON.stringify(curTree));
  return (
  <>
    {/*<!--탭별 내용 영역 : 선택된 탭에 current 자동 생성, 첫번째 내용에는 current 넣기(기본노출내용) -->*/}
    {/*<!-- Tab1 -->*/}
    <div id="tab-1" className="tabcontent current">
      <AdminTree 
        isMobile={isMobile}
        curTree={curTree}
        setCurTree={handleCurTree} // adminType 변경됨
        adminType={adminType}
      />
      {(curTree.zone.zoneId.length > 0)
        ?(adminType==="ZONE")&&<ZoneView
          setIsMobile={setIsMobile}
          curTree={curTree}
          setPopWin={props.setPopWin}
        />
        :(adminType==="ZONE")&&<NoZoneView
          setIsMobile={setIsMobile}
          curTree={curTree}
          setPopWin={props.setPopWin}
        />
      }
      {(curTree.zone.zoneId.length > 0)
        &&(adminType==="SUBZONE")&&<SubZoneView
          setIsMobile={setIsMobile}
          curTree={curTree}
          setPopWin={props.setPopWin}
        />
      }
      {(curTree.room.roomId.length > 0)
        &&(adminType==="ROOM")&&<RoomView
          setIsMobile={setIsMobile}
          curTree={curTree}
          setPopWin={props.setPopWin}
        />
      }


    </div>

  </>
  )
};
export default AdminSite;