import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelImportModal = ({ isOpen, onClose, onImportSuccess, moduleName, templateSample }) => {
    const [fileData, setFileData] = useState([]);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    // Download Template Excel Otomatis (Dengan Pengecekan Default Data)
    const downloadTemplate = () => {
        try {
            // Data fallback default jika templateSample bernilai undefined/null
            const defaultSample = [
                {
                    title: 'Penjemputan Bandara BIL ke Kuta Lombok',
                    category: 'airport',
                    pickup: 'Bandara Internasional Lombok (BIL)',
                    drop: 'Kuta Lombok',
                    price: 250000,
                    description: 'Layanan penjemputan privat menggunakan armada ber-AC.',
                    image: ''
                }
            ];

            // Pastikan data yang diproses tidak null/undefined
            let dataToExport = templateSample || defaultSample;

            if (!Array.isArray(dataToExport)) {
                dataToExport = [dataToExport];
            }

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Template");

            XLSX.writeFile(workbook, `Template_Import_${moduleName || 'Data'}.xlsx`);
        } catch (error) {
            console.error("Gagal mengunduh template Excel:", error);
            alert("Gagal mengunduh template. Pastikan library 'xlsx' terinstall dengan benar.");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const workbook = XLSX.read(bstr, { type: 'binary' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const data = XLSX.utils.sheet_to_json(worksheet);
                setFileData(data);
            } catch (err) {
                alert('Gagal membaca file Excel. Pastikan format file .xlsx / .csv valid.');
            }
        };

        reader.readAsBinaryString(file);
    };

    const handleProcessImport = () => {
        if (fileData.length === 0) {
            alert('File Excel kosong atau belum dipilih!');
            return;
        }
        setLoading(true);
        onImportSuccess(fileData, () => {
            setLoading(false);
            onClose();
            setFileData([]);
            setFileName('');
        });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                <div className="modal-header">
                    <h3>Import {moduleName} via Excel</h3>
                    <button className="btn-close-modal" onClick={onClose}>✕</button>
                </div>

                <div style={{ padding: '15px 0' }}>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                        Unduh template di bawah ini, isi data sesuai kolom, lalu unggah kembali file tersebut.
                    </p>

                    <button
                        type="button"
                        onClick={downloadTemplate}
                        style={{
                            background: '#17a2b8',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '600',
                            marginBottom: '16px'
                        }}
                    >
                        📥 Download Template Excel
                    </button>

                    <div className="image-upload-box">
                        <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileChange}
                            className="file-input"
                        />
                    </div>

                    {fileName && (
                        <p style={{ marginTop: '10px', fontSize: '13px', color: '#28a745', fontWeight: 'bold' }}>
                            ✓ File Terpilih: {fileName} ({fileData.length} baris data)
                        </p>
                    )}
                </div>

                <div className="form-actions" style={{ marginTop: '10px' }}>
                    <button
                        type="button"
                        className="btn-submit-save"
                        onClick={handleProcessImport}
                        disabled={loading || fileData.length === 0}
                    >
                        {loading ? 'Memproses...' : 'Impor Data'}
                    </button>
                    <button type="button" onClick={onClose} className="btn-cancel">
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExcelImportModal;
