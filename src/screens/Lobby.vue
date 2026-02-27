<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { getMe } from '../services/profile'

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

const playerName = ref('...')
const playerLvl = ref('...')
const playerWins = ref('...')
const playerHordesDefeated = ref('...')
const playerAvatarId = ref(1)
const loadingName = ref(true)

const router = useRouter()

function startGame() {
  router.push('/game')
}

function logout() {
  localStorage.removeItem('fz_token')
  router.push('/login')
}

function goProfile() {
  router.push('/profile')
}

function getAvatarSrc(id) {
  const n = Number(id)
  return avatarMap[n] ?? c1
}

onMounted(async () => {
  loadingName.value = true
  try {
    const me = await getMe()

    playerName.value = me?.name ?? 'Sobrevivente'
    playerLvl.value = me?.level ?? me?.rank ?? 1
    playerWins.value = me?.wins ?? 0
    playerHordesDefeated.value = me?.hordesDefeated ?? 0

    const n = Number(me?.avatarId)
    playerAvatarId.value = Number.isFinite(n) && n > 0 ? n : 1
  } catch (err) {
    console.log('[Lobby] erro buscando perfil:', err)
    playerName.value = 'Sobrevivente'
    playerLvl.value = 1
    playerWins.value = 0
    playerHordesDefeated.value = 0
    playerAvatarId.value = 1
  } finally {
    loadingName.value = false
  }
})
</script>

<template>
  <div class="lobby-bg">
    <div class="overlay"></div>

    <div class="metal-panel">
      <div class="panel-content">
        <div class="header">
          <div>
            <h1 class="title">LOBBY</h1>
            <p class="subtitle">Sobreviva. Cresça. Faça barulho.</p>
          </div>

          <div>
            <button @click="$router.push('/alliances')" aria-label="Ir para alianças">
              <img src="../assets/images/icons/alianca.png" alt="Aliança" />
            </button>
          </div>
        </div>

        <div class="grid">
          <section class="card">
            <div class="card-title">
              <div class="profile-image">
                <button
                  class="profile-btn"
                  @click="$router.push('/profile')"
                  aria-label="Editar perfil"
                  title="Editar perfil"
                >
                  <img
                    class="profile-avatar"
                    :src="getAvatarSrc(playerAvatarId)"
                    alt="Perfil"
                  />

                  <img
                    class="profile-pencil"
                    src="../assets/images/icons/pencil.png"
                    alt=""
                    aria-hidden="true"
                  />
                </button>
              </div>

              <h2>
                Perfil <span class="username">— {{ playerName }}</span>
              </h2>
            </div>

            <p class="muted">Seu nível, conquistas, estatísticas e progresso.</p>

            <div class="stats">
              <div class="stat">
                <span class="stat-label">Nível</span>
                <span class="stat-value">{{ playerLvl }}</span>
              </div>

              <div class="stat">
                <span class="stat-label">Vitórias</span>
                <span class="stat-value">{{ playerWins }}</span>
              </div>

              <div class="stat">
                <span class="stat-label">Hordas derrotadas</span>
                <span class="stat-value">{{ playerHordesDefeated }}</span>
              </div>
            </div>

            <div class="hint">
              Dica: entrar em partida cedo = base rápida. Expandir demais = mais barulho.
            </div>
          </section>

          <section class="card">
            <h2 class="card-title">Pronto pra uma nova batalha?</h2>
            <p class="muted">Crie uma sala ou entre em uma partida e sobreviva ao caos.</p>

            <button class="btn-rust" @pointerdown="startGame">NOVA PARTIDA</button>
            <button class="btn-ghost" @pointerdown="logout">SAIR</button>

            <div class="divider"></div>

            <div class="small">
              <span class="dot"></span>
              <span>Servidor: <b>online</b></span>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lobby-bg {
  width: 100vw;
  height: 100vh;
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
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}
.header div button{
  width: 80px;
  height: 80px;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100%;
  transition: scale 0.6s ease;
  overflow: hidden;
}
.header div button img{
  width: 130px;
  position: relative;
  top: 3px;
  left: 1px;
}
.header div button:hover img{
  transform: scale(1.1);
  cursor: pointer;
}

.title {
  margin: 0;
  font-size: 34px;
  letter-spacing: 2px;
  color: rgba(255, 235, 215, 0.92);
  text-transform: uppercase;
}

.subtitle {
  margin: 0;
  color: #fde6c3;
  opacity: 0.9;
}

.grid {
  display: grid;
  grid-template-columns: 2fr 1.1fr;
  gap: 18px;
}

.card {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(250, 230, 185, 0.18);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.35);
  padding: 18px;
}

.card-title {
  font-weight: 600;
  letter-spacing: 1px;
  color: rgba(255, 235, 215, 0.92);
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 10px;
}

.muted {
  margin: 0 0 12px;
  color: rgba(255, 255, 255, 0.78);
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 8px;
}

.stat {
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(0, 0, 0, 0.35);
  padding: 10px 12px;
}

.stat-label {
  display: block;
  font-size: 12px;
  opacity: 0.75;
}

.stat-value {
  display: block;
  font-size: 18px;
  margin-top: 4px;
  color: #fde6c3;
}

/* Hint box */
.hint {
  margin-top: 12px;
  padding: 10px 12px;
  border-left: 3px solid #c46a22;
  background: rgba(196, 106, 34, 0.12);
  color: rgba(255, 235, 215, 0.88);
  font-size: 13px;
  line-height: 1.35;
}

.btn-rust {
  width: 100%;
  height: 56px;
  margin-top: 10px;
  position: relative;
  background-color: #b85e1a;
  background-image: url('../assets/images/texture/black-felt.png'), linear-gradient(180deg, rgba(255, 255, 255, 0.10), rgba(0, 0, 0, 0.35));
  background-size: cover, 100% 100%;
  background-position: center, center;
  background-repeat: no-repeat, no-repeat;
  border: 2px solid rgba(10, 10, 10, 0.9);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -2px 0 rgba(0, 0, 0, 0.45);
  color: rgba(255, 235, 215, 0.92);
  font-weight: 600;
  font-size: 18px;
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

.btn-rust::before {
  content: "";
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.35);
  pointer-events: none;
}

.btn-ghost {
  width: 100%;
  height: 56px;
  margin-top: 10px;
  position: relative;
  background-color: #d61515;
  background-image: url('../assets/images/texture/black-felt.png'), linear-gradient(180deg, rgba(255, 255, 255, 0.10), rgba(0, 0, 0, 0.35));
  background-size: cover, 100% 100%;
  background-position: center, center;
  background-repeat: no-repeat, no-repeat;
  border: 2px solid rgba(10, 10, 10, 0.9);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 -2px 0 rgba(0, 0, 0, 0.45);
  color: rgba(255, 235, 215, 0.92);
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 1px;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.12s ease, filter 0.12s ease;
}

.btn-ghost:hover {
  filter: brightness(1.08) contrast(1.05);
  transform: translateY(-1px);
}

.btn-ghost:active {
  transform: translateY(1px);
}

.btn-ghost::before {
  content: "";
  position: absolute;
  inset: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.35);
  pointer-events: none;
}

.divider {
  height: 1px;
  margin: 14px 0 10px;
  background: rgba(255, 255, 255, 0.12);
}

.small {
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3bd16f;
  box-shadow: 0 0 20px rgb(0, 255, 89);
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #ffffff42;
}

.username {
  background: url('../assets/images/texture/gold.jpg');
  background-size: cover;
  background-clip: text;
  color: transparent;
}

.profile-btn {
  width: 100%;
  height: 100%;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  position: relative;
  overflow: hidden;
}

.profile-avatar {
  width: 125px;
  height: auto;
  display: block;
  transition: filter 180ms ease, transform 180ms ease;
  user-select: none;
  pointer-events: none;
}

.profile-pencil {
  position: absolute;
  width: 50px;
  right: calc(50% - 25px);
  bottom: calc(50% - 25px);

  opacity: 0;
  transform: translateY(6px) scale(0.96);
  transition: opacity 180ms ease, transform 180ms ease;
  user-select: none;
  pointer-events: none;
  filter: drop-shadow(0 6px 14px rgba(0,0,0,0.7));
}

.profile-btn:hover .profile-avatar {
  filter: brightness(0.55) contrast(1.05);
  transform: scale(1.02);
}

.profile-btn:hover .profile-pencil {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.profile-btn:focus-visible .profile-avatar {
  filter: brightness(0.55) contrast(1.05);
}

.profile-btn:focus-visible .profile-pencil {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@media (max-width: 900px) {
  .metal-panel {
    padding: 16px;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 28px;
  }
}
</style>