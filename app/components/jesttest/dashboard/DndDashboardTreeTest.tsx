/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-01
 * @brief EHP DashBoard  컴포넌트
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
/**
 * @brief EHP Status - DashBoard 개발 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */

function DndDashboardTreeTest(props) {
  //trans, ref, navigate
  const navigate = useNavigate();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadinBox] = useRecoilState(loadingBoxState);
  // props
  //const locTree = props.locTree;
  const selTree = props.selTree;
  const setParentSelTree = props.setSelTree;
  //
  const locTreeStr = localStorage.getItem(CONST.STR_EHP_DASHBODRD_PIN);
  const locTree = JSON.parse(locTreeStr);
  const [companyList, setCompanyList] = useState([]);
  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/dashboard/usertree`,
    //appPath: `/api/v2/product/company/zone/subzone`,
    appQuery: {},
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: "",
  });

  useEffect(() => {
    setRecoilIsLoadinBox(true);
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
    if (ERR_URL.length > 0) navigate(ERR_URL);
    if (retData) {
      setRecoilIsLoadinBox(false);
      //clog("IN DASHBOARD : EHCTREE : RES : " + JSON.stringify(retData.body));
      if (retData.codeNum == CONST.API_200) {
        //const czoneStr = localStorage.getItem(CONST.STR_EHP_DASHBODRD_PIN);
        //clog("PIN LC INFO : " + czoneStr);
        if (!CUTIL.isnull(locTree)) {
          setParentSelTree(locTree);
        }
        setCompanyList(retData.body);
      }
    }
  }, [retData])

  function onClickCompanyZone(company, zone) {
    if (company === null) {
      setParentSelTree({
        "company" : {"companyId" : "", "companyName" : "전체"},
        "zone" : {"zoneId" : "", "zoneName" : "전체"},
        "reload" : false
    });
    } else {
      setParentSelTree({
          "company" : {"companyId" : company.companyId, "companyName" : company.companyName},
          "zone" : {"zoneId" : zone.zoneId, "zoneName" : zone.zoneName},
          "reload" : false
      });
    }
  }

  //clog("IN DND TREE : INIT : " + JSON.stringify(selTree) + " : LOC : " + JSON.stringify(locTree));

  return (
  <>
    <div className="lnb__top">
      <div className="box__search">
        <input type="text" placeholder="회사명을 입력하세요" />
        <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
      </div>
    </div>
    <div className="lnb">
      <ul className="lnb-depth1">
        <li className={`${(selTree.zone.zoneId==="")?"active":""}`}>
          <p>
            <a onClick={(e)=>onClickCompanyZone(null, null)}> 전체 </a>
            <button type="button"
              className={`btn btn-pin ${(locTree)&&(locTree.zone.zoneId==="")?"blue":""}`}
            >
              <span className="hide">메인 대시보드 고정</span>
            </button>
          </p>
        </li>
        {companyList.map((company, cidx)=>(
          company.hasOwnProperty("zone")&&company.zone&&company.zone.map((zone, zidx)=>(
          <li key={`li_${cidx.toString()}_${zidx.toString()}`} className={`${(selTree.zone.zoneId===zone.zoneId)?"active":""}`}>
            <p>
              <a onClick={(e)=>onClickCompanyZone(company, zone)}>
                <span>{company.companyName}</span>
                <span>{zone.zoneName}</span>
              </a>
              <button type="button"
                className={`btn btn-pin ${(locTree)&&(locTree.zone.zoneId===zone.zoneId)?"blue":""}`}
              >
                <span className="hide">메인 대시보드 고정</span>
              </button>
            </p>
          </li>
          )))
        )}
      </ul>
    </div>
    
  </>
  )
}

export default DndDashboardTreeTest;