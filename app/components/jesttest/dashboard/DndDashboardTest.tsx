import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";

// ex-utils
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
// utils
import clog from "../../../utils/logUtils";
import * as CONST from "../../../utils/Const"
import * as CUTIL from "../../../utils/commUtils"

//component
import OperationStatusTest from "./infocards/OperationStatusTest";
import EhcProgressTest from "./infocards/EhcProgressTest";
import EhcStausTest from "./infocards/EhcStausTest";
import EhcAverageScoreTest from "./infocards/EhcAverageScoreTest";
//import EhcChange from "./infocards/EhcChange";
import OldDeviceStatusTest from "./infocards/OldDeviceStatusTest";
import EhcHistoryTest from "./infocards/EhcHistoryTest";
import EhcScoreTest from "./infocards/EhcScoreTest";
import EhcServicesTest from "./infocards/EhcServicesTest"

function DndDashboardTest(props) {
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

export default DndDashboardTest;



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
            {(item.content === "contA") ? <OperationStatusTest selTree={selTree} colCount={props.colCount}/>
              : (item.content === "contB") ? <EhcProgressTest selTree={selTree} colCount={props.colCount}/>
                : (item.content === "contC") ? <EhcStausTest selTree={selTree} colCount={props.colCount}/>
                  : (item.content === "contD") ? <EhcAverageScoreTest selTree={selTree} colCount={props.colCount}/>
                    : (item.content === "contE") ? <OldDeviceStatusTest selTree={selTree} colCount={props.colCount}/>
                      : (item.content === "contF") ? <EhcScoreTest selTree={selTree} colCount={props.colCount}/>
                      : (item.content === "contG") ? <EhcHistoryTest selTree={selTree} colCount={props.colCount}/>
                      : (item.content === "contH") ? <EhcServicesTest selTree={selTree} colCount={props.colCount}/>
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