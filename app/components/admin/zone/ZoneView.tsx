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
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
import { loadingBoxState } from "../../../recoil/menuState";


// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"

/**
 * @brief EHP 사업장 전기실 관리 - 회사/사업장 컴포넌트 , 반응형 동작
 * @param -
 * @returns react components
 */

//component
function ZoneView(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadinBox] = useRecoilState(loadingBoxState);
  //props
  const isMobile = props.isMobile;
  const workMode = props.workMode;
  const curTree = props.curTree;
  const setParentIsMobile = props.setIsMobile;
  const setParentAdminType = props.setAdminType;
  const setParentWorkMode = props.setWorkMode;

  const setParentPopWin = props.setPopWin;
  //
  const [zoneInfo, setZoneInfo] = useState(null);
  //화면 이동
  const navigate = useNavigate();
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

  ////////////////////////////////////////////////////////////////////////////
  const { data: retCompany, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/company/${curTree.company.companyId}`,
    appQuery: {},
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: curTree.company.companyId
  });

  useEffect(() => {
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retCompany);
    //clog("IN ZONEVIEW :  > " + isLoading + " : " + JSON.stringify(retCompany));
    if (ERR_URL.length > 0) navigate(ERR_URL);

    if (retCompany) {
      setRecoilIsLoadinBox(true);
      //clog("IN ZONEVIEW : RES : " + JSON.stringify(retCompany));
      if (retCompany.codeNum == CONST.API_200) {
        (async () => { // IFFE(Immediately Invoked Function Expression)은 함수가 정의되자마자 실행되는 자바스크립트 기술입니다.
          const retZone = await HTTPUTIL.PromiseHttp({
            "httpMethod": "GET",
            "appPath": `/api/v2/product/company/zone/detail`,
            "appQuery": { zoneId: curTree.zone.zoneId },
            "userToken": userInfo.loginInfo.token,
            watch: curTree.zone.zoneId
          });
          setRecoilIsLoadinBox(false);
          if (retZone.codeNum === CONST.API_200) {
            (workMode === "INSREAD")
              ? setParentPopWin("pop-area-right", // 인서트 후 조회용
                <MobileZoneView
                  htmlHeader={<h1>사업장 추가</h1>}
                  zoneInfo={{ company: retCompany.body, zone: retZone.body }}
                  onClickSubZoneInsert={onClickSubZoneInsert}
                />
              )
              : setParentPopWin("pop-area-right-page-info",
                <MobileZoneView
                  zoneInfo={{ company: retCompany.body, zone: retZone.body }}
                  onClickSubZoneInsert={onClickSubZoneInsert}
                />
              )
            setZoneInfo({ company: retCompany.body, zone: retZone.body });
          } else {
            setZoneInfo(null);
          }
        })();
      }
      setRecoilIsLoadinBox(false);
    }
  }, [curTree, retCompany])

  // 상세사업장 추가
  function onClickSubZoneInsert(e) {
    e.stopPropagation();
    clog("IN SUBZONETREE : onClickSubZoneInsert : " + e.target.tagName);

    setParentAdminType("SUBZONE")
    setParentWorkMode("CREATE");

    CUTIL.jsopen_s_Popup(e, isMobile);
  }
  //clog("IN ZONEVIEW : ZONEINFO : " + JSON.stringify(zoneInfo));
  return (
    <>
      {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)-->*/}
      {(zoneInfo) &&
        <div ref={mobileRef} className="area__right" >
          <ul
            className="page-loca">
            <li>{zoneInfo.company.companyName}</li>
            <li>{zoneInfo.zone.zoneName}</li>
          </ul>
          <div className="page-top">
            <h2>{zoneInfo.company.companyName} {zoneInfo.zone.zoneName}</h2>
            {/* 20220920 sjpark - 사업장 전기실 관리에서 회사 정보 안보이게...
            <div className="top-button">
              <button type="button" className="btn-edit"><span className="hide">수정</span></button>
              <button type="button" className="btn-delete"><span className="hide">삭제</span></button>
            </div>*/}
          </div>
          {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지&정보입력 workplace__info 클래스 추가, 정보페이지중 1뎁스 사업장&정보입력 일 경우 workplace__main 클래스 추가 -->*/}
          <div className="area__right_content workplace__info workplace__main">
            <div className="content__info">
              <h3 className="hide">사업장 정보</h3>
              <div className="img_workplace">
                {/*<img
            src={
                (zoneInfo.zone.hasOwnProperty("imageDto"))
                  ?(zoneInfo.zone.imageDto)
                    ?zoneInfo.zone.imageDto.url
                    : "#"
                  :"#"
                }
            alt=""
          />*/}
                {((zoneInfo.zone.imageDto) && (zoneInfo.zone.imageDto.url) && (zoneInfo.zone.imageDto.url.length > 0))
                  ? <img src={zoneInfo.zone.imageDto.url} alt="사진영역" />
                  : <img src={require("/static/img/img_workplace/bg_add.jpg")} alt="사진영역" />
                }
              </div>
              <ul>
                <li>
                  <p className="tit">회사 명</p>
                  <p className="txt">{zoneInfo.company.companyName}</p>
                </li>
                <li>
                  <p className="tit">사업장 명</p>
                  <p className="txt">{zoneInfo.zone.zoneName}</p>
                </li>
                <li>
                  <p className="tit">사업장 주소</p>
                  <p className="txt">{(zoneInfo.zone.hasOwnProperty("address")) ? zoneInfo.zone.address : "-"}</p>
                </li>
                <li>
                  <p className="tit">메모</p>
                  <p className="txt">{zoneInfo.zone.memo}</p>
                </li>
              </ul>
              {/* 20220920 sjpark - 사업장 전기실 관리에서 회사 정보 안보이게...
              <ul className="info__admin">
                <li>
                  <p className="tit">회사 URL</p>
                  <p className="txt">
                    <a href={(zoneInfo.company.hasOwnProperty("url")) ? zoneInfo.company.url : "#"} target="_blank">
                      {(zoneInfo.company.hasOwnProperty("url")) ? zoneInfo.company.url : "--"}
                    </a>
                  </p>
                </li>
                <li>
                  <p className="tit">사업자등록번호</p>
                  <p className="txt">{zoneInfo.company.businessNo}</p>
                </li>
                <li>
                  <p className="tit">관리자<span>(Business Admin)</span></p>
                  <p className="txt">{zoneInfo.company.administrator}</p>
                </li>
                <li>
                  <p className="tit">업종/업태</p>
                  <p className="txt">{zoneInfo.company.classification}</p>
                </li>
                <li>
                  <p className="tit">청구/정산 담당</p>
                  <p className="txt">{zoneInfo.company.accountManager}</p>
                </li>
                <li>
                  <p className="tit">청구/정산 담당<span>(Tel)</span></p>
                  <p className="txt">{zoneInfo.company.accMngrTelephone}</p>
                </li>
                <li>
                  <p className="tit">I/F Info</p>
                  <p className="txt">{zoneInfo.company.interfaceInfo}</p>
                </li>
                <li>
                  <p className="tit">메모</p>
                  <p className="txt">{zoneInfo.company.memo}</p>
                </li>
              </ul>*/}
            </div>
            {/*<!--20220914 jihoon -->*/}
            <div className="content__list scrollH">
              <div className="listbox__top">
                <h3>상세사업장 목록</h3>
                <button type="button"
                  className="add__item" 
                  onClick={(e) => onClickSubZoneInsert(e)}
                  data-pop="pop-area-right-page-info"
                >
                  <span>상세사업장 추가</span>
                </button>
              </div>
              <div className="listbox__area">
                {zoneInfo.zone.subZoneManageList.map((subZone, idx) => (
                  <div
                    key={`szone_${idx.toString()}`}
                    className="listbox"
                  >
                    <div className="box__top">
                      <p className="factory">{subZone.subZoneName}</p>
                    </div>
                    <ul className="box__bottom">
                      <li>
                        <div>
                          <p>
                            <span>등록 설비 수</span>
                            <strong>{subZone.itemCount}</strong>
                          </p>
                          {/*<p> figma와 퍼블 상이함
                    <span>관리자 수</span>
                    <strong>4</strong>
                  </p>*/}
                        </div>
                        {/*<button type="button" className="btn-add"><span>기기 등록</span></button>*/}
                      </li>
                      {/*               <li><p className="icon-admin">{subZone.inCharge}</p></li>
              <li><p className="icon-phone">{subZone.contact}</p></li> */}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
        </div>
      }
      {/*<!--//area__right, 오른쪽 영역-->*/}


    </>
  )
};
export default ZoneView;

function MobileZoneView(props) {
  //props
  const zoneInfo = props.zoneInfo;
  const onClickSubZoneInsert = props.onClickSubZoneInsert;

  return (
    <>
      {/*<!-- 모바일 오른쪽 영역 area-right 팝업, 767이하에서는 팝업으로 노출 / 사업장 정보 페이지에서는 page-info 클래스 추가 -->
  <div id="pop-area-right" className="popup-layer js-layer layer-out hidden page-detail page-workplace">*/}
      {(zoneInfo) &&
        <>
          <div className="popup__body">
            {/*<!--area__right, 오른쪽 영역-->*/}
            <ul className="page-loca">
              <li>{zoneInfo.company.companyName}</li>
              <li>{zoneInfo.zone.zoneName}</li>
            </ul>
            <div className="page-top">
              <h2>{zoneInfo.company.companyName} {zoneInfo.zone.zoneName}</h2>
              {/*<div className="top-button">
                <button type="button" className="btn-edit"><span className="hide">수정</span></button>
                <button type="button" className="btn-delete"><span className="hide">삭제</span></button>
              </div>*/}
            </div>
            {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지&정보입력 workplace__info 클래스 추가, 정보페이지중 1뎁스 사업장&정보입력 일 경우 workplace__main 클래스 추가 -->*/}
            <div className="area__right_content workplace__info workplace__main">
              <div className="content__info">
                <h3 className="hide">사업장 정보</h3>
                <div className="img_workplace">
                  <img
                    /* src={
                      (zoneInfo.zone.hasOwnProperty("imageDto"))
                        ? (zoneInfo.zone.imageDto)
                          ? zoneInfo.zone.imageDto.url
                          : "#"
                        : "#"
                    } */
                    /* 20221018 수정 */
                    src={
                      (zoneInfo.zone.hasOwnProperty("imageDto"))
                        ? (zoneInfo.zone.imageDto)
                          ? zoneInfo.zone.imageDto.url
                          : require("/static/img/img_workplace/bg_add.jpg")
                        : require("/static/img/img_workplace/bg_add.jpg")
                    }
                    alt=""
                  />
                </div>
                <ul>
                  <li>
                    <p className="tit">회사 명</p>
                    <p className="txt">{zoneInfo.company.companyName}</p>
                  </li>
                  <li>
                    <p className="tit">사업장 명</p>
                    <p className="txt">{zoneInfo.zone.zoneName}</p>
                  </li>
                  <li>
                    <p className="tit">사업장 주소</p>
                    <p className="txt">{(zoneInfo.zone.hasOwnProperty("address")) ? zoneInfo.zone.address : "-"}</p>
                  </li>
                  <li>
                    <p className="tit">메모</p>
                    <p className="txt">{zoneInfo.zone.memo}</p>
                  </li>
                </ul>
                <ul className="info__admin">
                  <li>
                    <p className="tit">회사 URL</p>
                    <p className="txt">
                      <a href={(zoneInfo.company.hasOwnProperty("url")) ? zoneInfo.company.url : "#"} target="_blank">
                        {(zoneInfo.company.hasOwnProperty("url")) ? zoneInfo.company.url : "--"}
                      </a>
                    </p>
                  </li>
                  <li>
                    <p className="tit">사업자등록번호</p>
                    <p className="txt">{zoneInfo.company.businessNo}</p>
                  </li>
                  <li>
                    <p className="tit">관리자<span>(Business Admin)</span></p>
                    <p className="txt">{zoneInfo.company.administrator}</p>
                  </li>
                  <li>
                    <p className="tit">업종/업태</p>
                    <p className="txt">{zoneInfo.company.classification}</p>
                  </li>
                  <li>
                    <p className="tit">청구/정산 담당</p>
                    <p className="txt">{zoneInfo.company.accountManager}</p>
                  </li>
                  <li>
                    <p className="tit">청구/정산 담당<span>(Tel)</span></p>
                    <p className="txt">{zoneInfo.company.accMngrTelephone}</p>
                  </li>
                  <li>
                    <p className="tit">I/F Info</p>
                    <p className="txt">{zoneInfo.company.interfaceInfo}</p>
                  </li>
                  <li>
                    <p className="tit">메모</p>
                    <p className="txt">{zoneInfo.company.memo}</p>
                  </li>
                </ul>
              </div>
              {/*<!--20220914 jihoon -->*/}
              <div className="content__list scrollH">
                <div className="listbox__top">
                  <h3>상세사업장 목록</h3>
                  <button type="button"
                    className="add__item"
                    onClick={(e) => onClickSubZoneInsert(e)}
                    data-pop="pop-area-right-page-info"                  
                  >
                    <span>상세사업장 추가</span>
                  </button>
                </div>
                <div className="listbox__area">
                  {zoneInfo.zone.subZoneManageList.map((subZone, idx) => (
                    <div
                      key={`szone_${idx.toString()}`}
                      className="listbox"
                    >
                      <div className="box__top">
                        <p className="factory">{subZone.subZoneName}</p>
                      </div>
                      <ul className="box__bottom">
                        <li>
                          <div>
                            <p>
                              <span>등록 설비 수</span>
                              <strong>{subZone.itemCount}</strong>
                            </p>
                            {/*<p>
                      <span>관리자 수</span>
                      <strong>4</strong>
                    </p>*/}
                          </div>
                          {/*<button type="button" className="btn-add"><span>기기 등록</span></button>*/}
                        </li>
                        {/*                 <li><p className="icon-admin">{subZone.inCharge}</p></li>
                <li><p className="icon-phone">{subZone.contact}</p></li> */}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      }
      {/*</div>*/}
    </>

  )

}