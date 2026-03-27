import { useState } from "react";

const DICE_TYPES = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];

function handleDiceTypeChange(val) {
    setDiceType(val);
    const isStandard = DICE_TYPES.includes(val);
    const minRoll = isStandard ? 1 : 2;
    setRows(prev => prev.map((r, i) => ({ ...r, roll_id: minRoll + i})));
};

const SYSTEMS = ["D&D 5e", "Pathfinder 2e", "Other"];

export default function TableEditor({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [system, setSystem] = useState(initial?.system ?? "D&D 5e");
  const [diceType, setDiceType] = useState(initial?.dice_type ?? "d20");
  const [rows, setRows] = useState(
    initial?.rows?.length
      ? initial.rows.map((r) => ({ roll_id: r.roll_id, value: r.value }))
      : Array.from({ length: 6 }, (_, i) => ({ roll_id: i + 1, value: "" }))
  );
  const [error, setError] = useState("");

  function updateRow(idx, field, val) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: field === "roll_id" ? parseInt(val) || 0 : val } : r)));
  }

  function addRow() {
    const minRoll = DICE_TYPES.includes(diceType) ? 1 : 2;
    const nextId = rows.length ? Math.max(...rows.map((r) => r.roll_id)) + 1 : minRoll;
    setRows((prev) => [...prev, { roll_id: nextId, value: "" }]);
  }

  function removeRow(idx) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSave() {
    if (!name.trim()) { setError("Укажи название таблицы"); return; }
    if (rows.some((r) => !r.value.trim())) { setError("Все строки должны быть заполнены"); return; }
    const ids = rows.map((r) => r.roll_id);
    if (new Set(ids).size !== ids.length) { setError("Номера броска должны быть уникальными"); return; }
    setError("");
    onSave({ name: name.trim(), system, dice_type: diceType, rows });
  }

  return (
    <div style={s.wrap}>
      <div style={s.fields}>
        <div style={s.row}>
          <label style={s.label}>Название</label>
          <input style={s.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Моя таблица…" />
        </div>
        <div style={s.row}>
          <label style={s.label}>Система</label>
          <select style={s.select} value={system} onChange={(e) => setSystem(e.target.value)}>
            {SYSTEMS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={s.row}>
          <label style={s.label}>Кость</label>
          <select style={s.select} value={diceType} onChange={(e) => setDiceType(e.target.value)}>
            {DICE_TYPES.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div style={s.rowsHeader}>
        <span style={s.colId}>#</span>
        <span style={s.colVal}>Результат</span>
      </div>

      <div style={s.rowsList}>
        {rows.map((row, idx) => (
          <div key={idx} style={s.rowItem}>
            <input
              style={{ ...s.input, ...s.idInput }}
              type="number"
              min={1}
              value={row.roll_id}
              onChange={(e) => updateRow(idx, "roll_id", e.target.value)}
            />
            <input
              style={{ ...s.input, flex: 1 }}
              value={row.value}
              onChange={(e) => updateRow(idx, "value", e.target.value)}
              placeholder="Описание результата…"
            />
            <button style={s.removeBtn} onClick={() => removeRow(idx)}>✕</button>
          </div>
        ))}
      </div>

      <button style={s.addRowBtn} onClick={addRow}>+ Добавить строку</button>

      {error && <div style={s.error}>{error}</div>}

      <div style={s.actions}>
        <button style={s.cancelBtn} onClick={onCancel}>Отмена</button>
        <button style={s.saveBtn} onClick={handleSave}>Сохранить</button>
      </div>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 12 },
  fields: { display: "flex", flexDirection: "column", gap: 8 },
  row: { display: "flex", alignItems: "center", gap: 10 },
  label: { width: 80, fontSize: 13, color: "#8b9bb4", flexShrink: 0 },
  input: {
    background: "#1a2035", border: "1px solid #2a3555", borderRadius: 6,
    color: "#e8eaf0", padding: "6px 10px", fontSize: 14, outline: "none",
    width: "100%", boxSizing: "border-box",
  },
  select: {
    background: "#1a2035", border: "1px solid #2a3555", borderRadius: 6,
    color: "#e8eaf0", padding: "6px 10px", fontSize: 14, outline: "none",
  },
  rowsHeader: { display: "flex", gap: 8, padding: "4px 0", borderBottom: "1px solid #2a3555" },
  colId: { width: 50, fontSize: 12, color: "#556080", textAlign: "center" },
  colVal: { flex: 1, fontSize: 12, color: "#556080" },
  rowsList: { display: "flex", flexDirection: "column", gap: 4, maxHeight: 340, overflowY: "auto" },
  rowItem: { display: "flex", gap: 6, alignItems: "center" },
  idInput: { width: 50, textAlign: "center", flexShrink: 0 },
  removeBtn: {
    background: "none", border: "none", color: "#c0392b", fontSize: 14,
    cursor: "pointer", padding: "4px 6px", flexShrink: 0,
  },
  addRowBtn: {
    background: "none", border: "1px dashed #2a3555", borderRadius: 6,
    color: "#5b7fc4", padding: "6px 12px", cursor: "pointer", fontSize: 13,
    alignSelf: "flex-start",
  },
  error: { color: "#e74c3c", fontSize: 13, padding: "4px 0" },
  actions: { display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 },
  cancelBtn: {
    background: "none", border: "1px solid #2a3555", borderRadius: 6,
    color: "#8b9bb4", padding: "8px 20px", cursor: "pointer", fontSize: 14,
  },
  saveBtn: {
    background: "#3d5a9e", border: "none", borderRadius: 6,
    color: "#fff", padding: "8px 24px", cursor: "pointer", fontSize: 14, fontWeight: 600,
  },
};
