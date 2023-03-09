/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-09-01
 * @brief EHP 사업장 관리 개발
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
 * @brief EHP 사업장 관리 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
//component
import ZoneList from "./zone/ZoneList";

function CompanyView(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //props
  const isMobile = props.isMobile;
  const setParentIsMobile = props.setIsMobile;
  const selTree = props.selTree;
  const setParentSelTree = props.setSelTree;
  const workMode = props.workMode;
  const setParentWorkMode = props.setWorkMode;
  const setParentAdminType = props.setAdminType;

  const setParentPopWin = props.setPopWin;
  //
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
  const [companyInfo, setCompanyInfo] = useState(null);
  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/company/admindetail?companyId=${selTree.company.companyId}`,
    appQuery: {},
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: selTree
    //watch: selTree.company.companyId+selTree.reload
  });

  useEffect(() => {
    setRecoilIsLoadingBox(true);
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
    if (ERR_URL.length > 0) navigate(ERR_URL);

    if (retData) {
      setRecoilIsLoadingBox(false);
      //clog("IN COMPANY VIEW : RES : " + JSON.stringify(retData));
      if (retData.codeNum == CONST.API_200) {
        setCompanyInfo(retData.body);
      }
    }
  }, [selTree, retData])

  // 상세사업장 추가
  function onClickUpdateCompany(e) {
    e.stopPropagation();
    //setParentAdminType("COMPANY")
    setParentSelTree("COMPANY",
    { ...selTree, 
      company : {"companyId":selTree.company.companyId, "companyName":selTree.company.companyName},
    }
    );
    setParentWorkMode("UPDATE");
  }
  //clog("IN ZONEVIEW : ZONEINFO : " + JSON.stringify(companyInfo));

  async function onClickDoDeleteCompany(e, company) {
    var isOk = confirm(`${company.companyName}을(를) 삭제하시겠습니까?`);
    clog("onClickZoneDoDelete : " + isOk);
    if ( !isOk ) return;

    let data: any = null;
    setRecoilIsLoadingBox(true);
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "DELETE",
      "appPath": `/api/v2/product/company/${company.companyId}`,
      appQuery: {
      },
      userToken: userInfo.loginInfo.token,
    });

    if (data) {
      /*
      const ERR_URL = HTTPUTIL.resultCheck(false, data);
      if (ERR_URL.length > 0) {
        setRecoilIsLoadingBox(false);
        CUTIL.sleep(500);
        navigate(ERR_URL);
      }
      */
      setRecoilIsLoadingBox(false);
      if (data.codeNum == CONST.API_200) {
        clog("IN ZONE UPDATE : onClickDoDeleteCompany : " + JSON.stringify(data.body));
        alert("회사가 삭제되었습니다.");
        
        setParentSelTree("COMPANY",
          { ...selTree, 
            company : {"companyId":"", "companyName":""},
            reload : true,
          }
        );
        setParentWorkMode("READ");
        
      } else { // api if
        // need error handle -> goto system error page?
        alert(data.body.errorList[0].msg);
        //setErrorList(data.body.errorList);
      }
      CUTIL.jsclose_Popup("pop-listbox-detail");
    }
  }
  const [companyFold, setCompanyFold] = useState(false);

  return (
  <>
  {/*<!--오른쪽 영역-->*/}
  {(companyInfo)&&
  <div className="area__right_content workplace__info workplace__main info__input newtype" ref={mobileRef}>
    <div className="page-top">
      <h2>
        {companyInfo.companyName} 
        <button type="button"
          className={`btn-more ${(companyFold)?"on":""}`}
          onClick={(e)=>setCompanyFold(!companyFold)}
        >
          <span className="hide">화면접기펼치기</span>
        </button>
      </h2>
      <div className="top-button">
        {/*<!--활성화되면 active-->*/}
        <button type="button"
          className="btn-edit"
          onClick={(e)=>onClickUpdateCompany(e)}
        >
          <span className="hide">수정</span>
        </button>
        <button type="button" 
          className="btn-delete"
          onClick={(e)=>onClickDoDeleteCompany(e, companyInfo)}
        >
          <span className="hide">삭제</span>
        </button>
      </div>
    </div>
    {/*<!--정보상단-->*/}
    <div className={`content__info ${(companyFold)?"hidden":""}`}>
      <h3 className="hide">회사별 정보</h3>
      <ul className="form__info">
        <li>
          <p className="tit">회사 명</p>
          <p className="txt">{companyInfo.companyName}</p>
        </li>
        <li>
          <p className="tit">회사 URL</p>
          <p className="txt"><a>{companyInfo.url}</a></p>
        </li>
        <li>
          <p className="tit">사업자등록번호</p>
          <p className="txt">{companyInfo.businessNo}</p>
        </li>
        <li>
          <p className="tit">대표 관리자</p>
          <p className="txt">{companyInfo.administrator}</p>
        </li>
        {/*<li>
          <p className="tit">업종/업태</p>
          <p className="txt">{companyInfo.classification}</p>
        </li>*/}
        <li>
          <p className="tit">청구/정산 담당</p>
          <p className="txt">{companyInfo.accountManager}</p>
        </li>
        <li>
          <p className="tit">청구/정산 담당 Tel</p>
          <p className="txt">{companyInfo.accMngrTelephone}</p>
        </li>
        <li>
          <p className="tit">I/F Info</p>
          <p className="txt">{companyInfo.interfaceInfo}</p>
        </li>
        <li>
          <p className="tit">메모</p>
          <p className="txt">{companyInfo.memo}</p>
        </li>
      </ul>
    </div>
    <ZoneList
      companyInfo={companyInfo}
      setSelTree={props.setSelTree}
      setWorkMode={props.setWorkMode}
      setPopWin={props.setPopWin}
    />
    {/*<!--정보하단(라인아래)-->
    <div className="content__info boxlist">
      <div className="column">
        <div className="listbox__top">
          <h3>사업장</h3>
          <button type="button" className="add__item"><span>사업장 추가</span></button>
        </div>
        <div className="listbox__area">
          {companyInfo.zone.map((zone, idx)=>(
          <div key={`zone_${idx.toString()}`} className="listbox">
            <div className="box__top">
              <p>{zone.zoneName}</p>
              <button type="button" className="btn-go js-open" data-pop="pop-listbox-detail">
                <span className="hide">자세히보기</span>
              </button>
            </div>
            <div className="box__bottom">
              <div className="left img_workplace">
                {(zone.image!==null)
                ?<img src={zone.image.url} alt={zone.image.name}/>                
                :<img src={require("/static/img/img_workplace/w01.jpg")} alt="사진영역"/>
                }
              </div>
              <div className="right">
                <ul>
                  <li>
                    <span>상세사업장</span>
                    <span><strong>{zone.subZoneCount}</strong>개</span>
                  </li>
                  <li>
                    <span>등록 기기</span>
                    <span><strong>{zone.itemCount}</strong>개</span>
                  </li>
                  <li>
                    <span>User</span>
                    <span><strong>{zone.userCount}</strong>명</span>
                  </li>
                </ul>
                <ul>
                  <li><p className="tit">진단 점수 기준</p></li>
                  <li>
                    <div className="result__score">
                      <p className="tit caution">Warning</p>
                      <p className="score">{zone.assessmentScore}</p>
                    </div>
                  </li>
                  <li>
                    <p className="score__info">{zone.alarmMessage}</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          ))}
        </div>
      </div>
    </div>
    */}
  </div>
  }
  </>
  )
};
export default CompanyView;
