import React from 'react';

const ModalSummary = ({ formData, onClose, onConfirm }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-card">
                {/* Header Modal */}
                <div className="modal-header">
                    <h3>
                        <i className="fa-solid fa-file-invoice" style={{ color: 'var(--primary, #0284c7)' }}></i>
                        Ringkasan Pemesanan
                    </h3>
                    <button className="modal-close-btn" onClick={onClose} aria-label="Tutup">
                        &times;
                    </button>
                </div>

                {/* Daftar Detail Rincian */}
                <div className="summary-details-list">
                    <div className="summary-item">
                        <span className="label">Nama Pemesan:</span>
                        <span className="value">{formData.custName}</span>
                    </div>

                    <div className="summary-item">
                        <span className="label">No. WhatsApp:</span>
                        <span className="value">+{formData.countryCode} {formData.custWa}</span>
                    </div>

                    <div className="summary-item">
                        <span className="label">Jadwal Penjemputan:</span>
                        <span className="value">{formData.pickupDate} ({formData.pickupTime} WITA)</span>
                    </div>

                    <div className="summary-item">
                        <span className="label">Lokasi Jemput (From):</span>
                        <span className="value">{formData.pickupLoc}</span>
                    </div>

                    <div className="summary-item">
                        <span className="label">Lokasi Tujuan (To):</span>
                        <span className="value">{formData.dropLoc}</span>
                    </div>

                    <div className="summary-item price-item">
                        <span className="label">Estimasi Tarif:</span>
                        <span className="value">
                            Rp {new Intl.NumberFormat('id-ID').format(formData.price)}
                        </span>
                    </div>
                </div>

                {/* Tombol Aksi */}
                <div className="modal-actions">
                    <button type="button" className="btn-modal-cancel" onClick={onClose}>
                        Ubah Data
                    </button>
                    <button type="button" className="btn-modal-confirm" onClick={onConfirm}>
                        <i className="fa-brands fa-whatsapp"></i> Kirim ke WA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalSummary;
