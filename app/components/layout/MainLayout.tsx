/**
 * @url /main
 * @CONST CONST.URL_MAIN_DASHBOARD
 * @menu e-Health Check
 * @mapping e-Health Checker 화면
 */
import React, { useState, useEffect } from "react";
import axios from "axios";
// recoil
import { useRecoilValue, useRecoilState } from "recoil";
import { authState, userInfoState, userInfoLoginState } from '../../recoil/userState';
// css
import "/static/css/style.css"
import "/static/css/content.css"
// utils
import clog from "../../utils/logUtils";
import * as USERUTILS from "../../utils/user/userUtils"
import * as CONST from "../../utils/Const";
import * as HttpUtil from "../../utils/api/HttpUtil"
import * as CUTIL from "../../utils/commUtils"
import * as FILEUTIL from "../../utils/file/fileUtil"
// component
import Header from "../header/Header";
import Main from "../main/Main";
// ex-module
import JSZip from "jszip"
import { report } from "process";
import { useTrans } from "../../utils/langs/useTrans";

function MainLayout() {
  const isAuth = useRecoilValue(authState);
  const [userInfo, setRecoilUserInfo] = useRecoilState(userInfoState);

  const [popListView, setPopListView] = useState(<ListViewPopup popBody={null} />);
  const [popListDetail, setPopListDetail] = useState(<ListDetailPopup popBody={null} />);
  const [popReason, setPopReason] = useState(<ReasonPopup popBody={null} />);


  useEffect(() => {
    setPopListView(popListView);
    setPopListDetail(popListDetail)
    setPopReason(popReason)
    //


  }, [popListView, popListDetail, popReason
  ])

  function handlePopWin(popType, popObj) {

    if (popType === "pop-userinfo") {
      setPopListView(<ListViewPopup popBody={popObj} />);
    }
    else if (popType === "pop-list-view") {
      setPopListDetail(<ListDetailPopup popBody={popObj} />);
    }
    else if (popType === "pop-reason") {
      setPopReason(<ReasonPopup popBody={popObj} />);
    }

    function handleCurTabMenu(tab) {
      // 승인 관리

      setPopListView(<ListViewPopup popBody={null} />);
      setPopListDetail(<ListDetailPopup popBody={null} />);
      setPopReason(<ReasonPopup popBody={null} />);

      //

    }
    //

  }
  //
  const [itemDetail, setItemDetail] = useState({
    "ehcType": "BASIC",
    "ehcPos": "",
    "itemId": "",
    "itemName": "",
    "serialNo": "",
    "itemStatus": "",
    "itemStep": null,
    "responsible": null,
    "assessment": {
      "assessmentId": null,
      "totalComment": null,
      "reportId": null,
      "updatedTime": null,
      "isTempSave": null
    },
    "checkStep": { "checkStepId": null, "name": null }
  });


  const [reportInfo, setReportInfo] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  function handleItemDetail(val) {
    setItemDetail(val);
  }
  function handleReportInfo(val) {
    clog("IN MAINLAYOUT : handleReportInfo : " + JSON.stringify(null));
    setReportInfo(val);
  }

  return (
    <>
      <div id="wrap">
        {/*<!-- #wrap -->*/}
        <Header />
        <Main
          setItemDetail={handleItemDetail}
          setReportInfo={handleReportInfo}
          reportLoading={reportLoading}
          setReportLoading={setReportLoading}
          setPopWin={handlePopWin}
        />
      </div>
      {<PopupItemDetail
        itemDetail={itemDetail}
        setReportInfo={handleReportInfo}
        setReportLoading={setReportLoading}
      />}
      {<PopupReportView
        itemDetail={itemDetail}
        reportInfo={reportInfo} />}
      {<PopupMobileReportView
        itemDetail={itemDetail}
        reportInfo={reportInfo} />}
      {popListView}
      {popListDetail}
      {popReason}
    </>
  );
}

export default MainLayout;


function PopupItemDetail(props) {
  //trans
  const t = useTrans();
  //recoil
  const userInfo = useRecoilValue(userInfoLoginState);
  //props
  const item = props.itemDetail;
  const setParentReportInfo = props.setReportInfo;
  const setParentReportLoading = props.setReportLoading;
  function onClickReportView(e, item) {
    setParentReportInfo(null);

    (async () => { // IFFE(Immediately Invoked Function Expression)은 함수가 정의되자마자 실행되는 자바스크립트 기술입니다.
      setParentReportLoading(true);
      const resp = await HttpUtil.API_reportView(item.serialNo);
      setParentReportInfo(resp);
      setParentReportLoading(false);
      CUTIL.jsopen_Popup(e);
    })();
  }

  return (
    <>
      {/*<!-- 데이터 디테일 팝업 -->*/}
      <div id="data-detail" className="popup-layer js-layer layer-out hidden page-detail">
        <div className="popup__head">
          <h1>{t("LABEL.상세정보")}</h1>
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        <div className="popup__body">
          <ul className="datadetail-info">
            <li>
              <p>{t("FIELD.시리얼번호")}</p>
              <p>{item.serialNo}</p>
            </li>
            <li>
              <p>{t("FIELD.담당자")}</p>
              <p>{item.responsible}</p>
            </li>
            <li>
              <p>{t("FIELD.위치")}</p>
              <p>{item.ehcPos}</p>
            </li>
            <li>
              <p>{t("FIELD.최근점검일")}</p>
              <p>{CUTIL.utc2time("YYYY-MM-DD", item.assessment.updatedTime)}</p>
              <p className="hide">Step</p>
              <ul className={(item.checkStep.name === "ADVANCED")
                ? "icon-step all"
                : (item.checkStep.name === "PREMIUM")
                  ? "icon-step two"
                  : (item.checkStep.name === "BASIC")
                    ? "icon-step one"
                    : "icon-step"
              }>
                <li><span className="hide">1단계</span></li>
                <li><span className="hide">2단계</span></li>
                <li><span className="hide">3단계</span></li>
              </ul>
            </li>
            <li className="btnarea">
              <div>
                {/*<button type="button" className="btn btn-file"><span className="hide">파일다운로드</span></button>*/}
                {(item.assessment.reportId != null)
                  ? <button type="button"
                    className="btn btn-file"
                    onClick={(e) => { HttpUtil.fileDownload_EhcReport(item.itemName, item.assessment.reportId, userInfo.loginInfo.token) }}>
                    <span className="hide">파일다운로드</span>
                  </button>
                  : <button type="button" className="btn btn-file" disabled>
                    <span className="hide">파일다운로드</span>
                  </button>
                }
                <p>{t("FIELD.Report")}</p>
              </div>
              <div>
                {/*<button type="button" className="btn btn-memo"><span className="hide">메모</span></button>*/}
                {(item.assessment.totalComment == null)
                  ? <button type="button" className="btn btn-memo" disabled><span className="hide">메모</span></button>
                  : <button type="button" className="btn btn-memo"><span className="hide">메모</span></button>
                }
                <p>{t("FIELD.메모")}</p>
              </div>
              <div>
                {/* {(item.serialNo) && (item.serialNo.length <= 0) */}
                {(!item.serialNo)
                  ? <button type="button" className="btn btn-file" disabled>
                    <span className="hide">성적서</span>
                  </button>
                  : <button type="button"
                    className="btn btn-file js-open"
                    data-pop="pop-downtest-mobile"
                    onClick={(e) => onClickReportView(e, item)}>
                    <span className="hide">파일다운로드</span>
                  </button>
                }
                <p>{t("FIELD.성적서")}</p>
                {/*<button type="button" className="btn btn-file" disabled><span className="hide">파일다운로드</span></button>
                <p>성적서</p>*/}
              </div>
            </li>
          </ul>
        </div>
      </div>
      {/*<!-- //데이터 디테일 팝업 -->*/}

    </>
  )
}






function PopupReportView(props) {
  const item = props.itemDetail;
  const reportInfo = props.reportInfo;
  //const reportList = (reportInfo != null ) ? reportInfo.IF_RES_DATA : null;
  const [reportList, setReportList] = useState(null);
  const [checkAll, setCheckAll] = useState(false);
  const [checkReports, setCheckReports] = useState([]);
  useEffect(() => {
    //if ( reportInfo == null ) {

    //}
    setReportList((reportInfo != null) ? reportInfo.IF_RES_DATA : null);
    setCheckAll(false);
    //setCheckReports([]);
  }, [reportInfo])

  function handleAllCheck(e) {
    var isChecked = e.target.checked;
    setCheckAll(isChecked);
    setReportList(
      reportList.map((report) => ({ ...report, "checked": isChecked }))
    )
  }

  function handleCheckReports(e, check) {
    const isChecked = e.target.checked;
    const tmpReports = reportList.map((report) => (report.REPORT_NO === check.REPORT_NO) && { ...report, "checked": isChecked })
    const tmpChecks = tmpReports.filter((report) => (report.checked));
    if (tmpChecks.length === tmpReports.length) {
      setCheckAll(true);
    } else {
      setCheckAll(false);
    }
    setReportList(tmpReports);
  }


  function pdfDownloadAll(e) {
    reportList.filter((report) => report.checked).map((report) => {
      clog("IN pdfDownloadAll : " + JSON.stringify(report));
    })
    let zips = new JSZip();
    let zipCnt = 0;
    const zipFileName = `${item.itemName}_검사성적서.zip`
    reportList.filter((report) => report.checked).map((report) => {
      const sPos = (report.PDF_LINK.lastIndexOf('/') < 0) ? 0 : report.PDF_LINK.lastIndexOf('/');
      const ePos = (report.PDF_LINK.lastIndexOf('?') < 0) ? report.PDF_LINK.length : report.PDF_LINK.lastIndexOf('?');
      var fileName = report.PDF_LINK.substring(sPos + 1, ePos);

      axios({
        method: "GET",
        url: report.PDF_LINK,
        responseType: "blob",
      }).then((resp) => {
        zips.file(fileName, resp.data);
        zipCnt++;
        return zipCnt;
      }).then((zipCnt) => {
        if (zipCnt === reportList.length) {
          //FILEUTILS.saveToFile_Chrome(fileName, response.data);
          zips.generateAsync({ type: "blob" }).then(
            function (blob) {
              FILEUTIL.saveToFile_Chrome(zipFileName, blob);
            }
          );
        }
      });
    })

  }

  return (
    <>
      {/*<!-- 시험성적서 다운로드 팝업 - 웹용, 220802 추가-->*/}
      <div id="pop-downtest" className="popup-layer js-layer layer-out hidden w720">
        <div className="popup__head">
          <h1>{item.itemName}</h1>
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        <div className="popup__body">
          <div className="tbl-list type5">
            <table summary="선택,파일 명, 생성일, 첨부 파일 항목으로 구성된 시험성적서 다운로드 목록 입니다.">
              <caption>
                시험성적서 다운로드 목록
              </caption>
              <colgroup>
                <col style={{ "width": "20px" }} />
                <col style={{ "width": "auto" }} />
                <col style={{ "width": "17%" }} />
                <col style={{ "width": "15%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col" className="w20">
                    < input type="checkbox"
                      value=""
                      id="t_all"
                      onChange={(e) => handleAllCheck(e)}
                      checked={checkAll}
                      disabled={(reportList) ? false : true}
                    />

                    <label htmlFor="t_all"><span className="hide">선택</span>
                    </label>
                  </th>
                  <th scope="col">파일 명</th>
                  <th scope="col">생성일</th>
                  <th scope="col" className="txt-center">첨부 파일</th>
                </tr>
              </thead>
              <tbody>
                {(reportList == null)
                  ? <tr key={"report_null"}>
                    <td className={"d-sm-none w20"}>
                      <p className="icon-no ml-m10"><span className="hide">파일없음</span></p>
                    </td>
                    <td className="d-sm-none">등록된 성적서가 없습니다.</td>
                    <td className="d-sm-none">-</td>
                    <td className="btn__tdarea">
                      <p className="icon-no gray"><span className="hide">파일없음</span></p>
                    </td>
                  </tr>

                  : (reportList) && reportList.map((report, idx) => (
                    <tr key={"report_" + idx}>
                      <td scope="col" className="w20" >
                        < input type="checkbox"
                          id={`chk_${idx.toString()}`}
                          //onChange={(e) => handleCheckReports(e, { ...report, "itemReportId": `${item.itemId}_${report.REPORT_NO}` })}
                          onChange={(e) => handleCheckReports(e, report)}
                          checked={(report.hasOwnProperty("checked")) ? report.checked : false}
                        />
                        <label htmlFor={`chk_${idx.toString()}`}>
                          <span className="hide">선택</span>
                        </label>
                      </td>
                      {/* <td><p className="ellipsis">{report.PDF_LINK.substring(report.PDF_LINK.lastIndexOf('/') + 1, report.PDF_LINK.lastIndexOf('.'))}</p></td> */}
                      <td><p className="ellipsis">{report.TYPE}</p></td>
                      <td>{report.CREATION_DATE.substring(0, 4) + "-" + report.CREATION_DATE.substring(4, 6) + "-" + report.CREATION_DATE.substring(6, 8)}</td>
                      <td>
                        {
                          (report.PDF_LINK == null)
                            ? <button type="button" className="btn btn-file" disabled><span className="hide">첨부 파일</span></button>
                            : <a href={report.PDF_LINK} target="_blank" rel='noreferrer'>
                              <button type="button" className="btn btn-file">
                                <span className="hide">첨부 파일</span>
                              </button>
                            </a>
                        }
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
        {(reportList == null)
          ? <div className="popup__footer brd-0 mb-10">
            <button type="button" className="bg-gray js-close"><span>Cancel</span></button>
            <button type="button" className="bg-gray">
              <span>Download</span>
            </button>
          </div>
          : <div className="popup__footer brd-0 mb-10">
            <button type="button" className="bg-gray js-close"><span>Cancel</span></button>
            {(reportList.filter((report) => report.checked).length <= 0)
              ? <button type="button" className="bg-gray">
                <span>Download</span>
              </button>
              : <button type="button" className="js-close" onClick={(e) => pdfDownloadAll(e)}>
                <span>Download</span>
              </button>
            }
          </div>
        }
      </div>
      {/*<!-- //시험성적서 다운로드 팝업 - 웹용 -->*/}
    </>

  )


}


function PopupMobileReportView(props) {
  const item = props.itemDetail;
  const reportInfo = props.reportInfo;
  //const reportList = (reportInfo != null ) ? reportInfo.IF_RES_DATA : null;
  const [reportList, setReportList] = useState(null);
  const [checkAll, setCheckAll] = useState(false);

  const [checkReports, setCheckReports] = useState([]);
  useEffect(() => {
    //if ( reportInfo == null ) {

    //}
    setReportList((reportInfo != null) ? reportInfo.IF_RES_DATA : null);
    setCheckAll(false);
    //setCheckReports([]);
  }, [reportInfo])

  function handleAllCheck(e) {
    var isChecked = e.target.checked;
    setCheckAll(isChecked);
    setReportList(
      reportList.map((report) => ({ ...report, "checked": isChecked }))
    )
  }

  function handleCheckReports(e, check) {
    const isChecked = e.target.checked;
    const tmpReports = reportList.map((report) => (report.REPORT_NO === check.REPORT_NO) && { ...report, "checked": isChecked })
    const tmpChecks = tmpReports.filter((report) => (report.checked));
    if (tmpChecks.length === tmpReports.length) {
      setCheckAll(true);
    } else {
      setCheckAll(false);
    }
    setReportList(tmpReports);
  }


  function pdfDownloadAll(e) {
    reportList.filter((report) => report.checked).map((report) => {
      clog("IN pdfDownloadAll : " + JSON.stringify(report));
    })
    let zips = new JSZip();
    let zipCnt = 0;
    const zipFileName = `${item.itemName}_검사성적서.zip`
    reportList.filter((report) => report.checked).map((report) => {
      const sPos = (report.PDF_LINK.lastIndexOf('/') < 0) ? 0 : report.PDF_LINK.lastIndexOf('/');
      const ePos = (report.PDF_LINK.lastIndexOf('?') < 0) ? report.PDF_LINK.length : report.PDF_LINK.lastIndexOf('?');
      var fileName = report.PDF_LINK.substring(sPos + 1, ePos);

      axios({
        method: "GET",
        url: report.PDF_LINK,
        responseType: "blob",
      }).then((resp) => {
        zips.file(fileName, resp.data);
        zipCnt++;
        return zipCnt;
      }).then((zipCnt) => {
        if (zipCnt === reportList.length) {
          //FILEUTILS.saveToFile_Chrome(fileName, response.data);
          zips.generateAsync({ type: "blob" }).then(
            function (blob) {
              FILEUTIL.saveToFile_Chrome(zipFileName, blob);
            }
          );
        }
      });
    })

  }

  return (
    <>
      {/*<!-- 시험성적서 다운로드 팝업 - 모바일용, 220802 추가-->*/}
      <div id="pop-downtest-mobile" className="popup-layer js-layer hidden page-detail">
        <div className="popup__head">
          <h1>{item.itemName}</h1>
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        <div className="popup__body">
          <div className="tbl-list type5">
            <table summary="선택,파일 명, 생성일, 첨부 파일 항목으로 구성된 시험성적서 다운로드 목록 입니다.">
              <caption>
                시험성적서 다운로드 목록
              </caption>
              <colgroup>
                <col className="width: 80%" />
                <col className="width: 20%" />
              </colgroup>
              <tbody>
                {(reportList == null)
                  ? <tr key={"report_null"}>
                    <td>
                      <span>등록된 성적서가 없습니다.</span>
                      <span>-</span>
                    </td>
                    <td className="btn__tdarea">
                      <button type="button" className="btn btn-file" disabled><span className="hide">첨부 파일</span></button>
                    </td>
                  </tr>
                  : (reportList) && reportList.map((report, idx) => (
                    <tr key={"report_" + idx}>
                      <td>
                        {/* <span>{report.PDF_LINK.substring(report.PDF_LINK.lastIndexOf('/') + 1, report.PDF_LINK.lastIndexOf('.'))}</span> */}
                        <span>{report.TYPE}</span>
                        <span>{report.CREATION_DATE.substring(0, 4) + "-" + report.CREATION_DATE.substring(4, 6) + "-" + report.CREATION_DATE.substring(6, 8)}</span>
                      </td>
                      <td className="btn__tdarea">
                        {(report.PDF_LINK == null)
                          ? <button type="button" className="btn btn-file" disabled><span className="hide">첨부 파일</span></button>
                          : <a href={report.PDF_LINK} target="_blank" rel='noreferrer'>
                            <button type="button" className="btn btn-file">
                              <span className="hide">첨부 파일</span>
                            </button>
                          </a>
                        }
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/*<!-- //시험성적서 다운로드 팝업 - 모바일용 -->*/}

    </>

  )


}
///
// 상세 팝업
function ListViewPopup(props) {
  const popBody = props.popBody;
  const htmlHeader = (!CUTIL.isnull(popBody))
    ? popBody.hasOwnProperty("props")
      ? popBody.props.hasOwnProperty("htmlHeader")
        ? popBody.props.htmlHeader
        : null
      : null
    : null;
  return (
    <>
      <div id="pop-userinfo" className="popup-layer js-layer layer-out hidden page-report page-detail page-workplace page-info w720">
        <div className="popup__head">
          {/* <h1>점검출동 상세정보</h1> */}
          {(htmlHeader) && htmlHeader}
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
    </>
  )
}
// 모바일 상세 팝업
function ListDetailPopup(props) {
  const popBody = props.popBody;
  const htmlHeader = (!CUTIL.isnull(popBody))
    ? popBody.hasOwnProperty("props")
      ? popBody.props.hasOwnProperty("htmlHeader")
        ? popBody.props.htmlHeader
        : null
      : null
    : null;
  return (
    <>
      <div id="pop-list-view" className="popup-layer js-layer layer-out hidden page-report page-detail page-workplace page-info page-list-view">
        <div className="popup__head">
          {/* <h1>점검출동 상세정보</h1> */}
          {(htmlHeader) && htmlHeader}
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
    </>
  )
}

function ReasonPopup(props) {
  const popBody = props.popBody;
  const htmlHeader = (!CUTIL.isnull(popBody))
    ? popBody.hasOwnProperty("props")
      ? popBody.props.hasOwnProperty("htmlHeader")
        ? popBody.props.htmlHeader
        : null
      : null
    : null;
  return (
    <>
      {/*<!-- 220826, 사유확인 팝업 -->*/}
      {/* <div id="pop-reason" className="popup-layer js-layer layer-out hidden popup-basic reason"> */}
      <div id="pop-reason" className="popup-layer popup-basic hidden page-detail w400">

        <div className="page-detail">
          <div className="popup__head">
            {(htmlHeader) && htmlHeader}
            <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
          </div>
          {(CUTIL.isnull(popBody))
            ? <></>
            : popBody
          }
        </div>
      </div>
      {/*<!-- //사유확인 팝업 -->*/}
    </>
  )
}