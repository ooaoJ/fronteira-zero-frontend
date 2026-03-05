<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { listAllRooms, listMyRooms, joinRoom } from '../services/room'

import playersIcon from '../assets/images/icons/players.png'
import normalIcon from '../assets/images/icons/normal.png'
import blitzIcon from '../assets/images/icons/blitz.png'

const router = useRouter()

const mode = ref('NORMAL')

const rooms = ref([])
const myRooms = ref([])

const loading = ref(false)
const error = ref('')
let timer = null

const myRoomIds = computed(() => new Set(myRooms.value.map(r => r.id)))

const availableRooms = computed(() =>
    rooms.value.filter(r => !myRoomIds.value.has(r.id))
)

async function loadRooms() {
    loading.value = true
    error.value = ''
    try {
        const [mine, all] = await Promise.all([
            listMyRooms(),
            listAllRooms(mode.value),
        ])
        myRooms.value = Array.isArray(mine) ? mine : []
        rooms.value = Array.isArray(all) ? all : []
    } catch (e) {
        error.value = e?.response?.data?.message || e?.message || 'Erro ao carregar partidas'
    } finally {
        loading.value = false
    }
}

async function enterRoom(roomId) {
    try {
        loading.value = true
        error.value = ''
        await joinRoom(roomId)
        router.push({ name: 'game', params: { roomId } })
    } catch (e) {
        error.value = e?.response?.data?.message || e?.message || 'Erro ao entrar na partida'
    } finally {
        loading.value = false
    }
}

function roomTitle(r) {
    return r?.name || `Partida-${String(r.id).slice(0, 6)}`
}

function roomCount(r) {
    const current = (r?.players || []).filter(p => !p.leftAt).length
    const max = r?.maxPlayers ?? 0
    return `${current} / ${max}`
}

function roomModeLabel(r) {
    return r?.mode || ''
}

onMounted(async () => {
    await loadRooms()
    timer = setInterval(loadRooms, 4000)
})

onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
})
</script>

<template>
    <div class="screen">
        <header class="header">
            <div class="header-bar">
                <h1 class="title">PARTIDAS</h1>
            </div>
        </header>

        <div class="tabs-wrap">
            <div class="tabs">
                <button class="tab" :class="{ active: mode === 'NORMAL' }" :disabled="loading"
                    @click="mode = 'NORMAL'; loadRooms()">
                    NORMAL
                </button>

                <button class="tab" :class="{ active: mode === 'BLITZ' }" :disabled="loading"
                    @click="mode = 'BLITZ'; loadRooms()">
                    BLITZ
                </button>
            </div>
        </div>

        <div v-if="error" class="error-wrap">
            <div class="error">{{ error }}</div>
        </div>

        <main class="panel">
            <div v-if="loading && rooms.length === 0 && myRooms.length === 0" class="empty">
                Carregando...
            </div>

            <!-- SUAS PARTIDAS -->
            <section v-if="myRooms.length" class="section">
                <div class="section-title">SUAS PARTIDAS</div>

                <div class="card" v-for="r in myRooms" :key="'my-' + r.id">
                    <div class="card-left">
                        <div class="avatar">
                            <img class="avatar-icon" :src="r.mode === 'BLITZ' ? blitzIcon : normalIcon">
                        </div>

                        <div class="info">
                            <div class="name">
                                {{ roomTitle(r) }}
                                <span v-if="roomModeLabel(r)" class="badge">{{ roomModeLabel(r) }}</span>
                            </div>
                            <div class="sub">Você já está nessa partida</div>
                        </div>
                    </div>

                    <div class="card-mid">
                        <span class="players">
                            <img class="avatar-icon"  :src="playersIcon">
                            {{ roomCount(r) }}
                        </span>
                    </div>

                    <div class="card-right">
                        <button class="btn-enter" :disabled="loading" @click="enterRoom(r.id)">
                            CONTINUAR
                        </button>
                    </div>
                </div>
            </section>

            <!-- PARTIDAS DISPONÍVEIS -->
            <section class="section">
                <div class="section-title">PARTIDAS DISPONÍVEIS</div>

                <div v-if="availableRooms.length === 0" class="empty">
                    Nenhuma partida disponível. Aguarde um instante…
                </div>

                <div v-else class="card" v-for="r in availableRooms" :key="r.id">
                    <div class="card-left">
                        <div class="avatar">
                            <img class="avatar-icon" :src="r.mode === 'BLITZ' ? blitzIcon : normalIcon">
                        </div>

                        <div class="info">
                            <div class="name">
                                {{ roomTitle(r) }}
                                <span v-if="roomModeLabel(r)" class="badge">{{ roomModeLabel(r) }}</span>
                            </div>
                            <div class="sub">Partida</div>
                        </div>
                    </div>

                    <div class="card-mid">
                        <span class="players">
                            <img class="avatar-icon" :src="playersIcon">
                            {{ roomCount(r) }}
                        </span>
                    </div>

                    <div class="card-right">
                        <button class="btn-enter" :disabled="loading" @click="enterRoom(r.id)">
                            ENTRAR
                        </button>
                    </div>
                </div>
            </section>
        </main>

        <!-- FOOTER -->
        <footer class="footer">
            <button class="btn-back" @click="router.back()">VOLTAR</button>
        </footer>
    </div>
</template>

<style scoped>
.screen {
    min-height: 100vh;
    padding: 26px 22px 30px;

    background-image: url('../assets/images/backgrounds/partidas.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    display: flex;
    flex-direction: column;
    align-items: center;

    color: #fff;
}

.header {
    width: 100%;
    max-width: 980px;
}

.header-bar {
    width: 100%;
    height: 74px;

    display: flex;
    align-items: center;
    justify-content: center;

    background: rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(2px);

    position: relative;
}

.title {
    font-size: 34px;
    font-weight: 900;
    letter-spacing: 4px;
    text-shadow: 0 3px 10px rgba(0, 0, 0, 0.85);
    margin: 0;
}

.tabs-wrap {
    width: 100%;
    max-width: 980px;
    display: flex;
    justify-content: center;
    margin: 14px 0 16px;
}

.tabs {
    display: flex;
    gap: 10px;
    padding: 10px;

    background: rgba(0, 0, 0, 0.40);
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.35);
}

.tab {
    min-width: 160px;
    padding: 10px 18px;

    background: rgba(10, 10, 10, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.18);

    color: rgba(255, 255, 255, 0.85);
    font-weight: 800;
    letter-spacing: 1px;

    cursor: pointer;
    transition: 0.15s ease;
}

.tab:hover {
    filter: brightness(1.08);
}

.tab.active {
    background: rgba(40, 40, 40, 0.85);
    border-color: rgba(255, 255, 255, 0.35);
    color: #fff;
}

.error-wrap {
    width: 100%;
    max-width: 980px;
    margin-bottom: 10px;
}

.error {
    padding: 10px 12px;
    background: rgba(90, 10, 10, 0.55);
    border: 1px solid rgba(255, 180, 180, 0.35);
    color: #ffb4b4;
    box-shadow: 0 10px 18px rgba(0, 0, 0, 0.35);
}

.panel {
    width: 100%;
    max-width: 980px;

    padding: 18px 18px 10px;

    background: rgba(0, 0, 0, 0.35);
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(2px);

    display: flex;
    flex-direction: column;
    gap: 16px;
}

.section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.section-title {
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 1.5px;
    opacity: 0.9;

    border-left: 3px solid rgba(255, 255, 255, 0.22);
    padding-left: 10px;
    margin-top: 2px;
}

.card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;

    padding: 14px 14px;

    background: rgba(0, 0, 0, 0.60);
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.45);

    position: relative;
    overflow: hidden;
}

.card::before {
    content: "";
    position: absolute;
    inset: 6px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    pointer-events: none;
}

.card-left {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
    flex: 1;
}

.avatar {
    width: 46px;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;

    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.12);
}

.avatar-icon {
    opacity: 0.9;
    font-size: 20px;
}

.info {
    min-width: 0;
}

.name {
    font-size: 18px;
    font-weight: 900;
    letter-spacing: 0.3px;
    display: flex;
    align-items: center;
    gap: 10px;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 520px;
}

.sub {
    font-size: 12px;
    opacity: 0.65;
    margin-top: 3px;
}

.badge {
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 1px;

    padding: 3px 8px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.05);
    opacity: 0.9;
}

.card-mid {
    opacity: 0.85;
    font-weight: 800;
    white-space: nowrap;
}

.players {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    letter-spacing: 0.5px;
}

.p-ic {
    opacity: 0.9;
}

.card-right {
    display: flex;
    align-items: center;
}

.btn-enter {
    min-width: 138px;
    padding: 10px 18px;

    color: #fff;
    font-weight: 900;
    letter-spacing: 1px;

    background: linear-gradient(180deg, rgba(195, 70, 52, 0.95), rgba(140, 35, 25, 0.95));
    border: 1px solid rgba(0, 0, 0, 0.75);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.20),
        0 10px 16px rgba(0, 0, 0, 0.45);

    cursor: pointer;
    transition: 0.12s ease;
}

.btn-enter:hover {
    filter: brightness(1.07);
}

.btn-enter:active {
    transform: translateY(1px);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.16),
        0 7px 12px rgba(0, 0, 0, 0.45);
}

.btn-enter:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.empty {
    text-align: center;
    padding: 14px 10px;
    opacity: 0.8;
}

.footer {
    width: 100%;
    max-width: 980px;
    margin-top: 18px;
    display: flex;
    justify-content: flex-start;
}

.btn-back {
    padding: 11px 22px;

    color: #fff;
    font-weight: 900;
    letter-spacing: 1px;

    background: linear-gradient(180deg, rgba(195, 70, 52, 0.95), rgba(140, 35, 25, 0.95));
    border: 1px solid rgba(0, 0, 0, 0.75);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.20),
        0 10px 16px rgba(0, 0, 0, 0.45);

    cursor: pointer;
    transition: 0.12s ease;
}

.btn-back:hover {
    filter: brightness(1.07);
}

.btn-back:active {
    transform: translateY(1px);
    box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.16),
        0 7px 12px rgba(0, 0, 0, 0.45);
}

.avatar-icon {
    width: 45px;
    object-fit: contain;
}
</style>