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
import { userInfoLoginState } from "../../../recoil/userState";
import { loadingBoxState, } from "../../../recoil/menuState";
import { langState, getApiLangState } from "../../../recoil/langState";
// img, css etc
// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"
// components
import EhpImageCrop from "../../common/imagecrop/EhpImageCrop";
import AutoComplete from "../../common/autocomplete/AutoComplete";

//component
function ZoneInsert(props) {
    //recoil
    const apiLang = useRecoilValue(getApiLangState);
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    //props
    const curTree = props.curTree;
    const setParentIsMobile = props.setIsMobile;
    const setParentWorkMode = props.setWorkMode;
    const setParentPopWin = props.setPopWin;
    const setParentCurTree = props.setCurTree;
    //
    //첨부 이미지 처리 ref
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
                // setParentIsMobile(true);
            } else {
                // setParentIsMobile(false);
            }
        }
    }, []);

    /// company list
    const [companyList, setCompanyList] = useState([]);
    const { data: retList, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/product/companies`,
        appQuery: {},
        language: apiLang,
        userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        watch: ""
    });

    useEffect(() => {
        if (retList) {
            if (retList.codeNum == CONST.API_200) {
                clog("IN COMPANY LIST : RES : " + JSON.stringify(retList.data.page));
                setCompanyList(
                    retList.body.map((comp) => ({ ...comp, "autofield": comp.companyName }))
                );
            }
        }
    }, [retList])
    const [companyName, setCompanyName] = useState("");
    const [autoCompanyInfo, setAutoCompanyInfo] = useState(null);
    /*{"companyId":"LS일렉트릭","companyName":"LS일렉트릭","url":"http://test.test.com","businessNo":"1214512345","administrator":"tester","classification":"영업부","accountManager":"tester","accMngrTelephone":"01011111111","interfaceInfo":"string","memo":"string"}*/
    const [companyInfo, setCompanyInfo] = useState({
        "companyId": "",
        "companyName": "",
        "url": "",
        "businessNo": "",
        "administrator": "",
        "classification": "",
        "accountManager": "",
        "accMngrTelephone": "",
        "interfaceInfo": "",
        "memo": ""
    });
    const [zoneInfo, setZoneInfo] = useState({
        "zoneName": "",
        "address": "",
        "memo": ""
    });
    // comment 길이 제한 콜백 함수
    function callbackSetZoneInfoMemo(val) {
        setZoneInfo({ ...zoneInfo, memo: val });
    }

    const [errorList, setErrorList] = useState([]);
    // called by AutoComplete
    async function handleSetAutoComplete(autoInfo) {
        if (CUTIL.isnull(autoInfo)) return;
        setAutoCompanyInfo(autoInfo);
        setRecoilIsLoadingBox(true);
        const data = await HTTPUTIL.PromiseHttp({
            httpMethod: "GET",
            appPath: `/api/v2/product/company/${autoInfo.companyId}`,
            appQuery: {},
            userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
            watch: autoInfo.companyId
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                clog("COMP INFO : " + JSON.stringify(data.body));
                setErrorList([]);
                setCompanyInfo(data.body);
            } else { // api if need error handle
                setErrorList(data.body.errorList);
            }
        }
        setRecoilIsLoadingBox(false);
    }

    function onClickZoneList(e) {
        setParentWorkMode("LIST");
    }
    function onClickCancel(e) {
        setParentCurTree("ZONE",
            {
                ...curTree,
                company: { "companyId": "", "companyName": "" },
                zone: { "zoneId": "", "zoneName": "" },
            }
        );
        setParentWorkMode("LIST");
    }

    const [selectedFiles, setSelectedFiles] = useState(null);
    const [cropedImage, setCropedImage] = useState(null);

    /* useEffect(() => {
        setParentPopWin("pop-imgcrop",
            <EhpImageCrop
                cropImage={selectedFiles}
                setCropedImage={handleSetCropedImage}
            />
        );
    }, [selectedFiles]); */ // selected files이 변경될때마다...이미지 반영을 위해

    /* useEffect(() => {
        setParentPopWin("pop-area-rigth",
            <MobileZoneInsert
                htmlHeader={<h1>사업장 추가</h1>}
                companyName={companyName}
                setCompanyName={setCompanyName}
                zoneInfo={zoneInfo}
                setZoneInfo={setZoneInfo}
                callbackSetZoneInfoMemo={callbackSetZoneInfoMemo}
                errorList={errorList}
                //autocomplete
                companyList={companyList}
                autoCompanyInfo={autoCompanyInfo}
                handleSetAutoComplete={handleSetAutoComplete}
                companyInfo={companyInfo}
                //image
                fileRef={fileRef}
                cropedImage={cropedImage}
                onClickFileAdd={onClickFileAdd}
                onChangeFileSelected={onChangeFileSelected}
                //action button
                onClickZoneList={onClickZoneList}
                onClickCancel={onClickCancel}
                onClickSaveCompanyZone={onClickSaveCompanyZone}
            />
        )
    }); */

    // 로컬 파일 URL을 통해 파일 객체 데이터 화
    function handleSetCropedImage(cropVal) {
        clog("save croped file : " + JSON.stringify(cropVal));
        //var imgDataUrl = sigCanvas.toDataURL('image/png');
        var binaryData = atob(cropVal.url.split(',')[1]);
        var array = [];

        for (var i = 0; i < binaryData.length; i++) {
            array.push(binaryData.charCodeAt(i));
        }

        var file = new File([new Uint8Array(array)], cropVal.name, { type: 'image/png' });
        const formData = new FormData();
        formData.append("files", file);
        var fileVal = {
            fileId: "INS_0",//(savedFiles)?savedFiles.length:0,
            name: file.name,
            url: URL.createObjectURL(file),
            type: "INS",
            fileForm: formData,
        }
        setCropedImage(fileVal);
    };

    // 파일 선택창 업로드
    function onClickFileAdd(e) {
        clog("onClickFileAdd : " + "");
        fileRef.current.value = "";
        fileRef.current.setAttribute("data-pop", "pop-imgcrop"); // data-pop 사라지는 듯....
        fileRef.current.click();
    }
    // 파일 선택창에서 파일 선택시, 처리 기능
    function onChangeFileSelected(e) {
        clog("save attach file : " + JSON.stringify(e.target.files[0]));
        const files = e.target.files;
        const formData = new FormData();
        formData.append("files", files[0]);
        var fileVal = {
            fileId: "INS_0",//(savedFiles)?savedFiles.length:0,
            name: files[0].name,
            url: URL.createObjectURL(files[0]),
            type: "INS",
            fileForm: formData,
        }
        setSelectedFiles(fileVal);
        // pop-up 오픈
        CUTIL.jsopen_Popup(e);
    };


    async function onClickSaveCompanyZone(e) {
        let data: any = null;
        setRecoilIsLoadingBox(true);
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "POST",
            "appPath": `/api/v2/product/company/zone`,
            appQuery: {
                "companyId": companyInfo.companyId,
                "zoneName": zoneInfo.zoneName,
                "address": zoneInfo.address,
                "memo": zoneInfo.memo
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                clog("IN ZONE CREATE : " + JSON.stringify(data.body));
                if (cropedImage) {
                    saveAttachFiles(data.body.zoneId, cropedImage.fileForm);
                }
                setParentCurTree("ZONE",
                    {
                        ...curTree,
                        company: { "companyId": companyInfo.companyId, "companyName": companyInfo.companyName },
                        zone: { "zoneId": data.body.zoneId, "zoneName": data.body.zoneName },
                    }
                );
                setParentWorkMode("READ");
            } else { // api if
                // need error handle
                setErrorList(data.body.errorList);
            }
        }
        setRecoilIsLoadingBox(false);
    }

    async function saveAttachFiles(zoneId, fileFormData) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "POST",
            "appPath": `/api/v2/product/company/zone/images?zoneId=${zoneId}`,
            appQuery: fileFormData,
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                clog("IN ZONE CREATE : saveFiles : " + JSON.stringify(data));
            } else { // api if
                // need error handle
            }
        }
        //return data;
    }



    return (
        <>
            {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)*/}
            <div className="area__right" ref={mobileRef}>
                <h2>사업장 추가</h2>
                {/*<!--사업장 추가내 검색,신규등록 탭*/}
                <ul className="tab__small">
                    {/*<!-- 선택된 탭 on -->*/}
                    <li><a href="#" className="icon-search" onClick={(e) => onClickZoneList(e)}>검색</a></li>
                    <li className="on"><a href="#" className="icon-pen">신규등록</a></li>
                </ul>

                {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지&정보입력 workplace__info 클래스 추가, 정보페이지중 1뎁스 사업장&정보입력 일 경우 workplace__main 클래스 추가, 정보입력(신규등록)페이지 에서 info__input 클래스 추가*/}
                {/*<!--220826 오른쪽 영역 전체 수정, 클래스 newtype 추가*/}
                <div className="area__right_content workplace__info workplace__main info__input newtype">
                    {/*<!--입력상단*/}
                    <div className="content__info">
                        <h3 className="hide">사업장 추가 정보 입력</h3>
                        <ul className="form__input">
                            <li>
                                <p className="tit star">회사 명</p>
                                {/*<!-- autocomplete 작동하면 input__area에 autocomplete 클래스 추가 + ul 노출 (공통 동일함) */}
                                <div className="input__area">
                                    <input type="text" id="inp4"
                                        className={(errorList.filter(err => (err.field === "companyId")).length > 0) ? "input-error" : ""}
                                        placeholder="클릭하여 입력해주세요"
                                        value={(companyName.length > 0) ? companyName : (autoCompanyInfo) ? autoCompanyInfo.companyName : ""}
                                        onChange={(e) => setCompanyName(e.target.value)} />
                                    <p className="input-errortxt">{errorList.filter(err => (err.field === "companyId")).map((err) => err.msg)}</p>
                                    <AutoComplete
                                        workList={companyList}
                                        setAutoInfo={handleSetAutoComplete}
                                        setKeyword={setCompanyName}
                                        keyword={companyName}
                                    />
                                </div>
                                <p className="txt-info ml-24 mt-10">* e-Health Portal 에 등록된 회사만 추가가 가능합니다. 목록에 없는 경우 관리자에게 문의주세요.</p>
                            </li>
                            <li>
                                <p className="tit">회사 URL</p>
                                <div className="input__area">
                                    <input type="text" id="inp5" value={companyInfo.url} disabled />
                                </div>
                            </li>
                            <li>
                                <p className="tit">사업자등록번호</p>
                                <div className="input__area">
                                    <input type="text" id="inp6" value={companyInfo.businessNo} disabled />
                                </div>
                            </li>
                        </ul>
                    </div>
                    {/*<!--입력하단(라인아래)*/}
                    <div className="content__info">
                        <div className="column">
                            <h3>사업장 정보 입력</h3>
                            <div className="flex-row">
                                <div className="img_workplace">
                                    <div className="btn-imgadd">
                                        <label onClick={(e) => onClickFileAdd(e)}>
                                            <span className="hide">사진첨부</span>
                                        </label>
                                        <input type="file" id="img"
                                            ref={fileRef}
                                            accept="image/jpg, image/jpeg, image/png"
                                            multiple style={{ display: "none" }}
                                            onChange={(e) => onChangeFileSelected(e)}
                                        />
                                    </div>
                                    {/*   <div id="image_preview">
                                        {(cropedImage)
                                            ? <img src={cropedImage.url} alt={cropedImage.name} />
                                            : <img src={require("/static/img/img_workplace/bg_add.jpg")} alt="사진영역" />
                                        }
                                    </div> */}
                                </div>
                                <ul className="form__input ml-40">
                                    <li>
                                        <p className="tit star">사업장 명</p>
                                        <div className="input__area">
                                            <input type="text" id="inp2" placeholder="텍스트를 입력하세요"
                                                className={(errorList.filter(err => (err.field === "zoneName")).length > 0) ? "input-error" : ""}
                                                value={zoneInfo.zoneName}
                                                onChange={(e) => setZoneInfo({ ...zoneInfo, zoneName: e.target.value })}
                                            />
                                            <p className="input-errortxt">{errorList.filter(err => (err.field === "zoneName")).map((err) => err.msg)}</p>
                                        </div>
                                    </li>
                                    <li>
                                        <p className="tit star">사업장 주소</p>
                                        <div className="input__area">
                                            <input type="text" id="inp2" placeholder="직접입력"
                                                className={(errorList.filter(err => (err.field === "address")).length > 0) ? "input-error" : ""}
                                                value={zoneInfo.address}
                                                onChange={(e) => setZoneInfo({ ...zoneInfo, address: e.target.value })}
                                            />
                                            <p className="input-errortxt">{errorList.filter(err => (err.field === "address")).map((err) => err.msg)}</p>
                                            {/*<div className="box__search">
                     <input type="text" placeholder="직접입력" />
                     <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
                   </div>*/}
                                        </div>
                                    </li>
                                    <li>
                                        <p className="tit">메모</p>
                                        <div className="input__area">
                                            <textarea placeholder="메모를 입력하세요."
                                                className={(errorList.filter(err => (err.field === "memo")).length > 0) ? "input-error" : ""}
                                                value={zoneInfo.memo}
                                                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 10)}
                                                onKeyUp={(e) => CUTIL.afterHandleComment(e, 10, callbackSetZoneInfoMemo)}
                                                onChange={(e) => setZoneInfo({ ...zoneInfo, memo: e.target.value })}></textarea>
                                            <p className="input-errortxt">{errorList.filter(err => (err.field === "memo")).map((err) => err.msg)}</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="btn__wrap center">
                                <button type="button" className="add__item"><span>사업장 추가</span></button>
                            </div>
                            <div className="btn__wrap">
                                <button type="button" className="js-open" data-pop="pop-workplace"
                                    onClick={(e) => onClickSaveCompanyZone(e)}
                                >
                                    <span>추가 요청</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/*<!--//area__right_content, 오른쪽 컨텐츠 영역*/}
            </div>
            {/*<!--//area__right, 오른쪽 영역*/}
        </>
    )
};
export default ZoneInsert;


function MobileZoneInsert(props) {
    const companyName = props.companyName;
    const setCompanyName = props.setCompanyName;
    const zoneInfo = props.zoneInfo;
    const setZoneInfo = props.setZoneInfo;
    const callbackSetZoneInfoMemo = props.callbackSetZoneInfoMemo;
    const errorList = props.errorList;
    //autocomplete
    const companyList = props.companyList;
    const autoCompanyInfo = props.autoCompanyInfo;
    const handleSetAutoComplete = props.handleSetAutoComplete;
    const companyInfo = props.companyInfo;
    //new image
    const fileRef = props.fileRef;
    const cropedImage = props.cropedImage;
    const onClickFileAdd = props.onClickFileAdd;
    const onChangeFileSelected = props.onChangeFileSelected;
    //
    const onClickZoneList = props.onClickZoneList;
    const onClickCancel = props.onClickCancel;
    const onClickSaveCompanyZone = props.onClickSaveCompanyZone;

    return (
        <>
            <div className="popup__body">
                {/*<!--area__right, 오른쪽 영역*/}
                <div className="area__right" id="pop-area-right">
                    {/*<!--사업장 추가내 검색,신규등록 탭-->*/}
                    <ul className="tab__small">
                        {/*<!-- 선택된 탭 on -->*/}
                        <li><a className="icon-search" onClick={(e) => onClickZoneList(e)}>검색</a></li>
                        <li className="on"><a className="icon-pen">신규등록</a></li>
                    </ul>
                    {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지&정보입력 workplace__info 클래스 추가, 정보페이지중 1뎁스 사업장&정보입력 일 경우 workplace__main 클래스 추가, 정보입력(신규등록)페이지 에서 info__input 클래스 추가*/}
                    {/*<!--220826 오른쪽 영역 전체 수정, 클래스 newtype 추가*/}
                    <div className="area__right_content workplace__info workplace__main info__input newtype">
                        {/*<!--입력상단*/}
                        <div className="content__info">
                            <h3 className="hide">사업장 추가 정보 입력</h3>
                            <ul className="form__input">
                                <li>
                                    <p className="tit star">회사 명</p>
                                    <div className="input__area">
                                        <input type="text" id="inp4"
                                            className={(errorList.filter(err => (err.field === "companyId")).length > 0) ? "input-error" : ""}
                                            placeholder="클릭하여 입력해주세요"
                                            value={(companyName.length > 0) ? companyName : (autoCompanyInfo) ? autoCompanyInfo.companyName : ""}
                                            onChange={(e) => setCompanyName(e.target.value)} />
                                        <p className="input-errortxt">{errorList.filter(err => (err.field === "companyId")).map((err) => err.msg)}</p>
                                        <AutoComplete
                                            workList={companyList}
                                            setAutoInfo={handleSetAutoComplete}
                                            setKeyword={setCompanyName}
                                            keyword={companyName}
                                        />
                                    </div>
                                    <p className="txt-info ml-24 mt-10">* e-Health Portal 에 등록된 회사만 추가가 가능합니다. 목록에 없는 경우 관리자에게 문의주세요.</p>
                                </li>
                                <li>
                                    <p className="tit">회사 URL</p>
                                    <div className="input__area">
                                        <input type="text" id="inp5" value={companyInfo.url} disabled />
                                    </div>
                                </li>
                                <li>
                                    <p className="tit">사업자등록번호</p>
                                    <div className="input__area">
                                        <input type="text" id="inp6" value={companyInfo.businessNo} disabled />
                                    </div>
                                </li>
                            </ul>
                        </div>
                        {/*<!--입력하단(라인아래)*/}
                        <div className="content__info">
                            <div className="column">
                                <h3>사업장 정보 입력</h3>
                                <div className="flex-row">
                                    <div className="img_workplace">
                                        <div className="btn-imgadd">
                                            <label onClick={(e) => onClickFileAdd(e)}>
                                                <span className="hide">사진첨부</span>
                                            </label>
                                            <input type="file" id="img"
                                                ref={fileRef}
                                                accept="image/jpg, image/jpeg, image/png"
                                                multiple style={{ display: "none" }}
                                                onChange={(e) => onChangeFileSelected(e)}
                                            />
                                        </div>
                                        <div id="image_preview">
                                            {(cropedImage)
                                                ? <img src={cropedImage.url} alt={cropedImage.name} />
                                                : <img src={require("/static/img/img_workplace/bg_add.jpg")} alt="사진영역" />
                                            }
                                        </div>
                                    </div>
                                    <ul className="form__input ml-40">
                                        <li>
                                            <p className="tit star">사업장 명</p>
                                            <div className="input__area">
                                                <input type="text" id="inp2" placeholder="텍스트를 입력하세요"
                                                    className={(errorList.filter(err => (err.field === "zoneName")).length > 0) ? "input-error" : ""}
                                                    value={zoneInfo.zoneName}
                                                    onChange={(e) => setZoneInfo({ ...zoneInfo, zoneName: e.target.value })}
                                                />
                                                <p className="input-errortxt">{errorList.filter(err => (err.field === "zoneName")).map((err) => err.msg)}</p>
                                            </div>
                                        </li>
                                        <li>
                                            <p className="tit star">사업장 주소</p>
                                            <div className="input__area">
                                                <input type="text" id="inp2" placeholder="직접입력"
                                                    className={(errorList.filter(err => (err.field === "address")).length > 0) ? "input-error" : ""}
                                                    value={zoneInfo.address}
                                                    onChange={(e) => setZoneInfo({ ...zoneInfo, address: e.target.value })}
                                                />
                                                <p className="input-errortxt">{errorList.filter(err => (err.field === "address")).map((err) => err.msg)}</p>
                                            </div>
                                        </li>
                                        <li>
                                            <p className="tit">메모</p>
                                            <div className="input__area">
                                                <textarea placeholder="메모를 입력하세요."
                                                    className={(errorList.filter(err => (err.field === "memo")).length > 0) ? "input-error" : ""}
                                                    value={zoneInfo.memo}
                                                    onKeyPress={(e) => CUTIL.beforeHandleComment(e, 10)}
                                                    onKeyUp={(e) => CUTIL.afterHandleComment(e, 10, callbackSetZoneInfoMemo)}
                                                    onChange={(e) => setZoneInfo({ ...zoneInfo, memo: e.target.value })}></textarea>
                                                <p className="input-errortxt">{errorList.filter(err => (err.field === "memo")).map((err) => err.msg)}</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                                <div className="btn__wrap center">
                                    <button type="button" className="add__item"><span>사업장 추가</span></button>
                                </div>
                                <div className="btn__wrap">
                                    <button type="button"><span>추가 요청</span></button>
                                </div>
                            </div>
                        </div>
                        <div className="btn__wrap center">
                            <button type="button" className="bg-gray js-close"
                                onClick={(e) => onClickCancel(e)}><span>취소</span></button>
                            <button type="button"
                                onClick={(e) => onClickSaveCompanyZone(e)}
                            >
                                <span>저장</span>
                            </button>
                        </div>
                    </div>
                    {/*<!--//area__right_content, 오른쪽 컨텐츠 영역*/}
                </div>
                {/*<!--//area__right, 오른쪽 영역*/}
            </div>
        </>
    )

}