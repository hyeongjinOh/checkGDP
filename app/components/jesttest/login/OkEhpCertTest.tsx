import React from "react";
import { useNavigate } from "react-router-dom";

function OkEhpCertification() {
    const navigate = useNavigate();

    return (
        <>
            {/*<!-- #login -->*/}


            {/*<!-- .login__right, 오른쪽영역 / 220923 인증완료추가 -->*/}
            <div className="login__right webmailok">
                <h2>
                    <p className="tit">인증 완료</p>
                </h2>
                <div className="login__form">
                    <form action="#" method="" name="loginform">
                        <fieldset>
                            <p className="login__info">메일 인증이 정상적으로 완료 되었습니다.</p>
                            <button type="button" className="btn-login" onClick={(e) => navigate("/")}><span>로그인하기</span></button>
                        </fieldset>
                    </form>
                </div>
            </div>
            {/*<!-- //.login__right, 오른쪽영역 -->*/}
        </>
    )
}

export default OkEhpCertification;





