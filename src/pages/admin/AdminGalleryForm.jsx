import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { galleryAPI, BASE_IMAGE_URL } from '../../utils/api';
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react';

export default function AdminGalleryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'kegiatan',
    status: 'active',
    image: '',
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    loadCategories();
    if (isEdit) {
      loadItem();
    }
  }, [id, isEdit]);

  const loadCategories = async () => {
    try {
      const res = await galleryAPI.getCategories();
      setCategories(res.data || []);
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  };

  const loadItem = async () => {
    try {
      const res = await galleryAPI.getById(id);
      const item = res.data;
      setFormData({
        title: item.title || '',
        description: item.description || '',
        category: item.category || 'kegiatan',
        status: item.status || 'active',
        image: item.image || '',
      });
      if (item.image) {
        setImagePreview(`${BASE_IMAGE_URL}/${item.image}`);
      }
    } catch (e) {
      console.error('Failed to load gallery item:', e);
      alert('Gagal memuat data item galeri');
      navigate('/admin/galeri');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.image;
    
    setUploading(true);
    try {
      const res = await galleryAPI.uploadImage(imageFile, isEdit ? id : null);
      return res.data.filename;
    } catch (e) {
      console.error('Failed to upload image:', e);
      throw new Error('Gagal mengunggah gambar');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Judul harus diisi');
      return;
    }

    if (!imageFile && !formData.image) {
      alert('Gambar harus dipilih');
      return;
    }

    setLoading(true);
    try {
      let imageFilename = formData.image;
      
      if (imageFile) {
        imageFilename = await uploadImage();
      }

      const submitData = {
        ...formData,
        image: imageFilename,
      };

      if (isEdit) {
        await galleryAPI.update(id, submitData);
        alert('Item galeri berhasil diperbarui');
      } else {
        await galleryAPI.create(submitData);
        alert('Item galeri berhasil ditambahkan');
      }
      
      navigate('/admin/galeri');
    } catch (e) {
      console.error('Failed to save gallery item:', e);
      alert(e.message || 'Gagal menyimpan item galeri');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/galeri')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Item Galeri' : 'Tambah Item Galeri'}
        </h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Judul <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Masukkan judul item galeri"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Masukkan deskripsi item galeri"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gambar <span className="text-red-500">*</span>
              </label>
              
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Pilih gambar atau drag & drop
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          PNG, JPG, JPEG hingga 20MB
                        </span>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {!imagePreview && (
                <div className="mt-2">
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    <Upload size={16} className="mr-2" />
                    Pilih Gambar
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/admin/galeri')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading || uploading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {uploading ? 'Mengunggah...' : 'Menyimpan...'}
                </div>
              ) : (
                isEdit ? 'Perbarui' : 'Simpan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
