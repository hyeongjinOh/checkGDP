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
 import { userInfoLoginState } from "../../recoil/userState";
 import { loadingBoxState } from "../../recoil/menuState";
 
 //utils
 import * as CONST from "../../utils/Const"
 import * as HTTPUTIL from "../../utils/api/HttpUtil"
 import clog from "../../utils/logUtils";
 import * as CUTIL from "../../utils/commUtils"

 /**
 * @brief EHP DashBoard 개발 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function DndDashboardTree(props) {
  //trans, ref, navigate
  const navigate = useNavigate();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadinBox] = useRecoilState(loadingBoxState);
  // props
  //const locTree = props.locTree;
  const selTree = props.selTree;
  const setParentIsTreeOpen = props.setIsTreeOpen;
  const setParentSelTree = props.setSelTree;
  //
  const locTreeStr = localStorage.getItem(CONST.STR_EHP_DASHBODRD_PIN);
  const locTree = JSON.parse(locTreeStr);
  const [companyList, setCompanyList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchData, setSearchData] = useState({
    "searchText": null,
  });
  let searchQuery = "";
  //text검색
  if ((searchData.searchText)&&(searchData.searchText.length > 0)) {
    searchQuery = searchQuery + `search=${searchData.searchText}`;
  }

  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/dashboard/usertree?${searchQuery}`,
    appQuery: {},
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: searchQuery,
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
        if (!CUTIL.isnull(locTree)) {
          //clog("IN DND TREE : locTree : " + JSON.stringify(locTree));
          //clog("IN DND TREE : selTREE : " + JSON.stringify(selTree));
          (async()=>{ // IFFE(Immediately Invoked Function Expression)은 함수가 정의되자마자 실행되는 자바스크립트 기술입니다.
            const isExist = await isExistCZone(locTree);
            if ( isExist ) {
              setParentSelTree(locTree);
            } else {
              setParentSelTree(selTree);
            }
          })();          
        }
        setCompanyList(retData.body);
      }
    }
  }, [retData])

  async function isExistCZone(czone) {
    let ret = false;
    let data: any = null;

    if (czone.zone.zoneId.length <= 0) return true;


    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "GET",
      "appPath": `/api/v2/product/company/zone/${czone.zone.zoneId}`,
      appQuery:{},
      userToken: userInfo.loginInfo.token,
    });
    if ( data && data.codeNum === CONST.API_200 ) {
      ret = true;
    }

    return ret;
  }


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
    setParentIsTreeOpen(false);
  }

  //clog("IN DND TREE : INIT : " + JSON.stringify(selTree) + " : LOC : " + JSON.stringify(locTree));

  function goSearch(e) {
    setSearchData({
      "searchText": searchText,
    });
  }

  return (
  <>
    <div className="lnb__top">
      <div className="box__search">
        <input type="text" placeholder="회사명을 입력하세요" value={searchText} onChange={(e)=>setSearchText(e.target.value)}/>
        <button type="button" className="btn btn-search" onClick={(e)=>goSearch(e)}>
          <span className="hide">조회</span>
        </button>
      </div>
    </div>
    {(companyList.length > 0)
    ?<div className="lnb">
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
          )
        }
      </ul>
    </div>
    : <div className="lnb nodata">
        <div className="nodata_txt">검색결과가 없습니다.</div>
      </div>
    }
  </>
  )
}

export default DndDashboardTree;