<script>
import { TodoistApi } from '@doist/todoist-api-typescript'

export default {
  data() {
    return {
      todoist_token: "",
      error_message: ""
    }
  },
  emits: ['complete'],
  methods: {
    set_todoist_token(e) {
      if (this.todoist_token.length == 0) {
        this.error_message = "You must set a token";
        return;
      }
      var todoist = new TodoistApi(this.todoist_token);
      todoist.getTasks({filter: "today"})
        .then((tasks) => {
          console.log("Setting todoist_token to '" + this.todoist_token + "'");
          localStorage.setItem('todoist_token', this.todoist_token);
          this.$emit('complete');
        }).catch((error) => {
          e.target.classList.add('error');
          this.error_message = "Error: " + error;
        });
    },
  },
}
</script>

<template>
  <div id="setToken">
    <div class="row" style="padding-top: 10rem;">
      <h1>Todoist token is not set.</h1>
    </div>
    <div class="row">
      <p v-if="error_message" class="error">{{error_message}}</p>
      <input type="text" v-model="todoist_token">
      <button @click="set_todoist_token">Save token</button>
    </div>
  </div>
</template>

<style>
.error {
  background-color: red;
}

#setToken input {
  width: 100%;
  margin: 1em 2rem;
}
</style>