import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000
});

export async function fetchForms (category) {
  const params = category ? { category } : {};
  const response = await client.get('/forms', { params });
  return response.data;
}

export async function fetchCategories () {
  const response = await client.get('/forms/metadata/categories');
  return response.data;
}

export async function createForm (payload) {
  const response = await client.post('/forms', payload);
  return response.data;
}

export async function updateForm (id, payload) {
  const response = await client.put(`/forms/${id}`, payload);
  return response.data;
}

export async function deleteForm (id) {
  await client.delete(`/forms/${id}`);
}
