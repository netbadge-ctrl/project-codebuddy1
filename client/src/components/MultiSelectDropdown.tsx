import React, { useState, Fragment } from 'react';
import { Combobox, Transition } from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
}

export interface GroupedOption {
  label: string;
  options: Option[];
}

interface MultiSelectDropdownProps {
  options: GroupedOption[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = '请选择...',
}) => {
  const [query, setQuery] = useState('');

  const allOptions = options.flatMap(group => group.options);

  const filteredOptions =
    query === ''
      ? options
      : options.map(group => ({
          ...group,
          options: group.options.filter(option =>
            option.label.toLowerCase().includes(query.toLowerCase())
          ),
        })).filter(group => group.options.length > 0);

  const getSelectedLabels = () => {
    const labels = allOptions
      .filter(opt => selectedValues.includes(opt.value))
      .map(opt => opt.label);
    if (labels.length === 0) return placeholder;
    if (labels.length > 2) return `${labels.slice(0, 2).join(', ')}...`;
    return labels.join(', ');
  };

  return (
    <Combobox value={selectedValues} onChange={onChange} multiple>
      <div className="relative">
        <Combobox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
          <span className="block truncate">{getSelectedLabels()}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </Combobox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery('')}
        >
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-20">
            <div className="p-2">
              <Combobox.Input
                className="w-full border-gray-300 rounded-md p-2"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索..."
              />
            </div>
            {filteredOptions.map((group) => (
              <div key={group.label}>
                <div className="px-4 py-2 text-xs font-bold text-gray-500">{group.label}</div>
                {group.options.map((option) => (
                  <Combobox.Option
                    key={option.value}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-teal-600 text-white' : 'text-gray-900'
                      }`
                    }
                    value={option.value}
                  >
                    {({ selected, active }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {option.label}
                        </span>
                        {selected ? (
                          <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-teal-600'}`}>
                            <Check className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </div>
            ))}
             {filteredOptions.length === 0 && query !== '' ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                  无匹配结果。
                </div>
              ) : null}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
};

export default MultiSelectDropdown;