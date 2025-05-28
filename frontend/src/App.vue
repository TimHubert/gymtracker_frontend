<template>
  <div id="app">
    <header class="header">
      <nav class="nav-container">
        <div class="logo-wrapper">
          <img src="@/assets/logo.png" alt="Logo" class="logo" />
        </div>
        <div class="links">
          <router-link to="/">Home</router-link>
          <router-link to="/tracker">Tracker</router-link>
          <router-link to="/stats">Stats</router-link>
        </div>
      </nav>
    </header>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
.logo {
  height: 50px;
  width: auto;
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

.nav-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  max-width: cover;
  margin: 0 auto;
  background-image:
    linear-gradient(rgba(12, 12, 12, 0.8), rgba(19, 19, 19, 0.8)),
    url('@/assets/header-background.jpg');
  background-size: cover;
  background-position: center;
  backdrop-filter: blur(10px);
  background-color: transparent;
  border-radius: 1px 0 10px 10px;
  box-shadow: 0 0 20px 10px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 1000;
  opacity: 1;
}

.links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

nav a {
  color: white;
  text-align: center;
  text-decoration: none;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  width: 8rem;
  transition: background-color 0.3s;
  background-color: rgba(255, 255, 255, 0.1);
}

nav a:hover {
  background-color: rgb(0, 110, 255);
}

nav a.router-link-exact-active {
  background-color: rgb(0, 110, 255);
}

.main-content {
  width: 80%;
  max-width: 1300px;
  margin: 150px auto 30px auto;
  padding: 2rem;
  border-radius: 10px;
  overflow-y: visible;
}

body {
  overflow-y: auto;
}
</style>
