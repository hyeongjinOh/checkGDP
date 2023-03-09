/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author Soongjin Park
 * @contact sjpark@detech.co.kr
 * @date 2022-09-01
 * @brief EHP 사업장 관리 개발
 *
 ********************************************************************/
import React, { useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";
import { loadingBoxState, } from "../../../../recoil/menuState";
import { langState, getApiLangState } from "../../../../recoil/langState";
// img, css etc
// utils
import clog from "../../../../utils/logUtils";
import * as CONST from "../../../../utils/Const"
import * as HTTPUTIL from "../../../../utils/api/HttpUtil"
import * as CUTIL from "../../../../utils/commUtils"
// components
import EhpImageCrop from "../../../common/imagecrop/EhpImageCrop";
import AutoComplete from "../../../common/autocomplete/AutoComplete";
import EhpPostCode from "../../../common/postcode/EhpPostCode";
//component

/**
 * @brief EHP 사업장 관리 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */
function ZoneInsert(props) {
  //recoil
  const apiLang = useRecoilValue(getApiLangState);
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //props
  const isMobile = props.isMobile;
  const selTree = props.selTree;
  const setParentSelTree = props.setSelTree;
  const setParentIsMobile = props.setIsMobile;
  const setParentWorkMode = props.setWorkMode;
  const setParentPopWin = props.setPopWin;
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
        setParentIsMobile(true);
      } else {
        setParentIsMobile(false);
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
        //clog("IN COMPANY LIST : RES : " + JSON.stringify(retList.data.page));
        setCompanyList(
          retList.body.map((comp) => ({ ...comp, "autofield": comp.companyName }))
        );
      }
    }
  }, [retList]);


  const [autoCompanyInfo, setAutoCompanyInfo] = useState(null);
  function resetAutoCompanyInfo() {
    setAutoCompanyInfo(null);
    resetCompanyInfo();
  }
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
  const { data: data, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/company/${selTree.company.companyId}`,
    appQuery: {},
    language: apiLang,
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    watch: selTree.company.companyId
  });
  useEffect(() => {
    if (data) {
      if (data.codeNum == CONST.API_200) {

        setCompanyInfo(data.body);
      } else {
        alert(data.errorList.map((err) => (err.msg)))
      }
    }
  }, [data])
  const resetCompanyInfo = () => (
    setCompanyInfo({
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
    }))

  const [zoneInfo, setZoneInfo] = useState({
    "zoneName": "",
    "address": "",
    "memo": "",
    "assessmentScore": 70,
  });
  // comment 길이 제한 콜백 함수
  function callbackSetZoneInfoMemo(val) {
    setZoneInfo({ ...zoneInfo, memo: val });
  }
  function callbackSetZoneInfoAddress(val) {
    setZoneInfo({ ...zoneInfo, address: val });
  }


  const [errorList, setErrorList] = useState([]);
  // called by AutoComplete
  /*   async function handleSetAutoComplete(autoInfo) {
      if (CUTIL.isnull(autoInfo)) return;
      setAutoCompanyInfo(autoInfo);
      setRecoilIsLoadingBox(true);
      const data = await HTTPUTIL.PromiseHttp({
        httpMethod: "GET",
        appPath: `/api/v2/product/company/${autoInfo.companyId}`,
        appQuery: {},
        userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
        watch : autoInfo.companyId
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
   */
  function onClickZoneList(e) {
    setParentWorkMode("LIST");
  }

  const [selectedFiles, setSelectedFiles] = useState(null);
  const [cropedImage, setCropedImage] = useState(null);

  useEffect(() => {
    setParentPopWin("pop-imgcrop",
      <EhpImageCrop
        cropImage={selectedFiles}
        setCropedImage={handleSetCropedImage}
      />
    );
  }, [selectedFiles]); // selected files이 변경될때마다...이미지 반영을 위해

  const [isPopupPostCode, setIsPopupPostCode] = useState(false);
  useEffect(() => {
    setParentPopWin("pop-postcode",
      <EhpPostCode
        isPopup={isPopupPostCode}
        setIsPopup={setIsPopupPostCode}
        setAddress={callbackSetZoneInfoAddress}
      />
    )
  });
  function onClickPostCode(e) {
    setIsPopupPostCode(true);
    CUTIL.jsopen_Popup(e);
  }
  // 로컬 파일 URL을 통해 파일 객체 데이터 화
  function handleSetCropedImage(cropVal) {
    //clog("save croped file : " + JSON.stringify(cropVal));
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
    /*
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
        if ( cropedImage ) {
          saveAttachFiles(data.body.zoneId, cropedImage.fileForm);
        }
        setParentSelTree("ZONE",
          { ...selTree, 
            company : {"companyId":companyInfo.companyId, "companyName":companyInfo.companyName},
            zone : {"zoneId":data.body.zoneId, "zoneName":data.body.zoneName},
          }
        );
       setParentWorkMode("READ");
      } else { // api if
        // need error handle
        setErrorList(data.body.errorList);
      }
    }
    setRecoilIsLoadingBox(false);
    */
  }

  async function onClickDoSaveZone(e) {
    let data: any = null;
    setRecoilIsLoadingBox(true);
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "POST",
      "appPath": `/api/v2/product/company/zone`,
      appQuery: {
        "companyId": companyInfo.companyId,
        "zoneName": zoneInfo.zoneName,
        "address": zoneInfo.address,
        "memo": zoneInfo.memo,
        "assessmentScore": zoneInfo.assessmentScore,
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        clog("IN ZONE CREATE : " + JSON.stringify(data.body));
        if (cropedImage) {
          saveAttachFiles(data.body.zoneId, cropedImage.fileForm);
        }
        setParentSelTree("COMPANY",
          {
            ...selTree,
            company: { "companyId": companyInfo.companyId, "companyName": companyInfo.companyName },
            reload: true,
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

  /// default select box handler
  // option 선택 시  값 변경 액션
  function selectOptionScore(optionElement) { // 확장 가능
    const selectBox = optionElement.closest(".select");
    const selectedElement = selectBox.querySelector(".selected-value ");
    selectedElement.textContent = optionElement.textContent;
    var optionData = optionElement.getAttribute("data-value");
    selectedElement.setAttribute("data-value", optionData);
    //
    clog("IN SELECT OPTION SCROE : " + optionData);
    setZoneInfo({ ...zoneInfo, assessmentScore: parseInt(optionData) })
  }

  function onClickDoCancelZone(e) {
    setParentSelTree("COMPANY",
      {
        ...selTree,
        company: { "companyId": selTree.company.companyId, "companyName": selTree.company.companyName },
        reload: true,
      }
    );
    setParentWorkMode("READ");
  }

  return (
    <>
      {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)*/}
      <div className="area__right_content workplace__info workplace__main info__input newtype" ref={mobileRef}>
        <div className="page-top">
          <h2>사업장 추가</h2>
        </div>
        {/*<!--입력상단*/}
        <div className="content__info">
          <h3 className="hide">사업장 추가 정보 입력</h3>
          <ul className="form__input">
            <li>
              <p className="tit star">회사 명</p>
              {/*<!-- autocomplete 작동하면 input__area에 autocomplete 클래스 추가 + ul 노출 (공통 동일함) */}
              <div className="input__area">
                {/*  <AutoComplete
              initKeyword={selTree.company.companyName}
              workList={companyList}
              autoInfo={autoCompanyInfo}
              setAutoInfo={handleSetAutoComplete}
              resetAutoInfo={resetAutoCompanyInfo}
              errorList={errorList}
              errorField={"companyId"}
            /> */}
                <input type="text" id="inp4" value={companyInfo.companyName} disabled />
              </div>
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
                  <p className="tit star">사업장 주소1</p>
                  <div className="input__area">
                    {/*<input type="text" id="inp2" placeholder="직접입력"
                  className={(errorList.filter(err=>(err.field==="address")).length>0)?"input-error":""}
                  value={zoneInfo.address}
                  onChange={(e)=>setZoneInfo({...zoneInfo, address:e.target.value})}
                />
                <p className="input-errortxt">{errorList.filter(err=>(err.field==="address")).map((err)=>err.msg)}</p>                  
                */}
                    <div className="box__search">
                      <input type="text" placeholder="주소를 입력하세요"
                        className={(errorList.filter(err => (err.field === "address")).length > 0) ? "input-error" : ""}
                        value={zoneInfo.address}
                        disabled
                      />
                      <button type="button"
                        className="btn btn-search"
                        data-pop="pop-postcode"
                        //onClick={(e)=>CUTIL.jsopen_Popup(e)}  
                        onClick={(e) => onClickPostCode(e)}
                      >
                        <span className="hide">조회</span>
                      </button>
                    </div>
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "address")).map((err) => err.msg)}</p>
                  </div>
                </li>
                <li>
                  <p className="tit">메모</p>
                  <div className="input__area">
                    <textarea placeholder="메모를 입력하세요."
                      className={(errorList.filter(err => (err.field === "memo")).length > 0) ? "input-error" : ""}
                      value={zoneInfo.memo}
                      onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                      onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetZoneInfoMemo)}
                      onChange={(e) => setZoneInfo({ ...zoneInfo, memo: e.target.value })}></textarea>
                    <p className="input-errortxt">{errorList.filter(err => (err.field === "memo")).map((err) => err.msg)}</p>
                  </div>
                </li>
                <li className="mt-40">
                  <p className="tit">진단 점수 기준</p>
                  <div className="input__area">
                    <div className="result__score">
                      <p className="tit caution">Warning</p>
                      <div className="score">
                        {/*<div className="select w64">*/}
                        {/*<div className="select w64" onClick={(e)=>CUTIL.onClickSelect(e, CUTIL.selectOption)}>*/}
                        <div className="select w64" onClick={(e) => CUTIL.onClickSelect(e, selectOptionScore)}>
                          <div className="selected">
                            <div className="selected-value">{zoneInfo.assessmentScore}</div>
                            <div className="arrow"></div>
                          </div>
                          <ul>
                            <li className="option" data-value="50">50</li>
                            <li className="option" data-value="55">55</li>
                            <li className="option" data-value="60">60</li>
                            <li className="option" data-value="65">65</li>
                            <li className="option" data-value="70">70</li>
                            <li className="option" data-value="70">70</li>
                            <li className="option" data-value="75">75</li>
                            <li className="option" data-value="80">80</li>
                            <li className="option" data-value="85">85</li>
                            <li className="option" data-value="90">90</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
                <li className="mt-60">
                  <div className="btn__wrap right w100p">
                    <button type="button"
                      className="bg-gray"
                      onClick={(e) => onClickDoCancelZone(e)}
                    >
                      <span>취소</span>
                    </button>
                    <button type="button"
                      onClick={(e) => onClickDoSaveZone(e)}
                    >
                      <span data-pop="pop-workplace">추가</span>
                    </button>
                  </div>
                </li>
              </ul>
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
