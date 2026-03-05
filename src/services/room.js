import api from './api'

export async function listRooms(mode) {
    const {data} = await api.get('/rooms', { params: { mode } })
    return data
}

export async function listAllRooms() {
    const [normal, blitz] = await Promise.all([
        listRooms('NORMAL'),
        listRooms('BLITZ')
    ])

    const all = [...normal, ...blitz]

    all.sort((a, b) => (b.players?.lenght ?? 0) - (a.players?.lenght ?? 0))

    return all
}

export async function joinRoom(roomId) {
    const {data} = await api.post(`/rooms/${roomId}/join`)
    return data
}

export async function listMyRooms() {
    const {data} = await api.get('/rooms/me')
    return data
}