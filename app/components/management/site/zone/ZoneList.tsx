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
import { useNavigate, Link } from 'react-router-dom';
// recoil
import { useRecoilValue, useRecoilState, useSetRecoilState, useResetRecoilState, } from "recoil";
import { userInfoLoginState } from "../../../../recoil/userState";
import { loadingBoxState } from "../../../../recoil/menuState";

// utils
import clog from "../../../../utils/logUtils";
import * as CONST from "../../../../utils/Const"
import * as HTTPUTIL from "../../../../utils/api/HttpUtil"
import * as CUTIL from "../../../../utils/commUtils"

//component
import EhpPostCode from "../../../common/postcode/EhpPostCode";
import EhpImageCrop from "../../../common/imagecrop/EhpImageCrop";
/**
 * @brief EHP 사업장 관리 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function ZoneList(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //props
  const isMobile = props.isMobile;
  const setParentIsMobile = props.setIsMobile;
  const selTree = props.selTree;
  const setParentSelTree = props.setSelTree;
  const workMode = props.workMode;
  const setParentWorkMode = props.setWorkMode;
  const setParentAdminType = props.setAdminType;

  const setParentPopWin = props.setPopWin;
  //
  const companyInfo = props.companyInfo;
  const zoneList = companyInfo.zone;
  //
  //화면 이동
  const navigate = useNavigate();
  //mobile check
  /*const mobileRef = useRef(null); // Mobile Check용
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
  }, []);*/

  ////////////////////////////////////////////////////////////////////////////
  function onClickZoneViewPopup(e, zone) {
    clog("onClickZoneViewPopup : " + JSON.stringify(zone));

    setParentPopWin("pop-listbox-detail",
      <ZoneViewPopup
        htmlHeader={<h1>사업장 상세 정보</h1>}
        zoneInfo={zone}
        companyInfo={companyInfo}
        setSelTree={props.setSelTree}
        setWorkMode={props.setWorkMode}
        setPopWin={props.setPopWin}
      />
    );
    CUTIL.jsopen_Popup(e);
  }
  //사업장 추가
  function onClickZoneInsert(e, company) {
    e.stopPropagation();
    setParentSelTree("ZONE", {
      company: { "companyId": company.companyId, "companyName": company.companyName, },
    })

    setParentWorkMode("CREATE");
  }

  return (
    <>
      {/*<!--정보하단(라인아래)-->*/}
      <div className="content__info boxlist">
        <div className="column">
          <div className="listbox__top">
            <h3>사업장</h3>
            <button type="button"
              className="add__item"
              onClick={(e) => onClickZoneInsert(e, companyInfo)}
            >
              <span>사업장 추가</span>
            </button>
          </div>
          <div className="listbox__area">
            {(zoneList) && zoneList.map((zone, idx) => (
              <div key={`zone_${idx.toString()}`} className="listbox">
                <div className="box__top">
                  <p>{zone.zoneName}</p>
                  <button type="button"
                    className="btn-go js-open"
                    data-pop="pop-listbox-detail"
                    onClick={(e) => onClickZoneViewPopup(e, zone)}
                  >
                    <span className="hide">자세히보기</span>
                  </button>
                </div>
                <div className="box__bottom">
                  <div className="left img_workplace">
                    {(zone.image !== null)
                      ? <img src={zone.image.url} alt={zone.image.name} />
                      : <img src={require("/static/img/img_workplace/bg_add.jpg")} alt="사진영역" />
                    }
                  </div>
                  <div className="right">
                    <ul>
                      <li>
                        <span>상세사업장</span>
                        <span><strong>{zone.subZoneCount}</strong>개</span>
                      </li>
                      <li>
                        <span>등록 기기</span>
                        <span><strong>{zone.itemCount}</strong>개</span>
                      </li>
                      <li>
                        <span>User</span>
                        <span><strong>{zone.userCount}</strong>명</span>
                      </li>
                    </ul>
                    <ul>
                      <li><p className="tit">진단 점수 기준</p></li>
                      <li>
                        <div className="result__score">
                          <p className="tit caution">Warning</p>
                          <p className="score">{zone.assessmentScore}</p>
                        </div>
                      </li>
                      <li>
                      {/*   <p className="score__info">점수기준을 충족하지 않으면, 해당 메세지가 출력됩니다.<br />
                          {'"' + zone.alarmMessage + '"'}</p> */}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </>
  )
};
export default ZoneList;



function ZoneViewPopup(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //화면 이동
  const navigate = useNavigate();
  //props function
  const selTree = props.selTree;
  const setParentSelTree = props.setSelTree;
  const workMode = props.workMode;
  const setParentWorkMode = props.setWorkMode;
  const companyInfo = props.companyInfo;
  const setParentPopWin = props.setPopWin;
  //
  const [zoneInfo, setZoneInfo] = useState(null);
  const [updateCount, setUpdateCount] = useState(0);
  const { data: retData, error, isLoading, reload, run, } = useAsync({
    promiseFn: HTTPUTIL.PromiseHttp,
    httpMethod: "GET",
    appPath: `/api/v2/product/company/zone/admindetail?zoneId=${props.zoneInfo.zoneId}`,
    appQuery: {},
    userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
    //watch: props.zoneInfo.zoneId+workMode
    watch: props.zoneInfo.zoneId + updateCount + workMode
  });

  useEffect(() => {
    setRecoilIsLoadingBox(true);
    const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
    if (ERR_URL.length > 0) {
      setRecoilIsLoadingBox(false);
      navigate(ERR_URL);
    }

    if (retData) {
      setRecoilIsLoadingBox(false);
      clog("IN ZONE VIEW POPUP : RES : " + JSON.stringify(retData));
      if (retData.codeNum == CONST.API_200) {
        setZoneInfo(retData.body);
      }
    }
  }, [zoneInfo, retData])

  function onClickZoneUpdatePopup(e, zone) {
    CUTIL.jsclose_Popup("pop-listbox-detail");

    setParentPopWin("pop-listbox-detail-edit",
      <ZoneUpdatePopup
        htmlHeader={<h1>사업장 정보 수정</h1>}
        zoneInfo={zoneInfo}
        setZoneInfo={setZoneInfo}
        companyInfo={companyInfo}
        setSelTree={props.setSelTree}
        setWorkMode={props.setWorkMode}
        updateCount={updateCount}
        setUpdateCount={setUpdateCount}
        setPopWin={props.setPopWin}
      />
    );
    CUTIL.jsopen_Popup(e);
  }

  async function onClickDoDeleteZone(e, zone) {
    var isOk = confirm("사업장을 삭제하시겠습니까?");
    clog("onClickZoneDoDelete : " + isOk);
    if (!isOk) return;

    let data: any = null;
    setRecoilIsLoadingBox(true);
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "DELETE",
      "appPath": `/api/v2/product/company/zone/${zone.zoneId}`,
      appQuery: {
      },
      userToken: userInfo.loginInfo.token,
    });

    if (data) {
      const ERR_URL = HTTPUTIL.resultCheck(false, data);
      if (ERR_URL.length > 0) {
        setRecoilIsLoadingBox(false);
        CUTIL.sleep(500);
        navigate(ERR_URL);
      }

      if (data.codeNum == CONST.API_200) {
        clog("IN ZONE UPDATE : onClickZoneDoDelete : " + JSON.stringify(data.body));
        alert("사업장을 삭제 하였습니다.");
        CUTIL.jsclose_Popup("pop-listbox-detail");

        setParentSelTree("COMPANY",
          {
            ...selTree,
            company: { "companyId": companyInfo.companyId, "companyName": companyInfo.companyName },
            reload: true,
          }
        );
        setParentWorkMode("READ");
        setUpdateCount(0);
      } else { // api if
        // need error handle -> goto system error page?
        //setErrorList(data.body.errorList);
      }
    }
    setRecoilIsLoadingBox(false);
  }

  function onClickClose(e) {
    CUTIL.jsclose_Popup("pop-listbox-detail");
  }


  return (
    <>
      {/*<!-- 사업장 상세 정보 팝업 -->*/}
      {(zoneInfo) && <div className="popup__body">
        <div className="workplace__info mt-16">
          <div className="img_workplace">
            {(zoneInfo.image !== null)
              ? <img src={zoneInfo.image.url} alt={zoneInfo.image.name} />
              : <img src={require("/static/img/img_workplace/bg_add.jpg")} alt="사진영역" />
            }
          </div>
          <div className="txt_workplace">
            <div className="page-top">
              <h2>{companyInfo.companyName} {zoneInfo.zoneName}</h2>
              <div className="top-button">
                {/*<!--수정버튼 활성화시 active 클래스 추가해주세요~-->*/}
                <button type="button"
                  className="btn-edit"
                  data-pop="pop-listbox-detail-edit"
                  onClick={(e) => onClickZoneUpdatePopup(e, zoneInfo)}
                >
                  <span className="hide">수정</span>
                </button>
                <button type="button"
                  className="btn-delete"
                  onClick={(e) => onClickDoDeleteZone(e, zoneInfo)}
                >
                  <span className="hide">삭제</span>
                </button>
              </div>
            </div>
            <ul>
              <li>
                <p className="tit">회사 명</p>
                <p className="txt">{companyInfo.companyName}</p>
              </li>
              <li>
                <p className="tit">사업장 명</p>
                <p className="txt">{zoneInfo.zoneName}</p>
              </li>
              <li>
                <p className="tit">사업장 주소</p>
                <p className="txt">{zoneInfo.address}</p>
              </li>
              <li>
                <p className="tit">메모</p>
                <p className="txt h66">{zoneInfo.memo}</p>
              </li>
            </ul>
            <ul className="brd-top-1 mt-26 pt-32">
              <li>
                <p className="tit">상세사업장</p>
                <p className="txt">
                  <span className="fontMedium mr-4">{zoneInfo.subZoneCount}</span>개
                </p>
              </li>
              <li>
                <p className="tit">등록 기기</p>
                <p className="txt">
                  <span className="fontMedium mr-4">{zoneInfo.itemCount}</span>개
                </p>
              </li>
              <li>
                <p className="tit">User</p>
                <p className="txt">
                  <span className="fontMedium mr-4">{zoneInfo.userCount}</span>명
                </p>
              </li>
              <li className="mt-30">
                <p className="tit">진단 점수 기준</p>
                <div className="txt column">
                  <div className="result__score">
                    <p className="tit caution">Warning</p>
                    <p className="score">{zoneInfo.assessmentScore}</p>
                  </div>
                  <p className="score__info">점수기준을 충족하지 않으면, 해당 메세지가 출력됩니다.<br />
                    {'"' + zoneInfo.alarmMessage + '"'}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      }
      <div className="popup__footer">
        <button type="button"
          /*   className="btn-close" */
          onClick={(e) => onClickClose(e)}
        >
          <span>확인</span>
        </button>
      </div>
      {/*<!-- //사업장 상세 정보 팝업 -->*/}
    </>
  )

}



function ZoneUpdatePopup(props) {
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  const [isLoadingBox, setRecoilIsLoadingBox] = useRecoilState(loadingBoxState);
  //화면 이동
  const navigate = useNavigate();
  //첨부 이미지 처리 ref
  const fileRef: any = useRef();
  //props func
  const selTree = props.selTree;
  const setParentSelTree = props.setSelTree;
  const workMode = props.workMode;
  const setParentWorkMode = props.setWorkMode;
  const setParentPopWin = props.setPopWin;
  const companyInfo = props.companyInfo;
  const updateCount = props.updateCount;
  const setParentUpdateCount = props.setUpdateCount;
  //
  const [zoneInfo, setZoneInfo] = useState(null);
  useEffect(() => {
    setZoneInfo(props.zoneInfo);
    setCropedImage(null);
  }, [props.zoneInfo, updateCount])
  //const zoneInfo = props.zoneInfo;
  //const setZoneInfo = props.setZoneInfo;
  /*
    const { data: retData, error, isLoading, reload, run, } = useAsync({
      promiseFn: HTTPUTIL.PromiseHttp,
      httpMethod: "GET",
      appPath: `/api/v2/product/company/zone/admindetail?zoneId=${props.zoneInfo.zoneId}`,
      appQuery: {},
      userToken: userInfo.loginInfo.token, // url 직접 접근시 로그인 정보 사라짐..
      //watch: props.zoneInfo.zoneId+workMode
      watch: props.zoneInfo
    });
  
    useEffect(() => {
      setRecoilIsLoadingBox(true);
      const ERR_URL = HTTPUTIL.resultCheck(isLoading, retData);
      if (ERR_URL.length > 0) navigate(ERR_URL);
  
      if (retData) {
        //clog("IN ZONE UPDATE POPUP : RES : " + JSON.stringify(retData));
        if (retData.codeNum == CONST.API_200) {
          setZoneInfo(retData.body);
        }
      }
      setRecoilIsLoadingBox(false);
    }, [retData])
  */

  function callbackSetZoneInfoMemo(val) {
    setZoneInfo({ ...zoneInfo, memo: val });
  }
  function callbackSetZoneInfoAddress(val) {
    setZoneInfo({ ...zoneInfo, address: val });
  }
  const [errorList, setErrorList] = useState([]);

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


  async function onClickDoUpdateZone(e) {
    let data: any = null;
    setRecoilIsLoadingBox(true);
    data = await HTTPUTIL.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": `/api/v2/product/company/zone/${zoneInfo.zoneId}`,
      appQuery: {
        "zoneName": zoneInfo.zoneName,
        "address": zoneInfo.address,
        "memo": zoneInfo.memo,
        "assessmentScore": zoneInfo.assessmentScore
      },
      userToken: userInfo.loginInfo.token,
    });

    if (data) {
      const ERR_URL = HTTPUTIL.resultCheck(false, data);
      if (ERR_URL.length > 0) {
        setRecoilIsLoadingBox(false);
        CUTIL.sleep(500);
        navigate(ERR_URL);
      }

      if (data.codeNum == CONST.API_200) {
        clog("IN ZONE UPDATE : onClickDoUpdateZone : " + JSON.stringify(data.body));
        if (cropedImage) {
          saveAttachFiles(data.body.zoneId, cropedImage.fileForm);
        }
        setParentPopWin("pop-listbox-detail",
          <ZoneViewPopup
            htmlHeader={<h1>사업장 상세 정보</h1>}
            zoneInfo={data.body}
            companyInfo={companyInfo}
            setSelTree={props.setSelTree}
            setWorkMode={props.setWorkMode}
            setPopWin={props.setPopWin}
          />
        );

        CUTIL.jsclose_Popup("pop-listbox-detail-edit");
        CUTIL.sleep(500);

        setParentSelTree("COMPANY",
          {
            ...selTree,
            company: { "companyId": companyInfo.companyId, "companyName": companyInfo.companyName },
            reload: true,
          }
        );
        setParentWorkMode("READ");
        setParentUpdateCount(0);
      } else { // api if
        // need error handle
        setErrorList(data.body.errorList);
      }
    }
    setRecoilIsLoadingBox(false);
  }

  // option 선택 시  값 변경 액션
  function selectOptionScore(optionElement) { // 확장 가능
    const selectBox = optionElement.closest(".select");
    const selectedElement = selectBox.querySelector(".selected-value ");
    selectedElement.textContent = optionElement.textContent;
    var optionData = optionElement.getAttribute("data-value");
    selectedElement.setAttribute("data-value", optionData);
    //
    setZoneInfo({ ...zoneInfo, assessmentScore: optionData });
  }

  //clog("IN ZONEUPDATE POPUP : INIT : " + JSON.stringify(zoneInfo));
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

  function onClickClose(e) {
    var popupVal = e.target.getAttribute("data-pop");
    if (CUTIL.isnull(popupVal)) e.target.setAttribute("data-pop", "pop-listbox-detail");
    CUTIL.jsclose_Popup("pop-listbox-detail-edit");
    CUTIL.jsopen_Popup(e);
    setErrorList([]);
    setParentUpdateCount(updateCount + 1);
  }

  return (
    <>
      {/*<!-- 사업장 상세 정보 수정 팝업 -->*/}
      {(zoneInfo) && <div className="popup__body">
        <div className="workplace__info mt-16">
          {/*<div className="img_workplace">
          {(zoneInfo.image!==null)
            ?<img src={zoneInfo.image.url} alt={zoneInfo.image.name}/>                
            :<img src={require("/static/img/img_workplace/bg_add.jpg")} alt="사진영역"/>
          }
        </div>*/}
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
                : (zoneInfo.image !== null)
                  ? <img src={zoneInfo.image.url} alt={zoneInfo.image.name} />
                  : <img src={require("/static/img/img_workplace/bg_add.jpg")} alt="사진영역" />
              }
            </div>
          </div>


          <div className="txt_workplace">
            <div className="page-top">
              <h2>{companyInfo.companyName} {zoneInfo.zoneName}</h2>
              {/*<div className="top-button">
              <!--수정버튼 활성화시 active 클래스 추가해주세요~-->
              <button type="button" className="btn-edit active"><span className="hide">수정</span></button>
              <button type="button" className="btn-delete"><span className="hide">삭제</span></button>
            </div>*/}
            </div>
            <ul className="form__input">
              <li>
                <p className="tit">회사 명</p>
                <div className="input__area">
                  <input type="text" id="inp1" placeholder="텍스트를 입력하세요" disabled
                    value={companyInfo.companyName}
                  />
                </div>
              </li>
              <li>
                <p className="tit">사업장 명</p>
                <div className="input__area">
                  <input type="text" id="inp2" placeholder="텍스트를 입력하세요"
                    value={zoneInfo.zoneName}
                    className={(errorList.filter(err => (err.field === "zoneName")).length > 0) ? "input-error" : ""}
                    onChange={(e) => setZoneInfo({ ...zoneInfo, zoneName: e.target.value })}
                  />
                  <p className="input-errortxt">{errorList.filter(err => (err.field === "zoneName")).map((err) => err.msg)}</p>
                </div>
              </li>
              <li>
                <p className="tit">사업장 주소</p>
                <div className="input__area">
                  {/*<textarea placeholder="사업장 주소를 입력하세요."
                  className={`h40 ${(errorList.filter(err=>(err.field==="address")).length>0)?"input-error":""}`}
                  value={zoneInfo.address}
                  onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                  onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetZoneInfoAddress)}
                  onChange={(e) => setZoneInfo({...zoneInfo, address : e.target.value})}></textarea>
                <p className="input-errortxt">{errorList.filter(err=>(err.field==="address")).map((err)=>err.msg)}</p>                                    
                */}
                  {/*<input type="text" id="inp2" placeholder="직접입력"
                    className={(errorList.filter(err=>(err.field==="address")).length>0)?"input-error":""}
                    value={zoneInfo.address}
                    onChange={(e)=>setZoneInfo({...zoneInfo, address:e.target.value})}
                  />
                  <p className="input-errortxt">{errorList.filter(err=>(err.field==="address")).map((err)=>err.msg)}</p>                  
                */}

                  <div className="box__search">
                    <input type="text" placeholder="직접입력"
                      className={(errorList.filter(err => (err.field === "address")).length > 0) ? "input-error" : ""}
                      value={zoneInfo.address}
                      disabled
                    />
                    <button type="button"
                      className="btn btn-search"
                      data-pop="pop-postcode"
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
            </ul>
            <ul className="brd-top-1 mt-26 pt-32">
              <li>
                <p className="tit">상세사업장</p>
                <p className="txt">
                  <span className="fontMedium mr-4">{zoneInfo.subZoneCount}</span>개
                </p>
              </li>
              <li>
                <p className="tit">등록 기기</p>
                <p className="txt">
                  <span className="fontMedium mr-4">{zoneInfo.itemCount}</span>개
                </p>
              </li>
              <li>
                <p className="tit">User</p>
                <p className="txt">
                  <span className="fontMedium mr-4">{zoneInfo.userCount}</span>명
                </p>
              </li>
              <li className="mt-30">
                <p className="tit mt-8">진단 점수 기준</p>
                <div className="txt column">
                  <div className="result__score">
                    <p className="tit caution">Warning</p>
                    <div className="score">
                      <div className="select w64" onClick={(e) => CUTIL.onClickSelect(e, selectOptionScore)}>
                        <div className="selected">
                          <div className="selected-value">{zoneInfo.assessmentScore}</div>
                          <div className="arrow"></div>
                        </div>
                        <ul>
                          <li className={`option ${(zoneInfo.assessmentScore === 70) ? "on" : ""}`} data-value="50">50</li>
                          <li className={`option ${(zoneInfo.assessmentScore === 70) ? "on" : ""}`} data-value="55">55</li>
                          <li className={`option ${(zoneInfo.assessmentScore === 70) ? "on" : ""}`} data-value="60">60</li>
                          <li className={`option ${(zoneInfo.assessmentScore === 70) ? "on" : ""}`} data-value="65">65</li>
                          <li className={`option ${(zoneInfo.assessmentScore === 70) ? "on" : ""}`} data-value="70">70</li>
                          <li className={`option ${(zoneInfo.assessmentScore === 75) ? "on" : ""}`} data-value="75">75</li>
                          <li className={`option ${(zoneInfo.assessmentScore === 80) ? "on" : ""}`} data-value="80">80</li>
                          <li className={`option ${(zoneInfo.assessmentScore === 85) ? "on" : ""}`} data-value="85">85</li>
                          <li className={`option ${(zoneInfo.assessmentScore === 90) ? "on" : ""}`} data-value="90">90</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <p className="score__info">{zoneInfo.alarmMessage}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      }
      <div className="popup__footer">
        <button type="button"
          className="bg-gray btn-close"
          onClick={(e) => onClickClose(e)}
        >
          <span>취소</span>
        </button>
        <button type="button"
          className="btn-blue"
          onClick={(e) => onClickDoUpdateZone(e)}
        >
          <span>저장</span>
        </button>
      </div>
      {/*<!-- //사업장 상세 정보 팝업 -->*/}
    </>
  )

}