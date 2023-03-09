/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author HyeongJin O
 * @contact hjoh@detech.co.kr
 * @date 2022-07-19
 * @brief EHP 기기등록 관리 - 초기화면 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";


// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"
/**
 * @brief EHP 기기등록 관리 - 초기화면 컴포넌트 , 반응형 동작
 * @param -
 * @returns react components
 */
//component
function NoDeviceView(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //props
  const curTree = props.curTree;
  const setParentIsMobile = props.setIsMobile;
  const setParentPopWin = props.setPopWin;

  //mobile check
  const mobileRef = useRef(null); // Mobile Check용
  useEffect(() => { // resize handler
  // Mobile 체크
    function handleResize() {
      if (CUTIL.isnull(mobileRef)) return;
      const mobileTag = mobileRef.current;
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
    if (CUTIL.isnull(mobileRef)) return;
    const mobileTag = mobileRef.current;
    if ( !CUTIL.isnull(mobileTag) ) {
      if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
        setParentIsMobile(true);
      } else {
        setParentIsMobile(false);
      }
    }
  }, []);

  useEffect(()=>{
    setParentPopWin("pop-area-right-page-info", 
      <MobileNNoDeviceView />
    )
  }, [])

  return (
  <>
    {/*<!--area__right, 오른쪽 영역-->*/}
    <div className="area__right" ref={mobileRef}>
      <p className="txt-ready">
        <span>전기실을 선택해주세요.</span>
      </p>
    </div>
    {/*<!--//area__right, 오른쪽 영역-->*/}
  </>
  )
};
export default NoDeviceView;

function MobileNNoDeviceView(props) {
  return (
    <>
      <div className="popup__body">
        <div className="area__right_content workplace__info">
          <p className="txt-ready">
            <span>전기실을 선택해주세요.</span>
          </p>
        </div>
      </div>    
    </>
  )
}