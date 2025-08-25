import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import Flex from './Flex';
import classNames from 'classnames';

interface DropdownItemFilterProps {
  filter: string;
  currentFilter: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  [key: string]: any;
}

const DropdownItemFilter: React.FC<DropdownItemFilterProps> = ({
  filter,
  currentFilter,
  className,
  children,
  ...rest
}) => {
  return (
    <Dropdown.Item
      as={Flex}
      justifyContent="between"
      className={classNames('cursor-pointer', className, {
        active: filter === currentFilter
      })}
      {...rest}
    >
      <>{children}</>
      {filter === currentFilter && (
        <FontAwesomeIcon icon="check" transform="down-4 shrink-4" />
      )}
    </Dropdown.Item>
  );
};

interface DropdownFilterProps {
  filters: string[];
  handleFilter: (filter: string) => void;
  currentFilter: string;
  icon: IconProp;
}

const DropdownFilter: React.FC<DropdownFilterProps> = ({ filters, handleFilter, currentFilter, icon }) => {
  return (
    <Dropdown
      className="font-sans-serif me-2"
      style={{ '--falcon-dropdown-content': 'none' } as React.CSSProperties}
    >
      <Dropdown.Toggle
        variant="falcon-default"
        className="text-600 dropdown-caret-none"
        size="sm"
      >
        {currentFilter && <span className="me-2">{currentFilter}</span>}
        <FontAwesomeIcon icon={icon} />
      </Dropdown.Toggle>

      <Dropdown.Menu className="border py-2">
        {filters.map((filter: string, index: number) => (
          <DropdownItemFilter
            currentFilter={currentFilter}
            onClick={() => {
              handleFilter(filter);
            }}
            filter={filter}
            className="text-capitalize"
            key={index}
          >
            {filter}
          </DropdownItemFilter>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default DropdownFilter;
