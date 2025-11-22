// src/lib/alert-engine.ts
export type AlertRule = {
    id: string;
    metric: string; // field name in the data objects
    condition: '>' | '<' | '>=' | '<=' | '==';
    threshold: number;
};

export type AlertResult = {
    ruleId: string;
    triggered: boolean;
    currentValue?: number;
};

/**
 * Evaluate a single rule against the latest data point.
 * Returns true if the condition is satisfied.
 */
function evaluate(rule: AlertRule, value: number): boolean {
    switch (rule.condition) {
        case '>':
            return value > rule.threshold;
        case '<':
            return value < rule.threshold;
        case '>=':
            return value >= rule.threshold;
        case '<=':
            return value <= rule.threshold;
        case '==':
            return value === rule.threshold;
    }
}

/**
 * Scan an array of data objects for each rule.
 * Assumes the metric field exists and is numeric.
 */
export function runAlerts(
    data: Record<string, any>[],
    rules: AlertRule[]
): AlertResult[] {
    const latest = data[data.length - 1] ?? {};
    return rules.map((rule) => {
        const val = Number(latest[rule.metric]) ?? NaN;
        const triggered = !isNaN(val) && evaluate(rule, val);
        return { ruleId: rule.id, triggered, currentValue: triggered ? val : undefined };
    });
}
