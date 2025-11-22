// src/lib/data-processor.ts
export type RawSheet = Record<string, any[]>; // sheetName → rows (array of arrays)

/**
 * Convert raw sheet rows (array of arrays) into an array of objects
 * using the first row as headers.
 */
export function rowsToObjects(rows: any[]): Record<string, any>[] {
    if (!rows.length) return [];
    const [header, ...body] = rows;
    return body.map((row) => {
        const obj: Record<string, any> = {};
        header.forEach((key: string, idx: number) => {
            obj[key] = row[idx];
        });
        return obj;
    });
}

/**
 * Flatten all sheets into a single dataset, preserving sheet name.
 */
export function flattenSheets(raw: RawSheet) {
    const all: Record<string, any>[] = [];
    for (const [sheet, rows] of Object.entries(raw)) {
        const objs = rowsToObjects(rows);
        objs.forEach((o) => (o.__sheet = sheet));
        all.push(...objs);
    }
    return all;
}

/**
 * Simple aggregation helper – group by a field and compute sum of a numeric field.
 */
export function aggregateSum(
    data: Record<string, any>[],
    groupBy: string,
    sumField: string
) {
    const map = new Map<string, number>();
    data.forEach((row) => {
        const key = row[groupBy] ?? 'undefined';
        const val = Number(row[sumField]) || 0;
        map.set(key, (map.get(key) ?? 0) + val);
    });
    return Array.from(map.entries()).map(([k, v]) => ({
        [groupBy]: k,
        [sumField]: v,
    }));
}
