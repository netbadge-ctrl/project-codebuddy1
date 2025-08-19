import React, { useState, useRef, useEffect, useMemo } from 'react';
import { IconChevronDown, IconSearch } from './Icons';
import { fuzzySearch } from '../utils';

interface Option {
    value: string;
    label: string;
}

interface MultiSelectDropdownProps {
    options: Option[];
    selectedValues: string[];
    onSelectionChange: (newSelectedValues: string[]) => void;
    placeholder: string;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
    options,
    selectedValues,
    onSelectionChange,
    placeholder
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isOpen) {
            setSearchTerm('');
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleToggleOption = (value: string) => {
        const newSelectedValues = selectedValues.includes(value)
            ? selectedValues.filter(v => v !== value)
            : [...selectedValues, value];
        onSelectionChange(newSelectedValues);
    };

    const displayLabel = selectedValues.length > 0 
        ? `${placeholder} (${selectedValues.length})`
        : placeholder;

    const filteredOptions = useMemo(() => {
        return options.filter(option => fuzzySearch(searchTerm, option.label));
    }, [options, searchTerm]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gray-100 dark:bg-[#2d2d2d] border border-gray-300 dark:border-[#4a4a4a] rounded-lg px-4 py-2 w-full min-w-[150px] text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3a3a3a] flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
            >
                <span>{displayLabel}</span>
                <IconChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-64 bg-white dark:bg-[#2d2d2d] border border-gray-200 dark:border-[#4a4a4a] rounded-lg shadow-xl z-20 flex flex-col">
                    <div className="p-2 border-b border-gray-200 dark:border-[#4a4a4a]">
                        <div className="relative">
                           <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                           <input
                             ref={searchInputRef}
                             type="text"
                             placeholder="搜索..."
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                             className="bg-gray-50 dark:bg-[#232323] border border-gray-300 dark:border-[#4a4a4a] rounded-md pl-8 pr-2 py-1.5 w-full text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#6C63FF]"
                           />
                        </div>
                    </div>
                    <ul className="p-2 flex-grow overflow-y-auto max-h-56">
                        {filteredOptions.map(option => (
                            <li key={option.value}>
                                <label className="flex items-center gap-3 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-[#3a3a3a] cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedValues.includes(option.value)}
                                        onChange={() => handleToggleOption(option.value)}
                                        className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-[#6C63FF] focus:ring-[#6C63FF]"
                                    />
                                    {option.label}
                                </label>
                            </li>
                        ))}
                        {filteredOptions.length === 0 && (
                            <li className="px-3 py-2 text-sm text-gray-500 text-center">无匹配项</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};