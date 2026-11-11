import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Package,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { formatCurrency } from '@/config/brand';
import { MOCK_OUTLETS } from '@/data/mockSeed';
import { useAdminAuth } from '@/context/AdminAuthContext';
import {
  addInventoryItemAdmin,
  fetchInventoryAdmin,
  recordStockMovementAdmin,
} from '@/services/phase6Service';
import type {
  InventoryItem,
  StockMovement,
  StockMovementType,
} from '@/types/database';

export function AdminInventoryPage() {
  const { activeOutletId, staff } = useAdminAuth();
  const targetOutletId =
    activeOutletId === 'all' ? MOCK_OUTLETS[0].id : activeOutletId;

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Item Modal
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Dry Groceries');
  const [unit, setUnit] = useState('kg');
  const [currentStock, setCurrentStock] = useState(10);
  const [reorderLevel, setReorderLevel] = useState(5);
  const [costPerUnit, setCostPerUnit] = useState(100);
  const [supplier, setSupplier] = useState('');

  // Log Movement Modal
  const [movTarget, setMovTarget] = useState<InventoryItem | null>(null);
  const [movType, setMovType] = useState<StockMovementType>('purchase');
  const [movQty, setMovQty] = useState(5);
  const [movReason, setMovReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchInventoryAdmin(activeOutletId);
    setItems(res.items);
    setMovements(res.movements);
    setLoading(false);
  }, [activeOutletId]);

  useEffect(() => {
    load();
  }, [load]);

  const lowStockCount = items.filter(
    (i) => i.current_stock <= i.reorder_level
  ).length;

  const handleAddItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addInventoryItemAdmin({
      outletId: targetOutletId,
      name: name.trim(),
      category,
      unit,
      currentStock,
      reorderLevel,
      costPerUnit,
      supplierName: supplier.trim() || undefined,
    });
    setName('');
    setSupplier('');
    setAddOpen(false);
    await load();
  };

  const handleRecordMovement = async (e: FormEvent) => {
    e.preventDefault();
    if (!movTarget || movQty <= 0) return;
    await recordStockMovementAdmin({
      outletId: movTarget.outlet_id,
      inventoryItemId: movTarget.id,
      movementType: movType,
      quantity: movQty,
      reason: movReason.trim(),
      recordedBy: staff?.id,
    });
    setMovTarget(null);
    setMovReason('');
    await load();
  };

  const itemNameById = new Map(items.map((i) => [i.id, i]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-banana">
            Kitchen Store &amp; Cost Control
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-kumkum">
            Inventory &amp; Wastage Log
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-kumkum text-white px-4 py-2.5 text-xs font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Ingredient
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="rounded-2xl bg-kumkum-soft border border-kumkum/30 px-4 py-3 flex items-center gap-2.5 text-sm font-semibold text-kumkum">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          {lowStockCount} ingredient{lowStockCount === 1 ? '' : 's'} at or below reorder
          level — restock soon to avoid morning prep shortages.
        </div>
      )}

      {/* Stock Table */}
      <section className="rounded-2xl bg-white border border-sand-border overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-cream-warm text-xs uppercase text-ink-muted border-b border-sand-border">
              <tr>
                <th className="py-3 px-4">Ingredient</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Reorder At</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4 text-right">Log Movement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-ink-muted">
                    Loading inventory…
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isLow = item.current_stock <= item.reorder_level;
                  return (
                    <tr
                      key={item.id}
                      className={isLow ? 'bg-kumkum-soft/35' : ''}
                    >
                      <td className="py-3 px-4">
                        <p className="font-semibold text-ink flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-wood shrink-0" />
                          {item.name}
                        </p>
                        {item.supplier_name && (
                          <p className="text-[11px] text-ink-muted">
                            Supplier: {item.supplier_name}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-ink-muted">
                        {item.category}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isLow
                              ? 'bg-kumkum text-white'
                              : 'bg-banana-soft text-banana-dark'
                          }`}
                        >
                          {item.current_stock} {item.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-ink-muted">
                        {item.reorder_level} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold">
                        {formatCurrency(item.cost_per_unit)}/{item.unit}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setMovTarget(item);
                            setMovType('purchase');
                            setMovQty(5);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-banana-soft text-banana-dark hover:bg-banana hover:text-white px-2.5 py-1 text-xs font-bold cursor-pointer"
                        >
                          <ArrowUpCircle className="w-3.5 h-3.5" />
                          Restock
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMovTarget(item);
                            setMovType('wastage');
                            setMovQty(1);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-kumkum-soft text-kumkum hover:bg-kumkum hover:text-white px-2.5 py-1 text-xs font-bold cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Wastage
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMovTarget(item);
                            setMovType('usage');
                            setMovQty(2);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-sand-border px-2.5 py-1 text-xs font-semibold cursor-pointer"
                        >
                          <ArrowDownCircle className="w-3.5 h-3.5" />
                          Use
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Stock & Wastage Log */}
      <section className="rounded-2xl bg-white border border-sand-border p-5 space-y-3 shadow-xs">
        <h2 className="font-serif text-lg font-bold text-ink">
          Recent Stock &amp; Wastage Movements
        </h2>
        {movements.length === 0 ? (
          <p className="text-sm text-ink-muted">No movements recorded yet.</p>
        ) : (
          <ul className="divide-y divide-sand-border text-sm">
            {movements.map((mov) => {
              const ing = itemNameById.get(mov.inventory_item_id);
              return (
                <li
                  key={mov.id}
                  className="py-2.5 flex flex-wrap items-center justify-between gap-2"
                >
                  <div>
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase mr-2 ${
                        mov.movement_type === 'purchase'
                          ? 'bg-banana-soft text-banana-dark'
                          : mov.movement_type === 'wastage'
                            ? 'bg-kumkum-soft text-kumkum'
                            : 'bg-cream-warm text-wood'
                      }`}
                    >
                      {mov.movement_type}
                    </span>
                    <strong className="text-ink">{ing?.name || 'Ingredient'}</strong>
                    {mov.reason && (
                      <span className="text-xs text-ink-muted ml-2">
                        — {mov.reason}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-ink-muted">
                    {mov.movement_type === 'purchase' ? '+' : '-'}
                    {Math.abs(mov.quantity)} {ing?.unit || ''} •{' '}
                    {new Date(mov.created_at).toLocaleString('en-IN')}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Add Ingredient Modal */}
      {addOpen && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddItem}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-sand-border"
          >
            <div className="flex items-center justify-between border-b border-sand-border pb-3">
              <h3 className="font-serif text-xl font-bold text-kumkum">
                Add Ingredient
              </h3>
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="p-1 text-ink-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <input
                type="text"
                required
                placeholder="Ingredient Name (e.g. Urad Dal)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category"
                  className="rounded-xl border border-sand-border bg-cream px-3 py-2"
                />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Unit (kg, litre, pcs)"
                  className="rounded-xl border border-sand-border bg-cream px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Stock</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full rounded-xl border border-sand-border bg-cream px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Reorder</label>
                  <input
                    type="number"
                    step="0.1"
                    value={reorderLevel}
                    onChange={(e) => setReorderLevel(Number(e.target.value))}
                    className="w-full rounded-xl border border-sand-border bg-cream px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-ink-muted">Cost ₹</label>
                  <input
                    type="number"
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(Number(e.target.value))}
                    className="w-full rounded-xl border border-sand-border bg-cream px-2.5 py-2"
                  />
                </div>
              </div>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="Supplier Name (optional)"
                className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="rounded-xl border border-sand-border px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-kumkum text-white px-5 py-2 text-xs font-bold cursor-pointer"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Log Stock Movement Modal */}
      {movTarget && (
        <div className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleRecordMovement}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-sand-border"
          >
            <div className="flex items-center justify-between border-b border-sand-border pb-3">
              <h3 className="font-serif text-xl font-bold text-kumkum">
                Log {movType.toUpperCase()} — {movTarget.name}
              </h3>
              <button
                type="button"
                onClick={() => setMovTarget(null)}
                className="p-1 text-ink-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                  Movement Type
                </label>
                <select
                  value={movType}
                  onChange={(e) => setMovType(e.target.value as StockMovementType)}
                  className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2 font-semibold"
                >
                  <option value="purchase">Purchase / Restock (+)</option>
                  <option value="usage">Daily Kitchen Usage (-)</option>
                  <option value="wastage">Wastage / Spoilage (-)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                  Quantity ({movTarget.unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  min={0.1}
                  required
                  value={movQty}
                  onChange={(e) => setMovQty(Number(e.target.value))}
                  className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                  Reason / Invoice Note
                </label>
                <input
                  type="text"
                  value={movReason}
                  onChange={(e) => setMovReason(e.target.value)}
                  placeholder="e.g. Morning delivery / Spoiled batch"
                  className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMovTarget(null)}
                className="rounded-xl border border-sand-border px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-kumkum text-white px-5 py-2 text-xs font-bold cursor-pointer"
              >
                Save Movement
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

