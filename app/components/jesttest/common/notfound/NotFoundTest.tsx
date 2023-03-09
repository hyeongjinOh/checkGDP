import React from "react";

// UTILS
import * as CONST from "../../../../utils/Const"

//
function NotFoundTest() {


    return (
        <>
            {/*<div className={"text-center"} >
      <h1>USER 404 not found</h1>
    </div>
    <button className={"text-center"} onClick={(e)=>onClickGoPage(CONST.URL_EHP)}>
      <p>홈으로 가기</p>
  </button>*/}
            {/*<!-- main, 컨테이너영역 -->*/}
            <main className="container filereports">
                {/*<!--220803, 에러영역추가-->
      <div class="area__error">
        <strong>서비스 점검 중 입니다.</strong>
        <p>서비스를 일시 중단 하오니 잠시 후 이용해 주세요.</p>
      </div>*/}
                {/*<!--404에러인 경우, error-404 추가 -->*/}
                <div className="area__error error-404">
                    <p>주소가 만료되었거나, 요청하신 페이지가 없습니다.</p>
                </div>
            </main>
            {/*<!-- //main, 컨테이너영역 --> */}
        </>
    )
}

export default NotFoundTest;