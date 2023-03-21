<script>
import { TodoistApi } from '@doist/todoist-api-typescript'

import CurrentTaskComponent from './CurrentTaskComponent.vue'

export default {
  data() {
    return {
      today_tasks: [],
      projects: [],
      current_task_idx: 0,
      complete: false,
      todoist: new TodoistApi(localStorage.getItem('todoist_token'))
    }
  },
  components: {
    CurrentTaskComponent
  },
  computed: {
    current_task() {
      return this.today_tasks[this.current_task_idx];
    },
    progress() {
      return (this.current_task_idx+1)/this.today_tasks.length*100;
    }
  },
  mounted() {
    this.todoist.getProjects()
    .then((projects) => {
      this.projects = projects;
    }).catch((error) => console.log(error))

    this.todoist.getTasks({filter: "today"})
        .then((tasks) => {
          this.today_tasks = tasks;
          if (!this.current_task) {
            console.log("No Today tasks to review");
            this.complete = true;
            setTimeout(() => this.$emit('complete'), 1000);
          }
        }).catch((error) => console.log(error))
  },
  emits: ['complete'],
  methods: {
    set_due_date(due_string) {
      const task_id = this.current_task.id;
      this.todoist.updateTask(this.current_task.id, { due_string: due_string })
        .then((isSuccess) => {
          this.todoist.addComment({
              taskId: task_id,
              content: "Rescheduled from " + new Date().toISOString().split('T')[0],
          });
        })
        .catch((error) => console.log(error))
      // Assume API call completes for UX
      this.next_task();
    },
    close_task() {
      this.todoist.closeTask(this.current_task.id)
        .then((isSuccess) => {
          console.log(isSuccess)
          this.next_task();
        }).catch((error) => console.log(error))
    },
    next_task() {
      if (this.today_tasks.length - 1 == this.current_task_idx) {
        this.$emit('complete');
      }
      this.current_task_idx = this.current_task_idx + 1
    },
    findProjectNameById(project_id) {
      console.log("Finding name for project " + project_id)
      for (var i = 0; i < this.projects.length; i++) {
        if (this.projects[i].id == project_id) {
          return this.projects[i].name;
        }
      }
      return undefined;
    }
  }
}
</script>

<template>
<div v-if="current_task">
  <div class="row">
    <div class="col-9">
      <h1>
        Review Today's Tasks
        <small>{{today_tasks.length}} Tasks for Today</small>
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
      >{{current_task_idx+1}}/{{today_tasks.length}}
    </q-circular-progress>
    </div>
  </div>
  <div class="row q-mb-md" id="current_task">
    <div class="col-12">
      <p>Are we gonna get to it today?</p>
      <CurrentTaskComponent
        :content="current_task.content"
        :isRecurring="isRecurring"
        :project="findProjectNameById(current_task.projectId)"/>
    </div>
  </div>
  <div class="col-12">
    <div class="row q-py-md button-row">
      <q-btn color="primary" label="Do today" @click="this.next_task"/>
      <q-btn color="primary" label="Do tomorrow" @click="set_due_date('tomorrow')"/>
    </div>
    <div class="row q-py-md button-row">
      <q-btn color="primary" label="Do next week" @click="set_due_date('next week')"/>
      <q-btn color="primary" label="In 7 days" @click="set_due_date('in 7 days')"/>
    </div>
    <div class="row q-py-md button-row">
      <q-btn color="positive" label="Done" @click="close_task()"/>
      <q-btn color="warning" label="Ack All" @click="$emit('complete')"/>
    </div>
  </div>
</div>
<div id="spinner" class="row fixed-center" style="justify-content:center;height:300px;width:300px;" v-else>
  <div class="col"></div>
  <div class="col-6">
    <q-spinner-gears size="100px" color="accent" />
    <div v-if="complete">No Today Tasks To Review!</div><div v-else class="invisible"></div>
  </div>
  <div class="col"></div>
</div>
</template>
