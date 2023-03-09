/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-10-01
 * @brief EHP Check Sheet 관리 개발
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
 * @brief EHP Check Sheet - Tree 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */


function CheckSheetTree(props) {
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
  //화면 이동
  const navigate = useNavigate();
  //
  /*
  const [menuList, setMenuList] = useState([
    {"menuId":0, "menuName":"VCB", "adminType":"AUTH"},
    {"menuId":1, "menuName":"ACB", "adminType":"LANG"},
    {"menuId":2, "menuName":"Mold TR", "adminType":"LANG"},
    {"menuId":3, "menuName":"GIS", "adminType":"LANG"},
    {"menuId":4, "menuName":"유압식 TR", "adminType":"LANG"},
    {"menuId":5, "menuName":"배전반", "adminType":"LANG"},
  ]);

  useEffect(()=>{
    // tree 초기화 - 선택
    setParentSelTree(menuList[0].adminType, {
      menu: { "menuId": menuList[0].menuId, "menuName": menuList[0].menuName, },
    })
  }, [])
  */
  const [spgList, setSpgList] = useState([]);
  
  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/company/zone/subzone/room/spgs`,
    appQuery: {},
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: adminType + selTree.reload
  });

  useEffect(() => {
    //setRecoilIsLoadinBox(true);
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
    if (ERR_URL.length > 0) {
      //setRecoilIsLoadinBox(false);
      navigate(ERR_URL);
    }
    if (retData) {
      //setRecoilIsLoadinBox(false);
      clog("IN CHECKSHEETTREE : RES : " + JSON.stringify(retData.body));
      if (retData.codeNum == CONST.API_200) {
        setSpgList(retData.body);
        setParentSelTree(adminType, {...selTree, reload:false});
      }
    }
  }, [retData])

  function onClickGoMenu(e, spg) {
    e.stopPropagation();
    setParentPopWin("pop-spgcheck-detail", null);
    setParentPopWin("pop-spgcheck-edit", null);
    setParentPopWin("pop-spgcheck-add", null);
    setParentPopWin("pop-version-ok", null);

    setParentSelTree(`SPG-${spg.spgName}`, {
      spg: { "spgId": spg.spgId, "spgName": spg.spgName, },
    })
    setParentWorkMode("LIST");
  }

  clog("IN TREE : INIT : adminType : " + adminType + " : workMode : " + workMode);


  return (
  <>
  {/*<!--왼쪽 영역-->*/}
  <div className="area__left">
    {/*<!--왼쪽 사업장 관리 메뉴 영역-->*/}
    <div className="lnb">
      <ul className="lnb-depth1">
        {spgList.map((spg, idx)=>(
        <li key={`spg_${idx.toString()}`}
          className={(spg.spgId===selTree.spg.spgId)?"active":""}
        >
          <p>
            <a onClick={(e)=>onClickGoMenu(e, spg)}>
              <span>{spg.spgName}</span>
            </a>
          </p>
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
export default CheckSheetTree;

