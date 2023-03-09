/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-01
 * @brief EHP 기기등록현황 - tab 개발
 *
 ********************************************************************/

import React, { useEffect, useRef, useState } from "react";
//recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { loadingBoxState, } from '../../recoil/menuState';
//ex-component
import $ from "jquery"

// utils
import * as CONST from "../../utils/Const"
import clog from "../../utils/logUtils";
import * as CUTIL from "../../utils/commUtils"
import DeciveStatusTab from "./devicelist/DeciveStatusTab";

 /**
 * @brief EHP 기기등록현황 개발 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

//component

function DeciveStatusMain(props) {
  //recoil
  const isLoadingBox = useRecoilValue(loadingBoxState);
  //props
  const setPopWin = props.setPopWin;
  const tabMenuList = props.tabMenuList;
  const curTabMenu = props.curTabMenu;
  const setParentCurTabMenu = props.setCurTabMenu;

  return (
    <>
      {/*<!-- main, 컨테이너영역 -->*/}
      <main className="container admin-site"  style={{"cursor":"default"}}>
        {/*<!-- .content, 컨텐츠영역:개별박스영역(.box)으로 구성 -->*/}
        <section className="content">
          {/*<!--그리드 영역 -->*/}
          <article className={`box list ${(isLoadingBox) ? "loading__box" : ""} `}>
            <DeciveStatusTab
              setPopWin={setPopWin}
            />
            {/*<!--// .box__body-->*/}
          </article>
        </section>
        {/*<!-- //.content, 컨텐츠영역:개별박스영역으로 구성 -->*/}
      </main>
      {/*<!-- //main, 컨테이너영역 -->*/}
    </>
  );
}

export default DeciveStatusMain;