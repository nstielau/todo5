<script>
import { TodoistApi } from '@doist/todoist-api-typescript'

import SpinnerComponent from './partials/SpinnerComponent.vue'
import CurrentTaskComponent from './partials/CurrentTaskComponent.vue'
import ReviewHeaderComponent from './partials/ReviewHeaderComponent.vue'

export default {
  data() {
    return {
      tasks: [],
      show_overview: true,
      review_completed: false,
      today: true,
      projects: [],
      current_task_idx: 0,
      complete: false,
      todoist: new TodoistApi(localStorage.getItem('todoist_token'))
    }
  },
  components: {
    CurrentTaskComponent, SpinnerComponent, ReviewHeaderComponent
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
    var projectsById = {};
    this.todoist.getProjects()
      .then((projects) => {
        this.projects = projects;
        for (var i = 0; i < this.projects.length; i++) {
          projectsById[projects[i].id] = projects[i].name;
        }
      }).catch((error) => console.log(error))
    this.todoist.getTasks({filter: "today"})
        .then((tasks) => {
          this.tasks = tasks;
          for (var i = 0; i < this.tasks.length; i++) {
            console.log("TODO: why isn't project setting here?")
            this.tasks[i].project = projectsById[this.tasks[i].projectId]
          }

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
      this.today = true
      if (this.tasks.length - 1 == this.current_task_idx) {
        this.show_overview = true
        this.review_completed = true
      }
      this.current_task_idx = this.current_task_idx + 1
    },
  }
}
</script>

<template>
<div v-if="current_task">
  <div v-if="show_overview">
    <ReviewHeaderComponent :total="tasks.length" :current_idx="current_task_idx" title="Review Today's Tasks"/>
    <ul>
        <li class="q-ma-sm" v-for="task in tasks">
          {{task.content}}
        </li>
    </ul>
    <div class="col-12">
      <div class="row q-py-md button-row">
        <q-btn color="positive" label="Let's review" @click="this.show_overview = false"/>
      </div>
    </div>
  </div>

  <div v-else>
    <div v-if="today">
      <ReviewHeaderComponent :total="tasks.length" :current_idx="current_task_idx" title="Review Today's Tasks"/>
      <q-slide-item @left="next_task()" @right="today=false" :key="current_task_idx">
        <template v-slot:left>Yes<q-icon name="done" /></template>
        <template v-slot:right>No<q-icon name="alarm" /></template>
        <CurrentTaskComponent :task="current_task" prompt="Are we gonna get to it today?"/>
      </q-slide-item>
    </div>

    <div v-else>
      <ReviewHeaderComponent :total="tasks.length" :current_idx="current_task_idx" title="Review Today's Tasks"/>
      <CurrentTaskComponent :task="current_task" prompt="Then when?"/>
      <div class="col-12">
        <div class="row q-py-md button-row">
          <q-btn color="primary" label="Do today" @click="next_task()"/>
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
  </div>

</div>

<div v-else-if="tasks.length > 0">
  <ReviewHeaderComponent :total="tasks.length" :current_idx="current_task_idx" title="Review Today's Tasks"/>
  <ul>
      <li class="q-ma-sm" v-for="task in tasks">
        {{task.content}}
      </li>
  </ul>
  <div class="col-12">
    <div class="row q-py-md button-row">
      <q-btn color="positive" label="All done!" @click="this.$emit('complete');"/>
    </div>
  </div>
</div>

<SpinnerComponent v-else title="No Today Tasks To Review!" :completed="complete" />
</template>

<style type="text/css">
  li {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>