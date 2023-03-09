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
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";


// utils
import clog from "../../../../utils/logUtils";
import * as CONST from "../../../../utils/Const"
import * as HTTPUTIL from "../../../../utils/api/HttpUtil"
import * as CUTIL from "../../../../utils/commUtils"
// component

function DeviceListUpdate(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    // props
    const curTree = props.curTree;
    const setListChang = props.setListChang;
    const setParentPopWin = props.setPopWin;
    const setParentIsMobile = props.setIsMobile;
    // by hjo - 20220920  - 신규 hook 추가
    const setListWork = props.setListWork
    const listItem = props.listItem;
    const setListItem = props.setListItem;

    //spg 선택 
    const [device] = useState([
        { id: 0, fname: "VCB",/*  active: false */ },
        { id: 1, fname: "ACB", /* active: false */ },
        { id: 2, fname: "GIS", /* active: false */ },
        { id: 3, fname: "MoldTR", /* active: false */ },
        { id: 4, fname: "유입식TR", /* active: false */ },
        { id: 5, fname: "배전반", /* active: false */ },
    ]);

    //
    const [spgName, setSpgName] = useState("");
    const [panelName, setPanelName] = useState("");
    const [modelName, setModelName] = useState("");
    const [serialNo, setSerialNo] = useState("");
    const [ratingVoltage, setRatingVoltage] = useState("")
    const [ratingCurrent, setRatingCurrent] = useState("");
    const [cutoffCurrent, setCutoffCurrent] = useState("");
    const [ratedCapacity, setRatedCapacity] = useState("");
    const [manufacturer, setManufacturer] = useState("");
    const [secondaryVoltage, setSecondaryVoltage] = useState("");
    const [memo, setMemo] = useState("");
    //
    //
    const [elecinfo, setElecinfo] = useState([]);
    //
    const [ratingVoltageDisplay, setRatingVoltageDisplay] = useState(false);
    const [ratingCurrentDisplay, setRatingCurrentDisplay] = useState(false);
    const [cutoffCurrentDisplay, setCutoffCurrentDisplay] = useState(false);
    const [ratedCapacityDisplay, setRatedCapacityDisplay] = useState(false);
    const [secondaryVoltageDisplay, setSecondaryDisplay] = useState(false);
    const [panelData, setPanelData] = useState([]);
    const [panelSelect, setPanelSelect] = useState(false);
    //
    const [listPut, setListPut] = useState(false);
    //첨부파일 
    const fileRef: any = useRef();
    const [savedFiles, setSavedFiles] = useState([]);

    const [curPos] = useState(0);
    const [listSize] = useState(10);
    //mobile check
    const mobileRef = useRef(null); // Mobile Check용
    const searchRef = useRef(null); // searchBox pop Check용
    const [isSearchPop, setIsSearchPop] = useState(false);

    useEffect(() => { // resize handler
        function handleResize() {
            if (CUTIL.isnull(mobileRef)) return;
            const mobileTag = mobileRef.current;
            if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
                setParentIsMobile(true);
            } else {
                setParentIsMobile(false);
            }
            // search popup check......
            if (CUTIL.isnull(searchRef)) return;
            const searchTag = searchRef.current;
            // clog("handleResize : " + searchTag.clientHeight + " X " + searchTag.clientWidth);
            if (!CUTIL.isnull(searchTag)) {
                if ((searchTag.clientHeight <= 0) && (searchTag.clientWidth <= 0)) {
                    setIsSearchPop(true);
                } else {
                    setIsSearchPop(false);
                }
            }
        }
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, []);


    // 수정 화면 이벤트 
    // Device List로 이동
    function onClickDeviceListChang(e) {
        setListWork("LIST");
    }
    // 수정 화면으로 변경
    function onChangePut(e, spgName) {
        setListPut(true);
        onClickDeveice(e, spgName)

    }



    //기기 전력 정보 API
    async function onClickDeveice(e, spgName) {
        let appPath = "spgName=" + spgName;
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "GET",
            "appPath": '/api/v2/product/company/zone/subzone/room/panel/item/elecinfo?' + appPath,
            //userToken: userInfo.loginInfo.token,
            watch: appPath
        });

        if (data) {
            if (data.codeNum == 200) {
                setElecinfo(data.body);
                setSpgName(spgName);
            }
        }
        onClickPanel(e, spgName)
    }
    // 기기분류에 따른 판넬 목록 API
    async function onClickPanel(e, spgName) {
        let appPath = "roomId=" + curTree.room.roomId + "&spgName=" + spgName;

        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "GET",
            "appPath": '/api/v2/product/company/zone/subzone/room/panels?' + appPath,
            //userToken: userInfo.loginInfo.token,
            watch: appPath
        });

        if (data) {
            if (data.codeNum == 200 || panelSelect === false) {
                setPanelData(data.body);
                // setPanelSelect(true)
            }
        }

    }

    //판넬 Selct 클릭 이벤트
    function panelSelectClick(e, panel) {
        setPanelName(panel.panelName)
        setPanelSelect(false)
    }

    //
    function ratingVoltageDown(e) {
        setRatingVoltageDisplay(true);
    }
    function ratingCurrentDown(e) {
        setRatingCurrentDisplay(true);
    }
    function cutoffCurrentDown(e) {
        setCutoffCurrentDisplay(true);
    }
    function secondaryVoltageDown(e) {
        setSecondaryDisplay(true);
    }
    function ratedCapacityDown(e) {
        setRatedCapacityDisplay(true);
    }


    // 첨부파일 
    function handleFileUpload(e) {
        fileRef.current.click();
    }

    // 첨부파일 저장
    function saveFileImage(e) {
        const file = e.target.files[0]
        const formData = new FormData();
        formData.append("files", file);
        var fileVal = {
            imageId: "INS_" + savedFiles.length,
            name: file.name,
            url: URL.createObjectURL(file),
            type: "INS",
            fileForm: formData,
        }
        e.target.value = '';
        if (savedFiles.length <= listSize - 1) {
            setSavedFiles([...savedFiles, fileVal]);
        } else {
            // files data 10ea
        }

    };
    // 이미지 다운로드
    async function onClicFileDown(itemId) {
        HTTPUTIL.fileDownload2(`${itemId.name}`, itemId.url);
    }

    //이미지 삭제
    async function onClickAttachFileDelete(e, delFile) {

        setParentPopWin("pop-imgdelelte",
            <ReasonImagePopup
                htmlHeader={<h1>이미지 삭제</h1>}
                delFile={delFile}
                setSavedFiles={setSavedFiles}
                savedFiles={savedFiles}
                // props
                curTree={curTree}
                setListChang={setListChang}
                mobileRef={mobileRef}
                setParentPopWin={setParentPopWin}
                setListWork={setListWork}
                listItem={listItem}
                setListItem={setListItem}
            />
        )
        CUTIL.jsopen_Popup(e);
    }

    // 수정 취소 이벤트
    function listPutClose(e) {
        setSpgName(listItem.spg.spgName);
        setPanelName(listItem.panel.panelName);
        setModelName(listItem.itemName);
        setSerialNo(listItem.serialNo);
        setRatingVoltage(listItem.ratingVoltage);
        setRatingCurrent(listItem.ratingCurrent);
        setCutoffCurrent(listItem.cutoffCurrent);
        setRatedCapacity(listItem.ratedCapacity);
        setManufacturer(listItem.manufacturer);
        setSecondaryVoltage(listItem.secondaryVoltage);
        setMemo(listItem.memo);
        setListPut(false);
        setPanelSelect(false);

    }

    async function listPUtDone(e, itemId) {
        let data: any = [];
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "PUT",
            appPath: `/api/v2/product/company/zone/subzone/room/panel/item/${itemId}`,
            //  "appPath": `/api/v2/product/company/zone/subzone/room/panel/item/images?itemId=${itemId}`,
            appQuery: {
                roomId: curTree.room.roomId,
                spgName: spgName,
                panelName: panelName,
                modelName: modelName,
                serialNo: serialNo,
                memo: memo,
                ratingVoltage: ratingVoltage,
                ratingCurrent: ratingCurrent,
                cutoffCurrent: cutoffCurrent,
                ratedCapacity: ratedCapacity,
                secondaryVoltage: secondaryVoltage,
                manufacturer: manufacturer,
            },
            //userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                if (savedFiles.length > 0) {
                    savedFiles.map((file, idx) => {
                        if (file.hasOwnProperty("type") && (file.type == "INS")) {
                            saveFiles(itemId, file.fileForm);
                        }
                    });
                    alert("저장되었습니다.");
                    setListWork("LIST");
                } else {
                    console.log("data", data)
                    alert("저장되었습니다.");
                    setListWork("LIST");

                }

            } else { // api if
                // need error handle
            }
        }
    }

    // 첨부 파일 수정 
    async function saveFiles(itemId, fileFormData) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "POST",
            "appPath": `/api/v2/product/company/zone/subzone/room/panel/item/images?itemId=${itemId}`,
            appQuery: fileFormData,
            //userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == 200) {
                console.log("IN CHECK ITEM LAST : saveFiles : ", data);
            } else { // api if
                // need error handle
            }
        }
        //return data;

    }






    const elecinfos = (elecinfo == null) ? null : elecinfo;
    const panels = (panelData == null) ? null : panelData;



    return (
        <>
            <div className="area__right" ref={mobileRef}>
                <ul className="page-loca">
                    <li>LS일렉트릭</li>
                    <li>안양</li>
                    <li>1공장</li>
                    <li>전기실1</li>
                </ul>
                <div className="page-top">
                    <h2>전기실1</h2>
                    <div className="top-button">
                        {/* <!--220901 수정버튼 활성화시 active 클래스 추가해주세요~--> */}

                        <button type="button" className="btn-edit ml-10" onClick={(e) => onChangePut(e, listItem.spg.spgName)} ><span className="hide">수정</span></button>
                        :
                        <button type="button" className="btn-edit ml-10" style={{ "backgroundColor": "#0978ff" }}><span className="hide">수정</span></button>

                            // <button type="button" className="btn-edit bg-blue ml-10 " style={{ "backgroundColor": "#0978ff" }}><span className="hide">수정</span></button>

                        {/* <button type="button" className="btn btn-delete-bg bg-blue ml-10"><span className="hide">삭제</span></button> */}
                        <button type="button" className="btn-delete js-open" data-pop={"pop-reason"} ><span className="hide">삭제</span></button>
                    </div>
                </div>
                <div className="inline mb-18">
                    {/*<!--목록이동 버튼, 활성화되면 active 클래스 추가-->*/}
                    <a className="move-list"
                        onClick={(e) => onClickDeviceListChang(e)}>
                        Device List
                    </a>
                </div>
                {/* <!--area__right_content, 오른쪽 컨텐츠 영역--> */}
                <div className="area__right_content hcal-170">
                    <div className="content__info">
                        <ul className="form__input">
                            <li>
                                <p className="star">기기 명</p>
                                <div className="input__area">
                                    <input type="text" id="inp0" value={spgName || ''} readOnly disabled />
                                    :
                                    <div className="select"
                                        onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                        <div className="selected ">
                                            <div className="selected-value" >{spgName}</div>
                                            <div className="arrow"></div>
                                        </div>
                                        <ul>
                                            <li className="option">GIS</li>
                                        </ul>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <p className={`tit ${(listPut) ? "star" : ""}`}>Panel 명</p>
                                {(!listPut || ((spgName == "GIS") || (spgName == "유입식TR"))) &&
                                    <div className="input__area">
                                        <input type="text" id="inp1" value={panelName || ''} readOnly disabled />
                                    </div>

                                } {(listPut && ((spgName != "GIS") && (spgName != "유입식TR"))) &&
                                    <div className={`input__area ${(panelSelect) ? "autocomplete" : ""}`}
                                    >
                                        <input type="text" id="inp1" onClick={() => setPanelSelect(!panelSelect)}
                                            value={panelName} onChange={(e) => setPanelName(e.target.value)}
                                        // className={(errorList.filter(err => (err.field === "panelName")).length > 0) ? "input-error" : ""}
                                        />
                                        {/* <p className="input-errortxt">{errorList.filter(err => (err.field === "panelName")).map((err) => err.msg)}</p> */}
                                        {(panelSelect && !panelName) &&
                                            <ul className="autocomplete-box">
                                                {panels.map((panel) => (
                                                    <li key={panel.panelId} >
                                                        <a onClick={(e) => panelSelectClick(e, panel)}><span className="highlight"></span>{panel.panelName}</a>
                                                    </li>
                                                ))}
                                            </ul>
                                        }
                                    </div>
                                }
                            </li>
                            <li>
                                <p className={`tit ${(listPut) ? "star" : ""}`}>모델 명</p>
                                <div className="input__area">
                                    {(!listPut || (spgName == "배전반")) ?
                                        <input type="text" id="inp2" value={modelName || ''} readOnly disabled />
                                        :
                                        <input type="text" id="inp2" value={modelName || ''} onChange={(e) => setModelName(e.target.value)} />
                                    }
                                </div>
                            </li>
                            <li>
                                <p className={`tit ${(listPut) ? "star" : ""}`}>시리얼 번호</p>
                                <div className="input__area">
                                    {(!listPut) ?
                                        <input type="text" id="inp3" value={serialNo || ''} readOnly disabled />
                                        :
                                        <input type="text" id="inp3" value={serialNo || ''} onChange={(e) => setSerialNo(e.target.value)} />
                                    }
                                </div>
                            </li>
                            {/* 정격전압 */}
                            {(!listPut) &&
                                <li>
                                    <p className="tit ">정격전압<span className="inline">(kV)</span></p>
                                    <div className="input__area">
                                        <input type="text" id="inp4" value={ratingVoltage || ''} readOnly disabled />
                                    </div>
                                </li>
                            }
                            {(listPut) && elecinfos.filter((list) => (list.code == 'ratingVoltage')).map((list, idx) => (
                                <li key={idx}>
                                    <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                                    <div className={`input__area ${(ratingVoltage && ratingVoltageDisplay) ? "autocomplete" : ""}`} >
                                        <input type="text" id="inp4"
                                            value={ratingVoltage || ''} onChange={(e) => setRatingVoltage(e.target.value)}
                                            onKeyDown={(e) => ratingVoltageDown(e)}
                                        // className={(errorList.filter(err => (err.field === "ratingVoltage")).length > 0) ? "input-error" : ""}
                                        />
                                        {/* <p className="input-errortxt">{errorList.filter(err => (err.field === "ratingVoltage")).map((err) => err.msg)}</p> */}
                                        {(ratingVoltage && ratingVoltageDisplay) &&
                                            <ul className="autocomplete-box">
                                                <RatingVoltageAutoCompltet
                                                    values={list.values}
                                                    ratingVoltage={ratingVoltage}
                                                    setRatingVoltage={setRatingVoltage}
                                                    ratingVoltageDisplay={ratingVoltageDisplay}
                                                    setRatingVoltageDisplay={setRatingVoltageDisplay}
                                                />

                                            </ul>
                                        }
                                    </div>
                                </li>
                            ))}
                            {/* 정격전류 */}
                            {(!listPut) && (spgName != "유입식TR" && spgName != "MoldTR") &&
                                <li>
                                    <p className="tit ">정격전류<span className="inline">(A)</span></p>
                                    <div className="input__area">
                                        <input type="text" id="inp6" value={ratingCurrent || ''} readOnly disabled />
                                    </div>
                                </li>
                            }
                            {(listPut) && elecinfos.filter((list) => (list.code == 'ratingCurrent')).map((list, idx) => (
                                <li key={idx}>
                                    <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                                    <div className={`input__area ${(ratingCurrent && ratingCurrentDisplay) ? "autocomplete" : ""}`} >
                                        <input type="text" id="inp5"
                                            value={ratingCurrent || ''} onChange={(e) => setRatingCurrent(e.target.value)}
                                            onKeyDown={(e) => ratingCurrentDown(e)}
                                        // className={(errorList.filter(err => (err.field === "ratingCurrent")).length > 0) ? "input-error" : ""}
                                        />
                                        {/* <p className="input-errortxt">{errorList.filter(err => (err.field === "ratingCurrent")).map((err) => err.msg)}</p> */}
                                        {(ratingCurrent && ratingCurrentDisplay) &&
                                            <ul className="autocomplete-box">
                                                <RatingCurrentAutoCompltet
                                                    values={list.values}
                                                    ratingCurrent={ratingCurrent}
                                                    setRatingCurrent={setRatingCurrent}
                                                    ratingCurrentDisplay={ratingCurrentDisplay}
                                                    setRatingCurrentDisplay={setRatingCurrentDisplay}
                                                />

                                            </ul>
                                        }
                                    </div>
                                </li>
                            ))}
                            {/* 차단전류 */}
                            {(!listPut) && (spgName != "유입식TR" && spgName != "MoldTR") &&
                                <li>
                                    <p className="tit ">차단전류<span className="inline">(kA)</span></p>
                                    <div className="input__area">
                                        <input type="text" id="inp7" value={cutoffCurrent || ''} readOnly disabled />
                                    </div>
                                </li>
                            }
                            {(listPut) && elecinfos.filter((list) => (list.code == "cutoffCurrent")).map((list, idx) => (
                                <li key={idx}>
                                    <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                                    <div className={`input__area ${(cutoffCurrent && cutoffCurrentDisplay) ? "autocomplete" : ""}`} >
                                        <input type="text" id="inp6"
                                            value={cutoffCurrent || ''} onChange={(e) => setCutoffCurrent(e.target.value)}
                                            onKeyDown={(e) => cutoffCurrentDown(e)}
                                        // className={(errorList.filter(err => (err.field === "cutoffCurrent")).length > 0) ? "input-error" : ""}
                                        />
                                        {/* <p className="input-errortxt">{errorList.filter(err => (err.field === "cutoffCurrent")).map((err) => err.msg)}</p> */}
                                        {(cutoffCurrent && cutoffCurrentDisplay) &&
                                            <ul className="autocomplete-box">
                                                <CutoffCurrentAutoCompltet
                                                    values={list.values}
                                                    cutoffCurrent={cutoffCurrent}
                                                    setCutoffCurrent={setCutoffCurrent}
                                                    cutoffCurrentDisplay={cutoffCurrentDisplay}
                                                    setCutoffCurrentDisplay={setCutoffCurrentDisplay}
                                                />

                                            </ul>
                                        }
                                    </div>
                                </li>
                            ))}
                            {/* 계통전압  -> 2차전압으로 변경*/}
                            {(!listPut) && (spgName == "유입식TR" || spgName == "MoldTR") &&
                                <li>
                                    <p className="tit">2차전압<span className="inline">(kV)</span></p>
                                    <div className="input__area">
                                        <input type="text" id="inp5" value={secondaryVoltage || ''} readOnly disabled />
                                    </div>
                                </li>
                            }
                            {(listPut) && elecinfos.filter((list) => (list.code == "secondaryVoltage")).map((list, idx) => (
                                <li key={idx}>
                                    <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                                    <div className={`input__area ${(secondaryVoltage && secondaryVoltageDisplay) ? "autocomplete" : ""}`} >
                                        <input type="text" id="inp8"
                                            value={secondaryVoltage || ''} onChange={(e) => setSecondaryVoltage(e.target.value)}
                                            onKeyDown={(e) => secondaryVoltageDown(e)}
                                        // className={(errorList.filter(err => (err.field === "secondaryVoltage")).length > 0) ? "input-error" : ""}
                                        />
                                        {/* <p className="input-errortxt">{errorList.filter(err => (err.field === "secondaryVoltage")).map((err) => err.msg)}</p> */}
                                        {(secondaryVoltage && secondaryVoltageDisplay) &&
                                            <ul className="autocomplete-box">
                                                <SecondaryAutoCompltet
                                                    values={list.values}
                                                    secondaryVoltage={secondaryVoltage}
                                                    setSecondaryVoltage={setSecondaryVoltage}
                                                    secondaryVoltageDisplay={secondaryVoltageDisplay}
                                                    setSecondaryDisplay={setSecondaryDisplay}
                                                />

                                            </ul>
                                        }
                                    </div>
                                </li>
                            ))}
                            {/* 정격용량 */}
                            {(!listPut) && (spgName == "유입식TR" || spgName == "MoldTR") &&
                                <li>
                                    <p className="tit" >정격용량<span className="inline">(kVA)</span></p>
                                    <div className="input__area">
                                        <input type="text" id="inp8" value={ratedCapacity || ''} readOnly disabled />
                                    </div>
                                </li>
                            }
                            {(listPut) && elecinfos.filter((list) => (list.code == "ratedCapacity")).map((list, idx) => (
                                <li key={idx}>
                                    <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                                    <div className={`input__area ${(ratedCapacity && ratedCapacityDisplay) ? "autocomplete" : ""}`} >
                                        <input type="text" id="inp7"
                                            value={ratedCapacity || ''} onChange={(e) => setRatedCapacity(e.target.value)}
                                            onKeyDown={(e) => ratedCapacityDown(e)}
                                        // className={(errorList.filter(err => (err.field === "ratedCapacity")).length > 0) ? "input-error" : ""}
                                        />
                                        {/* <p className="input-errortxt">{errorList.filter(err => (err.field === "ratedCapacity")).map((err) => err.msg)}</p> */}
                                        {(ratedCapacity && ratedCapacityDisplay) &&
                                            <ul className="autocomplete-box">
                                                <RatedCapacityAutoCompltet
                                                    values={list.values}
                                                    ratedCapacity={ratedCapacity}
                                                    setRatedCapacity={setRatedCapacity}
                                                    ratedCapacityDisplay={ratedCapacityDisplay}
                                                    setRatedCapacityDisplay={setRatedCapacityDisplay}
                                                />

                                            </ul>
                                        }
                                    </div>
                                </li>
                            ))}
                            <li>
                                <p className="tit ">제조사</p>
                                <div className="input__area">
                                    {(!listPut) ?
                                        <input type="text" id="inp9" value={manufacturer || ''} readOnly disabled />
                                        :
                                        <input type="text" id="inp9" value={manufacturer || ''} onChange={(e) => setManufacturer(e.target.value)} />
                                    }
                                </div>
                            </li>
                            <li>
                                <p className="tit">첨부파일</p>
                                <div className="input__area">
                                    {(listPut) &&
                                        <div className="filebox">
                                            <input className="upload-name" placeholder="사진을 첨부하세요" />
                                            <label onClick={(e) => handleFileUpload(e)}><span className="hide">파일찾기</span></label>
                                            <input ref={fileRef} className="upload-name" type="file" id="file"
                                                accept="image/jpg, image/jpeg, image/png" onChange={(e) => saveFileImage(e)} />
                                        </div>
                                    }

                                    {savedFiles.filter((file, idx) => (idx >= curPos) && ((idx < curPos + listSize))).map((img, idx) => (
                                        <ul className="filelist" key={img.imageId}>
                                            <li >
                                                <span >{img.name}</span>
                                                {(listPut && img.name != '') &&
                                                    <button type="button" className="btn btn-delete js-open" data-pop={"pop-imgdelelte"} onClick={(e) => onClickAttachFileDelete(e, img)}><span className="hide">삭제</span></button>
                                                }
                                                {(!listPut && img.name != '') &&
                                                    <button type="button" className="btn btn-filedown" onClick={(e) => onClicFileDown(img)}><span className="hide">다운로드</span></button>
                                                }

                                            </li>
                                        </ul>
                                    ))}

                                </div>
                            </li>
                            <li>
                                <p className="tit">메모</p>
                                <div className="input__area disavled">
                                    {(!listPut) ?
                                        <textarea value={memo || ''} readOnly disabled></textarea>
                                        :
                                        <textarea value={memo || ''} onChange={(e) => setMemo(e.target.value)}></textarea>
                                    }
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="btn__wrap ml-0">
                        <button type="button" className="bg-gray" onClick={(e) => listPutClose(e)}><span>취소</span></button>
                        <button type="button" ><span>저장</span></button>
                    </div>
                </div>
                {/* <!--//area__right_content, 오른쪽 컨텐츠 영역--> */}
            </div>
        </>
    );
}


export default DeviceListUpdate;

function MobileDeviceListUpdate(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //
    const curTree = props.curTree;
    //
    const listItem = props.listItem;
    const mobileRef = props.mobileRef
    const setListChang = props.setListChang;
    const setParentPopWin = props.setParentPopWin;
    const setListWork = props.setListWork
    const setListItem = props.setListItem;
    //spg 선택 
    const [device] = useState([
        { id: 0, fname: "VCB",/*  active: false */ },
        { id: 1, fname: "ACB", /* active: false */ },
        { id: 2, fname: "GIS", /* active: false */ },
        { id: 3, fname: "MoldTR", /* active: false */ },
        { id: 4, fname: "유입식TR", /* active: false */ },
        { id: 5, fname: "배전반", /* active: false */ },
    ]);

    //
    const [spgName, setSpgName] = useState("");
    const [panelName, setPanelName] = useState("");
    const [modelName, setModelName] = useState("");
    const [serialNo, setSerialNo] = useState("");
    const [ratingVoltage, setRatingVoltage] = useState("")
    const [ratingCurrent, setRatingCurrent] = useState("");
    const [cutoffCurrent, setCutoffCurrent] = useState("");
    const [ratedCapacity, setRatedCapacity] = useState("");
    const [manufacturer, setManufacturer] = useState("");
    const [secondaryVoltage, setSecondaryVoltage] = useState("");
    const [memo, setMemo] = useState("");
    //
    //
    const [elecinfo, setElecinfo] = useState([]);
    //
    const [ratingVoltageDisplay, setRatingVoltageDisplay] = useState(false);
    const [ratingCurrentDisplay, setRatingCurrentDisplay] = useState(false);
    const [cutoffCurrentDisplay, setCutoffCurrentDisplay] = useState(false);
    const [ratedCapacityDisplay, setRatedCapacityDisplay] = useState(false);
    const [secondaryVoltageDisplay, setSecondaryDisplay] = useState(false);
    const [panelData, setPanelData] = useState([]);
    const [panelSelect, setPanelSelect] = useState(false);
    //
    const [listPut, setListPut] = useState(false);
    //첨부파일 
    const fileRef: any = useRef();
    const [savedFiles, setSavedFiles] = useState([]);

    const [curPos] = useState(0);
    const [listSize] = useState(10);


    //
    const { data: putDevice, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/product/company/zone/subzone/room/panel/item/images`,
        appQuery: {
            itemId: listItem.itemId,
        },
        //userToken: userInfo.loginInfo.token,
        watch: listItem.itemId
    });



    useEffect(() => {
        if (putDevice) {
            if (putDevice.codeNum == CONST.API_200) {

                setSavedFiles(putDevice.body);
                setSpgName(listItem.spg.spgName);
                setPanelName(listItem.panel.panelName);
                setModelName(listItem.itemName);
                setSerialNo(listItem.serialNo);
                setRatingVoltage(listItem.ratingVoltage);
                setRatingCurrent(listItem.ratingCurrent);
                setCutoffCurrent(listItem.cutoffCurrent);
                setRatedCapacity(listItem.ratedCapacity);
                setManufacturer(listItem.manufacturer);
                setSecondaryVoltage(listItem.secondaryVoltage);
                setMemo(listItem.memo);

            }
        }

    }, [listItem, putDevice])

    // 수정 화면 이벤트 
    // Device List로 이동
    function onClickDeviceListChang(e) {
        setListWork("LIST");
    }
    // 수정 화면으로 변경
    function onChangePut(e, spgName) {
        setListPut(true);
        onClickDeveice(e, spgName)

    }



    //기기 전력 정보 API
    async function onClickDeveice(e, spgName) {
        let appPath = "spgName=" + spgName;
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "GET",
            "appPath": '/api/v2/product/company/zone/subzone/room/panel/item/elecinfo?' + appPath,
            //userToken: userInfo.loginInfo.token,
            watch: appPath
        });

        if (data) {
            if (data.codeNum == 200) {
                setElecinfo(data.body);
                setSpgName(spgName);
            }
        }
        onClickPanel(e, spgName)
    }
    // 기기분류에 따른 판넬 목록 API
    async function onClickPanel(e, spgName) {
        let appPath = "roomId=" + curTree.room.roomId + "&spgName=" + spgName;

        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "GET",
            "appPath": '/api/v2/product/company/zone/subzone/room/panels?' + appPath,
            //userToken: userInfo.loginInfo.token,
            watch: appPath
        });

        if (data) {
            if (data.codeNum == 200 || panelSelect === false) {
                setPanelData(data.body);
                // setPanelSelect(true)
            }
        }

    }

    //판넬 Selct 클릭 이벤트
    function panelSelectClick(e, panel) {
        setPanelName(panel.panelName)
        setPanelSelect(false)
    }

    //
    function ratingVoltageDown(e) {
        setRatingVoltageDisplay(true);
    }
    function ratingCurrentDown(e) {
        setRatingCurrentDisplay(true);
    }
    function cutoffCurrentDown(e) {
        setCutoffCurrentDisplay(true);
    }
    function secondaryVoltageDown(e) {
        setSecondaryDisplay(true);
    }
    function ratedCapacityDown(e) {
        setRatedCapacityDisplay(true);
    }


    // 첨부파일 
    function handleFileUpload(e) {
        fileRef.current.click();
    }

    // 첨부파일 저장
    function saveFileImage(e) {
        const file = e.target.files[0]
        const formData = new FormData();
        formData.append("files", file);
        var fileVal = {
            imageId: "INS_" + savedFiles.length,
            name: file.name,
            url: URL.createObjectURL(file),
            type: "INS",
            fileForm: formData,
        }
        e.target.value = '';
        if (savedFiles.length <= listSize - 1) {
            setSavedFiles([...savedFiles, fileVal]);
        } else {
            // files data 10ea
        }

    };
    // 이미지 다운로드
    async function onClicFileDown(itemId) {
        HTTPUTIL.fileDownload2(`${itemId.name}`, itemId.url);
    }

    //이미지 삭제
    async function onClickAttachFileDelete(e, delFile) {

        setParentPopWin("pop-imgdelelte",
            <ReasonImagePopup
                htmlHeader={<h1>이미지 삭제</h1>}
                delFile={delFile}
                setSavedFiles={setSavedFiles}
                savedFiles={savedFiles}
                // props
                curTree={curTree}
                setListChang={setListChang}
                mobileRef={mobileRef}
                setParentPopWin={setParentPopWin}
                setListWork={setListWork}
                listItem={listItem}
                setListItem={setListItem}
            />
        )
        CUTIL.jsopen_Popup(e);
    }

    // 수정 취소 이벤트
    function listPutClose(e) {
        setSpgName(listItem.spg.spgName);
        setPanelName(listItem.panel.panelName);
        setModelName(listItem.itemName);
        setSerialNo(listItem.serialNo);
        setRatingVoltage(listItem.ratingVoltage);
        setRatingCurrent(listItem.ratingCurrent);
        setCutoffCurrent(listItem.cutoffCurrent);
        setRatedCapacity(listItem.ratedCapacity);
        setManufacturer(listItem.manufacturer);
        setSecondaryVoltage(listItem.secondaryVoltage);
        setMemo(listItem.memo);
        setListPut(false);
        setPanelSelect(false);

    }

    async function listPUtDone(e, itemId) {
        let data: any = [];
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "PUT",
            appPath: `/api/v2/product/company/zone/subzone/room/panel/item/${itemId}`,
            //  "appPath": `/api/v2/product/company/zone/subzone/room/panel/item/images?itemId=${itemId}`,
            appQuery: {
                roomId: curTree.room.roomId,
                spgName: spgName,
                panelName: panelName,
                modelName: modelName,
                serialNo: serialNo,
                memo: memo,
                ratingVoltage: ratingVoltage,
                ratingCurrent: ratingCurrent,
                cutoffCurrent: cutoffCurrent,
                ratedCapacity: ratedCapacity,
                secondaryVoltage: secondaryVoltage,
                manufacturer: manufacturer,
            },
            //userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                if (savedFiles.length > 0) {
                    savedFiles.map((file, idx) => {
                        if (file.hasOwnProperty("type") && (file.type == "INS")) {
                            saveFiles(itemId, file.fileForm);
                        }
                    });
                    alert("저장되었습니다.");
                    setListWork("LIST");
                } else {
                    console.log("data", data)
                    alert("저장되었습니다.");
                    setListWork("LIST");

                }

            } else { // api if
                // need error handle
            }
        }
    }

    // 첨부 파일 수정 
    async function saveFiles(itemId, fileFormData) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "POST",
            "appPath": `/api/v2/product/company/zone/subzone/room/panel/item/images?itemId=${itemId}`,
            appQuery: fileFormData,
            //userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == 200) {
                console.log("IN CHECK ITEM LAST : saveFiles : ", data);
            } else { // api if
                // need error handle
            }
        }
        //return data;

    }






    const elecinfos = (elecinfo == null) ? null : elecinfo;
    const panels = (panelData == null) ? null : panelData;



    return (
        <>

            <div className="popup__body">
                <ul className="page-loca">
                    <li>{curTree.company.companyName}</li>
                    <li>{curTree.zone.zoneName}</li>
                    <li>{curTree.subZone.subZoneName}</li>
                    <li>{curTree.room.roomName}</li>
                </ul>
                <div className="page-top">
                    <h2>{curTree.room.roomName}</h2>
                    <div className="top-button">
                        {/* <!--220901 수정버튼 활성화시 active 클래스 추가해주세요~--> */}
                        {(!listPut) ?
                            <button type="button" className="btn-edit " onClick={(e) => onChangePut(e, listItem.spg.spgName)} ><span className="hide">수정</span></button>
                            :
                            <button type="button" className="btn-edit " style={{ "background": "#0978ff" }}><span className="hide">수정</span></button>
                        }
                        <button type="button" className="btn-delete js-open" data-pop={"pop-reason"} onClick={(e) => CUTIL.jsopen_Popup(e)}><span className="hide">삭제</span></button>
                    </div>
                </div>
                <div className="area__right_content workplace__info">
                    {/* <!--area__right_content, 오른쪽 컨텐츠 영역--> */}
                    <a className="move-list"
                        onClick={(e) => onClickDeviceListChang(e)}>
                        Device List
                    </a>
                    <ul className="tab__small">

                    </ul>
                    <div className="area__right_content workplace__info info__input">
                        <div className="content__info">
                            <ul className="form__input">
                                <li>
                                    <p className={`tit ${(listPut) ? "star" : ""}`}>기기 명</p>
                                    <div className="input__area">
                                        {(!listPut) ?
                                            <input type="text" id="inp0" value={spgName || ''} readOnly disabled />
                                            :
                                            <div className="select"
                                                onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                                <div className="selected ">
                                                    <div className="selected-value" >{spgName}</div>
                                                    <div className="arrow"></div>
                                                </div>
                                                <ul>
                                                    {/* <li id="directCloseCom" className="option hide" data-value={""} >회사를 선택해주세요.</li> */}
                                                    {device.map((list) => (
                                                        <li
                                                            className="option"
                                                            //className={(errorList.filter(err => (err.field === "companyName")).length > 0) ? "option input-error" : "option"}
                                                            data-value={list.fname} key={list.id} onClick={(e) => onClickDeveice(e, list.fname)}>
                                                            {list.fname}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        }
                                    </div>
                                </li>
                                <li>
                                    <p className={`tit ${(listPut) ? "star" : ""}`}>Panel 명</p>
                                    {(!listPut || ((spgName == "GIS") || (spgName == "유입식TR"))) &&
                                        <div className="input__area">
                                            <input type="text" id="inp1" value={panelName || ''} readOnly disabled />
                                        </div>

                                    } {(listPut && ((spgName != "GIS") && (spgName != "유입식TR"))) &&
                                        <div className={`input__area ${(panelSelect) ? "autocomplete" : ""}`}
                                        >
                                            <input type="text" id="inp1" onClick={() => setPanelSelect(!panelSelect)}
                                                value={panelName} onChange={(e) => setPanelName(e.target.value)}
                                            // className={(errorList.filter(err => (err.field === "panelName")).length > 0) ? "input-error" : ""}
                                            />
                                            {/* <p className="input-errortxt">{errorList.filter(err => (err.field === "panelName")).map((err) => err.msg)}</p> */}
                                            {(panelSelect && !panelName) &&
                                                <ul className="autocomplete-box">
                                                    {panels.map((panel) => (
                                                        <li key={panel.panelId} >
                                                            <a onClick={(e) => panelSelectClick(e, panel)}><span className="highlight"></span>{panel.panelName}</a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            }
                                        </div>
                                    }
                                </li>
                                <li>
                                    <p className={`tit ${(listPut) ? "star" : ""}`}>모델 명</p>
                                    <div className="input__area">
                                        {(!listPut || (spgName == "배전반")) ?
                                            <input type="text" id="inp2" value={modelName || ''} readOnly disabled />
                                            :
                                            <input type="text" id="inp2" value={modelName || ''} onChange={(e) => setModelName(e.target.value)} />
                                        }
                                    </div>
                                </li>
                                <li>
                                    <p className={`tit ${(listPut) ? "star" : ""}`}>시리얼 번호</p>
                                    <div className="input__area">
                                        {(!listPut) ?
                                            <input type="text" id="inp3" value={serialNo || ''} readOnly disabled />
                                            :
                                            <input type="text" id="inp3" value={serialNo || ''} onChange={(e) => setSerialNo(e.target.value)} />
                                        }
                                    </div>
                                </li>
                                {/* 정격전압 */}
                                {(!listPut) &&
                                    <li>
                                        <p className="tit ">정격전압<span className="inline">(kV)</span></p>
                                        <div className="input__area">
                                            <input type="text" id="inp4" value={ratingVoltage || ''} readOnly disabled />
                                        </div>
                                    </li>
                                }
                                {(listPut) && elecinfos.filter((list) => (list.code == 'ratingVoltage')).map((list, idx) => (
                                    <li key={idx}>
                                        <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                                        <div className={`input__area ${(ratingVoltage && ratingVoltageDisplay) ? "autocomplete" : ""}`} >
                                            <input type="text" id="inp4"
                                                value={ratingVoltage || ''} onChange={(e) => setRatingVoltage(e.target.value)}
                                                onKeyDown={(e) => ratingVoltageDown(e)}
                                            // className={(errorList.filter(err => (err.field === "ratingVoltage")).length > 0) ? "input-error" : ""}
                                            />
                                            {/* <p className="input-errortxt">{errorList.filter(err => (err.field === "ratingVoltage")).map((err) => err.msg)}</p> */}
                                            {(ratingVoltage && ratingVoltageDisplay) &&
                                                <ul className="autocomplete-box">
                                                    <RatingVoltageAutoCompltet
                                                        values={list.values}
                                                        ratingVoltage={ratingVoltage}
                                                        setRatingVoltage={setRatingVoltage}
                                                        ratingVoltageDisplay={ratingVoltageDisplay}
                                                        setRatingVoltageDisplay={setRatingVoltageDisplay}
                                                    />

                                                </ul>
                                            }
                                        </div>
                                    </li>
                                ))}
                                {/* 정격전류 */}
                                {(!listPut) && (spgName != "유입식TR" && spgName != "MoldTR") &&
                                    <li>
                                        <p className="tit ">정격전류<span className="inline">(A)</span></p>
                                        <div className="input__area">
                                            <input type="text" id="inp6" value={ratingCurrent || ''} readOnly disabled />
                                        </div>
                                    </li>
                                }
                                {(listPut) && elecinfos.filter((list) => (list.code == 'ratingCurrent')).map((list, idx) => (
                                    <li key={idx}>
                                        <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                                        <div className={`input__area ${(ratingCurrent && ratingCurrentDisplay) ? "autocomplete" : ""}`} >
                                            <input type="text" id="inp5"
                                                value={ratingCurrent || ''} onChange={(e) => setRatingCurrent(e.target.value)}
                                                onKeyDown={(e) => ratingCurrentDown(e)}
                                            // className={(errorList.filter(err => (err.field === "ratingCurrent")).length > 0) ? "input-error" : ""}
                                            />
                                            {/* <p className="input-errortxt">{errorList.filter(err => (err.field === "ratingCurrent")).map((err) => err.msg)}</p> */}
                                            {(ratingCurrent && ratingCurrentDisplay) &&
                                                <ul className="autocomplete-box">
                                                    <RatingCurrentAutoCompltet
                                                        values={list.values}
                                                        ratingCurrent={ratingCurrent}
                                                        setRatingCurrent={setRatingCurrent}
                                                        ratingCurrentDisplay={ratingCurrentDisplay}
                                                        setRatingCurrentDisplay={setRatingCurrentDisplay}
                                                    />

                                                </ul>
                                            }
                                        </div>
                                    </li>
                                ))}
                                {/* 차단전류 */}
                                {(!listPut) && (spgName != "유입식TR" && spgName != "MoldTR") &&
                                    <li>
                                        <p className="tit ">차단전류<span className="inline">(kA)</span></p>
                                        <div className="input__area">
                                            <input type="text" id="inp7" value={cutoffCurrent || ''} readOnly disabled />
                                        </div>
                                    </li>
                                }
                                {(listPut) && elecinfos.filter((list) => (list.code == "cutoffCurrent")).map((list, idx) => (
                                    <li key={idx}>
                                        <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                                        <div className={`input__area ${(cutoffCurrent && cutoffCurrentDisplay) ? "autocomplete" : ""}`} >
                                            <input type="text" id="inp6"
                                                value={cutoffCurrent || ''} onChange={(e) => setCutoffCurrent(e.target.value)}
                                                onKeyDown={(e) => cutoffCurrentDown(e)}
                                            // className={(errorList.filter(err => (err.field === "cutoffCurrent")).length > 0) ? "input-error" : ""}
                                            />
                                            {/* <p className="input-errortxt">{errorList.filter(err => (err.field === "cutoffCurrent")).map((err) => err.msg)}</p> */}
                                            {(cutoffCurrent && cutoffCurrentDisplay) &&
                                                <ul className="autocomplete-box">
                                                    <CutoffCurrentAutoCompltet
                                                        values={list.values}
                                                        cutoffCurrent={cutoffCurrent}
                                                        setCutoffCurrent={setCutoffCurrent}
                                                        cutoffCurrentDisplay={cutoffCurrentDisplay}
                                                        setCutoffCurrentDisplay={setCutoffCurrentDisplay}
                                                    />

                                                </ul>
                                            }
                                        </div>
                                    </li>
                                ))}
                                {/* 계통전압  -> 2차전압으로 변경*/}
                                {(!listPut) && (spgName == "유입식TR" || spgName == "MoldTR") &&
                                    <li>
                                        <p className="tit">2차전압<span className="inline">(kV)</span></p>
                                        <div className="input__area">
                                            <input type="text" id="inp5" value={secondaryVoltage || ''} readOnly disabled />
                                        </div>
                                    </li>
                                }
                                {(listPut) && elecinfos.filter((list) => (list.code == "secondaryVoltage")).map((list, idx) => (
                                    <li key={idx}>
                                        <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                                        <div className={`input__area ${(secondaryVoltage && secondaryVoltageDisplay) ? "autocomplete" : ""}`} >
                                            <input type="text" id="inp8"
                                                value={secondaryVoltage || ''} onChange={(e) => setSecondaryVoltage(e.target.value)}
                                                onKeyDown={(e) => secondaryVoltageDown(e)}
                                            // className={(errorList.filter(err => (err.field === "secondaryVoltage")).length > 0) ? "input-error" : ""}
                                            />
                                            {/* <p className="input-errortxt">{errorList.filter(err => (err.field === "secondaryVoltage")).map((err) => err.msg)}</p> */}
                                            {(secondaryVoltage && secondaryVoltageDisplay) &&
                                                <ul className="autocomplete-box">
                                                    <SecondaryAutoCompltet
                                                        values={list.values}
                                                        secondaryVoltage={secondaryVoltage}
                                                        setSecondaryVoltage={setSecondaryVoltage}
                                                        secondaryVoltageDisplay={secondaryVoltageDisplay}
                                                        setSecondaryDisplay={setSecondaryDisplay}
                                                    />

                                                </ul>
                                            }
                                        </div>
                                    </li>
                                ))}
                                {/* 정격용량 */}
                                {(!listPut) && (spgName == "유입식TR" || spgName == "MoldTR") &&
                                    <li>
                                        <p className="tit" >정격용량<span className="inline">(kVA)</span></p>
                                        <div className="input__area">
                                            <input type="text" id="inp8" value={ratedCapacity || ''} readOnly disabled />
                                        </div>
                                    </li>
                                }
                                {(listPut) && elecinfos.filter((list) => (list.code == "ratedCapacity")).map((list, idx) => (
                                    <li key={idx}>
                                        <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                                        <div className={`input__area ${(ratedCapacity && ratedCapacityDisplay) ? "autocomplete" : ""}`} >
                                            <input type="text" id="inp7"
                                                value={ratedCapacity || ''} onChange={(e) => setRatedCapacity(e.target.value)}
                                                onKeyDown={(e) => ratedCapacityDown(e)}
                                            // className={(errorList.filter(err => (err.field === "ratedCapacity")).length > 0) ? "input-error" : ""}
                                            />
                                            {/* <p className="input-errortxt">{errorList.filter(err => (err.field === "ratedCapacity")).map((err) => err.msg)}</p> */}
                                            {(ratedCapacity && ratedCapacityDisplay) &&
                                                <ul className="autocomplete-box">
                                                    <RatedCapacityAutoCompltet
                                                        values={list.values}
                                                        ratedCapacity={ratedCapacity}
                                                        setRatedCapacity={setRatedCapacity}
                                                        ratedCapacityDisplay={ratedCapacityDisplay}
                                                        setRatedCapacityDisplay={setRatedCapacityDisplay}
                                                    />

                                                </ul>
                                            }
                                        </div>
                                    </li>
                                ))}
                                <li>
                                    <p className="tit ">제조사</p>
                                    <div className="input__area">
                                        {(!listPut) ?
                                            <input type="text" id="inp9" value={manufacturer || ''} readOnly disabled />
                                            :
                                            <input type="text" id="inp9" value={manufacturer || ''} onChange={(e) => setManufacturer(e.target.value)} />
                                        }
                                    </div>
                                </li>
                                <li>
                                    <p className="tit">첨부파일</p>
                                    <div className="input__area">
                                        {(listPut) &&
                                            <div className="filebox">
                                                <input className="upload-name" placeholder="사진을 첨부하세요" />
                                                <label onClick={(e) => handleFileUpload(e)}><span className="hide">파일찾기</span></label>
                                                <input ref={fileRef} className="upload-name" type="file" id="file"
                                                    accept="image/jpg, image/jpeg, image/png" onChange={(e) => saveFileImage(e)} />
                                            </div>
                                        }

                                        {savedFiles.filter((file, idx) => (idx >= curPos) && ((idx < curPos + listSize))).map((img, idx) => (
                                            <ul className="filelist" key={img.imageId}>
                                                <li >
                                                    <span >{img.name}</span>
                                                    {(listPut && img.name != '') &&
                                                        <button type="button" className="btn btn-delete js-open" data-pop={"pop-imgdelelte"} onClick={(e) => onClickAttachFileDelete(e, img)}><span className="hide">삭제</span></button>
                                                    }
                                                    {(!listPut && img.name != '') &&
                                                        <button type="button" className="btn btn-filedown" onClick={(e) => onClicFileDown(img)}><span className="hide">다운로드</span></button>
                                                    }

                                                </li>
                                            </ul>
                                        ))}

                                    </div>
                                </li>
                                <li>
                                    <p className="tit">메모</p>
                                    <div className="input__area disavled">
                                        {(!listPut) ?
                                            <textarea value={memo || ''} readOnly disabled></textarea>
                                            :
                                            <textarea value={memo || ''} onChange={(e) => setMemo(e.target.value)}></textarea>
                                        }
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="btn__wrap mt-32">
                            {(listPut) &&
                                <button type="button" className="bg-gray" onClick={(e) => listPutClose(e)}><span>취소</span></button>
                            }
                            <button type="button" onClick={(e) => listPUtDone(e, listItem.itemId)}><span>저장</span></button>
                        </div>
                    </div>
                </div >

            </div>
        </>
    )
}
//
////
//전격전압 vules
function RatingVoltageAutoCompltet(props) {
    const data = props.values;
    const ratingVoltage = props.ratingVoltage;
    const setRatingVoltage = props.setRatingVoltage;
    const ratingVoltageDisplay = props.ratingVoltageDisplay;
    const setRatingVoltageDisplay = props.setRatingVoltageDisplay;
    //
    function autoClick(e, data) {
        setRatingVoltage(data)
        setRatingVoltageDisplay(false)
    }
    //
    return (
        <>
            {(ratingVoltage && ratingVoltageDisplay) && data.filter((data) => (data.indexOf(ratingVoltage.toLowerCase()) > -1)).map((data, idx) => (
                <li key={idx}>
                    <a onClick={(e) => autoClick(e, data)}>
                        < span className="highlight">{data}</span>
                    </a>
                </li>
            ))
            }

        </>
    )
}
//전격전압 vules
function RatingCurrentAutoCompltet(props) {
    const data = props.values;
    const ratingCurrent = props.ratingCurrent;
    const setRatingCurrent = props.setRatingCurrent;
    const ratingCurrentDisplay = props.ratingCurrentDisplay;
    const setRatingCurrentDisplay = props.setRatingCurrentDisplay;
    //
    function autoClick(e, data) {
        setRatingCurrent(data)
        setRatingCurrentDisplay(false)
    }
    //
    return (
        <>
            {(ratingCurrent && ratingCurrentDisplay) && data.filter((data) => (data.indexOf(ratingCurrent.toLowerCase()) > -1)).map((data, idx) => (
                <li key={idx}>
                    <a onClick={(e) => autoClick(e, data)} ><span className="highlight">{data}</span></a>
                </li>
            ))}

        </>
    )
}
//차단전류 vules 
function CutoffCurrentAutoCompltet(props) {
    const data = props.values
    const cutoffCurrent = props.cutoffCurrent;
    const setCutoffCurrent = props.setCutoffCurrent;
    const cutoffCurrentDisplay = props.cutoffCurrentDisplay;
    const setCutoffCurrentDisplay = props.setCutoffCurrentDisplay;
    //
    function autoClick(e, data) {
        setCutoffCurrent(data)
        setCutoffCurrentDisplay(false)
    }
    //
    return (
        <>
            {(cutoffCurrent && cutoffCurrentDisplay) && data.filter((data) => (data.indexOf(cutoffCurrent.toLowerCase()) > -1)).map((data, idx) => (
                <li key={idx}>
                    <a onClick={(e) => autoClick(e, data)} ><span className="highlight">{data}</span></a>
                </li>
            ))}

        </>
    )
}
//2차전압 vules
function SecondaryAutoCompltet(props) {
    const data = props.values
    const secondaryVoltage = props.secondaryVoltage;
    const setSecondaryVoltage = props.setSecondaryVoltage;
    const secondaryVoltageDisplay = props.secondaryVoltageDisplay;
    const setSecondaryDisplay = props.setSecondaryDisplay;
    //
    function autoClick(e, data) {
        setSecondaryVoltage(data)
        setSecondaryDisplay(false)
    }
    //
    return (
        <>
            {(secondaryVoltage && secondaryVoltageDisplay) && data.filter((data) => (data.indexOf(secondaryVoltage.toLowerCase()) > -1)).map((data, idx) => (
                <li key={idx}>
                    <a onClick={(e) => autoClick(e, data)}><span className="highlight">{data}</span></a>
                </li>
            ))}

        </>
    )
}
//정격용량 vules
function RatedCapacityAutoCompltet(props) {
    const data = props.values;
    const ratedCapacity = props.ratedCapacity;
    const setRatedCapacity = props.setRatedCapacity;
    const ratedCapacityDisplay = props.ratedCapacityDisplay;
    const setRatedCapacityDisplay = props.setRatedCapacityDisplay;

    function autoClick(e, data) {
        setRatedCapacity(data)
        setRatedCapacityDisplay(false)
    }
    return (
        <>
            {(ratedCapacity && ratedCapacityDisplay) && data.filter((data) => (data.indexOf(ratedCapacity.toLowerCase()) > -1)).map((data, idx) => (
                <li key={idx}>
                    <a onClick={(e) => autoClick(e, data)}><span className="highlight">{data}</span></a>
                </li>
            ))}

        </>
    )
}

// 리스트 삭제
function ReasonPopup(props) {
    // 
    const userInfo = useRecoilValue(userInfoLoginState);
    //
    const listItem = props.listItem
    const mobileRef = props.mobileRef
    const setListChang = props.setListChang;
    const setParentPopWin = props.setParentPopWin;
    const setListWork = props.setListWork
    const setListItem = props.setListItem;
    const [disPlay, setDisPlay] = useState(null);

    async function listDel(itemId) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "DELETE",
            appPath: `/api/v2/product/company/zone/subzone/room/panel/item/${itemId}`,
            /* appQuery: {
                 itemId: itemId
               }, */
            //userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setDisPlay("삭제되었습니다.");
            }
        }
    }
    function listDelDone(e) {
        var btnCommentClose = document.getElementById("pop-reason");
        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11; ");
        setListWork("LIST");
    }
    return (

        <>
            <div className="popup__body">
                <p>
                    <span className="font-16">{(!disPlay) ? "해당 기기를 삭제하시겠습니까?" : disPlay}</span><br />
                    <span className="fontRegular"></span>
                </p>
                <dl>
                    <dt></dt>
                    <dd></dd>
                </dl>
            </div>
            <div className="popup__footer">
                {(!disPlay) &&
                    <button type="button" className="bg-gray btn-close"><span>취소</span></button>
                }
                {(!disPlay) ?
                    <button type="button" className="" onClick={(e) => listDel(listItem.itemId)}>
                        <span>확인</span>
                    </button>
                    :
                    <button type="button" className="btn-close" onClick={(e) => listDelDone(e)}>
                        <span>확인</span>
                    </button>
                }
            </div>
        </>
    )
}

//이미지 삭제
function ReasonImagePopup(props) {
    // 
    const userInfo = useRecoilValue(userInfoLoginState);
    //
    const delFile = props.delFile;
    const setSavedFiles = props.setSavedFiles;
    const savedFiles = props.savedFiles;
    //
    const mobileRef = props.mobileRef
    const setListChang = props.setListChang;
    const setParentPopWin = props.setParentPopWin;
    const setListWork = props.setListWork
    const setListItem = props.setListItem;
    //
    const [disPlay, setDisPlay] = useState(null);

    async function listDel(delFile) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "DELETE",
            appPath: `/api/v2/item/images`,
            appQuery: {
                imageIds: delFile.imageId
            },
            //userToken: userInfo.loginInfo.token,
            watch: delFile.imageId
        });
        console.log("delFile", delFile);
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setDisPlay("삭제되었습니다.");
            } else {
                setDisPlay("삭제되었습니다.");
            }
        }

    }
    function listDelDone(e) {
        if (!delFile.hasOwnProperty("type")) {
            URL.revokeObjectURL(delFile.url);
        }
        setSavedFiles(savedFiles.filter(file => file.imageId !== delFile.imageId));
        // setListWork("LIST");
        var btnCommentClose = document.getElementById("pop-imgdelelte");
        var body = document.body
        var dimm = body.querySelector(".dimm");

        if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
        if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
        if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11; ");
    }
    return (

        <>
            <div className="popup__body">
                <p>
                    <span className="font-16">{(!disPlay) ? " 해당 이미지를 삭제하시겠습니까?" : disPlay}</span><br />
                    <span className="fontRegular"></span>
                </p>
                <dl>
                    <dt></dt>
                    <dd></dd>
                </dl>
            </div>
            <div className="popup__footer">
                {(!disPlay) &&
                    <button type="button" className="bg-gray btn-close"><span>취소</span></button>
                }
                {(!disPlay) ?
                    <button type="button" className="" onClick={(e) => listDel(delFile)}>
                        <span>확인</span>
                    </button>
                    :
                    <button type="button" className="btn-close" onClick={(e) => listDelDone(delFile)}>
                        <span>확인</span>
                    </button>
                }
            </div>
        </>
    )
}


/*
const device = props.device;
  const spgName = props.spgName;
  const setSpgName = props.setSpgName;
  const panelName = props.panelName;
  const setPanelName = props.setPanelName;
  const modelName = props.modelName;
  const setModelName = props.setModelName;
  const serialNo = props.serialNo;
  const setSerialNo = props.setSerialNo;
  const ratingVoltage = props.ratingVoltage;
  const setRatingVoltage = props.setRatingVoltage;
  const ratingCurrent = props.ratingCurrent;
  const setRatingCurrent = props.setRatingCurrent;
  const cutoffCurrent = props.cutoffCurrent;
  const setCutoffCurrent = props.setCutoffCurrent;
  const ratedCapacity = props.ratedCapacity;
  const setRatedCapacity = props.setRatedCapacity;
  const manufacturer = props.manufacturer;
  const setManufacturer = props.setManufacturer;
  const secondaryVoltage = props.secondaryVoltage;
  const setSecondaryVoltage = props.setSecondaryVoltage;
  const memo = props.memo;
  const setMemo = props.setMemo;
  const elecinfo = props.elecinfo;
  const setElecinfo = props.setElecinfo;
  const ratingVoltageDisplay = props.ratingVoltageDisplay;
  const setRatingVoltageDisplay = props.setRatingVoltageDisplay;
  const ratingCurrentDisplay = props.ratingCurrentDisplay;
  const setRatingCurrentDisplay = props.setRatingCurrentDisplay;
  const cutoffCurrentDisplay = props.cutoffCurrentDisplay;
  const setCutoffCurrentDisplay = props.setCutoffCurrentDisplay;
  const ratedCapacityDisplay = props.ratedCapacityDisplay;
  const setRatedCapacityDisplay = props.setRatedCapacityDisplay;
  const secondaryVoltageDisplay = props.secondaryVoltageDisplay;
  const setSecondaryDisplay = props.setSecondaryDisplay;
  const panelData = props.panelData;
  const setPanelData = props.setPanelData;
  const panelSelect = props.panelSelect;
  const setPanelSelect = props.setPanelSelect;
  const listPut = props.listPut;
  const setListPut = props.setListPut;
  const fileRef = props.fileRef;
  const savedFiles = props.savedFiles;
  const setSavedFiles = props.setSavedFiles;
  const curPos = props.curPos;
  const listSize = props.listSize;
  //
  const onChangePut = props.onChangePut;
  const onClickDeviceListChang = props.onClickDeviceListChang;
  const onClickDeveice = props.onClickDeveice;
  const panelSelectClick = props.panelSelectClick;
  const ratingVoltageDown = props.ratingVoltageDown;
  const ratingCurrentDown = props.ratingCurrentDown;
  const cutoffCurrentDown = props.cutoffCurrentDown;
  const secondaryVoltageDown = props.secondaryVoltageDown;
  const ratedCapacityDown = props.ratedCapacityDown;
  const handleFileUpload = props.handleFileUpload;
  const saveFileImage = props.saveFileImage;
  const onClickAttachFileDelete = props.onClickAttachFileDelete;
  const onClicFileDown = props.onClicFileDown;
  const listPutClose = props.listPutClose;
  const listPUtDone = props.listPUtDone;
 
*/