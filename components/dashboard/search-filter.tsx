'use client';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterStatus: 'all' | 'available' | 'locked';
  onFilterChange: (status: 'all' | 'available' | 'locked') => void;
}

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
}: SearchFilterProps) {
  const filterOptions: Array<{ value: 'all' | 'available' | 'locked'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'available', label: 'Available' },
    { value: 'locked', label: 'Locked' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{
          flex: 1,
          minWidth: '250px',
          padding: '10px 16px',
          backgroundColor: '#171717',
          border: '1px solid #2a2a2a',
          borderRadius: '8px',
          color: '#ffffff',
          fontSize: '14px',
        }}
      />

      <div
        style={{
          display: 'flex',
          gap: '8px',
        }}
      >
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onFilterChange(option.value)}
            style={{
              padding: '8px 16px',
              backgroundColor: filterStatus === option.value ? '#dbfe01' : '#2a2a2a',
              color: filterStatus === option.value ? '#000000' : '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (filterStatus !== option.value) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#3a3a3a';
              }
            }}
            onMouseLeave={(e) => {
              if (filterStatus !== option.value) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#2a2a2a';
              }
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
