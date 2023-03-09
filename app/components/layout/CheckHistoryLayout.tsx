/**
 * @url /checkhistory
 * @CONST CONST.URL_CHECKHISTORY
 * @menu Report
 * @mapping 진단점검 Report 화면 
 */
import React, { useEffect, useState } from "react";

// css
import "/static/css/style.css"
import "/static/css/content.css"
import "/static/css/swiper.css"
// utils
import clog from "../../utils/logUtils";
// component
import Header from "../header/Header";
import HistoryMain from "../checkhistory/HistoryMain";
import ListDetail from "../main/itemlist/ListDetail";
import * as CUTIL from "../../utils/commUtils";


function CheckHistoryLayout() {

  const [popListView, setPopListView] = useState(<ListViewPopup popBody={null} />);
  const [popFilterView, setPopFilterView] = useState(<FilterViewPopup popBody={null} />);
  const [popSearch, setPopSearch] = useState(<SearchPopup popBody={null} />);


  useEffect(() => {
    setPopListView(popListView);
    setPopFilterView(popFilterView);
    setPopSearch(popSearch)

    //


  }, [popListView, popFilterView, popSearch
  ])

  function handlePopWin(popType, popObj) {

    if (popType === "pop-list-view") {
      setPopListView(<ListViewPopup popBody={popObj} />);
    }
    else if (popType === "pop-filter") {
      setPopFilterView(<FilterViewPopup popBody={popObj} />);
    }
    else if (popType === "pop-search-small") {
      setPopSearch(<SearchPopup popBody={popObj} />);
    }
    function handleCurTabMenu(tab) {


      setPopListView(<ListViewPopup popBody={null} />);
      setPopFilterView(<FilterViewPopup popBody={null} />);
      setPopSearch(<SearchPopup popBody={null} />);

      //

    }
    //

  }

  //
  const [itemDetail, setItemDetail] = useState({
    "ehcType": "BASIC",
    "ehcPos": "",
    "id": -1,
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

  function handleItemDetail(val) {
    setItemDetail(val);
  }

  return (
    <>
      <div id="wrap">
        {/*<!-- #wrap -->*/}
        <Header />
        {<HistoryMain
          setItemDetail={handleItemDetail}
          setPopWin={handlePopWin}
        />}
      </div>
      {popListView}
      {popFilterView}
      {popSearch}

      <ListDetail itemDetail={itemDetail} />
      {/*<Logout />
    <div className="dimm"></div>
    <!-- 레이어팝업 배경 -->*/}
    </>
  );
}

export default CheckHistoryLayout;


// 모바일 상세 팝업
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

function FilterViewPopup(props) {
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
      {/* <!-- filter 팝업 --> */}
      <div id="pop-filter" className="popup-layer js-layer layer-out hidden page-detail page-report">
        <div className="popup__head">
          <h1 className="icon-filter">Filter</h1>
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        {(CUTIL.isnull(popBody))
          ? <></>
          : popBody
        }
      </div>
      {/* <!-- //filter 팝업 --> */}
    </>
  )
}

// 검색 팝업
function SearchPopup(props) {
  const popBody = props.popBody;

  return (
    <>
      <div id="pop-search-small" className="popup-layer layer-out js-layer hidden page-detail page-report ">
        <div className="popup__head">
          <h1 className="icon-search">검색</h1>
          <button className="btn btn-close js-close"><span className="hide">닫기</span></button>
        </div>
        {(popBody === null)
          ? <></>
          : popBody
        }
      </div>
    </>
  )
}