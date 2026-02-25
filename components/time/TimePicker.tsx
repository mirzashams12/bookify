"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface TimePickerProps {
    name: string;
    value?: string;
    onChange?: (value: string) => void;
    minTime?: string;
    maxTime?: string;
    interval?: number;
    selectedDate?: string; // YYYY-MM-DD
    bookedTimes?: string[]; // ["13:00", "14:30"]
}

export default function TimePicker({
    name,
    value,
    onChange,
    minTime = "09:00",
    maxTime = "20:00",
    interval = 5,
    selectedDate,
    bookedTimes = [],
}: TimePickerProps) {
    const [selected, setSelected] = useState<string | undefined>(value);
    const [open, setOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState<number>(-1);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const [searchBuffer, setSearchBuffer] = useState("");

    const wrapperRef = useRef<HTMLDivElement>(null);
    const selectedRef = useRef<HTMLButtonElement | null>(null);

    // Convert HH:mm → minutes
    const parseMinutes = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    };

    const nowMinutes = () => {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    };

    const isToday = () => {
        if (!selectedDate) return false;
        const today = new Date().toISOString().split("T")[0];
        return selectedDate === today;
    };

    const format12Hour = (totalMinutes: number) => {
        const hours24 = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const period = hours24 >= 12 ? "PM" : "AM";
        const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

        return {
            label: `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`,
            value: `${hours24.toString().padStart(2, "0")}:${minutes
                .toString()
                .padStart(2, "0")}`,
            isFullHour: minutes === 0,
            isPM: period === "PM",
            minutesTotal: totalMinutes,
        };
    };

    const generateTimes = () => {
        const min = parseMinutes(minTime);
        const max = parseMinutes(maxTime);
        const times = [];

        for (let t = min; t <= max; t += interval) {
            const formatted = format12Hour(t);

            const isBooked = bookedTimes.includes(formatted.value);
            const isPast = isToday() && t < nowMinutes();

            times.push({
                ...formatted,
                disabled: isBooked || isPast,
            });
        }

        return times;
    };

    const times = generateTimes();

    const handleSelect = (time: string) => {
        setSelected(time);
        onChange?.(time);
        setOpen(false);
    };

    // Positioning
    const calculatePosition = () => {
        if (!wrapperRef.current) return;

        const rect = wrapperRef.current.getBoundingClientRect();
        const dropdownHeight = 320;
        const spaceBelow = window.innerHeight - rect.bottom;
        const openUp = spaceBelow < dropdownHeight;

        setPosition({
            top: openUp ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
            left: rect.left,
            width: rect.width,
        });
    };

    useEffect(() => {
        if (open) {
            calculatePosition();
            window.addEventListener("scroll", calculatePosition);
            window.addEventListener("resize", calculatePosition);
        }
        return () => {
            window.removeEventListener("scroll", calculatePosition);
            window.removeEventListener("resize", calculatePosition);
        };
    }, [open]);

    // Scroll selected into view
    useEffect(() => {
        if (open && selectedRef.current) {
            selectedRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [open]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((prev) =>
                prev < times.length - 1 ? prev + 1 : prev
            );
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightIndex((prev) => (prev > 0 ? prev - 1 : 0));
        }

        if (e.key === "Enter" && highlightIndex >= 0) {
            const item = times[highlightIndex];
            if (!item.disabled) handleSelect(item.value);
        }

        if (e.key === "Escape") setOpen(false);

        // Type to search
        if (/^\d$/.test(e.key)) {
            const buffer = searchBuffer + e.key;
            setSearchBuffer(buffer);

            const matchIndex = times.findIndex((t) =>
                t.label.replace(/\D/g, "").startsWith(buffer)
            );

            if (matchIndex !== -1) {
                setHighlightIndex(matchIndex);
            }

            setTimeout(() => setSearchBuffer(""), 1000);
        }
    };

    return (
        <>
            <div ref={wrapperRef} className="relative">
                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    onKeyDown={handleKeyDown}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-white text-left hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    {selected
                        ? times.find((t) => t.value === selected)?.label
                        : "Select Time"}
                </button>

                <input type="hidden" name={name} value={selected || ""} />
            </div>

            {open &&
                createPortal(
                    <div
                        style={{
                            position: "fixed",
                            top: position.top,
                            left: position.left,
                            width: position.width,
                            zIndex: 9999,
                        }}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-[320px] overflow-y-auto p-3 transition-all duration-200 animate-in fade-in zoom-in-95"
                    >
                        <div className="grid grid-cols-3 gap-2">
                            {times.map((t, i) => (
                                <button
                                    key={t.value}
                                    ref={selected === t.value ? selectedRef : null}
                                    type="button"
                                    disabled={t.disabled}
                                    onClick={() => !t.disabled && handleSelect(t.value)}
                                    className={`
                    px-3 py-2 min-w-[88px]
                    rounded-xl text-sm font-medium transition-all
                    whitespace-nowrap text-center flex items-center justify-center
                    ${t.disabled
                                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                            : selected === t.value
                                                ? "bg-indigo-600 text-white"
                                                : i === highlightIndex
                                                    ? "ring-2 ring-indigo-400"
                                                    : t.isFullHour
                                                        ? t.isPM
                                                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 font-bold"
                                                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-bold"
                                                        : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                                        }
                  `}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}