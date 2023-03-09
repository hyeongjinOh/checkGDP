import { array } from "prop-types";
import React from "react";
import styled from "styled-components";

const PageUl = styled.ul`
  float: left;
  list-style: none;
  text-align: center;
  border-radius: 3px;
  color: white;
  padding: 1px;
  border-top: 3px solid #186ead;
  border-bottom: 3px solid #186ead;
  background-color: rgba(0, 0, 0, 0.4);
`;

const PageLi = styled.li`
  display: inline-block;
  font-size: 17px;
  font-weight: 600;
  padding: 5px;
  border-radius: 5px;
  width: 25px;
  &:hover {
    cursor: pointer;
    color: white;
    background-color: #263a6c;
  }
  &:focus::after {
    color: white;
    background-color: #263a6c;
  }
`;

const PageSpan = styled.span`
  &:hover::after,
  &:focus::after {
    border-radius: 100%;
    color: white;
    background-color: #263a6c;
  }
`;

const Pagination = ({ pgCnt, listCnt, sPg, totCnt, paginate }) => {
  const pgNums = [];
  let dPgCnt:number = Math.ceil(totCnt / listCnt);

  for (let i = 0; i < dPgCnt; i ++) {
    //if ( i > pgCnt ) continue;
    pgNums.push(i);
  }
  let cMok:number = Math.floor(sPg/pgCnt);
  let cMod:number = sPg%pgCnt;
  let nMok:number = Math.floor(sPg/pgCnt)*pgCnt;
  return (
    <div>
      <nav>
        <PageUl className="pagination">
          {
            (cMok > 0)&&
            <PageLi key={"bb"+0} className="page-item">
              {<PageSpan onClick={() => paginate(0)} className="page-link">{"<<"}</PageSpan>}
            </PageLi>
          }
          {
            (cMok > 0)&&
            <PageLi key={"b"+(sPg-1)} className="page-item">
              {<PageSpan onClick={() => paginate(sPg-1)} className="page-link">{"<"}</PageSpan>}
            </PageLi>
          }
          {pgNums.map((page, idx) => (
            (Math.floor(page/pgCnt) === cMok)&&
            <PageLi key={"c"+(idx)} className="page-item">
              {<PageSpan onClick={() => paginate(page)} className="page-link">{page+1}</PageSpan>}
            </PageLi>
          ))}
          {
            (dPgCnt > (sPg+pgCnt))&&
            <PageLi key={"n"+(sPg+1)} className="page-item">
              {<PageSpan onClick={() => paginate(sPg+1)} className="page-link">{">"}</PageSpan>}
            </PageLi>
          }
          {
            (dPgCnt > (sPg+pgCnt))&&
            <PageLi key={"nn"+(dPgCnt)} className="page-item">
              {<PageSpan onClick={() => paginate(dPgCnt-1)} className="page-link">{">>"}</PageSpan>}
            </PageLi>
          }
        </PageUl>
      </nav>
    </div>
  );
};

export default Pagination;