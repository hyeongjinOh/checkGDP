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

/**
 * @brief EHP Hilight 컴포넌트
 * @param - 
 * @returns react components
 */


function HilightSpan(props) {
  const word = props.word;
  const keyword = props.keyword;

  const pos = word.toUpperCase().indexOf(keyword.toUpperCase());
  return (
  <>
    {(pos < 0) ? "" : word.substring(0, pos)}
    <span className="highlight">
    {(pos < 0) ? "" : word.substring( pos, pos+keyword.length)}
    </span>
    {(pos < 0) ? word : word.substring(pos+keyword.length)}
  </>
  )
}


export default HilightSpan;


