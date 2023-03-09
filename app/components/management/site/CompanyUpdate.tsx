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

function CompanyUpdate(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
                       
  //props
  const isMobile = props.isMobile;
  const workMode = props.workMode;
  const selTree = props.selTree;
  const setParentIsMobile = props.setIsMobile;
  const setParentSelTree = props.setSelTree;  

  const setParentAdminType = props.setAdminType;
  const setParentWorkMode = props.setWorkMode;

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
  const [companyInfo, setCompanyInfo] = useState({    
    "companyId" :"",
    "companyName":"",
    "url":"",
    "businessNo":"",
    "administrator":"",
    "classification":"",
    "accountManager":"",
    "accMngrTelephone":"",
    "interfaceInfo":"",
    "memo":""    
    /*
    "companyId" :"",
    "companyName":"디이소프트",
    "url":"http://www.desoft.co.kr",
    "businessNo":"12345678900",
    "administrator":"오형진",
    "classification":"소프트웨어개발및공급",
    "accountManager":"박지훈",
    "accMngrTelephone":"0101112111",
    "interfaceInfo":"S/W 개발",
    "memo":"S/W 개발 전문"
    */
  });
  function callbackSetCompanyInfoMemo(val) {
    setCompanyInfo({...companyInfo, memo:val});
  }
  const [errorList, setErrorList] = useState([]);
  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/company/admindetail?companyId=${selTree.company.companyId}`,
    appQuery: {},
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: selTree.company.companyId
  });

  useEffect(() => {
    setRecoilIsLoadingBox(true);
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
    if (ERR_URL.length > 0) navigate(ERR_URL);

    if (retData) {
      clog("IN COMPANY VIEW : RES : " + JSON.stringify(retData));
      if (retData.codeNum == CONST.API_200) {
        setCompanyInfo(retData.body);
      }
    }
    setRecoilIsLoadingBox(false);
  }, [selTree, retData])

  async function onClickDoUpdateCompany(e) {
    let data: any = null;
    setRecoilIsLoadingBox(true);
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": `/api/v2/product/company/${companyInfo.companyId}`,
      appQuery: {
        "companyName": companyInfo.companyName,
        "url":companyInfo.url,
        "businessNo":companyInfo.businessNo,
        "administrator":companyInfo.administrator,
        //"classification":companyInfo.classification,
        "accountManager":companyInfo.accountManager,
        "accMngrTelephone":companyInfo.accMngrTelephone,
        "interfaceInfo":companyInfo.interfaceInfo,
        "memo":companyInfo.memo        
      },
      userToken: userInfo.loginInfo.token,
    });

    if (data) {
      //const ERR_URL = HTTPUTIL.resultCheck(false, data);
      //if (ERR_URL.length > 0) navigate(ERR_URL);
  
      if (data.codeNum == CONST.API_200) {
        clog("IN COMPANY UPDATE : onClickDoUpdateCompany : " + JSON.stringify(data.body));
        setParentSelTree("COMPANY",
          { ...selTree, 
            company : {"companyId":data.body.companyId, "companyName":data.body.companyName},
            reload : true,
          }
        );
        setParentWorkMode("READ");

      } else { // api if
        // need error handle
        setErrorList(data.body.errorList);
      }
    }
    setRecoilIsLoadingBox(false);
  }

  function onClickCancelUpdateCompany(e, company) {
    setParentSelTree("COMPANY",
    { ...selTree, 
      company : {"companyId":company.companyId, "companyName":company.companyName},
      reload : true,
    }
    );
    setParentWorkMode("READ");
  }

  return (
  <>
  {/*<!--오른쪽 영역-->*/}
  <div className="area__right_content workplace__info workplace__main info__input newtype" ref={mobileRef}>
    <div className="page-top">
      <h2>회사 수정</h2>
      {/*<div className="top-button">
        <!--활성화되면 active-->
        <button type="button" className="btn-edit">
          <span className="hide">수정</span>
        </button>
        <button type="button" className="btn-delete">
          <span className="hide">삭제</span>
        </button>
      </div>*/}
    </div>
    {/*<!--입력상단-->*/}
    <div className="content__info h-auto">
      <h3 className="hide">회사 추가 정보 입력</h3>
      <ul className="form__input">
        <li>
          <p className="tit star">회사 명</p>
          {/*<!-- autocomplete 작동하면 input__area에 autocomplete 클래스 추가 + ul 노출 (공통 동일함) -->*/}
          <div className="input__area">
            <input type="text" id="inp4" placeholder="텍스트를 입력하세요"
                value={companyInfo.companyName} 
                className={(errorList.filter(err=>(err.field==="companyName")).length>0)?"input-error":""}                
                onChange={(e)=>setCompanyInfo({...companyInfo, companyName:e.target.value})}
            />
            <p className="input-errortxt">{errorList.filter(err=>(err.field==="companyName")).map((err)=>err.msg)}</p>                                
          </div>
        </li>
        <li>
          <p className="tit">회사 URL</p>
          <div className="input__area">
            <input type="text" id="inp5" placeholder="URL을 입력하세요"
                value={companyInfo.url} 
                className={(errorList.filter(err=>(err.field==="url")).length>0)?"input-error":""}                
                onChange={(e)=>setCompanyInfo({...companyInfo, url:e.target.value})}
            />
            <p className="input-errortxt">{errorList.filter(err=>(err.field==="url")).map((err)=>err.msg)}</p>                                
          </div>
        </li>
        <li>
          <p className="tit star">사업자등록번호</p>
          <div className="input__area">
            <input type="text" id="inp6" placeholder="텍스트를 입력하세요"
                value={companyInfo.businessNo} 
                className={(errorList.filter(err=>(err.field==="businessNo")).length>0)?"input-error":""}                
                onChange={(e)=>setCompanyInfo({...companyInfo, businessNo:e.target.value})}
            />
            <p className="input-errortxt">{errorList.filter(err=>(err.field==="businessNo")).map((err)=>err.msg)}</p>                                
          </div>
        </li>
        <li>
          <p className="tit">대표 관리자</p>
          <div className="input__area">
            {/*<div className="box__search">
              <input type="text" placeholder="직접입력" />
              <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
            </div>*/}
            <input type="text" placeholder="직접입력"
                value={companyInfo.administrator} 
                className={(errorList.filter(err=>(err.field==="administrator")).length>0)?"input-error":""}                
                onChange={(e)=>setCompanyInfo({...companyInfo, administrator:e.target.value})}
            />
            <p className="input-errortxt">{errorList.filter(err=>(err.field==="administrator")).map((err)=>err.msg)}</p>                                
          </div>
        </li>
        {/*<li>
          <p className="tit star">업종/업태</p>
          <div className="input__area">
            <input type="text" placeholder="텍스트를 입력하세요"
              value={companyInfo.classification} 
              className={(errorList.filter(err=>(err.field==="classification")).length>0)?"input-error":""}                
              onChange={(e)=>setCompanyInfo({...companyInfo, classification:e.target.value})}             
            />
            <p className="input-errortxt">{errorList.filter(err=>(err.field==="classification")).map((err)=>err.msg)}</p>                                
          </div>
          </li>*/}
        <li>
          <p className="tit">청구/정산 담당</p>
          <div className="input__area">
            {/*<div className="box__search">
              <input type="text" placeholder="직접입력" />
              <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
          </div>*/}
            <input type="text" placeholder="직접입력"
              value={companyInfo.accountManager} 
              className={(errorList.filter(err=>(err.field==="accountManager")).length>0)?"input-error":""}                
              onChange={(e)=>setCompanyInfo({...companyInfo, accountManager:e.target.value})}             
            />
            <p className="input-errortxt">{errorList.filter(err=>(err.field==="accountManager")).map((err)=>err.msg)}</p>                                
          </div>
        </li>
        <li>
          <p className="tit">청구/정산 담당 Tel</p>
          <div className="input__area">
            <input type="text" id="inp10" placeholder="텍스트를 입력하세요"
              value={companyInfo.accMngrTelephone} 
              className={(errorList.filter(err=>(err.field==="accMngrTelephone")).length>0)?"input-error":""}                
              onChange={(e)=>setCompanyInfo({...companyInfo, accMngrTelephone:e.target.value})}             
            />
            <p className="input-errortxt">{errorList.filter(err=>(err.field==="accMngrTelephone")).map((err)=>err.msg)}</p>                                
          </div>
        </li>
        <li>
          <p className="tit">I/F Info</p>
          <div className="input__area">
            <input type="text" id="inp11" placeholder="텍스트를 입력하세요"
              value={companyInfo.interfaceInfo} 
              className={(errorList.filter(err=>(err.field==="interfaceInfo")).length>0)?"input-error":""}                
              onChange={(e)=>setCompanyInfo({...companyInfo, interfaceInfo:e.target.value})}             
            />
            <p className="input-errortxt">{errorList.filter(err=>(err.field==="interfaceInfo")).map((err)=>err.msg)}</p>                                
          </div>
        </li>
        <li>
          <p className="tit">메모</p>
          <div className="input__area">
            <textarea placeholder="메모를 입력하세요."
                className={(errorList.filter(err=>(err.field==="memo")).length>0)?"input-error":""}
                value={companyInfo.memo}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetCompanyInfoMemo)}
                onChange={(e) => setCompanyInfo({...companyInfo, memo : e.target.value})}></textarea>
              <p className="input-errortxt">{errorList.filter(err=>(err.field==="memo")).map((err)=>err.msg)}</p>                                    
          </div>
        </li>
        <li>
          <div className="btn__wrap right w100p">
            <button type="button" 
              className="bg-gray"
              onClick={(e)=>onClickCancelUpdateCompany(e, companyInfo)}
            >
              <span>취소</span>
            </button>
            <button type="button"
              onClick={(e)=>onClickDoUpdateCompany(e)}
            >
              <span>저장</span>
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
  </>
  )
};
export default CompanyUpdate;

