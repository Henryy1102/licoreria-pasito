const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const actualizarUsuario = async (userId, payload) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/api/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Error al actualizar usuario");
  }

  return response.json();
};
