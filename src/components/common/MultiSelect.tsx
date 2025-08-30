import { forwardRef } from 'react';
import Select, { Props as SelectProps, GroupBase } from 'react-select';

interface OptionType {
  value: any;
  label: string;
}

interface MultiSelectProps extends Omit<SelectProps<OptionType, true, GroupBase<OptionType>>, 'isMulti' | 'closeMenuOnSelect'> {
  options: OptionType[];
  placeholder?: string;
}

const MultiSelect = forwardRef<Select<OptionType, true, GroupBase<OptionType>>, MultiSelectProps>(
  ({ options, placeholder, ...rest }, ref) => {
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
  }
);

MultiSelect.displayName = 'MultiSelect';

export default MultiSelect;
