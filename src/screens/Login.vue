<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'

import loginTheme from '../assets/audio/login-theme.mp3'
import clickSfxFile from '../assets/audio/effect/click.wav'
import keyboardSfxFile from '../assets/audio/effect/keyboard.wav'

import { loginRequest } from '../services/auth'

/** 🔊 Ícones */
import soundIcon from '../assets/images/sound.png'
import soundMutedIcon from '../assets/images/sound-muted.png'

const router = useRouter()

const email = ref('')
const password = ref('')

const bgMusic = ref(null)
const sfxClick = ref(null)
const sfxKeyboard = ref(null)

let audioUnlocked = false
const loading = ref(false)

/** 🔊 Mute */
const isMuted = ref(false)

function applyMuteToAll() {
  const muted = isMuted.value

  // Música
  if (bgMusic.value) bgMusic.value.muted = muted

  // SFX (opcional: mutar todos também)
  // if (sfxClick.value) sfxClick.value.muted = muted
  // if (sfxKeyboard.value) sfxKeyboard.value.muted = muted
}

function toggleSound() {
  isMuted.value = !isMuted.value
  applyMuteToAll()
  localStorage.setItem('fz_muted', isMuted.value ? '1' : '0')
}

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

          // ✅ se o usuário estava mutado, mantém mutado
          applyMuteToAll()
        })
        .catch(() => {
          a.muted = false
          applyMuteToAll()
        })
    } catch { }
  })
}

function ensureMusic() {
  unlockAudio()
  playMusic()
}

onMounted(async () => {
  await nextTick()

  // ✅ restaura mute salvo
  const saved = localStorage.getItem('fz_muted')
  if (saved === '1') {
    isMuted.value = true
    applyMuteToAll()
  }

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
  const ignore = ['Shift', 'Control', 'Alt', 'Meta', 'Tab', 'CapsLock', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape']
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

async function login() {
  playClick()

  if (!email.value || !password.value) {
    alert('Preencha email e senha')
    return
  }

  if (loading.value) return
  loading.value = true

  try {
    const res = await loginRequest(email.value, password.value)
    const token = res?.accessToken?.accessToken
    if (!token) throw new Error('Token não veio na resposta do backend.')

    localStorage.setItem('fz_token', token)

    if (bgMusic.value) bgMusic.value.pause()

    router.push('/loading')
  } catch (err) {
    const status = err?.response?.status
    const backendMsg = err?.response?.data?.message
    const msg =
      (Array.isArray(backendMsg) ? backendMsg.join(' / ') : backendMsg) ||
      (status === 401 ? 'Email ou senha inválidos' : 'Erro ao conectar no servidor')

    console.log('Erro no login:', err)
    alert(msg)
  } finally {
    loading.value = false
  }
}

function goRegister() {
  playClick()
  router.push('/register')
}

function onAudioError(name, e) {
  console.log(`Erro carregando áudio: ${name}`, e)
}
</script>

<template>
  <div class="login-bg" @pointerdown="ensureMusic">
    <div class="overlay"></div>

    <!-- 🎵 Música -->
    <audio ref="bgMusic" :src="loginTheme" loop preload="auto" @error="(e) => onAudioError('loginTheme', e)"></audio>

    <!-- 🔊 SFX -->
    <audio ref="sfxClick" :src="clickSfxFile" preload="auto" @error="(e) => onAudioError('click.wav', e)"></audio>

    <audio ref="sfxKeyboard" :src="keyboardSfxFile" preload="auto"
      @error="(e) => onAudioError('keyboard.wav', e)"></audio>

    <!-- 🔊 Botão mute (agora com PNGs) -->
    <button class="sound-btn" type="button" @click="toggleSound" title="Som">
      <img class="sound-ico" :src="isMuted ? soundMutedIcon : soundIcon" alt="Som" />
    </button>

    <div class="metal-panel">
      <img src="../assets/images/logo.png" alt="Fronteira Zero" class="logo" />

      <div class="panel-content">
        <p class="message">Sobreviva. Cresça. Faça barulho.</p>

        <div class="form">
          <div class="fields">
            <input v-model="email" placeholder="Email" @keydown="onType" @pointerdown="playClick" @focus="playClick" />
            <input v-model="password" type="password" placeholder="Senha" maxlength="10" @keydown="onType" @pointerdown="playClick"
              @focus="playClick" />
          </div>

          <button class="btn-rust" @pointerdown="login">ENTRAR</button>
        </div>

        <button class="link-btn" type="button" @pointerdown="goRegister">
          Não possui uma conta? Cadastre-se
        </button>
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
  top: 56%;
  transform: translate(-50%, -50%);
  width: min(780px, 75%);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.message {
  color: #fde6c3;
}

.message:nth-child(1) {
  font-size: 20px;
}

.form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.fields {
  width: 60%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

input {
  width: 100%;
  height: 44px;
  padding: 0 14px;
  border-radius: 8px;

  border: 1px solid rgba(250, 230, 185, 0.36);
  background: rgba(0, 0, 0, 0.55);
  color: white;
  font-size: 16px;

  outline: none;
}

input:focus {
  border-color: #c46a22;
}

.btn-rust {
  width: 38%;
  height: 54px;
  margin-top: 14px;

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

.btn-rust:hover {
  filter: brightness(1.08) contrast(1.05);
  transform: translateY(-1px);
}

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

/* ✅ botão de som com PNG */
.sound-btn {
  position: absolute;
  bottom: 30px;
  right: 30px;
  z-index: 5;

  width: 55px;
  height: 55px;

  border-radius: 50%;
  border: 1px solid rgba(250, 230, 185, 0.36);
  background: rgba(0, 0, 0, 0.55);

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  transition: transform 0.12s ease, filter 0.12s ease, opacity 0.12s ease;
}

.sound-btn:hover {
  filter: brightness(1.08) contrast(1.05);
  transform: translateY(-1px);
}

.sound-btn:active {
  transform: translateY(1px);
}

.sound-ico {
  width: 50px;
  /* height: 22px; */
  display: block;
  user-select: none;
  pointer-events: none;
}
</style>