/*
 * Copyright (c) 2022 LS ELECTRIC Co. Ltd. All Reserved. 
 */
/*******************************************************************
 * @author Hyeongjin Oh
 * @contact hjoh@detech.co.kr
 * @date 2022-11-01
 * @brief EHP DashBoard  컴포넌트
 *
 ********************************************************************/
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

// ex-utils
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// utils
import clog from "../../utils/logUtils";
import * as CONST from "../../utils/Const"
import * as CUTIL from "../../utils/commUtils"

//component
import OperationStatus from "./infocards/OperationStatus";
import EhcProgress from "./infocards/EhcProgress";
import EhcStaus from "./infocards/EhcStaus";
import EhcAverageScore from "./infocards/EhcAverageScore";
//import EhcChange from "./infocards/EhcChange";
import OldDeviceStatus from "./infocards/OldDeviceStatus";
import EhcHistory from "./infocards/EhcHistory";
import EhcScore from "./infocards/EhcScore";
import EhcServices from "./infocards/EhcServices"

 /**
 * @brief EHP DashBoard 개발 컴포넌트, 반응형 동작
 * @param -
 * @returns react components
 */

function DndDashboard(props) {
  //ref, trans
  const mobileRef = useRef(null); // Mobile Check용

  //props
  const selTree = props.selTree;
  const columnList = props.columnList;
  const onParentColumnDragEnd = props.onColumnDragEnd;
  const isDraggable = props.isDraggable


  return (
    <>
      <section className="content__dragwrap" ref={mobileRef}>
        <DragDropContext onDragEnd={onParentColumnDragEnd}>
          {columnList.columns.map((column, idx) => (/*horizontal vertical*/
            <Droppable droppableId={idx.toString()/*column.id*/} direction="horizontal" key={`col_${idx.toString()}`}>
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="content"
                >
                  {column.items.map((item, index) => (
                    <InfoCard key={`ic1_${index.toString()}`}
                      selTree={selTree}
                      item={item}
                      index={index}
                      isDraggable={isDraggable}
                      colCount={props.colCount}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </section>
    </>
  );

}

export default DndDashboard;



function InfoCard(props) {
  //props
  const selTree = props.selTree;
  const item = props.item;
  const index = props.index;
  const isDraggable = props.isDraggable;
  //clog("IN INFOCARD : " + JSON.stringify(item));
  return (
    <>
      <Draggable key={`${item.colId}_${item.id}`}
        draggableId={`${item.colId}_${item.id}`}
        index={index}
        isDragDisabled={!isDraggable}
      >
        {(provided, snapshot) => (
          <article
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="box"
          >
            {(item.content === "contA") ? <OperationStatus selTree={selTree} colCount={props.colCount}/>
              : (item.content === "contB") ? <EhcProgress selTree={selTree} colCount={props.colCount}/>
                : (item.content === "contC") ? <EhcStaus selTree={selTree} colCount={props.colCount}/>
                  : (item.content === "contD") ? <EhcAverageScore selTree={selTree} colCount={props.colCount}/>
                    : (item.content === "contE") ? <OldDeviceStatus selTree={selTree} colCount={props.colCount}/>
                      : (item.content === "contF") ? <EhcScore selTree={selTree} colCount={props.colCount}/>
                      : (item.content === "contG") ? <EhcHistory selTree={selTree} colCount={props.colCount}/>
                      : (item.content === "contH") ? <EhcServices selTree={selTree} colCount={props.colCount}/>
                      : <>
                            <div className="box__header">
                              <p className="box__title">e-HC Status {item.colId} {item.id} / {index % 4}</p>
                              <div className="box__etc">
                                <button type="button" className="btn btn-setting toggle"><span className="hide">점검주기 설정</span></button>
                              </div>
                            </div>
                            <div className="box__body" style={{ "fontSize": "200px" }}>{item.id}</div>
                          </>
            }
          </article>
        )}
      </Draggable>
    </>
  )
}