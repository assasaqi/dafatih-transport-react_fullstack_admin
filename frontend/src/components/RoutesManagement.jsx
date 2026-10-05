import React, { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';
import Pagination from './Pagination';
import './Admin.css';

const RoutesManagement = ({ handleFileUpload }) => {
    // ==========================================
    // STATE DATA, FORM, MODAL, SEARCH & PAGINATION
    // ==========================================
    const [routes, setRoutes] = useState([]);
    const [routesLoading, setRoutesLoading] = useState(true);
    const [selectedRouteCategory, setSelectedRouteCategory] = useState('all');
    const [showRouteForm, setShowRouteForm] = useState(false);
    const [editingRouteId, setEditingRouteId] = useState(null);

    // State untuk kontrol Dropdown Detail tiap Card
    const [expandedCardIds, setExpandedCardIds] = useState({});

    // State Search & Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // State Confirm Modal
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        targetId: null
    });

    const initialFormState = {
        category: 'airport',
        pickup: 'Airport Lombok',
        drop: '',
        price: '',
        priceFormatted: '',
        title: '',
        description: '',
        image: '',
        badge: '',
        icon: 'fa-plane-arrival'
    };

    const [routeForm, setRouteForm] = useState(initialFormState);

    // Toggle Buka/Tutup Dropdown Detail Card
    const toggleCardDetail = (id) => {
        setExpandedCardIds((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Reset ke halaman 1 saat pencarian/filter berubah
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedRouteCategory]);

    // ==========================================
    // FETCH DATA RUTE DARI API
    // ==========================================
    const fetchRoutes = () => {
        setRoutesLoading(true);
        fetch('http://localhost:5000/api/routes')
            .then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || `Gagal memuat data (Status ${res.status})`);
                }
                return res.json();
            })
            .then((data) => {
                setRoutes(Array.isArray(data) ? data : data.routes || []);
                setRoutesLoading(false);
            })
            .catch((err) => {
                console.error('Gagal memuat rute:', err.message);
                setRoutesLoading(false);
            });
    };

    useEffect(() => {
        fetchRoutes();
    }, []);

    // ==========================================
    // HANDLER FORM (SUBMIT, EDIT, CLOSE)
    // ==========================================
    const closeRouteForm = () => {
        setShowRouteForm(false);
        setEditingRouteId(null);
        setRouteForm(initialFormState);
    };

    const handleRouteSubmit = (e) => {
        e.preventDefault();

        const rawPrice = Number(routeForm.price) || 0;
        const formattedPrice = `Rp ${rawPrice.toLocaleString('id-ID')}`;

        const payload = {
            title: routeForm.title ? routeForm.title.trim() : '',
            category: routeForm.category || 'airport',
            pickup: routeForm.pickup ? routeForm.pickup.trim() : '',
            drop: routeForm.drop ? routeForm.drop.trim() : '',
            price: rawPrice,
            priceFormatted: formattedPrice,
            description: routeForm.description ? routeForm.description.trim() : '',
            image: routeForm.image || '',
            badge: routeForm.badge || `${(routeForm.category || 'AIRPORT').toUpperCase()} - ${routeForm.drop || ''}`,
            icon: routeForm.icon || 'fa-plane-arrival'
        };

        const isEdit = editingRouteId !== null;
        const url = isEdit
            ? `http://localhost:5000/api/routes/${editingRouteId}`
            : 'http://localhost:5000/api/routes';
        const method = isEdit ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || 'Gagal menyimpan data rute');
                return data;
            })
            .then((data) => {
                alert(data.message || 'Berhasil menyimpan rute!');
                fetchRoutes();
                closeRouteForm();
            })
            .catch((err) => alert(`Gagal menyimpan: ${err.message}`));
    };

    const handleEditRoute = (route) => {
        setRouteForm({
            category: route.category || 'airport',
            pickup: route.pickup || '',
            drop: route.drop || '',
            price: route.price || '',
            priceFormatted: route.priceFormatted || '',
            title: route.title || '',
            description: route.description || '',
            image: route.image || route.imageUrl || '',
            badge: route.badge || '',
            icon: route.icon || 'fa-plane-arrival'
        });
        setEditingRouteId(route.id || route._id);
        setShowRouteForm(true);
    };

    // ==========================================
    // HANDLER HAPUS DENGAN CONFIRM MODAL
    // ==========================================
    const openDeleteModal = (id) => {
        setDeleteModal({
            isOpen: true,
            targetId: id
        });
    };

    const closeDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            targetId: null
        });
    };

    const handleConfirmDelete = () => {
        const id = deleteModal.targetId;
        if (!id) return;

        fetch(`http://localhost:5000/api/routes/${id}`, { method: 'DELETE' })
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || 'Gagal menghapus rute');
                return data;
            })
            .then((data) => {
                alert(data.message || 'Rute berhasil dihapus!');
                fetchRoutes();
            })
            .catch((err) => alert(`Error: ${err.message}`))
            .finally(() => {
                closeDeleteModal();
            });
    };

    // ==========================================
    // LOGIKA FILTER PENCARIAN & PAGINATION
    // ==========================================
    const filteredRoutes = routes.filter((r) => {
        const matchesCategory = selectedRouteCategory === 'all' ||
            (r.category || '').toLowerCase() === selectedRouteCategory.toLowerCase();

        const q = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            (r.title && r.title.toLowerCase().includes(q)) ||
            (r.pickup && r.pickup.toLowerCase().includes(q)) ||
            (r.drop && r.drop.toLowerCase().includes(q)) ||
            (r.description && r.description.toLowerCase().includes(q));

        return matchesCategory && matchesSearch;
    });

    const totalPages = Math.ceil(filteredRoutes.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentRoutes = filteredRoutes.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div>
            {/* Header Konten & Tombol Tambah */}
            <div className="content-header">
                <h2>Kelola Rute & Tarif Transportasi</h2>
                <button
                    className="btn-add-primary"
                    onClick={() => { closeRouteForm(); setShowRouteForm(true); }}
                >
                    + Tambah Rute Baru
                </button>
            </div>

            {/* MODAL FORM TAMBAH / EDIT RUTE */}
            {showRouteForm && (
                <div className="modal-backdrop" onClick={closeRouteForm}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingRouteId !== null ? `Edit Rute #${editingRouteId}` : 'Tambah Rute Baru'}</h3>
                            <button className="btn-close-modal" onClick={closeRouteForm}>✕</button>
                        </div>

                        <form onSubmit={handleRouteSubmit} className="admin-form-grid">
                            <input
                                type="text"
                                placeholder="Judul Rute"
                                value={routeForm.title}
                                onChange={(e) => setRouteForm({ ...routeForm, title: e.target.value })}
                                required
                            />

                            <select
                                value={routeForm.category}
                                onChange={(e) => setRouteForm({ ...routeForm, category: e.target.value })}
                                required
                            >
                                <option value="airport">Airport</option>
                                <option value="bangsal">Bangsal</option>
                                <option value="senggigi">Senggigi</option>
                                <option value="kuta">Kuta</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Titik Jemput (Pickup)"
                                value={routeForm.pickup}
                                onChange={(e) => setRouteForm({ ...routeForm, pickup: e.target.value })}
                                required
                            />

                            <input
                                type="text"
                                placeholder="Titik Tujuan (Drop)"
                                value={routeForm.drop}
                                onChange={(e) => setRouteForm({ ...routeForm, drop: e.target.value })}
                                required
                            />

                            <input
                                type="number"
                                placeholder="Harga (misal: 250000)"
                                value={routeForm.price}
                                onChange={(e) => setRouteForm({ ...routeForm, price: e.target.value })}
                                required
                            />

                            <input
                                type="text"
                                placeholder="Badge (Opsional)"
                                value={routeForm.badge}
                                onChange={(e) => setRouteForm({ ...routeForm, badge: e.target.value })}
                            />

                            <textarea
                                placeholder="Deskripsi Rute..."
                                value={routeForm.description}
                                onChange={(e) => setRouteForm({ ...routeForm, description: e.target.value })}
                                required
                                className="full-width"
                                rows="3"
                            />

                            <div className="full-width">
                                <label className="form-label">Upload Gambar Rute:</label>
                                <div className="image-upload-box">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="file-input"
                                        onChange={(e) => handleFileUpload && handleFileUpload(e, setRouteForm)}
                                    />
                                </div>
                                {routeForm.image && (
                                    <div className="image-preview-container">
                                        <img src={routeForm.image} alt="Preview Rute" className="image-preview" />
                                        <span className="upload-success-badge">✓ Gambar terpilih</span>
                                    </div>
                                )}
                            </div>

                            <div className="full-width form-actions">
                                <button
                                    type="submit"
                                    className={editingRouteId !== null ? "btn-submit-update" : "btn-submit-save"}
                                >
                                    {editingRouteId !== null ? 'Perbarui Rute' : 'Simpan Rute'}
                                </button>
                                <button type="button" onClick={closeRouteForm} className="btn-cancel">
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* TOOLBAR FILTER CATEGORY & SEARCH BAR */}
            <div className="toolbar-container">
                <div className="filter-toolbar" style={{ marginBottom: 0 }}>
                    {['all', 'airport', 'bangsal', 'senggigi', 'kuta'].map((cat) => (
                        <button
                            key={cat}
                            className={`filter-btn ${selectedRouteCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedRouteCategory(cat)}
                        >
                            {cat.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="search-input-box">
                    <input
                        type="text"
                        placeholder="Cari rute, jemput, atau tujuan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* LIST KARTU DATA DENGAN FITUR DROPDOWN DETAIL */}
            {routesLoading ? (
                <p className="empty-text">Memuat rute...</p>
            ) : (
                <div className="cards-container">
                    {currentRoutes.length === 0 ? (
                        <p className="empty-text">Data rute tidak ditemukan.</p>
                    ) : (
                        currentRoutes.map((r) => {
                            const itemKey = r.id || r._id;
                            const isExpanded = !!expandedCardIds[itemKey];

                            return (
                                <div key={itemKey} className={`item-card-wrapper ${isExpanded ? 'is-open' : ''}`}>
                                    {/* BARIS UTAMA (HORIZONTAL SLIM) */}
                                    <div className="item-card">
                                        {/* 1. THUMBNAIL GAMBAR */}
                                        {r.image && (
                                            <img
                                                src={r.image}
                                                alt={r.title}
                                                className="card-thumbnail"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        )}

                                        {/* 2. INFORMASI RINGKAS SEJAJAR */}
                                        <div className="card-main-info">
                                            <span className="card-category-badge">{r.category}</span>
                                            <h4 className="card-title">{r.title}</h4>
                                            <p className="card-route-info">
                                                <strong>Rute:</strong> {r.pickup} → {r.drop}
                                            </p>
                                            <p className="card-price">
                                                {r.priceFormatted || `Rp ${Number(r.price).toLocaleString('id-ID')}`}
                                            </p>
                                        </div>

                                        {/* 3. TOMBOL AKSI & DROPDOWN */}
                                        <div className="card-actions">
                                            <button onClick={() => handleEditRoute(r)} className="btn-edit">Edit</button>
                                            <button onClick={() => openDeleteModal(itemKey)} className="btn-delete">Hapus</button>
                                            <button
                                                onClick={() => toggleCardDetail(itemKey)}
                                                className={`btn-dropdown-toggle ${isExpanded ? 'active' : ''}`}
                                            >
                                                {isExpanded ? 'Detail' : 'Detail'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* PANEL DROPDOWN DETAIL KETIKA DIBUKA */}
                                    {isExpanded && (
                                        <div className="card-detail-dropdown">
                                            <div className="detail-row">
                                                {/* <div className="detail-item">
                                                    <strong>ID Rute:</strong>
                                                    <span>#{itemKey}</span>
                                                </div> */}
                                                <div className="detail-item">
                                                    <strong>Badge:</strong>
                                                    <span>{r.badge || '-'}</span>
                                                </div>
                                            </div>
                                            <div className="full-width-detail">
                                                <strong>Deskripsi Lengkap:</strong>
                                                <p>{r.description || 'Tidak ada deskripsi tambahan.'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* KOMPONEN PAGINATION */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
            />

            {/* MODAL KONFIRMASI HAPUS KUSTOM */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Hapus Rute"
                message="Apakah Anda yakin ingin menghapus rute ini dari database?"
                onConfirm={handleConfirmDelete}
                onCancel={closeDeleteModal}
            />
        </div>
    );
};

export default RoutesManagement;
