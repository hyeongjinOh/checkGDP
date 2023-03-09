/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-05-25
 * @brief EHP Status 컴포넌트
 *
 ********************************************************************/
import React, { useEffect, useState, useRef } from "react";
//
import { useAsync } from "react-async";
// recoli & state
import { useRecoilValue, useSetRecoilState } from "recoil";
import { userInfoState, authState, } from '../../../../recoil/userState';
import {
  itemState,
  checkStep,
  tempCheckValue,
} from '../../../../recoil/assessmentState';

//
//utils
import clog from "../../../../utils/logUtils";
import * as HttpUtil from "../../../../utils/api/HttpUtil";
import * as CUTIL from "../../../../utils/commUtils";
//
import $ from "jquery";
import { cp } from "fs/promises";
//
import { useTrans } from "../../../../utils/langs/useTrans";

/**
 * @brief EHP Status 컴포넌트, 반응형 동작
 * @param param0 width:<number>: 화면(브라우저) 가로 사이즈
 * @param param1 height:<number>: 화면(브라우저) 세로 사이즈
 * @returns react components
 */
function EhcCheckLastTest(props) {
  const userInfo = useRecoilValue(userInfoState);
  const curItem = useRecoilValue(itemState);
  const curCheckStep = useRecoilValue(checkStep);
  const setRecoilCurCheckStep = useSetRecoilState(checkStep);
  const setRecoilTempCheckVal = useSetRecoilState(tempCheckValue);

  //
  const [totComment, setTotComment] = useState("");
  const [savedFiles, setSavedFiles] = useState([]);
  const [ehpPicture, setEhpPicture] = useState(null);
  const [popupToggle, setPopupToggle] = useState("");


  //파일 미리볼 url을 저장해줄 state
  //const [fileImage, setFileImage] = useState(null);
  //
  const fileRef: any = useRef();
  /*
  useEffect(() => {  
    setAssessmentId(srcAssessmentId);
  }, [srcAssessmentId]);
  */
  //첨부파일 
  useEffect(() => {
    if (!CUTIL.isnull(curItem.assessment.assessmentId)) {
      getSavedFiles(curItem.assessment.assessmentId);
    }
  }, [curItem]);

  async function setSaveTotalComment(item) {
    clog("IN EHCLAST : setSaveTotalComment : " + JSON.stringify(item));
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "PUT",
      "appPath": "/api/v2/assessment/value/totalComment",
      appQuery: {
        itemId: item.itemId,
        stepName: item.ehcType,
        assessmentId: item.assessment.assessmentId,
        isTempSave: false,
        versionNo: "1.0",
        totalComment: totComment
      },
    });
    if (data) {
      if (data.codeNum == 200) {
        clog("IN CHECK ITEM LAST : getSavedFiles : " + JSON.stringify(data.body));
        var inputData = {
          item: item,
          checkVal: {
            assessmentId: -1,
            checkItemId: -1,
            checkItemName: "",
            isChecked: false,
            value: "",
            valueType: "",
            comment: "",
            versionNo: ""
          },
          stepDone: true
        };
        setRecoilTempCheckVal(inputData);

        //setSavedFiles(data.body);
      } else { // api if
        // need error handle
      }
    }
    //return data;
  }

  async function getSavedFiles(assessmentId) {
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "GET",
      "appPath": "/api/v2/assessment/images",
      appQuery: {
        assessmentId: assessmentId,
      },
    });
    if (data) {
      if (data.codeNum == 200) {
        clog("IN CHECK ITEM LAST : getSavedFiles : " + JSON.stringify(data.body));
        setSavedFiles(data.body);
      } else { // api if
        // need error handle
      }
    }
    //return data;
  }

  function onClickAssessmentDone(item) {
    clog("IN UPLOAD : " + savedFiles.length);

    savedFiles.map((file, idx) => {
      if (file.hasOwnProperty("type") && (file.type == "INS")) {
        saveAttachFiles(item.assessment.assessmentId, file.fileForm);
      }
    });
    setSaveTotalComment(item);
  }

  async function saveAttachFiles(assessmentId, fileFormData) {
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "POST",
      "appPath": `/api/v2/assessment/images?assessmentId=${assessmentId}`,
      appQuery: fileFormData,
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

  async function deleteAttachFiles(imgId) {
    let data: any = null;
    data = await HttpUtil.PromiseHttp({
      "httpMethod": "DELETE",
      "appPath": "/api/v2/assessment/images",
      appQuery: {
        imageIds: imgId,
      },
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

  function onClickBeforeStep(stepVal) {
    setRecoilCurCheckStep(stepVal - 1);
  }

  function handleFileUpload(e) {
    fileRef.current.click();
  }

  // 첨부파일 저장
  function saveFileImage(e) {
    clog("save attach file : " + JSON.stringify(e.target.files[0]));
    const formData = new FormData();
    formData.append("files", e.target.files[0]);
    var fileVal = {
      imageId: "INS_" + savedFiles.length,
      name: "temp",
      url: URL.createObjectURL(e.target.files[0]),
      type: "INS",
      fileForm: formData,
    }
    setSavedFiles([...savedFiles, fileVal]);
  };

  function onClickAttachFileDelete(delFile) {
    //var delFile = savedFiles[idx];
    if (!delFile.hasOwnProperty("type")) {
      URL.revokeObjectURL(delFile.url);
      deleteAttachFiles(delFile.imageId);
    }
    setSavedFiles(savedFiles.filter(file => file.imageId !== delFile.imageId));
    setEhpPicture(null);
  }

  function onClickEhpPicture(selImg) {
    clog("TOGGLE : " + popupToggle);
    setPopupToggle((popupToggle == "on") ? "" : "on");
    setEhpPicture(selImg);
  }

  return (
    <>
      <div className="ehc__detail">
        <p className="tit">정성평가</p>
        <div className="ehc__memo">
          <p className="txtnum">{totComment.length} / 150</p>
          <textarea placeholder="의견을 입력하세요." value={totComment} onChange={(e) => setTotComment(e.target.value)}></textarea>
          {/*<!--.memo__txt는 입력된 내용뿌릴때 사용-->*/}
          <p className="memo__txt">
            {/*현충일(顯忠日)은 나라를 위해 희생한 순국선열(殉國先烈)과 전몰(戰歿)한 장병들의 충렬을 기리고 얼을 위로하기 위하여 지정된 대한민국의 중요한 기념일이다. 매년 6월 6일로, 전국 각지에서 나라를 위하여 목숨을 바친 애국선열과 국군장병들의 넋을 위로하고 그 충절을 추모하는 행사를
           거행한다.현충일에는 관공서와 각 가정, 민간 기업, 각종 단체에서 조기(弔旗)를 게양한다. 대통령 이하 3부 요인 등과 국민들은 국립묘지를 참배하고, 오전 10시 정각에 전 국민이 경건한 마음으로 명복을 비는 묵념을 1분 동안 행한다. 대통령 이하 3부 요인 등과 국민들은 국립묘지를 참배하고,
           오전 10시 정각에 전 국민이 경건한 마음으로 명복을 비는 묵념을 1분 동안 행한다. 전 국민이 경건한 마음으로 명복을 비는 묵념을 1분 동안 행한다.
       */}
          </p>
          {/*<!-- <button type="button"><span>저장</span></button> -->*/}
        </div>
      </div>
      <div className="ehc__addfile">
        <p className="tit">첨부파일</p>
        <p className="txt">500MB이하의 JPG, PNG파일 10개까지 업로드 가능합니다.</p>
        <button type="button" className="btn btn-photo" onClick={handleFileUpload}><span>파일 추가</span></button>
        {/* 파일 업로드 intput tag : 퍼블 없음*/}
        <input type="file" ref={fileRef}
          accept="image/jpg, image/jpeg, image/png"
          multiple style={{ display: "none" }}
          onChange={(e) => saveFileImage(e)} />
      </div>
      <p className="txtnum">{savedFiles.length} / 10</p>
      {/*<!--이미지 롤링 영역-->*/}
      <EhcPicture
        savedFiles={savedFiles}
        onClickAttachFileDelete={onClickAttachFileDelete}
        onClickEhpPicture={onClickEhpPicture}
      />
      <div className="tbl__bottom">
        <div className="btn__wrap">
          {/*<button type="button" className="bg-transparent"><span>이전</span></button>*/}
          {(curCheckStep > 0)
            ? <button type="button" onClick={(e) => onClickBeforeStep(curCheckStep)}><span>이전</span></button>
            : <button type="button" className="bg-transparent"><span>이전</span></button>
          }
          <button type="button" onClick={(e) => onClickAssessmentDone(curItem)}><span>결과 확인</span></button>
        </div>
      </div>
      {(ehpPicture) && <PopupPhotoCloseUp
        popupToggle={popupToggle}
        setPopupToggle={setPopupToggle}
        img={ehpPicture}
        handleFileDelete={onClickAttachFileDelete}
      />
      }
    </>
  )
}
export default EhcCheckLastTest;

function PopupPhotoCloseUp(props) {
  const setParentFileDelete = props.handleFileDelete;
  const img = props.img;
  const toggleVal = props.popupToggle;
  const setPopupToggle = props.setPopupToggle;
  clog("PhotoCloseUp : " + img.url);

  function onClickClose(e) {
    setPopupToggle("");
  }

  return (
    <>
      {/*<!--사진확대보기 팝업 -->*/}
      <div id="pop-picure" className={`popup-boxin ${toggleVal}`}>
        <div className="page-detail">
          <div className="popup__head">
            <h1>첨부파일</h1>
            <button className="btn btn-close" onClick={(e) => onClickClose(e)}><span className="hide">닫기</span></button>
          </div>
          <div className="popup__body">
            <div className="picimg__view">
              <img src={img.url} alt={img.name} />
            </div>
          </div>
          <div className="popup__footer">
            <button type="button" className="bg-gray" onClick={(e) => setParentFileDelete(img)}><span>삭제</span></button>
            <button type="button" className="close" onClick={(e) => onClickClose(e)}><span>확인</span></button>
          </div>
        </div>
      </div>
      {/*<!-- //사진확대보기 팝업 -->*/}
    </>
  )
}



function EhcPicture(props) {
  const savedFiles = props.savedFiles;
  const onClickAttachFileDelete = props.onClickAttachFileDelete;
  const onClickEhpPicture = props.onClickEhpPicture;

  const [pannelObj, setPannelObj] = useState(null);
  //
  const [curPos, setCurPos] = useState(0);
  const [listSize, setListSize] = useState(3);
  const ref = useRef(null);
  useEffect(() => {
    setPannelObj(ref.current);
  });

  function next(idx) {
    setCurPos(idx + 1);
  }
  function prev(idx) {
    setCurPos(idx - 1);
  }
  return (
    <div className="ehc__rolling">
      {/*<!--이전이미지 보기 버튼은 첫번째 이미지 이동 후, 두번째이미지 부터 보여주세요! */}
      {(curPos > 0) && <div className="rolling__left">
        <a id="prev" onClick={(e) => prev(curPos)}><span className="hide">이전이미지</span></a>
      </div>
      }
      <div className="ehc__picture">
        <ul ref={ref}>{
          savedFiles.filter((file, idx) => (idx >= curPos) && ((idx < curPos + listSize))).map((img, idx) => (
            <li key={"CHECK_IMG" + idx}>
              <button type="button" className="btn btn-delete-w" onClick={(e) => onClickAttachFileDelete(img)}>
                <span className="hide">사진삭제</span>
              </button>
              <a className="picimg" data-pop="pop-picure" onClick={(e) => onClickEhpPicture(img)}>
                <img src={img.url} alt={img.name} />
              </a>
            </li>
          ))
        }</ul>
      </div>
      {((curPos + listSize) < savedFiles.length) && <div className="rolling__right">
        <a id="next" onClick={(e) => next(curPos)}><span className="hide">다음이미지</span></a>
      </div>
      }
    </div>
  )
}