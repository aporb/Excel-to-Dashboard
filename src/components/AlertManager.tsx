"use client";
import React, { useState } from 'react';

interface AlertRule {
    id: string;
    metric: string;
    condition: '>' | '<' | '>=' | '<=' | '==';
    threshold: number;
}

export default function AlertManager({ onAdd }: { onAdd: (rule: AlertRule) => void }) {
    const [metric, setMetric] = useState('');
    const [condition, setCondition] = useState('>');
    const [threshold, setThreshold] = useState('');

    const handleAdd = () => {
        if (!metric || !threshold) return;
        const rule: AlertRule = {
            id: crypto.randomUUID(),
            metric,
            condition: condition as any,
            threshold: Number(threshold),
        };
        onAdd(rule);
        setMetric('');
        setThreshold('');
    };

    return (
        <div className="bg-white/5 rounded-lg border border-white/10 p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Add Alert Rule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                    type="text"
                    placeholder="Metric (e.g., Sales)"
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    className="bg-white/10 text-white border border-white/20 rounded px-3 py-2 placeholder-gray-400"
                />
                <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="bg-white/10 text-white border border-white/20 rounded px-3 py-2"
                >
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                    <option value=">=">&gt;=</option>
                    <option value="<=">&lt;=</option>
                    <option value="==">==</option>
                </select>
                <input
                    type="number"
                    placeholder="Threshold"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="bg-white/10 text-white border border-white/20 rounded px-3 py-2 placeholder-gray-400"
                />
            </div>
            <button
                onClick={handleAdd}
                className="button-primary mt-3"
            >
                Add Rule
            </button>
        </div>
    );
}
