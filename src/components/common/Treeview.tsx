import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { Collapse } from 'react-bootstrap';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface TreeviewItem {
  id: string | number;
  name: string;
  icon?: IconProp;
  iconClass?: string;
  expanded?: boolean;
  children?: TreeviewItem[];
}

interface TreeviewListItemProps {
  item: TreeviewItem;
  openedItems: (string | number)[];
  setOpenedItems: React.Dispatch<React.SetStateAction<(string | number)[]>>;
  selectedItems: (string | number)[];
  setSelectedItems: React.Dispatch<React.SetStateAction<(string | number)[]>>;
  selection?: boolean;
  index?: number;
}

interface TreeviewProps {
  data: TreeviewItem[];
  selection?: boolean;
  expanded?: (string | number)[];
  selectedItems?: (string | number)[];
  setSelectedItems?: React.Dispatch<React.SetStateAction<(string | number)[]>>;
}

const TreeviewListItem: React.FC<TreeviewListItemProps> = ({
  item,
  openedItems,
  setOpenedItems,
  selectedItems,
  setSelectedItems,
  selection
}) => {
  const [open, setOpen] = useState<boolean>(openedItems.indexOf(item.id) !== -1);
  const [children, setChildren] = useState<(string | number)[]>([]);
  const [firstChildren, setFirstChildren] = useState<(string | number)[]>([]);
  const [childrenOpen, setChildrenOpen] = useState<boolean>(false);
  const checkRef = useRef<HTMLInputElement>(null);

  const getChildrens = (item: TreeviewItem): (string | number)[] => {
    function flatInnter(item: TreeviewItem[]): (string | number)[] {
      let flat: (string | number)[] = [];
      item.map((child: TreeviewItem) => {
        if (child.children) {
          flat = [...flat, child.id, ...flatInnter(child.children)];
        } else {
          flat = [...flat, child.id];
        }
      });

      return flat;
    }
    if (item.children) {
      return flatInnter(item.children);
    } else {
      return [];
    }
  };

  const isChildrenOpen = (): boolean => {
    return openedItems.some((item: string | number) => firstChildren.indexOf(item) !== -1);
  };

  const handleOnExiting = (): void => {
    setOpenedItems(openedItems.filter((openedItem: string | number) => openedItem !== item.id));
  };
  const handleEntering = (): void => {
    setOpenedItems([...openedItems, item.id]);
  };

  const handleSingleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.checked) {
      setSelectedItems([...selectedItems, item.id]);
    } else {
      setSelectedItems(
        selectedItems.filter((selectedItem: string | number) => selectedItem !== item.id)
      );
    }
  };

  const handleParentCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const filteredItems = selectedItems.filter(
      (selectedItem: string | number) => children.indexOf(selectedItem) === -1
    );
    if (e.target.checked) {
      setSelectedItems([...filteredItems, ...children]);
    } else {
      setSelectedItems(filteredItems);
    }
  };

  useEffect(() => {
    setChildren(getChildrens(item));
    if (item.children) {
      setFirstChildren(item.children.map((child: TreeviewItem) => child.id));
    }
  }, [item]);

  useEffect(() => {
    setChildrenOpen(isChildrenOpen());
  }, [children, openedItems]);

  useEffect(() => {
    const childrenSelected = selectedItems.some(
      (selectedItem: string | number) => children.indexOf(selectedItem) !== -1
    );
    const allChildrenSelected = children.every(
      (child: string | number) => selectedItems.indexOf(child) !== -1
    );
    if (childrenSelected && checkRef.current) {
      checkRef.current.indeterminate = true;
    }
    if (!childrenSelected && checkRef.current) {
      checkRef.current.indeterminate = false;
    }
    if (allChildrenSelected && checkRef.current) {
      checkRef.current.indeterminate = false;
      checkRef.current.checked = true;
    }
    if (!allChildrenSelected && checkRef.current) {
      checkRef.current.checked = false;
    }
  }, [selectedItems, children]);

  return (
    <li className="treeview-list-item">
      {Object.prototype.hasOwnProperty.call(item, 'children') ? (
        <>
          <div className="toggle-container">
            {selection && (
              <input
                type="checkbox"
                className="form-check-input"
                onChange={handleParentCheckboxChange}
                ref={checkRef}
              />
            )}
            <a
              className={classNames('collapse-toggle', {
                collapsed: open || item.expanded
              })}
              href="#!"
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault();
                setOpen(!open);
              }}
            >
              <p
                className={classNames('treeview-text', { 'ms-2': !selection })}
              >
                {item.name}
              </p>
            </a>
          </div>
          <Collapse
            in={open}
            onExiting={handleOnExiting}
            onEntering={handleEntering}
          >
            <ul
              className={classNames('treeview-list', {
                'collapse-hidden': !open,
                'collapse-show treeview-border': open,
                'treeview-border-transparent': childrenOpen
              })}
            >
              {item.children!.map((nestedItem: TreeviewItem, index: number) => (
                <TreeviewListItem
                  key={index}
                  item={nestedItem}
                  index={index}
                  openedItems={openedItems}
                  setOpenedItems={setOpenedItems}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                  selection={selection}
                />
              ))}
            </ul>
          </Collapse>
        </>
      ) : (
        <div className="treeview-item">
          {selection && (
            <input
              type="checkbox"
              className="form-check-input"
              onChange={handleSingleCheckboxChange}
              checked={selectedItems.indexOf(item.id) !== -1}
            />
          )}
          <a 
            href="#!" 
            className="flex-1"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => e.preventDefault()}
          >
            <p className="treeview-text">
              {item.icon && (
                <FontAwesomeIcon
                  icon={item.icon}
                  className={classNames('me-2', item.iconClass)}
                />
              )}
              {item.name}
            </p>
          </a>
        </div>
      )}
    </li>
  );
};

const Treeview: React.FC<TreeviewProps> = ({
  data,
  selection,
  expanded = [],
  selectedItems = [],
  setSelectedItems
}) => {
  const [openedItems, setOpenedItems] = useState<(string | number)[]>(expanded);

  return (
    <ul className="treeview treeview-select">
      {data.map((treeviewItem: TreeviewItem, index: number) => (
        <TreeviewListItem
          key={index}
          item={treeviewItem}
          openedItems={openedItems}
          setOpenedItems={setOpenedItems}
          selectedItems={selectedItems || []}
          setSelectedItems={setSelectedItems || (() => {})}
          selection={selection}
        />
      ))}
    </ul>
  );
};

export default Treeview;
