"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  triggerStyle?: React.CSSProperties;
  ariaLabel?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  icon,
  fullWidth = false,
  className = "",
  style = {},
  triggerStyle = {},
  ariaLabel,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [alignRight, setAlignRight] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Auto-detect if dropdown would overflow the right edge of viewport
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const menuWidth = Math.max(rect.width, 170);
      if (rect.left + menuWidth > window.innerWidth - 16) {
        setAlignRight(true);
      } else {
        setAlignRight(false);
      }
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll("li");
      const activeItem = items[highlightedIndex];
      if (activeItem) {
        activeItem.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen, highlightedIndex]);

  const handleSelect = useCallback(
    (optValue: string) => {
      onChange(optValue);
      setIsOpen(false);
    },
    [onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
        const idx = options.findIndex((opt) => opt.value === value);
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          handleSelect(options[highlightedIndex].value);
        }
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: fullWidth ? "100%" : "auto",
        display: fullWidth ? "block" : "inline-block",
        ...style,
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        style={{
          width: fullWidth ? "100%" : "auto",
          minWidth: fullWidth ? "100%" : "140px",
          height: "38px",
          padding: "8px 12px",
          backgroundColor: isOpen ? "#202020" : "#171717",
          border: `1px solid ${isOpen ? "#dbfe01" : "#2a2a2a"}`,
          borderRadius: "8px",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          outline: "none",
          transition: "border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease",
          boxShadow: isOpen ? "0 0 0 2px rgba(219, 254, 1, 0.15)" : "none",
          boxSizing: "border-box",
          ...triggerStyle,
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isOpen) {
            e.currentTarget.style.borderColor = "#3a3a3a";
            e.currentTarget.style.backgroundColor = "#1c1c1c";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isOpen) {
            e.currentTarget.style.borderColor = "#2a2a2a";
            e.currentTarget.style.backgroundColor = "#171717";
          }
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {icon && <span style={{ display: "inline-flex", flexShrink: 0 }}>{icon}</span>}
          {selectedOption?.color && (
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: selectedOption.color,
                boxShadow: `0 0 6px ${selectedOption.color}80`,
                flexShrink: 0,
              }}
            />
          )}
          <span
            style={{
              color: selectedOption ? "#ffffff" : "#71717a",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <ChevronDown
          size={14}
          style={{
            color: "#a1a1aa",
            flexShrink: 0,
            transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <ul
          ref={listboxRef}
          role="listbox"
          tabIndex={-1}
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: fullWidth || !alignRight ? 0 : "auto",
            right: fullWidth || alignRight ? 0 : "auto",
            minWidth: fullWidth ? "100%" : "170px",
            maxHeight: "240px",
            overflowY: "auto",
            backgroundColor: "#171717",
            border: "1px solid #2e2e2e",
            borderRadius: "8px",
            padding: "4px",
            margin: 0,
            listStyle: "none",
            zIndex: 1050,
            boxShadow:
              "0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
            outline: "none",
            animation: "fadeInDropdown 0.12s ease-out",
          }}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isHighlighted = index === highlightedIndex;

            return (
              <li
                key={option.value || `empty-${index}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  fontSize: "14px",
                  cursor: "pointer",
                  color: isSelected ? "#dbfe01" : "#ffffff",
                  backgroundColor: isSelected
                    ? "rgba(219, 254, 1, 0.08)"
                    : isHighlighted
                    ? "#262626"
                    : "transparent",
                  fontWeight: isSelected ? 600 : 400,
                  transition: "background-color 0.12s ease, color 0.12s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {option.color && (
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: option.color,
                        boxShadow: `0 0 6px ${option.color}80`,
                        flexShrink: 0,
                      }}
                    />
                  )}
                  {option.icon && (
                    <span style={{ display: "inline-flex", flexShrink: 0 }}>
                      {option.icon}
                    </span>
                  )}
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {option.label}
                  </span>
                </div>

                {isSelected && (
                  <Check
                    size={14}
                    style={{
                      color: "#dbfe01",
                      flexShrink: 0,
                    }}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
