/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-05-25
 * @brief EHP 패이징네이션 컴포넌트
 *
 ********************************************************************/
import React, { useEffect, useState } from "react";
//
import { useAsync } from "react-async";
// recoli & state
import { useRecoilValue } from "recoil";
import { userInfoState, authState, } from '../../../recoil/userState';
//utils
import clog from "../../../utils/logUtils";
//
import { useTrans } from "../../../utils/langs/useTrans";

/**
 * @brief EHP 패이징네이션 컴포넌트
 * @param - 
 * @returns react components
 */

function EhpPagination(props) {
  const t = useTrans();
  //
  const componentName = props.componentName;
  const pageInfo = props.pageInfo;
  const setParentCurPage = props.handleFunc;
  const [directPage, setDirectPage] = useState(0);

  const curPage = pageInfo.number;
  const totalCount = pageInfo.totalElements;
  const listSize = pageInfo.size;
  const lastPage = pageInfo.totalPages;
  const pageSize = (pageInfo.hasOwnProperty("psize")) ? pageInfo.psize : 10;
  const endPage = (pageInfo.totalPages % pageSize === 0) ? 1 : 0;

  const dispLabel = (props.hasOwnProperty("dispLabel"))?props.dispLabel:t("LABEL.검색결과");


  useEffect(() => {
    setDirectPage(curPage + 1);
  }, [curPage]);

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
    setDirectPage(actTag.value);
    setParentCurPage(actTag.value - 1);
  }

  return (
    <>
      {/*<!--220530, 검색결과건수와 페이징 감싸는 tbl__bottom 추가됨 -->*/}
      <div className="tbl__bottom" style={{ "cursor": "default" }}>
        {/*<!--220530, 검색결과 추가됨 -->
        <p className="result__num">{(componentName=="UserApproval") ? t("LABEL.최근90일") : t("LABEL.검색결과")} : <span>{totalCount}</span></p>
        */}
        <p className="result__num">{dispLabel} : <span>{totalCount}</span></p>
        <div id="focustop" className="paging" >
          <ul className="paging__button" style={{ "cursor": "pointer" }}>
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
                {(page === curPage)
                  ? <a className="active">{page + 1}</a>
                  : <a className="">{page + 1}</a>
                }
              </li>
            ))}
            {((curPage + 1) < totalPageSize)
              ? <li className="btn-next" value={curPage + 1} onClick={(e) => onClickPage(e)}><a>다음 페이지로</a></li>
              : <li className="btn-next disabled"><a>다음 페이지로</a></li>
            }
            {((Math.floor(curPage / pageSize) + endPage) < Math.floor(totalPageSize / pageSize))
              ? <li className="btn-last" value={lastPage - 1} onClick={(e) => onClickPage(e)}><a>맨 뒤으로</a></li>
              : <li className="btn-last disabled"><a>맨 뒤으로</a></li>
            }
          </ul>
          <div className="paging__select">
            <span>Page</span>
            <input type="text" value={directPage} onChange={(e) => onChangePage(e)} />
            <span>/{totalPageSize}</span>
          </div>
        </div>
      </div>
    </>
  )
}



export default EhpPagination;