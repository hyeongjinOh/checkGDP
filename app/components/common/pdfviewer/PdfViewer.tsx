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
import React, {useState, useEffect, useLayoutEffect} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import clog from "../../../utils/logUtils";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

/**
 * @brief EHP PDF View 컴포넌트
 * @param - 
 * @returns react components
 */


function PdfViewer(props) {
  const pdfUrl = props.file;

  //const windowSize = useWindowSize();
  //const [numPages, setNumPages] = useState(0);
  //const [pageNumber, setPageNumber] = useState(1);
  const windowSize = props.viewerSize;
  const numPages = props.numPages;
  const setNumPages = props.setNumPages;
  const pageNumber = props.pageNumber;
  const setPageNumber = props.setPageNumber;

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  clog("IN PDFVIEWER : SIZE : " + JSON.stringify(windowSize));

  return (
    <>
      <Document
        //file="/static/doc/test.pdf"
        file = {pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {/* width, height값을 훅에서 가져온 값으로 넣어줍니다 */}
        <Page
          width={windowSize.width}
          height={windowSize.height}
          pageNumber={pageNumber}
        />
      </Document>
      {/*
      Page {pageNumber} of {numPages}
      {pageNumber > 1 && (
        <button onClick={() => setPageNumber(prev => prev + -1)}>
          이전페이지
        </button>
      )}
      {pageNumber < numPages && <button onClick={() => setPageNumber(prev => prev + +1)}>다음페이지</button>}
      */}
    </>
  );

}

export default PdfViewer;



function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight
        });
      };

      window.addEventListener("resize", handleResize);
      handleResize();

      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);
  return windowSize;
};