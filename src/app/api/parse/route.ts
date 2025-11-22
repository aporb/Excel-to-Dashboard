// src/app/api/parse/route.ts
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// Helper: read uploaded file from the request (multipart/form-data)
async function getUploadedFile(request: Request): Promise<Buffer> {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) throw new Error('No file provided');
    return Buffer.from(await file.arrayBuffer());
}

// Convert a workbook to a JSON structure that includes all sheets
function workbookToJson(workbook: XLSX.WorkBook) {
    const result: Record<string, any[]> = {};
    workbook.SheetNames.forEach((sheetName) => {
        const ws = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[];
        result[sheetName] = data;
    });
    return result;
}

// API handler
export async function POST(request: Request) {
    try {
        const buffer = await getUploadedFile(request);
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const parsed = workbookToJson(workbook);

        // Return a compact JSON payload
        return NextResponse.json({
            success: true,
            sheets: Object.keys(parsed),
            data: parsed,
        });
    } catch (err: any) {
        console.error('Parse error:', err);
        return NextResponse.json(
            { success: false, error: err.message || 'Parsing failed' },
            { status: 400 }
        );
    }
}
