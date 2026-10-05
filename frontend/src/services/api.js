const API_BASE_URL = 'http://localhost:5000/api';

// Mengambil seluruh data rute & tarif dari database backend
export const fetchRoutes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/routes`);
    if (!response.ok) {
      throw new Error('Gagal mengambil data dari server');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
};
