import { useCallback, useEffect, useState } from 'react';
import {
  Shield,
  Heart,
  Sword,
  Zap,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Pencil,
  X,
  Save,
  Users,
  FlameKindling,
  MapPin,
  Cog,
} from 'lucide-react';
import { supabase, type RaidStrategy } from '../lib/supabase';

// ── Section block ─────────────────────────────────────────────────────────────

function Section({
  icon: Icon,
  accent,
  title,
  children,
}: {
  icon: typeof Shield;
  accent: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${accent}`} />
        <h4 className={`font-serif text-[11px] font-semibold uppercase tracking-widest ${accent}`}>
          {title}
        </h4>
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}

function BodyText({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p className="text-sm leading-relaxed text-frost-steel-100/85">{text}</p>
  );
}

// ── Role cards ────────────────────────────────────────────────────────────────

type RoleKey = 'tank' | 'healer' | 'dps' | 'support';

const ROLES: {
  key: RoleKey;
  label: string;
  field: keyof Pick<RaidStrategy, 'roles_tank' | 'roles_healer' | 'roles_dps' | 'roles_support'>;
  icon: typeof Shield;
  accent: string;
  border: string;
}[] = [
  { key: 'tank',    label: 'Tank',    field: 'roles_tank',    icon: Shield,   accent: 'text-frost-ice-300',  border: 'border-frost-ice-500/30'  },
  { key: 'healer',  label: 'Healer',  field: 'roles_healer',  icon: Heart,    accent: 'text-frost-rime-300', border: 'border-frost-rime-500/30' },
  { key: 'dps',     label: 'DPS',     field: 'roles_dps',     icon: Sword,    accent: 'text-frost-ember-300',border: 'border-frost-ember-500/30'},
  { key: 'support', label: 'Support', field: 'roles_support', icon: Zap,      accent: 'text-frost-gold-300', border: 'border-frost-gold-500/30' },
];

function RoleCard({
  role,
  text,
}: {
  role: typeof ROLES[number];
  text: string | null;
}) {
  if (!text) return null;
  return (
    <div className={`rounded border ${role.border} bg-frost-ice-900/30 p-3`}>
      <div className={`mb-2 flex items-center gap-1.5 font-serif text-[10px] font-semibold uppercase tracking-widest ${role.accent}`}>
        <role.icon className="h-3.5 w-3.5" />
        {role.label}
      </div>
      <p className="text-xs leading-relaxed text-frost-steel-200/85">{text}</p>
    </div>
  );
}

// ── Edit form ─────────────────────────────────────────────────────────────────

type EditState = {
  min_raid_size: string;
  resist_notes: string;
  preparation: string;
  positioning: string;
  mechanics: string;
  roles_tank: string;
  roles_healer: string;
  roles_dps: string;
  roles_support: string;
  tips: string;
};

function toEditState(s: RaidStrategy): EditState {
  return {
    min_raid_size: String(s.min_raid_size ?? ''),
    resist_notes:  s.resist_notes  ?? '',
    preparation:   s.preparation   ?? '',
    positioning:   s.positioning   ?? '',
    mechanics:     s.mechanics     ?? '',
    roles_tank:    s.roles_tank    ?? '',
    roles_healer:  s.roles_healer  ?? '',
    roles_dps:     s.roles_dps     ?? '',
    roles_support: s.roles_support ?? '',
    tips: (s.tips ?? []).join('\n'),
  };
}

const textareaClass =
  'w-full resize-y rounded border border-frost-ice-600/50 bg-frost-ice-900/60 px-3 py-2 font-sans text-xs leading-relaxed text-frost-steel-100 placeholder-frost-steel-500 outline-none transition-colors focus:border-frost-rime-400/70 focus:ring-1 focus:ring-frost-rime-400/30';
const labelClass =
  'mb-1 block font-serif text-[10px] uppercase tracking-widest text-frost-steel-400';

function EditForm({
  strategy,
  onSaved,
  onCancel,
}: {
  strategy: RaidStrategy;
  onSaved: (updated: RaidStrategy) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<EditState>(() => toEditState(strategy));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof EditState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      const tips = form.tips
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean);
      const payload: Partial<RaidStrategy> = {
        min_raid_size: form.min_raid_size ? parseInt(form.min_raid_size, 10) : null,
        resist_notes:  form.resist_notes  || null,
        preparation:   form.preparation   || null,
        positioning:   form.positioning   || null,
        mechanics:     form.mechanics     || null,
        roles_tank:    form.roles_tank    || null,
        roles_healer:  form.roles_healer  || null,
        roles_dps:     form.roles_dps     || null,
        roles_support: form.roles_support || null,
        tips,
        updated_at: new Date().toISOString(),
      };
      const { data, error: err } = await supabase
        .from('raid_strategies')
        .update(payload)
        .eq('boss_name', strategy.boss_name)
        .select()
        .single();
      if (err) throw err;
      onSaved(data as RaidStrategy);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Min Raid Size</label>
          <input
            type="number"
            value={form.min_raid_size}
            onChange={(e) => set('min_raid_size', e.target.value)}
            min={1} max={200}
            className={`${textareaClass} h-9 resize-none`}
          />
        </div>
      </div>

      {(
        [
          ['resist_notes', 'Resist Notes', 4],
          ['preparation',  'Preparation',  4],
          ['positioning',  'Positioning',  4],
          ['mechanics',    'Key Mechanics', 5],
        ] as [keyof EditState, string, number][]
      ).map(([field, label, rows]) => (
        <div key={field}>
          <label className={labelClass}>{label}</label>
          <textarea
            value={form[field]}
            onChange={(e) => set(field, e.target.value)}
            rows={rows}
            maxLength={2000}
            className={textareaClass}
          />
        </div>
      ))}

      <div className="grid gap-3 sm:grid-cols-2">
        {ROLES.map(({ field, label }) => (
          <div key={field}>
            <label className={labelClass}>{label} Role</label>
            <textarea
              value={form[field]}
              onChange={(e) => set(field, e.target.value)}
              rows={3}
              maxLength={1000}
              className={textareaClass}
            />
          </div>
        ))}
      </div>

      <div>
        <label className={labelClass}>
          Quick Tips{' '}
          <span className="normal-case text-frost-steel-500">(one per line)</span>
        </label>
        <textarea
          value={form.tips}
          onChange={(e) => set('tips', e.target.value)}
          rows={5}
          className={textareaClass}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded border border-frost-ember-500/40 bg-frost-ember-600/10 px-3 py-2 text-frost-ember-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="font-sans text-xs">{error}</span>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-ice flex-1 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button onClick={onCancel} className="btn-ghost px-4">
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Strategy display ──────────────────────────────────────────────────────────

function StrategyDisplay({
  strategy,
  onEdit,
}: {
  strategy: RaidStrategy;
  onEdit: () => void;
}) {
  const hasRoles = ROLES.some((r) => !!strategy[r.field]);

  return (
    <div className="space-y-6">
      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3">
        {strategy.min_raid_size && (
          <span className="flex items-center gap-1.5 rounded border border-frost-rime-500/40 bg-frost-rime-500/10 px-3 py-1.5 font-serif text-xs text-frost-rime-200">
            <Users className="h-3.5 w-3.5" />
            {strategy.min_raid_size}+ players recommended
          </span>
        )}
        <button
          onClick={onEdit}
          className="ml-auto flex items-center gap-1.5 rounded border border-frost-ice-600/40 px-3 py-1.5 font-serif text-[10px] uppercase tracking-widest text-frost-steel-300 transition-colors hover:border-frost-rime-400/50 hover:text-frost-rime-200"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
      </div>

      {strategy.resist_notes && (
        <Section icon={FlameKindling} accent="text-frost-ember-300" title="Resist Requirements">
          <BodyText text={strategy.resist_notes} />
        </Section>
      )}

      {strategy.preparation && (
        <Section icon={CheckCircle2} accent="text-frost-ice-300" title="Preparation">
          <BodyText text={strategy.preparation} />
        </Section>
      )}

      {strategy.positioning && (
        <Section icon={MapPin} accent="text-frost-rime-300" title="Positioning">
          <BodyText text={strategy.positioning} />
        </Section>
      )}

      {strategy.mechanics && (
        <Section icon={Cog} accent="text-frost-gold-300" title="Key Mechanics">
          <BodyText text={strategy.mechanics} />
        </Section>
      )}

      {hasRoles && (
        <Section icon={Users} accent="text-frost-steel-300" title="Role Assignments">
          <div className="grid gap-3 sm:grid-cols-2">
            {ROLES.map((role) => (
              <RoleCard key={role.key} role={role} text={strategy[role.field]} />
            ))}
          </div>
        </Section>
      )}

      {strategy.tips.length > 0 && (
        <Section icon={CheckCircle2} accent="text-frost-rime-400" title="Quick Tips">
          <ul className="space-y-2">
            {strategy.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-frost-rime-400" />
                <span className="text-sm leading-relaxed text-frost-steel-100/85">{tip}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <p className="border-t border-frost-ice-700/30 pt-3 text-right font-serif text-[9px] uppercase tracking-widest text-frost-steel-600">
        Last updated {new Date(strategy.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export default function StrategyPanel({ bossName }: { bossName: string }) {
  const [strategy, setStrategy] = useState<RaidStrategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const fetchStrategy = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('raid_strategies')
        .select('*')
        .eq('boss_name', bossName)
        .maybeSingle();
      if (err) throw err;
      setStrategy(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load strategy.');
    } finally {
      setLoading(false);
    }
  }, [bossName]);

  useEffect(() => { fetchStrategy(); }, [fetchStrategy]);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <RefreshCw className="h-5 w-5 animate-spin text-frost-rime-400/50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-24 items-center justify-center gap-2 text-frost-ember-400">
        <AlertCircle className="h-4 w-4" />
        <span className="font-sans text-xs">{error}</span>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="flex h-24 items-center justify-center">
        <p className="font-serif text-xs uppercase tracking-widest text-frost-steel-500">
          No strategy on file yet
        </p>
      </div>
    );
  }

  return editing ? (
    <EditForm
      strategy={strategy}
      onSaved={(updated) => { setStrategy(updated); setEditing(false); }}
      onCancel={() => setEditing(false)}
    />
  ) : (
    <StrategyDisplay strategy={strategy} onEdit={() => setEditing(true)} />
  );
}
