import api from './api';

export async function listProposals() {
  const { data } = await api.get('/api/v1/proposals');
  return data;
}

export async function getProposal(id) {
  const { data } = await api.get(`/api/v1/proposals/${id}`);
  return data;
}

export async function createProposal(payload) {
  const { data } = await api.post('/api/v1/proposals', { proposal: payload });
  return data;
}

export async function updateProposal(id, payload) {
  const { data } = await api.put(`/api/v1/proposals/${id}`, { proposal: payload });
  return data;
}

export async function generateProposal(id, { force = false } = {}) {
  const { data } = await api.post(`/api/v1/proposals/${id}/generate`, null, {
    params: { force },
  });
  return data;
}
