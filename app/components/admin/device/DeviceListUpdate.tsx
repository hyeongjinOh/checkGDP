/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author HyeongJin O
 * @contact hjoh@detech.co.kr
 * @date 2022-07-19
 * @brief EHP 기기등록 관리 - 수정 화면 개발
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
import { useTrans } from "../../../utils/langs/useTrans";

/**
 * @brief EHP 기기등록 관리 - List 수정 컴포넌트 , 반응형 동작
 * @param -
 * @returns react components
 */

// component
function DeviceListUpdate(props) {
  //trans
  const t = useTrans();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);

  // props
  const curTree = props.curTree;
  const setListChang = props.setListChang;
  const setParentPopWin = props.setPopWin;
  const setParentIsMobile = props.setIsMobile;
  const reWork = props.reWork;
  const setReWork = props.setReWork;
  // by hjo - 20220920  - 신규 hook 추가
  const setListWork = props.setListWork
  const listItem = props.listItem;
  const setListItem = props.setListItem;
  const restart = props.restart;
  const setRestart = props.setRestart;

  //spg 선택 
  const [device, setdevice] = useState([]);

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
  //
  const [errorList, setErrorList] = useState([]);

  const [itmeTxt, setItmeTxt] = useState(null);

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
  // 기기 삭제 팝업
  function onClickDeletePopup(e, listItem) {
    setParentPopWin("pop-delete",
      <DeletePopup
        htmlHeader={<h1>기기 삭제</h1>}
        listItem={listItem}
        setListChang={setListChang}
        mobileRef={mobileRef}
        setParentPopWin={setParentPopWin}
        setListWork={setListWork}
        setListItem={setListItem}
        setRestart={setRestart}
        restart={restart}
      />
    )
    CUTIL.jsopen_Popup(e)
  }

  //이미지 API
  const { data: putDevice, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/company/zone/subzone/room/panel/item/images`,
    appQuery: {
      itemId: listItem.itemId,
    },
    userToken: userInfo.loginInfo.token,
    watch: listItem.itemId
  });


  // 데이터 렌더링 및 모바일 리스트 수정 팝업
  useEffect(() => {
    if (putDevice) {
      clog("putDevice : CHECK : " + JSON.stringify(putDevice));
      if (putDevice.codeNum == CONST.API_200) {

        setSavedFiles(putDevice.body);
        setSpgName(listItem.spg.spgName);
        setPanelName(listItem.panel.panelName);
        if (listItem.spg.spgName == "배전반") {
          setModelName("");
        } else {
          setModelName(((listItem.itemName) ? listItem.itemName : ""));
        }

        setSerialNo((listItem.serialNo) ? listItem.serialNo : "");
        setRatingVoltage((listItem.ratingVoltage) ? listItem.ratingVoltage : "");
        setRatingCurrent((listItem.ratingCurrent) ? listItem.ratingCurrent : "");
        setCutoffCurrent((listItem.cutoffCurrent) ? listItem.cutoffCurrent : "");
        setRatedCapacity((listItem.ratedCapacity) ? listItem.ratedCapacity : "");
        setManufacturer((listItem.manufacturer) ? listItem.manufacturer : "");
        setSecondaryVoltage((listItem.secondaryVoltage) ? listItem.secondaryVoltage : "");
        setMemo((listItem.memo) ? listItem.memo : "");

      }
    }
    // tree 변화 시 오류 리스트로 이동
    if (reWork != curTree) {
      setListWork(false);
    }
  }, [listItem, putDevice, reWork, curTree]);
  useEffect(() => {
    setParentPopWin("pop-list",
      <MobileDeviceListUpdate
        // props
        htmlHeaderBtn={<button className="btn btn-close js-close" onClick={close}><span className="hide">닫기</span></button>}
        curTree={curTree}
        setListChang={setListChang}
        mobileRef={mobileRef}
        setParentPopWin={setParentPopWin}
        setListWork={setListWork}
        listItem={listItem}
        setListItem={setListItem}
      //
      />
    );
  })
  //pop 닫기
  function close() {
    setListWork(false);
  }
  // 수정 화면 이벤트 
  // Device List로 이동
  function onClickDeviceListChang(e) {
    setListWork(false);
  }
  // 수정 화면으로 변경
  function onChangePut(e, spgName) {
    setListPut(true);
    onClickDeveice(e, spgName)

  }

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
    // setPanelName("")
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
    if (spgName == "배전반") {
      setModelName("");
    } else {
      setModelName(e.target.value);
    }
  }
  // 시리얼번호
  function handleSerialNo(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "serialNo"))
    )
    setSerialNo(e.target.value);
  }
  //정격전압
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
    if (savedFiles.length <= 9) {
      setSavedFiles([...savedFiles, fileVal]);
      e.target.value = ''; // file name 초기화
    } else {
      alert("첨부파일은 10개 까지 가능합니다.");
    }

  };
  // 이미지 다운로드
  async function onClicFileDown(itemId) {
    HTTPUTIL.fileDownload2(`${itemId.name}`, itemId.url);
  }

  //이미지 삭제
  function onClickAttachFileDelete(e, delFile) {

    setParentPopWin("pop-imgdelete",
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
        setItmeTxt={setItmeTxt}
        itmeTxt={itmeTxt}
      />
    )
    CUTIL.jsopen_Popup(e);
  }


  // 수정 {t("LABEL.취소")} 이벤트
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
    setErrorList([]);

  }

  let uploadDoneList = [];
  function uploadFileHandler(uResult) {
    var uploadCount = savedFiles.filter(f => f.type === "INS").length;
    uploadCount = uploadCount + savedFiles.filter(f => f.type === "DEL").length;
    uploadDoneList.push(uResult);
    clog("uploadDoneList : " + uploadDoneList + "uploadCount : " + uploadCount)
    if (uploadDoneList.length === uploadCount) {
      //setParentCurTree("ROOM", { ...curTree, room: { "roomId": roomInfo.roomId, "roomName": roomInfo.roomName },});
      //setParentWorkMode("READ");
      alert("저장되었습니다.");
      setListWork(false);
      setRecoilIsLoadingBox(false);
    }
  }

  async function listPUtDone(e, item) {
    let data: any = [];
    setRecoilIsLoadingBox(true);


    data = await HTTPUTIL.PromiseHttp({
      httpMethod: "PUT",
      appPath: `/api/v2/product/company/zone/subzone/room/panel/item`,
      //  "appPath": `/api/v2/product/company/zone/subzone/room/panel/item/images?itemId=${itemId}`,
      appQuery: {
        itemId: item.itemId,
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
      if (data.codeNum == CONST.API_200) {
        if (savedFiles.filter(f => f.type === "INS").length > 0) {
          savedFiles.map((file, idx) => {
            if (file.hasOwnProperty("type") && (file.type == "INS")) {
              saveFiles(item.itemId, file.fileForm, uploadFileHandler);
            }
          });
          //alert("저장되었습니다.");
          //setListWork(false);
        } else {
          alert("저장되었습니다.");
          setListWork(false);
          setRecoilIsLoadingBox(false);
        }

      } else { // api if
        // need error handle
        setErrorList(data.body.errorList);
        setRecoilIsLoadingBox(false);
      }
    }
  }

  // 첨부 파일 수정 
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
          <li>{curTree.company.companyName}</li>
          <li>{curTree.zone.zoneName}</li>
          <li>{curTree.subZone.subZoneName}</li>
          <li>{curTree.room.roomName}</li>
        </ul>
        <div className="page-top">
          <h2>{curTree.room.roomName}</h2>
          <div className="top-button mt-m12">
            {/* <!--220901 수정버튼 활성화시 active 클래스 추가해주세요~--> */}
            <button type="button" className={`btn-edit ${(listPut) ? "active" : ""}`} onClick={(!listPut) ? (e) => onChangePut(e, listItem.spg.spgName) : null} ><span className="hide">수정</span></button>
            <button type="button" className="btn-delete js-open" data-pop={"pop-delete"} onClick={(e) => onClickDeletePopup(e, listItem)}><span className="hide">삭제</span></button>
          </div>
        </div>
        <div className="inline mb-18">
          {/*<!--목록이동 버튼, 활성화되면 active 클래스 추가-->*/}
          <a href="#" className="move-list"
            onClick={(e) => onClickDeviceListChang(e)}>
            Device List
          </a>
        </div>
        {/* <!--area__right_content, 오른쪽 컨텐츠 영역--> */}
        <div className="area__right_content hcal-170">
          <div className="content__info">
            <ul className="form__input">
              <li>
                <p className={`tit ${(listPut) ? "star" : ""}`}>{t("FIELD.기기명")}</p>
                <div className="input__area">
                  {(!listPut) ?
                    <input type="text" id="inp0" value={spgName} readOnly disabled />
                    :
                    <div className={(errorList.filter(err => (err.field === "spgName")).length > 0) ? "select input-error" : "select"}
                      onClick={(e) => spgSels(e)}>
                      <div className="selected ">
                        <div className="selected-value" >{spgName}</div>
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
                  }
                  <p className="input-errortxt">{errorList.filter(err => (err.field === "spgName")).map((err) => err.msg)}</p>
                </div>
              </li>
              <li>
                <p className={`tit ${(listPut && (spgName !== "GIS") && (spgName !== "유입식TR")) ? "star" : ""}`}>{t("FIELD.Panel명")}</p>
                {(!listPut || ((spgName == "GIS") || (spgName == "유입식TR"))) &&
                  <div className="input__area">
                    <input type="text" id="inp1" value={panelName} readOnly disabled />
                  </div>
                }
                {(listPut && ((spgName != "GIS") && (spgName != "유입식TR")) && (spgName != "배전반")) &&
                  <div className={`input__area ${(errorList.filter(err => (err.field === "panelName")).length > 0) ? "" : (panelSelect) ? "autocomplete" : ""}`}>
                    <input type="text" id="inp1" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])} onClick={() => setPanelSelect(!panelSelect)}
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
                {listPut && (spgName == "배전반") &&
                  <div className="input__area">
                    < input type="text" id="inp1" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])}
                      value={panelName} onChange={(e) => handlePanelName(e)}
                      className={(errorList.filter(err => (err.field === "panelName")).length > 0) ? "input-error" : ""}
                    />
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "panelName")).map((err) => err.msg)}</p>
                  </div>
                }
              </li>
              <li>
                <p className={`tit ${(listPut && spgName != "배전반") ? "star" : ""}`}>{t("FIELD.모델명")}</p>
                <div className="input__area">
                  {(!listPut || (spgName == "배전반")) ?
                    <input type="text" id="inp2" value={modelName} readOnly disabled />
                    :
                    <input type="text" id="inp2" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])}
                      value={modelName} onChange={(e) => handleModelName(e)}
                      className={(errorList.filter(err => (err.field === "modelName")).length > 0) ? "input-error" : ""}
                    />
                  }
                  <p id="inp3" className="input-errortxt">{errorList.filter(err => (err.field === "modelName")).map((err) => err.msg)}</p>
                </div>
              </li>
              <li>
                <p className={`tit ${(listPut && spgName != "배전반") ? "star" : ""}`}>{t("FIELD.시리얼번호")}</p>
                <div className="input__area">
                  {(!listPut) ?
                    <input type="text" id="inp3" value={serialNo} readOnly disabled />
                    :
                    <input type="text" id="inp3" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])}
                      value={serialNo} onChange={(e) => handleSerialNo(e)}
                      className={(errorList.filter(err => (err.field === "serialNo")).length > 0) ? "input-error" : ""}
                    />
                  }
                  <p className="input-errortxt">{errorList.filter(err => (err.field === "serialNo")).map((err) => err.msg)}</p>
                </div>
              </li>
              {/*정격전압 */}
              {(!listPut) &&
                <li>
                  <p className="tit ">{t("FIELD.정격전압")}<span className="inline">(kV)</span></p>
                  <div className="input__area">
                    <input type="text" id="inp4" value={ratingVoltage} readOnly disabled />
                  </div>
                </li>
              }
              {(listPut) && elecinfos.filter((list) => (list.code == 'ratingVoltage')).map((list, idx) => (
                <li key={idx}>
                  <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                  <div className={`input__area ${(ratingVoltage && ratingVoltageDisplay) ? "autocomplete" : ""}`} >
                    <input type="text" id="inp4" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])}
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
              {/*정격전류*/}
              {(!listPut) && (spgName != "유입식TR" && spgName != "MoldTR") &&
                <li>
                  <p className="tit ">{t("FIELD.정격전류")}<span className="inline">(A)</span></p>
                  <div className="input__area">
                    <input type="text" id="inp6" value={ratingCurrent} readOnly disabled />
                  </div>
                </li>
              }
              {(listPut) && elecinfos.filter((list) => (list.code == 'ratingCurrent')).map((list, idx) => (
                <li key={idx}>
                  <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                  <div className={`input__area ${(ratingCurrent && ratingCurrentDisplay) ? "autocomplete" : ""}`} >
                    <input type="text" id="inp5" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])}
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
              {/*차단전류*/}
              {(!listPut) && (spgName != "유입식TR" && spgName != "MoldTR") &&
                <li>
                  <p className="tit ">{t("FIELD.차단전류")}<span className="inline">(kA)</span></p>
                  <div className="input__area">
                    <input type="text" id="inp7" value={cutoffCurrent} readOnly disabled />
                  </div>
                </li>
              }
              {(listPut) && elecinfos.filter((list) => (list.code == "cutoffCurrent")).map((list, idx) => (
                <li key={idx}>
                  <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                  <div className={`input__area ${(cutoffCurrent && cutoffCurrentDisplay) ? "autocomplete" : ""}`} >
                    <input type="text" id="inp6" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])}
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
              {(!listPut) && (spgName == "유입식TR" || spgName == "MoldTR") &&
                <li>
                  <p className="tit">{t("FIELD.2차전압")}<span className="inline">(kV)</span></p>
                  <div className="input__area">
                    <input type="text" id="inp5" value={secondaryVoltage} readOnly disabled />
                  </div>
                </li>
              }
              {(listPut) && elecinfos.filter((list) => (list.code == "secondaryVoltage")).map((list, idx) => (
                <li key={idx}>
                  <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                  <div className={`input__area ${(secondaryVoltage && secondaryVoltageDisplay) ? "autocomplete" : ""}`} >
                    <input type="text" id="inp8" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])}
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
              {/*정격용량*/}
              {(!listPut) && (spgName == "유입식TR" || spgName == "MoldTR") &&
                <li>
                  <p className="tit" >{t("FIELD.정격용량")}<span className="inline">(kVA)</span></p>
                  <div className="input__area">
                    <input type="text" id="inp8" value={ratedCapacity} readOnly disabled />
                  </div>
                </li>
              }
              {(listPut) && elecinfos.filter((list) => (list.code == "ratedCapacity")).map((list, idx) => (
                <li key={idx}>
                  <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                  <div className={`input__area ${(ratedCapacity && ratedCapacityDisplay) ? "autocomplete" : ""}`} >
                    <input type="text" id="inp7" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])}
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
                <p className="tit ">{t("FIELD.제조사")}</p>
                <div className="input__area">
                  {(!listPut) ?
                    <input type="text" id="inp9" value={manufacturer} disabled />
                    :
                    <input type="text" id="inp9" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])} value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
                  }
                </div>
              </li>
              <li>
                <p className="tit">{t("FIELD.첨부파일")}</p>
                <div className="input__area">
                  {(listPut) &&
                    <div className="filebox">
                      <input className="upload-name" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.사진")])} />
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
                          <button type="button" className="btn btn-delete js-open" data-pop={"pop-imgdelete"} onClick={(e) => onClickAttachFileDelete(e, img)}><span className="hide">삭제</span></button>
                        }
                        {(!listPut && img.name != '') &&
                          <button type="button" className="btn btn-filedown" onClick={(e) => onClicFileDown(img)}><span className="hide">다운로드</span></button>
                        }

                      </li>
                    </ul>
                  ))}
                  <p className="txt-info mt-16 mb-0">* 첨부파일은 10개 이하, 전체 120M까지 가능합니다</p>
                </div>
              </li>
              <li>
                <p className="tit">{t("FIELD.메모")}</p>
                <div className="input__area disavled">
                  {(!listPut) ?
                    <textarea value={memo} readOnly disabled></textarea>
                    :
                    <textarea value={memo} onChange={(e) => setMemo(e.target.value)}></textarea>
                  }
                </div>
              </li>
            </ul>
          </div>
          {(listPut) ?
            <div className="btn__wrap ml-0">
              <button type="button" className="bg-gray" onClick={(e) => listPutClose(e)}><span>{t("LABEL.취소")}</span></button>
              <button type="button" onClick={(e) => listPUtDone(e, listItem)}><span>{t("LABEL.저장")}</span></button>
            </div>
            :
            <div className="btn__wrap ml-0">
              <button type="button" onClick={(e) => setListWork(false)}><span>{t("LABEL.확인")}</span></button>
            </div>
          }

        </div>
        {/* <!--//area__right_content, 오른쪽 컨텐츠 영역--> */}
      </div>
    </>
  );
}


export default DeviceListUpdate;

function MobileDeviceListUpdate(props) {
  //trans
  const t = useTrans();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //
  const curTree = props.curTree;
  //
  const listItem = props.listItem;
  const mobileRef = props.mobileRef
  const setListChang = props.setListChang;
  const setParentPopWin = props.setParentPopWin;
  const setListWork = props.setListWork
  const setListItem = props.setListItem;
  const setRestart = props.setRestart;
  //spg 선택 
  const [device, setdevice] = useState([]);

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
  const [errorList, setErrorList] = useState([]);
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
    userToken: userInfo.loginInfo.token,
    watch: listItem.itemId + curTree.reload
  });



  useEffect(() => {
    if (putDevice) {
      if (putDevice.codeNum == CONST.API_200) {

        setSavedFiles(putDevice.body);
        setSpgName(listItem.spg.spgName);
        setPanelName(listItem.panel.panelName);
        if (listItem.spg.spgName == "배전반") {
          setModelName("");
        } else {
          setModelName(((listItem.itemName) ? listItem.itemName : ""));
        }

        setSerialNo((listItem.serialNo) ? listItem.serialNo : "");
        setRatingVoltage((listItem.ratingVoltage) ? listItem.ratingVoltage : "");
        setRatingCurrent((listItem.ratingCurrent) ? listItem.ratingCurrent : "");
        setCutoffCurrent((listItem.cutoffCurrent) ? listItem.cutoffCurrent : "");
        setRatedCapacity((listItem.ratedCapacity) ? listItem.ratedCapacity : "");
        setManufacturer((listItem.manufacturer) ? listItem.manufacturer : "");
        setSecondaryVoltage((listItem.secondaryVoltage) ? listItem.secondaryVoltage : "");
        setMemo((listItem.memo) ? listItem.memo : "");

      }
    }


  }, [listItem, putDevice])

  // 수정 화면 이벤트 
  // Device List로 이동
  function onClickDeviceListChang(e) {
    setListWork(false);
  }
  // 수정 화면으로 변경
  function onChangePut(e, spgName) {
    setListPut(true);
    onClickDeveice(e, spgName)

  }
  // 기기 삭제 팝업
  function onClickDeletePopup(e, listItem) {

    setParentPopWin("pop-delete",
      <DeletePopup
        htmlHeader={<h1>기기 삭제</h1>}
        listItem={listItem}
        setListChang={setListChang}
        mobileRef={mobileRef}
        setParentPopWin={setParentPopWin}
        setListWork={setListWork}
        setListItem={setListItem}
        setRestart={setRestart}
      />
    )
    CUTIL.jsopen_Popup(e)
  }


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
    // setPanelName("")
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
    if (spgName == "배전반") {
      setModelName("");
    } else {
      setModelName(e.target.value);
    }
  }
  // 시리얼번호
  function handleSerialNo(e) {
    setErrorList(
      errorList.filter((err) => (err.field !== "serialNo"))
    )
    setSerialNo(e.target.value);
  }
  //정격전압
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
    if (savedFiles.length <= 9) {
      setSavedFiles([...savedFiles, fileVal]);
      e.target.value = ''; // file name 초기화
    } else {
      alert("첨부파일은 10개 까지 가능합니다.");
    }

  };
  // 이미지 다운로드
  async function onClicFileDown(itemId) {
    HTTPUTIL.fileDownload2(`${itemId.name}`, itemId.url);
  }

  //이미지 삭제
  function onClickAttachFileDeleteMobile(e, delFile) {

    setParentPopWin("pop-imgdelete",
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

  let uploadDoneList = [];
  function uploadFileHandlerMobile(uResult) {
    var uploadCount = savedFiles.filter(f => f.type === "INS").length;
    uploadCount = uploadCount + savedFiles.filter(f => f.type === "DEL").length;
    uploadDoneList.push(uResult);
    if (uploadDoneList.length === uploadCount) {
      alert("저장되었습니다.");
      setListWork(false);
      setRecoilIsLoadingBox(false);
    }
  }

  async function listPUtDoneMobile(e, itemId) {
    let data: any = [];
    setRecoilIsLoadingBox(true);
    data = await HTTPUTIL.PromiseHttp({
      httpMethod: "PUT",
      appPath: `/api/v2/product/company/zone/subzone/room/panel/item`,
      appQuery: {
        itemId: itemId,
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
      if (data.codeNum == CONST.API_200) {
        if (savedFiles.filter(f => f.type === "INS").length  > 0) {
          savedFiles.map((file, idx) => {
            if (file.hasOwnProperty("type") && (file.type == "INS")) {
              saveFilesMobile(itemId, file.fileForm, uploadFileHandlerMobile);
            }
          });
          //alert("저장되었습니다.");
          //setListWork(false);
        } else {
          alert("저장되었습니다.");
          setListWork(false);
          setRecoilIsLoadingBox(false);
        }

      } else { // api if
        // need error handle
        setErrorList(data.body.errorList);
        setRecoilIsLoadingBox(false);
      }
    }
  }

  // 첨부 파일 수정 
  async function saveFilesMobile(itemId, fileFormData, handlerFunc) {
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
      }
    }
    //return data;

  }


  const elecinfos = (elecinfo == null) ? null : elecinfo;
  const panels = (panelData == null) ? null : panelData;



  return (
    <>

      <div className="popup__body" ref={mobileRef}>
        <ul className="page-loca">
          <li>{curTree.company.companyName}</li>
          <li>{curTree.zone.zoneName}</li>
          <li>{curTree.subZone.subZoneName}</li>
          <li>{curTree.room.roomName}</li>
        </ul>
        <div className="page-top">
          <h2>{curTree.room.roomName}</h2>
          <div className="top-button  mt-m12">
            {/* <!--220901 수정버튼 활성화시 active 클래스 추가해주세요~--> */}
            <button type="button" className={`btn-edit ${(listPut) ? "active" : ""}`} onClick={(!listPut) ? (e) => onChangePut(e, listItem.spg.spgName) : null} ><span className="hide">수정</span></button>
            <button type="button" className="btn-delete js-open" data-pop={"pop-delete"} onClick={(e) => onClickDeletePopup(e, listItem)}><span className="hide">삭제</span></button>
          </div>
        </div>
        <div className="area__right_content workplace__info">
          {/* <!--area__right_content, 오른쪽 컨텐츠 영역--> */}
          <a href="#" className="move-list"
            onClick={(e) => onClickDeviceListChang(e)}>
            Device List
          </a>
          <ul className="tab__small">

          </ul>
          <div className="area__right_content workplace__info info__input">
            <div className="content__info">
              <div className="content__info">
                <ul className="form__input">
                  <li>
                    <p className={`tit ${(listPut) ? "star" : ""}`}>{t("FIELD.기기명")}</p>
                    <div className="input__area">
                      {(!listPut) ?
                        <input type="text" id="inp0" value={spgName} readOnly disabled />
                        :
                        <div className={(errorList.filter(err => (err.field === "spgName")).length > 0) ? "select input-error" : "select"}
                          onClick={(e) => spgSels(e)}>
                          <div className="selected ">
                            <div className="selected-value" >{spgName}</div>
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
                      }
                      <p className="input-errortxt">{errorList.filter(err => (err.field === "spgName")).map((err) => err.msg)}</p>
                    </div>
                  </li>
                  <li>
                    <p className={`tit ${(listPut && (spgName !== "GIS") && (spgName !== "유입식TR")) ? "star" : ""}`}>{t("FIELD.Panel명")}</p>
                    {(!listPut || ((spgName == "GIS") || (spgName == "유입식TR"))) &&
                      <div className="input__area">
                        <input type="text" id="inp1" value={panelName} readOnly disabled />
                      </div>
                    }
                    {(listPut && ((spgName != "GIS") && (spgName != "유입식TR")) && (spgName != "배전반")) &&
                      <div className={`input__area ${(errorList.filter(err => (err.field === "panelName")).length > 0) ? "" : (panelSelect) ? "autocomplete" : ""}`}>
                        <input type="text" id="inp1" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])} onClick={() => setPanelSelect(!panelSelect)}
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
                    {listPut && (spgName == "배전반") &&
                      <div className="input__area">
                        < input type="text" id="inp1" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])}
                          value={panelName} onChange={(e) => handlePanelName(e)}
                          className={(errorList.filter(err => (err.field === "panelName")).length > 0) ? "input-error" : ""}
                        />
                        <p className="input-errortxt">{errorList.filter(err => (err.field === "panelName")).map((err) => err.msg)}</p>
                      </div>
                    }
                  </li>
                  <li>
                    <p className={`tit ${(listPut && spgName != "배전반") ? "star" : ""}`}>{t("FIELD.모델명")}</p>
                    <div className="input__area">
                      {(!listPut || (spgName == "배전반")) ?
                        <input type="text" id="inp2" value={modelName} readOnly disabled />
                        :
                        <input type="text" id="inp2" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])}
                          value={modelName} onChange={(e) => handleModelName(e)}
                          className={(errorList.filter(err => (err.field === "modelName")).length > 0) ? "input-error" : ""}
                        />
                      }
                      <p id="inp3" className="input-errortxt">{errorList.filter(err => (err.field === "modelName")).map((err) => err.msg)}</p>
                    </div>
                  </li>
                  <li>
                    <p className={`tit ${(listPut && spgName != "배전반") ? "star" : ""}`}>{t("FIELD.시리얼번호")}</p>
                    <div className="input__area">
                      {(!listPut) ?
                        <input type="text" id="inp3" value={serialNo} readOnly disabled />
                        :
                        <input type="text" id="inp3" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])}
                          value={serialNo} onChange={(e) => handleSerialNo(e)}
                          className={(errorList.filter(err => (err.field === "serialNo")).length > 0) ? "input-error" : ""}
                        />
                      }
                      <p className="input-errortxt">{errorList.filter(err => (err.field === "serialNo")).map((err) => err.msg)}</p>
                    </div>
                  </li>
                  {/*정격전압 */}
                  {(!listPut) &&
                    <li>
                      <p className="tit ">{t("FIELD.정격전압")}<span className="inline">(kV)</span></p>
                      <div className="input__area">
                        <input type="text" id="inp4" value={ratingVoltage} readOnly disabled />
                      </div>
                    </li>
                  }
                  {(listPut) && elecinfos.filter((list) => (list.code == 'ratingVoltage')).map((list, idx) => (
                    <li key={idx}>
                      <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                      <div className={`input__area ${(ratingVoltage && ratingVoltageDisplay) ? "autocomplete" : ""}`} >
                        <input type="text" id="inp4" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])}
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
                  {/*정격전류*/}
                  {(!listPut) && (spgName != "유입식TR" && spgName != "MoldTR") &&
                    <li>
                      <p className="tit ">{t("FIELD.정격전류")}<span className="inline">(A)</span></p>
                      <div className="input__area">
                        <input type="text" id="inp6" value={ratingCurrent} readOnly disabled />
                      </div>
                    </li>
                  }
                  {(listPut) && elecinfos.filter((list) => (list.code == 'ratingCurrent')).map((list, idx) => (
                    <li key={idx}>
                      <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                      <div className={`input__area ${(ratingCurrent && ratingCurrentDisplay) ? "autocomplete" : ""}`} >
                        <input type="text" id="inp5" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])}
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
                  {/*차단전류*/}
                  {(!listPut) && (spgName != "유입식TR" && spgName != "MoldTR") &&
                    <li>
                      <p className="tit ">{t("FIELD.차단전류")}<span className="inline">(kA)</span></p>
                      <div className="input__area">
                        <input type="text" id="inp7" value={cutoffCurrent} readOnly disabled />
                      </div>
                    </li>
                  }
                  {(listPut) && elecinfos.filter((list) => (list.code == "cutoffCurrent")).map((list, idx) => (
                    <li key={idx}>
                      <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                      <div className={`input__area ${(cutoffCurrent && cutoffCurrentDisplay) ? "autocomplete" : ""}`} >
                        <input type="text" id="inp6" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])}
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
                  {(!listPut) && (spgName == "유입식TR" || spgName == "MoldTR") &&
                    <li>
                      <p className="tit">{t("FIELD.2차전압")}<span className="inline">(kV)</span></p>
                      <div className="input__area">
                        <input type="text" id="inp5" value={secondaryVoltage} readOnly disabled />
                      </div>
                    </li>
                  }
                  {(listPut) && elecinfos.filter((list) => (list.code == "secondaryVoltage")).map((list, idx) => (
                    <li key={idx}>
                      <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                      <div className={`input__area ${(secondaryVoltage && secondaryVoltageDisplay) ? "autocomplete" : ""}`} >
                        <input type="text" id="inp8" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])}
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
                  {/*정격용량*/}
                  {(!listPut) && (spgName == "유입식TR" || spgName == "MoldTR") &&
                    <li>
                      <p className="tit" >{t("FIELD.정격용량")}<span className="inline">(kVA)</span></p>
                      <div className="input__area">
                        <input type="text" id="inp8" value={ratedCapacity} readOnly disabled />
                      </div>
                    </li>
                  }
                  {(listPut) && elecinfos.filter((list) => (list.code == "ratedCapacity")).map((list, idx) => (
                    <li key={idx}>
                      <p className="tit star">{list.name}<span className="inline">({list.unit})</span></p>
                      <div className={`input__area ${(ratedCapacity && ratedCapacityDisplay) ? "autocomplete" : ""}`} >
                        <input type="text" id="inp7" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.텍스트")])}
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
                    <p className="tit ">{t("FIELD.제조사")}</p>
                    <div className="input__area">
                      {(!listPut) ?
                        <input type="text" id="inp9" value={manufacturer} disabled />
                        :
                        <input type="text" id="inp9" placeholder={t("MESSAGE.T1입력하세요", [t("MESSAGE.텍스트")])} value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
                      }
                    </div>
                  </li>
                  <li>
                    <p className="tit">{t("FIELD.첨부파일")}</p>
                    <div className="input__area">
                      {(listPut) &&
                        <div className="filebox">
                          <input className="upload-name" placeholder={t("MESSAGE.T1첨부하세요", [t("MESSAGE.사진")])} />
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
                              <button type="button" className="btn btn-delete js-open" data-pop={"pop-imgdelete"} onClick={(e) => onClickAttachFileDeleteMobile(e, img)}><span className="hide">삭제</span></button>
                            }
                            {(!listPut && img.name != '') &&
                              <button type="button" className="btn btn-filedown" onClick={(e) => onClicFileDown(img)}><span className="hide">다운로드</span></button>
                            }

                          </li>
                        </ul>
                      ))}
                      <p className="txt-info mt-16 mb-0">* 첨부파일은 10개 이하, 전체 120M까지 가능합니다</p>
                    </div>
                  </li>
                  <li>
                    <p className="tit">{t("FIELD.메모")}</p>
                    <div className="input__area disavled">
                      {(!listPut) ?
                        <textarea value={memo} readOnly disabled></textarea>
                        :
                        <textarea value={memo} onChange={(e) => setMemo(e.target.value)}></textarea>
                      }
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            {(listPut) ?
              <div className="btn__wrap mt-32">
                <button type="button" className="bg-gray" onClick={(e) => listPutClose(e)}><span>{t("LABEL.취소")}</span></button>
                <button type="button" onClick={(e) => listPUtDoneMobile(e, listItem.itemId)}><span>{t("LABEL.저장")}</span></button>
              </div>
              :
              <div className="btn__wrap mt-32">
                <button type="button" onClick={(e) => setListWork(false)}><span>{t("LABEL.확인")}</span></button>
              </div>
            }

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

// 리스트 삭제
function DeletePopup(props) {
  //trans
  const t = useTrans();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //
  const listItem = props.listItem

  const setListWork = props.setListWork
  const setRestart = props.setRestart;
  const restart = props.restart;
  const [itmeTxt, setItmeTxt] = useState(null);

  async function listDel(itemId) {
    let data: any = null;
    data = await HTTPUTIL.PromiseHttp({
      httpMethod: "DELETEDATA",
      appPath: `/api/v2/product/company/zone/subzone/room/panel/item`, //${encodeURIComponent(itemId)}`,
      appQuery: {
        itemId: itemId,
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        alert("삭제되었습니다.");
        CUTIL.jsclose_Popup("pop-delete")
        setListWork(false);
        setRestart(true);
      } else {
        alert(data.errorList[0].msg)
      }

    }
  }
  function listDelDone(e) {


  }
  return (

    <>
      <div className="popup__body">
        <p>해당 기기를 삭제하시겠습니까?</p>
      </div>
      <div className="popup__footer">
        <button type="button" className="bg-gray btn-close" onClick={(e) => CUTIL.jsclose_Popup("pop-delete")}><span>{t("LABEL.취소")}</span></button>
        <button type="button" className="" onClick={(e) => listDel(listItem.itemId)}>
          <span>{t("LABEL.확인")}</span>
        </button>
      </div>
    </>
  )
}

//이미지 삭제
function ReasonImagePopup(props) {
  //trans
  const t = useTrans();
  //recoli
  const userInfo = useRecoilValue(userInfoLoginState);
  //
  const delFile = props.delFile;
  const setSavedFiles = props.setSavedFiles;
  const savedFiles = props.savedFiles;




  async function listDel(delFile) {
    let data: any = null;
    if (!delFile.type) {
      data = await HTTPUTIL.PromiseHttp({
        "httpMethod": "DELETE",
        appPath: `/api/v2/item/images`,
        appQuery: {
          imageIds: delFile.imageId
        },
        userToken: userInfo.loginInfo.token,
        watch: delFile.imageId
      });
      if (data) {
        if (data.codeNum == CONST.API_200) {
          alert("삭제되었습니다.");
          if (!delFile.hasOwnProperty("type")) {
            URL.revokeObjectURL(delFile.url);
          }
          setSavedFiles(savedFiles.filter(file => file.imageId !== delFile.imageId));
          // setListWork(false);
          CUTIL.jsclose_Popup("pop-imgdelete")
        }
      }
    } else {

    }

  }

  return (
    <>
      <div className="popup__body">
        <p>해당 이미지를 삭제하시겠습니까?</p>
      </div>
      <div className="popup__footer">
        <button type="button" className="bg-gray btn-close" onClick={(e) => CUTIL.jsclose_Popup("pop-imgdelete")}><span>{t("LABEL.취소")}</span></button>
        <button type="button" className="" onClick={(e) => listDel(delFile)}>
          <span>{t("LABEL.확인")}</span>
        </button>
      </div>
    </>
  )
}


