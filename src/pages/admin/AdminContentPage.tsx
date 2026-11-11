import { useEffect, useState } from 'react';
import { CheckCircle2, Save } from 'lucide-react';
import {
  fetchSiteContentAdmin,
  saveSiteContentAdmin,
} from '@/services/adminService';
import type { SiteContent } from '@/types/database';

export function AdminContentPage() {
  const [items, setItems] = useState<SiteContent[]>([]);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteContentAdmin().then(setItems);
  }, []);

  const updateField = (id: string, field: keyof SiteContent, value: string | boolean) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async (item: SiteContent) => {
    await saveSiteContentAdmin(item);
    setSavedKey(item.key);
    window.setTimeout(() => setSavedKey(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-banana">
          No-Code Website CMS
        </p>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-kumkum">
          Website Banners &amp; Announcements
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Update the top announcement bar, hero headline, and daily specials notice on the public website.
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <section
            key={item.id}
            className="rounded-2xl bg-white border border-sand-border p-5 space-y-4 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-turmeric-soft px-3 py-1 text-xs font-bold uppercase text-wood">
                {item.key.replace(/_/g, ' ')}
              </span>
              <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.is_active}
                  onChange={(e) => updateField(item.id, 'is_active', e.target.checked)}
                />
                Visible on Public Website
              </label>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                  Title / Headline
                </label>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={(e) => updateField(item.id, 'title', e.target.value)}
                  className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                  Subtitle / Badge Text
                </label>
                <input
                  type="text"
                  value={item.subtitle || ''}
                  onChange={(e) => updateField(item.id, 'subtitle', e.target.value)}
                  className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
                />
              </div>

              {item.body !== null && (
                <div>
                  <label className="block text-xs font-bold uppercase text-ink-muted mb-1">
                    Body Copy
                  </label>
                  <textarea
                    rows={2}
                    value={item.body || ''}
                    onChange={(e) => updateField(item.id, 'body', e.target.value)}
                    className="w-full rounded-xl border border-sand-border bg-cream px-3 py-2"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              {savedKey === item.key && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-banana-dark">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved
                </span>
              )}
              <button
                type="button"
                onClick={() => handleSave(item)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-kumkum hover:bg-kumkum-dark text-white px-4 py-2 text-xs font-bold cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

