"use client";
import React, { useState } from 'react';

interface ColumnMap {
    [columnName: string]: 'string' | 'number' | 'date';
}

export default function DataMapper({ columns, onMap }: { columns: string[]; onMap: (map: ColumnMap) => void }) {
    const [mapping, setMapping] = useState<ColumnMap>({});

    const handleChange = (col: string, type: 'string' | 'number' | 'date') => {
        const newMap = { ...mapping, [col]: type };
        setMapping(newMap);
        onMap(newMap);
    };

    return (
        <div className="grid gap-3 max-h-96 overflow-y-auto">
            {columns.map((col) => (
                <div key={col} className="flex items-center gap-3">
                    <span className="w-40 font-medium text-white truncate" title={col}>{col}</span>
                    <select
                        value={mapping[col] || ''}
                        onChange={(e) => handleChange(col, e.target.value as any)}
                        className="bg-white/10 text-white border border-white/20 rounded px-3 py-2 flex-1"
                    >
                        <option value="" disabled>Select type</option>
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                    </select>
                </div>
            ))}
        </div>
    );
}
