import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, X, Search } from 'lucide-react';

export interface AutocompleteOption {
  id: string;
  name: string;
}

interface SmartAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  options: AutocompleteOption[];
  onAddNew?: (name: string) => Promise<AutocompleteOption | null>;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function SmartAutocomplete({
  value,
  onChange,
  options,
  onAddNew,
  placeholder = 'בחר או הקלד...',
  label,
  disabled = false,
  className = ''
}: SmartAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search
  const filteredOptions = options.filter((opt) =>
  opt.name.toLowerCase().includes(search.toLowerCase())
  );

  // Check if search term is a new value
  const isNewValue = search.trim() && !options.some(
    (opt) => opt.name.toLowerCase() === search.toLowerCase().trim()
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (name: string) => {
    onChange(name);
    setIsOpen(false);
    setSearch('');
  };

  const handleAddNew = async () => {
    if (!onAddNew || !search.trim()) return;

    setIsAdding(true);
    try {
      const newItem = await onAddNew(search.trim());
      if (newItem) {
        onChange(newItem.name);
        setIsOpen(false);
        setSearch('');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setSearch('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isNewValue && onAddNew) {
      e.preventDefault();
      handleAddNew();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearch('');
    }
  };

  return (
    <div data-ev-id="ev_baeb9b089e" ref={containerRef} className={`relative ${className}`}>
      {label &&
      <label data-ev-id="ev_19a0415df0" className="block text-sm font-medium mb-2">{label}</label>
      }
      
      <div data-ev-id="ev_29a82ed02c"
      className={`flex items-center gap-2 bg-muted/50 border border-border rounded-xl py-2.5 px-4 cursor-text transition-colors ${
      isOpen ? 'ring-2 ring-secondary/50 border-secondary' : ''} ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && inputRef.current?.focus()}>

        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        
        <input data-ev-id="ev_6415f73686"
        ref={inputRef}
        type="text"
        value={isOpen ? search : value}
        onChange={handleInputChange}
        onFocus={() => !disabled && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={value || placeholder}
        disabled={disabled}
        className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground min-w-0" />

        
        {value && !disabled &&
        <button data-ev-id="ev_65c06748b3"
        type="button"
        onClick={(e) => {e.stopPropagation();handleClear();}}
        className="p-1 hover:bg-muted rounded-lg transition-colors">

            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        }
        
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {isOpen && !disabled &&
      <div data-ev-id="ev_ee048020c5" className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-xl shadow-lg max-h-60 overflow-auto">
          {/* Add New Option */}
          {isNewValue && onAddNew &&
        <button data-ev-id="ev_c15e2d7c8f"
        type="button"
        onClick={handleAddNew}
        disabled={isAdding}
        className="w-full flex items-center gap-2 px-4 py-3 text-right hover:bg-secondary/10 transition-colors border-b border-border text-secondary font-medium">

              <Plus className="w-4 h-4" />
              <span data-ev-id="ev_9e5120d336">הוסף "{search.trim()}"</span>
              {isAdding && <span data-ev-id="ev_ec16a796b2" className="mr-auto text-xs">מוסיף...</span>}
            </button>
        }

          {/* Options List */}
          {filteredOptions.length > 0 ?
        filteredOptions.map((option) =>
        <button data-ev-id="ev_6a3e59666c"
        key={option.id}
        type="button"
        onClick={() => handleSelect(option.name)}
        className={`w-full text-right px-4 py-2.5 hover:bg-muted transition-colors ${
        option.name === value ? 'bg-secondary/10 text-secondary font-medium' : 'text-foreground'}`
        }>

                {option.name}
              </button>
        ) :
        !isNewValue ?
        <div data-ev-id="ev_422972327f" className="px-4 py-3 text-muted-foreground text-center text-sm">
              לא נמצאו תוצאות
            </div> :
        null}
        </div>
      }
    </div>);

}