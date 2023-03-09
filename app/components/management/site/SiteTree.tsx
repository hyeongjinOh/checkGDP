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

//utils
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils"
/**
 * @brief EHP 사업장 관리 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function SiteTree(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadinBox] = useRecoilState(loadingBoxState);
  // props
  const isMobile = props.isMobile;
  const selTree = props.selTree;
  const setParentSelTree = props.setSelTree;
  const adminType = props.adminType;
  const setParentAdminType = props.setAdminType;
  const setParentWorkMode = props.setWorkMode;
  const workMode = props.workMode;
  const tabType = props.tabType;
  const setParentPopWin = props.setPopWin;
  //
  //clog("IN SITE TREE : INIT : " + adminType + " : " + workMode + " : " + JSON.stringify(selTree));
  //화면 이동
  const navigate = useNavigate();
  //
  const [companyList, setCompanyList] = useState([]);
  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/companies`,
    appQuery: {},
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: adminType + workMode + selTree.reload
  });

  useEffect(() => {
    setRecoilIsLoadinBox(true);
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
    if (ERR_URL.length > 0) navigate(ERR_URL);
    if (retData) {
      //clog("IN SITETREE : RES : " + JSON.stringify(retData.body));
      if (retData.codeNum == CONST.API_200) {
        setCompanyList(retData.body);
        setParentSelTree(adminType, {...selTree, reload:false});
      }
    }
    setRecoilIsLoadinBox(false);
  }, [retData])

  // 사업장 추가
  function onClickCompanyInsert(e) {
    setParentAdminType("COMPANY");
    setParentWorkMode("CREATE");
  }

  function onClickCompanyView(e, company) {
    e.stopPropagation();
    setParentSelTree("COMPANY", {
      company: { "companyId": company.companyId, "companyName": company.companyName, },
    })

    setParentWorkMode("READ");
  }

  function onClickZoneInsert(e, company) {
    e.stopPropagation();
    setParentSelTree("ZONE", {
      company: { "companyId": company.companyId, "companyName": company.companyName, },
    })

    setParentWorkMode("CREATE");
  }

  return (
  <>
  {/*<!--왼쪽 영역-->*/}
  <div className="area__left">
    <div className="lnb__top">
      <button type="button" 
        className={`add__item js-open-s ${((adminType==="COMPANY")&&(workMode==="CREATE"))?"active":""}`} 
        data-pop="pop-area-right"
        onClick={(e)=>onClickCompanyInsert(e)}
      >
        <span>회사 추가</span>
      </button>
      {/*<button type="button" className="btn btn-setting">
        <span className="hide">사업장순서변경</span>
      </button>*/}
    </div>
    {/*<!--왼쪽 사업장 관리 메뉴 영역-->*/}
    <div className="lnb">
      <ul className="lnb-depth1">
        {companyList.map((company, idx)=>(
        <li key={`comp_${idx.toString()}`}
          className={(company.companyId===selTree.company.companyId)?"active":""}
        >
          <p>
            <a onClick={(e)=>onClickCompanyView(e, company)}>
              <span>{company.companyName}</span>
            </a>
          </p>
          <ul className="lnb-depth2">
            <li>
              <button type="button"
                className={`add__item ${((adminType==="ZONE")&&(workMode==="CREATE"))?"active":""}`} 
                onClick={(e)=>onClickZoneInsert(e, company)}
              >
                <span>사업장 추가</span>
              </button>
            </li>
          </ul>
        </li>
        ))
        }
      </ul>
    </div>
    {/*<!--//왼쪽 회사 관리 메뉴 영역-->*/}
  </div>
  {/*<!--//왼쪽 영역-->*/}
  </>
  )
};
export default SiteTree;

