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
import { useAsync } from "react-async";
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";


// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"
//component
import EhpPostCode from "../../common/postcode/EhpPostCode";

/**
 * @brief EHP 사업장 전기실 관리 - 상세 사업장 등록 컴포넌트 , 반응형 동작
 * @param -
 * @returns react components
 */

function SubZoneInsert(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //props
  const curTree = props.curTree;
  const setParentIsMobile = props.setIsMobile;
  const setParentPopWin = props.setPopWin;
  const setParentCurTree = props.setCurTree;
  const setParentWorkMode = props.setWorkMode;
  //
  const [subZoneInfo, setSubZoneInfo] = useState({
    "isontree":true,
    "sort":0,
    "approval":0,
    "subZoneId":"",
    "subZoneName":"", //
    "address":"", //
    "memo":"", //
    "itemCount":0,
  });
  function callbackSetSubZoneInfoMemo(val) {
    setSubZoneInfo({...subZoneInfo, memo:val});
  }
  function callbackSetSubZoneInfoAddress(val) {
    setSubZoneInfo({...subZoneInfo, address:val});
  }
  const [errorList, setErrorList] = useState([]);
  //const [subZoneName, setSubZoneName] = useState("");
  //const [managerInfo, setManagerInfo] = useState({ "id": "", "name": "", "telNo": "" });
  //const [address, setAddress] = useState("");
  //const [memo, setMemo] = useState("");

  //mobile check
  const mobileRef = useRef(null); // Mobile Check용
  useEffect(() => { // resize handler
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
    if (!CUTIL.isnull(mobileTag)) {
      if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
        setParentIsMobile(true);
      } else {
        setParentIsMobile(false);
      }
    }
  }, []);
  // 주소찾기 초기화
  const [isPopupPostCode, setIsPopupPostCode] = useState(false);
  useEffect(()=>{
    setParentPopWin("pop-postcode",
      <EhpPostCode
        isPopup={isPopupPostCode}
        setIsPopup={setIsPopupPostCode}
        setAddress={callbackSetSubZoneInfoAddress}
      />
    )
  });
  function onClickPostCode(e) {
    setIsPopupPostCode(true);
    CUTIL.jsopen_Popup(e);
  }

  useEffect(() => {
    setParentPopWin("pop-area-right-page-info",
      <MobileSubZoneInsert
        curTree={curTree}
        subZoneInfo={subZoneInfo}
        setSubZoneInfo={setSubZoneInfo}
        callbackSetSubZoneInfoMemo={callbackSetSubZoneInfoMemo}
        errorList={errorList}
        onClickDoSaveSubZone={onClickDoSaveSubZone}
        onClickDoCancelSubZone={onClickDoCancelSubZone}
        onClickPostCode={onClickPostCode}
      />
    )
  });
  
  async function onClickDoSaveSubZone(e) {
    //clog("IN EHCLAST : onClickDoSaveSubZone : " + JSON.stringify(managerInfo));
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "POST",
      "appPath": "/api/v2/product/company/zone/subzone",
      appQuery: {
        "zoneId": curTree.zone.zoneId,
        "subZoneName": subZoneInfo.subZoneName,
        "address": subZoneInfo.address,
        "memo": subZoneInfo.memo
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == 200) {
        clog("IN SUBZONE-INSERT: onClickDoSaveSubZone : " + JSON.stringify(data.body));
        setParentCurTree("SUBZONE",
          {
            ...curTree,
            subZone: { "subZoneId": data.body.subZoneId, "subZoneName": data.body.subZoneName },
          }
        );
        setParentWorkMode("READ");

      } else { // api if
        // need error handle
        setErrorList(data.body.errorList);
      }
    }
    //return data;
  }
  function onClickDoCancelSubZone(e) {
    setParentCurTree("ZONE",
      {
        ...curTree,
        subZone: { "subZoneId": "", "subZoneName": "" },
      }
    );
    setParentWorkMode("READ");
  }

  return (
    <>
      {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)-->*/}
      {
        <div className="area__right" ref={mobileRef}>
          <ul className="page-loca">
            <li>{curTree.company.companyName}</li>
            <li>{curTree.zone.zoneName}</li>
          </ul>
          <div className="page-top">
            <h2>상세사업장 추가</h2>
          </div>

          {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지&정보입력 workplace__info 클래스 추가, 정보페이지중 1뎁스 사업장&정보입력 일 경우 workplace__main 클래스 추가, 정보입력(신규등록)페이지 에서 info__input 클래스 추가-->*/}
          <div className="area__right_content workplace__info info__input">
            <div className="content__info h-auto">
              <h3 className="hide">상세사업장 추가 정보 입력</h3>
              <ul className="form__input">
                <li>
                  <p className="tit star">상세사업장 명</p>
                  <div className="input__area">
                    <input type="text" id="inp1" placeholder="텍스트를 입력하세요"
                      className={(errorList.filter(err => (err.field === "subZoneName")).length > 0) ? "input-error" : ""}
                      value={subZoneInfo.subZoneName}
                      onChange={(e)=>setSubZoneInfo({...subZoneInfo, subZoneName : e.target.value})}
                    />
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "subZoneName")).map((err) => err.msg)}</p>
                  </div>
                </li>
                <li>
                  <p className="tit star">상세사업장 주소</p>
                  <div className="input__area">
                    <div className="box__search">
                      <input type="text" placeholder="주소를 입력하세요"
                        className={(errorList.filter(err => (err.field === "address")).length > 0) ? "input-error" : ""}
                        value={subZoneInfo.address}
                        //onChange={(e)=>setSubZoneInfo({...subZoneInfo, address : e.target.value})}
                        disabled
                      />
                      <button type="button"
                        className="btn btn-search"
                        data-pop="pop-postcode"
                        onClick={(e)=>onClickPostCode(e)}
                      >
                        <span className="hide">조회</span>
                      </button>
                    </div>
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "address")).map((err) => err.msg)}</p>
                  </div>
                </li>
                <li>
                  <p className="tit">메모</p>
                  <div className="input__area">
                    <textarea placeholder="메모를 입력하세요."
                      className={(errorList.filter(err=>(err.field==="memo")).length>0)?"input-error":""}
                      value={subZoneInfo.memo}
                      onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                      onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetSubZoneInfoMemo)}
                      onChange={(e) => setSubZoneInfo({...subZoneInfo, memo : e.target.value})}></textarea>
                    <p className="input-errortxt">{errorList.filter(err=>(err.field==="memo")).map((err)=>err.msg)}</p>                                    
                  </div>
                </li>
              </ul>
            </div>
            <div className="btn__wrap">
              <button type="button" className="bg-gray" onClick={(e) => onClickDoCancelSubZone(e)}><span>취소</span></button>
              <button type="button" onClick={(e) => onClickDoSaveSubZone(e)}><span>저장</span></button>
            </div>
          </div>
          {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
        </div>
      }
      {/*<!--//area__right, 오른쪽 영역-->*/}
    </>
  )
};
export default SubZoneInsert;


function MobileSubZoneInsert(props) {
  const curTree = props.curTree;
  const subZoneInfo = props.subZoneInfo;
  const setSubZoneInfo = props.setSubZoneInfo;
  const callbackSetSubZoneInfoMemo = props.callbackSetSubZoneInfoMemo;
  const errorList = props.errorList;
  const onClickDoSaveSubZone = props.onClickDoSaveSubZone;
  const onClickDoCancelSubZone = props.onClickDoCancelSubZone;
  const onClickPostCode = props.onClickPostCode;

  return (
    <>
    {/*<!-- 모바일 오른쪽 영역 area-right 팝업, 767이하에서는 팝업으로 노출 / 사업장 정보 페이지에서는 page-info 클래스 추가 -->*/}
    <div className="popup__body">
      {/*<!--area__right, 오른쪽 영역-->*/}
      <ul className="page-loca">
        <li>{curTree.company.companyName}</li>
        <li>{curTree.zone.zoneName}</li>
      </ul>
      <div className="page-top">
        <h2>상세 사업장 추가</h2>
      </div>

      {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지&정보입력 workplace__info 클래스 추가, 정보페이지중 1뎁스 사업장&정보입력 일 경우 workplace__main 클래스 추가, 정보입력(신규등록)페이지 에서 info__input 클래스 추가-->*/}
      <div className="area__right_content workplace__info info__input">
        <div className="content__info">
          <h3 className="hide">상세사업장 추가 정보 입력</h3>
          <ul className="form__input">
            <li>
              <p className="tit star">상세사업장 명</p>
              <div className="input__area">
                <input type="text" id="inp1" placeholder="텍스트를 입력하세요"
                  className={(errorList.filter(err => (err.field === "subZoneName")).length > 0) ? "input-error" : ""}
                  value={subZoneInfo.subZoneName}
                  onChange={(e)=>setSubZoneInfo({...subZoneInfo, subZoneName : e.target.value})}
                />
                <p className="input-errortxt">{errorList.filter(err => (err.field === "subZoneName")).map((err) => err.msg)}</p>
              </div>
            </li>
            <li>
              <p className="tit star">상세사업장 주소</p>
              {/*<div className="input__area">
                <div className="box__search">
                  <input type="text" placeholder="직접입력"
                    className={(errorList.filter(err => (err.field === "address")).length > 0) ? "input-error" : ""}
                    value={subZoneInfo.address}
                    onChange={(e)=>setSubZoneInfo({...subZoneInfo, address : e.target.value})}
                  />
                  <p className="input-errortxt">{errorList.filter(err => (err.field === "address")).map((err) => err.msg)}</p>
                  <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
                </div>
  </div>*/}
              <div className="input__area">
                <div className="box__search">
                  <input type="text" placeholder="주소를 입력하세요"
                    className={(errorList.filter(err => (err.field === "address")).length > 0) ? "input-error" : ""}
                    value={subZoneInfo.address}
                    //onChange={(e)=>setSubZoneInfo({...subZoneInfo, address : e.target.value})}
                    disabled
                  />
                  <button type="button"
                    className="btn btn-search"
                    data-pop="pop-postcode"
                    onClick={(e)=>onClickPostCode(e)}
                  >
                    <span className="hide">조회</span>
                  </button>
                </div>
                <p className="input-errortxt">{errorList.filter(err => (err.field === "address")).map((err) => err.msg)}</p>
              </div>
            </li>
            <li>
              <p className="tit">메모</p>
              <div className="input__area">
                <textarea placeholder="메모를 입력하세요."
                  className={(errorList.filter(err=>(err.field==="memo")).length>0)?"input-error":""}
                  value={subZoneInfo.memo}
                  onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                  onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetSubZoneInfoMemo)}
                  onChange={(e) => setSubZoneInfo({...subZoneInfo, memo : e.target.value})}></textarea>
                <p className="input-errortxt">{errorList.filter(err=>(err.field==="memo")).map((err)=>err.msg)}</p>                                    
              </div>
            </li>
          </ul>
        </div>
        <div className="btn__wrap">
          <button type="button" className="bg-gray" onClick={(e) => onClickDoCancelSubZone(e)}><span>취소</span></button>
          <button type="button" onClick={(e) => onClickDoSaveSubZone(e)}><span>저장</span></button>
        </div>
      </div>
      {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
      {/*<!--//area__right, 오른쪽 영역-->*/}
    </div>
  {/*<!-- //모바일 오른쪽 영역 area-right 팝업 -->*/}
  </>
  )
}