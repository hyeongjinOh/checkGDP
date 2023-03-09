/*
* Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
*/
/*******************************************************************
 * @author HyeonhJin Oh
 * @contact jhjoh@detech.co.kr
 * @date 2022-10-21
 * @brief EHP 챗봇 개발
 *
 ********************************************************************/
import axios from "axios";
import React, { useEffect, useState, } from "react";
import { useLocation } from "react-router-dom";
//
import * as CUTIL from "../../../utils/commUtils"

function EhpChatbot(props) {
    const [chatbot, steChatbot] = useState(false);

    function chatbotPop() {
        if (chatbot === false) {
            var body = document.body

            if (!CUTIL.isnull(body)) body.classList.add("frogue-opened");

            steChatbot(true);

            /*              
                         axios.post("https://frogue.danbee.ai/danbee/chatflow/chatbot/v2.0/b5f7097d-ae5d-4bf2-b758-e5eb8929a05f/welcome.do")
                        .then((gg)=>(
                            console.log("gg",gg)
                        )) 
            
                        console.log("location", location) */
        } else {
            steChatbot(false);
            if (!CUTIL.isnull(body)) body.classList.remove("frogue-opened");
        }

    }
    var iframe = document.createElement("iframe");

    var chatbotFrame = document.getElementById("frogue-chat-iframe");
    if (!CUTIL.isnull(chatbotFrame)) {
        chatbotFrame.setAttribute("style", "position: relative!important;height:100%!important;width: 100%!important;border: none!important;");
        chatbotFrame.setAttribute("allow", "microphone; autoplay");
        chatbotFrame.setAttribute("allowusermedia", "true");
        // iframe.setAttribute("src", "https://frogue.danbee.ai/danbee/chatflow/chatbot/v2.0/b5f7097d-ae5d-4bf2-b758-e5eb8929a05f/welcome.do")

    }
    return (
        <>
            <a className={`chatbot__toggleBtn ${(chatbot) && "close"}`} data-pop="pop-chatbot" onClick={chatbotPop} ><span className="hide">챗봇열기</span></a>
            {/* <!--챗봇팝업--> */}
            <div id="pop-chatbot" className={`popup-chatbot ${(!chatbot) && "hidden"}`}>
                {/* <!--챗봇내용넣으세요--> */}
                <iframe id="frogue-chat-iframe" name="chatbot" src="https://frogue.danbee.ai/?chatbot_id=b5f7097d-ae5d-4bf2-b758-e5eb8929a05f&force_welcome=Y"></iframe>
            </div>
            {/* <!--//챗봇팝업--> */}
        </>
    )
}

export default EhpChatbot;