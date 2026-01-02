const API_BASE = "http://localhost:5000/api";

export const getFaculty = async () => {
  const res = await fetch(`${API_BASE}/faculty`);
  return res.json();
};

export const addFaculty = async (data) => {
  const res = await fetch(`${API_BASE}/faculty`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteFaculty = async (id) => {
  const res = await fetch(`${API_BASE}/faculty/${id}`, {
    method: "DELETE",
  });
  return res.json();
};
