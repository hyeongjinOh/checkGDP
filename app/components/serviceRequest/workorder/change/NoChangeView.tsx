/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-01
 * @brief EHP workorder - 노후 교체 컴포넌트
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";


// utils
import clog from "../../../../utils/logUtils";
import * as CONST from "../../../../utils/Const"
import * as HTTPUTIL from "../../../../utils/api/HttpUtil"
import * as CUTIL from "../../../../utils/commUtils"
/**
 * @brief EHP WorkOrder - 노후 교체 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

//component
function NoChangeView(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //props
  const isTreeOpen = props.isTreeOpen;
  const selTree = props.selTree;
  const setParentIsMobile = props.setIsMobile;
  const setParentPopWin = props.setPopWin;

  //mobile check
  const mobileRef = useRef(null); // Mobile Check용
  useEffect(() => { // resize handler
    // Mobile 체크
    function handleResize() {
      //clog("IN RESIZE : re-size : " + mobileRef);
      if (CUTIL.isnull(mobileRef)) return;
      const mobileTag = mobileRef.current;
      //clog("IN RESIZE : re-size : " + mobileTag.clientHeight + " X " + mobileTag.clientWidth);

      if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
        setParentIsMobile(true);
      } else {
        setParentIsMobile(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);
  useEffect(() => { // re-rendering mobile check
    //clog("IN RESIZE : re-rendering mobile check : " + mobileRef);

    if (CUTIL.isnull(mobileRef)) return;
    const mobileTag = mobileRef.current;

    if (!CUTIL.isnull(mobileTag)) {
      //clog("IN RESIZE : re-rendering mobile check : " + mobileTag.clientHeight + " X " + mobileTag.clientWidth);
      if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
        setParentIsMobile(true);
      } else {
        setParentIsMobile(false);
      }
    }
  }, []);

  return (
    <>
      {/*<!--area__right, 오른쪽 영역-->*/}
      <div className="area__right" style={{ "width": `${(isTreeOpen) ? "calc(100% - 320px)" : "calc(100% - 40px)"}` }} ref={mobileRef}>
        <p className="txt-ready" style={{ "height": `calc(100vh - 200px)` }}>
          <span>사업장을 선택해주세요.</span>
        </p>
      </div>
      {/*<!--//area__right, 오른쪽 영역-->*/}
    </>
  )
};
export default NoChangeView;