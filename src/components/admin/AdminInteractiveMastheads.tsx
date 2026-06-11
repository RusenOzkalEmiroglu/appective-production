"use client";

import React, { useState, useEffect } from 'react';
import { MastheadItem } from '@/data/interactiveMastheadsData';
import MastheadForm from '@/components/admin/MastheadForm';
import { fetchWithAuth } from '@/lib/auth';

// Define colors based on Appective theme
const primaryTextColor = 'text-white';
const secondaryTextColor = 'text-gray-300';
const accentBgColor = 'bg-purple-600';
const hoverAccentBgColor = 'hover:bg-purple-700';
const darkBg = 'bg-black';
const inputBg = 'bg-gray-800';
const inputBorder = 'border-gray-700';
const buttonClasses = `${accentBgColor} ${primaryTextColor} py-2 px-4 rounded-md ${hoverAccentBgColor} transition-colors`;

const AdminInteractiveMastheadsPage = () => {
  const [mastheads, setMastheads] = useState<MastheadItem[]>([]);
  const [filteredMastheads, setFilteredMastheads] = useState<MastheadItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MastheadItem | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{[key: string]: any}>({});
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [categories, setCategories] = useState<string[]>(['ALL']);
  const [brands, setBrands] = useState<string[]>(['ALL']);

  useEffect(() => {
    fetchMastheads();
  }, []);

  useEffect(() => {
    // Apply filters
    let items = mastheads;
    if (selectedCategory !== 'ALL') {
      items = items.filter(item => item.category.toUpperCase() === selectedCategory);
    }
    if (selectedBrand !== 'ALL') {
      items = items.filter(item => item.brand === selectedBrand);
    }
    setFilteredMastheads(items);
  }, [selectedCategory, selectedBrand, mastheads]);

  const fetchMastheads = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/mastheads');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const formattedData: MastheadItem[] = await res.json();

      setMastheads(formattedData);
      setFilteredMastheads(formattedData);

      // Extract unique categories and brands for filters
      const uniqueCategories = ['ALL', ...Array.from(new Set(formattedData.map((item: MastheadItem) => item.category.toUpperCase())))];
      const uniqueBrands = ['ALL', ...Array.from(new Set(formattedData.map((item: MastheadItem) => item.brand)))];
      setCategories(uniqueCategories as string[]);
      setBrands(uniqueBrands as string[]);
    } catch (err: any) {
      console.error("Fetch Mastheads Error:", err);
      setError(err.message || 'Masthead verileri yüklenemedi.');
      setMastheads([]);
      setFilteredMastheads([]);
    }
    setIsLoading(false);
  };
  


  const openAddForm = () => {
    setEditingItem(null);
    setIsEditMode(false);
    setShowForm(true);
  };

  const openEditForm = (item: MastheadItem) => {
    setEditingItem(item);
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: MastheadItem) => {
    try {
      // Build the payload: include id only when editing (upsert by id), omit for new items (route generates id)
      const payload: Partial<MastheadItem> & { popupTitle: string } = {
        ...data,
        popupTitle: data.title, // popup_title field is required, mirror from title
      };
      if (!isEditMode) {
        delete (payload as any).id;
      } else if (editingItem) {
        payload.id = editingItem.id;
      }

      const res = await fetchWithAuth('/api/mastheads', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || 'save failed');
      }

      setShowForm(false);
      setEditingItem(null);
      // Refresh the full list from the API to reflect the saved state
      await fetchMastheads();
    } catch (err: any) {
      console.error('Masthead kaydetme hatası:', err);
      setError(err.message || 'Masthead kaydedilemedi.');
    }
  };

  const cleanupHtmlAsset = async (filePath: string) => {
    if (!filePath || !filePath.includes('/interactive_mastheads_zips/')) return;
    
    try {
      const response = await fetchWithAuth('/api/cleanup', {
        method: 'POST',
        body: JSON.stringify({ filePath }),
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: 'Failed to parse error' }));
        console.error('Cleanup error:', errData.message || `HTTP error! status: ${response.status}`);
      } else {
        console.log('HTML5 asset cleanup successful');
      }
    } catch (err: any) {
      console.error('HTML5 asset cleanup error:', err.message);
    }
  };

  const debugMastheadFile = async (masthead: MastheadItem) => {
    try {
      const response = await fetch(`/api/check-masthead-file?path=${encodeURIComponent(masthead.popupHtmlPath)}`);
      const data = await response.json();
      
      setDebugInfo(prev => ({
        ...prev,
        [masthead.id]: {
          originalPath: masthead.popupHtmlPath,
          exists: data.exists,
          checkedAt: new Date().toLocaleTimeString()
        }
      }));
    } catch (error) {
      console.error('Debug error:', error);
      setDebugInfo(prev => ({
        ...prev,
        [masthead.id]: {
          originalPath: masthead.popupHtmlPath,
          exists: false,
          error: 'API hatası',
          checkedAt: new Date().toLocaleTimeString()
        }
      }));
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Bu masthead öğesini silmek istediğinizden emin misiniz? Bu değişiklik kalıcı olacaktır.')) {
      try {
        const res = await fetchWithAuth(`/api/mastheads?id=${encodeURIComponent(itemId)}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('delete failed');

        // Update local state
        setMastheads(mastheads.filter(item => item.id !== itemId));
      } catch (err: any) {
        console.error('Masthead silme hatası:', err);
        setError(err.message || 'Masthead silinemedi.');
      }
    }
  };

  return (
    <div className="h-full">
      <h1 className={`text-2xl font-bold ${primaryTextColor} mb-6`}>Rich Media</h1>
      
      {/* Filters */}
      <div className={`${inputBg} p-4 rounded-lg mb-6 shadow-md`}>
        <h2 className={`text-lg font-medium ${primaryTextColor} mb-4`}>Filters</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className={`block ${secondaryTextColor} text-sm font-medium mb-2`}>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'ALL' ? 'All Categories' : category.charAt(0) + category.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className={`block ${secondaryTextColor} text-sm font-medium mb-2`}>Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {brands.map(brand => (
                <option key={brand} value={brand}>
                  {brand === 'ALL' ? 'All Brands' : brand}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={openAddForm}
          className={`${buttonClasses}`}
          disabled={isLoading}
        >
          Add New Rich Media
        </button>
      </div>
      
      {/* Mastheads List */}
      <div className={`${inputBg} rounded-lg shadow-xl p-4`}>
        {isLoading && filteredMastheads.length === 0 ? (
          <p className={`${secondaryTextColor} text-center py-10`}>Loading mastheads...</p>
        ) : error && filteredMastheads.length === 0 ? (
          <p className="text-red-500 text-center py-10">Error loading data: {error}</p>
        ) : filteredMastheads.length === 0 ? (
          <p className={`${secondaryTextColor} text-center py-10`}>No mastheads found for the selected filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${secondaryTextColor} uppercase tracking-wider`}>Preview</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${secondaryTextColor} uppercase tracking-wider`}>Category</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${secondaryTextColor} uppercase tracking-wider`}>Brand</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${secondaryTextColor} uppercase tracking-wider`}>Size</th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${secondaryTextColor} uppercase tracking-wider`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredMastheads.map((masthead) => (
                  <tr key={masthead.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-20 h-12 bg-gray-600 rounded overflow-hidden">
                        {masthead.image && (
                          <img 
                            src={masthead.image} 
                            alt={masthead.title} 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${secondaryTextColor}`}>
                      {masthead.category}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${secondaryTextColor}`}>
                      {masthead.brand}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${secondaryTextColor}`}>
                      {masthead.bannerDetails?.size || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={() => openEditForm(masthead)} 
                        className="text-purple-400 hover:text-purple-300 mr-2"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => debugMastheadFile(masthead)} 
                        className="text-blue-400 hover:text-blue-300 mr-2"
                        title="Dosya varlığını kontrol et"
                      >
                        Debug
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(masthead.id)} 
                        className="text-red-500 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Debug Panel */}
      {Object.keys(debugInfo).length > 0 && (
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">🔍 Debug Bilgileri</h3>
          <div className="space-y-2">
            {Object.entries(debugInfo).map(([id, info]) => (
              <div key={id} className="p-3 bg-gray-700 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">ID: {id}</span>
                  <span className={`text-sm ${info.exists ? 'text-green-400' : 'text-red-400'}`}>
                    {info.exists ? '✅ Dosya mevcut' : '❌ Dosya bulunamadı'}
                  </span>
                </div>
                <div className="text-sm text-gray-300 mt-1">
                  <div>Yol: <code className="bg-black/50 px-2 py-1 rounded">{info.originalPath}</code></div>
                  <div>Kontrol zamanı: {info.checkedAt}</div>
                  {info.error && <div className="text-red-400">Hata: {info.error}</div>}
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setDebugInfo({})}
            className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
          >
            Debug Bilgilerini Temizle
          </button>
        </div>
      )}
      
      {/* Form Modal */}
      {showForm && (
        <MastheadForm
          initialData={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          isEditMode={isEditMode}
        />
      )}
    </div>
  );
};

export default AdminInteractiveMastheadsPage;
