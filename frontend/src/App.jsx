import { useState, useEffect, useRef } from "react";
import TableEditor from "./components/TableEditor.jsx";
import * as api from "./api/tables.js";

export default function App() {
  const [tables, setTables] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [rollInput, setRollInput] = useState("");
  const [result, setResult] = useState(null); // { roll_id, value, found }
  const [view, setView] = useState("lookup"); // "lookup" | "edit" | "new"
  const [filterSystem, setFilterSystem] = useState("Все");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const resultRef = useRef(null);

  const activeTable = tables.find((t) => t.id === activeId);
  const systems = ["Все", ...Array.from(new Set(tables.map((t) => t.system)))];
  const filteredTables = filterSystem === "Все" ? tables : tables.filter((t) => t.system === filterSystem);

  useEffect(() => {
    api.fetchTables()
      .then((data) => { setTables(data); if (data.length) setActiveId(data[0].id); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [result]);

  async function handleLookup(val) {
    setRollInput(val);
    const num = parseInt(val);
    if (!isNaN(num) && num > 0 && activeId) {
      const res = await api.lookupRoll(activeId, num);
      setResult(res);
    } else {
      setResult(null);
    }
  }

  function rollDice() {
    if (!activeTable) return;
    const max = activeTable.rows.length;
    const roll = Math.floor(Math.random() * max) + 1;
    handleLookup(String(roll));
  }

  async function selectTable(id) {
    setActiveId(id);
    setRollInput("");
    setResult(null);
    setView("lookup");
  }

  async function handleSave(payload) {
    setSaving(true);
    try {
      let saved;
      if (view === "edit" && activeId) {
        saved = await api.updateTable(activeId, payload);
        setTables((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
      } else {
        saved = await api.createTable(payload);
        setTables((prev) => [...prev, saved]);
        setActiveId(saved.id);
      }
      setView("lookup");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!activeId || !confirm("Удалить таблицу?")) return;
    await api.deleteTable(activeId);
    const remaining = tables.filter((t) => t.id !== activeId);
    setTables(remaining);
    setActiveId(remaining[0]?.id ?? null);
    setView("lookup");
  }

  if (loading) return <div style={s.loading}>Загрузка…</div>;

  return (
    <div style={s.root}>
      {/* SIDEBAR */}
      <aside style={s.sidebar}>
        <div style={s.sidebarTop}>
          <div style={s.logo}>⚔ GM Tables</div>
          <div style={s.systemTabs}>
            {systems.map((sys) => (
              <button
                key={sys}
                style={{ ...s.sysTab, ...(filterSystem === sys ? s.sysTabActive : {}) }}
                onClick={() => setFilterSystem(sys)}
              >
                {sys}
              </button>
            ))}
          </div>
        </div>

        <div style={s.tableList}>
          {filteredTables.map((t) => (
            <button
              key={t.id}
              style={{ ...s.tableItem, ...(activeId === t.id && view !== "new" ? s.tableItemActive : {}) }}
              onClick={() => selectTable(t.id)}
            >
              <span style={s.itemSystem}>{t.system}</span>
              <span style={s.itemName}>{t.name}</span>
              <span style={s.itemDice}>{t.dice_type}</span>
            </button>
          ))}
        </div>

        <button style={s.newBtn} onClick={() => { setView("new"); setActiveId(null); }}>
          + Новая таблица
        </button>
      </aside>

      {/* MAIN */}
      <main style={s.main}>
        {(view === "edit" || view === "new") ? (
          <div style={s.editorWrap}>
            <div style={s.editorHeader}>
              <h2 style={s.editorTitle}>{view === "new" ? "Новая таблица" : "Редактировать"}</h2>
            </div>
            <TableEditor
              initial={view === "edit" ? activeTable : null}
              onSave={handleSave}
              onCancel={() => setView("lookup")}
            />
            {saving && <div style={s.savingMsg}>Сохранение…</div>}
          </div>
        ) : activeTable ? (
          <>
            {/* TABLE HEADER */}
            <div style={s.tableHeader}>
              <div>
                <div style={s.tableSystem}>{activeTable.system}</div>
                <h1 style={s.tableName}>{activeTable.name}</h1>
              </div>
              <div style={s.headerBtns}>
                <button style={s.editBtn} onClick={() => setView("edit")}>✎ Изменить</button>
                <button style={s.deleteBtn} onClick={handleDelete}>🗑</button>
              </div>
            </div>

            {/* LOOKUP BAR */}
            <div style={s.lookupBar}>
              <div style={s.inputWrap}>
                <span style={s.hashSign}>#</span>
                <input
                  style={s.rollInput}
                  type="number"
                  min={1}
                  max={activeTable.rows.length}
                  placeholder={`1 – ${activeTable.rows.length}`}
                  value={rollInput}
                  onChange={(e) => handleLookup(e.target.value)}
                  autoFocus
                />
              </div>
              <button style={s.rollBtn} onClick={rollDice}>
                🎲 {activeTable.dice_type}
              </button>
            </div>

            {/* RESULT CARD */}
            {result && (
              <div style={{ ...s.resultCard, ...(result.found ? s.resultFound : s.resultMissing) }}>
                {result.found ? (
                  <>
                    <span style={s.resultRoll}>Бросок {result.roll_id}</span>
                    <span style={s.resultValue}>{result.value}</span>
                  </>
                ) : (
                  <span style={s.resultMissingText}>Нет результата для броска {result.roll_id}</span>
                )}
              </div>
            )}

            {/* TABLE ROWS */}
            <div style={s.rowsTable}>
              <div style={s.rowsHead}>
                <span style={s.colIdHead}>#</span>
                <span style={s.colValHead}>Результат</span>
              </div>
              {activeTable.rows.map((row) => {
                const isHighlighted = result?.found && result.roll_id === row.roll_id;
                return (
                  <div
                    key={row.roll_id}
                    ref={isHighlighted ? resultRef : null}
                    style={{ ...s.tableRow, ...(isHighlighted ? s.tableRowHL : {}) }}
                    onClick={() => handleLookup(String(row.roll_id))}
                  >
                    <span style={s.colId}>{row.roll_id}</span>
                    <span style={s.colVal}>{row.value}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div style={s.empty}>
            <div style={s.emptyIcon}>⚔</div>
            <div style={s.emptyText}>Выбери таблицу или создай новую</div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  root: {
    display: "flex", height: "100vh", background: "#0f1420",
    color: "#e0e4f0", fontFamily: "'Segoe UI', system-ui, sans-serif",
    overflow: "hidden",
  },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", color: "#5b7fc4", fontSize: 18 },

  // Sidebar
  sidebar: {
    width: 270, minWidth: 270, background: "#131927", borderRight: "1px solid #1e2a42",
    display: "flex", flexDirection: "column", overflow: "hidden",
  },
  sidebarTop: { padding: "20px 16px 12px", borderBottom: "1px solid #1e2a42" },
  logo: { fontSize: 20, fontWeight: 700, color: "#7fa8e8", marginBottom: 14, letterSpacing: "0.02em" },
  systemTabs: { display: "flex", gap: 6, flexWrap: "wrap" },
  sysTab: {
    background: "none", border: "1px solid #2a3555", borderRadius: 20,
    color: "#6a7fa0", padding: "3px 10px", fontSize: 12, cursor: "pointer",
  },
  sysTabActive: { background: "#1e3060", borderColor: "#3d5a9e", color: "#89b4f7" },
  tableList: { flex: 1, overflowY: "auto", padding: "8px 0" },
  tableItem: {
    display: "flex", flexDirection: "column", alignItems: "flex-start",
    width: "100%", background: "none", border: "none", padding: "10px 16px",
    cursor: "pointer", textAlign: "left", gap: 2, borderLeft: "3px solid transparent",
  },
  tableItemActive: { background: "#161f35", borderLeftColor: "#4a72c4" },
  itemSystem: { fontSize: 11, color: "#4a6090", textTransform: "uppercase", letterSpacing: "0.06em" },
  itemName: { fontSize: 14, color: "#c8d4f0", fontWeight: 500 },
  itemDice: { fontSize: 11, color: "#3d5580", background: "#1a2540", padding: "1px 6px", borderRadius: 4, marginTop: 2 },
  newBtn: {
    margin: "8px 12px 16px", background: "none", border: "1px dashed #2a3555",
    borderRadius: 8, color: "#5b7fc4", padding: "10px", cursor: "pointer", fontSize: 13, fontWeight: 500,
  },

  // Main
  main: { flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 },

  tableHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  tableSystem: { fontSize: 12, color: "#4a6090", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 },
  tableName: { margin: 0, fontSize: 22, fontWeight: 700, color: "#dde4f8" },
  headerBtns: { display: "flex", gap: 8, alignItems: "center" },
  editBtn: {
    background: "#1a2540", border: "1px solid #2a3555", borderRadius: 6,
    color: "#89b4f7", padding: "7px 14px", cursor: "pointer", fontSize: 13,
  },
  deleteBtn: {
    background: "none", border: "1px solid #3a1a1a", borderRadius: 6,
    color: "#c0392b", padding: "7px 10px", cursor: "pointer", fontSize: 15,
  },

  // Lookup
  lookupBar: { display: "flex", gap: 10, alignItems: "center" },
  inputWrap: {
    display: "flex", alignItems: "center", background: "#131927",
    border: "2px solid #2a3555", borderRadius: 10, overflow: "hidden", flex: "0 0 200px",
  },
  hashSign: { padding: "0 10px", color: "#3d5580", fontSize: 20, fontWeight: 700 },
  rollInput: {
    background: "none", border: "none", color: "#e0e4f0",
    padding: "10px 8px", fontSize: 22, fontWeight: 700, width: 100,
    outline: "none", MozAppearance: "textfield",
  },
  rollBtn: {
    background: "#1e3060", border: "2px solid #3d5a9e", borderRadius: 10,
    color: "#89b4f7", padding: "10px 20px", cursor: "pointer", fontSize: 16, fontWeight: 600,
  },

  // Result card
  resultCard: {
    padding: "14px 18px", borderRadius: 10, display: "flex",
    flexDirection: "column", gap: 4, borderLeft: "4px solid",
  },
  resultFound: { background: "#0e2340", borderLeftColor: "#4a72c4" },
  resultMissing: { background: "#200e0e", borderLeftColor: "#c0392b" },
  resultRoll: { fontSize: 12, color: "#4a6090", textTransform: "uppercase", letterSpacing: "0.06em" },
  resultValue: { fontSize: 18, fontWeight: 600, color: "#c8d4f0" },
  resultMissingText: { fontSize: 14, color: "#c0392b" },

  // Rows table
  rowsTable: { display: "flex", flexDirection: "column", gap: 0, borderRadius: 10, overflow: "hidden", border: "1px solid #1e2a42" },
  rowsHead: {
    display: "flex", background: "#131927", padding: "8px 14px",
    borderBottom: "1px solid #1e2a42",
  },
  colIdHead: { width: 44, fontSize: 11, color: "#3d5580", textTransform: "uppercase" },
  colValHead: { flex: 1, fontSize: 11, color: "#3d5580", textTransform: "uppercase" },
  tableRow: {
    display: "flex", alignItems: "center", padding: "11px 14px",
    borderBottom: "1px solid #131927", cursor: "pointer",
    transition: "background 0.15s",
  },
  tableRowHL: { background: "#0e2340", borderLeft: "3px solid #4a72c4" },
  colId: { width: 44, fontSize: 13, color: "#4a6090", fontWeight: 700 },
  colVal: { flex: 1, fontSize: 14, color: "#c0d0ec" },

  // Editor
  editorWrap: { maxWidth: 640 },
  editorHeader: { marginBottom: 20 },
  editorTitle: { margin: 0, fontSize: 20, color: "#dde4f8", fontWeight: 700 },
  savingMsg: { marginTop: 8, color: "#5b7fc4", fontSize: 13 },

  // Empty
  empty: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, opacity: 0.4 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, color: "#8b9bb4" },
};
