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
// img, css etc

// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"

//component
function ZoneInsert(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    //props
    const curTree = props.curTree;
    const setParentIsMobile = props.setIsMobile;
    const setParentWorkMode = props.setWorkMode;

    const setParentPopWin = props.setPopWin;
    const setParentCurTree = props.setCurTree;
    //
    const [zoneInfo, setZoneInfo] = useState(null);
    //첨부 이미지 처리 ref
    const fileRef: any = useRef();
    //mobile check
    const mobileRef = useRef(null); // Mobile Check용
    useEffect(() => { // resize handler
        function handleResize() {
            if (CUTIL.isnull(mobileRef)) return;
            const mobileTag = mobileRef.current;
            if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
                //  setParentIsMobile(true);
            } else {
                // setParentIsMobile(false);
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
                //  setParentIsMobile(true);
            } else {
                //  setParentIsMobile(false);
            }
        }
    }, []);
    useEffect(() => {
        // setParentPopWin("pop-area-rigth",
        //     <MobileZoneInsert
        //         htmlHeader={<h1>사업장 추가</h1>}
        //         companyName={companyName}
        //         setCompanyName={setCompanyName}
        //         zoneName={zoneName}
        //         setZoneName={setZoneName}
        //         zoneAddress={zoneAddress}
        //         setZoneAddress={setZoneAddress}
        //         zoneMemo={zoneMemo}
        //         setZoneMemo={setZoneMemo}
        //         //image
        //         fileRef={fileRef}
        //         savedFiles={savedFiles}
        //         handleFileUpload={handleFileUpload}
        //         saveFileImage={saveFileImage}
        //         //
        //         onClickZoneList={onClickZoneList}
        //         onClickCancel={onClickCancel}
        //         onClickSaveCompanyZone={onClickSaveCompanyZone}
        //     />
        // )
    });

    // 첨부파일 저장
    const [savedFiles, setSavedFiles] = useState(null);
    function handleFileUpload(e) {
        fileRef.current.click();
    }
    function saveFileImage(e) {
        clog("save attach file : " + JSON.stringify(e.target.files[0]));
        const formData = new FormData();
        formData.append("files", e.target.files[0]);
        var fileVal = {
            //imageId: "INS_" + savedFiles.length,
            name: "temp",
            url: URL.createObjectURL(e.target.files[0]),
            type: "INS",
            fileForm: formData,
        }
        //setSavedFiles([...savedFiles, fileVal]);
        setSavedFiles(fileVal);
    };

    function onClickZoneList(e) {
        setParentWorkMode("LIST");
    }
    const [companyName, setCompanyName] = useState("");
    const [zoneName, setZoneName] = useState("");
    const [zoneAddress, setZoneAddress] = useState("");
    const [zoneMemo, setZoneMemo] = useState("");

    function onClickCancel(e) {
        setParentCurTree("ZONE",
            {
                ...curTree,
                company: { "companyId": "", "companyName": "" },
                zone: { "zoneId": "", "zoneName": "" },
            }
        );
        setParentWorkMode("READ");

    }


    async function onClickSaveCompanyZone(e) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "POST",
            "appPath": `/api/v2/product/company/zone`,
            appQuery: {
                "companyId": companyName,
                "zoneName": zoneName,
                "address": zoneAddress,
                "memo": zoneMemo
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                clog("IN ZONE CREATE : " + JSON.stringify(data.body));
                if (savedFiles) {
                    saveAttachFiles(data.body.zoneId, savedFiles.fileForm);
                }
                setParentCurTree("ZONE",
                    {
                        ...curTree,
                        company: { "companyId": companyName, "companyName": companyName },
                        zone: { "zoneId": data.body.zoneId, "zoneName": data.body.zoneName },
                    }
                );
                setParentWorkMode("READ");


            } else { // api if
                // need error handle
            }
        }

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
            {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)-->*/}
            {
                <div className="area__right" ref={mobileRef}>
                    <h2>사업장 추가</h2>
                    {/*<!--사업장 추가내 검색,신규등록 탭-->*/}
                    <ul className="tab__small">
                        {/*<!-- 선택된 탭 on -->*/}
                        <li><a href="#" className="icon-search" onClick={(e) => onClickZoneList(e)}>검색</a></li>
                        <li className="on"><a href="#" className="icon-pen">신규등록</a></li>
                    </ul>

                    {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지&정보입력 workplace__info 클래스 추가, 정보페이지중 1뎁스 사업장&정보입력 일 경우 workplace__main 클래스 추가, 정보입력(신규등록)페이지 에서 info__input 클래스 추가-->*/}
                    <div className="area__right_content workplace__info workplace__main info__input">
                        <div className="content__info">
                            <h3 className="hide">사업장 추가 정보 입력</h3>
                            {/*<!-- 220805 사진첨부 보기 영역 수정 -->*/}
                            <div className="img_workplace">
                                <div className="btn-imgadd">
                                    {/*<label htmlFor="img" onClick={handleFileUpload}><span className="hide">사진첨부</span></label>*/}
                                    <label onClick={(e) => handleFileUpload(e)}><span className="hide">사진첨부</span></label>
                                    {/*<input type="file" id="img" name="bf_file[]" />*/}
                                    {/* 파일 업로드 intput tag : 퍼블 없음*/}
                                    <input type="file" id="img"
                                        ref={fileRef}
                                        accept="image/jpg, image/jpeg, image/png"
                                        multiple style={{ display: "none" }}
                                        onChange={(e) => saveFileImage(e)} />
                                </div>
                                <div id="image_preview">
                                    {/*<img src="./assets/img/img_workplace/bg_add.jpg" alt="사진영역" />*/}
                                    {(savedFiles)
                                        ? <img src={savedFiles.url} alt={savedFiles.name} />
                                        : <img style={{ background: 'url(./static/img/img_workplace/bg_add.jpg)' }} alt="사진영역" />
                                    }
                                </div>
                            </div>
                            <ul className="form__input">
                                <li>
                                    <p className="tit star">회사 명</p>
                                    <div className="input__area">
                                        <input type="text" id="inp1" placeholder="텍스트를 입력하세요"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                        />
                                    </div>
                                </li>
                                <li>
                                    <p className="tit star">사업장 명</p>
                                    <div className="input__area">
                                        <input type="text" id="inp2" placeholder="텍스트를 입력하세요"
                                            value={zoneName}
                                            onChange={(e) => setZoneName(e.target.value)}
                                        />
                                    </div>
                                </li>
                                <li>
                                    <p className="tit star">사업장 주소</p>
                                    <div className="input__area">
                                        <div className="box__search">
                                            <input type="text" placeholder="직접입력"
                                                value={zoneAddress}
                                                onChange={(e) => setZoneAddress(e.target.value)}
                                            />
                                            <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <p className="tit">메모</p>
                                    <div className="input__area">
                                        <textarea placeholder="메모를 입력하세요"
                                            value={zoneMemo}
                                            onChange={(e) => setZoneMemo(e.target.value)}
                                        ></textarea>
                                    </div>
                                </li>
                            </ul>
                            <ul className="info__admin form__input">
                                <li>
                                    <p className="tit">회사 URL</p>
                                    <div className="input__area">
                                        <input type="text" id="inp5" placeholder="URL을 입력하세요" />
                                    </div>
                                </li>
                                <li>
                                    <p className="tit">사업자등록번호</p>
                                    <div className="input__area">
                                        <input type="text" id="inp6" placeholder="텍스트를 입력하세요" />
                                    </div>
                                </li>
                                <li>
                                    <p className="tit">관리자<span>(Business Admin)</span></p>
                                    <div className="input__area">
                                        <div className="box__search">
                                            <input type="text" placeholder="직접입력" />
                                            <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <p className="tit">업종/업태</p>
                                    <div className="input__area">
                                        <input type="text" id="inp8" placeholder="텍스트를 입력하세요" />
                                    </div>
                                </li>
                                <li>
                                    <p className="tit">청구/정산 담당</p>
                                    <div className="input__area">
                                        <div className="box__search">
                                            <input type="text" placeholder="직접입력" />
                                            <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <p className="tit">청구/정산 담당<span>(Tel)</span></p>
                                    <div className="input__area">
                                        <input type="text" id="inp10" placeholder="텍스트를 입력하세요" />
                                    </div>
                                </li>
                                <li>
                                    <p className="tit">I/F Info</p>
                                    <div className="input__area">
                                        <input type="text" id="inp11" placeholder="텍스트를 입력하세요" />
                                    </div>
                                </li>
                                <li>
                                    <p className="tit">메모</p>
                                    <div className="input__area">
                                        <textarea placeholder="메모를 입력하세요"></textarea>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="btn__wrap">
                            <button type="button" className="bg-gray" onClick={(e) => onClickCancel(e)}><span>취소</span></button>
                            <button type="button" onClick={(e) => onClickSaveCompanyZone(e)}><span>저장</span></button>
                        </div>
                    </div>
                    {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
                </div>
            }
            {/*<!--//area__right, 오른쪽 영역-->*/}
        </>
    )
};
export default ZoneInsert;

function MobileZoneInsert(props) {
    const companyName = props.companyName;
    const setCompanyName = props.setCompanyName;
    const zoneName = props.zoneName;
    const setZoneName = props.setZoneName;
    const zoneAddress = props.zoneAddress;
    const setZoneAddress = props.setZoneAddress;
    const zoneMemo = props.zoneMemo;
    const setZoneMemo = props.setZoneMemo;
    //image
    const fileRef = props.fileRef;
    const savedFiles = props.savedFiles;
    const handleFileUpload = props.handleFileUpload;
    const saveFileImage = props.saveFileImage;

    const onClickZoneList = props.onClickZoneList;
    const onClickCancel = props.onClickCancel;
    const onClickSaveCompanyZone = props.onClickSaveCompanyZone;
    return (
        <>
            {/**mobile */}
            {/*<!-- 모바일 오른쪽 영역 area-right 팝업, 767이하에서는 팝업으로 노출 / 사업장 정보 페이지에서는 page-info 클래스 추가 -->*/}
            {
                <div className="popup__body">
                    {/*<!--area__right, 오른쪽 영역-->*/}
                    <div className="area__right" id="pop-area-right">
                        {/*<!--사업장 추가내 검색,신규등록 탭-->*/}
                        <ul className="tab__small">
                            {/*<!-- 선택된 탭 on -->*/}
                            <li><a className="icon-search" onClick={(e) => onClickZoneList(e)}>검색</a></li>
                            <li className="on"><a className="icon-pen">신규등록</a></li>
                        </ul>

                        {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지&정보입력 workplace__info 클래스 추가, 정보페이지중 1뎁스 사업장&정보입력 일 경우 workplace__main 클래스 추가, 정보입력(신규등록)페이지 에서 info__input 클래스 추가-->*/}
                        <div className="area__right_content workplace__info workplace__main info__input">
                            <div className="content__info">
                                <h3 className="hide">사업장 추가 정보 입력</h3>
                                <div className="img_workplace">
                                    <button type="button" className="btn-imgadd" onClick={(e) => handleFileUpload(e)}>
                                        <span className="hide">사진추가하기</span>
                                    </button>
                                    {/* 파일 업로드 intput tag : 퍼블 없음*/}
                                    <input type="file" id="img"
                                        ref={fileRef}
                                        accept="image/jpg, image/jpeg, image/png"
                                        multiple style={{ display: "none" }}
                                        onChange={(e) => saveFileImage(e)} />
                                    {(savedFiles)
                                        ? <img src={savedFiles.url} alt={savedFiles.name} />
                                        : <img style={{ background: 'url(./static/img/img_workplace/bg_add.jpg)' }} alt="사진영역" />
                                    }
                                </div>
                                <ul className="form__input">
                                    <li>
                                        <p className="tit star">회사 명</p>
                                        <div className="input__area">
                                            <input type="text" id="inp1" placeholder="텍스트를 입력하세요"
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                            />
                                        </div>
                                    </li>
                                    <li>
                                        <p className="tit star">사업장 명</p>
                                        <div className="input__area">
                                            <input type="text" id="inp2" placeholder="텍스트를 입력하세요"
                                                value={zoneName}
                                                onChange={(e) => setZoneName(e.target.value)}
                                            />
                                        </div>
                                    </li>
                                    <li>
                                        <p className="tit star">사업장 주소</p>
                                        <div className="input__area">
                                            <div className="box__search">
                                                <input type="text" placeholder="직접입력"
                                                    value={zoneAddress}
                                                    onChange={(e) => setZoneAddress(e.target.value)}
                                                />
                                                <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <p className="tit">메모</p>
                                        <div className="input__area">
                                            <textarea placeholder="메모를 입력하세요"
                                                value={zoneMemo}
                                                onChange={(e) => setZoneMemo(e.target.value)}
                                            ></textarea>
                                        </div>
                                    </li>
                                </ul>
                                <ul className="info__admin form__input">
                                    <li>
                                        <p className="tit">회사 URL</p>
                                        <div className="input__area">
                                            <input type="text" id="inp5" placeholder="URL을 입력하세요" />
                                        </div>
                                    </li>
                                    <li>
                                        <p className="tit">사업자등록번호</p>
                                        <div className="input__area">
                                            <input type="text" id="inp6" placeholder="텍스트를 입력하세요" />
                                        </div>
                                    </li>
                                    <li>
                                        <p className="tit">관리자<span>(Business Admin)</span></p>
                                        <div className="input__area">
                                            <div className="box__search">
                                                <input type="text" placeholder="직접입력" />
                                                <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <p className="tit">업종/업태</p>
                                        <div className="input__area">
                                            <input type="text" id="inp8" placeholder="텍스트를 입력하세요" />
                                        </div>
                                    </li>
                                    <li>
                                        <p className="tit">청구/정산 담당</p>
                                        <div className="input__area">
                                            <div className="box__search">
                                                <input type="text" placeholder="직접입력" />
                                                <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <p className="tit">청구/정산 담당<span>(Tel)</span></p>
                                        <div className="input__area">
                                            <input type="text" id="inp10" placeholder="텍스트를 입력하세요" />
                                        </div>
                                    </li>
                                    <li>
                                        <p className="tit">I/F Info</p>
                                        <div className="input__area">
                                            <input type="text" id="inp11" placeholder="텍스트를 입력하세요" />
                                        </div>
                                    </li>
                                    <li>
                                        <p className="tit">메모</p>
                                        <div className="input__area">
                                            <textarea placeholder="메모를 입력하세요"></textarea>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                            <div className="btn__wrap center">
                                <button type="button" className="bg-gray" onClick={(e) => onClickCancel(e)}><span>취소</span></button>
                                <button type="button" onClick={(e) => onClickSaveCompanyZone(e)}><span>저장</span></button>
                            </div>
                        </div>
                        {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
                    </div>
                    {/*<!--//area__right, 오른쪽 영역-->*/}
                </div>
            }
        </>

    )

}