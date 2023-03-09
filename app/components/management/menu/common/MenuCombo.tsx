/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-09-20
 * @brief EHP 메뉴 관리 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";
import { loadingBoxState } from "../../../../recoil/menuState";

// utils
import clog from "../../../../utils/logUtils";
import * as CONST from "../../../../utils/Const"
import * as CUTIL from "../../../../utils/commUtils"
import * as HTTPUTIL from "../../../../utils/api/HttpUtil"

//component
import EhpPagination from "../../../common/pagination/EhpPagination";

/**
 * @brief EHP 메뉴 관리 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
function MenuCombo(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //props
  const selTree = props.selTree;
  const setParentCodeParam = props.setCodeParam;
  const setParentCurPage = props.setCurPage;

  //화면 이동
  const navigate = useNavigate();

  // 1depth menu
  const [rootMenu, setRootMenu] = useState([]);
  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/menu/1depth`,
    appQuery: {},
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    //watch: selTree+appPath+menuListReload
    //watch: selTree.company.companyId+selTree.reload
  });

  useEffect(() => {
    setRecoilIsLoadingBox(true);
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
    if (ERR_URL.length > 0) {
      setRecoilIsLoadingBox(false);
      navigate(ERR_URL);
    }
    if (retData) {
      //clog("IN ROOTMENU VIEW : RES : " + JSON.stringify(retData));
      setRecoilIsLoadingBox(false);
      if (retData.codeNum == CONST.API_200) {
        //setMenuListReload(false); // list reload
        //setIsEditable(false);
        setRootMenu(retData.body);
        //setPageInfo({...retData.data.page, psize:(isMobile)?CONST.NUM_MLISTCNT:CONST.NUM_WLISTCNT}); //5, 10
      }
    }
  }, [selTree, retData])

    /// default select box handler
  // option 선택 시  값 변경 액션
  function selectOptionMenu(optionElement) { // 확장 가능
    const selectBox = optionElement.closest(".select");
    const selectedElement = selectBox.querySelector(".selected-value ");
    selectedElement.textContent = optionElement.textContent;
    var optionData = optionElement.getAttribute("data-value");
    selectedElement.setAttribute("data-value", optionData);
    //
    clog("IN SELECT OPTION SCROE : " + optionData);
    setParentCurPage(0);
    setParentCodeParam(optionData)
  }


  return (
  <>
  <div className="searcharea">
    <div className="searchinput">
      <span className="mr-30"><strong>메뉴</strong></span>
      <div className="select w186" onClick={(e)=>CUTIL.onClickSelect(e, selectOptionMenu)}>
        <div className="selected">
          <div className="selected-value">전체</div>
          <div className="arrow"></div>
        </div>
        <ul>
          <li className="option" data-value={""}>전체</li>
          {rootMenu.map((menu, idx)=>(
            <li key={`li_${idx.toString()}`}
              className="option" 
              data-value={menu.menuCode}>{menu.menuName}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
  </>
  )
}

export default MenuCombo;