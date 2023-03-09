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

//utils
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils"


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
    clog("IN SITE TREE : INIT : " + adminType + " : " + workMode + " : " + JSON.stringify(selTree));
    //화면 이동
    const navigate = useNavigate();
    //
    const [menuList, setMenuList] = useState([
        { "menuId": 0, "menuName": "메뉴별 권한 설정", "adminType": "AUTH" },
        { "menuId": 1, "menuName": "다국어 설정", "adminType": "LANG" },
    ]);

    // useEffect(() => {
    //     // tree 초기화 - 선택
    //     setParentSelTree(menuList[0].adminType, {
    //         menu: { "menuId": menuList[0].menuId, "menuName": menuList[0].menuName, },
    //     })
    // }, [])
    /*
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
    */
    function onClickGoMenu(e, menu) {
        e.stopPropagation();
        setParentSelTree(menu.adminType, {
            menu: { "menuId": menu.menuId, "menuName": menu.menuName, },
        })

        setParentWorkMode("READ");
    }

    return (
        <>
            {/*<!--왼쪽 영역-->*/}
            <div className="area__left">
                {/*<!--왼쪽 사업장 관리 메뉴 영역-->*/}
                <div className="lnb">
                    <ul className="lnb-depth1">
                        <li className={"active"}>
                            <p>
                                <a><span>메뉴별 권한 설정</span></a>
                            </p>
                        </li>
                        <li className={"active"}>
                            <p>
                                <a><span>다국어 설정</span></a>
                            </p>
                        </li>
                    </ul>
                </div>
                {/*<!--//왼쪽 회사 관리 메뉴 영역-->*/}
            </div>
            {/*<!--//왼쪽 영역-->*/}
        </>
    )
};
export default SiteTree;

