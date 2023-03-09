/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author JiHoon Park
 * @contact jhpark@detech.co.kr
 * @date 2022-07-19
 * @brief EHP SystemError 화면 개발
 *
 ********************************************************************/
import React from "react";
import { useNavigate } from 'react-router-dom';
// UTILS
import * as CONST from "../../../utils/Const"

/**
 * @brief EHP SystemError 화면 컴포넌트
 * @param - 
 * @returns react components
 */

//
function SystemError() {
  const navigate = useNavigate();
  function onClickGoPage(url) {
    navigate(url);
    //
  }

  return (
  <>      
    {/*<div className={"text-center"} >
      <h1>USER 404 not found</h1>
    </div>
    <button className={"text-center"} onClick={(e)=>onClickGoPage(CONST.URL_EHP)}>
      <p>홈으로 가기</p>
  </button>*/}
    {/*<!-- main, 컨테이너영역 -->*/}
    <main className="container filereports">
      {/*<!--220803, 에러영역추가-->*/}
      <div className="area__error">
        <strong>서비스 점검 중 입니다.</strong>
        <p>서비스를 일시 중단 하오니 잠시 후 이용해 주세요.</p>
      </div>
    </main>
    {/*<!-- //main, 컨테이너영역 --> */}
  </>
  )
}

export default SystemError;