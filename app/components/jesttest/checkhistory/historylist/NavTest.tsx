import React, { useState } from "react";
// recoil
import { useRecoilState, useSetRecoilState, useResetRecoilState } from "recoil";
import { menuState, urlState } from '../../../../recoil/menuState';
//
import { useNavigate } from 'react-router-dom';
//
import $ from "jquery"

/*color: ${(props) => (props.age > 20 ? 'red' : 'gray')};*/
function Nav({ handleClick }) {
    const setRecoilUrl = useSetRecoilState(urlState);
    //
    const [active, setActive] = useState(false);
    const [subActive, setSubActive] = useState(false);
    const [curMenuTagId, setCurMenuTagId] = useState<string>("-1");
    const [curMenuTagId2, setCurMenuTagId2] = useState<string>("-1");

    const [hbMenuToggle, setRecoilHbMenuToggle] = useRecoilState(menuState);
    const navigate = useNavigate();


    function onClickGoPage(url) {
        // 페이지 이동
        console.log("IN NAV : onClickGoPage : " + url);
        setRecoilUrl(url);
        navigate('/');
        //navigate(url);
        setRecoilHbMenuToggle(false);
    }

    function subMenuOnClick(e) {
        console.log("subMenu : target : " + e.target.tagName);
        console.log("subMenu : cur target : " + e.currentTarget.tagName);
        e.stopPropagation();
        $(".container").css("overflow-y", "hidden"); //body 스크롤 숨기기(화면고정)
        // li tag 가져오기
        var tmpTag = (e.target.tagName == "A") ? e.currentTarget : e.target;

        $(".navbar__menu li.active ul li").removeClass("active");

        if (curMenuTagId2 != tmpTag.id) {
            tmpTag.className = "active";
        } else {
            tmpTag.className = (subActive) ? "" : "active";
        }
        setActive(subActive ? false : true);
        // 선택된 메뉴ID 셋팅
        setCurMenuTagId2(tmpTag.id);
    }



    function menuOnClick(e) {
        console.log("subMenu : target : " + e.target);
        console.log("subMenu : cur target : " + e.currentTarget);
        e.stopPropagation();
        $(".container").css("overflow-y", "hidden"); //body 스크롤 숨기기(화면고정)
        // li tag 가져오기
        var tmpTag = (e.target.tagName == "A") ? e.currentTarget : e.target;

        $(".navbar__menu li").removeClass("active");

        if (curMenuTagId != tmpTag.id) {
            tmpTag.className = "active";
        } else {
            tmpTag.className = (active) ? "" : "active";
        }
        setActive(active ? false : true);
        // 선택된 메뉴ID 셋팅
        setCurMenuTagId(tmpTag.id);
    }


    function navbarOnClick(e) {
        console.log("navbar onClick...");
        //handleClick(e);   
        //setRecoilHbMenuToggle(hbMenuToggle?false:true);
        setRecoilHbMenuToggle(!hbMenuToggle);
    }

    return (
        <>
            {/*<!-- nav, 좌측메뉴 -->*/}
            <nav className={(hbMenuToggle) ? "navbar active" : "navbar"} onClick={(e) => { navbarOnClick(e) }}>
                <ul className="navbar__menu" onClick={(e) => { e.stopPropagation }}>
                    <li id={"0"} onClick={(e) => { menuOnClick(e) }}>
                        <a href="#">Navigation 1</a>
                        <ul>
                            <li id={"0-0"} onClick={(e) => { subMenuOnClick(e) }}><a onClick={(e) => { onClickGoPage('/main') }}>Dashboard</a></li>
                            <li id={"0-1"} onClick={(e) => { subMenuOnClick(e) }}><a>sub Navi 1-2</a></li>
                            <li id={"0-2"} onClick={(e) => { subMenuOnClick(e) }}><a>sub Navi 1-3</a></li>
                            <li id={"0-3"} onClick={(e) => { subMenuOnClick(e) }}><a>sub Navi 1-4</a></li>
                        </ul>
                    </li>
                    <li id={"1"} onClick={(e) => { menuOnClick(e) }}>
                        <a href="#">Navigation 2</a>
                    </li>
                    <li id={"2"} onClick={(e) => { menuOnClick(e) }}>
                        <a href="#">Navigation 3</a>
                    </li>
                    <li id={"3"} onClick={(e) => { menuOnClick(e) }}>
                        <a href="#">Navigation 4</a>
                    </li>
                    <li id={"4"} onClick={(e) => { menuOnClick(e) }}>
                        <a href="#">Navigation 5</a>
                    </li>
                    <li id={"5"} onClick={(e) => { menuOnClick(e) }}>
                        <a href="#">Files </a>
                        <ul>
                            <li id={"5-0"} onClick={(e) => { subMenuOnClick(e) }}><a>Test Report</a></li>
                            <li id={"5-1"} onClick={(e) => { subMenuOnClick(e) }}><a onClick={(e) => { onClickGoPage('/checkhistory') }}>Reports</a></li>
                        </ul>
                    </li>
                </ul>
            </nav>
            {/*<!-- //nav, 좌측메뉴 -->*/}
        </>
    );

}


export default Nav;