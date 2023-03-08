<template>
  <div v-if="!connected">
    <h2 class="loading">Verbindung wird hergestellt {{ dots }}</h2>
  </div>
  <template v-else>
    <main>
      <UserSelection :users="users" @start-chat="changedChat" :username="username" :notifications="notifications"/>
      <Chat :socket="socket" :connected="connected" :targetUsername="targetUsername" @setUsername="username = $event" @newMessage="newMessage($event)"/>
    </main>
  </template>
</template>


<script>
import io from "socket.io-client";

import Chat from "@/components/Chat.vue";
import UserSelection from "@/components/UserSelection.vue";
export default {
  name: "App",
  components: {
    Chat,
    UserSelection
  },
  data() {
    return {
      socket: null,
      connected: false,

      dots: ".",
      users: [],
      targetUsername: "",
      username: "",
      notifications: new Map()
    };
  },
  mounted() {
    setInterval(() => {
      if (this.dots.length < 3) {
        this.dots += ".";
      } else {
        this.dots = ".";
      }
    }, 500);

    this.socket = io("https://localhost:5001", {
      transports: ["websocket"],
      secure: true,
      rejectUnauthorized: false
    });

    this.socket.on("connect", () => {
      this.connected = true;
      console.log("Connected to server");
    });
    this.socket.on("disconnect", () => {
      this.connected = false;
      console.log("Disconnected from server");
    });

    this.socket.on("active users", (users) => {
      this.users = users;
    });
  },
  methods: {
    newMessage(sender) {
      if (this.notifications.has(sender)) {
        this.notifications.set(sender, this.notifications.get(sender) + 1);
      } else {
        this.notifications.set(sender, 1);
      }
    },
    changedChat(username) {
      this.targetUsername = username;
      this.notifications.set(username, 0);
    }
  }
}
</script>

<style scoped>
#app {
  background-color: white;
}
main {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: row;
  margin: 0 auto;
  gap: 30px;
}
</style>
<style>
.chat {
  flex: 1;
  border-radius: 20px;
}
</style>
