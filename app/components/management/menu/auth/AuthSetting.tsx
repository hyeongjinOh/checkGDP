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
import MenuCombo from "../common/MenuCombo";
/**
 * @brief EHP 메뉴 관리 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
function AuthSetting(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //props
  const isMobile = props.isMobile;
  const adminType = props.adminType;
  const setParentAdminType = props.setAdminType;
  const selTree = props.selTree;
  const setParentSelTree = props.setSelTree;
  const workMode = props.workMode;
  const setParentWorkMode = props.setWorkMode;
  
  //화면 이동
  const navigate = useNavigate();
  //
  const [menuList, setMenuList] = useState([]);
  const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0, "psize":10 };
  const [pageInfo, setPageInfo] = useState(defaultPageInfo);
  function handleCurPage(page) {
    setPageInfo({ ...pageInfo, number: page });
  }
  const [codeParam, setCodeParam] = useState("");
  let appPath = "";
  appPath = 'page=' + pageInfo.number + '&size=' + pageInfo.size;
  if (codeParam.length > 0) {
    appPath = appPath + "&menuCode="+codeParam
  }  


  const [menuListReload, setMenuListReload] = useState(false);
  const [errorList, setErrorList] = useState([]);
  //{menuCode, menuName, errList : {}}
  //[{"field":"menuName","msg":"필수 항목입니다."}]

  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/menus/admin?${appPath}`,
    appQuery: {},
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: selTree+appPath+menuListReload
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
      //clog("IN AUTH SETTING : RES : " + JSON.stringify(retData));
      setRecoilIsLoadingBox(false);
      if (retData.codeNum == CONST.API_200) {
        setMenuListReload(false); // list reload
        setIsEditable(false);
        setMenuList(retData.body);
        setPageInfo({...retData.data.page, psize:(isMobile)?CONST.NUM_MLISTCNT:CONST.NUM_WLISTCNT}); //5, 10
      }
    }
  }, [selTree, retData])



  const [isEditable, setIsEditable] = useState(false);

  // check..
  function onClickRoleSettingSRC(e, menuObj, strRole) {
    e.preventDefault();
    e.stopPropagation();
    const insRoleDtos = menuObj.roleDtos.filter((role)=>(role.role===strRole));
   
    setMenuList(
      menuList.map((smenu)=>(smenu.menuCode===menuObj.menuCode)
        ? {...smenu, 
            roleDtos : (insRoleDtos.length > 0) // role str toggle
              ? menuObj.roleDtos.filter((role)=>(role.role!==strRole)) // exist then role dto에 해당 권한 제외/삭제
              : menuObj.roleDtos.concat({"id":-1, "role":strRole})  // no exist then role dto에 해당 권한 추가
          }
        : smenu
      )
    );
    let tList = null;
    if (CUTIL.isnull(menuObj.parentCode)) { // 최상위 메뉴 처리 // 헤제일 경우만, 하위 모두 헤제
      //alert("최상위");
      if (insRoleDtos.length > 0) { // 하위 헤제
        setMenuList(
          menuList.map((cmenu)=>(cmenu.parentCode===menuObj.menuCode)
            ? {...cmenu,
                roleDtos : cmenu.roleDtos.filter((role)=>(role.role!==strRole))
              }
            : cmenu
          )
        )
      }
    } else { // 하위 메뉴 처리 - 최상위에 권한 동시 추가
      alert("하위");
    }
  }

  function onClickRoleSetting(e, menuObj, strRole) {
    e.preventDefault();
    e.stopPropagation();
    const insRoleDtos = menuObj.roleDtos.filter((role)=>(role.role===strRole));
   
    const sList =  menuList.map((smenu)=>(smenu.menuCode===menuObj.menuCode)
        ? {...smenu, 
            roleDtos : (insRoleDtos.length > 0) // role str toggle
              ? menuObj.roleDtos.filter((role)=>(role.role!==strRole)) // exist then role dto에 해당 권한 제외/삭제
              : menuObj.roleDtos.concat({"id":-1, "role":strRole})  // no exist then role dto에 해당 권한 추가
          }
        : smenu
      )
    let tList = sList;
    if (CUTIL.isnull(menuObj.parentCode)) { // 최상위 메뉴 처리 // 헤제일 경우만, 하위 모두 헤제
      if (insRoleDtos.length > 0) { // 해당 권한이 있을때 -> 해제
        tList = sList.map((cmenu)=>(cmenu.parentCode===menuObj.menuCode) // 하위 찾기
          ? {...cmenu,
              roleDtos : cmenu.roleDtos.filter((role)=>(role.role!==strRole))
            }
          : cmenu
        )
      }
    } else { // 하위 메뉴 처리 - 최상위에 권한 동시 추가
      //alert("하위");
      if (insRoleDtos.length <= 0) { // 해당 권한이 없을때 -> 추가
        tList = sList.map((cmenu)=>(cmenu.menuCode===menuObj.parentCode) // 상위 찾기
          ? (cmenu.roleDtos.filter((role)=>(role.role===strRole)).length > 0) // 상위에 해당 권한이 있으면...
            ? cmenu
            : {...cmenu,
                roleDtos : cmenu.roleDtos.concat({"id":-1, "role":strRole})
              }
          : cmenu
        )
      }
    }

    setMenuList(tList);
  }

  async function onClickDoSaveRoleSetting(e) {
    const errList = [];
    var doCnt = 0;
    var doneCnt = 0;
    var succCnt = 0;
    const failMenuList = [];

    var ret = confirm("변경 내용을 저장하시겠습니까?");
    if ( !ret ) return;

    setRecoilIsLoadingBox(true);
    menuList.map(async (menu)=>{
      doCnt ++;
      let data: any = null;
      clog("EACH : " + JSON.stringify(menu));
      data = await doSaveRoleSetting(menu);
      CUTIL.sleep(500);
      if (data) {
        clog("EACH SAVE DONE : " + menu.menuCode + " : " + JSON.stringify(data));
        doneCnt ++;
        if (data.codeNum == CONST.API_200) {
          succCnt ++;
        } else { // api if
          // need error handle
          //setErrorList(data.body.errorList);
          //errList.push({menuCode : menu.menuCode, roleField : data.body.errorList[0].field, errList : data.body.errorList});
          failMenuList.push(menu);
        }
        if ( doneCnt === menuList.length ) {
          if ( doCnt === succCnt ) {
            setMenuListReload(true); // reload
            //setErrorList(errList);
            alert("저장되었습니다.");            
          } else {
            //alert("저장 중 오류가 발생했습니다. 오류내역을 확인하세요.");
            //clog("FAILS 2 : " + doCnt + " : " + succCnt + " : " + doneCnt);
            doSaveFailedRoleSetting(failMenuList);
          }
          doneCnt = 0;
          setRecoilIsLoadingBox(false);           
        }                                
      }
    })
  }

  async function doSaveFailedRoleSetting(failList) {
    const errList = [];
    var doCnt = 0;
    var doneCnt = 0;
    var succCnt = 0;
    //const failMenuList = [];

    setRecoilIsLoadingBox(true);
    failList.map(async (menu)=>{
      doCnt ++;
      let data: any = null;
      clog("EACH : " + JSON.stringify(menu));
      data = await doSaveRoleSetting(menu);
      CUTIL.sleep(500);

      if (data) {
        clog("EACH SAVE DONE : " + menu.menuCode + " : " + JSON.stringify(data));
        doneCnt ++;
        if (data.codeNum == CONST.API_200) {
          succCnt ++;
        } else { // api if
          // need error handle
          //setErrorList(data.body.errorList);
          errList.push({menuCode : menu.menuCode, roleField : data.body.errorList[0].field, errList : data.body.errorList});
        }
        if ( doneCnt === failList.length ) {
          setMenuListReload(true); // reload
          setErrorList(errList);
          if ( doCnt === succCnt ) {
            alert("저장되었습니다.");            
          } else {
            alert("저장 중 오류가 발생했습니다. 오류내역을 확인하세요.");
          }
          doneCnt = 0;
          setRecoilIsLoadingBox(false);           
        }                                
      }
    })
  }




  async function doSaveRoleSetting(menu) {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": `/api/v2/menus/role`,
      appQuery: {
        "menuCode" : menu.menuCode,
        "roles" : menu.roleDtos.map((role)=>role.role)
      },
      userToken: userInfo.loginInfo.token,
    });
    return data;
  }

  async function onClickDoInitMenu(e) {
    var isOk = confirm("메뉴별 권한을 초기 설정값으로 복원하시겠습니까?");
    if ( !isOk ) return;
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": `/api/v2/menus/init`,
      appQuery: {
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum === CONST.API_200) {
        setMenuListReload(true); // list reload
        clog("IN onClickDoInitMenu : " + JSON.stringify(data.body));
      }
    }
  }

  return (
  <>
  {/*<!--오른쪽 영역-->*/}
  <div className="area__right_content workplace__info workplace__main info__input newtype">
    <div className="page-top">
      <h2>메뉴별 권한 설정</h2>
    </div>
    <div className="tbl__top mb-16">
      <div className="left">
        <MenuCombo
          selTree={props.selTree}
          setCodeParam={setCodeParam}
          setCurPage={handleCurPage}
        />
      </div>
      <div className="right">
        <button type="button" className="bg-gray mr-8"
          onClick={(e)=>onClickDoInitMenu(e)}
        >
          <span>초기화</span>
        </button>
        {(!isEditable)&&
        <button type="button"
          className="bg-gray"
          onClick={(e)=>setIsEditable(true)}
        >
          <span>수정</span>
        </button>}
        {(isEditable)&&<button type="button"
          className="bg-blue" 
          onClick={(e)=>onClickDoSaveRoleSetting(e)}
        >
          <span>저장</span>
        </button>}
      </div>
    </div>
    {/*<!--테이블-->*/}
    <div className="tbl-list menuset-list">
      <table summary="메뉴,상세메뉴,설명,Admin,Engineer,User,None 항목으로 구성된 메뉴별 권한 설정 리스트 입니다.">
        <caption>
          메뉴별 권한 설정 리스트
        </caption>
        <colgroup>
          <col style={{"width": ""}} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="txt-left">메뉴</th>
            <th scope="col" className="txt-left">상세메뉴</th>
            <th scope="col" className="txt-left d-lm-none">설명</th>
            <th scope="col">Admin</th>
            <th scope="col">Engineer</th>
            <th scope="col">User</th>
            <th scope="col">None</th>
          </tr>
        </thead>
        <tbody>
          {menuList.map((smenu, idx)=>(
          <tr key={`menu_${idx.toString()}`}>
            <td className="txt-left"><p className="ellipsis">{smenu.depthName1}</p></td>
            <td className="txt-left"><p className="ellipsis">{smenu.depthName2}</p></td>
            <td className="txt-left d-lm-none">{smenu.description}/{smenu.menuCode}</td>
            <td className="w60"
              onClick={(e)=>(isEditable)&&onClickRoleSetting(e, smenu, CONST.USERROLE_ADMIN)}
            >
              {/**&&(err.errList.filter((el)=>(el.field==="CONST.USERROLE_ADMIN")).length>0) */}
              <input type="checkbox" id="a_11"
                className={(errorList.filter((err)=>(err.menuCode===smenu.menuCode)&&(err.roleField===CONST.USERROLE_ADMIN)).length > 0)?"error":""}
                checked={(smenu.roleDtos.filter((role)=>role.role===CONST.USERROLE_ADMIN).length>0)?true:false}
                disabled={(!isEditable)?true:false}
              />
              <label htmlFor="a_11">
                <span className="hide">선택</span>
              </label>
            </td>
            <td className="w60"
              onClick={(e)=>(isEditable)&&onClickRoleSetting(e, smenu, CONST.USERROLE_ENGINEER)}
            >
              <input type="checkbox" id="e_12"
                className={(errorList.filter((err)=>(err.menuCode===smenu.menuCode)&&(err.roleField===CONST.USERROLE_ENGINEER)).length > 0)?"error":""}
                checked={(smenu.roleDtos.filter((role)=>role.role===CONST.USERROLE_ENGINEER).length>0)?true:false}
                disabled={(!isEditable)?true:false}
              />
              <label htmlFor="e_12">
                <span className="hide">선택</span>
              </label>
            </td>
            <td className="w60"
              onClick={(e)=>(isEditable)&&onClickRoleSetting(e, smenu, CONST.USERROLE_USER)}
            >
              <input type="checkbox" id="u_13"
                className={(errorList.filter((err)=>(err.menuCode===smenu.menuCode)&&(err.roleField===CONST.USERROLE_USER)).length > 0)?"error":""}
                checked={(smenu.roleDtos.filter((role)=>role.role===CONST.USERROLE_USER).length>0)?true:false}
                disabled={(!isEditable)?true:false}
              />
                <label htmlFor="u_13">
                <span className="hide">선택</span>
              </label>
            </td>
            <td className="w60"
              onClick={(e)=>(isEditable)&&onClickRoleSetting(e, smenu, CONST.USERROLE_NONE)}
            >
              <input type="checkbox" id="n_14"
                className={(errorList.filter((err)=>(err.menuCode===smenu.menuCode)&&(err.roleField===CONST.USERROLE_NONE)).length > 0)?"error":""}
                checked={(smenu.roleDtos.filter((role)=>role.role===CONST.USERROLE_NONE).length>0)?true:false}
                disabled={(!isEditable)?true:false}
              />
              <label htmlFor="n_14">
                <span className="hide">선택</span>
              </label>
            </td>
          </tr>
          ))}
        </tbody>
      </table>
    </div>
    {/*<EhpPagination
      componentName={"AUTHSETTING"}
      pageInfo={pageInfo}
      handleFunc={handleCurPage}
          />*/}
  </div>
  </>
  )
};
export default AuthSetting;
