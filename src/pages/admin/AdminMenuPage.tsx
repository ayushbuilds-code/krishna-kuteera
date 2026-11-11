import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Edit3, Plus, Search, X } from 'lucide-react';
import { formatCurrency } from '@/config/brand';
import { MOCK_OUTLETS } from '@/data/mockSeed';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  fetchAdminOutletMenu,
  saveMenuItem,
  toggleOutletMenuAvailability,
  updateOutletMenuPrice,
} from '@/services/adminService';
import { PureVegBadge } from '@/components/PureVegBadge';
import type { MenuCategory, OutletMenuItem, SpiceLevel } from '@/types/database';

export function AdminMenuPage() {
  const { activeOutletId, can } = useAdminAuth();
  const targetOutletId =
    activeOutletId === 'all' ? MOCK_OUTLETS[0].id : activeOutletId;

  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<OutletMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Add / Edit Dish Modal
  const [editingItem, setEditingItem] = useState<Partial<OutletMenuItem> | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { categories: cats, items: list } = await fetchAdminOutletMenu(
      targetOutletId
    );
    setCategories(cats);
    setItems(list);
    setLoading(false);
  }, [targetOutletId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((it) => {
      if (selectedCat !== 'all' && it.category_id !== selectedCat) return false;
      if (q && !it.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, search, selectedCat]);

  const handleToggleSoldOut = async (item: OutletMenuItem) => {
    const nextAvail = !item.is_available;
    setItems((prev) =>
      prev.map((m) =>
        m.id === item.id ? { ...m, is_available: nextAvail } : m
      )
    );
    await toggleOutletMenuAvailability(
      targetOutletId,
      item.id,
      nextAvail,
      item.outlet_price
    );
  };

  const handlePriceBlur = async (item: OutletMenuItem, rawVal: string) => {
    const parsed = Number(rawVal);
    if (Number.isNaN(parsed) || parsed < 0 || parsed === item.outlet_price) return;
    setItems((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, outlet_price: parsed } : m))
    );
    await updateOutletMenuPrice(targetOutletId, item.id, parsed);
  };

  const handleSaveModal = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name || !editingItem.category_id) return;
    setSaving(true);
    try {
      await saveMenuItem({
        id: editingItem.id,
        name: editingItem.name,
        category_id: editingItem.category_id,
        description: editingItem.description || '',
        base_price: Number(editingItem.base_price || 0),
        spice_level: (editingItem.spice_level as SpiceLevel) || 'mild',
        is_jain_available: Boolean(editingItem.is_jain_available),
        is_no_onion_garlic: Boolean(editingItem.is_no_onion_garlic),
        is_bestseller: Boolean(editingItem.is_bestseller),
        is_todays_special: Boolean(editingItem.is_todays_special),
        is_bakery_item: Boolean(editingItem.is_bakery_item),
        image_url: editingItem.image_url || null,
      });
      setEditingItem(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const canManageCatalog = can('manage_menu');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-banana">
            Instant Live Sync to Public Website
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-kumkum">
            Menu &amp; 1-Click Sold Out
          </h1>
        </div>

        {canManageCatalog && (
          <button
            type="button"
            onClick={() =>
              setEditingItem({
                name: '',
                category_id: categories[0]?.id || '',
                base_price: 80,
                spice_level: 'mild',
                is_jain_available: true,
              })
            }
            className="inline-flex items-center gap-1.5 rounded-xl bg-kumkum hover:bg-kumkum-dark text-white px-4 py-2.5 text-xs sm:text-sm font-bold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Dish
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white border border-sand-border p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dish (e.g. Rava Idli, Benne Dosa)…"
            className="w-full rounded-xl border border-sand-border bg-cream pl-9 pr-4 py-2 text-sm"
          />
        </div>
        <select
          aria-label="Filter by category"
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="rounded-xl border border-sand-border bg-cream px-3 py-2 text-sm font-semibold"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Menu Table */}
      <div className="rounded-2xl bg-white border border-sand-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-cream-warm text-xs uppercase text-ink-muted border-b border-sand-border">
              <tr>
                <th className="py-3 px-4">Dish</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Outlet Price (₹)</th>
                <th className="py-3 px-4">Availability (1-Click)</th>
                {canManageCatalog && <th className="py-3 px-4 text-right">Edit</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-ink-muted">
                    Loading menu items…
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className={item.is_available ? '' : 'bg-kumkum-soft/40'}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <PureVegBadge compact />
                        <div>
                          <p className="font-semibold text-ink">{item.name}</p>
                          <p className="text-[11px] text-ink-muted">
                            Base: {formatCurrency(item.base_price)} • {item.spice_level}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-ink-muted">
                      {item.category_name}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        defaultValue={item.outlet_price}
                        disabled={!canManageCatalog}
                        onBlur={(e) => handlePriceBlur(item, e.target.value)}
                        aria-label={`Price for ${item.name}`}
                        className="w-24 rounded-lg border border-sand-border bg-cream px-2.5 py-1 text-sm font-bold disabled:opacity-60"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleSoldOut(item)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                          item.is_available
                            ? 'bg-banana-soft text-banana-dark hover:bg-banana hover:text-white'
                            : 'bg-kumkum text-white hover:bg-kumkum-dark'
                        }`}
                      >
                        {item.is_available ? 'Available ✓' : 'Sold Out ✕'}
                      </button>
                    </td>
                    {canManageCatalog && (
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="inline-flex items-center gap-1 rounded-lg border border-sand-border px-2.5 py-1 text-xs font-semibold hover:bg-cream-warm cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSaveModal}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-sand-border max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-sand-border pb-3">
              <h2 className="font-serif text-xl font-bold text-kumkum">
                {editingItem.id ? 'Edit Dish' : 'Add Pure-Veg Dish'}
              </h2>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 text-ink-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.name || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                    Category *
                  </label>
                  <select
                    value={editingItem.category_id || ''}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        category_id: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2 text-sm"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editingItem.base_price ?? 80}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        base_price: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2 text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-1 text-xs font-semibold">
                <label className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.is_jain_available)}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        is_jain_available: e.target.checked,
                      })
                    }
                  />
                  Jain Available
                </label>
                <label className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.is_bestseller)}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        is_bestseller: e.target.checked,
                      })
                    }
                  />
                  Bestseller
                </label>
                <label className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.is_todays_special)}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        is_todays_special: e.target.checked,
                      })
                    }
                  />
                  Today&apos;s Special
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-sand-border">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="rounded-xl border border-sand-border px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-kumkum text-white px-5 py-2 text-xs font-bold cursor-pointer"
              >
                {saving ? 'Saving…' : 'Save Dish'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

