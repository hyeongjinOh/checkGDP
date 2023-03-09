/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-24
 * @brief EHP 설비수명 - 수명인자 개발
 *
 ********************************************************************/
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";


// utils
import clog from "../../../../utils/logUtils";
import * as CONST from "../../../../utils/Const"
import * as HTTPUTIL from "../../../../utils/api/HttpUtil"
import * as CUTIL from "../../../../utils/commUtils"
// component
import EhpPagination from "../../../common/pagination/EhpPagination";

//
import * as XLSX from 'xlsx';
import * as FileSaver from "file-saver";
import { loadingBoxState } from "../../../../recoil/menuState";
import { spawn } from "child_process";
import { useTrans } from "../../../../utils/langs/useTrans";
import { useNavigate } from "react-router-dom";



//component
function DeviceLifeUpdateTest(props) {
    //trans
    const t = useTrans();
    //recoil
    // const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    //화면 이동
    const navigate = useNavigate();
    //props
    const isMobile = props.isMobile;
    const selTree = props.selTree;
    const workMode = props.workMode;
    const setParentCurTree = props.setCurTree;
    const setParentWorkMode = props.setWorkMode;
    const setParentPopWin = props.setPopWin;
    const reWork = props.reWork;
    const setReWork = props.setReWork;
    // by hjo - 20220920 - 추가 hook
    const setListWork = props.setListWork;
    const listItem = props.listItem;
    const setListItem = props.setListItem;
    const restart = props.restart;
    const setRestart = props.setRestart;
    const setNodata = props.setNodata;
    //
    const [list, setList] = useState([]);
    const [errorList, setErrorList] = useState([])
    const [checkValueId, setCheckValueId] = useState([]);
    const [userInput, setUserInput] = useState([]);
    const [checkItemName, setCheckItemName] = useState([]);

    const [check, setChek] = useState(false);

    const [item, setItem] = useState([]);

    const { data: resInfo, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/assessment/devicelife`,
        appQuery: { itemIdPk: 1 },
        // userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        // watch: listItem.itemIdPk
    });

    useEffect(() => {
        const ERR_URL = HTTPUTIL.resultCheck(isLoading, resInfo);
        //clog("IN TREE : RESLT CHECK : " + ERR_URL + " : " + isLoading + " : " + JSON.stringify(resInfo));

        if (ERR_URL.length > 0) navigate(ERR_URL);

        if (resInfo/* !isLoading */) {

            if (resInfo.codeNum == CONST.API_200) {

                setList(
                    resInfo.body.map((input) => ({ ...input, "userInput": input.deviceLife.userInput, checkItemNamed: (!input.checkItemId) ? input.checkItemName : null, checked: (input.deviceLife.userInput) ? true : false }))
                );

            } else {
                alert(resInfo.errorList.map((err) => (err.msg)))
            }
        }
    }, [resInfo]);

    var userDefinedList = []

    for (let i = 0; i < (20 - list.filter((val) => (val.stepName == "User Defined")).length); i++) {
        var userDefined = {
            checkItemId: null,
            number: list.length + (i + 1),
            stepName: "User Defined",
            checkItemName: null,
            checkItemNamed: null,
            refAnswer: null,
            userInput: null,
            checked: false,
            deviceLife: { deviceLifeId: null, userInput: null }
        }
        userDefinedList.push(userDefined);

    }

    let updatelist: any[] = [...list, ...userDefinedList]

    function checkedList(checked, idx) {

        if (checked) {
            setList(
                updatelist.map((smenu) => (smenu.number === idx)
                    ? { ...smenu, checked: checked }
                    : smenu
                )
            );
        } else {
            setList(
                updatelist.map((smenu) => (smenu.number === idx)
                    ? { ...smenu, checked: checked}
                    : smenu
                )
            );
        }
    };
    //사용자 입력값
    function handleUserInput(e, idx) {
        setErrorList(
            errorList.filter((err) => (err.field !== "userInput"))
        );
        setList(
            updatelist.map((smenu) => (smenu.number === idx)
                ? { ...smenu, userInput: e.target.value }
                : smenu
            )
        );
        // setUserInput({ ...userInput, [idx]: value });
    }
    //userundefined 
    function handleCheckItemName(e, idx) {
        setErrorList(
            errorList.filter((err) => (err.field !== "checkItemName"))
        );
        setList(
            updatelist.map((smenu) => (smenu.number === idx)
                ? { ...smenu, checkItemNamed: e.target.value }
                : smenu
            )
        );
    }
    // 저장 팝업 
/*     useEffect(() => {
        setParentPopWin("pop-change",
            <ChanagePop
                htmlHeaderBtn={<button className="btn btn-close js-close"><span className="hide">닫기</span></button>}
                setRecoilIsLoadingBox={setRecoilIsLoadingBox}

                item={item}
                listItem={listItem}
                setErrorList={setErrorList}
                setParentWorkMode={setParentWorkMode}
            />
        )
        // tree 변화 시 오류 리스트로 이동
        if (reWork.room.roomId != selTree.room.roomId) {
            setParentWorkMode("READ");
        }
    }) */
    // change pop
    function savedPop(e, updatelist) {
        let curItem = []

        updatelist.filter((fval) => (fval.checked)).forEach((el) => (curItem.push({
            checkItemId: el.checkItemId,
            userInput: el.userInput,
            checkItemName: el.checkItemNamed,
            number: el.number
        })));

        setItem((item) => { return { ...item, curItem } })
        CUTIL.jsopen_Popup(e)
    }


    return (
        <>
            {/* <!--area__right, 오른쪽 영역-->*/}

            <div className="area__right">
                <ul className="page-loca">
                <li>LS일렉트릭 </li>
                    <li>안양</li>
                    <li>1공장</li>
                    <li>전기실1</li>
                </ul>
                <h2>전기실1</h2>
                <div className="inline mb-18">
                    {/*<!--목록이동 버튼, 활성화되면 active 클래스 추가-->*/}
                    <a href="#" className="move-list " onClick={(e) => setParentWorkMode("READ")}>Device List</a>
                    <a href="#" className="move-list active" >수명인자 설정</a>
                </div>

                {/* <!--area__right_content, 오른쪽 컨텐츠 영역-->*/}
                <div className="area__right_content">
                    <div className="tbl__top mb-16 mt-12 d-lm-block">
                        <div className="left">
                            <p className="title">Device  정보</p>
                        </div>
                    </div>
                    <div className="tbl-list td-h26 h-auto">
                        <table summary="설비 명,Panel 명,모델 명,시리얼 번호,정격전압,Basic,Premium,Advanced 항목으로 구성된 Device 정보 입니다.">
                            <caption>
                                Device 정보
                            </caption>
                            <colgroup>
                                <col style={{}} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col" className="txt-left"><span>{t("기기명")}</span></th>
                                    <th scope="col" className="txt-left"><span>{t("Panel명")}</span></th>
                                    <th scope="col" className="txt-left"><span>{t("모델명")}</span></th>
                                    <th scope="col" className="txt-left"><span>{t("시리얼번호")}</span></th>
                                    <th scope="col" className="txt-left"><span>{t("정격전압")}</span></th>
                                    <th scope="col" className="txt-left"><span>{t("Basic")}</span></th>
                                    <th scope="col" className="txt-left"><span>{t("Premium")}</span></th>
                                    <th scope="col" className="txt-left"><span>{t("Advanced")}</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                   {/*  <td className="txt-left">{(listItem.spg.spgName) ? listItem.spg.spgName : "-"}</td>
                                    <td className="txt-left"><p className="ellipsis w100p">{(listItem.panel.panelName) ? listItem.panel.panelName : "-"}</p></td>
                                    <td className="txt-left"><p className="ellipsis w100p">{(listItem.modelName) ? listItem.modelName : "-"}</p></td>
                                    <td className="txt-left"><p className="ellipsis w100p">{(listItem.serialNo) ? listItem.serialNo : "-"}</p></td>
                                    <td className="txt-left">{(listItem.ratingVoltage) ? listItem.ratingVoltage : "-"}</td>
                                    <td className="txt-left">{(listItem.basicAssess.totalScore) ? listItem.basicAssess.totalScore : "-"}</td>
                                    <td className="txt-left">{(listItem.premiumAssess.totalScore) ? listItem.basicAssess.totalScore : "-"}</td>
                                    <td className="txt-left">{(listItem.advancedAssess.totalScore) ? listItem.basicAssess.totalScore : "-"}</td> */}
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="tbl__top mb-16 mt-32 d-lm-block">
                        <div className="left">
                            <p className="title">설정 항목 </p>
                        </div>
                        <div className="right">
                            {(updatelist.filter((cke) => (cke.checked)).length <= 0) ?
                                <button type="button" className="bg-gray" disabled><span>저장</span></button>
                                :
                                <button type="button" className="bg-blue js-open" data-pop={"pop-change"} onClick={(e) => savedPop(e, updatelist)}><span data-pop={"pop-change"}>저장</span></button>
                            }
                        </div>
                    </div>
                    <div className="tbl-list type2 td-h26 h550 scrollH">
                        <table summary="선택,No.,점검단계,항목,진단점검 결과 값,사용자 입력 값 항목으로 구성된 설정 항목 목록 입니다.">
                            <caption>
                                설정 항목 목록
                            </caption>
                            <colgroup>
                                <col style={{ "width": "5%" }} />
                                <col style={{ "width": "5%" }} />
                                <col style={{ "width": "8%" }} />
                                <col style={{}} />
                                <col style={{}} />
                                <col style={{ "width": "22%" }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col" className="txt-left" data-testid="check1">선택</th>
                                    <th scope="col" className="txt-left">No.</th>
                                    <th scope="col" className="txt-left">점검단계</th>
                                    <th scope="col" className="txt-left">항목</th>
                                    <th scope="col" className="txt-left">진단점검 결과 값</th>
                                    <th scope="col" className="txt-left">사용자 입력 값</th>
                                </tr>
                            </thead>
                            <tbody>
                                { updatelist.map((list, idx) => (
                                    <tr key={"life_" + idx.toString()}>
                                        {/* {console.log("deviceLifeId" + idx, updatelist.filter((v) => (v.deviceLife.deviceLifeId == list.deviceLife.deviceLifeId)).map((val) => (val.deviceLife.deviceLifeId)) == list.deviceLife.deviceLifeId)} */}
                                        <td className="txt-left">
                                            <input type="checkbox" id={"t_" + list.number}  
                                                checked={(list.checked) ? true : false}
                                                onChange={(e) => checkedList(e.target.checked, list.number)}
                                            />
                                            <label htmlFor={"t_" + list.number}>
                                                <span className="hide">선택</span>
                                            </label>
                                        </td>
                                        <td className="txt-left">{(list.number) ? list.number : "-"}</td>
                                        <td className="txt-left">{(list.stepName) ? list.stepName : "-"}</td>
                                        {(list.stepName == "User Defined") ?
                                            <td className="txt-left" >
                                                <div className="input__area w85p">
                                                    {(list.checked == true) &&
                                                        <input type="text" placeholder="설정 값을 입력하세요." id={"checkItemName" + list.number}
                                                            value={(CUTIL.isnull(list.checkItemNamed)) ? (CUTIL.isnull(list.checkItemName)) ? "" : list.checkItemName : list.checkItemNamed} onChange={(e) => handleCheckItemName(e, list.number)}
                                                        />
                                                    }
                                                    {(list.checked == false) &&
                                                        <input type="text" disabled id={"checkItemName" + list.number} />
                                                    }
                                                </div>
                                            </td>
                                            :
                                            < td className="txt-left" id={"checkItemName" + list.number}><p className="ellipsis w100p">{(list.checkItemName) ? list.checkItemName : "-"}</p></td>
                                        }
                                        <td className="txt-left"><p className="ellipsis w100p">{(list.refAnswer) ? list.refAnswer : "-"}</p></td>
                                        <td className="txt-left">
                                            <div className="input__area">
                                                {(list.checked == true) &&
                                                    <input type="text" placeholder="설정 값을 입력하세요."
                                                        className={"input-error"} id={"userInput" + list.number}
                                                        value={(CUTIL.isnull(list.userInput)) ? (CUTIL.isnull(list.deviceLife.userInput)) ? "" : list.deviceLife.userInput : list.userInput}
                                                        onChange={(e) => handleUserInput(e, list.number)} />
                                                }
                                                {(list.checked == false) &&
                                                    <input type="text" disabled id={"userInput" + list.number} />
                                                }
                                                <p className="input-errortxt">{errorList.filter(err => (err.field === "userInput")).map((err) => err.msg)}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* <!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
            </div>
            {/* <!--//area__right, 오른쪽 영역-->*/}
        </>
    )

}
export default DeviceLifeUpdateTest;

function ChanagePop(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const setRecoilIsLoadingBox = props.setRecoilIsLoadingBox;
    //props
    const item = props.item;
    const listItem = props.listItem;
    const setParentWorkMode = props.setParentWorkMode;
    //
    const [success, setSuccess] = useState([]);
    const [changeFail, setChangeFail] = useState([]);

    async function changeDone(id, item, itemIdPk) {
        let checkItems = item;

        setRecoilIsLoadingBox(true);
        if (checkItems.filter((chek) => (chek.checkItemId) && (chek.userInput)).length +
            checkItems.filter((chek) => (!chek.checkItemId) && ((chek.userInput) && (chek.checkItemName))).length !== item.length) {
            alert("체크된 항목에 입력이 안된 항목이 있습니다.");
            CUTIL.jsclose_Popup(id);
            setRecoilIsLoadingBox(false);
            var num: any[] = []
            checkItems.forEach(el => {
                if ((!el.userInput)) {

                    num.push({
                        userInput: el.userInput,
                        number: el.number
                    })
                } else if ((!el.checkItemId) && !el.checkItemName) {
                    num.push({
                        userInput: el.userInput,
                        checkItemName: el.checkItemName,
                        number: el.number,
                    })
                }
            });
            if (!num[0].userInput) {
                document.getElementById("userInput" + num[0].number).focus();
            } else if (!num[0].checkItemName) {
                document.getElementById("checkItemName" + num[0].number).focus();
            }
        } else {

            let data: any = []
            data = await HTTPUTIL.PromiseHttp({
                httpMethod: "POST",
                appPath: `/api/v2/assessment/devicelife`,
                appQuery: {
                    itemIdPk: itemIdPk,
                    putIn:
                        checkItems.map((el) => (
                            {
                                checkItemId: el.checkItemId,
                                userInput: el.userInput,
                                checkItemName: el.checkItemName,
                                number: el.number
                            }
                        ))
                },
                userToken: userInfo.loginInfo.token,
            })
            if (data) {
                if (data.codeNum == CONST.API_200) {
                    var btnCommentClose = document.getElementById(id);
                    if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
                    setRecoilIsLoadingBox(false);
                    setSuccess(data.data.msg)
                    if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.remove("hidden");

                }
            }


        }

    }

    function popDone(id) {
        setSuccess([]);
        CUTIL.jsclose_Popup(id);
        setParentWorkMode("READ");
    }

    function PopCloses(id) {
        setSuccess([]);
        CUTIL.jsclose_Popup(id);

    }


    return (
        <>
            <div className="popup__body">
                <p>
                    {(success.length <= 0) ?
                        "저장하시겠습니까 ?"
                        :
                        "저장되었습니다."
                    }
                </p>
            </div>
            <div className="popup__footer">
                {(success.length <= 0) &&
                    <button type="button" className="bg-gray js-close" onClick={(e) => PopCloses("pop-change")}><span>취소</span></button>
                }
                {(success.length > 0) ?
                    <button type="button" className="js-close" onClick={(e) => popDone("pop-change")}><span>확인</span></button>
                    :
                    <button type="button" onClick={(e) => changeDone("pop-change", item.curItem, listItem.itemIdPk)}><span>확인</span></button>
                }
            </div>
        </>
    )
}









