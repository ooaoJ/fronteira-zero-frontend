<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

import loginTheme from '../assets/audio/login-theme.mp3'
import clickSfxFile from '../assets/audio/effect/click.wav'
import keyboardSfxFile from '../assets/audio/effect/keyboard.wav'

import { registerRequest } from '../services/auth'

const name = ref('')
const email = ref('')
const password = ref('')

const bgMusic = ref(null)
const sfxClick = ref(null)
const sfxKeyboard = ref(null)

const emit = defineEmits(['registered', 'goLogin'])

let audioUnlocked = false
const loading = ref(false)
const errorMsg = ref('')

function playMusic() {
  if (!bgMusic.value) return
  bgMusic.value.volume = 0.4
  bgMusic.value.play().catch(() => console.log('Autoplay bloqueado até interação do usuário.'))
}

function unlockAudio() {
  if (audioUnlocked) return
  audioUnlocked = true

  const audios = [sfxClick.value, sfxKeyboard.value].filter(Boolean)
  audios.forEach((a) => {
    try {
      a.muted = true
      a.currentTime = 0
      a.play()
        .then(() => {
          a.pause()
          a.muted = false
          a.currentTime = 0
        })
        .catch(() => {
          a.muted = false
        })
    } catch {}
  })
}

function ensureMusic() {
  unlockAudio()
  playMusic()
}

onMounted(async () => {
  await nextTick()
  playMusic()
})

onBeforeUnmount(() => {
  if (bgMusic.value) bgMusic.value.pause()
})

function playClick() {
  unlockAudio()
  if (!sfxClick.value) return
  try {
    sfxClick.value.currentTime = 0
    sfxClick.value.volume = 0.7
    sfxClick.value.play()
  } catch (err) {
    console.log('Falha click SFX:', err)
  }
}

let lastTypeAt = 0
function onType(e) {
  unlockAudio()

  const ignore = ['Shift','Control','Alt','Meta','Tab','CapsLock','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','Escape']
  if (ignore.includes(e.key)) return

  const now = Date.now()
  if (now - lastTypeAt < 35) return
  lastTypeAt = now

  if (!sfxKeyboard.value) return
  try {
    sfxKeyboard.value.currentTime = 0
    sfxKeyboard.value.volume = 0.35
    sfxKeyboard.value.play()
  } catch (err) {
    console.log('Falha keyboard SFX:', err)
  }
}

function setError(msg) {
  errorMsg.value = msg || ''
}

function validate() {
  if (!name.value || !email.value || !password.value) {
    setError('Preencha todos os campos.')
    return false
  }
  if (password.value.length < 6) {
    setError('A senha precisa ter pelo menos 6 caracteres.')
    return false
  }
  setError('')
  return true
}

async function register() {
  playClick()
  if (loading.value) return
  if (!validate()) return

  loading.value = true
  try {
    const res = await registerRequest({
      name: name.value,
      email: email.value,
      password: password.value,
    })

    const token = res?.accessToken?.accessToken
    if (token) localStorage.setItem('fz_token', token)

    if (bgMusic.value) bgMusic.value.pause()
    emit('registered', res)
  } catch (err) {
    const status = err?.response?.status
    const backendMsg = err?.response?.data?.message
    const msg =
      (Array.isArray(backendMsg) ? backendMsg.join(' / ') : backendMsg) ||
      (status === 409 ? 'Esse email já está em uso.' : 'Erro ao conectar no servidor')

    console.log('Erro no registro:', err)
    setError(msg)
  } finally {
    loading.value = false
  }
}

function onAudioError(name, e) {
  console.log(`Erro carregando áudio: ${name}`, e)
}
</script>

<template>
  <div class="login-bg" @pointerdown="ensureMusic">
    <div class="overlay"></div>

    <audio ref="bgMusic" :src="loginTheme" loop preload="auto" @error="(e) => onAudioError('loginTheme', e)"></audio>
    <audio ref="sfxClick" :src="clickSfxFile" preload="auto" @error="(e) => onAudioError('click.wav', e)"></audio>
    <audio ref="sfxKeyboard" :src="keyboardSfxFile" preload="auto" @error="(e) => onAudioError('keyboard.wav', e)"></audio>

    <div class="metal-panel">
      <img src="../assets/images/logo.png" alt="Fronteira Zero" class="logo" />

      <div class="panel-content">
        <p class="message">Crie sua conta e entre na fronteira.</p>

        <div class="form">
          <div class="fields">
            <input
              v-model="name"
              placeholder="Nome"
              autocomplete="name"
              @keydown="onType"
              @pointerdown="playClick"
              @focus="playClick"
            />

            <input
              v-model="email"
              placeholder="Email"
              autocomplete="email"
              @keydown="onType"
              @pointerdown="playClick"
              @focus="playClick"
            />

            <input
              class="full"
              v-model="password"
              type="password"
              placeholder="Senha"
              autocomplete="new-password"
              @keydown="onType"
              @pointerdown="playClick"
              @focus="playClick"
              style="width: 96.6%;"
            />
          </div>

          <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

          <button class="btn-rust" :disabled="loading" @pointerdown="register">
            {{ loading ? 'CRIANDO...' : 'CRIAR CONTA' }}
          </button>

          <button class="link-btn" type="button" @pointerdown="() => { playClick(); emit('goLogin') }">
            Já tenho conta — voltar pro login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-bg {
  width: 100vw;
  height: 100vh;
  background-image: url('../assets/images/capa.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
}

.metal-panel {
  position: relative;
  z-index: 2;
  width: min(1080px, 92vw);
  aspect-ratio: 980 / 520;
  background-image: url('../assets/images/login-container.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.logo {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 620px;
  pointer-events: none;
}

.panel-content {
  position: absolute;
  left: 50%;
  top: 54%;
  transform: translate(-50%, -50%);
  width: min(780px, 75%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.message { color: #fde6c3; }
.message:nth-child(1) { font-size: 20px; }

.form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.fields {
  width: min(680px, 70%);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

input {
  width: 93%;
  height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(250, 230, 185, 0.36);
  background: rgba(0, 0, 0, 0.55);
  color: white;
  font-size: 16px;
  outline: none;
}

input:focus { border-color: #c46a22; }

.full {
  grid-column: 1 / -1;
}

.btn-rust {
  width: 38%;
  height: 54px;
  margin-top: 12px;
  position: relative;
  background-color: #b85e1a;
  background-image:
    url('../assets/images/texture/black-felt.png'),
    linear-gradient(180deg, rgba(255, 255, 255, 0.10), rgba(0, 0, 0, 0.35));
  background-size: cover, 100% 100%;
  background-position: center, center;
  background-repeat: no-repeat, no-repeat;
  border: 2px solid rgba(10, 10, 10, 0.9);
  box-shadow:
    0 10px 18px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.12),
    inset 0 -2px 0 rgba(0, 0, 0, 0.45);
  color: rgba(255, 235, 215, 0.9);
  font-weight: 500;
  font-size: 20px;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.12s ease, filter 0.12s ease;
}

.btn-rust:hover { filter: brightness(1.08) contrast(1.05); transform: translateY(-1px); }
.btn-rust:active {
  transform: translateY(1px);
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    inset 0 -1px 0 rgba(0, 0, 0, 0.55);
}
.btn-rust::before {
  content: "";
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.35);
  pointer-events: none;
}
.btn-rust:disabled { opacity: 0.75; cursor: not-allowed; transform: none; filter: none; }

.error {
  margin-top: 6px;
  width: min(680px, 70%);
  text-align: center;
  font-size: 14px;
  color: #ffd2a6;
}

.link-btn {
  margin-top: 8px;
  background: transparent;
  border: none;
  color: #fde6c3;
  opacity: 0.9;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
}
.link-btn:hover { opacity: 1; }

@media (max-width: 520px) {
  .fields {
    grid-template-columns: 1fr;
    width: 80%;
  }
  .full { grid-column: auto; }
  .btn-rust { width: 70%; }
}
</style>