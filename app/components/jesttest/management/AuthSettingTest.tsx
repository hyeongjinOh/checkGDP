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

// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as CUTIL from "../../../utils/commUtils"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"

//component
import EhpPagination from "../../common/pagination/EhpPagination";


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
    const defaultPageInfo = { "size": 10, "totalElements": 0, "totalPages": 0, "number": 0, "psize": 10 };
    const [pageInfo, setPageInfo] = useState(defaultPageInfo);
    function handleCurPage(page) {
        setPageInfo({ ...pageInfo, number: page });
    }
    const [codeParam, setCodeParam] = useState("");
    let appPath = "";
    appPath = 'page=' + pageInfo.number + '&size=' + pageInfo.size;
    if (codeParam.length > 0) {
        appPath = appPath + "&menuCode=" + codeParam
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
        watch: selTree + appPath + menuListReload
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
            clog("IN AUTH SETTING : RES : " + JSON.stringify(retData));
            if (retData.codeNum == CONST.API_200) {
                setRecoilIsLoadingBox(false);
                setMenuListReload(false); // list reload
                setIsEditable(false);
                setMenuList(retData.body);
                setPageInfo({ ...retData.data.page, psize: (isMobile) ? CONST.NUM_MLISTCNT : CONST.NUM_WLISTCNT }); //5, 10
            }
        }
    }, [selTree, retData])



    const [isEditable, setIsEditable] = useState(false);

    function onClickRoleSetting(e, menuObj, strRole) {
        e.preventDefault();
        e.stopPropagation();
        const insRoleDtos = menuObj.roleDtos.filter((role) => (role.role === strRole));

        setMenuList(
            menuList.map((smenu) => (smenu.menuCode === menuObj.menuCode)
                ? {
                    ...smenu,
                    roleDtos: (insRoleDtos.length > 0)
                        ? menuObj.roleDtos.filter((role) => (role.role !== strRole))
                        : menuObj.roleDtos.concat({ "id": -1, "role": strRole })
                }
                : smenu
            )
        );
    }

    async function onClickDoSaveRoleSetting(e) {
        const errList = [];
        var doCnt = 0;
        var doneCnt = 0;
        var succCnt = 0;

        var ret = confirm("변경 내용을 저장하시겠습니까?");
        if (!ret) return;

        setRecoilIsLoadingBox(true);
        menuList.map(async (menu) => {
            doCnt++;


            let data: any = null;
            data = await doSaveRoleSetting(menu);
            CUTIL.sleep(500);
            if (data) {
                clog("EACH SAVE DONE : " + menu.menuCode + " : " + JSON.stringify(data));
                doneCnt++;
                if (data.codeNum == CONST.API_200) {
                    succCnt++;
                } else { // api if
                    // need error handle
                    //setErrorList(data.body.errorList);
                    errList.push({ menuCode: menu.menuCode, roleField: data.body.errorList[0].field, errList: data.body.errorList })
                }
                if (doneCnt === menuList.length) {
                    setErrorList(errList);
                    if (doCnt === succCnt) {
                        alert("저장되었습니다.");
                        setMenuListReload(true); // reload
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
                "menuCode": menu.menuCode,
                "roles": menu.roleDtos.map((role) => role.role)
            },
            userToken: userInfo.loginInfo.token,
        });
        return data;
    }
    function testcheck(e) {
        return 0;
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

                    </div>
                    <div className="right">
                        <button type="button"
                            className="bg-gray">
                            <span>수정</span>
                        </button>
                        <button type="button"
                            className="bg-blue"
                            onClick={(e) => onClickDoSaveRoleSetting(e)}>
                            <span>저장</span>
                        </button>
                    </div>
                </div>
                {/*<!--테이블-->*/}
                <div className="tbl-list menuset-list">
                    <table summary="메뉴,상세메뉴,설명,Admin,Engineer,User,None 항목으로 구성된 메뉴별 권한 설정 리스트 입니다.">
                        <caption>
                            메뉴별 권한 설정 리스트
                        </caption>
                        <colgroup>
                            <col style={{ "width": "" }} />
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
                            <tr>
                                <td className="txt-left"><p className="ellipsis">Dashboard</p></td>
                                <td className="txt-left"><p className="ellipsis">Dashboard</p></td>
                                <td className="txt-left d-lm-none">대시보드/MENU1</td>
                                <td className="w60">
                                    {/**&&(err.errList.filter((el)=>(el.field==="CONST.USERROLE_ADMIN")).length>0) */}
                                    <input type="checkbox" id="a_11"
                                        className={"error"}
                                        checked={true}
                                        //disabled={true}
                                        data-testid="check1"
                                        onChange={(e) => testcheck(e)}
                                    />
                                    <label htmlFor="a_11">
                                        <span className="hide">선택</span>
                                    </label>
                                </td>
                                <td className="w60">
                                    <input type="checkbox" id="e_12"
                                        className={"error"}
                                        checked={true}
                                        //disabled={true}
                                        data-testid="check2"
                                        onChange={(e) => testcheck(e)}
                                    />
                                    <label htmlFor="e_12">
                                        <span className="hide">선택</span>
                                    </label>
                                </td>
                                <td className="w60">
                                    <input type="checkbox" id="u_13"
                                        className={"error"}
                                        checked={true}
                                        //disabled={true}
                                        data-testid="check3"
                                        onChange={(e) => testcheck(e)}
                                    />
                                    <label htmlFor="u_13">
                                        <span className="hide">선택</span>
                                    </label>
                                </td>
                                <td className="w60">
                                    <input type="checkbox" id="n_14"
                                        className={"error "}
                                        checked={true}
                                        disabled={true}
                                    />
                                    <label htmlFor="n_14">
                                        <span className="hide">선택</span>
                                    </label>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>
                <EhpPagination
                    componentName={"AUTHSETTING"}
                    pageInfo={pageInfo}
                    handleFunc={handleCurPage}
                />
            </div>
        </>
    )
};
export default AuthSetting;
