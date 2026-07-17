import React, { useState, useRef } from 'react';
import { Download, Upload, Loader } from 'lucide-react';
import * as adminApi from '@/services/adminApiService';

export default function AdminSettings() {
  const [toast, setToast] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await adminApi.exportCatalog();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cinevault-catalog-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Catalog exported!');
    } catch (err) {
      showToast('Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.movies && !data.collections && !data.settings) {
        throw new Error('Invalid catalog format');
      }

      await adminApi.importCatalog(data);
      showToast('Catalog imported!');
    } catch (err) {
      showToast(err.message || 'Import failed', 'error');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <header className="admin-page__header">
        <h1 className="admin-page__title">Settings</h1>
        <p className="admin-page__subtitle">Import, export, and manage your catalog</p>
      </header>

      <div style={{ maxWidth: 600 }}>
        <h3 style={{ fontSize: 'var(--text-md)', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
          Catalog Management
        </h3>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
          <button className="admin-btn admin-btn--primary" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
            Export Catalog
          </button>

          <button className="admin-btn admin-btn--secondary" onClick={() => fileInputRef.current?.click()} disabled={importing}>
            {importing ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
            Import Catalog
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>

        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-tertiary)',
        }}>
          <p style={{ marginBottom: 'var(--space-2)' }}>
            <strong style={{ color: 'var(--color-text-secondary)' }}>Export</strong> downloads your entire catalog (movies, collections, settings) as a JSON file.
          </p>
          <p>
            <strong style={{ color: 'var(--color-text-secondary)' }}>Import</strong> loads a previously exported catalog JSON file, replacing the current data.
          </p>
        </div>
      </div>

      {toast && <div className={`admin-toast admin-toast--${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
