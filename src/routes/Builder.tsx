import { useEffect, useMemo, useRef, useState } from 'react';
import { useLoaderData, useNavigate, useParams } from '@tanstack/react-router';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import type Konva from 'konva';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { getSession } from '../lib/session';
import {
  uploadClosetItem,
  deleteClosetItem,
  saveDraft,
  publish,
  type UploadProgress,
  type ClosetBySlot,
} from '../lib/builder';
import {
  SLOT_LAYOUT,
  SLOT_RENDER_ORDER,
  STAGE_WIDTH,
  STAGE_HEIGHT,
  MANNEQUIN_DATA_URL,
} from '../lib/layout';
import {
  SLOTS,
  type CanvasState,
  type ClosetItem,
  type SlotKey,
} from '../lib/types';

type SaveState = 'idle' | 'saving' | 'publishing';

export function Builder() {
  const navigate = useNavigate();
  const { code } = useParams({ from: '/$code/builder' });
  const {
    event,
    outfit,
    closet: initialCloset,
  } = useLoaderData({ from: '/$code/builder' });
  const session = getSession(code)!;

  const [closet, setCloset] = useState<ClosetBySlot>(initialCloset);
  const [selected, setSelected] = useState<CanvasState>(
    outfit?.canvas_state ?? {}
  );

  // Loader re-runs on every visit to this route (staleTime: 0), but this
  // component can stay mounted across that re-run, so sync local state
  // whenever fresh loader data comes in.
  useEffect(() => {
    setCloset(initialCloset);
    setSelected(outfit?.canvas_state ?? {});
  }, [initialCloset, outfit]);
  const [upload, setUpload] = useState<{
    slotKey: SlotKey;
    progress: UploadProgress;
  } | null>(null);
  const [save, setSave] = useState<SaveState>('idle');
  const [error, setError] = useState<string | null>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);
  const [stageScale, setStageScale] = useState(1);

  useEffect(() => {
    const measure = () => {
      if (!stageContainerRef.current) return;
      const w = stageContainerRef.current.clientWidth;
      setStageScale(Math.min(w / STAGE_WIDTH, 1));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const handleUpload = async (slotKey: SlotKey, file: File) => {
    setError(null);
    setUpload({ slotKey, progress: { phase: 'removing', ratio: 0 } });
    try {
      const item = await uploadClosetItem({
        eventId: event.id,
        participantId: session.participantId,
        slotKey,
        file,
        displayOrder: closet[slotKey].length,
        onProgress: (p) =>
          setUpload((cur) => (cur ? { ...cur, progress: p } : cur)),
      });
      setCloset((prev) => ({ ...prev, [slotKey]: [...prev[slotKey], item] }));
      setSelected((prev) => ({ ...prev, [slotKey]: item.id }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUpload(null);
    }
  };

  const handleSelect = (slotKey: SlotKey, itemId: string) => {
    setSelected((prev) =>
      prev[slotKey] === itemId
        ? // tap again to clear
          { ...prev, [slotKey]: undefined }
        : { ...prev, [slotKey]: itemId }
    );
  };

  const handleDelete = async (slotKey: SlotKey, itemId: string) => {
    try {
      await deleteClosetItem(itemId);
      setCloset((prev) => ({
        ...prev,
        [slotKey]: prev[slotKey].filter((i) => i.id !== itemId),
      }));
      setSelected((prev) =>
        prev[slotKey] === itemId ? { ...prev, [slotKey]: undefined } : prev
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const handleSaveDraft = async () => {
    setError(null);
    setSave('saving');
    try {
      await saveDraft({
        eventId: event.id,
        participantId: session.participantId,
        canvasState: cleanedSelected(selected),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSave('idle');
    }
  };

  const handlePublish = async () => {
    if (!stageRef.current) return;
    setError(null);
    setSave('publishing');
    try {
      await publish({
        eventId: event.id,
        participantId: session.participantId,
        canvasState: cleanedSelected(selected),
        stage: stageRef.current,
        stageScale,
      });
      navigate({
        to: '/$code/gallery',
        params: { code },
        search: { from: 'builder' },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Publish failed');
      setSave('idle');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDMiLz48L3N2Zz4=')]">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/15">
        <button
          onClick={() => navigate({ to: '/$code', params: { code } })}
          className="flex items-center gap-2 text-foreground hover:text-accent transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2
          className="uppercase tracking-widest text-xs truncate max-w-[60%]"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {event.name}
        </h2>
        <div className="w-5" />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex items-center justify-center p-6">
          <div ref={stageContainerRef} className="w-full max-w-sm">
            <MannequinStage
              stageRef={stageRef}
              scale={stageScale}
              selected={selected}
              closet={closet}
            />
          </div>
        </div>

        {/* Closet panel */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-foreground/15 p-4 space-y-6 overflow-y-auto">
          {SLOTS.map(({ key, label }) => (
            <SlotRow
              key={key}
              slotKey={key}
              label={label}
              items={closet[key]}
              selectedId={selected[key]}
              uploading={upload?.slotKey === key ? upload.progress : null}
              onSelect={(id) => handleSelect(key, id)}
              onUpload={(file) => handleUpload(key, file)}
              onDelete={(id) => handleDelete(key, id)}
            />
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="px-6 py-4 border-t border-foreground/15 space-y-3">
        {error && (
          <p
            className="text-destructive text-xs uppercase tracking-widest text-center"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {error}
          </p>
        )}
        <div className="flex gap-4">
          <button
            onClick={handleSaveDraft}
            disabled={save !== 'idle' || !!upload}
            className="flex-1 border-2 border-foreground text-foreground py-4 uppercase tracking-widest text-sm transition-opacity hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {save === 'saving' ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={handlePublish}
            disabled={save !== 'idle' || !!upload}
            className="flex-1 bg-accent text-accent-foreground py-4 uppercase tracking-widest text-sm transition-opacity hover:opacity-90 border-2 border-secondary disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {save === 'publishing' ? 'Publishing…' : 'Publish to group'}
          </button>
        </div>
      </div>
    </div>
  );
}

function cleanedSelected(state: CanvasState): CanvasState {
  const out: CanvasState = {};
  for (const [k, v] of Object.entries(state)) {
    if (v) out[k as SlotKey] = v;
  }
  return out;
}

/* ─────────────────────────────────────────────────────────────────────────
   Konva mannequin
   ───────────────────────────────────────────────────────────────────────── */

function MannequinStage(props: {
  stageRef: React.RefObject<Konva.Stage>;
  scale: number;
  selected: CanvasState;
  closet: ClosetBySlot;
}) {
  const { stageRef, scale, selected, closet } = props;
  const [mannequinImg] = useImage(MANNEQUIN_DATA_URL);

  return (
    <Stage
      ref={stageRef}
      width={STAGE_WIDTH * scale}
      height={STAGE_HEIGHT * scale}
      scaleX={scale}
      scaleY={scale}
      style={{ background: 'var(--bg)' }}
    >
      <Layer>
        {/* TODO: fitting-room background image goes here once asset is ready */}
        {mannequinImg && (
          <KonvaImage
            image={mannequinImg}
            x={0}
            y={0}
            width={STAGE_WIDTH}
            height={STAGE_HEIGHT}
          />
        )}
        {SLOT_RENDER_ORDER.map((slotKey) => {
          const itemId = selected[slotKey];
          if (!itemId) return null;
          const item = closet[slotKey].find((i) => i.id === itemId);
          if (!item) return null;
          return (
            <SlotPiece key={slotKey} slotKey={slotKey} url={item.image_url} />
          );
        })}
      </Layer>
    </Stage>
  );
}

function SlotPiece({ slotKey, url }: { slotKey: SlotKey; url: string }) {
  const [img] = useImage(url, 'anonymous');
  const { x, y, width, height } = SLOT_LAYOUT[slotKey];
  if (!img) return null;
  return <KonvaImage image={img} x={x} y={y} width={width} height={height} />;
}

/* ─────────────────────────────────────────────────────────────────────────
   Closet slot row
   ───────────────────────────────────────────────────────────────────────── */

function SlotRow(props: {
  slotKey: SlotKey;
  label: string;
  items: ClosetItem[];
  selectedId: string | undefined;
  uploading: UploadProgress | null;
  onSelect: (id: string) => void;
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
}) {
  const { label, items, selectedId, uploading, onSelect, onUpload, onDelete } =
    props;
  const inputRef = useRef<HTMLInputElement>(null);

  const phaseLabel = useMemo(() => {
    if (!uploading) return null;
    switch (uploading.phase) {
      case 'removing': {
        const pct = uploading.ratio
          ? ` ${Math.round(uploading.ratio * 100)}%`
          : '';
        return `Removing bg${pct}…`;
      }
      case 'uploading':
        return 'Uploading…';
      case 'saving':
        return 'Saving…';
    }
  }, [uploading]);

  return (
    <div className="space-y-2 pb-4 border-b border-foreground/10 last:border-b-0">
      <div className="flex items-center justify-between">
        <p
          className="uppercase tracking-widest text-xs text-secondary"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {label}
        </p>
        {phaseLabel && (
          <p
            className="text-sm text-secondary"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {phaseLabel}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 py-1">
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <div key={item.id} className="relative flex-shrink-0 group">
              <button
                onClick={() => onSelect(item.id)}
                className={
                  'w-16 h-16 border-2 bg-foreground/5 overflow-hidden transition-colors ' +
                  (isSelected
                    ? 'border-accent'
                    : 'border-foreground/15 hover:border-secondary')
                }
                aria-label={`${isSelected ? 'Deselect' : 'Select'} item`}
              >
                <img
                  src={item.image_url}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-foreground text-background flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                aria-label="Delete item"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        <button
          onClick={() => inputRef.current?.click()}
          disabled={!!uploading}
          className="flex-shrink-0 w-16 h-16 border-2 border-dashed border-foreground/30 hover:border-accent transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Upload new item"
        >
          <Plus className="w-5 h-5 text-secondary" />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = ''; // allow re-uploading the same file
          }}
        />
      </div>
    </div>
  );
}
