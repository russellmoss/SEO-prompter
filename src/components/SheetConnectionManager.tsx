'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2, ExternalLink, Trash2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SheetConnection {
  id: string;
  name: string;
  sheet_id: string;
  sheet_name: string;
  client_name?: string;
  sheet_url: string;
  last_synced?: string;
}

interface SheetConnectionManagerProps {
  onSheetSelect: (sheetId: string | null) => void;
  selectedSheetId?: string | null;
}

export default function SheetConnectionManager({ 
  onSheetSelect, 
  selectedSheetId 
}: SheetConnectionManagerProps) {
  const [sheets, setSheets] = useState<SheetConnection[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [newSheet, setNewSheet] = useState({
    name: '',
    url: '',
    clientName: '',
  });

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    try {
      const { data, error } = await supabase
        .from('sheet_connections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSheets(data || []);
    } catch (err) {
      console.error('Error loading sheets:', err);
      setError('Failed to load sheet connections');
    }
  };

  const validateSheet = async () => {
    setValidating(true);
    setError(null);

    try {
      // Extract spreadsheetId from URL
      const match = newSheet.url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      const spreadsheetId = match ? match[1] : null;
      if (!spreadsheetId) {
        setError('Invalid Google Sheets URL');
        setValidating(false);
        return;
      }

      // Optionally, validate access to the sheet here
      // ...

      setValidating(false);
      return spreadsheetId;
    } catch (err) {
      setError('Failed to validate sheet');
      setValidating(false);
      return null;
    }
  };

  const handleAddSheet = async () => {
    setLoading(true);
    setError(null);
    const spreadsheetId = await validateSheet();
    if (!spreadsheetId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch sheet name (optional, could use Google Sheets API)
      const sheetName = 'Sheet';
      const { data, error } = await supabase
        .from('sheet_connections')
        .insert([
          {
            name: newSheet.name,
            sheet_id: spreadsheetId,
            sheet_name: sheetName,
            client_name: newSheet.clientName,
            sheet_url: newSheet.url,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setSheets([data, ...sheets]);
      setShowAddModal(false);
      setNewSheet({ name: '', url: '', clientName: '' });
    } catch (err) {
      setError('Failed to save sheet connection');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSheet = async (id: string) => {
    if (!confirm('Are you sure you want to remove this sheet connection?')) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('sheet_connections')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setSheets(sheets.filter((s) => s.id !== id));
    } catch (err) {
      setError('Failed to delete sheet connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Google Sheet Connections</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Sheet
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Active Sheet</label>
        <select
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          value={selectedSheetId || ''}
          onChange={(e) => onSheetSelect(e.target.value || null)}
        >
          <option value="">-- Select a sheet --</option>
          {sheets.map((sheet) => (
            <option key={sheet.id} value={sheet.sheet_id}>
              {sheet.name} ({sheet.sheet_name})
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mt-4">
        <h3 className="text-lg font-semibold mb-2">All Sheet Connections</h3>
        <ul className="divide-y divide-gray-200">
          {sheets.map((sheet) => (
            <li key={sheet.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{sheet.name}</div>
                <div className="text-xs text-gray-500">{sheet.sheet_url}</div>
                <div className="text-xs text-gray-400">Client: {sheet.client_name || 'N/A'}</div>
                <div className="text-xs text-gray-400">Last Synced: {sheet.last_synced || 'Never'}</div>
              </div>
              <div className="flex items-center space-x-2">
                <a href={sheet.sheet_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  onClick={() => handleDeleteSheet(sheet.id)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Sheet Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Add Google Sheet Connection</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Connection Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={newSheet.name}
                  onChange={(e) => setNewSheet({ ...newSheet, name: e.target.value })}
                  placeholder="e.g. 2025 Blog Calendar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Google Sheet URL</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={newSheet.url}
                  onChange={(e) => setNewSheet({ ...newSheet, url: e.target.value })}
                  placeholder="Paste the full Google Sheet URL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Client Name (optional)</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={newSheet.clientName}
                  onChange={(e) => setNewSheet({ ...newSheet, clientName: e.target.value })}
                  placeholder="e.g. Milea Estate"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSheet}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                disabled={loading || validating}
              >
                {loading || validating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Add Sheet
              </button>
            </div>
            {error && <div className="text-red-600 mt-2">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
} 