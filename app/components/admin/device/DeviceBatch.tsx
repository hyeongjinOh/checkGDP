/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author HyeongJin O
 * @contact hjoh@detech.co.kr
 * @date 2022-08-15
 * @brief EHP 기기등록 관리 - 일괄 등록 개발
 *
 ********************************************************************/
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
// recoil
import { useRecoilValue } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";


// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"
//
import * as XLSX from 'xlsx';
import { data } from "jquery";
import { loadingBoxState } from "../../../recoil/menuState";
import { useTrans } from "../../../utils/langs/useTrans";

/**
 * @brief EHP 기기등록 관리 - 일괄 등록 컴포넌트 , 반응형 동작
 * @param -
 * @returns react components
 */

function DeviceBatch(props) {
    const t = useTrans();

    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const curTree = props.curTree;
    const isMobile = props.isMobile;
    const setParentIsMobile = props.setIsMobile;
    const setParentPopWin = props.setPopWin;
    const setParentCurTree = props.setCurTree;
    const setParentWorkMode = props.setWorkMode;
    const restart = props.restart;
    const setRestart = props.setRestart;

    const [savedFiles, setSavedFiles] = useState([]);
    const [uploadFiles, setUploadFiles] = useState([]);
    const [fileName, setFileName] = useState('');
    const [uploadFileName, setUploadFileName] = useState('');
    const [excelArray, setExcelArray] = useState([])
    const [headers, setHeaders] = useState([])
    const [status, setStatus] = useState([])
    var j = 1

    // 프로그래스바 액션

    const fileRef: any = useRef();

    //mobile check
    const mobileRef = useRef(null); // Mobile Check용
    useEffect(() => { // resize handler
        function handleResize() {
            if (CUTIL.isnull(mobileRef)) return;
            const mobileTag = mobileRef.current;
            if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
                setParentIsMobile(true);
            } else {
                setParentIsMobile(false);
            }
        }
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, []);
    useEffect(() => { // re-rendering mobile check
        if (CUTIL.isnull(mobileRef)) return;
        const mobileTag = mobileRef.current;
        if (!CUTIL.isnull(mobileTag)) {
            if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
                setParentIsMobile(true);
            } else {
                setParentIsMobile(false);
            }
        }
    }, []);
    // 순차,기기유형,판넬명,정격전압,2차전압,정격전류,차단전류,정격용량,모델명,시리얼번호,제조사,메모 순
    let excelNoArr = excelArray.filter((list, idx) => (idx != 0) && (list.no)).map((list) => (list))
    // let heads = headers.map((list) => (list))

    
    const ingNum = Math.round(status.length / excelNoArr.length * 100);

    // 성공 및 실패 데이터
    let successData = []
    let failData = []

    for (let i = 0; i < status.length; i++) {
        if (status[i].data.msg == "fail") {
            failData.push(status[i].body)
        } else if (status[i].data.msg == "success") {
            successData.push(status[i].body)
        }


    }
    let arrarySuccess = [...successData]
    let arraryFail = [...failData]

    /*     useEffect(() => {
            setParentPopWin("pop-devicealladd",
                <MobileDeviceBatch
                    htmlHeader={<h1>{curTree.room.roomName}</h1>}
                    curTree={curTree}
                    isMobile={props.isMobile}
                    fileName={fileName}
                    setFileName={setFileName}
                    uploadFileName={uploadFileName}
                    setUploadFileName={setUploadFileName}
                    status={status}
                    setStatus={setStatus}
                    //
    
                    handleFileClick={handleFileClick}
                    handleFileClose={handleFileClose}
                    handleFileUolad={handleFileUolad}
                    //
                    arrarySuccess={arrarySuccess}
                    arraryFail={arraryFail}
                    ingNum={ingNum}
    
                />
    
            )
        }); */
    function finishList(e) {

        setParentPopWin("pop-finish-ok-web",
            <FinishPop
                htmlHeader={<h1>{uploadFileName}</h1>}
                excelArray={excelArray}
                status={status}

            />

        )
        CUTIL.jsopen_Popup(e)
    }

    // 첨부파일 저장 // 엑셀 업로드 함수
    function handleOnChange(e) {

        const file = e.target.files[0];
        // 
        var reader = new FileReader();
        //데이터 포맷
        const formData = new FormData();
        formData.append("files", file);
        //엑셀 upload
        reader.onload = function () {
            var fileData = reader.result;
            var xlsxUpload = XLSX.read(fileData, { type: 'binary' });
            var xlsxSheet = xlsxUpload.Sheets[xlsxUpload.SheetNames[0]]
            var xlsxSheet1 = XLSX.utils.sheet_to_json(xlsxSheet);
            // 엑셀 헤드 추출
            var xlsxHeader = XLSX.utils.sheet_to_json(xlsxSheet, {
                header: 1,
                defval: ""
            });
            setExcelArray(xlsxSheet1)
            setHeaders(xlsxHeader)
        };
        reader.readAsBinaryString(file);

        setFileName(file.name);
        e.target.value = '';
        setUploadFileName("");
        setStatus([])
    };

    // 첨부파일 불러오는 함수
    function handleFileClick(e) {
        fileRef.current.click();
    }

    function handleFileClose(delFile) {
        setFileName("")
        setUploadFileName("")

    }
    // update API
    async function handleFileUolad(e) {
        let data: any = [];
        excelArray.filter(((list, idx) => (idx != 0) && (list.no))).forEach(async (list) => {
            data = await HTTPUTIL.PromiseHttp({
                httpMethod: "POST",
                appPath: '/api/v2/product/company/zone/subzone/room/panel/itemseries',
                appQuery: {
                    roomId: curTree.room.roomId,
                    excelNo: list.no,
                    spgName: list.spgName,
                    panelName: list.panelName,
                    modelName: list.modelName,
                    serialNo: list.serialNo,
                    ratingVoltage: list.ratingVoltage,
                    ratingCurrent: list.ratingCurrent,
                    cutoffCurrent: list.cutoffCurrent,
                    secondaryVoltage: list.secondaryVoltage,
                    ratedCapacity: list.ratedCapacity,
                    memo: list.memo

                },
                userToken: userInfo.loginInfo.token,
            })
            CUTIL.sleep(300);
            setStatus((status) => { return [...status, data] });
        })
        if (data) {
            handleFileClose(e)
            setUploadFileName(fileName);
            deviceNotic(curTree.room.roomId);
        }
    }

    async function deviceNotic(roomId) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "POST",
            appPath: '/api/v2/product/company/zone/subzone/room/panel/item/itemseries/notice',
            appQuery: {
                roomId: roomId,

            },
            userToken: userInfo.loginInfo.token,
        })

        if (data) {
            if (data.codeNum == CONST.API_200) {

            } else {
                alert(data.errorList.map((err) => (err.msg)));
            }
        }

    }

    // add by sjpark 20220818
    function onClickDeviceTab(e, workMode) {
        setParentWorkMode(workMode);
    }

    return (
        <>
            {/*<!--area__right, 오른쪽 영역-->*/}
            <div className="area__right" ref={mobileRef}>
                <ul className="page-loca">
                    <li>{curTree.company.companyName}</li>
                    <li>{curTree.zone.zoneName}</li>
                    <li>{curTree.subZone.subZoneName}</li>
                    <li>{curTree.room.roomName}</li>
                </ul>
                <h2>{curTree.room.roomName}</h2>
                <div className="inline mb-18">
                    {/*<!--목록이동 버튼, 활성화되면 active 클래스 추가-->*/}
                    <a href="#" className="move-list" onClick={(e) => onClickDeviceTab(e, "LIST")}>Device List</a>
                    <ul className="tab__small">
                        {/*<!-- 선택된 탭 on -->*/}
                        <li className="on"><a href="#" className="icon-add">{t("LABEL.일괄등록")}</a></li>
                        <li><a href="#" className="icon-pen" onClick={(e) => onClickDeviceTab(e, "CREATE")}>{t("LABEL.개별등록")}</a></li>
                    </ul>
                </div>

                {/* <!--area__right_content, 오른쪽 컨텐츠 영역--> */}
                <div className="area__right_content hcal-170">
                    <div className="content__info">
                        <h3 className="hide">일괄등록 입력</h3>
                        <div className="drag__area">
                            <div className="drag__left">
                                <button type="button" className="btn btn-filedown">
                                    <a href="https://repoehp.blob.core.windows.net/repoehp-item/item/기기일괄등록양식.xlsx">
                                        <span> {t("LABEL.excel")}</span>
                                    </a>
                                </button>
                                {/* <!--탭사이즈부터숨김, 1470px--> */}
                                <div className="filebox-drag">
                                    {/* <!--220817, filelist 추가, 모바일과 동일하게 클래스는 넣어주시면 되요.--> */}
                                    {(fileName) &&
                                        <ul className="filelist">
                                            <li>
                                                <span>{fileName}</span>
                                            </li>
                                        </ul>
                                    }
                                    <p className="tit">File Upload</p>
                                    <input ref={fileRef} type="file" id="file1" accept=".xls,.xlsx" onChange={(e) => handleOnChange(e)} style={{ "display": "none" }} />
                                    {(!fileName) &&
                                        <p className="txt">{t("FIELD.첨부파일")} <button type="button" onClick={(e) => handleFileClick(e)}>{t("FIELD.선택")}</button></p>
                                    }
                                    <div className="btn__wrap">
                                        {(!fileName) ?
                                            <button type="button" className="bg-gray" disabled><span>Cancel</span></button>
                                            :
                                            <button type="button" className="bg-gray" onClick={(e) => handleFileClose(savedFiles)} ><span>Cancel</span></button>
                                        }
                                        {(!fileName) ?
                                            <button type="button" disabled><span>Upload</span></button>
                                            :
                                            <button type="button" onClick={(e) => handleFileUolad(e)}><span>Upload</span></button>

                                        }
                                    </div>
                                </div>
                                {/* <!--탭사이즈부터노출, 1470px--> */}
                                <div className="filebox-upload">
                                    <p className="tit">File Upload</p>
                                    {/* <!--flielist__upload 노출될때는 filebox 태그 전체 숨기기 */}
                                    {(!fileName) ?
                                        <div className="filebox" onClick={(e) => handleFileClick(e)}>
                                            <label><span>첨부파일 선택</span></label>
                                            {/* <input type="file" id="file2" accept=".xls,.xlsx" onChange={(e) => handleOnChange(e)} /> */}
                                        </div>
                                        :
                                        <div className="flielist__upload">
                                            <ul className="filelist">
                                                <li>
                                                    <span>{fileName}</span>
                                                    <button type="button" className="btn btn-delete" onClick={(e) => handleFileClose(e)}><span className="hide">삭제</span></button>
                                                </li>
                                            </ul>
                                            <button type="button" className="btn-upload" onClick={(e) => handleFileUolad(e)}><span>Upload</span></button>
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className="drag__right">
                                <ul className="drag__right__list">
                                    {((uploadFileName)) &&
                                        <li>
                                            <p className="tit">{t("LABEL.진행중")}</p>
                                            <ul className="drag-filelist">
                                                {/* <!--파일 완료되면 success 클래스 추가-->  */}
                                                <li>
                                                    <p className={`name ${(ingNum == 100) ? "success" : ""}`}>{uploadFileName}</p>
                                                    <div className="progressbar">
                                                        <div className="progress-value">
                                                            <progress value={ingNum} max="100"></progress>
                                                            <p className="value"><span>{ingNum}%</span></p>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                        </li>
                                    }
                                    {(ingNum == 100) &&
                                        <li>
                                            <p className="tit">{t("LABEL.진행완료")}</p>
                                            <ul className="filelist-case">
                                                <li>
                                                    <p className="name">{uploadFileName}</p>
                                                    <div>
                                                        <p className="case-ok"><strong>{t("LABEL.성공")}</strong><span>{arrarySuccess.length}개</span></p>
                                                        <p className="case-no"><strong>{t("LABEL.실패")}</strong><span>{arraryFail.length}개</span></p>
                                                        <button type="button" className="btn-go js-open" data-pop="pop-finish-ok-web" onClick={(e) => finishList(e)} ><span className="hide">팝업창 열기</span></button>
                                                    </div>
                                                </li>
                                            </ul>
                                        </li>
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                {/* <!--//area__right_content, 오른쪽 컨텐츠 영역--> */}
            </div>
            {/*<!--//area__right, 오른쪽 영역-->*/}
            {/* <FinishPop excelArray={excelArray}           /> */}
        </>
    );
}

export default DeviceBatch

// function MobileDeviceBatch(props) {
//     const t =useTrans();
//     //
//     const isMobile = props.isMobile;
//     const fileName = props.fileName
//     const setFileName = props.setFileName
//     const handleFileClick = props.handleFileClick
//     const handleFileClose = props.handleFileClose
//     const handleFileUolad = props.handleFileUolad
//     const uploadFileName = props.uploadFileName
//     const setUploadFileName = props.setUploadFileName
//     const status = props.status
//     const setStatus = props.setStatus
//     const arrarySuccess = props.arrarySuccess
//     const arraryFail = props.arraryFail
//     const ingNum = props.ingNum



//     return (
//         <>
//             <div className="popup__body">
//                 <div className="area__right_content workplace__info info__input">
//                     <div className="content__info">
//                         <h3 className="hide">일괄등록 입력</h3>
//                         <div className="drag__area">
//                             <div className="drag__left">
//                                 <button type="button" className="btn btn-filedown">
//                                     <a href="https://repoehp.blob.core.windows.net/repoehp-item/item/기기일괄등록양식.xlsx">
//                                         <span>Excel {t("LABEL.excel")}</span>
//                                     </a>
//                                 </button>
//                                 {/* <!--탭사이즈부터숨김, 1470px--> */}
//                                 <div className="filebox-drag">
//                                     <p className="tit">File Upload</p>
//                                     <p className="txt">첨부파일 드래그 또는 <button type="button">선택</button></p>
//                                     <div className="btn__wrap">
//                                         <button type="button" className="bg-gray" disabled><span>Cancel</span></button>
//                                         <button type="button" disabled><span>Upload</span></button>
//                                     </div>
//                                 </div>
//                                 {/* <!--탭사이즈부터노출, 1470px--> */}
//                                 <div className="filebox-upload">
//                                     <p className="tit">File Upload</p>
//                                     {(!fileName) ?
//                                         <div className="filebox" onClick={(e) => handleFileClick(e)}>
//                                             <label><span>첨부파일 선택</span></label>
//                                             {/* <input type="file" id="file2" accept=".xls,.xlsx" onChange={(e) => handleOnChange(e)} /> */}
//                                         </div>
//                                         :
//                                         <div className="flielist__upload">
//                                             <ul className="filelist">
//                                                 <li>
//                                                     <span>{fileName}</span>
//                                                     <button type="button" className="btn btn-delete" onClick={(e) => handleFileClose(e)}><span className="hide">삭제</span></button>
//                                                 </li>

//                                             </ul>
//                                             <button type="button" className="btn-upload" onClick={(e) => handleFileUolad(e)}><span>Upload</span></button>
//                                         </div>
//                                     }
//                                 </div>
//                             </div>
//                             <div className="drag__right">
//                                 <ul className="drag__right__list">
//                                     {(uploadFileName) &&

//                                         <li>
//                                             <p className="tit">진행 중</p>
//                                             <ul className="drag-filelist">
//                                                 {/* <!--파일 완료되면 success 클래스 추가-->  */}
//                                                 <li>
//                                                     <p className={`name ${(ingNum == 100) ? "success" : ""}`}>{uploadFileName}</p>
//                                                     <div className="progressbar">
//                                                         <div className="progress-value">
//                                                             <progress value={ingNum} max="100"></progress>
//                                                             <p className="value"><span>{ingNum}%</span></p>
//                                                         </div>
//                                                     </div>
//                                                 </li>
//                                             </ul>
//                                         </li>
//                                     }

//                                     {(ingNum == 100) &&
//                                         <li>
//                                             <p className="tit">진행 완료</p>

//                                             <ul className="filelist-case">
//                                                 <li>
//                                                     <p className="name">{uploadFileName}</p>
//                                                     <div>
//                                                         <p className="case-ok"><strong>성공</strong><span>{arrarySuccess.length}개</span></p>
//                                                         <p className="case-no"><strong>실패</strong><span>{arraryFail.length}개</span></p>
//                                                         <button type="button" className="btn-go js-open-s-in" data-pop="pop-finish-ok" onClick={(e) => CUTIL.jsopen_s_in_Popup(e, isMobile)}><span className="hide">팝업창 열기</span></button>

//                                                     </div>
//                                                 </li>
//                                             </ul>
//                                         </li>
//                                     }

//                                 </ul>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     )
// }

function FinishPop(props) {
    //trans
    const t = useTrans();
    //
    const excelArray = props.excelArray;
    const status = props.status
    const data = (status === null) ? null : status
    const [displayChang, setDisplayChang] = useState(false)
    const [dataFail, setDataFail] = useState([])

    let successData = []
    let successList = []
    let failData = []
    let failFieldList = []

    for (let i = 0; i < status.length; i++) {
        if (status[i].data.msg == "fail") {
            failData.push(status[i].body)
        } else if (status[i].data.msg == "success") {
            successData.push(status[i].body)
        }

    }

    let arrarySuccess = [...successData]
    let arraryFail = [...failData]
    useEffect(() => {
        setDisplayChang(false);
    }, [])

    function displayChangs(e) {
        if (displayChang === false) {
            setDisplayChang(true)
        } else {
            setDisplayChang(false);
        }
    }

    function listDoen(e) {
        setDisplayChang(false);
        var btnCommentClose = document.getElementById("pop-finish-ok-web");
        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");

        if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
    }


    return (
        <>
            {/* <!-- 진행 완료 팝업 / 성공 : 모바일 사이즈 767이하에서 팝업이 다름 (운영관리_기기등록관리_리스트.html 내 참조)--> */}
            <div className="popup__body">
                <ul className="tab__button">
                    {/* <!-- 선택된 탭 on --> */}
                    <li className={(!displayChang) ? "on" : ""}><a href="#" className="green" onClick={(e) => displayChangs(e)} >{t("LABEL.성공")}</a></li>
                    <li className={(displayChang) ? "on" : ""}><a href="#" className="red" onClick={(e) => displayChangs(e)}>{t("LABEL.실패")}</a></li>
                </ul>
                <div className="tbl-list hcal-77">
                    {(!displayChang) &&
                        <table summary="No,기기 분류,Panel 명,기기 명,제조번호,정격전압 (kV),정격전류 (A),차단전류 (A)항목으로 구성된 진행완료 성공 목록 입니다.">
                            <caption>
                                진행완료 성공 목록
                            </caption>
                            <colgroup>
                                <col style={{}} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col" className="txt-left"><span>{t("FIELD.No")}</span></th>
                                    <th scope="col" className="txt-left d-sm-none">{t("FIELD.기기분류")}</th>
                                    <th scope="col" className="txt-left d-sm-none">{t("FIELD.Panel명")}</th>
                                    <th scope="col" className="txt-left"><span>{t("FIELD.모델명")}</span></th>
                                    <th scope="col" className="txt-left"><span>{t("FIELD.시리얼번호")}</span></th>
                                    <th scope="col" className="txt-left d-sm-none">{t("FIELD.정격전압")} </th>
                                    <th scope="col" className="txt-left d-sm-none">{t("FIELD.정격전류")} </th>
                                    <th scope="col" className="txt-left d-sm-none">{t("FIELD.차단전류")} </th>
                                    <th scope="col" className="txt-left d-sm-none">{t("FIELD.정격용량")} </th>
                                    <th scope="col" className="txt-left d-sm-none">{t("FIELD.2차전압")} </th>
                                    <th scope="col" className="txt-left d-sm-none">{t("FIELD.제조사")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {arrarySuccess.map((data, idx) => (
                                    <tr key={data.itemId}>
                                        <td className="txt-left">{[++idx]}</td>
                                        <td className="txt-left d-sm-none">{data.spgName}</td>
                                        <td className="txt-left d-sm-none">{data.panelName}</td>
                                        <td className="txt-left" title={data.modelName}><p className="ellipsis wmax-200">{data.modelName}</p></td>
                                        <td className="txt-left" title={data.serialNo}><p className="ellipsis">{data.serialNo}</p></td>
                                        <td className="txt-left d-sm-none">{data.ratingVoltage}</td>
                                        <td className="txt-left d-sm-none">{data.ratingCurrent}</td>
                                        <td className="txt-left d-sm-none">{data.cutoffCurrent}</td>
                                        <td className="txt-left d-sm-none">{data.ratedCapacity}</td>
                                        <td className="txt-left d-sm-none">{data.secondaryVoltage}</td>
                                        <td className="txt-left d-sm-none">{data.manufacturer}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    }
                    {(displayChang) &&
                        <table summary="No,기기 분류,Panel 명,기기 명,제조번호,정격전압 (kV),정격전류 (A),차단전류 (A)항목으로 구성된 진행완료 실패 목록 입니다.">
                            <caption>
                                진행완료 실패 목록
                            </caption>
                            <colgroup>
                                <col style={{}} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col" className="txt-left"><span>No.</span></th>
                                    <th scope="col" className="txt-left">Excel No.</th>
                                    <th scope="col" className="txt-left"><span>{t("FIELD.모델명")}</span></th>
                                    {/* 20221020 수정 jhpark */}
                                    <th scope="col" className="txt-left"><span>{t("FIELD.시리얼번호")}</span></th>
                                    <th scope="col" className="txt-left">{t("FIELD.실패사유")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {arraryFail.map((data, idx) => (
                                    <tr key={idx}>
                                        <td className="txt-left wvalue-30">{[++idx]}</td>
                                        <td className="txt-left wvalue-60">{data.excelNo}</td>
                                        <td className="txt-left" title={data.modelName}><p className="ellipsis wmax-200">{data.modelName}</p></td>
                                        <td className="txt-left" title={data.serialNo}><p className="ellipsis">{data.serialNo}</p></td>
                                        <td className="txt-left">{data.errorList[0].field + " " + data.errorList[0].msg}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    }
                </div>
                <div className="tbl__bottom">
                    {(!displayChang) ?
                        <p className="result__num">Result <span>{arrarySuccess.length}</span></p>
                        :
                        <p className="result__num">Result <span>{arraryFail.length}</span></p>
                    }
                </div>
            </div>
            <div className="popup__footer brd-0">
                <button className="button  js-close" onClick={(e) => listDoen(e)}><span>{t("LABEL.확인")}</span></button>
            </div>
            {/* </div> */}
            {/* <!-- //진행 완료 팝업 / 성공/실패--> */}
        </>
    );
}

// function FinishPopMobile(props) {
//     const excelArray = props.excelArray;
//     const status = props.status
//     const data = (status === null) ? null : status
//     const [displayChang, setDisplayChang] = useState(false)
//     const [dataFail, setDataFail] = useState([])

//     let successData = []
//     let failData = []

//     for (let i = 0; i < status.length; i++) {
//         if (status[i].data.msg == "fail") {
//             failData.push(status[i].body)
//         } else if (status[i].data.msg == "success") {
//             successData.push(status[i].body)
//         }

//     }

//     let arrarySuccess = [...successData]
//     let arraryFail = [...failData]

//     function displayChangs(e) {
//         if (displayChang === false) {
//             setDisplayChang(true)
//         } else {
//             setDisplayChang(false);
//         }
//     }


//     return (
//         <>
//             {/* <!--일괄 등록 내 진행 완료 성공 팝업, 220801 추가 --> */}

//             <div className="popup__body">
//                 <ul className="tab__button mt-16 mb-16">
//                     {/* <!-- 선택된 탭 on --> */}
//                     <li className={(!displayChang) ? "on" : ""}><a className="green" onClick={(e) => displayChangs(e)} >성공!</a></li>
//                     <li className={(displayChang) ? "on" : ""}><a className="red" onClick={(e) => displayChangs(e)}>실패</a></li>
//                 </ul>
//                 {(!displayChang) && <div className="tbl-list type4">
//                     <table summary="No.,기기 명,제조번호 항목으로 구성된 진행완료 성공 리스트 입니다.">
//                         <caption>
//                             진행완료 성공 리스트
//                         </caption>
//                         <colgroup>
//                             <col style={{}} />
//                         </colgroup>
//                         <tbody>
//                             {arrarySuccess.map((list, idx) => {
//                                 <tr key={list.itemId}>
//                                     <td>
//                                         <ul>
//                                             <li>
//                                                 <strong>No.</strong>
//                                                 <span>{idx++}</span>
//                                             </li>
//                                             <li>
//                                                 <strong>모델 명</strong>
//                                                 <span>{list.modelName}</span>
//                                             </li>
//                                             <li>
//                                                 <strong>제조번호</strong>
//                                                 <span>{list.serialNo}</span>
//                                             </li>
//                                         </ul>
//                                     </td>
//                                 </tr>
//                             })}
//                         </tbody>
//                     </table>
//                 </div>}
//                 {(displayChang) &&
//                     <div className="tbl-list type4">
//                         <table summary="Excel No., 기기 명, 제조번호, 실패사유 항목으로 구성된 진행완료 실패 리스트 입니다.">
//                             <caption>
//                                 진행완료 실패 리스트
//                             </caption>
//                             <colgroup>
//                                 <col style={{}} />
//                             </colgroup>
//                             <tbody>
//                                 {arraryFail.map((list, idx) => (
//                                     <tr key={idx}>
//                                         <td>
//                                             <ul>
//                                                 <li>
//                                                     <strong>Excel No.</strong>
//                                                     <span>{list.excelNo}</span>
//                                                 </li>
//                                                 <li>
//                                                     <strong>모델 명</strong>
//                                                     <span>{list.modelName}</span>
//                                                 </li>
//                                                 <li>
//                                                     <strong>시리얼번호</strong>
//                                                     <span>{list.serialNo}</span>
//                                                 </li>
//                                                 <li>
//                                                     <strong>실패사유</strong>
//                                                     <span>{list.errorList[0].field + " " + list.errorList[0].msg}</span>
//                                                 </li>
//                                             </ul>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 }
//             </div>
//             {/* <!-- //일괄 등록 내 진행 완료 성공 팝업, 220801 추가 --> */}


//             {/* <!--일괄 등록내 진행 완료 실패 팝업, 220801 추가 --> */}

//         </>
//     )
// }