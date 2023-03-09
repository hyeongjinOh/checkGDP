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
import { loadingBoxState,  } from "../../../recoil/menuState";


// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"

/**
 * @brief EHP 사업장 전기실 관리 - 전기실 등록 컴포넌트 , 반응형 동작
 * @param -
 * @returns react components
 */

//component
function RoomInsert(props) {
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

  const [roomInfo, setRoomInfo] = useState({
    "isontree":false,
    "approval":0,
    "sort":0,
    "roomId":"",
    "roomName":"",
    "memo":"",
    "itemCount":0,
    //"managerInfo" :{"name":"", "telNo":""}
  });
  function callbackSetRoomInfoMemo(val) {
    setRoomInfo({...roomInfo, memo:val});
  }
  const [errorList, setErrorList] = useState([]);
  //const [roomName, setRoomName] = useState("");
  //const [managerInfo, setManagerInfo] = useState({ "id": "", "name": "", "telNo": "" });
  //const [memo, setMemo] = useState("");

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
        setParentIsMobile(true);
      } else {
        setParentIsMobile(false);
      }
    }
  }, []);
  useEffect(() => {
    setParentPopWin("pop-area-right-page-info",
      <MobileRoomInsert
        curTree={curTree}
        roomInfo={roomInfo}
        setRoomInfo={setRoomInfo}
        callbackSetRoomInfoMemo = {callbackSetRoomInfoMemo}
        // files
        fileRef = {fileRef}
        savedFiles = {savedFiles}
        handleFileUpload = {handleFileUpload}
        saveFileImage = {saveFileImage}
        onClickDelAddedFile = {onClickDelAddedFile}
        errorList={errorList}
        onClickDoSaveRoom={onClickDoSaveRoom}
        onClickCancel={onClickCancel}
      />
    )
  });


  // 첨부파일 저장
  const [savedFiles, setSavedFiles] = useState([]);
  function handleFileUpload(e) {
    fileRef.current.click();
  }
  function saveFileImage(e) {
    const files = e.target.files;
    var formData = new FormData();
    formData.append("files", files[0]);
    clog("ON saveFileImageOLD : " + files.length);

    var fileVal = {
      imageId: "INS_" + savedFiles.length,
      name: files[0].name,
      url: URL.createObjectURL(files[0]),
      type: "INS",
      fileForm: formData,
    }
    if( savedFiles.length <= 9 ) {
      setSavedFiles([...savedFiles, fileVal]);
      e.target.value = ''; // file name 초기화
    } else{
      alert("첨부파일은 10개 까지 가능합니다.");
    }
  };
  const [isTestOn, setIsTestOn] = useState(false);
  const [testList, setTestList] = useState("xxxxxxxx");
  const [testListX, setTestListX] = useState([]);

  function onClickListRefreshTest(e) {
    e.stopPropagation();
    e.preventDefault();
    let xList = testListX;
    clog("onClickListRefreshTest..........................." + JSON.stringify(xList));

    for (var i = 0; i < 4; i ++) {
      xList = xList.concat({"msg":`message_${testListX.length}_${i.toString()}`})
      //xList.push({"msg":`message_${testListX.length}_${i.toString()}`})
    }
    //var xList = [];
    //xList.push({"msg":`message_${testListX.length}`});
    
    setTestListX(xList);
    //setTestListX(testListX.concat({"msg":`message_${testListX.length}`}));
  }

  //const [fileLock, setFileLock] = useState(true);
  function saveFileImageMulti(e) {
    //setFileLock(false);
    const files = e.target.files;
    let fileList = savedFiles;
    clog("ON saveFileImage : " + files.length);

    for (var i = 0; i < files.length; i ++) {
      var addFile = files[i];
      var formData = new FormData();
      formData.append("files", addFile);

      var fileVal = {
        imageId: "INS_" + savedFiles.length,
        name: addFile.name,
        url: URL.createObjectURL(addFile),
        type: "INS",
        fileForm: formData,
      }
      if( savedFiles.length <= 9 ) {
        clog("ON saveFileImage : " + i);
        fileList = fileList.concat(fileVal);
        //fileList.push(fileVal);
        //setSavedFiles(savedFiles.concat(fileVal));
        //e.target.value = ''; // file name 초기화
      } else{
        alert("첨부파일은 10개 까지 가능합니다.");
        break;
      }
    }
    clog("save attach file : after : " + fileList.length + " : " + JSON.stringify(fileList));

    setSavedFiles(fileList);
    //setFileLock(true);

  };


  function onClickCancel(e) {
    setParentCurTree("SUBZONE",
      {
        ...curTree,
        room: { "roomId": "", "roomName": "" },
      }
    );
    setParentWorkMode("READ");
  }

  let uploadDoneList = [];
  function uploadFileHandler(roomInfo, uResult) {
    var uploadCount = savedFiles.filter(f=>f.type === "INS").length;
    uploadCount = uploadCount + savedFiles.filter(f=>f.type === "DEL").length;
    //
    if ( uResult !== null ) uploadDoneList.push(uResult);
    clog("CHECK COUNT : " + uploadCount + " : " + uploadDoneList.length);
    if ( uploadDoneList.length === uploadCount ) {
      setParentCurTree("ROOM", { ...curTree, room: { "roomId": roomInfo.roomId, "roomName": roomInfo.roomName },});
      setParentWorkMode("READ");
      setRecoilIsLoadingBox(false);
    }
  }

  async function onClickDoSaveRoom(e) {
    //clog("IN ROOMINSERT : onClickDoSaveRoom : " + JSON.stringify(managerInfo));
    setRecoilIsLoadingBox(true);
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "POST",
      "appPath": "/api/v2/product/company/zone/subzone/room",
      appQuery: {
        "subZoneId": curTree.subZone.subZoneId,
        "roomName": roomInfo.roomName,
        "memo": roomInfo.memo
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        //clog("IN ROOM-INSERT: onClickDoSaveRoom : " + JSON.stringify(data.body));
          (async () => { // IFFE(Immediately Invoked Function Expression)은 함수가 정의되자마자 실행되는 자바스크립트 기술입니다.
            if ( savedFiles.length <= 0 ) {
              uploadFileHandler(data.body, null);
            } else {
              savedFiles.map((file, idx) => {
                if (file.hasOwnProperty("type") && (file.type == "INS")) {
                  //saveAttachFile(data.body.roomId, file.fileForm);
                  saveAttachFile(data.body, file.fileForm, uploadFileHandler);
                }
              });
            }
          })();
          /*
        CUTIL.sleep(500);
        setParentCurTree("ROOM",
          {
            ...curTree,
            room: { "roomId": data.body.roomId, "roomName": data.body.roomName },
          }
        );
        setParentWorkMode("READ");
        */
      } else { // api if
        // need error handle
        setErrorList(data.body.errorList);
        setRecoilIsLoadingBox(false);        
      }
    }
    //setRecoilIsLoadingBox(false);
  }


  async function saveAttachFile(roomInfo, fileFormData, handlerFunc) {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "POST",
      "appPath": `/api/v2/product/company/zone/subzone/room/images?roomId=${roomInfo.roomId}`,
      appQuery: fileFormData,
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      handlerFunc(roomInfo, data);
      if (data.codeNum == CONST.API_200) {
        clog("IN CHECK ITEM LAST : saveFiles : " + JSON.stringify(data));
      } else { // api if
        // need error handle
      }
    }
    //return data;
  }
  /*
    async function deleteAttachFiles(imgId) {
      let data: any = null;
      data = await HttpUtil.PromiseHttp({
        "httpMethod": "DELETE",
        "appPath": "/api/v2/assessment/images",
        appQuery: {
          imageIds: imgId,
        },
        userToken: userInfo.loginInfo.token,
      });
      if (data) {
        if (data.codeNum == 200) {
          clog("IN CHECK ITEM LAST : saveFiles : " + JSON.stringify(data));
        } else { // api if
          // need error handle
        }
      }
      //return data;
    }
    */

  function onClickDelAddedFile(e, dfile) {
    setSavedFiles( //file.url is unique??
      savedFiles.filter((file) => (file.imageId !== dfile.imageId) && (file.name !== dfile.name))
    )
  }

  //clog("SAVED FILES : " + JSON.stringify(savedFiles));
  //clog("SAVED FILES : TESTLIST : " + JSON.stringify(testListX) + " : " + testList);

  return (
    <>
      {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)-->*/}
      {
        <div className="area__right" ref={mobileRef}>
          <ul className="page-loca">
            <li>{curTree.company.companyName}</li>
            <li>{curTree.zone.zoneName}</li>
            <li>{curTree.subZone.subZoneName}</li>
          </ul>
          <div className="page-top">
            <h2>전기실 추가</h2>
          </div>

          {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지&정보입력 workplace__info 클래스 추가, 정보페이지중 1뎁스 사업장&정보입력 일 경우 workplace__main 클래스 추가, 정보입력(신규등록)페이지 에서 info__input 클래스 추가-->*/}
          <div className="area__right_content workplace__info info__input">
            <div className="content__info h-auto">
              <h3 className="hide">전기실 추가 정보 입력</h3>
              <ul className="form__input">
               {/*  <li> 미기능 제거
                  <p className="tit">TREE</p>
                  <!--tree 가 on 일 경우 treeon / tree 가 off 일 경우 treeoff -->
                  <p className="txt treeon mt-5"><span className="hide">on</span></p>
                </li> */}
                <li>
                  <p className="tit star">전기실 명</p>
                  <div className="input__area">
                    <input type="text" id="inp1" placeholder="텍스트를 입력하세요"
                      className={(errorList.filter(err=>(err.field==="roomName")).length>0)?"input-error":""}
                      value={roomInfo.roomName}
                      onChange={(e)=>setRoomInfo({...roomInfo, roomName:e.target.value})}
                    />
                    <p className="input-errortxt">{errorList.filter(err=>(err.field==="roomName")).map((err)=>err.msg)}</p>
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
                      {savedFiles.map((sfile, idx) => (
                        <li key={`sfile_${idx.toString()}`}>
                          <span>{sfile.name}</span>
                          <button type="button" className="btn btn-delete" onClick={(e) => onClickDelAddedFile(e, sfile)}>
                            <span className="hide">삭제</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="txt-info mt-16 mb-0">* 첨부파일은 10개 이하, 전체 120M까지 가능합니다</p>
                  </div>
                </li>
                <li>
                  <p className="tit">메모</p>
                  <div className="input__area">
                    <textarea placeholder="메모를 입력하세요."
                        className={(errorList.filter(err=>(err.field==="memo")).length>0)?"input-error":""}
                        value={roomInfo.memo}
                        onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                        onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetRoomInfoMemo)}
                        onChange={(e) => setRoomInfo({...roomInfo, memo : e.target.value})}></textarea>
                    <p className="input-errortxt">{errorList.filter(err=>(err.field==="memo")).map((err)=>err.msg)}</p>                                    
                  </div>
                </li>
              </ul>
            </div>
            {/*<div>
              <ul>
              {testListX.map((test, idx)=>(
                <li key={`xxxxdiv_${idx.toString()}`}>{test.msg}</li>
              ))}
              </ul>
              </div>*/}
            <div className="btn__wrap">
              {/*<button type="button" onClick={(e) => onClickListRefreshTest(e)}><span>저장x</span></button>*/}

              <button type="button" className="bg-gray" onClick={(e) => onClickCancel(e)}><span>취소</span></button>
              <button type="button" onClick={(e) => onClickDoSaveRoom(e)}><span>저장</span></button>
            </div>
          </div>
          {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
        </div>
      }
      {/*<!--//area__right, 오른쪽 영역-->*/}
    </>
  )
};
export default RoomInsert;


function MobileRoomInsert(props) {
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
  //
  const errorList = props.errorList;
  const onClickDoSaveRoom = props.onClickDoSaveRoom;
  const onClickCancel = props.onClickCancel;



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
        <h2>전기실 추가</h2>
      </div>

      {/*<!--area__right_content, 오른쪽 컨텐츠 영역, 정보페이지&정보입력 workplace__info 클래스 추가, 정보페이지중 1뎁스 사업장&정보입력 일 경우 workplace__main 클래스 추가, 정보입력(신규등록)페이지 에서 info__input 클래스 추가-->*/}
      <div className="area__right_content workplace__info info__input">
        <div className="content__info">
          <h3 className="hide">전기실 추가 정보 입력</h3>
          <ul className="form__input">
            {/* <li>
              <p className="tit">TREE</p> */}
              {/*<!--tree 가 on 일 경우 treeon / tree 가 off 일 경우 treeoff -->*/}
              {/* <p className="txt treeon mt-5"><span className="hide">on</span></p>
            </li> */}
            <li>
              <p className="tit star">전기실 명</p>
              <div className="input__area">
                <input type="text" id="inp1" placeholder="텍스트를 입력하세요"
                  className={(errorList.filter(err=>(err.field==="roomName")).length>0)?"input-error":""}
                  value={roomInfo.roomName}
                  onChange={(e) =>setRoomInfo({...roomInfo, roomName : e.target.value})}
                />
                <p className="input-errortxt">{errorList.filter(err=>(err.field==="roomName")).map((err)=>err.msg)}</p>
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
                  {savedFiles.map((sfile, idx) => (
                    <li key={`sfile_${idx.toString()}`}>
                      <span>{sfile.name}</span>
                      <button type="button" className="btn btn-delete" onClick={(e) => onClickDelAddedFile(e, sfile)}>
                        <span className="hide">삭제</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="txt-info mt-16 mb-0">* 첨부파일은 10개 이하, 전체 120M까지 가능합니다</p>
              </div>
            </li>
            <li>
              <p className="tit">메모</p>
              <div className="input__area">
                <textarea placeholder="메모를 입력하세요."
                  className={(errorList.filter(err=>(err.field==="memo")).length>0)?"input-error":""}
                  value={roomInfo.memo}
                  onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                  onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetRoomInfoMemo)}
                  onChange={(e) => setRoomInfo({...roomInfo, memo : e.target.value})}></textarea>
                <p className="input-errortxt">{errorList.filter(err=>(err.field==="memo")).map((err)=>err.msg)}</p>                                    
              </div>
            </li>
          </ul>
        </div>
        <div className="btn__wrap">
          <button type="button" className="bg-gray" onClick={(e) => onClickCancel(e)}><span>취소</span></button>
          <button type="button" onClick={(e) => onClickDoSaveRoom(e)}><span>저장</span></button>
        </div>
      </div>
      {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
      {/*<!--//area__right, 오른쪽 영역-->*/}
    </div>
    </>

  )

}