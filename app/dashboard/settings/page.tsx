"use client";

import React, { useState } from 'react';
import SpecialtyPricingManager from '@/components/settings/SpecialtyPricingManager';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('pricing');

    return (
        <div className="p-10 max-w-7xl mx-auto space-y-10">
            <div>
                <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Settings</h1>
                <p className="text-slate-400 font-bold uppercase text-xs mt-2">Configure clinic operations and data</p>
            </div>

            <div className="flex border-b border-slate-100 gap-8">
                {['profile', 'clinic', 'pricing'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-300 hover:text-slate-600'}`}
                    >
                        {tab === 'pricing' ? 'Specialties & Pricing' : tab}
                    </button>
                ))}
            </div>

            <div className="py-6">
                {activeTab === 'pricing' && <SpecialtyPricingManager />}
                {/* Other tab contents */}
            </div>
        </div>
    );
}