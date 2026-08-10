export default function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label className="switch" aria-label={label}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
    </label>
  );
}