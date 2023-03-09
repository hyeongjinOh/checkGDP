/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author HyeonhJin Oh
 * @contact jhjoh@detech.co.kr
 * @date 2022-10-21
 * @brief EHP 서비스센터 개발
 *
 ********************************************************************/
import React, { useState, } from "react";


function EhpServiceCenter(props) {
    return (
        <>
            {/* <!--221021 챗봇 및 서비스센터 버튼 추가--> */}
            <a href="https://www.ls-electric.com/ko/service/info" className="svcenter__Btn" target="_blank"><span className="hide">서비스센터 바로가기</span></a>
        </>
    )
}

export default EhpServiceCenter;