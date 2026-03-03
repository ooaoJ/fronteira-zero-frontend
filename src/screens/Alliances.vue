<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import {
  getMyAlliance,
  listAlliances,
  createAlliance,
  joinAlliance,
  leaveAlliance,
  sendAllianceMessage,
} from '../services/alliances'
import { getSocket, disconnectSocket } from '../services/socket'

const loading = ref(true)
const errorMsg = ref('')

const my = ref(null)
const alliances = ref([])

const showCreate = ref(false)
const createName = ref('')
const createTag = ref('')

const messageInput = ref('')
const sending = ref(false)

const socket = ref(null)

import c1 from '../assets/images/profiles/character1.png'
import c2 from '../assets/images/profiles/character2.png'
import c3 from '../assets/images/profiles/character3.png'
import c4 from '../assets/images/profiles/character4.png'
import c5 from '../assets/images/profiles/character5.png'

const avatarMap = {
  1: c1,
  2: c2,
  3: c3,
  4: c4,
  5: c5,
}

// ✅ ref pra auto-scroll
const messagesEl = ref(null)

const hasAlliance = computed(() => !!my.value?.alliance?.id)

async function scrollToBottom() {
  await nextTick()
  if (!messagesEl.value) return
  messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

async function load() {
  loading.value = true
  errorMsg.value = ''
  try {
    my.value = await getMyAlliance()

    if (!my.value) {
      alliances.value = await listAlliances()
      disconnectChat()
    } else {
      if (!my.value.messages) my.value.messages = []
      if (!my.value.members) my.value.members = []
      connectChat()
      scrollToBottom()
    }
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || e?.message || String(e)
  } finally {
    loading.value = false
  }
}

function connectChat() {
  if (!my.value?.alliance?.id) return
  if (socket.value) return

  socket.value = getSocket()
  socket.value.emit('alliance:join', { allianceId: my.value.alliance.id })

  socket.value.on('alliance:new_message', (payload) => {
    if (!my.value) return
    if (!my.value.messages) my.value.messages = []
    my.value.messages.push(payload)

    if (my.value.messages.length > 200) {
      my.value.messages.splice(0, my.value.messages.length - 200)
    }

    scrollToBottom()
  })

  socket.value.on('alliance:members_updated', (payload) => {
    if (!my.value) return
    if (my.value.alliance) my.value.alliance.membersCount = payload.membersCount
    my.value.members = payload.members
  })
}

function disconnectChat() {
  if (socket.value) {
    socket.value.off('alliance:new_message')
    socket.value.off('alliance:members_updated')
  }
  disconnectSocket()
  socket.value = null
}

function openCreate() {
  errorMsg.value = ''
  showCreate.value = true
}

function closeCreate() {
  showCreate.value = false
}

async function onCreateAlliance() {
  errorMsg.value = ''
  const name = createName.value.trim()
  const tag = createTag.value.trim()

  if (name.length < 3) {
    errorMsg.value = 'Nome precisa ter pelo menos 3 caracteres.'
    return
  }

  try {
    await createAlliance({ name, tag: tag || undefined })
    showCreate.value = false
    createName.value = ''
    createTag.value = ''
    await load()
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || e?.message || String(e)
  }
}

async function onJoinAlliance(id) {
  errorMsg.value = ''
  try {
    await joinAlliance(id)
    await load()
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || e?.message || String(e)
  }
}

async function onLeaveAlliance() {
  errorMsg.value = ''
  try {
    await leaveAlliance()
    await load()
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || e?.message || String(e)
  }
}

async function onSendMessage() {
  const content = messageInput.value.trim()
  if (!content) return

  sending.value = true
  errorMsg.value = ''
  try {
    await sendAllianceMessage(content)
    messageInput.value = ''
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || e?.message || String(e)
  } finally {
    sending.value = false
  }
}

function onKeydown(e) {
  if (e.key === 'Escape' && showCreate.value) closeCreate()
}

function getAvatarSrc(id) {
  const n = Number(id)
  return avatarMap[n] ?? c1
}

function formatTime(createdAt) {
  if (!createdAt) return ''

  const s = String(createdAt).replace(' ', 'T')
  const fixed = s.replace(/\.(\d{3})\d+$/, '.$1')

  const d = new Date(fixed)
  if (Number.isNaN(d.getTime())) return ''

  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

// trava scroll do body quando modal abre
watch(showCreate, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onMounted(() => {
  load()
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  disconnectChat()
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="lobby-bg alliances-lobby">
    <div class="overlay"></div>

    <div class="metal-panel">
      <div class="panel-content">
        <div class="header">
          <div>
            <h1 class="title">ALIANÇAS</h1>

            <div v-if="!loading && hasAlliance" class="subtitle">
              <span class="ally-name">
                {{ my.alliance.name }}
                <span v-if="my.alliance.tag">[{{ my.alliance.tag }}]</span>
              </span>
              <span class="dot">•</span>
              <span>Membros: {{ my.alliance.membersCount }}/10</span>
              <span class="dot">•</span>
              <span>Pontos: {{ my.alliance.points }}</span>
            </div>

            <p v-else class="subtitle">Crie, entre e converse com sua aliança.</p>
          </div>

          <div class="header-actions">
            <button class="btn-ghost small-btn" @click="$router.push('/lobby')">VOLTAR</button>
            <button v-if="!loading && hasAlliance" class="btn-ghost danger small-btn" @click="onLeaveAlliance">
              SAIR
            </button>
          </div>
        </div>

        <div class="body">
          <p v-if="loading" class="state">Carregando...</p>
          <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

          <!-- ===== SE TEM ALIANÇA ===== -->
          <div v-if="!loading && hasAlliance" class="my">
            <div class="grid">
              <div class="box">
                <h3>Membros</h3>

                <ul class="members">
                  <li v-for="m in my.members" :key="m.id" class="member">
                    <span class="avatar" :style="`background: url(${getAvatarSrc(m.avatarId)})`"
                      style="background-size: contain; background-position: center"></span>
                    <div class="member-text">
                      <div class="member-name">{{ m.name }}</div>
                      <div class="member-sub">{{ m.rank }} (XP: {{ m.xp }})</div>
                    </div>
                  </li>
                </ul>
              </div>

              <div class="box">
                <h3>Chat</h3>

                <div class="messages" ref="messagesEl">
                  <div v-for="msg in my.messages" :key="msg.id + '-' + msg.createdAt" class="msg">
                    <span class="msg-name">{{ msg.userName || msg.userId }}</span>
                    <span class="msg-sep">:</span>
                    <span class="msg-text">{{ msg.content }}</span>
                    <span class="msg-time">{{ formatTime(msg.createdAt) }}</span>
                  </div>
                </div>

                <div class="send">
                  <input v-model="messageInput" maxlength="400" placeholder="Digite sua mensagem..."
                    @keyup.enter="onSendMessage" />
                  <button class="btn-rust small-send" :disabled="sending" @click="onSendMessage">
                    ENVIAR
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== SE NÃO TEM ALIANÇA ===== -->
          <div v-else-if="!loading" class="list">
            <div class="actions">
              <button class="btn-rust" @click="openCreate">CRIAR ALIANÇA</button>
            </div>

            <div v-if="alliances.length === 0" class="empty">
              Nenhuma aliança encontrada.
            </div>

            <div v-else class="cards">
              <div v-for="a in alliances" :key="a.id" class="card">
                <div>
                  <h2 class="card-title">
                    {{ a.name }} <span v-if="a.tag">[{{ a.tag }}]</span>
                  </h2>
                  <p class="card-sub">
                    Pontos: {{ a.points }} • Membros: {{ a.membersCount }}/{{ a.maxMembers }}
                  </p>
                </div>

                <button class="btn-rust small-send" :disabled="a.membersCount >= a.maxMembers"
                  @click="onJoinAlliance(a.id)">
                  ENTRAR
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ MODAL TELEPORTADO -->
    <teleport to="body">
      <div v-if="showCreate" class="modal-backdrop" @click.self="closeCreate">
        <div class="modal" role="dialog" aria-modal="true" aria-label="Criar aliança">
          <div class="modal-top">
            <h2>Criar aliança</h2>
            <button class="modal-close" aria-label="Fechar" @click="closeCreate">✕</button>
          </div>

          <p class="modal-hint">
            Escolha um <b>nome</b> e uma <b>tag</b> curta (opcional). Pressione <b>ESC</b> para fechar.
          </p>

          <div class="form-grid">
            <div class="field">
              <label>Nome</label>
              <input v-model="createName" maxlength="60" placeholder="Ex: Guardiões do Norte" />
              <small>Mínimo 3 caracteres.</small>
            </div>

            <div class="field">
              <label>Tag (opcional)</label>
              <input v-model="createTag" maxlength="8" placeholder="Ex: GDN" />
              <small>Até 8 caracteres.</small>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn-ghost" @click="closeCreate">CANCELAR</button>
            <button class="btn-rust" @click="onCreateAlliance">CRIAR</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<style scoped>
/* ======= BASE DO LOBBY (casca) ======= */
.lobby-bg {
  width: 100vw;
  min-height: 100vh;
  background-image: url('../assets/images/backgrounds/lobby.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;
  overflow: hidden;
}

.overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(900px 520px at 22% 18%, rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.75));
  z-index: 1;
}

.metal-panel {
  position: relative;
  z-index: 2;

  width: min(1100px, 94vw);
  min-height: 520px;

  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(250, 230, 185, 0.22);
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.60),
    inset 0 1px 0 rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(8px);

  padding: 28px;
}

.panel-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.title {
  margin: 0;
  font-size: 34px;
  letter-spacing: 2px;
  color: rgba(255, 235, 215, 0.92);
  text-transform: uppercase;
}

.subtitle {
  margin: 6px 0 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;

  color: #fde6c3;
  opacity: 0.9;
}

.ally-name {
  font-weight: 800;
  color: rgba(255, 235, 215, 0.95);
}

.dot {
  opacity: 0.6;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* ======= BOTÕES ======= */
.btn-rust {
  height: 56px;
  padding: 0 16px;
  position: relative;
  background-color: #b85e1a;
  background-image: url('../assets/images/texture/black-felt.png'),
    linear-gradient(180deg, rgba(255, 255, 255, 0.10), rgba(0, 0, 0, 0.35));
  background-size: cover, 100% 100%;
  background-position: center, center;
  background-repeat: no-repeat, no-repeat;
  border: 2px solid rgba(10, 10, 10, 0.9);
  box-shadow:
    0 10px 18px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    inset 0 -2px 0 rgba(0, 0, 0, 0.45);
  color: rgba(255, 235, 215, 0.92);
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.12s ease, filter 0.12s ease;
}

.btn-rust:hover {
  filter: brightness(1.08) contrast(1.05);
  transform: translateY(-1px);
}

.btn-rust:active {
  transform: translateY(1px);
}

.btn-ghost {
  height: 56px;
  padding: 0 16px;
  position: relative;
  background-color: rgba(0, 0, 0, 0.25);
  border: 2px solid rgba(10, 10, 10, 0.9);
  box-shadow:
    0 10px 18px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    inset 0 -2px 0 rgba(0, 0, 0, 0.35);
  color: rgba(255, 235, 215, 0.92);
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.12s ease, filter 0.12s ease;
}

.btn-ghost:hover {
  filter: brightness(1.06);
  transform: translateY(-1px);
}

.btn-ghost:active {
  transform: translateY(1px);
}

.btn-ghost.danger {
  background-color: #d61515;
}

.small-btn {
  height: 44px;
  font-size: 14px;
  padding: 0 14px;
}

.small-send {
  height: 44px;
  font-size: 14px;
  padding: 0 14px;
  width: auto;
}

/* ======= CONTEÚDO ======= */
.body {
  margin-top: 6px;
}

.state {
  color: rgba(255, 255, 255, 0.78);
}

.error {
  color: #ff7b7b;
  margin: 8px 0 0;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 18px;
}

@media (max-width: 980px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.box {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(250, 230, 185, 0.18);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.35);
  padding: 18px;
}

.box h3 {
  margin: 0 0 12px;
  font-size: 20px;
  letter-spacing: 1px;
  color: rgba(255, 235, 215, 0.92);
}

.members {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.member {
  display: flex;
  gap: 10px;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(0, 0, 0, 0.35);
  padding: 10px 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 2px solid rgba(255, 190, 120, 0.25);
  flex: 0 0 auto;
}

.member-name {
  font-weight: 800;
  color: rgba(255, 235, 215, 0.92);
}

.member-sub {
  opacity: 0.75;
  font-size: 13px;
  margin-top: 3px;
  color: rgba(255, 255, 255, 0.78);
}

.messages {
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(0, 0, 0, 0.35);
  height: 280px;
  overflow-y: auto;
  padding: 10px;
}

.msg {
  padding: 6px 6px;
}

.msg+.msg {
  margin-top: 6px;
}

.msg-name {
  font-weight: 900;
  color: #ffd7a3;
}

.msg-sep {
  opacity: 0.8;
  margin: 0 6px;
}

.msg-text {
  opacity: 0.95;
  color: rgba(255, 255, 255, 0.90);
}

.send {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.send input {
  flex: 1;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  outline: none;
}

.actions {
  margin-bottom: 12px;
}

.cards {
  display: grid;
  gap: 10px;
}

.card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(250, 230, 185, 0.18);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.35);
  padding: 14px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  color: rgba(255, 235, 215, 0.92);
}

.card-sub {
  margin: 4px 0 0;
  opacity: 0.78;
  color: rgba(255, 255, 255, 0.78);
}

.empty {
  opacity: 0.8;
  color: rgba(255, 255, 255, 0.78);
}

/* ======= MODAL ======= */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, .72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.modal {
  width: min(860px, 92vw);
  max-height: min(720px, 86vh);
  overflow: auto;

  background: rgba(0, 0, 0, 0.82);
  border: 1px solid rgba(250, 230, 185, 0.20);
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.75);
  border-radius: 16px;

  padding: 32px;
  color: rgba(255, 255, 255, 0.92);
}

.modal-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.modal h2 {
  margin: 0;
  font-size: 20px;
  letter-spacing: 0.5px;
  color: rgba(255, 235, 215, 0.95);
}

.modal-close {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.35);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

.modal-close:hover {
  filter: brightness(1.1);
}

.modal-hint {
  margin: 10px 0 14px;
  opacity: 0.85;
  color: rgba(255, 255, 255, 0.84);
  line-height: 1.35;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 560px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.field label {
  display: block;
  font-weight: 700;
  opacity: 0.9;
  margin-bottom: 6px;
}

.field input {
  width: 96%;
  padding: 12px 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.40);
  color: #fff;
  outline: none;
}

.field input:focus {
  border-color: rgba(255, 190, 120, 0.35);
  box-shadow: 0 0 0 3px rgba(255, 190, 120, 0.10);
}

.field small {
  display: block;
  margin-top: 6px;
  opacity: 0.75;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.78);
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 16px;
}

.msg {
  display: flex;
  gap: 6px;
  align-items: baseline;
}

.msg-time {
  margin-left: auto;
  opacity: 0.65;
  font-size: 12px;
  white-space: nowrap;
}
</style>