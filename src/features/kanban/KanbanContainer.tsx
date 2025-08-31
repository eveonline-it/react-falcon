// React 19 JSX Transform - no explicit React import needed
import { useEffect, useRef, useState } from 'react';
import KanbanColumn from './KanbanColumn';
import AddAnotherForm from './AddAnotherForm';
import KanbanModal from './KanbanModal';
import IconButton from 'components/common/IconButton';
import Bowser from 'bowser';
import { useKanbanContext } from 'providers/KanbanProvider';
import { DndContext, closestCorners, DragOverlay, DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core';

import { useGetDndSensor } from 'hooks/ui/useGetDndSensor';

import { arrayMove } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

// TypeScript interfaces
interface KanbanItem {
  id: number;
  name: string;
  items: KanbanTask[];
}

interface KanbanTask {
  id: number;
  columnId?: number;
  [key: string]: any;
}

interface ListData {
  title: string;
  [key: string]: any;
}

const KanbanContainer = () => {
  const kanbanItems = useKanbanContext(state => state.kanbanItems || []);
  const kanbanModal = useKanbanContext(state => state.kanbanModal || { show: false });
  const addKanbanColumn = useKanbanContext(state => state.addKanbanColumn);
  const updateSingleColumn = useKanbanContext(state => state.updateSingleColumn);
  const updateDualColumn = useKanbanContext(state => state.updateDualColumn);

  const [showForm, setShowForm] = useState(false);
  const containerRef = useRef(null);
  const [activeTask, setActiveTask] = useState(null);
  const [overId, setOverId] = useState(null);

  const sensor = useGetDndSensor();

  const handleSubmit = (listData: ListData) => {
    const listId = Math.max(...kanbanItems.map(item => item.id)) + 1;
    const newList: KanbanItem = {
      id: listId,
      name: listData.title,
      items: []
    };
    const isEmpty = !Object.keys(listData).length;

    if (!isEmpty) {
      addKanbanColumn(newList);
      setShowForm(false);
    }
  };

  useEffect(() => {
    const browser = Bowser.getParser(window.navigator.userAgent);
    const { platform, browser: browserInfo } = browser.parse().parsedResult;

    if (platform.type === 'tablet' && containerRef.current) {
      containerRef.current.classList.add('ipad');
    }

    if (platform.type === 'mobile' && containerRef.current) {
      containerRef.current.classList.add('mobile');
      if (browserInfo.name === 'Safari') {
        containerRef.current.classList.add('safari');
      }
      if (browserInfo.name === 'Chrome') {
        containerRef.current.classList.add('chrome');
      }
    }
  }, []);

  const findColumn = (id: number | string): KanbanItem | undefined => {
    return kanbanItems.find(
      col => col.items.some(item => item.id === id) || col.id === id
    );
  };

  const getColumnIndex = (items: KanbanTask[], id: number | string): number => {
    return items.findIndex((item: KanbanTask) => item.id === Number(id));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(event.active.data.current);
  };
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const activeId = active.id;
    const overId = over.id;

    setOverId(overId);

    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id !== overColumn.id) {
      const overItems = overColumn.items;
      const activeItems = activeColumn.items;

      const activeIndex = getColumnIndex(activeItems, activeId);
      const overIndex = getColumnIndex(overItems, overId);

      const newIndex = overIndex >= 0 ? overIndex + 1 : overItems.length;

      updateDualColumn(
        activeColumn,
        overColumn,
        activeItems.filter(item => item.id !== activeId),
        [
          ...overItems.slice(0, newIndex),
          activeItems[activeIndex],
          ...overItems.slice(newIndex)
        ]
      );
    }
  };
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!active || !over) return;

    const activeColumnId = active.data.current?.columnId;
    const overColumnId = over.data.current?.columnId || over.id;

    if (!activeColumnId || !overColumnId) return;

    if (activeColumnId === overColumnId) {
      const column = kanbanItems.find(col => col.id === activeColumnId);
      const oldIndex = column.items.findIndex(item => item.id === active.id);
      const newIndex = column.items.findIndex(item => item.id === over.id);

      if (oldIndex < 0 || newIndex < 0) return;

      const reorderedItems = arrayMove(column.items, oldIndex, newIndex);

      updateSingleColumn(column, reorderedItems);
    } else {
      const sourceColumn = kanbanItems.find(col => col.id === activeColumnId);
      const destColumn = kanbanItems.find(col => col.id === overColumnId);

      const activeTask = sourceColumn.items.find(item => item.id === active.id);
      if (!activeTask) return;

      const updatedSourceItems = sourceColumn.items.filter(
        item => item.id !== active.id
      );
      const updatedDestItems = [...destColumn.items, activeTask];

      updateDualColumn(
        sourceColumn,
        destColumn,
        updatedSourceItems,
        updatedDestItems
      );
    }

    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensor}
      collisionDetection={closestCorners}
      onDragOver={handleDragOver}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-container me-n3 scrollbar" ref={containerRef}>
        {kanbanItems.map((kanbanColumnItem: KanbanItem) => (
          <KanbanColumn
            key={kanbanColumnItem.id}
            kanbanColumnItem={kanbanColumnItem}
            overId={overId}
          />
        ))}
        <div className="kanban-column">
          <AddAnotherForm
            type="list"
            onSubmit={handleSubmit}
            showForm={showForm}
            setShowForm={setShowForm}
          />
          {!showForm && (
            <IconButton
              variant="secondary"
              className="d-block w-100 border-400 bg-400"
              icon="plus"
              iconClassName="me-1"
              onClick={() => setShowForm(true)}
            >
              Add another list
            </IconButton>
          )}
        </div>
        <KanbanModal show={kanbanModal.show} />
      </div>
      <DragOverlay>
        {activeTask && (
          <TaskCard task={activeTask} cursor={true} rotate={true} />
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanContainer;
