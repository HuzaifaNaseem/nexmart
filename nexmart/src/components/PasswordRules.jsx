/**
 * Password requirements, shown *before* the user starts typing and updated
 * live as they do — never revealed only after a failed submit.
 *
 * The hard requirement mirrors exactly what the API enforces (8 characters).
 * Anything beyond that is presented as a suggestion, so we never block a
 * password the server would happily accept.
 */
const REQUIRED = [
  { id: 'len', label: 'At least 8 characters', test: (v) => v.length >= 8 },
];

const SUGGESTED = [
  { id: 'case', label: 'Upper and lowercase letters', test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: 'num', label: 'A number', test: (v) => /\d/.test(v) },
  { id: 'sym', label: 'A symbol (! ? # …)', test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function Rule({ met, label, required, touched }) {
  // Before the user types, requirements read as neutral guidance rather than
  // a wall of red crosses.
  const state = !touched ? 'idle' : met ? 'met' : required ? 'unmet' : 'idle';
  const mark = state === 'met' ? '✓' : state === 'unmet' ? '✕' : '•';
  const cls = state === 'met' ? 'text-emerald-600'
    : state === 'unmet' ? 'text-red-500' : 'dm-text-muted';
  return (
    <li className={`flex items-center gap-1.5 text-[11px] ${cls}`}>
      <span aria-hidden="true" className="w-3 inline-block text-center font-bold">{mark}</span>
      <span>{label}</span>
    </li>
  );
}

export default function PasswordRules({ value = '', id = 'password-rules' }) {
  const touched = value.length > 0;
  const metCount = SUGGESTED.filter((r) => r.test(value)).length;
  const strong = REQUIRED.every((r) => r.test(value)) && metCount >= 2;

  return (
    <div id={id} className="mt-2 rounded-lg dm-surface px-3 py-2 border dm-border">
      <ul className="space-y-1" aria-live="polite">
        {REQUIRED.map((r) => (
          <Rule key={r.id} met={r.test(value)} label={r.label} required touched={touched} />
        ))}
      </ul>
      <p className="text-[10px] dm-text-muted mt-1.5 mb-1 font-semibold uppercase tracking-wider">
        Stronger with
      </p>
      <ul className="space-y-1">
        {SUGGESTED.map((r) => (
          <Rule key={r.id} met={r.test(value)} label={r.label} touched={touched} />
        ))}
      </ul>
      {touched && (
        <p className={`text-[11px] font-semibold mt-1.5 ${strong ? 'text-emerald-600' : 'dm-text-muted'}`}>
          {strong ? 'Strong password' : 'Meets the minimum — add more for a stronger password'}
        </p>
      )}
    </div>
  );
}
