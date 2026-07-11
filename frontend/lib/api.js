export class ApiError extends Error {
  constructor(status, data) {
    super(data?.detail || "Request failed");
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? options.headers
    : { "Content-Type": "application/json", ...options.headers };

  const normalizedPath = path.replace(/\/(?=$|\?)/, "");
  const res = await fetch(`/api/feed/${normalizedPath}`, { ...options, headers });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data);
  }
  if (res.status === 204) return null;
  return res.json();
}
