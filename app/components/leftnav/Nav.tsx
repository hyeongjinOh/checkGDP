/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved.
*/
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-05-20
 * @brief EHP 햄버거 메뉴 컴포넌트
 *
 ********************************************************************/
import React, { useState, useEffect } from "react";
import { useAsync } from "react-async";
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilState, useSetRecoilState, useResetRecoilState, useRecoilValue } from "recoil";
import { langState } from '../../recoil/langState';
import { urlState, menuState, menuInfoState, menuListState, loadingBoxState } from '../../recoil/menuState';
import { userInfoLoginState } from "../../recoil/userState";

//
//utils
import clog from "../../utils/logUtils";
import * as CONST from "../../utils/Const"
import * as CUTIL from "../../utils/commUtils"
import * as HTTPUTIL from "../../utils/api/HttpUtil"
//
import $ from "jquery"

/**
 * @brief EHP 햄버거 메뉴 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

/*color: ${(props) => (props.age > 20 ? 'red' : 'gray')};*/
function Nav(props) {
  //trans, navigate, ref 
  const navigate = useNavigate();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [urlInfo, setRecoilUrlInfo] = useRecoilState(urlState);
  const [menuInfo, setRecoilMenuInfo] = useRecoilState(menuInfoState);
  const [menuRecoilList, setRecoilMenuList] = useRecoilState(menuListState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  const [langs, setRecoilLangs] = useRecoilState(langState); // recoil langState
  const [hbMenuToggle, setRecoilHbMenuToggle] = useRecoilState(menuState);
  //props
  const isWindow = props.isWindow; // header에서 tag size로 모바일 여부를 체크함
  const handleClick = props.handleClick;
  //
  const [selMenu, setSelMenu] = useState<any>(null);
  const [active, setActive] = useState(false);
  const [subActive, setSubActive] = useState(false);
  const [curMenuTagId, setCurMenuTagId] = useState<string>("-1");
  const [curMenuTagId2, setCurMenuTagId2] = useState<string>("-1");

  //
  const [menuList, setMenuList] = useState<any>([]);
  const [errorList, setErrorList] = useState([]);

  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/menus/role`,
    appQuery: {
    },
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: langs
    //watch: selTree.company.companyId+selTree.reload
  });

  useEffect(() => {
    setRecoilIsLoadingBox(true);
    /*
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
    if (ERR_URL.length > 0) {
      setRecoilIsLoadingBox(false);
      navigate(ERR_URL);
    }
    */
    if (retData) {
      setRecoilIsLoadingBox(false);
      if (retData.codeNum == CONST.API_200) {
        //clog("IN HAM-MENU : RES : " + JSON.stringify(retData.body));
        sessionStorage.setItem(CONST.STR_EHP_MENULIST, JSON.stringify(retData.body)); // 특정 화면에서 url로 menu 정보 추출하기 위함
        setRecoilMenuList(retData.body);
        setMenuList(retData.body);
      }
    }
  }, [retData])

  function onClickGoPage(url) {
    // 페이지 이동
    //clog("onClickGoPage : " + url);
    navigate(url);
    setRecoilHbMenuToggle(false);
  }

  function onClickGoMenu(menu) {

    if (menu.isExternalUrl) {
      clog("onClickGoMenu : " + JSON.stringify(menu));
      window.open(menu.url, "_blank", "noreferrer");
      return;
    }
    var url = CUTIL.isnull(menu.url) ? CONST.URL_SYSTEM_ERROR : menu.url;
    //
    setRecoilUrlInfo(url);
    onClickGoPage(url);
  }




  function subMenuOnClick(e) {
    e.stopPropagation();
    // $(".container").css("overflow-y", "hidden"); //body 스크롤 숨기기(화면고정)
    // li tag 가져오기
    var tmpTag = (e.target.tagName == "A") ? e.currentTarget : e.target;

    $(".navbar__menu li.active ul li").removeClass("active");

    if (curMenuTagId2 != tmpTag.id) {
      tmpTag.className = "active";
    } else {
      tmpTag.className = (subActive) ? "" : "active";
    }
    setActive(subActive ? false : true);
    // 선택된 메뉴ID 셋팅
    setCurMenuTagId2(tmpTag.id);
  }

  function menuOnClick(e, menu) {

    //e.stopPropagation();
    if (selMenu) {
      if (selMenu.menuCode === menu.menuCode)  {
        setSelMenu(null);
      } else {
        setSelMenu(menu);
      }
    } else {
      setSelMenu(menu);
    }
  }


  function menuOnClickOLD(e) {
    e.stopPropagation();
    var tmpTag = (e.target.tagName == "A") ? e.currentTarget : e.target;

    $(".navbar__menu li").removeClass("active");

    clog("ON NAV : menuOnClick : " + tmpTag.tagName + " : " + tmpTag.id);

    if (curMenuTagId != tmpTag.id) {
      tmpTag.className = "active";
    } else {
      tmpTag.className = (active) ? "" : "active";
    }
    setActive(active ? false : true);
    // 선택된 메뉴ID 셋팅
    setCurMenuTagId(tmpTag.id);
  }


  function navbarOnClick(e) {
    clog("navbar onClick...");
    //handleClick(e);   
    //setRecoilHbMenuToggle(hbMenuToggle?false:true);
    setRecoilHbMenuToggle(!hbMenuToggle);
  }

  return (
    <>
      {/*<!-- nav, 좌측메뉴 -->*/}
      <nav className={`navbar ${(hbMenuToggle) ? "active" : ""}`} onClick={(e) => navbarOnClick(e)}>
        {/* <!--221212, 미승인사용자 메뉴일 경우 nook-user 클래스 추가(첫번째 메뉴에서 버튼 나오도록)--> */}
        <ul className={`navbar__menu ${(userInfo.loginInfo.role == CONST.USERROLE_NONE) ? "nook-user" : ""}`} onClick={(e) => e.stopPropagation()}>
          {menuList.filter((menu) => (CUTIL.isnull(menu.parentCode))).map((menu, midx) => (
            ((isWindow) ? true : menu.isMobile) &&
            <li key={`mmenu_${midx.toString()}`} onClick={(e) => menuOnClick(e, menu)}
              className={(selMenu)&&(menu.menuCode === selMenu.menuCode)?"active":""}
            >
              {(menuList.filter((m) => (m.parentCode === menu.menuCode)).length <= 0)
                ? <a href="#" onClick={(e) => onClickGoMenu(menu)}>{menu.menuName}</a>
                : <>
                  <a href="#">{menu.menuName}</a>
                  <ul>
                    {menuList.filter((m) => (m.parentCode === menu.menuCode)).map((smenu, sidx) => (
                      ((isWindow) ? true : smenu.isMobile) &&
                      <li key={`smemnu_${sidx.toString()}`} onClick={(e)=>onClickGoMenu(smenu)}>
                        {/*<li key={`smemnu_${sidx.toString()}`} onClick={(e) => subMenuOnClick(e)}>*/}
                        {/*clog("> SUB MENU INFO : " + JSON.stringify(smenu))*/}
                        <a onClick={(e)=>onClickGoMenu(smenu)}>{smenu.menuName}</a>
                      </li>
                    ))}
                  </ul>
                </>
              }
            </li>
          ))}
        </ul>
      </nav>
      {/*<!-- //nav, 좌측메뉴 -->*/}
    </>
  );

}


export default Nav;