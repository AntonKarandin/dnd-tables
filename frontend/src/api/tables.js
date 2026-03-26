const BASE = "/api/tables";

export async function fetchTables() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Failed to fetch tables");
  return res.json();
}

export async function fetchTable(id) {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch table");
  return res.json();
}

export async function createTable(payload) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create table");
  return res.json();
}

export async function updateTable(id, payload) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update table");
  return res.json();
}

export async function deleteTable(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete table");
}

export async function lookupRoll(tableId, roll) {
  const res = await fetch(`${BASE}/${tableId}/lookup?roll=${roll}`);
  if (!res.ok) throw new Error("Lookup failed");
  return res.json();
}
