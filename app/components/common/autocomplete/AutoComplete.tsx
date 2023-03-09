/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author JiHoon Park
 * @contact jhpark@detech.co.kr
 * @date 2022-07-19
 * @brief EHP 자동완성 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";

// utils
import clog from "../../../utils/logUtils";

/**
 * @brief EHP 자동완성 컴포넌트
 * @param - 
 * @returns react components
 */

function AutoComplete(props) {
  const wordList = props.workList; //autofield
  const autoInfo = props.autoInfo;
  const setParentAutoInfo = props.setAutoInfo;
  const resetParentAutoInfo = props.resetAutoInfo;
  const errorList = props.errorList;
  const errorField = props.errorField;

  const initKeyword = props.hasOwnProperty("initKeyword")?props.initKeyword:"";
  const [keyword, setKeyword] = useState(initKeyword);

  function handleSelectKeyword(e, autoInfo) {
    setKeyword("");
    setParentAutoInfo(autoInfo);
  }

  function handleOnChange(e) {
    resetParentAutoInfo();
    setKeyword(e.target.value);
  }

  return (
  <>
  <input type="text" id="inp4" 
    className={(errorList)&&(errorList.filter(err=>(err.field===errorField)).length>0)?"input-error":""}
    placeholder="텍스트를 입력하세요"
    value={(autoInfo)?autoInfo.autofield:keyword}
    onChange={(e)=>handleOnChange(e)}
  />
  <p className="input-errortxt">{(errorList)&&errorList.filter(err=>(err.field===errorField)).map((err)=>err.msg)}</p>

  <ul className="autocomplete-box" style={{"display" : `${(keyword.length>0)?"":"none"}`}}>
    {wordList.filter(word=>(word.autofield.toUpperCase().includes(keyword.toUpperCase()))).map((word, idx)=>(
    <li key={`autofield_${idx.toString()}`}
        onClick={(e)=>handleSelectKeyword(e, word)}
    >
      <a href="#">
        {word.autofield.substring(0, word.autofield.toUpperCase().indexOf(keyword.toUpperCase()))}
        <span className="highlight">{
            word.autofield.substring(
                word.autofield.toUpperCase().indexOf(keyword.toUpperCase()), 
                word.autofield.toUpperCase().indexOf(keyword.toUpperCase())+keyword.length)
        }
        </span>
        {word.autofield.substring(word.autofield.toUpperCase().indexOf(keyword.toUpperCase())+keyword.length)}
      </a>
    </li>
    ))}
  </ul>
  </>
  )
}


export default AutoComplete;


