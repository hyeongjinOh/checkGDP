/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author HyeongJin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-10-12
 * @brief EHP ManageMent - userManageMent 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
//
import { useAsync } from "react-async";
// recoil && state
import { useRecoilValue, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
//
import * as HTTPUTIL from "../../../utils/api/HttpUtil";
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const"
import { useNavigate } from "react-router-dom";
//
import EhpDtlPostCode from "../../common/postcode/EhpDtlPostCode";
//datepicker
import DatePicker from "react-datepicker";
import dayjs from "dayjs";
//datepicker 디자인 - 없으면 깨짐
import "react-datepicker/dist/react-datepicker.css";
//datepocker 언어
//import { ko } from "date-fns/esm/locale";
/**
/**
 * @brief EHP Service - 점검출동 요청 개발 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */

function RequestInspection(props) {
    // recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //화면 이동
    const navigate = useNavigate();
    //props
    const setParentPopWin = props.setPopWin;
    const requestCode = props.requestCode;
    //
    const [comanyTypeItem] = useState([
        { id: 0, fname: "사용자", },
        { id: 1, fname: "설치업체", },
        { id: 2, fname: "유지보수업체", },
        { id: 3, fname: "기타", },

    ]);
    //  

    const [regionItem, setRegionItem] = useState([]);
    const [maincategoryItem, setMaincategoryItem] = useState([]);
    const [middlecategoryItem, setMiddlecategoryItem] = useState([]);
    const [subcategoryItem, setSubcategoryItem] = useState([]);
    const [devicekindItem, setDevicekindItem] = useState([]);
    const [fgkindItem, setFgkindItem] = useState([]);
    const [mailReceiptSel, setMailReceiptSel] = useState("true");
    const [isPopupPostCode, setIsPopupPostCode] = useState(false);

    const [addressInfo, setAddressInfo] = useState({
        "zonecode": "",
        "address": "",
        "deladdress": ""
    });
    const [errorList, setErrorList] = useState([])
    const [maincategory, setMaincategory] = useState(null);
    const [middlecategory, setMiddlecategory] = useState(null);
    const [subcategory, setSubcategory] = useState("");
    const [devicekind, setDevicekind] = useState("");
    const [modelName, setModelName] = useState("");
    const [serialNo, setSerialNo] = useState("");
    const [content, setContent] = useState("")
    const [comanyType, setCompanyType] = useState("")
    const [region, setRegion] = useState("");
    const [fgkind, setFgkind] = useState("");
    const [buyDate, setBuyDate] = useState(null);
    const mailReceipt = (mailReceiptSel == "true") ? true : false;
    const [savedFiles, setSavedFiles] = useState([]);

    const [curPos] = useState(0);
    const [listSize] = useState(10);
    const fileRef: any = useRef();

    const [success, setSuccess] = useState("");

    const [middlecategoryChang, setMiddlecategoryChang] = useState(false);
    const [subcategoryChang, setSubcategoryChang] = useState(false);
    const [devicekindChang, setDevicekindChang] = useState(false);

    const modelNameRef = useRef(null);
    const serialNoRef = useRef(null);
    const buyDateRef = useRef(null);
    const contentRef = useRef(null);


    // 고객 유형
    function companyTypeSel(val) {
        setCompanyType(val.fname);
    }

    // 지역 선택 API
    async function regionSel(e) {
        CUTIL.onClickSelect(e, CUTIL.selectOption)
        let data: any = {};
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "GET",
            appPath: `/api/v2/customerserviceapply/code/regions`,
            // appQuery: {},
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setRegionItem(data.body)

            }
        }
    }
    // 지역 선택 - select
    function regionSelect(region) {
        setRegion(region.code);
    }
    // 주소찾기 초기화
    function callbackSetSubZoneInfoAddress(val) {
        setAddressInfo(val);
    }

    // useEffect(() => {
    //     setParentPopWin("pop-dtlpostcode",
    //         <EhpDtlPostCode
    //             isPopup={isPopupPostCode}
    //             setIsPopup={setIsPopupPostCode}
    //             setAddress={callbackSetSubZoneInfoAddress}
    //         />
    //     )
    // });
    // 주소 팝업
    function onClickPostCode(e) {
        setIsPopupPostCode(true);
        CUTIL.jsopen_Popup(e);
    }

    // 제품 대분류  API
    async function maincategorySel(e) {
        CUTIL.onClickSelect(e, CUTIL.selectOption)
        let data: any = {};
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "GET",
            appPath: `/api/v2/customerserviceapply/code/categories`,
            appQuery: {
                category: "대분류",
                // parentCode: "",

            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setMaincategoryItem(data.body);
                setMiddlecategoryChang(true)
                setSubcategoryChang(true);
                setDevicekindChang(true);
            }
        }
    }

    // 제품 대분류 - select
    function maincategorySelect(category) {
        setErrorList(
            errorList.filter((err) => (err.field !== "catCode"))
        )

        setMiddlecategoryChang(false)
        setSubcategoryChang(false);
        setDevicekindChang(false);
        setMaincategory(category);

        // document.getElementById("middelcategory").click();


    }

    // 제품 중분류  API
    async function middlecategorySel(e) {
        CUTIL.onClickSelect(e, CUTIL.selectOption)
        let data: any = {};
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "GET",
            appPath: `/api/v2/customerserviceapply/code/categories`,
            appQuery: {
                category: "중분류",
                parentCode: maincategory.code,

            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setMiddlecategoryItem(data.body);
                setSubcategoryChang(true);
                setDevicekindChang(true);
            }
        }
    }

    // 제품 중분류 - select
    function middlecategorySelect(category) {
        setErrorList(
            errorList.filter((err) => (err.field !== "catCode"))
        )
        setSubcategoryChang(false);
        setDevicekindChang(false);
        setMiddlecategory(category);

    }

    // 제품 소분류  API
    async function subcategorySel(e) {
        CUTIL.onClickSelect(e, CUTIL.selectOption)
        let data: any = {};
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "GET",
            appPath: `/api/v2/customerserviceapply/code/categories`,
            appQuery: {
                category: "소분류",
                parentCode: middlecategory.code,

            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setSubcategoryItem(data.body);

            }
        }
    }

    // 제품 소분류 - select
    function subcategorySelect(category) {
        setErrorList(
            errorList.filter((err) => (err.field !== "catCode"))
        )
        setSubcategory(category.code);
    }

    // 제품 기기 분류  API
    async function devicekindSel(e) {
        CUTIL.onClickSelect(e, CUTIL.selectOption)
        let data: any = {};
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "GET",
            appPath: `/api/v2/customerserviceapply/code/devicekinds`,
            appQuery: {
                // category: "소분류",
                catMedium: middlecategory.code,

            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setDevicekindItem(data.body);

            }
        }
    }

    // 제품 기기분류 - select
    function devicekindSelect(category) {
        setErrorList(
            errorList.filter((err) => (err.field !== "catCode"))
        )
        setDevicekind(category.deviceKind);
    }


    //고장 유형 API 
    async function fgkindsSel(e) {
        CUTIL.onClickSelect(e, CUTIL.selectOption)
        let data: any = {};
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "GET",
            appPath: `/api/v2/customerserviceapply/code/fgkinds`,
            // appQuery: {},
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                setFgkindItem(data.body);

            }
        }
    }

    // 고장 유형 - select
    function fgkindsSelect(fgkind) {

        setFgkind(fgkind.code);
    }

    // 모델 
    function handleSetPModelName(e) {
        setErrorList(
            errorList.filter((err) => (err.field !== "modelName"))
        )
        setModelName(e.target.value);
    }
    // 시리얼
    function handleSetSeralNo(e) {
        setErrorList(
            errorList.filter((err) => (err.field !== "serialNo"))
        )
        setSerialNo(e.target.value);
    }
    // 구입(설치)년월
    function handleSetBuyDate(data) {
        setErrorList(
            errorList.filter((err) => (err.field !== "buyDate"))
        )
        setBuyDate(data);
    }
    //고장 내용
    function handleContent(e) {
        setErrorList(
            errorList.filter((err) => (err.field !== "content"))
        )

        setContent(e.target.value);
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
        if (savedFiles.length <= 1) {
            setSavedFiles([...savedFiles, fileVal]);
        } else {
            // alert("이미지는 최대 2장 까지 가능합니다.");
        }
    };
    // 이미지 삭제
    function onClickAttachFileDelete(delFile) {
        //var delFile = savedFiles[idx];
        if (!delFile.hasOwnProperty("type")) {
            URL.revokeObjectURL(delFile.url);
        }
        setSavedFiles(savedFiles.filter(file => file.imageId !== delFile.imageId));
    }
    //동의
    function handleMailReceiptSel(e) {

        setMailReceiptSel(e.target.value)
    }

    // 요청 팝업
    // useEffect(() => {
    //     setParentPopWin("pop-small",
    //         <RequestDoenPop
    //             htmlHeader={<h1>{(success) ? "저장" : "출동점검 요청"}</h1>}
    //             success={success}
    //             requestSaved={requestSaved}
    //             requestDone={requestDone}
    //         />
    //     )
    // })
    // 미동의
    // function disagreePop(e) {
    //     setParentPopWin("pop-small",
    //         <DisagreePop
    //             htmlHeader={<h1>에러</h1>}
    //             success={success}
    //             requestSaved={requestSaved}
    //             requestDone={requestDone}
    //         />
    //     )
    //     CUTIL.jsopen_Popup(e)
    // }

    // 요청 점검  API
    async function requestSaved(e) {

        var date = new Date()
        var regDate = dayjs(date).format("YYYY-MM-DDTHH:mm:ss[Z]")
        var buyData = (buyDate == null) ? null : dayjs(buyDate).format("YYYY-MM-DDTHH:mm:ss[Z]")
        let data: any = {};
        data = await HTTPUTIL.PromiseHttp({
            httpMethod: "POST",
            appPath: `/api/v2/customerserviceapply`,
            appQuery: {
                name: userInfo.userName,
                email: userInfo.userId,
                hp: userInfo.phoneNumber,
                company: userInfo.companyName,
                companyType: comanyType,
                zip: addressInfo.zonecode,
                addr1: addressInfo.address,
                addr2: addressInfo.deladdress,
                region: region,
                catCode: subcategory,
                modelName: modelName,
                serialNo: serialNo,
                deviceKind: devicekind,
                buyDate: buyData,
                fgKind: fgkind,
                content: content,
                // filename1: ,
                // filename2: , 
                regDate: regDate,
                /*       nation: ,
                      applyType: ,
                      agentCheck: ,
                      agentCompany: ,
                      agentName: ,
                      agentTel: ,
                      agentEtc: , */
                mailReceipt: mailReceipt

            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {

                if (savedFiles.length == 0) {
                    setSuccess(data.data.msg)

                } else {
                    savedFiles.map((file, idx) => {

                        if (file.hasOwnProperty("type") && (file.type == "INS")) {
                            saveFiles(data.body.customerServiceId, file.fileForm);
                        }
                    });
                    setSuccess(data.data.msg)


                }
            } else {

                setErrorList((data.errorList == null) ? [] : data.errorList);
                var btnCommentClose = document.getElementById("pop-small");
                var body = document.body
                var dimm = body.querySelector(".dimm");

                if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
                if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
                if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");

            }
        }

    }


    useEffect(() => {
        if (errorList.length > 0) {
            if (errorList.filter(err => (err.field === "catCode")).length > 0 || errorList.filter(err => (err.field === "modelName")).length > 0) {
                modelNameRef.current.focus();
            } else if (errorList.filter(err => (err.field === "serialNo")).length > 0) {
                serialNoRef.current.focus();
            } else if (errorList.filter(err => (err.field === "buyDate")).length > 0) {
                serialNoRef.current.focus();
            } else if (errorList.filter(err => (err.field === "content")).length > 0) {
                contentRef.current.focus();
            }
        }
    }, [errorList])

    async function saveFiles(customerServiceId, fileFormData) {

        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "POST",
            "appPath": `/api/v2/customerserviceapply/files?customerServiceId=${customerServiceId}`,
            appQuery: fileFormData,
            userToken: userInfo.loginInfo.token,
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

    function requestDone(e) {

        window.location.reload();
    }



    return (
        <>
            <div className="box__header">
                <h2>점검출동 요청</h2>
                <p className="box__title">LS ELECTRIC 제품에 대한 점검출동 서비스 신청 창구입니다.</p>
                <ul className="box__info">
                    <li>제품정보, 기술자료 다운로드, 기술상담, 구입문의 등의 문의 사항은 LS Electric 홈페이지 또는 1544-2080 기술상담센터를 이용하여 주시기 바랍니다.</li>
                    <li>서비스 신청 내용은 접수 후, 점검출동 현황에서 확인 가능하며 고객님에게 메일 또는 전화로 연락 드리겠습니다.</li>
                    <li>유,무상서비스는 당사 서비스 처리 기준에 의하여 처리하고 있습니다.</li>
                    <li>정상적인 사용상태에서 제품보증기간 이내에 고장이 발생한 경우는 무상 서비스 제공합니다.</li>
                    <li>소비자의 과실, 천재지변 등으로 고장이 발생한 경우에는 유상 수리(출장비, 기술료, 점검료 지급)를 받아야 합니다.</li>
                </ul>
            </div>
            <div className="box__body">
                <div className="info__input">
                    <div className="page-top">
                        <h3>1. 신청인 정보</h3>
                    </div>
                    <div className="content__info">
                        <ul className="form__input">
                            <li>
                                <p className="tit">이름</p>
                                <div className="input__area">
                                    <input readOnly type="text" value={userInfo.userName} disabled />
                                </div>
                            </li>
                            <li>
                                <p className="tit">E-MAIL</p>
                                <div className="input__area">
                                    <input readOnly type="text" value={userInfo.userId} disabled />
                                </div>
                            </li>
                            <li>
                                <p className="tit">연락처</p>
                                <div className="input__area">
                                    <input readOnly type="text" value={userInfo.phoneNumber} disabled />
                                </div>
                            </li>
                            <li>
                                <p className="tit">고객업체명</p>
                                <div className="input__area">
                                    <input readOnly type="text" value={userInfo.companyName} disabled />
                                </div>
                            </li>
                            <li>
                                <p className="tit">고객 유형</p>
                                <div className="input__area">
                                    <div className="select" onClick={(e) => CUTIL.onClickSelect(e, CUTIL.selectOption)}>
                                        <div className="selected">
                                            <div className="selected-value">선택</div>
                                            <div className="arrow"></div>
                                        </div>
                                        <ul>
                                            {(comanyTypeItem) && comanyTypeItem.map((type) => (
                                                <li key={type.id} className="option" onClick={(e) => companyTypeSel(type)}>{type.fname}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <p className="tit">문의지역</p>
                                <div className="input__area">
                                    <div className="select" onClick={(e) => regionSel(e)}>
                                        <div className="selected">
                                            <div className="selected-value">선택</div>
                                            <div className="arrow"></div>
                                        </div>
                                        <ul>
                                            {(regionItem) && regionItem.map((region, idx) => (
                                                <li key={"region" + idx.toString()} className="option" onClick={(e) => regionSelect(region)}>{region.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <p className="tit">주소</p>
                                <div className="input__area">
                                    <ul className="input__address">
                                        <li>
                                            <div className="box__search">
                                                <input readOnly type="text" value={addressInfo.zonecode} disabled />
                                                <button type="button" className="btn btn-search" data-pop="pop-dtlpostcode" onClick={(e) => onClickPostCode(e)}><span className="hide">조회</span></button>
                                            </div>
                                        </li>
                                        <li>
                                            <input readOnly type="text" id="inp2" value={addressInfo.address} disabled />
                                        </li>
                                        <li>
                                            <input readOnly type="text" id="inp3" value={addressInfo.deladdress} disabled />
                                        </li>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="info__input">
                    <div className="page-top">
                        <h3>
                            <span>2. 제품 고장 내용</span>
                            <span className="txt-info"><span className="txt-red mr-4">*</span>필수 입력 사항</span>
                        </h3>
                    </div>
                    <div className="content__info">
                        <ul className="form__input">
                            <li>
                                <p className="tit star">제품분류</p>
                                <div className="input__area">
                                    <div className={`select ${(errorList.filter(err => (err.field === "catCode")).length > 0) && " input-error"}`} onClick={(e) => maincategorySel(e)}>
                                        <div className="selected">
                                            <div className="selected-value">대분류</div>
                                            <div className="arrow"></div>
                                        </div>
                                        <ul >
                                            {maincategoryItem.map((category, idx) => (
                                                <li key={"maincategory" + idx.toString()} className="option" onClick={(e) => maincategorySelect(category)}>{category.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    {(!middlecategoryChang) ?
                                        <div className={`select ${(errorList.filter(err => (err.field === "catCode")).length > 0) && " input-error"}`} onClick={(e) => (maincategory) && middlecategorySel(e)}>
                                            <div className="selected">
                                                <div className="selected-value">중분류</div>
                                                <div className="arrow"></div>
                                            </div>
                                            <ul>
                                                {middlecategoryItem.map((category, idx) => (
                                                    <li key={"middelcategory" + idx.toString()} className="option" onClick={(e) => middlecategorySelect(category)}>{category.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        :
                                        <div className={`select ${(errorList.filter(err => (err.field === "catCode")).length > 0) && " input-error"}`} onClick={(e) => (maincategory) && middlecategorySel(e)}>
                                            <div className="selected">
                                                <div className="selected-value">중분류 </div>
                                                <div className="arrow"></div>
                                            </div>
                                            <ul>
                                                {middlecategoryItem.map((category, idx) => (
                                                    <li key={"middelcategory" + idx.toString()} className="option" onClick={(e) => middlecategorySelect(category)}>{category.name}</li>
                                                ))}
                                            </ul>

                                        </div>
                                    }
                                    {(!subcategoryChang) ?
                                        <div className={`select ${(errorList.filter(err => (err.field === "catCode")).length > 0) && " input-error"}`} onClick={(e) => (middlecategory) && subcategorySel(e)}>
                                            <div className="selected">
                                                <div className="selected-value">소분류</div>
                                                <div className="arrow"></div>
                                            </div>
                                            <ul>
                                                {subcategoryItem.map((category, idx) => (
                                                    <li key={"subcategory" + idx.toString()} className="option" onClick={(e) => subcategorySelect(category)}>{category.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        :
                                        <div className={`select ${(errorList.filter(err => (err.field === "catCode")).length > 0) && " input-error"}`} onClick={(e) => (middlecategory) && subcategorySel(e)}>
                                            <div className="selected">
                                                <div className="selected-value">소분류 </div>
                                                <div className="arrow"></div>
                                            </div>
                                            <ul>
                                                {subcategoryItem.map((category, idx) => (
                                                    <li key={"subcategory" + idx.toString()} className="option" onClick={(e) => subcategorySelect(category)}>{category.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    }
                                    {(!devicekindChang) ?
                                        <div className={`select ${(errorList.filter(err => (err.field === "catCode")).length > 0) && " input-error"}`} onClick={(e) => (middlecategory) && devicekindSel(e)}>
                                            <div className="selected">
                                                <div className="selected-value">선택</div>
                                                <div className="arrow"></div>
                                            </div>
                                            <ul>
                                                {devicekindItem.map((devicekind, idx) => (
                                                    <li key={"devicekind" + idx.toString()} className="option" onClick={(e) => devicekindSelect(devicekind)}>{devicekind.deviceName}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        :
                                        <div className={`select ${(errorList.filter(err => (err.field === "catCode")).length > 0) && " input-error"}`} onClick={(e) => (middlecategory) && devicekindSel(e)}>
                                            <div className="selected">
                                                <div className="selected-value">선택 </div>
                                                <div className="arrow"></div>
                                            </div>
                                            <ul>
                                                {devicekindItem.map((devicekind, idx) => (
                                                    <li key={"devicekind" + idx.toString()} className="option" onClick={(e) => devicekindSelect(devicekind)}>{devicekind.deviceName}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    }
                                </div>
                            </li>
                            <li>
                                <p className="tit star">모델명</p>
                                <div className="input__area">
                                    <input type="text"
                                        data-testid="modelName"
                                        className={`select ${(errorList.filter(err => (err.field === "modelName")).length > 0) && " input-error"}`}
                                        ref={modelNameRef} value={modelName} onChange={(e) => handleSetPModelName(e)}
                                        placeholder="텍스트를 입력하세요." /* */ />
                                    <p className="input-errortxt">{errorList.filter(err => (err.field === "modelName")).map((err) => err.msg)}</p>
                                </div>
                            </li>
                            <li>
                                <p className="tit star">시리얼 번호</p>
                                <div className="input__area">
                                    <input type="text" className={`select ${(errorList.filter(err => (err.field === "serialNo")).length > 0) && " input-error"}`}
                                        ref={serialNoRef} value={serialNo} onChange={(e) => handleSetSeralNo(e)}
                                        placeholder="텍스트를 입력하세요." />
                                    <p className="input-errortxt">{errorList.filter(err => (err.field === "serialNo")).map((err) => err.msg)}</p>
                                </div>
                            </li>
                            <li>
                                <p className="tit star">구입(설치)년월</p>
                                <div className="input__area">
                                    <div className="searchterm">
                                        <div className="term__date w100p">
                                            <DatePicker
                                                // id="dp655863510467"
                                                // className="calendar"
                                                autoComplete="off"
                                                //locale={ko}
                                                todayButton="today"
                                                dateFormat="yyyy-MM-dd"
                                                selected={buyDate}
                                                onChange={(date) => handleSetBuyDate(date)}
                                                className={`calendar end w100p ${(errorList.filter(err => (err.field === "buyDate")).length > 0) && " input-error"}`}
                                            />
                                            {/* <input readOnly type="text" className="calendar end w100p input-error" autoComplete="off" /> */}
                                        </div>
                                    </div>
                                    <p className="txt-info mt-8 txt-red">품질보증기간은 ‘홈페이지-제품보증기간’에 의해 정해지며 해당기간 경과 시 비용이 발생할 수 있습니다.</p>
                                </div>
                            </li>
                            <li>
                                <p className="tit">고장유형</p>
                                <div className="input__area">
                                    <div className="select" onClick={(e) => fgkindsSel(e)}>
                                        <div className="selected">
                                            <div className="selected-value">선택</div>
                                            <div className="arrow"></div>
                                        </div>
                                        <ul>
                                            {(fgkindItem) && fgkindItem.map((fgkind) => (
                                                <li key={fgkind.code} className="option" onClick={(e) => fgkindsSelect(fgkind)}>{fgkind.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <p className="tit star d-sm-none">고장내용(실제증상)<br />및 요청사항</p>
                                <p className="tit star d-sm-block">고장내용(실제증상) 및 요청사항</p>
                                <div className="input__area">
                                    <textarea ref={contentRef} className={`h130 ${(errorList.filter((err) => (err.field === "content")).length > 0) && "input-error"} `} placeholder="텍스트를 입력하세요." value={content} onChange={(e) => handleContent(e)}></textarea>
                                    <p className="input-errortxt top-148">{errorList.filter(err => (err.field === "content")).map((err) => err.msg)}</p>
                                </div>
                            </li>
                            <li>
                                <p className="tit">첨부파일</p>
                                <div className="input__area">
                                    <div className="filebox">
                                        <input readOnly className="upload-name" placeholder="사진을 첨부하세요" />
                                        <label onClick={(e) => handleFileUpload(e)}><span className="hide">파일찾기</span></label>
                                        <input ref={fileRef} type="file" id="file"
                                            accept="image/jpg, image/jpeg, image/png" onChange={(e) => saveFileImage(e)} />
                                    </div>
                                    <ul className="filelist">
                                        {savedFiles.filter((file, idx) => (idx >= curPos) && ((idx < curPos + listSize))).map((img) => (
                                            <li key={img.imageId}>
                                                <span>{img.name}</span>
                                                <button type="button" className="btn btn-delete" onClick={(e) => onClickAttachFileDelete(img)}>
                                                    <span className="hide" >삭제</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="txt-info mt-16 mb-0">첨부파일은 최대 10MB까지 가능합니다.</p>
                                    <p className="txt-info">첨부파일은 JPG/GIF 이미지파일과 압축파일(zip, rar, arj)로 첨부해주시기 바랍니다.</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="info__input">
                    <div className="page-top">
                        <h3>
                            <span className="star">동의</span>
                            <span className="txt-info"><span className="txt-red mr-4">*</span>필수 입력 사항</span>
                        </h3>
                    </div>
                    <div className="content__info">
                        <ul className="form__input">
                            <li className="column">
                                <p className="tit mt-0">'개인정보 처리 방침' 공지 및 '개인정보 처리 방침' 에 동의하십니까?</p>
                                <div className="input__area">
                                    <ul className="terms">
                                        <li className="mb-0">
                                            <div className="box-scroll">
                                                <p className="txt">
                                                    [개인정보 처리방침 개요]
                                                    <br /><br />
                                                    LS ELECTRIC은 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 준수하여야 할 관련 법규상의 개인정보보호규정을 준수하며, 개인정보보호법 제30조, 정보통신망이용촉진 및 정보보호에 관한 법률 제27조의2에 따라 고객의 개인정보 보호 및 권익을 보호하고
                                                    개인정보와 관련한 고객의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 제정하고 이를 준수하고 있습니다.
                                                    <br /><br />
                                                    - LS ELECTRIC은 개인정보처리방침을 LS ELECTRIC 홈페이지(http://www.ls-electric.com)
                                                </p>
                                            </div>
                                        </li>
                                        <li>
                                            <div className="input__area mt-8 txt-right">
                                                <div className="radioBox">
                                                    <label htmlFor="rd1"><input type="radio" id="rd1" name="rd" value={"true"} checked={(mailReceiptSel == "true") ? true : false} onChange={(e) => handleMailReceiptSel(e)} />동의</label>
                                                    <label htmlFor="rd2"><input type="radio" id="rd2" name="rd" value={"false"} checked={(mailReceiptSel == "false") ? true : false} onChange={(e) => handleMailReceiptSel(e)} />동의하지 않습니다.</label>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </li>
                            <li className="mt-80">
                                <div className="btn__wrap right w100p">
                                    {/* <button type="button" className="bg-gray js-open" data-pop="pop-cancel"><span>취소</span></button> */}
                                    {/* <button type="button" className=" js-open" data-pop="pop-small" onClick={(e) => CUTIL.jsopen_Popup(e)}><span data-pop="pop-small">요청</span></button> */}
                                    <button type="button" className=" js-open" data-testid="requestButton" data-pop="pop-small"><span data-pop="pop-small">요청</span></button>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <ul className="box__info nobg mt-90 d-sm-block">
                    <li>제품정보, 기술자료 다운로드, 기술상담, 구입문의 등의 문의 사항은 LS Electric 홈페이지 또는 1544-2080 기술상담센터를 이용하여 주시기 바랍니다.</li>
                    <li>서비스 신청 내용은 접수 후, 점검출동 현황에서 확인 가능하며 고객님에게 메일 또는 전화로 연락 드리겠습니다.</li>
                    <li>유,무상서비스는 당사 서비스 처리 기준에 의하여 처리하고 있습니다.</li>
                    <li>정상적인 사용상태에서 제품보증기간 이내에 고장이 발생한 경우는 무상 서비스 제공합니다.</li>
                    <li>소비자의 과실, 천재지변 등으로 고장이 발생한 경우에는 유상 수리(출장비, 기술료, 점검료 지급)를 받아야 합니다.</li>
                </ul>
            </div>
        </>
    )
}

export default RequestInspection;


function RequestDoenPop(props) {
    // recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props

    const success = props.success;
    const requestSaved = props.requestSaved;
    const requestDone = props.requestDone;




    return (
        <>
            <div className="popup__body">
                <p>{(success) ? "저장 되었습니다." : "점검출동요청을 하시겠습니까?"}</p>
            </div>
            <div className="popup__footer">
                {(!success) &&
                    <button type="button" className="bg-gray js-close" onClick={(e) => close(e)}><span>취소</span></button>
                }
                {(!success) ?
                    <button type="button" onClick={(e) => requestSaved(e)}><span>확인</span></button>
                    :
                    <button type="button" onClick={(e) => requestDone(e)}><span>확인</span></button>
                }
            </div>
        </>
    )
}
function DisagreePop(props) {
    // recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props

    const success = props.success;
    const requestSaved = props.requestSaved;
    const requestDone = props.requestDone;




    return (
        <>
            <div className="popup__body">
                <p>개인정보 처리 방침을 동의 후 요청 하세요</p>
            </div>
            <div className="popup__footer">

                <button type="button" onClick={(e) => close(e)}><span>확인</span></button>
            </div>
        </>
    )
}
function close(e) {
    var btnCommentClose = document.getElementById("pop-small");
    var body = document.body
    var dimm = body.querySelector(".dimm");

    if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
    if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;");
    if (!CUTIL.isnull(dimm)) dimm.setAttribute("style", "display: none; z-index: 11;");


}