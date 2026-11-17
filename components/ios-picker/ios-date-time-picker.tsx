"use client";

import React, { useMemo, useCallback } from "react";
import { format, addDays, startOfDay, differenceInCalendarDays, parseISO } from "date-fns";
import { IosWheelItem, PickerItemOption } from "./ios-wheel-item";
import "./ios-picker.css";

interface IosDateTimePickerProps {
  date: string; // "yyyy-MM-dd"
  time: string; // "HH:mm"
  onChange: (date: string, time: string) => void;
  minDays?: number;
  maxDays?: number;
  showDate?: boolean;
}

export function IosDateTimePicker({
  date,
  time,
  onChange,
  maxDays = 120,
  showDate = true,
}: IosDateTimePickerProps) {
  const today = useMemo(() => startOfDay(new Date()), []);

  // Stable initial offset so dateOptions array reference is never recreated on date changes
  const initialOffset = useMemo(() => {
    if (!date) return -7;
    try {
      const parsed = startOfDay(parseISO(date));
      const diff = differenceInCalendarDays(parsed, today);
      return Math.min(-7, diff);
    } catch {
      return -7;
    }
  }, []); // Only compute once on mount

  // Generate Date options - stable list across date changes
  const dateOptions: PickerItemOption[] = useMemo(() => {
    const list: PickerItemOption[] = [];
    const totalDays = maxDays;
    for (let i = initialOffset; i <= totalDays; i++) {
      const d = addDays(today, i);
      const val = format(d, "yyyy-MM-dd");
      let label = format(d, "EEE, MMM d");
      if (i === 0) {
        label = `Today, ${format(d, "MMM d")}`;
      } else if (i === 1) {
        label = `Tomorrow, ${format(d, "MMM d")}`;
      } else if (i === -1) {
        label = `Yesterday, ${format(d, "MMM d")}`;
      }

      list.push({
        value: val,
        label,
      });
    }
    return list;
  }, [today, maxDays, initialOffset]);

  // Generate Hours options: 00 to 23
  const hourOptions: PickerItemOption[] = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const str = i.toString().padStart(2, "0");
      return { value: str, label: str };
    });
  }, []);

  // Generate Minutes options: 00 to 59
  const minuteOptions: PickerItemOption[] = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const str = i.toString().padStart(2, "0");
      return { value: str, label: str };
    });
  }, []);

  // Parse current selected indices
  const selectedDateIndex = useMemo(() => {
    const idx = dateOptions.findIndex((opt) => opt.value === date);
    return idx >= 0 ? idx : 0;
  }, [dateOptions, date]);

  const [currentHourStr, currentMinStr] = useMemo(() => {
    const parts = (time || "00:00").split(":");
    return [
      (parts[0] || "00").padStart(2, "0"),
      (parts[1] || "00").padStart(2, "0"),
    ];
  }, [time]);

  const selectedHourIndex = useMemo(() => {
    const h = parseInt(currentHourStr, 10);
    return isNaN(h) ? 0 : Math.max(0, Math.min(23, h));
  }, [currentHourStr]);

  const selectedMinuteIndex = useMemo(() => {
    const m = parseInt(currentMinStr, 10);
    return isNaN(m) ? 0 : Math.max(0, Math.min(59, m));
  }, [currentMinStr]);

  // Handlers for wheel scroll selection
  const handleDateSelect = useCallback(
    (index: number) => {
      const selected = dateOptions[index];
      if (selected && selected.value !== date) {
        onChange(selected.value, time);
      }
    },
    [dateOptions, date, time, onChange]
  );

  const handleHourSelect = useCallback(
    (index: number) => {
      const selected = hourOptions[index];
      if (selected && selected.value !== currentHourStr) {
        onChange(date, `${selected.value}:${currentMinStr}`);
      }
    },
    [hourOptions, currentHourStr, currentMinStr, date, onChange]
  );

  const handleMinuteSelect = useCallback(
    (index: number) => {
      const selected = minuteOptions[index];
      if (selected && selected.value !== currentMinStr) {
        onChange(date, `${currentHourStr}:${selected.value}`);
      }
    },
    [minuteOptions, currentHourStr, currentMinStr, date, onChange]
  );

  return (
    <div className="embla-picker-wrapper">
      <div className="embla-picker">
        <div className="embla-picker__highlight" />

        {showDate && (
          <IosWheelItem
            items={dateOptions}
            selectedIndex={selectedDateIndex}
            onSelectIndex={handleDateSelect}
            loop={false}
            perspective="left"
            flex={1.8}
          />
        )}

        <IosWheelItem
          items={hourOptions}
          selectedIndex={selectedHourIndex}
          onSelectIndex={handleHourSelect}
          loop={true}
          label="hr"
          perspective={showDate ? "center" : "left"}
          flex={1}
        />

        <IosWheelItem
          items={minuteOptions}
          selectedIndex={selectedMinuteIndex}
          onSelectIndex={handleMinuteSelect}
          loop={true}
          label="min"
          perspective="right"
          flex={1}
        />
      </div>
    </div>
  );
}
export default IosDateTimePicker;
