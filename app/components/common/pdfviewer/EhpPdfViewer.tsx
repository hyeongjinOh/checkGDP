/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author JiHoon Park
 * @contact jhpark@detech.co.kr
 * @date 2022-07-19
 * @brief EHP PDF View 개발
 *
 ********************************************************************/
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useSearchParams, useParams, Outlet } from 'react-router-dom';
// css
import "/static/css/viewer.css"
// utils
import clog from "../../../utils/logUtils";
import * as CUTIL from "../../../utils/commUtils";
import * as CONST from "../../../utils/Const";
import * as HttpUtil from "../../../utils/api/HttpUtil";
import PdfViewer from "./PdfViewer";

/**
 * @brief EHP PDF View 컴포넌트
 * @param - 
 * @returns react components
 */

function EhpPdfViewer(props) {
  const params = useParams();
  const searchParams = useSearchParams();
  const location = useLocation();

  const ehpParams = location.hasOwnProperty("search")
    ? location.search.split(CONST.STR_PARAM_DATA)
    : [];
  let pdfNm = "";
  let pdfUrl = "";
  for (let i = 0; i < ehpParams.length; i++) {

    if (CONST.STR_PARAM_PDFID == ehpParams[i].substring(0, CONST.STR_PARAM_PDFID.length)) {
      pdfUrl = ehpParams[i].substring((CONST.STR_PARAM_PDFID + "=").length, ehpParams[i].length);
    }
    if (CONST.STR_PARAM_PDFNM == ehpParams[i].substring(0, CONST.STR_PARAM_PDFNM.length)) {
      pdfNm = (ehpParams[i].substring(ehpParams[i].length - 1) == "&")
        ? ehpParams[i].substring((CONST.STR_PARAM_PDFNM + "=").length, ehpParams[i].length - 1)
        : ehpParams[i].substring((CONST.STR_PARAM_PDFNM + "=").length, ehpParams[i].length);
    }

  }

  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [dispPage, setDispPage] = useState("1");
  const [viewerSize, setViewerSize] = useState({
    width: window.innerWidth * 0.852,
    height: window.innerHeight * 0.852,
  });



  const mobileRef = useRef(null); // Mobile Check용
  useEffect(() => { // resize handler
    function handleResize() {
      if (CUTIL.isnull(mobileRef)) return;
      const mobileTag = mobileRef.current;
      setViewerSize({
        width: mobileTag.clientWidth,
        height: mobileTag.clientHeight
      });
      /*
      if ((mobileTag.clientHeight <= 0) && (mobileTag.clientWidth <= 0)) {
        setParentIsMobile(true);
      } else {
        setParentIsMobile(false);
      }
      */
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, [mobileRef]);



  function downloadFile(fname, fileLink) {

    HttpUtil.fileDownload(decodeURI(fname), fileLink);
    //HttpUtil.fileDownload_EhcReport(decodeURI(fname), fileLink);

  }

  function handleFocusOut(e) {
    if (dispPage.length <= 0) {
      handleSetPageNumber(1);
    } else {
      handleSetPageNumber(dispPage);
    }

  }

  function handleEnterKey(e) {
    if ( e.key === 'Enter' ) {
      handleFocusOut(e);
    }
  }

  function handleSetDispPage(e) {
    var val = e.target.value;
    setDispPage(val.replace(/[^0-9]/g, ""));
  }

  function handleSetPageNumber(val) {
    var page=parseInt(val);
    page = (page > numPages)?numPages:page;
    page = (page < 1)?1:page;
    setPageNumber(page);
    setDispPage(page.toString());
  }

  return (
  <>
    <div className="viewer">
      <div className="viewer__top">
        <h1>{decodeURI(pdfNm)}</h1>
        <div className="paging__area">
          <p>Page</p>
          <ul className="paging__button">
            <li className={`btn-prev ${(pageNumber > 1) ? "" : "disabled"}`}
              onClick={(e) =>(pageNumber > 1)&&handleSetPageNumber(pageNumber - 1)}
            >
              <a>이전 페이지로</a>
            </li>
            <li className="viewpaging__select">
              <input type="text"
                value={dispPage}
                onChange={(e) => handleSetDispPage(e)}
                onKeyDown={(e)=>handleEnterKey(e)}
                onBlur={(e)=>handleFocusOut(e)}
                />
              <span>/{numPages}</span>
            </li>
            <li className={`btn-next ${(pageNumber < numPages)?"":"disabled"}`}
              onClick={(e)=>(pageNumber < numPages)&&handleSetPageNumber(pageNumber + 1)}
            >
              <a>다음 페이지로</a>
            </li>
          </ul>
        </div>
        <div className="top__right">
          <button type="button" className="btn-down" onClick={() => downloadFile(pdfNm, pdfUrl)}>
            <span>Download</span>
          </button>
          <img src={require("/static/img/icon_logo.png")} alt="LS산전" />
        </div>
      </div>
      <div className="viewer__document" ref={mobileRef}>
        <PdfViewer
          file={pdfUrl}
          viewerSize={viewerSize}
          numPages={numPages}
          setNumPages={setNumPages}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
        />
      </div>
    </div>
  </>
  )
}


export default EhpPdfViewer;