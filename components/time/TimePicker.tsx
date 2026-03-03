"use client";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock as ClockIcon, Lock } from "lucide-react"; // Added for the disabled icon

interface TimePickerProps {
    name: string;
    value?: string;
    onChange?: (value: string) => void;
    minTime?: string;
    maxTime?: string;
    interval?: number;
    selectedDate?: string;
    bookedTimes?: string[];
    disabled?: boolean; // Added disabled prop
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
    disabled = false, // Default to false
}: TimePickerProps) {
    const [selected, setSelected] = useState<string | undefined>(value);
    const [open, setOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState<number>(-1);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    const wrapperRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectedRef = useRef<HTMLButtonElement | null>(null);

    // Update internal state if value prop changes
    useEffect(() => {
        setSelected(value);
    }, [value]);

    // --- LOGIC HELPERS ---
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
            value: `${hours24.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`,
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
            times.push({ ...formatted, disabled: isBooked || isPast });
        }
        return times;
    };

    const times = generateTimes();

    const handleSelect = (time: string) => {
        if (disabled) return;
        setSelected(time);
        onChange?.(time);
        setOpen(false);
    };

    // --- POSITIONING & CLICK OUTSIDE ---
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
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                wrapperRef.current && !wrapperRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target)
            ) {
                setOpen(false);
            }
        };

        if (open && !disabled) {
            calculatePosition();
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener("scroll", calculatePosition);
            window.addEventListener("resize", calculatePosition);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", calculatePosition);
            window.removeEventListener("resize", calculatePosition);
        };
    }, [open, disabled]);

    useEffect(() => {
        if (open && selectedRef.current) {
            selectedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [open]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!open || disabled) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightIndex((prev) => prev < times.length - 1 ? prev + 1 : prev);
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
    };

    return (
        <>
            <div ref={wrapperRef} className="relative">
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setOpen((prev) => !prev)}
                    onKeyDown={handleKeyDown}
                    className={`w-full px-5 py-4 rounded-[20px] border transition-all text-left outline-none font-bold flex items-center justify-between
                        ${disabled
                            ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-70"
                            : open
                                ? "border-indigo-500 bg-white ring-4 ring-indigo-50"
                                : "border-slate-100 bg-slate-50 hover:border-indigo-300"}
                    `}
                >
                    <span className={selected ? "text-slate-900" : "text-slate-400 text-sm font-bold"}>
                        {selected
                            ? times.find((t) => t.value === selected)?.label
                            : "Select Time"}
                    </span>
                    {disabled ? (
                        <Lock className="w-4 h-4 text-slate-300" />
                    ) : (
                        <ClockIcon className={`w-5 h-5 transition-colors ${open ? "text-indigo-500" : "text-slate-300"}`} />
                    )}
                </button>
                <input type="hidden" name={name} value={selected || ""} />
            </div>

            {open && !disabled &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        style={{
                            position: "fixed",
                            top: position.top,
                            left: position.left,
                            width: position.width,
                            zIndex: 9999,
                        }}
                        className="bg-white border border-slate-100 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] max-h-[320px] overflow-y-auto p-3 no-scrollbar animate-in fade-in zoom-in-95 duration-200"
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
                                        px-3 py-3 rounded-xl text-[11px] font-black uppercase transition-all
                                        flex items-center justify-center
                                        ${t.disabled
                                            ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                                            : selected === t.value
                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                                : i === highlightIndex
                                                    ? "ring-2 ring-indigo-400 bg-indigo-50"
                                                    : t.isFullHour
                                                        ? t.isPM
                                                            ? "bg-indigo-50 text-indigo-700 font-black border border-indigo-100"
                                                            : "bg-emerald-50 text-emerald-700 font-black border border-emerald-100"
                                                        : "hover:bg-slate-50 text-slate-600"
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