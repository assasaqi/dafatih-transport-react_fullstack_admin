import React, { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal';
import Pagination from './Pagination';
import './Admin.css';

const GalleryManagement = ({ handleFileUpload, showToast }) => {
    const [gallery, setGallery] = useState([]);
    const [galleryLoading, setGalleryLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [expandedCardIds, setExpandedCardIds] = useState({});

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        targetId: null
    });

    const initialFormState = {
        title: '',
        category: 'armada',
        image: '',
        description: ''
    };

    const [formState, setFormState] = useState(initialFormState);

    const notify = (msg, type = 'success') => {
        if (showToast) showToast(msg, type);
        else alert(msg);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            notify('Ukuran gambar terlalu besar! Maksimal 5MB.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormState((prev) => ({
                ...prev,
                image: reader.result
            }));
        };
        reader.readAsDataURL(file);
    };

    const toggleCardDetail = (id) => {
        setExpandedCardIds((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory]);

    const fetchGallery = () => {
        setGalleryLoading(true);
        fetch('http://localhost:5000/api/gallery')
            .then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || `Gagal memuat data (Status ${res.status})`);
                }
                return res.json();
            })
            .then((data) => {
                setGallery(Array.isArray(data) ? data : data.gallery || []);
                setGalleryLoading(false);
            })
            .catch((err) => {
                console.error('Gagal memuat galeri:', err.message);
                setGalleryLoading(false);
            });
    };

    useEffect(() => {
        fetchGallery();
    }, []);

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormState(initialFormState);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formState.image) {
            notify('Gambar galeri wajib diunggah!', 'error');
            return;
        }

        const payload = {
            title: formState.title ? formState.title.trim() : '',
            category: formState.category || 'armada',
            image: formState.image,
            description: formState.description ? formState.description.trim() : ''
        };

        const isEdit = editingId !== null;
        const url = isEdit
            ? `http://localhost:5000/api/gallery/${editingId}`
            : 'http://localhost:5000/api/gallery';
        const method = isEdit ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || 'Gagal menyimpan item galeri');
                return data;
            })
            .then((data) => {
                notify(data.message || 'Berhasil menyimpan item galeri!', 'success');
                fetchGallery();
                closeForm();
            })
            .catch((err) => notify(`Gagal menyimpan: ${err.message}`, 'error'));
    };

    const handleEdit = (item) => {
        const existingImage = item.image || item.imageUrl || item.url || item.photo || item.img || '';

        setFormState({
            title: item.title || '',
            category: item.category || 'armada',
            image: existingImage,
            description: item.description || ''
        });
        setEditingId(item.id || item._id);
        setShowForm(true);
    };

    const openDeleteModal = (id) => {
        setDeleteModal({ isOpen: true, targetId: id });
    };

    const closeDeleteModal = () => {
        setDeleteModal({ isOpen: false, targetId: null });
    };

    const handleConfirmDelete = () => {
        const id = deleteModal.targetId;
        if (!id) return;

        fetch(`http://localhost:5000/api/gallery/${id}`, { method: 'DELETE' })
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || 'Gagal menghapus galeri');
                return data;
            })
            .then((data) => {
                notify(data.message || 'Item galeri berhasil dihapus!', 'success');
                fetchGallery();
            })
            .catch((err) => notify(`Error: ${err.message}`, 'error'))
            .finally(() => {
                closeDeleteModal();
            });
    };

    const filteredGallery = gallery.filter((item) => {
        const matchesCategory = selectedCategory === 'all' ||
            (item.category || '').toLowerCase() === selectedCategory.toLowerCase();

        const q = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            (item.title && item.title.toLowerCase().includes(q)) ||
            (item.description && item.description.toLowerCase().includes(q));

        return matchesCategory && matchesSearch;
    });

    const totalPages = Math.ceil(filteredGallery.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredGallery.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div>
            <div className="content-header">
                <h2>Kelola Galeri Dokumentasi</h2>
                <button
                    className="btn-add-primary"
                    onClick={() => { closeForm(); setShowForm(true); }}
                >
                    + Tambah Foto Galeri
                </button>
            </div>

            {showForm && (
                <div className="modal-backdrop" onClick={closeForm}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingId !== null ? `Edit Galeri #${editingId}` : 'Tambah Foto Baru'}</h3>
                            <button className="btn-close-modal" onClick={closeForm}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="admin-form-grid">
                            <input
                                type="text"
                                placeholder="Judul Foto / Dokumentasi"
                                value={formState.title}
                                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                                required
                                className="full-width"
                            />

                            <select
                                value={formState.category}
                                onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                                required
                                className="full-width"
                            >
                                <option value="armada">Armada / Kendaraan</option>
                                <option value="destinasi">Destinasi Wisata</option>
                                <option value="testimoni">Testimoni Pelanggan</option>
                                <option value="kegiatan">Kegiatan & Trip</option>
                            </select>

                            <div className="full-width">
                                <label className="form-label">Upload Gambar Galeri:</label>
                                <div className="image-upload-box">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="file-input"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                {formState.image && (
                                    <div className="image-preview-container">
                                        <img src={formState.image} alt="Preview Galeri" className="image-preview" />
                                        <span className="upload-success-badge">✓ Gambar terpilih</span>
                                    </div>
                                )}
                            </div>

                            <textarea
                                placeholder="Deskripsi Keterangan Foto..."
                                value={formState.description}
                                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                className="full-width"
                                rows="3"
                            />

                            <div className="full-width form-actions">
                                <button
                                    type="submit"
                                    className={editingId !== null ? "btn-submit-update" : "btn-submit-save"}
                                >
                                    {editingId !== null ? 'Perbarui Foto' : 'Simpan Foto'}
                                </button>
                                <button type="button" onClick={closeForm} className="btn-cancel">
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="toolbar-container">
                <div className="filter-toolbar" style={{ marginBottom: 0 }}>
                    {['all', 'armada', 'destinasi', 'testimoni', 'kegiatan'].map((cat) => (
                        <button
                            key={cat}
                            className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="search-input-box">
                    <input
                        type="text"
                        placeholder="Cari foto galeri..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {galleryLoading ? (
                <p className="empty-text">Memuat foto galeri...</p>
            ) : (
                <div className="cards-container">
                    {currentItems.length === 0 ? (
                        <p className="empty-text">Data galeri tidak ditemukan.</p>
                    ) : (
                        currentItems.map((item) => {
                            const itemKey = item.id || item._id;
                            const isExpanded = !!expandedCardIds[itemKey];
                            const imageUrl = item.image || item.imageUrl || item.url || item.photo || item.img || '';

                            return (
                                <div key={itemKey} className={`item-card-wrapper ${isExpanded ? 'is-open' : ''}`}>
                                    <div className="item-card">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={item.title}
                                                className="card-thumbnail"
                                            />
                                        ) : (
                                            <div className="card-thumbnail" style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#888' }}>
                                                No Img
                                            </div>
                                        )}

                                        <div className="card-main-info">
                                            <span className="card-category-badge">{item.category}</span>
                                            <h4 className="card-title">{item.title}</h4>
                                        </div>

                                        <div className="card-actions">
                                            <button onClick={() => handleEdit(item)} className="btn-edit">Edit</button>
                                            <button onClick={() => openDeleteModal(itemKey)} className="btn-delete">Hapus</button>
                                            <button
                                                onClick={() => toggleCardDetail(itemKey)}
                                                className={`btn-dropdown-toggle ${isExpanded ? 'active' : ''}`}
                                            >
                                                {isExpanded ? 'Detail' : 'Detail'}
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="card-detail-dropdown">
                                            <div className="detail-row">
                                                <div className="detail-item">
                                                    <strong>Kategori:</strong>
                                                    <span>{item.category || '-'}</span>
                                                </div>
                                            </div>

                                            <div className="full-width-detail">
                                                <strong>Deskripsi Foto:</strong>
                                                <p>{item.description || 'Tidak ada deskripsi tambahan.'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
            />

            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Hapus Galeri"
                message="Apakah Anda yakin ingin menghapus foto galeri ini?"
                onConfirm={handleConfirmDelete}
                onCancel={closeDeleteModal}
            />
        </div>
    );
};

export default GalleryManagement;
