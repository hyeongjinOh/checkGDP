/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-05-25
 * @brief EHP Status 컴포넌트
 *
 ********************************************************************/
import React, { useEffect, useState } from "react";
//
import { useAsync } from "react-async";
// recoli & state
import { useRecoilValue } from "recoil";
import { userInfoState, authState, } from '../../recoil/userState';
//utils
import clog from "../../utils/logUtils";
//
import $ from "jquery";
//
import { useTrans } from "../../utils/langs/useTrans";


function PaginationTest(props) {
  //const { totalCount, curPage, pageSize } = {props.totalCnt props.curPgae, props.pageSize};
  const { componentName,
    pageSize, // page w size
    totalCount,  // tcnt
    curPage, // cpage
    listSize // listsize
  } = props;

  const setParentCurPage = props.handleFunc;
  const [directPage, setDirectPage] = useState(props.curPage + 1);

  const t = useTrans();
  const pages = [];
  let totalPageSize: number = Math.ceil(totalCount / listSize);
  let startPage = (curPage <= 0) ? 0 : Math.floor(curPage / pageSize) * pageSize;
  for (let i = 0; i < totalPageSize; i++) {
    if (i >= pageSize) break;
    if ((i + startPage) >= totalPageSize) break;
    pages.push(i + startPage);
  }
  /*
  clog("IN PAGE : PAGES PS: " + pageSize + " / SP : " + startPage + " / T : " + totalCount 
                  + " / C : " + curPage + " / LC : " + listSize 
                  + " / PL : " + pages.length + " / PT : " + totalPageSize);
                  */
  function onClickPage(e) {
    var actTag = (e.target.tagName == "LI") ? e.target : e.currentTarget;
    setParentCurPage(actTag.value);
  }
  function onChangePage(e) {
    var actTag = e.target;
    //clog("IN PAGE : ON CHANGE : " + e.target.value);
    setDirectPage(actTag.value);
    //setParentCurPage(actTag.value - 1);
  }

  return (
    <>
      {/*<!--220530, 검색결과건수와 페이징 감싸는 tbl__bottom 추가됨 -->*/}
      <div className="tbl__bottom">
        {/*<!--220530, 검색결과 추가됨 -->*/}
        <p data-testid="searchResult" className="result__num">{t("COMMON.검색결과")} : <span>{totalCount}</span></p>
        <div className="paging">
          <ul className="paging__button">
            {/*<!--비활성화일경우 disabled -->*/}
            {(startPage >= pageSize)
              ? <li className="btn-first" value={0} onClick={(e) => onClickPage(e)}><a>맨 앞으로</a></li>
              : <li className="btn-first disabled"><a>맨 앞으로</a></li>
            }
            {(curPage > 0)
              ? <li className="btn-prev" value={curPage - 1} onClick={(e) => onClickPage(e)}><a>이전 페이지로</a></li>
              : <li className="btn-prev disabled"><a>이전 페이지로</a></li>
            }
            {pages.map((page, idx) => (
              <li key={"paging_" + componentName + "_" + idx} value={page} onClick={(e) => onClickPage(e)}>
                <a className={(page === curPage) ? "active" : ""}>{page + 1}</a>
              </li>
            ))}
            {((curPage + 1) < totalPageSize)
              ? <li className="btn-next" value={curPage + 1} onClick={(e) => onClickPage(e)}><a>다음 페이지로</a></li>
              : <li className="btn-next disabled"><a>다음 페이지로</a></li>
            }
            {((curPage + pageSize) < totalPageSize)
              ? <li className="btn-last" value={totalPageSize - pageSize} onClick={(e) => onClickPage(e)}><a>맨 뒤으로</a></li>
              : <li className="btn-last disabled"><a>맨 뒤으로</a></li>
            }
          </ul>
          <div className="paging__select">
            <span>Page</span>
            <input data-testid="inputPage" type="text" value={directPage} onChange={(e) => onChangePage(e)} />
            <span>/{totalPageSize}</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default PaginationTest;