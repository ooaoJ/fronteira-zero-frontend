import api from './api'

export async function getMyAlliance() {
  const { data } = await api.get('/alliances/me')
  return data
}

export async function listAlliances() {
  const { data } = await api.get('/alliances')
  return data
}

export async function createAlliance(payload) {
  const { data } = await api.post('/alliances', payload)
  return data
}

export async function joinAlliance(id) {
  const { data } = await api.post(`/alliances/${id}/join`)
  return data
}

export async function leaveAlliance() {
  const { data } = await api.post('/alliances/leave')
  return data
}

export async function sendAllianceMessage(content) {
  const { data } = await api.post('/alliances/me/messages', { content })
  return data
}