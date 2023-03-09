/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author HyeongJin O
 * @contact hjoh@detech.co.kr
 * @date 2022-07-19
 * @brief EHP 운영관리 - 기기등록 관리 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";

// utils
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils"

//component
import DeviceList from "./DeviceList";
import DeviceInsert from "./DeviceInsert";
import DeviceBatch from "./DeviceBatch";
import DeviceListUpdate from "./DeviceListUpdate";
import NoDeviceView from "./NoDeviceView";

/**
 * @brief EHP 운영관리 -기기등록 관리 컴포넌트 , 반응형 동작
 * @param -
 * @returns react components
 */
function AdminDevice(props) {
  //const [isMobile, setIsMobile] = useState(false);
  //const [adminType, setAdminType] = useState("ZONE"); // ZONE, SUBZONE, ROOM
  const isMobile = props.isMobile;
  const adminType = props.adminType;
  const curTree = props.curTree;
  const setCurTree = props.setCurTree;
  const workMode = props.workMode;
  const setAdminType = props.setAdminType;
  const setNodata = props.setNodata;
  const [restart, setRestart] = useState(false);
  //
  const [listWork, setListWork] = useState(false);
  const [listItem, setListItem] = useState(null);
  const [reWork, setReWork] = useState(null)
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
  useEffect(() => {
    setReWork(curTree);
  }, [curTree])

  clog("IN DEVICE : INIT :" + JSON.stringify(curTree) + "  : " + adminType + " : " + workMode);


  return (
    <>
      {/*<!--탭별 내용 영역 : 선택된 탭에 current 자동 생성, 첫번째 내용에는 current 넣기(기본노출내용) -->*/}
      {/*<!-- Tab1 -->*/}

      {(curTree.room.roomId.length <= 0) ?
        <NoDeviceView

          setIsMobile={props.setIsMobile}
          curTree={curTree}
          setPopWin={props.setPopWin} />
        :
        (workMode === "LIST") && (!listWork) && <DeviceList
          curTree={curTree}
          isMobile={props.isMobile}
          workMode={props.workMode}
          setIsMobile={props.setIsMobile}
          setCurTree={props.setCurTree} // adminType 변경됨
          setWorkMode={props.setWorkMode}
          setPopWin={props.setPopWin}
          setListWork={setListWork}
          listItem={listItem}
          setListItem={setListItem}
          restart={restart}
          setRestart={setRestart}
          reWork={reWork}
          setReWork={setReWork}
          setNodata={setNodata}
        />
      }
      {(workMode === "LIST") && (listWork) && <DeviceListUpdate
        curTree={curTree}
        isMobile={props.isMobile}
        workMode={props.workMode}
        setIsMobile={props.setIsMobile}
        setCurTree={props.setCurTree} // adminType 변경됨
        setWorkMode={props.setWorkMode}
        setPopWin={props.setPopWin}
        setListWork={setListWork}
        listItem={listItem}
        setListItem={setListItem}
        reWork={reWork}
        setReWork={setReWork}
        restart={restart}
        setRestart={setRestart}

      />
      }
      {(workMode === "CREATE") && <DeviceInsert
        curTree={curTree}
        isMobile={props.isMobile}
        workMode={props.workMode}
        setIsMobile={props.setIsMobile}
        setCurTree={props.setCurTree} // adminType 변경됨
        setWorkMode={props.setWorkMode}
        setPopWin={props.setPopWin}
        restart={restart}
        setRestart={setRestart}
      />
      }
      {(workMode === "BATCH") && <DeviceBatch
        curTree={curTree}
        isMobile={props.isMobile}
        workMode={props.workMode}
        setIsMobile={props.setIsMobile}
        setCurTree={props.setCurTree} // adminType 변경됨
        setWorkMode={props.setWorkMode}
        setPopWin={props.setPopWin}
        restart={restart}
        setRestart={setRestart}
      />
      }
    </>
  )
};
export default AdminDevice;