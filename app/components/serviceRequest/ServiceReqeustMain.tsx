/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-10-08
 * @brief EHP 출동 점검 요청 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
//recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { loadingBoxState, } from '../../recoil/menuState';

// utils
import clog from "../../utils/logUtils";
import * as CUTIL from "../../utils/commUtils"
//component
import ServiceRequestSubMain from "./ServiceReqeustSubMain"
import RequestInspection from "./request/RequestInspection";


function ServiceRequestMain(props) {

  //recoil
  const isLoadingBox = useRecoilValue(loadingBoxState);
  //props
  const tabMenuList = props.tabMenuList;
  const curTabMenu = props.curTabMenu;
  const setParentCurTabMenu = props.setCurTabMenu;
  const tabType = props.hasOwnProperty("tabType")?props.tabType:"main"; //subMain, main //thirdMain 추가
  //const menuItem = props.menuItem



  //const [meun, setMeun] = useState(menuItem)

  const [workMode, setWorkMode] = useState("READ");

  //clog("IN SREVICEREQUEST MAIN : INIT : " + JSON.stringify(tabMenuList));
  clog("IN SREVICEREQUEST MAIN : INIT : " + JSON.stringify(tabType));
  return (
    <>
      {/*<!-- main, 컨테이너영역 -->*/}
      {/*<!-- 레이아웃이 가로 1개로 구분될때, layout-w1 클래스 추가됨 / 점검출동 service-page-->*/}
      {(tabType==="main")&&<main className="container layout-w1 service-page ">
        {/*<!-- .content, 컨텐츠영역:개별박스영역(.box)으로 구성 -->*/}
        <section className="content ">
          <article className={`box ${(isLoadingBox)?"loading__box":""}`}>
              <RequestInspection
                  setPopWin={props.setPopWin}
                //pop
              />
            {/*<!--// .box__body-->*/}
          </article>
        </section>
        {/*<!-- //.content, 컨텐츠영역:개별박스영역으로 구성 -->*/}
      </main>}
      {/*(tabType==="subMain")&&<ServiceRequestSubMain 
          setPopWin={props.setPopWin}
      />
      */}
      
      {/*<!-- //main, 컨테이너영역 -->*/}
    </>
  )
}

export default ServiceRequestMain;