/**
 * @url /reportview  
 * @CONST CONST.URL_REPORTVIEW
 * @menu Report
 * @mapping Test Report 화면
 */
import React, {useState} from "react";

// css
import "/static/css/style.css"
import "/static/css/content.css"
import "/static/css/swiper.css"
// utils
import clog from "../../utils/logUtils";
// component
import Header from "../header/Header";
import CheckReportMain from "../checkReport/CheckReportMain";


function CheckReportLayout() {
  //
  const [itemDetail, setItemDetail] = useState({
    "ehcType":"BASIC",
    "ehcPos":"",
    "id":-1,
    "itemName":"",
    "serialNo":"",
    "itemStatus":"",
    "itemStep":null,
    "responsible":null,
    "assessment":{
        "assessmentId":null,
        "totalComment":null,
        "reportId":null,
        "updatedTime":null,
        "isTempSave":null},
    "checkStep":{"checkStepId":null,"name":null}
  });
  
  function handleItemDetail(val) {
    setItemDetail(val);
  }

  return (
    <>
    <div id="wrap">
    {/*<!-- #wrap -->*/}
      <Header />
      {<CheckReportMain 
        setItemDetail={handleItemDetail} />}
    </div>
    {/*<Logout />
    <div className="dimm"></div>
    <!-- 레이어팝업 배경 -->*/}
    </>
  );
}

export default CheckReportLayout;


