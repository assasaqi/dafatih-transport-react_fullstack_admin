import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-card confirm-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title || 'Konfirmasi Hapus'}</h3>
                    <button className="btn-close-modal" onClick={onCancel}>✕</button>
                </div>

                <div className="confirm-modal-body">
                    <p>{message || 'Apakah Anda yakin ingin menghapus data ini?'}</p>
                </div>

                <div className="form-actions confirm-modal-actions">
                    <button type="button" onClick={onConfirm} className="btn-delete">
                        Ya, Hapus
                    </button>
                    <button type="button" onClick={onCancel} className="btn-cancel">
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
