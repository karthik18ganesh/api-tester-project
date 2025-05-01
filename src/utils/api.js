const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const api = async (path, method = "GET", body = null, headers = {}) => {
  const url = `${BASE_URL}${path}`;
  console.log(url)
  const defaultHeaders = { "Content-Type": "application/json", ...headers };

  const res = await fetch(url, {
    method,
    headers: defaultHeaders,
    body: body ? JSON.stringify(body) : null,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.result?.message || "API Error");

  return json;
};
