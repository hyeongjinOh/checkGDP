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

// utils
import clog from "../../../../utils/logUtils";
import * as CUTIL from "../../../../utils/commUtils"

//component
import AuthSetting from "./LangSetting";
/**
 * @brief EHP 메뉴 관리 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
function LangCRUD(props) {
  //const [isMobile, setIsMobile] = useState(false);
  //const [adminType, setAdminType] = useState("ZONE"); // ZONE, SUBZONE, ROOM
  //props
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
    {/*<!-- Tab1 -->
        <NoCompanyView
          setIsMobile={props.setIsMobile}
        />    */}
      {(workMode==="READ")&&
        <AuthSetting
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
      {/*(workMode==="LIST")&&
        <ZoneList
          isMobile={props.isMobile}
          setIsMobile={props.setIsMobile}
          curTree={curTree}
          setCurTree={props.setCurTree} // adminType 변경됨
          setWorkMode={props.setWorkMode}
          setPopWin={props.setPopWin}       
        />
      {(workMode==="CREATE")&&
        <CompanyInsert
          isMobile={props.isMobile}
          setIsMobile={props.setIsMobile}
          selTree={selTree}
          setSelTree={props.setSelTree} // adminType 변경됨
          setWorkMode={props.setWorkMode}
          setPopWin={props.setPopWin}       
        />
      }
      {(workMode==="UPDATE")&&
        <CompanyUpdate
          isMobile={props.isMobile}
          setIsMobile={props.setIsMobile}
          selTree={selTree}
          setSelTree={props.setSelTree} // adminType 변경됨
          setWorkMode={props.setWorkMode}
          setPopWin={props.setPopWin}       
        />
      }
    */}
  </>
  )
};
export default LangCRUD;