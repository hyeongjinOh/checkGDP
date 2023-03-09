/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author HyeongJin O
 * @contact hjoh@detech.co.kr
 * @date 2022-08-15
 * @brief EHP 기기등록 관리 - 개별 등록 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../recoil/userState";
import { loadingBoxState, } from "../../../recoil/menuState";

// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"
//
import $ from "jquery";
import { useTrans } from "../../../utils/langs/useTrans";

/**
 * @brief EHP 기기등록 관리 - 개별 등록 컴포넌트 , 반응형 동작
 * @param -
 * @returns react components
 */

//component
function DeviceInsert(props) {
  //trans
  const t = useTrans();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);

  //props
  const isMobile = props.isMobile
  const curTree = props.curTree;
  const setParentIsMobile = props.setIsMobile;
  const setParentPopWin = props.setPopWin;
  const setParentCurTree = props.setCurTree;
  const setParentWorkMode = props.setWorkMode;
  const restart = props.restart;
  const setRestart = props.setRestart;
  //
  //spg 선택 
  const [device, setdevice] = useState([]);
  //
  const [resErrorCode, setResErrorCode] = useState(200);
  const [resErrorMsg, setResErrorMsg] = useState([{ field: "", msg: "" }]);
  const [errorList, setErrorList] = useState([]);


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
  const fileRef: any = useRef();
  const [savedFiles, setSavedFiles] = useState([]);
  const [curPos] = useState(0);
  const [listSize] = useState(10);

  const captureRef = useRef(null); // CapturePop pop Check용
  const [isCapturePop, setIsCapturePop] = useState(false);
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
      // 캡쳐 popup check......
      if (CUTIL.isnull(captureRef)) return;
      const captureTag = captureRef.current;
      if (!CUTIL.isnull(captureTag)) {
        if ((captureTag.clientHeight <= 0) && (captureTag.clientWidth <= 0)) {
          setIsCapturePop(true);
        } else {
          setIsCapturePop(false);
        }
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
  //
  useEffect(() => { // 캡처 box popup check
    if (CUTIL.isnull(captureRef)) return;
    const captureTag = captureRef.current;
    if (!CUTIL.isnull(captureTag)) {
      if ((captureTag.clientHeight <= 0) && (captureTag.clientWidth <= 0)) {
        setIsCapturePop(true);
      } else {
        setIsCapturePop(false);
      }
    }
  }, []);
  function closePop(e) {

    CUTIL.jsclose_Popup("pop-deviceadd");
    setParentWorkMode("LIST");

  }

  useEffect(() => {
    setParentPopWin("pop-deviceadd",
      <MobileDeviceInsert
        htmlHeader={<h1>{curTree.room.roomName}</h1>}
        htmlHeaderBtn={<button className="btn btn-close js-close" onClick={(e) => closePop(e)}><span className="hide">닫기</span></button>}
        isMobile={isMobile}
        curTree={curTree}
        //
        device={device}
        spgSels={spgSels}
        //
        spgName={spgName}
        setSpgName={setSpgName}
        panelName={panelName}
        modelName={modelName}
        serialNo={serialNo}
        ratingVoltage={ratingVoltage}
        ratingCurrent={ratingCurrent}
        cutoffCurrent={cutoffCurrent}
        ratedCapacity={ratedCapacity}
        secondaryVoltage={secondaryVoltage}
        memo={memo}
        setMemo={setMemo}
        setRatingVoltage={setRatingVoltage}
        setRatingCurrent={setRatingCurrent}
        setCutoffCurrent={setCutoffCurrent}
        setRatedCapacity={setRatedCapacity}
        setSecondaryVoltage={setSecondaryVoltage}
        manufacturer={manufacturer}
        setManufacturer={setManufacturer}
        //
        elecinfo={elecinfo}
        setElecinfo={setElecinfo}
        panelData={panelData}
        setPanelData={setPanelData}
        panelSelect={panelSelect}
        setPanelSelect={setPanelSelect}
        fileRef={fileRef}
        savedFiles={savedFiles}
        setSavedFiles={setSavedFiles}
        curPos={curPos}
        listSize={listSize}
        //
        errorList={errorList}
        //
        ratingVoltageDisplay={ratingVoltageDisplay}
        setRatingVoltageDisplay={setRatingVoltageDisplay}
        ratingCurrentDisplay={ratingCurrentDisplay}
        setRatingCurrentDisplay={setRatingCurrentDisplay}
        cutoffCurrentDisplay={cutoffCurrentDisplay}
        setCutoffCurrentDisplay={setCutoffCurrentDisplay}
        ratedCapacityDisplay={ratedCapacityDisplay}
        setRatedCapacityDisplay={setRatedCapacityDisplay}
        secondaryVoltageDisplay={secondaryVoltageDisplay}
        setSecondaryDisplay={setSecondaryDisplay}
        //
        ratingVoltageDown={ratingVoltageDown}
        ratingCurrentDown={ratingCurrentDown}
        cutoffCurrentDown={cutoffCurrentDown}
        secondaryVoltageDown={secondaryVoltageDown}
        ratedCapacityDown={ratedCapacityDown}

        //
        onClickDeveice={onClickDeveice}
        handlePanelName={handlePanelName}
        handleModelName={handleModelName}
        handleSerialNo={handleSerialNo}
        handleRatingVoltage={handleRatingVoltage}
        handleRatingCurrent={handleRatingCurrent}
        handleCutoffCurrent={handleCutoffCurrent}
        handleratedCapacity={handleratedCapacity}
        handleSecondaryVoltage={handleSecondaryVoltage}

        panelSelectClick={panelSelectClick}
        handleFileUpload={handleFileUpload}
        saveFileImage={saveFileImage}
        onClickAttachFileDelete={onClickAttachFileDelete}
        onClickclose={onClickclose}
        onClickSaved={onClickSaved}

      />
    )
  });

  // spg API
  async function spgSels(e) {
    CUTIL.onClickSelect(e, CUTIL.selectOption);
    let data: any = [];
    data = await HTTPUTIL.PromiseHttp({
      httpMethod: "GET",
      appPath: "/api/v2/product/company/zone/subzone/room/spgs",
      appQuery: {},
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        setdevice(data.body);
      } else {
        alert(data.errorList);
      }
    }

  }
  //
  //기기 전력 정보 API
  async function onClickDeveice(e, spgName) {
    e.preventDefault();
    setPanelName("")
    setErrorList([]);

    let appPath = "spgName=" + spgName
    let data: any = [];
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "GET",
      "appPath": '/api/v2/product/company/zone/subzone/room/panel/item/elecinfo?' + appPath,
      userToken: userInfo.loginInfo.token,
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
    let appPath = "roomId=" + curTree.room.roomId + "&spgName=" + spgName

    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "GET",
      "appPath": '/api/v2/product/company/zone/subzone/room/panels?' + appPath,
      userToken: userInfo.loginInfo.token,
      watch: appPath
    });

    if (data) {
      if (data.codeNum == 200 || panelSelect === false) {
        setPanelData(data.body);
        // setPanelSelect(true)
      }
    }

  }
  // 판넬  명
  function handlePanelName(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "panelName"))
    )
    setPanelName(e.target.value);
  }
  // 모델명
  function handleModelName(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "modelName"))
    )
    setModelName(e.target.value);
  }
  // 시리얼 번호
  function handleSerialNo(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "serialNo"))
    )
    setSerialNo(e.target.value);
  }
  // 정격전압
  function handleRatingVoltage(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "ratingVoltage"))
    )
    setRatingVoltage(e.target.value);
  }
  // 정격전류
  function handleRatingCurrent(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "ratingCurrent"))
    )
    setRatingCurrent(e.target.value);
  }
  // 차단전류
  function handleCutoffCurrent(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "cutoffCurrent"))
    )
    setCutoffCurrent(e.target.value);
  }
  // 용격전압
  function handleratedCapacity(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "ratedCapacity"))
    )
    setRatedCapacity(e.target.value);
  }
  // 계통전압
  function handleSecondaryVoltage(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "secondaryVoltage"))
    )
    setSecondaryVoltage(e.target.value);
  }

  //판넬 Selct 클릭 이벤트
  function panelSelectClick(e, panel) {
    setErrorList(
      errorList.filter((err) => (err.field !== "panelName"))
    )
    setPanelName(panel.panelName)
    setPanelSelect(false)
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
    if (savedFiles.length <= 9) {
      setSavedFiles([...savedFiles, fileVal]);
      e.target.value = ''; // file name 초기화
    } else {
      alert("첨부파일은 10개 까지 가능합니다.");
    }
  };

  //
  function onClickAttachFileDelete(delFile) {
    //var delFile = savedFiles[idx];
    if (!delFile.hasOwnProperty("type")) {
      URL.revokeObjectURL(delFile.url);
    }
    setSavedFiles(savedFiles.filter(file => file.imageId !== delFile.imageId));
  }

  let uploadDoneList = [];
  function uploadFileHandler(uResult) {
    console.log("uResult", uResult);

    var uploadCount = savedFiles.filter(f => f.type === "INS").length;
    uploadCount = uploadCount + savedFiles.filter(f => f.type === "DEL").length;
    uploadDoneList.push(uResult);
    if (uploadDoneList.length === uploadCount) {
      //setParentCurTree("ROOM", { ...curTree, room: { "roomId": roomInfo.roomId, "roomName": roomInfo.roomName },});
      //setParentWorkMode("READ");
      alert("기기 등록이 완료 되었습니다.");
      setParentWorkMode("LIST");
      var btnCommentClose = document.getElementById("pop-deviceadd");
      var body = document.body
      if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
      if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;")
      setRestart(true)
      //
      setRecoilIsLoadingBox(false);
    }
  }

  async function onClickSaved(e, spgName) {
    let data: any = null;
    setRecoilIsLoadingBox(true);

    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "POST",
      appPath: '/api/v2/product/company/zone/subzone/room/panel/item',
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
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == 200) {
        if (savedFiles.length > 0) {
          savedFiles.map((file, idx) => {
            if (file.hasOwnProperty("type") && (file.type == "INS")) {
              saveFiles(data.body.itemId, file.fileForm, uploadFileHandler);
            }
          });
          /*alert("기기 등록이 완료 되었습니다.");
          setParentWorkMode("LIST");
          var btnCommentClose = document.getElementById("pop-deviceadd");
          var body = document.body
          if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
          if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;")
          setRestart(true)
          */
        } else {
          alert("기기 등록이 완료 되었습니다.")
          var btnCommentClose = document.getElementById("pop-deviceadd");
          var body = document.body
          if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
          if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;")
          setParentWorkMode("LIST");
          setRestart(true)
          //
          setRecoilIsLoadingBox(false);
        }
      } else {
        // 
        setResErrorCode(data.codeNum);
        setErrorList(data.body.errorList)
        setRecoilIsLoadingBox(false);
      }
    }
  }

  async function saveFiles(itemId, fileFormData, handlerFunc) {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "POST",
      "appPath": `/api/v2/product/company/zone/subzone/room/panel/item/images?itemId=${itemId}`,
      appQuery: fileFormData,
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      handlerFunc(data);
      if (data.codeNum == 200) {
        clog("IN CHECK ITEM LAST : saveFiles : " + JSON.stringify(data));

      } else { // api if
        // need error handle
        setErrorList(data.errorList);
      }
    }
    //return data;

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




  //
  function onClickclose(e) {
    setParentWorkMode("LIST");
    var btnCommentClose = document.getElementById("pop-deviceadd");
    var body = document.body
    if (!CUTIL.isnull(btnCommentClose)) btnCommentClose.classList.add("hidden");
    if (!CUTIL.isnull(body)) body.setAttribute("style", "overflow-y: auto;")
  }

  function onClickDeviceTab(e, workMode) {
    setParentWorkMode(workMode);
  }



  const elecinfos = (elecinfo == null) ? null : elecinfo;
  const panels = (panelData == null) ? null : panelData;


  return (
    <>
      {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)-->*/}
      {
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
            <a href="#" className="move-list"
              onClick={(e) => onClickDeviceTab(e, "LIST")}>
              Device List
            </a>
            <ul className="tab__small">
              {/*<!-- 선택된 탭 on -->*/}
              <li>
                <a href="#" className="icon-add"
                  onClick={(e) => onClickDeviceTab(e, "BATCH")}>
                  {t("LABEL.일괄등록")}
                </a>
              </li>
              <li className="on"><a href="#" className="icon-pen">{t("LABEL.개별등록")}</a></li>
            </ul>
          </div>

          {/*<!--area__right_content, 오른쪽 컨텐츠 영역-->*/}
          <div className="area__right_content hcal-170">
            <div className="content__info">
              <h3 className="hide">개별등록 정보 입력</h3>
              <ul className="form__input">
                <li className="d-lm-block">
                  <p ref={captureRef} className="tit" ><span className="hide">카드 스캔</span></p>
                  <div className="input__area">
                    {/* <button type="button" className="btn-scan js-open-m" data-pop="pop-scan" onClick={(e) => CUTIL.jsopen_m_Popup(e)}><span>카드 스캔</span></button> */}
                  </div>
                </li>
                <li>
                  <p className="tit star">{t("FIELD.기기명")}</p>
                  <div className="input__area">
                    {/* by 20220916 hjo 기존 디자인 삭제 - 셀렉트로 변경  */}
                    <div className={(errorList.filter(err => (err.field === "spgName")).length > 0) ? "select input-error" : "select"}
                      onClick={(e) => spgSels(e)}>
                      <div className="selected ">
                        <div className="selected-value" >{t("MESSAGE.T1선택해주세요", [t("MESSAGE.기기명")])}</div>
                        <div className="arrow"></div>
                      </div>
                      <ul>
                        {/* <li id="directCloseCom" className="option hide" data-value={""} >회사를 선택해주세요.</li> */}
                        {device.map((list, idx) => (
                          <li
                            className="option"
                            //className={(errorList.filter(err => (err.field === "companyName")).length > 0) ? "option input-error" : "option"}
                            key={"spg_" + idx.toString()} onClick={(e) => onClickDeveice(e, list.spgName)}>
                            {list.spgName}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "spgName")).map((err) => err.msg)}</p>
                  </div>
                </li>
                <li>
                  <p className={`tit ${(spgName == "GIS") || (spgName == "유입식TR") ? "" : "star"}`}>{t("FIELD.Panel명")}</p>
                  {((spgName == "GIS") || (spgName == "유입식TR")) &&
                    <div className="input__area">
                      < input type="text" disabled />
                    </div>
                  }
                  {((spgName !== "GIS") && (spgName !== "유입식TR")) && (spgName != "배전반") &&
                    <div className={`input__area ${(errorList.filter(err => (err.field === "panelName")).length > 0) ? "" : (panelSelect) ? "autocomplete" : ""}`}>
                      <input type="text" id="inp1" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])} onClick={() => setPanelSelect(!panelSelect)}
                        value={panelName} onChange={(e) => handlePanelName(e)}
                        className={(errorList.filter(err => (err.field === "panelName")).length > 0) ? "input-error" : ""}
                      />
                      <p className="input-errortxt">{errorList.filter(err => (err.field === "panelName")).map((err) => err.msg)}</p>
                      {(panelSelect && !panelName) &&
                        <ul className="autocomplete-box">
                          {panels.map((panel) => (
                            <li key={panel.panelId} >
                              <a href="#" onClick={(e) => panelSelectClick(e, panel)}><span className="highlight"></span>{panel.panelName}</a>
                            </li>
                          ))}
                        </ul>
                      }
                    </div>
                  }
                  {(spgName == "배전반") &&
                    <div className="input__area">
                      < input type="text" id="inp1" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                        value={panelName} onChange={(e) => handlePanelName(e)}
                        className={(errorList.filter(err => (err.field === "panelName")).length > 0) ? "input-error" : ""}
                      />
                      <p className="input-errortxt">{errorList.filter(err => (err.field === "panelName")).map((err) => err.msg)}</p>
                    </div>
                  }
                </li>
                <li>
                  <p className={`tit ${(spgName == "배전반") ? "" : "star"} `}>{t("FIELD.모델명")}</p>
                  <div className="input__area">
                    {(spgName == "배전반") &&
                      < input type="text" disabled />
                    }
                    {(spgName !== "배전반") &&
                      <input type="text" id="inp2" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                        value={modelName} onChange={(e) => handleModelName(e)}
                        className={(errorList.filter(err => (err.field === "modelName")).length > 0) ? "input-error" : ""}
                      />
                    }
                    <p id="inp3" className="input-errortxt">{errorList.filter(err => (err.field === "modelName")).map((err) => err.msg)}</p>
                  </div>
                </li>
                <li>
                  <p className={`tit ${(spgName == "배전반") ? "" : "star"}`}>{t("FIELD.시리얼번호")}</p>
                  <div className="input__area">
                    {/* {(spgName == "배전반") &&
                      < input type="text" disabled />
                    }
                    {(spgName !== "배전반") && */}
                    <input type="text" id="inp3" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                      value={serialNo} onChange={(e) => handleSerialNo(e)}
                      className={(errorList.filter(err => (err.field === "serialNo")).length > 0) ? "input-error" : ""}
                    />
                    {/* } */}
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "serialNo")).map((err) => err.msg)}</p>
                  </div>
                </li>
                {/* <!--220812, Autocomplete / 기존의 input__area 에 autocomplete 클래스를 추가하고, 인풋아래에 ul 태그 부분을 넣어주세요--> */}
                {/* 정격전압 */}
                {elecinfos.filter((list) => (list.code == 'ratingVoltage')).map((list, idx) => (
                  <li key={idx}>
                    <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                    <div className={`input__area ${(ratingVoltage && ratingVoltageDisplay) ? "autocomplete" : ""}`} >
                      <input type="text" id="inp4" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                        value={ratingVoltage} onChange={(e) => handleRatingVoltage(e)}
                        onKeyDown={(e) => ratingVoltageDown(e)}
                        className={(errorList.filter(err => (err.field === "ratingVoltage")).length > 0) ? "input-error" : ""}
                      />
                      <p className="input-errortxt">{errorList.filter(err => (err.field === "ratingVoltage")).map((err) => err.msg)}</p>
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
                {elecinfos.filter((list) => (list.code == 'ratingCurrent')).map((list, idx) => (
                  <li key={idx}>
                    <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                    <div className={`input__area ${(ratingCurrent && ratingCurrentDisplay) ? "autocomplete" : ""}`} >
                      <input type="text" id="inp5" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                        value={ratingCurrent} onChange={(e) => handleRatingCurrent(e)}
                        onKeyDown={(e) => ratingCurrentDown(e)}
                        className={(errorList.filter(err => (err.field === "ratingCurrent")).length > 0) ? "input-error" : ""}
                      />
                      <p className="input-errortxt">{errorList.filter(err => (err.field === "ratingCurrent")).map((err) => err.msg)}</p>
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
                {elecinfos.filter((list) => (list.code == "cutoffCurrent")).map((list, idx) => (
                  <li key={idx}>
                    <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                    <div className={`input__area ${(cutoffCurrent && cutoffCurrentDisplay) ? "autocomplete" : ""}`} >
                      <input type="text" id="inp6" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                        value={cutoffCurrent} onChange={(e) => handleCutoffCurrent(e)}
                        onKeyDown={(e) => cutoffCurrentDown(e)}
                        className={(errorList.filter(err => (err.field === "cutoffCurrent")).length > 0) ? "input-error" : ""}
                      />
                      <p className="input-errortxt">{errorList.filter(err => (err.field === "cutoffCurrent")).map((err) => err.msg)}</p>
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
                {elecinfos.filter((list) => (list.code == "secondaryVoltage")).map((list, idx) => (
                  <li key={idx}>
                    <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                    <div className={`input__area ${(secondaryVoltage && secondaryVoltageDisplay) ? "autocomplete" : ""}`} >
                      <input type="text" id="inp8" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                        value={secondaryVoltage} onChange={(e) => handleSecondaryVoltage(e)}
                        onKeyDown={(e) => secondaryVoltageDown(e)}
                        className={(errorList.filter(err => (err.field === "secondaryVoltage")).length > 0) ? "input-error" : ""}
                      />
                      <p className="input-errortxt">{errorList.filter(err => (err.field === "secondaryVoltage")).map((err) => err.msg)}</p>
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
                {elecinfos.filter((list) => (list.code == "ratedCapacity")).map((list, idx) => (
                  <li key={idx}>
                    <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                    <div className={`input__area ${(ratedCapacity && ratedCapacityDisplay) ? "autocomplete" : ""}`} >
                      <input type="text" id="inp7" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                        value={ratedCapacity} onChange={(e) => handleratedCapacity(e)}
                        onKeyDown={(e) => ratedCapacityDown(e)}
                        className={(errorList.filter(err => (err.field === "ratedCapacity")).length > 0) ? "input-error" : ""}
                      />
                      <p className="input-errortxt">{errorList.filter(err => (err.field === "ratedCapacity")).map((err) => err.msg)}</p>
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
                  <p className="tit">{t("FIELD.제조사")}</p>
                  <div className="input__area">
                    <input type="text" id="inp9" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                      value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}
                    />
                  </div>
                </li>
                <li>
                  <p className="tit">{t("FIELD.첨부파일")}</p>
                  <div className="input__area">
                    {(!isCapturePop) &&
                      <div className="filebox">
                        <input className="upload-name" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.사진")])} />
                        <label className="js-open-m" data-pop="pop-capture" onClick={(e) => CUTIL.jsopen_m_Popup(e)}>
                          <span className="hide">파일찾기</span>
                        </label>
                        <input ref={fileRef} className="upload-name" type="file" id="file"
                          accept="image/jpg, image/jpeg, image/png" onChange={(e) => saveFileImage(e)} />
                      </div>
                    }
                    {(isCapturePop) &&
                      <div className="filebox">
                        <input className="upload-name" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.사진")])} />
                        <label onClick={(e) => handleFileUpload(e)}><span className="hide">파일찾기</span></label>
                        <input ref={fileRef} className="upload-name" type="file" id="file"
                          accept="image/jpg, image/jpeg, image/png" onChange={(e) => saveFileImage(e)} />
                      </div>
                    }
                    <ul className={(savedFiles.length > 0) ? "filelist" : ""}>
                      {savedFiles.filter((file, idx) => (idx >= curPos) && ((idx < curPos + listSize))).map((img) => (
                        <li key={img.imageId}>
                          <span>{img.name}</span>
                          <button type="button" className="btn btn-delete" onClick={(e) => onClickAttachFileDelete(img)}>
                            <span className="hide" >{t("LABEL.삭제")}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="txt-info mt-16 mb-0">* 첨부파일은 10개 이하, 전체 120M까지 가능합니다</p>
                  </div>
                </li>
                <li>
                  <p className="tit">{t("FIELD.메모")}</p>
                  <div className="input__area">
                    <textarea placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.메모")])} value={memo} onChange={(e) => setMemo(e.target.value)}></textarea>
                  </div>
                </li>
              </ul>
            </div>
            <div className="btn__wrap ml-0">
              <button type="button" className="bg-gray" onClick={(e) => onClickclose(e)} ><span>{t("LABEL.취소")}</span></button>
              {(spgName) &&
                <button type="button" onClick={(e) => onClickSaved(e, spgName)} ><span>{t("LABEL.저장")}</span></button>
              }
            </div>
          </div>
          {/*<!--//area__right_content, 오른쪽 컨텐츠 영역-->*/}
        </div>
      }
      {/*<!--//area__right, 오른쪽 영역-->*/}

      {/* <!-- scan 팝업 --> */}
      <ScanpPop />
      {/* <!-- //CapturePop 팝업 --> */}
      <CapturePop
        savedFiles={savedFiles}
        setSavedFiles={setSavedFiles}
      />

    </>
  )
};
export default DeviceInsert;

function MobileDeviceInsert(props) {
  //trans
  const t = useTrans()
  //모바일체크
  const curTree = props.curTree;
  const isMobile = props.isMobile
  //에러 메세지
  const resSpgNameMsg = props.resSpgNameMsg;
  const resPanelMsg = props.resPanelMsg;
  const errorList = props.errorList
  //{t("FIELD.기기명")} 
  const device = props.device;
  const spgSels = props.spgSels;
  //개별 등록 항목
  const spgName = props.spgName;
  const panelName = props.panelName;
  const modelName = props.modelName;
  const serialNo = props.serialNo;
  const ratingVoltage = props.ratingVoltage;
  const setRatingVoltage = props.setRatingVoltage;
  const ratingCurrent = props.ratingCurrent;
  const setRatingCurrent = props.setRatingCurrent;
  const cutoffCurrent = props.cutoffCurrent;
  const setCutoffCurrent = props.setCutoffCurrent;
  const ratedCapacity = props.ratedCapacity;
  const setRatedCapacity = props.setRatedCapacity;
  const secondaryVoltage = props.secondaryVoltage;
  const setSecondaryVoltage = props.setSecondaryVoltage;
  const memo = props.memo;
  const setMemo = props.setMemo;
  const manufacturer = props.manufacturer
  const setManufacturer = props.setManufacturer

  //자동완성 기능
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
  //
  const ratingVoltageDown = props.ratingVoltageDown;
  const ratingCurrentDown = props.ratingCurrentDown;
  const cutoffCurrentDown = props.cutoffCurrentDown;
  const secondaryVoltageDown = props.secondaryVoltageDown;
  const ratedCapacityDown = props.ratedCapacityDown;
  //API 정보
  const elecinfo = props.elecinfo;
  const panelData = props.panelData;
  const setPanelSelect = props.setPanelSelect;
  const panelSelect = props.panelSelect;
  const fileRef = props.fileRef;
  const savedFiles = props.savedFiles;
  const setSavedFiles = props.setSavedFiles;
  const curPos = props.curPos;
  const listSize = props.listSize;
  // 액션 및 이벤트
  const onClickDeveice = props.onClickDeveice;
  const handlePanelName = props.handlePanelName;
  const handleModelName = props.handleModelName;
  const handleSerialNo = props.handleSerialNo;
  const handleRatingVoltage = props.handleRatingVoltage;
  const handleRatingCurrent = props.handleRatingCurrent;
  const handleCutoffCurrent = props.handleCutoffCurrent;
  const handleratedCapacity = props.handleratedCapacityl;
  const handleRatedCapacity = props.handleRatedCapacityl;

  const panelSelectClick = props.panelSelectClick;
  const handleFileUpload = props.handleFileUpload;
  const saveFileImage = props.saveFileImage;
  const onClickAttachFileDelete = props.onClickAttachFileDelete;
  const onClickclose = props.onClickclose;
  const onClickSaved = props.onClickSaved;

  const elecinfos = (elecinfo == null) ? null : elecinfo;
  const panels = (panelData == null) ? null : panelData;
  return (
    <>
      {/*<!--개별 등록 팝업 -->*/}
      < div className="popup__body" >
        <div className="area__right_content workplace__info info__input">
          <div className="content__info">
            <h3 className="hide">개별등록 정보 입력</h3>
            <ul className="form__input">
              <li className="d-lm-block">
                <p className="tit"><span className="hide">카드 스캔</span></p>
                <div className="input__area">
                  {/* <button type="button" className="btn-scan js-open-m" data-pop="pop-scan" onClick={(e) => CUTIL.jsopen_m_Popup(e)} ><span>카드 스캔</span></button> */}
                </div>
              </li>
              <li>
                <p className="tit star">{t("FIELD.기기명")}</p>
                <div className="input__area">
                  {/* by 20220916 hjo 기존 디자인 삭제 - 셀렉트로 변경  */}
                  <div className={(errorList.filter(err => (err.field === "spgName")).length > 0) ? "select input-error" : "select"}
                    onClick={(e) => spgSels(e)}>
                    <div className="selected ">
                      <div className="selected-value" >{t("MESSAGE.T1선택해주세요", [t("MESSAGE.기기명")])}</div>
                      <div className="arrow"></div>
                    </div>
                    <ul>
                      {/* <li id="directCloseCom" className="option hide" data-value={""} >회사를 선택해주세요.</li> */}
                      {device.map((list, idx) => (
                        <li
                          className="option"
                          //className={(errorList.filter(err => (err.field === "companyName")).length > 0) ? "option input-error" : "option"}
                          key={"spg_" + idx.toString()} onClick={(e) => onClickDeveice(e, list.spgName)}>
                          {list.spgName}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="input-errortxt">{errorList.filter(err => (err.field === "spgName")).map((err) => err.msg)}</p>
                </div>
              </li>
              <li>
                <p className={`tit ${(spgName == "GIS") || (spgName == "유입식TR") ? "" : "star"}`}>{t("FIELD.Panel명")}</p>
                {((spgName == "GIS") || (spgName == "유입식TR")) &&
                  <div className="input__area">
                    < input type="text" disabled />
                  </div>
                }
                {((spgName !== "GIS") && (spgName !== "유입식TR")) && (spgName != "배전반") &&
                  <div className={`input__area ${(errorList.filter(err => (err.field === "panelName")).length > 0) ? "" : (panelSelect) ? "autocomplete" : ""}`}>
                    <input type="text" id="inp1" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])} onClick={() => setPanelSelect(!panelSelect)}
                      value={panelName} onChange={(e) => handlePanelName(e)}
                      className={(errorList.filter(err => (err.field === "panelName")).length > 0) ? "input-error" : ""}
                    />
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "panelName")).map((err) => err.msg)}</p>
                    {(panelSelect && !panelName) &&
                      <ul className="autocomplete-box">
                        {panels.map((panel) => (
                          <li key={panel.panelId} >
                            <a href="#" onClick={(e) => panelSelectClick(e, panel)}><span className="highlight"></span>{panel.panelName}</a>
                          </li>
                        ))}
                      </ul>
                    }
                  </div>
                }
                {(spgName == "배전반") &&
                  <div className="input__area">
                    < input type="text" id="inp1" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                      value={panelName} onChange={(e) => handlePanelName(e)}
                      className={(errorList.filter(err => (err.field === "panelName")).length > 0) ? "input-error" : ""}
                    />
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "panelName")).map((err) => err.msg)}</p>
                  </div>
                }
              </li>
              <li>
                <p className={`tit ${(spgName == "배전반") ? "" : "star"} `}>{t("FIELD.모델명")}</p>
                <div className="input__area">
                  {(spgName == "배전반") &&
                    < input type="text" disabled />
                  }
                  {(spgName !== "배전반") &&
                    <input type="text" id="inp2" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                      value={modelName} onChange={(e) => handleModelName(e)}
                      className={(errorList.filter(err => (err.field === "modelName")).length > 0) ? "input-error" : ""}
                    />
                  }
                  <p id="inp3" className="input-errortxt">{errorList.filter(err => (err.field === "modelName")).map((err) => err.msg)}</p>
                </div>
              </li>
              <li>
                <p className={`tit ${(spgName == "배전반") ? "" : "star"}`}>시리얼 번호</p>
                <div className="input__area">
                  {/* {(spgName == "배전반") &&
                      < input type="text" disabled />
                    }
                    {(spgName !== "배전반") && */}
                  <input type="text" id="inp3" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                    value={serialNo} onChange={(e) => handleSerialNo(e)}
                    className={(errorList.filter(err => (err.field === "serialNo")).length > 0) ? "input-error" : ""}
                  />
                  {/* } */}
                  <p className="input-errortxt">{errorList.filter(err => (err.field === "serialNo")).map((err) => err.msg)}</p>
                </div>
              </li>
              {/* <!--220812, Autocomplete / 기존의 input__area 에 autocomplete 클래스를 추가하고, 인풋아래에 ul 태그 부분을 넣어주세요--> */}
              {/* 정격전압 */}
              {elecinfos.filter((list) => (list.code == 'ratingVoltage')).map((list, idx) => (
                <li key={idx}>
                  <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                  <div className={`input__area ${(ratingVoltage && ratingVoltageDisplay) ? "autocomplete" : ""}`} >
                    <input type="text" id="inp4" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                      value={ratingVoltage} onChange={(e) => handleRatingVoltage(e)}
                      onKeyDown={(e) => ratingVoltageDown(e)}
                      className={(errorList.filter(err => (err.field === "ratingVoltage")).length > 0) ? "input-error" : ""}
                    />
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "ratingVoltage")).map((err) => err.msg)}</p>
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
              {elecinfos.filter((list) => (list.code == 'ratingCurrent')).map((list, idx) => (
                <li key={idx}>
                  <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                  <div className={`input__area ${(ratingCurrent && ratingCurrentDisplay) ? "autocomplete" : ""}`} >
                    <input type="text" id="inp5" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                      value={ratingCurrent} onChange={(e) => handleRatingCurrent(e)}
                      onKeyDown={(e) => ratingCurrentDown(e)}
                      className={(errorList.filter(err => (err.field === "ratingCurrent")).length > 0) ? "input-error" : ""}
                    />
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "ratingCurrent")).map((err) => err.msg)}</p>
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
              {elecinfos.filter((list) => (list.code == "cutoffCurrent")).map((list, idx) => (
                <li key={idx}>
                  <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                  <div className={`input__area ${(cutoffCurrent && cutoffCurrentDisplay) ? "autocomplete" : ""}`} >
                    <input type="text" id="inp6" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                      value={cutoffCurrent} onChange={(e) => handleCutoffCurrent(e)}
                      onKeyDown={(e) => cutoffCurrentDown(e)}
                      className={(errorList.filter(err => (err.field === "cutoffCurrent")).length > 0) ? "input-error" : ""}
                    />
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "cutoffCurrent")).map((err) => err.msg)}</p>
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
              {elecinfos.filter((list) => (list.code == "secondaryVoltage")).map((list, idx) => (
                <li key={idx}>
                  <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                  <div className={`input__area ${(secondaryVoltage && secondaryVoltageDisplay) ? "autocomplete" : ""}`} >
                    <input type="text" id="inp8" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                      value={secondaryVoltage} onChange={(e) => handleRatedCapacity(e)}
                      onKeyDown={(e) => secondaryVoltageDown(e)}
                      className={(errorList.filter(err => (err.field === "secondaryVoltage")).length > 0) ? "input-error" : ""}
                    />
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "secondaryVoltage")).map((err) => err.msg)}</p>
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
              {elecinfos.filter((list) => (list.code == "ratedCapacity")).map((list, idx) => (
                <li key={idx}>
                  <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                  <div className={`input__area ${(ratedCapacity && ratedCapacityDisplay) ? "autocomplete" : ""}`} >
                    <input type="text" id="inp7" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                      value={ratedCapacity} onChange={(e) => handleratedCapacity(e)}
                      onKeyDown={(e) => ratedCapacityDown(e)}
                      className={(errorList.filter(err => (err.field === "ratedCapacity")).length > 0) ? "input-error" : ""}
                    />
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "ratedCapacity")).map((err) => err.msg)}</p>
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
                <p className="tit">{t("FIELD.제조사")}</p>
                <div className="input__area">
                  <input type="text" id="inp9" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])}
                    value={manufacturer} onChange={(e) => setManufacturer(e.target.value)}
                  />
                </div>
              </li>
              <li></li>
              <li>
                <p className="tit">{t("FIELD.첨부파일")}</p>
                <div className="input__area">
                  <div className="filebox">
                    <input className="upload-name" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.사진")])} />
                    <label className="js-open-s-in" data-pop="pop-capture" onClick={(e) => CUTIL.jsopen_s_in_Popup(e, isMobile)}><span className="hide">파일찾기</span></label>
                    <input ref={fileRef} className="upload-name" type="file" id="file"
                      accept="image/jpg, image/jpeg, image/png" onChange={(e) => saveFileImage(e)} />
                  </div>
                  <ul className="filelist">
                    {savedFiles.filter((file, idx) => (idx >= curPos) && ((idx < curPos + listSize))).map((img) => (
                      <li key={img.imageId}>
                        <span>{img.name}</span>
                        <button type="button" className="btn btn-delete" onClick={(e) => onClickAttachFileDelete(img)}>
                          <span className="hide" >{t("LABEL.삭제")}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="txt-info mt-16 mb-0">* 첨부파일은 10개 이하, 전체 120M까지 가능합니다</p>
                </div>
              </li>
              <li>
                <p className="tit">{t("FIELD.메모")}</p>
                <div className="input__area">
                  <textarea placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.메모")])} value={memo} onChange={(e) => setMemo(e.target.value)}></textarea>
                </div>
              </li>
            </ul>
          </div>
          <div className="btn__wrap mt-32">
            <button type="button" className="bg-gray js-close" onClick={(e) => onClickclose(e)}><span>{t("LABEL.취소")}</span></button>
            {(spgName) &&
              <button type="button" onClick={(e) => onClickSaved(e, spgName)}><span>{t("LABEL.저장")}</span></button>
            }
          </div>
        </div >
      </div >
      {/*<!-- //개별 등록 팝업 -->*/}
    </>
  )
}




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
      {(ratingVoltage && ratingVoltageDisplay) && data.filter((data) => (data.toUpperCase().includes(ratingVoltage.toUpperCase()))).map((data, idx) => (
        <li key={idx} onClick={(e) => autoClick(e, data)}>
          <a href="#" >
            {data.substring(0, data.toUpperCase().indexOf(ratingVoltage.toUpperCase()))}
            <span className="highlight">{
              data.substring(
                data.toUpperCase().indexOf(ratingVoltage.toUpperCase()),
                data.toUpperCase().indexOf(ratingVoltage.toUpperCase()) + ratingVoltage.length)
            }
            </span>
            {data.substring(data.toUpperCase().indexOf(ratingVoltage.toUpperCase()) + ratingVoltage.length)}
          </a>
        </li>
      ))}
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
      {(ratingCurrent && ratingCurrentDisplay) && data.filter((data) => (data.toUpperCase().includes(ratingCurrent.toUpperCase()))).map((data, idx) => (
        <li key={idx} onClick={(e) => autoClick(e, data)}>
          <a href="#" >
            {data.substring(0, data.toUpperCase().indexOf(ratingCurrent.toUpperCase()))}
            <span className="highlight">{
              data.substring(
                data.toUpperCase().indexOf(ratingCurrent.toUpperCase()),
                data.toUpperCase().indexOf(ratingCurrent.toUpperCase()) + ratingCurrent.length)
            }
            </span>
            {data.substring(data.toUpperCase().indexOf(ratingCurrent.toUpperCase()) + ratingCurrent.length)}
          </a>
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
      {(cutoffCurrent && cutoffCurrentDisplay) && data.filter((data) => (data.toUpperCase().includes(cutoffCurrent.toUpperCase()))).map((data, idx) => (
        <li key={idx} onClick={(e) => autoClick(e, data)}>
          <a href="#" >
            {data.substring(0, data.toUpperCase().indexOf(cutoffCurrent.toUpperCase()))}
            <span className="highlight">{
              data.substring(
                data.toUpperCase().indexOf(cutoffCurrent.toUpperCase()),
                data.toUpperCase().indexOf(cutoffCurrent.toUpperCase()) + cutoffCurrent.length)
            }
            </span>
            {data.substring(data.toUpperCase().indexOf(cutoffCurrent.toUpperCase()) + cutoffCurrent.length)}
          </a>
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
      {(secondaryVoltage && secondaryVoltageDisplay) && data.filter((data) => (data.toUpperCase().includes(secondaryVoltage.toUpperCase()))).map((data, idx) => (
        <li key={idx} onClick={(e) => autoClick(e, data)}>
          <a href="#" >
            {data.substring(0, data.toUpperCase().indexOf(secondaryVoltage.toUpperCase()))}
            <span className="highlight">{
              data.substring(
                data.toUpperCase().indexOf(secondaryVoltage.toUpperCase()),
                data.toUpperCase().indexOf(secondaryVoltage.toUpperCase()) + secondaryVoltage.length)
            }
            </span>
            {data.substring(data.toUpperCase().indexOf(secondaryVoltage.toUpperCase()) + secondaryVoltage.length)}
          </a>
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
      {(ratedCapacity && ratedCapacityDisplay) && data.filter((data) => (data.toUpperCase().includes(ratedCapacity.toUpperCase()))).map((data, idx) => (
        <li key={idx} onClick={(e) => autoClick(e, data)}>
          <a href="#" >
            {data.substring(0, data.toUpperCase().indexOf(ratedCapacity.toUpperCase()))}
            <span className="highlight">{
              data.substring(
                data.toUpperCase().indexOf(ratedCapacity.toUpperCase()),
                data.toUpperCase().indexOf(ratedCapacity.toUpperCase()) + ratedCapacity.length)
            }
            </span>
            {data.substring(data.toUpperCase().indexOf(ratedCapacity.toUpperCase()) + ratedCapacity.length)}
          </a>
        </li>
      ))}

    </>
  )
}


function ScanpPop(props) {

  const cameraRef: any = useRef(null);
  const galleryRef: any = useRef(null);

  function onInputCamera(e) {
    cameraRef.current.click();
  }
  function onInputGallery(e) {
    galleryRef.current.click();
  }

  function saveFileCameraImage(e) {
    const file = e.target.feils[0]

  }
  function saveFileGalleryImage(e) {
    const file = e.target.feils[0]
  }

  return (
    <>
      <div id="pop-scan" className="popup-layer js-layer layer-out hidden popup-bottom page-list-in">
        <h1 className="hide">카드스캔</h1>
        <div className="popup__body">
          <ul>
            <li>
              <input ref={cameraRef} type="file" id="camera" accept="image/*"
                capture={"environment"} onChange={(e) => saveFileCameraImage(e)} style={{ "display": "none" }} />
              <a href="#" onClick={(e) => onInputCamera(e)}><span className="icon-camera">사진 찍기</span></a>
            </li>
            <li>
              <input ref={galleryRef} type="file" id="gallery" accept="image/*"
                onChange={(e) => saveFileGalleryImage(e)} style={{ "display": "none" }} />
              <a href="#" onClick={(e) => onInputGallery(e)} ><span className="icon-photo">앨범에서 가져오기</span></a>
            </li>
          </ul>
        </div>
        <div className="popup__footer">
          <button className="button btn-close js-close"><span>닫기</span></button>
        </div>
      </div>
    </>
  )

}


function CapturePop(props) {

  const savedFiles = props.savedFiles
  const setSavedFiles = props.setSavedFiles

  const cameraRef: any = useRef(null);
  const galleryRef: any = useRef(null);

  function onInputCamera(e) {
    cameraRef.current.click();
  }
  function onInputGallery(e) {
    galleryRef.current.click();
  }

  const handleChangeFile = (e) => {
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
    if (savedFiles.length <= 9) {
      setSavedFiles([...savedFiles, fileVal]);
      e.target.value = ''; // file name 초기화
    } else {
      alert("첨부파일은 10개 까지 가능합니다.");
    }
    const btn = document.getElementById("js-close");
    btn.click();
  }

  return (
    <>
      <div id="pop-capture" className="popup-layer js-layer layer-out hidden popup-bottom page-list-in">
        <h1 className="hide">카드스캔</h1>
        <div className="popup__body">
          <ul>
            <li>
              <input ref={cameraRef} type="file" id="camera" accept="image/*"
                capture={"environment"} onChange={(e) => handleChangeFile(e)} style={{ "display": "none" }} />
              <a href="#" onClick={(e) => onInputCamera(e)}><span className="icon-camera">사진 찍기</span></a>
            </li>
            <li>
              <input ref={galleryRef} type="file" id="gallery" accept="image/*"
                onChange={(e) => handleChangeFile(e)} style={{ "display": "none" }} />
              <a href="#" onClick={(e) => onInputGallery(e)} ><span className="icon-photo">앨범에서 가져오기</span></a>
            </li>
          </ul>
        </div>
        <div className="popup__footer">
          <button id="js-close" className="button btn-close js-close"><span>닫기</span></button>
        </div>
      </div>
    </>
  )

}
