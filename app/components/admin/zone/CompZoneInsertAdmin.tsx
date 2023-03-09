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
import { loadingBoxState } from "../../../recoil/menuState";
// img, css etc
// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as HTTPUTIL from "../../../utils/api/HttpUtil"
import * as CUTIL from "../../../utils/commUtils"
// components
import EhpImageCrop from "../../common/imagecrop/EhpImageCrop";

/**
 * @brief EHP 사업장 전기실 관리 - 회사/사업장 등록 컴포넌트 , 반응형 동작
 * @param -
 * @returns react components
 */

//component
function CompZoneInsertAdmin(props) {
  //recoil
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
    if ( !CUTIL.isnull(mobileTag) ) {
      if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
        setParentIsMobile(true);
      } else {
        setParentIsMobile(false);
      }
    }
  }, []);

  const [companyInfo, setCompanyInfo] = useState({
    "companyId" :"",
    "companyName":"디이소프트",
    "url":"http://www.desoft.co.kr",
    "businessNo":"12345678900",
    "administrator":"오형진",
    "classification":"소프트웨어개발및공급",
    "accountManager":"박지훈",
    "accMngrTelephone":"0101112111",
    "interfaceInfo":"S/W 개발",
    "memo":"S/W 개발 전문"
  });
  // comment 길이 제한 콜백 함수
  function callbackSetCompanyInfoMemo(val) {
    setCompanyInfo({...companyInfo, memo:val});
  }
  const [zoneInfo, setZoneInfo] = useState({
    "zoneName": "",
    "address": "",
    "memo": ""
  });
  // comment 길이 제한 콜백 함수
  function callbackSetZoneInfoMemo(val) {
    setZoneInfo({...zoneInfo, memo:val});
  }
  const [cerrorList, setCErrorList] = useState([]);
  const [zerrorList, setZErrorList] = useState([]);

  const [selectedFiles, setSelectedFiles] = useState(null);
  const [cropedImage, setCropedImage] = useState(null);

  useEffect(()=>{
    setParentPopWin("pop-imgcrop",
      <EhpImageCrop 
        cropImage={selectedFiles}
        setCropedImage={handleSetCropedImage}
      />
    );
  }, [selectedFiles]); // selected files이 변경될때마다...이미지 반영을 위해

  useEffect(()=>{
    setParentPopWin("pop-area-rigth", 
      <MobileCompZoneInsertAdmin 
        htmlHeader={<h1>회사/사업장 추가</h1>}
        companyInfo={companyInfo}
        setCompanyInfo={setCompanyInfo}
        callbackSetCompanyInfoMemo={callbackSetCompanyInfoMemo}
        cerrorList={cerrorList}
        zoneInfo={zoneInfo}
        setZoneInfo={setZoneInfo}
        callbackSetZoneInfoMemo={callbackSetZoneInfoMemo}
        zerrorList={zerrorList}
        //image
        fileRef={fileRef}
        cropedImage = {cropedImage}
        onClickFileAdd = {onClickFileAdd}
        onChangeFileSelected = {onChangeFileSelected}
        //action button
        onClickZoneAdminInsert={onClickZoneAdminInsert}
        //onClickCancel={onClickCancel}
        onClickSaveCompanyZone={onClickSaveCompanyZone}
      />
    )
  });

  // 로컬 파일 URL을 통해 파일 객체 데이터 화
  function handleSetCropedImage(cropVal) {
    //clog("save croped file : " + JSON.stringify(cropVal));
    //var imgDataUrl = sigCanvas.toDataURL('image/png');
    var binaryData = atob(cropVal.url.split(',')[1]);
    var array = [];
   
    for (var i = 0; i < binaryData.length; i++) {
      array.push(binaryData.charCodeAt(i));
    }
   
    var file = new File([new Uint8Array(array)], cropVal.name, {type: 'image/png'});
    const formData = new FormData();
    formData.append("files", file);
    var fileVal = {
      fileId: "INS_0" ,//(savedFiles)?savedFiles.length:0,
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
    fileRef.current.value="";
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
      fileId: "INS_0" ,//(savedFiles)?savedFiles.length:0,
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
      "appPath": `/api/v2/product/company`,
      appQuery: {
        "companyName": companyInfo.companyName,
        "url":companyInfo.url,
        "businessNo":companyInfo.businessNo,
        "administrator":companyInfo.administrator,
        "classification":companyInfo.classification,
        "accountManager":companyInfo.accountManager,
        "accMngrTelephone":companyInfo.accMngrTelephone,
        "interfaceInfo":companyInfo.interfaceInfo,
        "memo":companyInfo.memo        
      },
      userToken: userInfo.loginInfo.token,
    });
    if (data) {
      if (data.codeNum == CONST.API_200) {
        clog("IN COMPZONEINSERTADMIN : onClickSaveCompanyZone : " + JSON.stringify(data.body));
        saveZoneInfo(data.body);
      } else { // api if
        // need error handle
        setCErrorList(data.body.errorList);
      }
    }
    setRecoilIsLoadingBox(false);
  }

  async function saveZoneInfo(companyInfo) {
    let data: any = null;
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
        setParentCurTree("ZONE",
          { ...curTree, 
            company : {"companyId":companyInfo.companyId, "companyName":companyInfo.companyName},
            zone : {"zoneId":data.body.zoneId, "zoneName":data.body.zoneName},
          }
        );
        setParentWorkMode("READ");
      } else { // api if
        // need error handle
        setZErrorList(data.body.errorList);
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

  function onClickZoneAdminInsert(e) {
    setParentWorkMode("ADMIN_CREATE");
  }

  return (
  <>
  {/*<!--area__right, 오른쪽 영역, 767이하에서는 팝업으로 노출(하단 pop-area-right 팝업 참조)*/}
  <div className="area__right" ref={mobileRef}>
    <h2>회사/사업장 추가</h2>
    {/*<!--사업장 추가내 검색,신규등록 탭*/}
    <ul className="tab__small">
    {/*<!-- 선택된 탭 on */}
      <li><a href="#" className="icon-pen" onClick={(e)=>onClickZoneAdminInsert(e)}>사업장</a></li>
      <li className="on"><a href="#" className="icon-pen">회사/사업장</a></li>
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
              <input type="text" id="inp4" placeholder="클릭하여 입력해주세요"
                value={companyInfo.companyName} 
                className={(cerrorList.filter(err=>(err.field==="companyName")).length>0)?"input-error":""}                
                onChange={(e)=>setCompanyInfo({...companyInfo, companyName:e.target.value})}
              />
              <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="companyName")).map((err)=>err.msg)}</p>                                
            </div>
            <p className="txt-info ml-24 mt-10">* e-Health Portal 에 등록된 회사만 추가가 가능합니다. 목록에 없는 경우 관리자에게 문의주세요.</p>
          </li>
          <li>
            <p className="tit">회사 URL</p>
            <div className="input__area">
              <input type="text" id="inp5"
                value={companyInfo.url} 
                className={(cerrorList.filter(err=>(err.field==="url")).length>0)?"input-error":""}                
                onChange={(e)=>setCompanyInfo({...companyInfo, url:e.target.value})}
              />
              <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="url")).map((err)=>err.msg)}</p>                                
            </div>
          </li>
          <li>
            <p className="tit star">사업자등록번호</p>
            <div className="input__area">
              <input type="text" id="inp6"
                value={companyInfo.businessNo} 
                className={(cerrorList.filter(err=>(err.field==="businessNo")).length>0)?"input-error":""}                
                onChange={(e)=>setCompanyInfo({...companyInfo, businessNo:e.target.value})}             
              />
              <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="businessNo")).map((err)=>err.msg)}</p>                                
            </div>
          </li>
          <li>
            <p className="tit">대표 관리자</p>
            <div className="input__area">
              <input type="text" placeholder="직접입력"
                value={companyInfo.administrator} 
                className={(cerrorList.filter(err=>(err.field==="administrator")).length>0)?"input-error":""}                
                onChange={(e)=>setCompanyInfo({...companyInfo, administrator:e.target.value})}             
              />
              {/*<div className="box__search">
                <input type="text" placeholder="직접입력" />
                <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
              </div>*/}
              <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="administrator")).map((err)=>err.msg)}</p>                                
            </div>
          </li>
          <li>
            <p className="tit">업종/업태</p>
            <div className="input__area">
              <input type="text" id="inp8" placeholder="텍스트를 입력하세요"
                value={companyInfo.classification} 
                className={(cerrorList.filter(err=>(err.field==="classification")).length>0)?"input-error":""}                
                onChange={(e)=>setCompanyInfo({...companyInfo, classification:e.target.value})}             
              />
              <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="classification")).map((err)=>err.msg)}</p>                                
            </div>
          </li>
          <li>
            <p className="tit">청구/정산 담당</p>
            <div className="input__area">
              {/*<div className="box__search">
                <input type="text" placeholder="직접입력" />
                <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
              </div>*/}
              <input type="text" placeholder="직접입력"
                value={companyInfo.accountManager} 
                className={(cerrorList.filter(err=>(err.field==="accountManager")).length>0)?"input-error":""}                
                onChange={(e)=>setCompanyInfo({...companyInfo, accountManager:e.target.value})}             
              />
              <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="accountManager")).map((err)=>err.msg)}</p>                                
            </div>
          </li>
          <li>
            <p className="tit">청구/정산 담당 Tel</p>
            <div className="input__area">
              <input type="text" id="inp10" placeholder="텍스트를 입력하세요"
                value={companyInfo.accMngrTelephone} 
                className={(cerrorList.filter(err=>(err.field==="accMngrTelephone")).length>0)?"input-error":""}                
                onChange={(e)=>setCompanyInfo({...companyInfo, accMngrTelephone:e.target.value})}             
              />
              <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="accMngrTelephone")).map((err)=>err.msg)}</p>                                
            </div>
          </li>
          <li>
            <p className="tit">I/F Info</p>
            <div className="input__area">
              <input type="text" id="inp11" placeholder="텍스트를 입력하세요"
                value={companyInfo.interfaceInfo} 
                className={(cerrorList.filter(err=>(err.field==="interfaceInfo")).length>0)?"input-error":""}                
                onChange={(e)=>setCompanyInfo({...companyInfo, interfaceInfo:e.target.value})}             
              />
              <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="interfaceInfo")).map((err)=>err.msg)}</p>                                
            </div>
          </li>
          <li>
            <p className="tit">메모</p>
            <div className="input__area">
              <textarea placeholder="메모를 입력하세요."
                className={(cerrorList.filter(err=>(err.field==="memo")).length>0)?"input-error":""}
                value={companyInfo.memo}
                onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetCompanyInfoMemo)}
                onChange={(e) => setCompanyInfo({...companyInfo, memo : e.target.value})}></textarea>
              <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="memo")).map((err)=>err.msg)}</p>                                    
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
                <label onClick={(e)=>onClickFileAdd(e)}>                
                  <span className="hide">사진첨부</span>
                </label>
                <input type="file" id="img" 
                  ref={fileRef}
                  accept="image/jpg, image/jpeg, image/png"
                  multiple style={{ display: "none" }}
                  onChange={(e)=>onChangeFileSelected(e)}
                  />
                </div>
              <div id="image_preview">
              {(cropedImage)
                ? <img src={cropedImage.url} alt={cropedImage.name}/>
                : <img src={require("/static/img/img_workplace/bg_add.jpg")} alt="사진영역"/>
              }
              </div>
            </div>
            <ul className="form__input ml-40">
              <li>
                <p className="tit star">사업장 명</p>
                <div className="input__area">
                  <input type="text" id="inp2" placeholder="텍스트를 입력하세요"
                    className={(zerrorList.filter(err=>(err.field==="zoneName")).length>0)?"input-error":""}
                    value={zoneInfo.zoneName}
                    onChange={(e)=>setZoneInfo({...zoneInfo, zoneName:e.target.value})}
                  />
                  <p className="input-errortxt">{zerrorList.filter(err=>(err.field==="zoneName")).map((err)=>err.msg)}</p>                  
                </div>
              </li>
              <li>
                <p className="tit star">사업장 주소</p>
                <div className="input__area">
                  <input type="text" id="inp2" placeholder="직접입력"
                    className={(zerrorList.filter(err=>(err.field==="address")).length>0)?"input-error":""}
                    value={zoneInfo.address}
                    onChange={(e)=>setZoneInfo({...zoneInfo, address:e.target.value})}
                  />
                  <p className="input-errortxt">{zerrorList.filter(err=>(err.field==="address")).map((err)=>err.msg)}</p>                                  
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
                    className={(zerrorList.filter(err=>(err.field==="memo")).length>0)?"input-error":""}
                    value={zoneInfo.memo}
                    onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                    onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetZoneInfoMemo)}
                    onChange={(e) => setZoneInfo({...zoneInfo, memo : e.target.value})}>
                  </textarea>
                  <p className="input-errortxt">{zerrorList.filter(err=>(err.field==="memo")).map((err)=>err.msg)}</p>                                                    
                </div>
              </li>
            </ul>
          </div>
          <div className="btn__wrap center">
            <button type="button" className="add__item"><span>사업장 추가</span></button>
          </div>
          <div className="btn__wrap">
            <button type="button" className="js-open" data-pop="pop-workplace"
              onClick={(e)=>onClickSaveCompanyZone(e)}
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
export default CompZoneInsertAdmin;


function MobileCompZoneInsertAdmin(props) {
  const companyInfo = props.companyInfo;
  const setCompanyInfo = props.setCompanyInfo;
  const callbackSetCompanyInfoMemo = props.callbackSetCompanyInfoMemo;
  const cerrorList = props.cerrorList;
  const zoneInfo = props.zoneInfo;
  const setZoneInfo = props.setZoneInfo;
  const callbackSetZoneInfoMemo = props.callbackSetZoneInfoMemo;
  const zerrorList = props.zerrorList;
  //new image
  const fileRef = props.fileRef;
  const cropedImage = props.cropedImage;
  const onClickFileAdd = props.onClickFileAdd;
  const onChangeFileSelected = props.onChangeFileSelected;
  //
  const onClickZoneAdminInsert = props.onClickZoneAdminInsert;
  //const onClickCancel = props.onClickCancel;
  const onClickSaveCompanyZone = props.onClickSaveCompanyZone;


return (
<>
<div className="popup__body">
  {/*<!--area__right, 오른쪽 영역*/}
  <div className="area__right" id="pop-area-right">
  {/*<!--사업장 추가내 검색,신규등록 탭*/}
    <ul className="tab__small">
      {/*<!-- 선택된 탭 on */}
      <li><a href="#" className="icon-pen" onClick={(e)=>onClickZoneAdminInsert(e)}>사업장</a></li>
      <li className="on"><a href="#" className="icon-pen">회사/사업장</a></li>
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
              <input type="text" id="inp4" placeholder="클릭하여 입력해주세요"
                value={companyInfo.companyName} 
                className={(cerrorList.filter(err=>(err.field==="companyName")).length>0)?"input-error":""}                
                onChange={(e)=>setCompanyInfo({...companyInfo, companyName:e.target.value})}
              />
              <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="companyName")).map((err)=>err.msg)}</p>                                
            </div>
            <p className="txt-info ml-24 mt-10">* e-Health Portal 에 등록된 회사만 추가가 가능합니다. 목록에 없는 경우 관리자에게 문의주세요.</p>
            </li>
            <li>
              <p className="tit">회사 URL</p>
              <div className="input__area">
                <input type="text" id="inp5"
                  value={companyInfo.url} 
                  className={(cerrorList.filter(err=>(err.field==="url")).length>0)?"input-error":""}                
                  onChange={(e)=>setCompanyInfo({...companyInfo, url:e.target.value})}
                />
                <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="url")).map((err)=>err.msg)}</p>                                
              </div>              
            </li>
            <li>
              <p className="tit">사업자등록번호</p>
              <div className="input__area">
                <input type="text" id="inp6"
                  value={companyInfo.businessNo} 
                  className={(cerrorList.filter(err=>(err.field==="businessNo")).length>0)?"input-error":""}                
                  onChange={(e)=>setCompanyInfo({...companyInfo, businessNo:e.target.value})}             
                />
                <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="businessNo")).map((err)=>err.msg)}</p>                                
              </div>            
            </li>
            <li>
              <p className="tit">대표 관리자</p>
              <div className="input__area">
                <input type="text" placeholder="직접입력"
                  value={companyInfo.administrator} 
                  className={(cerrorList.filter(err=>(err.field==="administrator")).length>0)?"input-error":""}                
                  onChange={(e)=>setCompanyInfo({...companyInfo, administrator:e.target.value})}             
                />
                {/*<div className="box__search">
                <input type="text" placeholder="직접입력" />
                <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
                </div>*/}
                <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="administrator")).map((err)=>err.msg)}</p>                                
              </div>
            </li>
            <li>
              <p className="tit">업종/업태</p>
              <div className="input__area">
                <input type="text" id="inp8" placeholder="텍스트를 입력하세요"
                  value={companyInfo.classification} 
                  className={(cerrorList.filter(err=>(err.field==="classification")).length>0)?"input-error":""}                
                  onChange={(e)=>setCompanyInfo({...companyInfo, classification:e.target.value})}             
                />
                <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="classification")).map((err)=>err.msg)}</p>                                
              </div>
            </li>
            <li>
              <p className="tit">청구/정산 담당</p>
              <div className="input__area">
                {/*<div className="box__search">
                  <input type="text" placeholder="직접입력" />
                  <button type="button" className="btn btn-search"><span className="hide">조회</span></button>
                </div>*/}
                <input type="text" placeholder="직접입력"
                  value={companyInfo.accountManager} 
                  className={(cerrorList.filter(err=>(err.field==="accountManager")).length>0)?"input-error":""}                
                  onChange={(e)=>setCompanyInfo({...companyInfo, accountManager:e.target.value})}             
                />
                <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="accountManager")).map((err)=>err.msg)}</p>                                
              </div>
            </li>
            <li>
              <p className="tit">청구/정산 담당 Tel</p>
              <div className="input__area">
                <input type="text" id="inp10" placeholder="텍스트를 입력하세요"
                  value={companyInfo.accMngrTelephone} 
                  className={(cerrorList.filter(err=>(err.field==="accMngrTelephone")).length>0)?"input-error":""}                
                  onChange={(e)=>setCompanyInfo({...companyInfo, accMngrTelephone:e.target.value})}             
                />
                <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="accMngrTelephone")).map((err)=>err.msg)}</p>                                
              </div>
            </li>
            <li>
              <p className="tit">I/F Info</p>
              <div className="input__area">
                <input type="text" id="inp11" placeholder="텍스트를 입력하세요"
                  value={companyInfo.interfaceInfo} 
                  className={(cerrorList.filter(err=>(err.field==="interfaceInfo")).length>0)?"input-error":""}                
                  onChange={(e)=>setCompanyInfo({...companyInfo, interfaceInfo:e.target.value})}             
                />
                <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="interfaceInfo")).map((err)=>err.msg)}</p>                                
              </div>
            </li>
            <li>
              <p className="tit">메모</p>
              <div className="input__area">
                <textarea placeholder="메모를 입력하세요."
                  className={(cerrorList.filter(err=>(err.field==="memo")).length>0)?"input-error":""}
                  value={companyInfo.memo}
                  onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                  onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetCompanyInfoMemo)}
                  onChange={(e) => setCompanyInfo({...companyInfo, memo : e.target.value})}>
                </textarea>
                <p className="input-errortxt">{cerrorList.filter(err=>(err.field==="memo")).map((err)=>err.msg)}</p>                                    
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
                  <label onClick={(e)=>onClickFileAdd(e)}>                
                    <span className="hide">사진첨부</span>
                  </label>
                  <input type="file" id="img" 
                    ref={fileRef}
                    accept="image/jpg, image/jpeg, image/png"
                    multiple style={{ display: "none" }}
                    onChange={(e)=>onChangeFileSelected(e)}
                  />
                </div>
                <div id="image_preview">
                {(cropedImage)
                  ? <img src={cropedImage.url} alt={cropedImage.name}/>
                  : <img src={require("/static/img/img_workplace/bg_add.jpg")} alt="사진영역"/>
                }
                </div>
              </div>
              <ul className="form__input ml-40">
                <li>
                  <p className="tit star">사업장 명</p>
                  <div className="input__area">
                    <input type="text" id="inp2" placeholder="텍스트를 입력하세요"
                      className={(zerrorList.filter(err=>(err.field==="zoneName")).length>0)?"input-error":""}
                      value={zoneInfo.zoneName}
                      onChange={(e)=>setZoneInfo({...zoneInfo, zoneName:e.target.value})}
                    />
                    <p className="input-errortxt">{zerrorList.filter(err=>(err.field==="zoneName")).map((err)=>err.msg)}</p>                  
                  </div>
                </li>
                <li>
                  <p className="tit star">사업장 주소</p>
                  <div className="input__area">
                    <input type="text" id="inp2" placeholder="직접입력"
                      className={(zerrorList.filter(err=>(err.field==="address")).length>0)?"input-error":""}
                      value={zoneInfo.address}
                      onChange={(e)=>setZoneInfo({...zoneInfo, address:e.target.value})}
                    />
                    <p className="input-errortxt">{zerrorList.filter(err=>(err.field==="address")).map((err)=>err.msg)}</p>                                  
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
                      className={(zerrorList.filter(err=>(err.field==="memo")).length>0)?"input-error":""}
                      value={zoneInfo.memo}
                      onKeyPress={(e) => CUTIL.beforeHandleComment(e, 120)}
                      onKeyUp={(e) => CUTIL.afterHandleComment(e, 120, callbackSetZoneInfoMemo)}
                      onChange={(e) => setZoneInfo({...zoneInfo, memo : e.target.value})}>
                    </textarea>
                    <p className="input-errortxt">{zerrorList.filter(err=>(err.field==="memo")).map((err)=>err.msg)}</p>                                                    
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
          <button type="button" className="bg-gray btn-close js-close"
            onClick={(e)=>CUTIL.jsclose_Popup("pop-area-right")}
          >
            <span>취소</span>
          </button>
          <button type="button"
            onClick={(e)=>onClickSaveCompanyZone(e)}
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