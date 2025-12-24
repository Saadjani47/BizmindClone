import api from './api';

export async function getGeneratedProposal(id) {
  const { data } = await api.get(`/api/v1/generated_proposals/${id}`);
  return data;
}

export async function updateGeneratedProposal(id, payload) {
  // payload: { content_sections: <object|string> }
  const { data } = await api.put(`/api/v1/generated_proposals/${id}`, payload);
  return data;
}
