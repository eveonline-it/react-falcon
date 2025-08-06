import React from 'react';
import Select from 'react-select';

const MultiSelect = ({ options, placeholder, ref, ...rest }) => {
  return (
    <Select
      ref={ref}
      closeMenuOnSelect={false}
      isMulti
      options={options}
      placeholder={placeholder}
      classNamePrefix="react-select"
      {...rest}
    />
  );
};

export default MultiSelect;
