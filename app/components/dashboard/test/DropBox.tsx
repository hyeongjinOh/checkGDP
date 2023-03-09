import React, { useState } from "react";
import initialData from "./initial-data";
import Column from "./Column";
import { DragDropContext } from "react-beautiful-dnd";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
`;
const ContainerBlock = styled.div`
display: block;
`;

function DropBox() {
  const [state, setstate] = useState(() => initialData);

  const onDragEnd = (result) => {
    // destination이 끝 위치, source가 시작 위치를 의미함
    const { destination, source, draggableId } = result;

    // droppableId는 어느 column에 위치하는지, index는 해당 column에서 몇번째 task인지
    console.log(source.index, source.droppableId);
    console.log(destination?.index, destination?.droppableId); // 아무곳에 놓으면 destination이 없을 수도 있다

    // dnd를 도중에 멈췄으므로(올바른 droppable 위에 두지 않았으므로) 그냥 리턴
    if (!destination) {
      return;
    }

    // 같은 자리에 가져다 두었다면 그냥 리턴
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // 시작한 source의 droppable 위치
    const start = state.columns[source.droppableId]; // state.columns은 객체임. {id: "column-2", title: "In progress", taskIds: []} 꼴
    const finish = state.columns[destination.droppableId];

    // 한 droppable 내에서 움직이는 로직. 간단함
    if (start === finish) {
      // 새로이 만들어진 해당 컬럼의 task를 array 형태로 반환
      const newTaskIds = Array.from(start.taskIds);

      // 해당 array를 splic해서 새로 넣는 작업
      newTaskIds.splice(source.index, 1); // 현재 index 삭제함
      newTaskIds.splice(destination.index, 0, draggableId); // drop한 곳의 index에 해당 draggableId를 넣음 (splice 0 이니 삭제는 안함)

      // 새로운 컬럼
      const newColumn = {
        ...start,
        taskIds: newTaskIds,
      };

      // 기존 state와 새롭게 바뀐 정보를 넣어 새 state로 만듦
      const newState = {
        ...state,
        columns: {
          ...state.columns,
          [newColumn.id]: newColumn,
        },
      };

      setstate(newState);
      return;
    }

    // 다른 droppable로 옮기기
    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = {
      ...start,
      taskIds: startTaskIds,
    };

    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      taskIds: finishTaskIds,
    };

    const newState = {
      ...state,
      columns: {
        ...state.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    };

    setstate(newState);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Container>
        {state.columnOrder.filter((columnId, idx)=>idx<3).map((columnId, index) => {
          const column = state.columns[columnId];
          const tasks = column.taskIds.map((taskId) => state.tasks[taskId]);

          return <div style={{"display":"block"}}><Column key={column.id} column={column} tasks={tasks} /></div>;
        })}
      </Container>
      <ContainerBlock>
        {state.columnOrder.filter((columnId, idx)=>idx>=3).map((columnId, index) => {
          const column = state.columns[columnId];
          const tasks = column.taskIds.map((taskId) => state.tasks[taskId]);

          return <div style={{"display":"block"}}><Column key={column.id} column={column} tasks={tasks} /></div>;
        })}
      </ContainerBlock>

    </DragDropContext>
  );
}

export default DropBox;