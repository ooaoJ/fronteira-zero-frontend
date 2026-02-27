import api from './api'

export async function getMe() {
  const { data } = await api.get('/users/me')
  return data
}

export async function updateMe(payload) {
  const { data } = await api.patch('/users/me', payload)
  return data
}

export async function changePassword(payload) {
  const { data } = await api.patch('/users/me/password', payload)
  return data
}