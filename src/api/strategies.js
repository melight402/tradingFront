const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export async function fetchStrategies() {
  const response = await fetch(`${API_BASE_URL}/strategies`);
  if (!response.ok) throw new Error(`Failed to fetch strategies: ${response.statusText}`);
  const data = await response.json();
  return data.strategies || [];
}