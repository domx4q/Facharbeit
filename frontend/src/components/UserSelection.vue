<template>
  <div class="user-list">
    <h2>Wähle einen Chatpartner</h2>
    <ul v-auto-animate>
      <template v-for="user in users" :key="user">
        <li @click="startChat(user)" v-if="user !== username" :class="{selected:user===selectedUser}">
          {{ user }} <span v-if="notifications.has(user) && notifications.get(user) > 0" class="notification">{{ notifications.get(user) }}</span>
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
export default {
  name: "UserSelection",
  props: {
    users: {
      type: Array,
      required: true
    },
    username: {
      type: String,
      required: true
    },
    notifications: {
      type: Map,
      required: true
    }
  },
  data() {
    return {
      selectedUser: ""
    };
  },
  mounted() {
    this.startChat(this.users[0])
  },
  methods: {
    startChat(user) {
      this.selectedUser = user;
      this.$emit("start-chat", user);
      // reordering the list (selected to the top)
      this.users.splice(this.users.indexOf(user), 1);
      this.users.unshift(user);
    }
  }
};
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}

li {
  cursor: pointer;
  padding: 10px;
  border: 1px solid #ccc;
  color: inherit;
  margin-bottom: 10px;
  border-radius: 5px;
  white-space: nowrap;

  transition: color 0.2s, border-color 0.2s;
}

.selected {
  border-color: #2e5ee0;
  color: #2e5ee0;
}

.notification {
  background-color: #2e5ee0;
  color: white;
  padding: 5px 10px;
  border-radius: 100%;
  margin-left: 10px;
  aspect-ratio: 1/1;
}
</style>
