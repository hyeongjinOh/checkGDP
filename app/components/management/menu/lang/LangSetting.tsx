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
function LangSetting(props) {
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
    appPath: `/api/v2/menus?${appPath}`,
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
      //clog("IN LANG SETTING : RES : " + JSON.stringify(retData));
      if (retData.codeNum == CONST.API_200) {
        setRecoilIsLoadingBox(false);
        setMenuListReload(false); // list reload
        setIsEditable(false);
        setMenuList(retData.body);
        setPageInfo({...retData.data.page, psize:(isMobile)?CONST.NUM_MLISTCNT:CONST.NUM_WLISTCNT}); //5, 10
        setErrorList([]);
      }
    }
  }, [selTree, retData])



  const [isEditable, setIsEditable] = useState(false);

  async function onClickDoSaveLangSetting(e) {
    const errList = [];
    var doCnt = 0;
    var doneCnt = 0;
    var succCnt = 0;

    var ret = confirm("변경 내용을 저장하시겠습니까?");
    if ( !ret ) return;

    setRecoilIsLoadingBox(true);
    menuList.map(async (menu)=>{
      clog("EACH SAVE DONE : " + menu.menuCode + " : " + menu.depthName1+"/"+menu.depthName2);
      // 영어
      let data: any = null;
      doCnt ++;
      data = await doSaveEnglishLangSetting(menu);
      if ( data ) {
        doneCnt ++;
        if (data.codeNum === CONST.API_200) {
          succCnt ++;
        } else {
          errList.push({menuCode : menu.menuCode, menuNameField : CONST.STR_APILANG_ENG, errList : data.body.errorList})
        }
        // 중국어
        let cdata: any = null;
        doCnt ++;
        CUTIL.sleep(500);
        cdata = await doSaveChineseLangSetting(menu);
        if ( cdata ) {
          doneCnt ++;          
          if (cdata.codeNum == CONST.API_200) {
            succCnt ++;
          } else {
            errList.push({menuCode : menu.menuCode, menuNameField : CONST.STR_APILANG_CHA, errList : cdata.body.errorList})
          }
          if ( doneCnt === (menuList.length*2) ) {
            setErrorList(errList);
            if ( doCnt === succCnt ) {
              alert("저장되었습니다.");            
              setMenuListReload(true); // reload
            } else {
              alert("저장 중 오류가 발생했습니다. 오류내역을 확인하세요.");
            }
            doneCnt = 0;
            setRecoilIsLoadingBox(false);           
          }                        
        }
      }
      CUTIL.sleep(500);
    })
  }

  async function doSaveEnglishLangSetting(menu) {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "POST",
      "appPath": `/api/v2/menu`,
      appQuery: {
        "menuCode" : menu.menuCode,
        "menuName" : CUTIL.isnull(menu.menuEnglish)?"":menu.menuEnglish,
        "language" : CONST.STR_APILANG_ENG,
      },
      userToken: userInfo.loginInfo.token,
    });
    return data;
  }
  async function doSaveChineseLangSetting(menu) {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "POST",
      "appPath": `/api/v2/menu`,
      appQuery: {
        "menuCode" : menu.menuCode,
        "menuName" : CUTIL.isnull(menu.menuChinese)?"":menu.menuChinese,
        "language" : CONST.STR_APILANG_CHA,
      },
      userToken: userInfo.loginInfo.token,
    });
    return data;
  }

  /*<!--220920 테이블 포커스 컬러-->
  <script type="text/javascript">
    function focuss(obj) {
      var i;
      var tabNum = obj.parentNode.children.length; //부모의 자식수. 즉, tbody의 tr의 갯수를 리턴합니다.

      for (i = 0; i < tabNum; i++) obj.parentNode.children[i].className = "";
      obj.className = "on"; //obj에는 클릭한 tr의 정보가 넘어옵니다.
    }
  </script>*/

  function onChangeEnglish(e, menuCode) {
    setMenuList(
      menuList.map((smenu)=>(smenu.menuCode===menuCode)
        ? {...smenu, menuEnglish:e.target.value}
        : smenu
      )
    );
  }
  function onChangeChinese(e, menuCode) {
    setMenuList(
      menuList.map((smenu)=>(smenu.menuCode===menuCode)
        ? {...smenu, menuChinese:e.target.value}
        : smenu
      )
    );
  }

  clog("ERROR LIST : LANG : " + JSON.stringify(errorList));
  //clog("ERR LIST : LANG : " + JSON.stringify(errList));

  return (
  <>
  {/*<!--오른쪽 영역-->*/}
  <div className="area__right_content workplace__info workplace__main info__input newtype">
    <div className="page-top">
      <h2>다국어 설정</h2>
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
        {(!isEditable)&&
        <button type="button"
          className="bg-gray"
          onClick={(e)=>setIsEditable(true)}
        >
          <span>수정</span>
        </button>}
        {(isEditable)&&<button type="button"
          className="bg-blue" 
          onClick={(e)=>onClickDoSaveLangSetting(e)}
        >
          <span>저장</span>
        </button>}
      </div>
    </div>
    {/*<!--테이블-->*/}
    <div className="tbl-list lang-list">
      <table summary="메뉴,상세메뉴,English,中文 항목으로 구성된 다국어 설정 리스트 입니다.">
        <caption>
          다국어 설정 리스트
        </caption>
        <colgroup>
          <col style={{"width": ""}} />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className="txt-left">메뉴</th>
            <th scope="col" className="txt-left">상세메뉴</th>
            <th scope="col">English</th>
            <th scope="col">中文</th>
          </tr>
        </thead>
        <tbody>
          {menuList.map((menu, idx)=>(
          <tr key={`tr_${idx.toString()}`}>
            <td className="txt-left"><p className="ellipsis">{menu.depthName1}</p></td>
            <td className="txt-left"><p className="ellipsis">{menu.depthName2}</p></td>
            <td>
              <div className={`input__area ${(errorList.filter((err)=>((err.menuCode===menu.menuCode)&&(err.menuNameField===CONST.STR_APILANG_ENG))).length>0)?"input-error":""}`}>
                <input type="text" placeholder="Language"
                  value={(CUTIL.isnull(menu.menuEnglish))?"":menu.menuEnglish}
                  disabled={(!isEditable)?true:false}
                  onChange={(e)=>onChangeEnglish(e, menu.menuCode)}
                />
                {errorList.filter((err)=>((err.menuCode===menu.menuCode)&&(err.menuNameField===CONST.STR_APILANG_ENG))).map((err)=>(
                  //(err.hasOwnProperty("errList")&&err.errList.hasOwnProperty("filter"))&&
                  (err.errList)&&
                  err.errList.filter((emsg)=>(emsg.field==="menuName")).map((emsg, idx)=>(
                    <p key={`p_${idx.toString()}`} className="input-errortxt">{emsg.msg}</p>
                  ))
                ))}
              </div>
            </td>
            <td>
              <div className={`input__area ${(errorList.filter((err)=>((err.menuCode===menu.menuCode)&&(err.menuNameField===CONST.STR_APILANG_CHA))).length>0)?"input-error":""}`}>
                <input type="text" placeholder="语言"
                  value={(CUTIL.isnull(menu.menuChinese))?"":menu.menuChinese}
                  disabled={(!isEditable)?true:false}
                  onChange={(e)=>onChangeChinese(e, menu.menuCode)}
                />
                {errorList.filter((err)=>((err.menuCode===menu.menuCode)&&(err.menuNameField===CONST.STR_APILANG_CHA))).map((err)=>(
                  //(err.hasOwnProperty("errList")&&err.errList.hasOwnProperty("filter"))&&
                  (err.errList)&&
                  err.errList.filter((emsg)=>(emsg.field==="menuName")).map((emsg, idx)=>(
                    <p key={`p_${idx.toString()}`} className="input-errortxt">{emsg.msg}</p>
                  ))
                ))}
              </div>
            </td>
          </tr>
          ))}
        </tbody>
      </table>
    </div>
    <EhpPagination
      componentName={"LANGSETTING"}
      pageInfo={pageInfo}
      handleFunc={handleCurPage}
    />
  </div>
  </>
  )
};
export default LangSetting;
