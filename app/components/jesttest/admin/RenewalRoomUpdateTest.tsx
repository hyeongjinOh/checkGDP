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
import { loadingBoxState, } from "../../../recoil/menuState";


// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"
//component
function RoomUpdate(props) {
    //recoil
    const userInfo = useRecoilValue(userInfoLoginState);
    const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
    //props
    const curTree = props.curTree;
    const setParentIsMobile = props.setIsMobile;
    const setParentPopWin = props.setPopWin;
    const setParentCurTree = props.setCurTree;
    const setParentWorkMode = props.setWorkMode;
    //
    //화면 이동
    const navigate = useNavigate();
    //첨부 이미지 처리 ref
    const fileRef: any = useRef();
    //mobile check
    const mobileRef = useRef(null); // Mobile Check용
    // useEffect(() => { // resize handler
    //     function handleResize() {
    //         if (CUTIL.isnull(mobileRef)) return;
    //         const mobileTag = mobileRef.current;
    //         if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
    //             setParentIsMobile(true);
    //         } else {
    //             setParentIsMobile(false);
    //         }
    //     }
    //     window.addEventListener("resize", handleResize);
    //     return () => {
    //         window.removeEventListener('resize', handleResize);
    //     }
    // }, []);
    // useEffect(() => { // re-rendering mobile check
    //     if (CUTIL.isnull(mobileRef)) return;
    //     const mobileTag = mobileRef.current;
    //     if (!CUTIL.isnull(mobileTag)) {
    //         if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
    //             setParentIsMobile(true);
    //         } else {
    //             setParentIsMobile(false);
    //         }
    //     }
    // }, []);
    ////////////////////////////////////////////////////////////////////////////
    const [roomInfo, setRoomInfo] = useState({
        "isontree": false,
        "approval": 0,
        "sort": 0,
        "roomId": "",
        "roomName": "",
        "memo": "",
        "itemCount": 0,
    });
    const [savedFiles, setSavedFiles] = useState([]);
    function callbackSetRoomInfoMemo(val) {
        setRoomInfo({ ...roomInfo, memo: val });
    }
    const [errorList, setErrorList] = useState([]);

    // useEffect(() => {
    //     setParentPopWin("pop-area-right-page-info",
    //         <MobileRoomUpdate
    //             curTree={curTree}
    //             roomInfo={roomInfo}
    //             setRoomInfo={setRoomInfo}
    //             callbackSetRoomInfoMemo={callbackSetRoomInfoMemo}
    //             //files
    //             fileRef={fileRef}
    //             savedFiles={savedFiles}
    //             handleFileUpload={handleFileUpload}
    //             saveFileImage={saveFileImage}
    //             onClickDelAddedFile={onClickDelAddedFile}

    //             errorList={errorList}
    //             onClickDoUpdateRoom={onClickDoUpdateRoom}
    //             onClickDoCancelRoom={onClickDoCancelRoom}
    //         />
    //     )
    // }, [roomInfo, savedFiles]);



    const { data: retData, error, isLoading, reload, run, } = useAsync({
        promiseFn: HTTPUTIL.PromiseHttp,
        httpMethod: "GET",
        appPath: `/api/v2/product/company/zone/subzone/room/detail`,
        // appQuery: { roomId: curTree.room.roomId },
        // userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        // watch: curTree.room.roomId + curTree.reload
    });

    useEffect(() => {
        setRecoilIsLoadingBox(true);
        const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
        if (ERR_URL.length > 0) navigate(ERR_URL);

        if (retData) {
            if (retData.codeNum == CONST.API_200) {
                // saved files
                //clog("IN ROOM : RES : " + JSON.stringify(retData.body));
                /*
                setParentPopWin("pop-area-right-page-info",
                <MobileRoomUpdate
                  curTree={curTree}
                  roomInfo={retData.body}
                  setRoomInfo={setRoomInfo}
                  callbackSetRoomInfoMemo={callbackSetRoomInfoMemo}
                  //files
                  fileRef = {fileRef}
                  savedFiles = {retData.body.fileList}
                  //savedFiles = {savedFiles}
                  handleFileUpload = {handleFileUpload}
                  saveFileImage = {saveFileImage}
                  onClickDelAddedFile = {onClickDelAddedFile}
                
                  errorList={errorList}
                  onClickDoUpdateRoom={onClickDoUpdateRoom}
                  onClickDoCancelRoom={onClickDoCancelRoom}
                />
                )*/
                setSavedFiles(retData.body.fileList);
                setRoomInfo(retData.body);
            } else {
                setErrorList(retData.body.errorList);
            }
        }
        setRecoilIsLoadingBox(false);
    }, [curTree, retData]);
    //////////////////////////////////////////////////////////////////////////



    // 첨부파일 저장
    function handleFileUpload(e) {
        fileRef.current.click();
    }
    function saveFileImage(e) {
        clog("save attach file : " + JSON.stringify(e.target.files.length));
        const files = e.target.files;
        var formData = new FormData();
        formData.append("files", files[0]);
        var fileVal = {
            imageId: "INS_" + savedFiles.length,
            name: files[0].name,
            url: URL.createObjectURL(files[0]),
            type: "INS",
            fileForm: formData,
        }
        setSavedFiles([...savedFiles, fileVal]);

    };

    function onClickDoCancelRoom(e, room) {
        setParentCurTree("ROOM",
            {
                ...curTree,
                room: { "roomId": room.roomId, "roomName": room.roomName },
            }
        );
        setParentWorkMode("READ");
    }


    async function onClickDoUpdateRoom(e, roomInfo) {
        setRecoilIsLoadingBox(true);
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "PUT",
            "appPath": `/api/v2/product/company/zone/subzone/room/${roomInfo.roomId}`,
            appQuery: {
                //"subZoneId": curTree.subZone.subZoneId,
                "roomName": roomInfo.roomName,
                "memo": roomInfo.memo
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                clog("IN ROOM-INSERT: onClickDoUpdateRoom : " + JSON.stringify(data.body));
                (async () => { // IFFE(Immediately Invoked Function Expression)은 함수가 정의되자마자 실행되는 자바스크립트 기술입니다.
                    savedFiles.map((file, idx) => {
                        if (file.hasOwnProperty("type") && (file.type == "INS")) {
                            saveAttachFile(data.body.roomId, file.fileForm);
                        } else if (file.hasOwnProperty("type") && (file.type == "DEL")) {
                            deleteAttachFiles(file.imageId);
                        }

                        CUTIL.sleep(1000);
                    });
                })();
                setParentCurTree("ROOM",
                    {
                        ...curTree,
                        room: { "roomId": data.body.roomId, "roomName": data.body.roomName },
                    }
                );
                setParentWorkMode("READ");
            } else { // api if
                // need error handle
                setErrorList(data.body.errorList);
            }
        }
        //return data;
        setRecoilIsLoadingBox(false);
    }


    async function saveAttachFile(roomId, fileFormData) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "POST",
            "appPath": `/api/v2/product/company/zone/subzone/room/images?roomId=${roomId}`,
            appQuery: fileFormData,
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == CONST.API_200) {
                clog("IN CHECK ITEM LAST : saveFiles : " + JSON.stringify(data));

            } else { // api if
                // need error handle
            }
        }
        //return data;
    }

    async function deleteAttachFiles(imgId) {
        let data: any = null;
        data = await HTTPUTIL.PromiseHttp({
            "httpMethod": "DELETE",
            "appPath": "/api/v2/item/images",
            appQuery: {
                imageIds: imgId,
            },
            userToken: userInfo.loginInfo.token,
        });
        if (data) {
            if (data.codeNum == 200) {
                clog("IN ITEM IMAGE DELETE : deleteAttachFiles : " + JSON.stringify(data));
            } else { // api if
                // need error handle
            }
        }
        //return data;
    }

    function onClickDelAddedFile(e, delFile) {
        clog("onClickDelAddedFile : " + savedFiles.length + " / " + JSON.stringify(delFile));
        /*
        if (!delFile.hasOwnProperty("type")) {
          URL.revokeObjectURL(delFile.url);
          deleteAttachFiles(delFile.imageId);
        }
        */
        setSavedFiles( //file.url is unique??
            savedFiles.map((file) => ((file.imageId === delFile.imageId) && (file.name === delFile.name)) ? { ...file, type: "DEL" } : file)
        )
        //setSavedFiles([...savedFiles, ])

    }


    return (
        <>
            {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)-->*/}
            {
                <div className="area__right">
                    <ul className="page-loca">
                        <li>LS일렉트릭</li>
                        <li>안양</li>
                        <li>1공장</li>
                    </ul>
                    <div className="page-top">
                        <h2>전기실 수정</h2>
                    </div>

                    {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지&정보입력 workplace__info 클래스 추가, 정보페이지중 1뎁스 사업장&정보입력 일 경우 workplace__main 클래스 추가, 정보입력(신규등록)페이지 에서 info__input 클래스 추가-->*/}
                    <div className="area__right_content workplace__info info__input">
                        <div className="content__info">
                            <h3 className="hide">전기실 추가 정보 입력</h3>
                            <ul className="form__input">
                                <li>
                                    <p className="tit">TREE</p>
                                    {/*<!--tree 가 on 일 경우 treeon / tree 가 off 일 경우 treeoff -->*/}
                                    <p className={`txt treeon mt-5`}>
                                        <span className="hide">on</span>
                                    </p>
                                </li>
                                <li>
                                    <p className="tit star">전기실 명</p>
                                    <div className="input__area">
                                        <input type="text" id="inp1" placeholder="텍스트를 입력하세요"
                                            className={"input-error"}
                                            defaultValue={"전기실1"}
                                        /* onChange={(e) => setRoomInfo({ ...roomInfo, roomName: e.target.value })} */
                                        />
                                        <p className="input-errortxt"></p>
                                    </div>
                                </li>
                                <li>
                                    <p className="tit">전기실 도면</p>
                                    <div className="input__area">
                                        <div className="filebox">
                                            <input className="upload-name" value="" placeholder="디자인 도면을 첨부하세요" readOnly />
                                            <label onClick={(e) => handleFileUpload(e)}><span className="hide">파일찾기</span></label>
                                            {/* <input type="file" id="file"
                                                ref={fileRef}
                                                accept="image/jpg, image/jpeg, image/png"
                                                multiple style={{ display: "none" }}
                                                onChange={(e) => saveFileImage(e)} /> */}
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <p className="tit">메모</p>
                                    <div className="input__area">
                                        <textarea placeholder="메모를 입력하세요."
                                            className={"input-error"}
                                            defaultValue={""}
                                            onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                                            onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetRoomInfoMemo)}
                                        /* onChange={(e) => setRoomInfo({ ...roomInfo, memo: e.target.value })} */
                                        >
                                        </textarea>
                                        <p className="input-errortxt">{errorList.filter(err => (err.field === "memo")).map((err) => err.msg)}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="btn__wrap">
                            <button type="button" className="bg-gray"><span>취소</span></button>
                            <button type="button"><span>저장</span></button>
                        </div>
                    </div>
                    {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
                </div>
            }
            {/*<!--//area__right, 오른쪽 영역-->*/}
        </>
    )
};
export default RoomUpdate;


function MobileRoomUpdate(props) {
    const curTree = props.curTree;
    const roomInfo = props.roomInfo;
    const setRoomInfo = props.setRoomInfo;
    /*
    const roomName = props.roomName;
    const setRoomName = props.setRoomName;
    const managerInfo = props.managerInfo;
    const setManagerInfo = props.setManagerInfo;
    const memo = props.memo;
    const setMemo = props.setMemo;
    */
    const callbackSetRoomInfoMemo = props.callbackSetRoomInfoMemo;
    // files
    const fileRef = props.fileRef;
    const savedFiles = props.savedFiles;
    const handleFileUpload = props.handleFileUpload;
    const saveFileImage = props.saveFileImage;
    const onClickDelAddedFile = props.onClickDelAddedFile;

    const errorList = props.errorList;
    const onClickDoUpdateRoom = props.onClickDoUpdateRoom;
    const onClickDoCancelRoom = props.onClickDoCancelRoom;



    return (
        <>
            <div className="popup__body">
                {/*<!--area__right, 오른쪽 영역-->*/}
                <ul className="page-loca">
                    <li>{curTree.company.companyName}</li>
                    <li>{curTree.zone.zoneName}</li>
                    <li>{curTree.subZone.subZoneName}</li>
                </ul>
                <div className="page-top">
                    <h2>전기실 수정</h2>
                </div>

                {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지&정보입력 workplace__info 클래스 추가, 정보페이지중 1뎁스 사업장&정보입력 일 경우 workplace__main 클래스 추가, 정보입력(신규등록)페이지 에서 info__input 클래스 추가-->*/}
                <div className="area__right_content workplace__info info__input">
                    <div className="content__info">
                        <h3 className="hide">전기실 추가 정보 입력</h3>
                        <ul className="form__input">
                            <li>
                                <p className="tit">TREE</p>
                                {/*<!--tree 가 on 일 경우 treeon / tree 가 off 일 경우 treeoff -->*/}
                                <p className="txt treeon mt-5"><span className="hide">on</span></p>
                            </li>
                            <li>
                                <p className="tit star">전기실 명</p>
                                <div className="input__area">
                                    <input type="text" id="inp1" placeholder="텍스트를 입력하세요"
                                        className={(errorList.filter(err => (err.field === "roomName")).length > 0) ? "input-error" : ""}
                                        value={roomInfo.roomName}
                                        onChange={(e) => setRoomInfo({ ...roomInfo, roomName: e.target.value })}
                                    />
                                    <p className="input-errortxt">{errorList.filter(err => (err.field === "roomName")).map((err) => err.msg)}</p>
                                </div>
                            </li>
                            <li>
                                <p className="tit">전기실 도면</p>
                                <div className="input__area">
                                    <div className="filebox">
                                        <input className="upload-name" value="" placeholder="디자인 도면을 첨부하세요" readOnly />
                                        <label onClick={(e) => handleFileUpload(e)}><span className="hide">파일찾기</span></label>
                                        <input type="file" id="file"
                                            ref={fileRef}
                                            accept="image/jpg, image/jpeg, image/png"
                                            multiple style={{ display: "none" }}
                                            onChange={(e) => saveFileImage(e)} />
                                    </div>
                                    <ul className="filelist">
                                        {savedFiles.filter(sfile => sfile.type !== "DEL").map((sfile, idx) => (
                                            //{(roomInfo.fileList) && roomInfo.fileList.map((sfile, idx) => (
                                            <li key={`sfile_${idx.toString()}`}>
                                                <span>{sfile.name}</span>
                                                <button type="button" className="btn btn-delete" onClick={(e) => onClickDelAddedFile(e, sfile)}>
                                                    <span className="hide">삭제</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>
                            <li>
                                <p className="tit">메모</p>
                                <div className="input__area">
                                    <textarea placeholder="메모를 입력하세요."
                                        className={(errorList.filter(err => (err.field === "memo")).length > 0) ? "input-error" : ""}
                                        value={roomInfo.memo}
                                        onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                                        onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetRoomInfoMemo)}
                                        onChange={(e) => setRoomInfo({ ...roomInfo, memo: e.target.value })}></textarea>
                                    <p className="input-errortxt">{errorList.filter(err => (err.field === "memo")).map((err) => err.msg)}</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div className="btn__wrap">
                        <button type="button" className="bg-gray" onClick={(e) => onClickDoCancelRoom(e, roomInfo)}><span>취소</span></button>
                        <button type="button" onClick={(e) => onClickDoUpdateRoom(e, roomInfo)}><span>저장</span></button>
                    </div>
                </div>
                {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
                {/*<!--//area__right, 오른쪽 영역-->*/}
            </div>
        </>

    )

}