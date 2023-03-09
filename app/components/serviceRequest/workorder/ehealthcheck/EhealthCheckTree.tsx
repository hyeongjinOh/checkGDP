/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author JiHoon Park
 * @contact jhpark@detech.co.kr
 * @date 2022-10-25
 * @brief EHPworkorder - EhealthCheck 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState, DependencyList } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";
import { loadingBoxState, czoneInfoState, treeMenuState } from "../../../../recoil/menuState";

//utils
import * as CONST from "../../../../utils/Const"
import * as HTTPUTIL from "../../../../utils/api/HttpUtil"
import clog from "../../../../utils/logUtils";
import * as CUTIL from "../../../../utils/commUtils"
/**
 * @brief EHP WorkOrder - EhealthCheck 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */


function EhealthCheckTree(props) {
  //화면 이동
  const navigate = useNavigate();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadinBox] = useRecoilState(loadingBoxState);
  const [czoneInfo, setRecoilCZoneInfo] = useRecoilState(czoneInfoState);
  const [treeOpen, setRecoilTreeOpen] = useRecoilState(treeMenuState);  
  
  // props
  const isTreeOpen = props.isTreeOpen;
  const setParentIsTreeOpen = props.setIsTreeOpen;
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
  const [companyTree, setCompanyTree] = useState([]);
  // isMobile 여부 랜더링 후 확인
  useDebounceEffect(
    async () => {
      if ( czoneInfo.zone.zoneId.length > 0) {
        const zoneTag = document.getElementById(`li_focus_${czoneInfo.zone.zoneId}`);
        if (!CUTIL.isnull(zoneTag)) {
          zoneTag.scrollIntoView();
          setRecoilCZoneInfo({company:{companyId:"", companyName:""}, zone:{zoneId:"", zoneName:""}});
        }
      }
    }, 100, [companyTree],
  )

  //
  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/dashboard/usertree`,
    appQuery: {},
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: adminType + workMode + selTree.reload
  });

  useEffect(() => {
    setRecoilIsLoadinBox(true);
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
    if (ERR_URL.length > 0) navigate(ERR_URL);
    if (retData) {
      clog("IN WORKORDER : EHCTREE : RES : "/* + JSON.stringify(retData.body)*/);
      if (retData.codeNum == CONST.API_200) {
        setCompanyTree(retData.body);
        setParentSelTree(adminType, {...selTree, reload:false});
        
        if (czoneInfo.zone.zoneId.length <= 0) {
          setParentSelTree(adminType, {...selTree, reload:false});
        } else {
          //setParentSelTree(adminType, {...czoneInfo, reload:false});
          setParentSelTree("EHC", {
              "company" : { "companyId": czoneInfo.company.companyId, "companyName": czoneInfo.company.companyName, },
              "zone" : { "zoneId": czoneInfo.zone.zoneId, "zoneName": czoneInfo.zone.zoneName, },
              "subZone" : { "subZoneId": "", "subZoneName": "", },
              reload : false,
            }
          )
  
        }
        
      }
    }
    setRecoilIsLoadinBox(false);
  }, [retData])

  clog("XXXXXXXXXXXXXX : " + treeOpen + " : " + isTreeOpen);
  return (
  <>
    {/*<!--area__left, 왼쪽 영역 / 2뎁스까지만 있는 경우 클래스 only-depth2 추가(workorder)-->*/}
    <div className={`area__left only-depth2 ${(treeOpen)&&(isTreeOpen)?"":"close"}`}>
      <div className="box__etc">
        <button type="button" className="btn btn-left" onClick={(e)=>setParentIsTreeOpen(!isTreeOpen)}>
          <span className="hide">트리메뉴접기펼치기</span>
        </button>
      </div>
      {/*<!--왼쪽 메뉴 영역, 기존과 액션은 동일하고 클래스만 추가됨-->*/}
      <div className="lnb">
        <ul className="lnb-depth1">
          {companyTree.map((company, idx)=>(
            <ZoneTree key={`comp_${idx.toString()}`}
              selTree={props.selTree}
              setSelTree={props.setSelTree}
              company={company}
            />
          ))}
        </ul>
      </div>
      {/*<!--//왼쪽 메뉴 영역-->*/}
    </div>
  </>
  )
};
export default EhealthCheckTree;


function ZoneTree(props) {
  //props
  const selTree = props.selTree;
  const setParentSelTree = props.setSelTree;
  const company = props.company;
  
  function onClickZone(e, company, zone) {
    e.stopPropagation();
    setParentSelTree("EHC", 
      { "company" : { "companyId": company.companyId, "companyName": company.companyName, },
        "zone" : { "zoneId": zone.zoneId, "zoneName": zone.zoneName, },
        "subZone" : { "subZoneId": "", "subZoneName": "", },
        reload : false,
      }
    )
  }

  return (
    <>
    {(company.zone)&&(company.zone).map((zone, idx)=>(
    <li key={`compzone_${idx.toString()}`}
      className={(zone.zoneId === selTree.zone.zoneId)?"active":""}
      onClick={(e)=>onClickZone(e, company, zone)}
      id={`li_focus_${zone.zoneId}`}
    >
      <p>
        <a href="#">
          <span>{company.companyName}</span>
          <span>{zone.zoneName}</span>
        </a>
      </p>
      <SubZoneTree
        selTree={props.selTree}
        setSelTree={props.setSelTree}
        zone={zone}
      />
    </li>
    ))}
    </>
  )
}

function SubZoneTree(props) {
  //props
  const selTree = props.selTree;
  const setParentSelTree = props.setSelTree;
  const zone = props.zone;

  function onClickSubZone(e, subZone) {
    e.stopPropagation();
    setParentSelTree("EHC", 
      { ...selTree,
        "subZone" : { "subZoneId": subZone.subZoneId, "subZoneName": subZone.subZoneName},       
      }
    )
  }

  return (
  <>
    {(zone.subZone)&&
    <ul className="lnb-depth2">
      {zone.subZone.map((subZone, idx)=>(
      <li key={`sz_${idx.toString()}`}
        className={selTree.hasOwnProperty("subZone")?(subZone.subZoneId === selTree.subZone.subZoneId)?"active":"":""}
        onClick={(e)=>onClickSubZone(e, subZone)}
      >
        <a href="#">{subZone.subZoneName}</a>
      </li>
      ))}
    </ul>}
  </>
  )
}


export function useDebounceEffect(
  fn: () => void,
  waitTime: number,
  deps?: DependencyList,
) {
  useEffect(() => {
    const t = setTimeout(() => {
      fn.apply(undefined, deps)
    }, waitTime)

    return () => {
      clearTimeout(t)
    }
  }, deps)
}