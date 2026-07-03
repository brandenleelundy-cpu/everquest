import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  User,
  Camera,
} from 'lucide-react';
import { supabase, type ItemImage } from '../lib/supabase';

const BUCKET = 'item-images';

function getPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: ItemImage[];
  startIndex: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIndex);
  const current = images[idx];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(images.length - 1, i + 1));
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white/50 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => Math.max(0, i - 1)); }}
            disabled={idx === 0}
            className="absolute left-5 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => Math.min(images.length - 1, i + 1)); }}
            disabled={idx === images.length - 1}
            className="absolute right-5 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white/50 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      <div className="mx-16 flex max-h-[85vh] max-w-4xl flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        <img
          src={getPublicUrl(current.storage_path)}
          alt={current.caption ?? current.item_name}
          className="max-h-[75vh] max-w-full rounded-lg object-contain shadow-2xl"
        />
        <div className="flex flex-col items-center gap-1 text-center">
          {current.caption && (
            <p className="font-sans text-sm text-white/90">{current.caption}</p>
          )}
          <div className="flex items-center gap-3 font-sans text-xs text-white/40">
            {current.uploader_name && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {current.uploader_name}
              </span>
            )}
            {images.length > 1 && (
              <span>{idx + 1} / {images.length}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Upload form ───────────────────────────────────────────────────────────────

function UploadForm({
  itemName,
  onUploaded,
  onCancel,
}: {
  itemName: string;
  onUploaded: () => void;
  onCancel: () => void;
}) {
  const [file, setFile]         = useState<File | null>(null);
  const [preview, setPreview]   = useState<string | null>(null);
  const [caption, setCaption]   = useState('');
  const [uploader, setUploader] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [drag, setDrag]         = useState(false);
  const inputRef                = useRef<HTMLInputElement>(null);

  function handleFile(f: File) {
    if (!f.type.startsWith('image/')) { setError('Only image files are accepted.'); return; }
    if (f.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB.'); return; }
    setError(null);
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }

  async function handleUpload() {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${slugify(itemName)}_${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadErr) throw uploadErr;
      const { error: dbErr } = await supabase.from('item_images').insert({
        item_name: itemName,
        storage_path: path,
        caption: caption.trim() || null,
        uploader_name: uploader.trim() || null,
      });
      if (dbErr) throw dbErr;
      onUploaded();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  const inputBase =
    'w-full rounded border border-frost-ice-600/50 bg-frost-ice-900/60 px-3 py-2 font-sans text-sm text-frost-steel-100 placeholder-frost-steel-500 outline-none transition-colors focus:border-frost-rime-400/70 focus:ring-1 focus:ring-frost-rime-400/30';

  return (
    <div className="space-y-4 rounded border border-frost-ice-600/40 bg-frost-ice-800/30 p-4">
      <p className="font-serif text-[10px] uppercase tracking-widest text-frost-rime-400">
        Add Screenshot
      </p>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed transition-colors ${
          drag
            ? 'border-frost-rime-400 bg-frost-rime-500/10'
            : 'border-frost-ice-600/50 hover:border-frost-ice-500/70 hover:bg-frost-ice-800/40'
        } ${preview ? 'p-2' : 'px-6 py-8'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="sr-only"
          onChange={onInputChange}
        />
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 max-w-full rounded object-contain"
          />
        ) : (
          <>
            <Upload className="mb-3 h-8 w-8 text-frost-steel-500" />
            <p className="font-serif text-xs uppercase tracking-widest text-frost-steel-400">
              Click or drag to upload
            </p>
            <p className="mt-1 font-sans text-[11px] text-frost-steel-600">
              JPEG, PNG, GIF, WebP · max 5 MB
            </p>
          </>
        )}
      </div>

      {file && (
        <>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={100}
            placeholder="Caption (optional)"
            className={inputBase}
          />
          <input
            value={uploader}
            onChange={(e) => setUploader(e.target.value)}
            maxLength={40}
            placeholder="Your character name (optional)"
            className={inputBase}
          />
        </>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded border border-frost-ember-500/40 bg-frost-ember-600/10 px-3 py-2 text-frost-ember-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="font-sans text-xs">{error}</span>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="btn-ice flex-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <button onClick={onCancel} className="btn-ghost px-4">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Thumbnail grid ────────────────────────────────────────────────────────────

function Thumbnail({
  img,
  onClick,
}: {
  img: ItemImage;
  onClick: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <button
      onClick={onClick}
      className="group relative aspect-square overflow-hidden rounded border border-frost-ice-700/40 bg-frost-ice-800/50 transition-all hover:border-frost-rime-400/50"
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Image className="h-5 w-5 text-frost-steel-600" />
        </div>
      )}
      <img
        src={getPublicUrl(img.storage_path)}
        alt={img.caption ?? img.item_name}
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {img.caption && (
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-frost-ice-900/90 px-2 py-1.5 transition-transform duration-200 group-hover:translate-y-0">
          <p className="line-clamp-2 font-sans text-[10px] text-frost-steel-100">{img.caption}</p>
        </div>
      )}
    </button>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function ItemImages({ itemName }: { itemName: string }) {
  const [images, setImages]   = useState<ItemImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('item_images')
        .select('*')
        .eq('item_name', itemName)
        .order('created_at', { ascending: false })
        .limit(24);
      if (err) throw err;
      setImages(data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load images.');
    } finally {
      setLoading(false);
    }
  }, [itemName]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="font-serif text-xs font-semibold uppercase tracking-widest text-frost-rime-400 flex items-center gap-2">
          <Camera className="h-3.5 w-3.5" />
          Screenshots &amp; Graphics
        </h4>
        {!showUpload && (
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 rounded border border-frost-ice-600/50 px-2.5 py-1 font-serif text-[10px] uppercase tracking-widest text-frost-steel-300 transition-colors hover:border-frost-rime-400/50 hover:text-frost-rime-200"
          >
            <Upload className="h-3 w-3" />
            Add
          </button>
        )}
      </div>

      {showUpload && (
        <UploadForm
          itemName={itemName}
          onUploaded={() => { setShowUpload(false); fetchImages(); }}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {loading ? (
        <div className="flex h-20 items-center justify-center">
          <RefreshCw className="h-4 w-4 animate-spin text-frost-rime-400/50" />
        </div>
      ) : error ? (
        <div className="flex h-16 items-center gap-2 text-frost-ember-400">
          <AlertCircle className="h-4 w-4" />
          <span className="font-sans text-xs">{error}</span>
        </div>
      ) : images.length === 0 && !showUpload ? (
        <button
          onClick={() => setShowUpload(true)}
          className="flex w-full cursor-pointer flex-col items-center gap-2 rounded border border-dashed border-frost-ice-600/40 py-6 transition-colors hover:border-frost-ice-500/60 hover:bg-frost-ice-800/20"
        >
          <Camera className="h-7 w-7 text-frost-steel-600" />
          <p className="font-serif text-xs uppercase tracking-widest text-frost-steel-500">
            No screenshots yet — add one
          </p>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <Thumbnail key={img.id} img={img} onClick={() => setLightbox(i)} />
          ))}
        </div>
      )}

      {lightbox !== null && (
        <Lightbox images={images} startIndex={lightbox} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
