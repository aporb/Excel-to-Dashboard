"use client";
import React, { useRef, useState } from 'react';
import axios from 'axios';

export default function FileUpload() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [status, setStatus] = useState('');

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setStatus('Uploading...');
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post('/api/parse', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setStatus('Upload successful!');
            console.log('Parsed data', res.data);
        } catch (err) {
            console.error(err);
            setStatus('Upload failed');
        }
    };

    return (
        <div className="flex flex-col items-center gap-2">
            <input
                type="file"
                accept=".csv,.xlsx,.xls"
                ref={fileInputRef}
                onChange={handleUpload}
                className="border rounded p-2"
            />
            {status && <p>{status}</p>}
        </div>
    );
}
