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
import React, { useEffect, useRef, useState, DependencyList } from "react";

import { useAsync } from "react-async";
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
import { loadingBoxState } from "../../../recoil/menuState";
// img, css etc
// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"
// components
import DaumPostcode from "react-daum-postcode";

/**
 * @brief EHP 회사/사업장/세부사업장 주소 검색 컴포넌트
 * @param - 
 * @returns react components
 */

function EhpPostCode(props) {
  const popBody = props.popBody;
  const isPopup = (!CUTIL.isnull(popBody))
    ? popBody.hasOwnProperty("props")
      ? popBody.props.hasOwnProperty("isPopup")
        ? popBody.props.isPopup
        : null
      : null
    : null;
  const setParentIsPopup = (!CUTIL.isnull(popBody))
    ? popBody.hasOwnProperty("props")
      ? popBody.props.hasOwnProperty("setIsPopup")
        ? popBody.props.setIsPopup
        : null
      : null
    : null;
  const setParentAddress = (!CUTIL.isnull(popBody))
    ? popBody.hasOwnProperty("props")
      ? popBody.props.hasOwnProperty("setAddress")
        ? popBody.props.setAddress
        : null
      : null
    : null;


  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  function onCompletePost(data) {
    clog("EHP-POSTCODE : " + JSON.stringify(data));
    setAddress(data.address);
  }

  function onClosePostCode(state) {
    clog("ON CLOSE : POST CODE : " + state);
    if(state === 'FORCE_CLOSE'){
      //사용자가 브라우저 닫기 버튼을 통해 팝업창을 닫았을 경우, 실행될 코드를 작성하는 부분입니다.

    } else if(state === 'COMPLETE_CLOSE'){
      //사용자가 검색결과를 선택하여 팝업창이 닫혔을 경우, 실행될 코드를 작성하는 부분입니다.
      //oncomplete 콜백 함수가 실행 완료된 후에 실행됩니다.
    }
    setDefaultQuery("");
    setParentAddress(address);
    CUTIL.jsclose_Popup("pop-postcode");
  }


  function onClickSaveAddress(e) {
    setDefaultQuery("");
    setParentIsPopup(false);
    const allAddress = address + " " + detailAddress;
    setParentAddress(allAddress);
    CUTIL.jsclose_Popup("pop-postcode");
  }
  const [defaultQuery, setDefaultQuery] = useState("");
  useEffect(()=>{
    setDefaultQuery("");
  })

  //clog("POSTCODE : SIZE : " + window.innerWidth + " X " + window.innerHeight);

  return (
  <>
    {/*<!--220926 주소찾기 팝업-->*/}
    <div id="pop-postcode" className="popup-layer js-layer layer-out hidden popup-address">
      <div className="popup__head">
        <h1>주소 찾기</h1>
        <button className="btn btn-close js-close">
          <span className="hide">닫기</span>
        </button>
      </div>
      <div className="popup__body">
        <div className="frame__address">{/*아이프레임 영역입니다. 이 태그 안에 넣어주세요.*/}
        {(isPopup)&&<DaumPostcode
          //style={{"width":`${window.innerWidth.toString()}px`, "height":`${window.innerHeight.toString()}px`}}
          autoClose={false}
          onComplete={onCompletePost}
          //onClose={onClosePostCode}
          defaultQuery={defaultQuery}
        />}
        </div>
        <div className="input__address">
          <ul className="form__input">
            <li>
              <p className="tit">주소</p>
              <div className="input__area">
                <textarea 
                  placeholder="상세 주소를 선택하세요."
                  value={address}
                  readOnly>{/*충북 청주시 서원구 사직대로254번길 7 ((주)엘에스산업개발)*/}</textarea>
              </div>
            </li>
            <li>
              <p className="tit">상세 주소</p>
              <div className="input__area">
                {/*<input type="text" id="inp2" value="402-1" />*/}
                <input type="text" placeholder="상세 주소를 입력하세요." 
                  value={detailAddress}
                  onChange={(e)=>setDetailAddress(e.target.value)}
                  />
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div className="popup__footer">
        <button type="button" className="bg-gray js-close"><span>취소</span></button>
        <button type="button" 
          className="js-close"
          onClick={(e)=>onClickSaveAddress(e)}
        >
          <span>저장</span>
        </button>
      </div>
    </div>
  </>    
  )
}

export default EhpPostCode;