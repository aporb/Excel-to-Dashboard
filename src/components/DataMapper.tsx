"use client";
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ColumnMap {
    [columnName: string]: 'string' | 'number' | 'date';
}

interface DataMapperProps {
    columns: string[];
    onMap: (map: ColumnMap) => void;
    initialMapping?: ColumnMap;
    isInferring?: boolean;
}

export default function DataMapper({ columns, onMap, initialMapping = {}, isInferring = false }: DataMapperProps) {
    const [mapping, setMapping] = useState<ColumnMap>(initialMapping);

    // Update mapping when initialMapping changes
    useEffect(() => {
        if (Object.keys(initialMapping).length > 0) {
            setMapping(initialMapping);
            onMap(initialMapping);
        }
    }, [initialMapping, onMap]);

    const handleChange = (col: string, type: 'string' | 'number' | 'date') => {
        const newMap = { ...mapping, [col]: type };
        setMapping(newMap);
        onMap(newMap);
    };

    // Show loading skeleton while inferring types
    if (isInferring && columns.length > 0 && Object.keys(mapping).length === 0) {
        return (
            <div className="grid gap-3 max-h-96 overflow-y-auto">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Inferring column types...</span>
                </div>
                {columns.map((col) => (
                    <div key={col} className="flex items-center gap-3 animate-pulse">
                        <span className="w-40 font-medium text-muted-foreground truncate" title={col}>{col}</span>
                        <div className="bg-muted/50 border border-border rounded px-3 py-2 flex-1 h-10" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-3 max-h-96 overflow-y-auto">
            {columns.map((col) => (
                <div key={col} className="flex items-center gap-3">
                    <span className="w-40 font-medium text-foreground truncate" title={col}>{col}</span>
                    <select
                        value={mapping[col] || ''}
                        onChange={(e) => handleChange(col, e.target.value as any)}
                        className="bg-muted text-foreground border border-border rounded px-3 py-2 flex-1 focus-ring"
                        disabled={isInferring}
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
