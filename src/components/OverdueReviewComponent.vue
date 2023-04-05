<script>
import { TodoistApi } from '@doist/todoist-api-typescript'

import CurrentTaskComponent from './CurrentTaskComponent.vue'

export default {
  data() {
    return {
      tasks: [],
      projects: [],
      complete: false,
      current_task_idx: 0
    }
  },
  components: {
    CurrentTaskComponent
  },
  computed: {
    current_task() {
      return this.tasks[this.current_task_idx];
    },
    progress() {
      return (this.current_task_idx+1)/this.tasks.length*100;
    }
  },
  mounted() {
    var todoist = new TodoistApi(localStorage.getItem('todoist_token'));
    var projectsById = {};
    todoist.getProjects()
      .then((projects) => {
        this.projects = projects;
        for (var i = 0; i < projects.length; i++) {
          projectsById[projects[i].id] = projects[i].name;
        }
      }).catch((error) => console.log(error))
    todoist.getTasks({filter: "overdue"})
      .then((tasks) => {
        this.tasks = tasks;
        for (var i = 0; i < this.tasks.length; i++) {
          this.tasks[i].project = projectsById[this.tasks[i].projectId]
        }
        if (!this.current_task) {
          console.log("No overdue tasks to review.");
          this.complete = true;
          setTimeout(() => this.$emit('complete'), 1000);
        }
      }).catch((error) => console.log(error))
  },
  emits: ['complete'],
  methods: {
    set_due_date(due_string) {
      const task_id = this.current_task.id;
      var todoist = new TodoistApi(localStorage.getItem('todoist_token'));
      todoist.updateTask(this.current_task.id, { due_string: due_string })
          .then((isSuccess) => {
            this.next_task();
            todoist.addComment({
                taskId: this.task_id,
                content: "Rescheduled from " + new Date().toISOString().split('T')[0],
            }).catch((error) => console.log(error))
          }).catch((error) => console.log(error))
    },
    close_task() {
      var todoist = new TodoistApi(localStorage.getItem('todoist_token'));
      todoist.closeTask(this.current_task.id).catch((error) => console.log(error))
      // Assume API call completes for speedy UX
      this.next_task();
    },
    next_task() {
      if (this.tasks.length == this.current_task_idx + 1) {
        console.log("Reviewed " + this.tasks.length + " overdue tasks.");
        this.$emit('complete');
      }
      this.current_task_idx = this.current_task_idx + 1;
    },
  }
}
</script>

<template>
<div v-if="current_task">
  <div class="row">
    <div class="col-9">
    <h1>
      Review Overdue Tasks
      <small>{{tasks.length}} Overdue Tasks</small>
    </h1>
    </div>
    <div class="col">
      <q-circular-progress
        show-value
        reverse
        :value="progress"
        size="75px"
        :thickness="0.6"
        font-size="15px"
        color="accent"
        center-color="grey-9"
        class="q-ma-md"
      >{{current_task_idx+1}}/{{tasks.length}}
    </q-circular-progress>
    </div>
  </div>
  <div class="row q-mb-md" id="current_task">
    <div class="col-12">
      <p>When should we do this?</p>
      <CurrentTaskComponent :task="current_task" />
    </div>
  </div>
  <div>
    <div class="row q-py-md button-row">
      <q-btn color="primary" label="Do today" @click="set_due_date('today')"/>
      <q-btn color="primary" label="Do next week" @click="set_due_date('next week')"/>
      <q-btn color="primary" label="In 7 days" @click="set_due_date('in 7 days')"/>
    </div>
    <div class="row q-py-md button-row">
      <q-btn color="positive" label="Done" @click="close_task()"/>
      <q-btn color="warning" label="Ack All" @click="$emit('complete')"/>
    </div>
  </div>
</div>
<SpinnerComponent title="No Overdue Tasks To Review!" completed="complete" v-else/>
</template>
