<script>
import { Dark } from 'quasar'

import SetTokenComponent from './components/SetTokenComponent.vue'
import InboxReviewComponent from './components/InboxReviewComponent.vue'
import OverdueReviewComponent from './components/OverdueReviewComponent.vue'
import NoDueDateReviewComponent from './components/NoDueDateReviewComponent.vue'
import TodayReviewComponent from './components/TodayReviewComponent.vue'
import NiceWorkComponent from './components/NiceWorkComponent.vue'

export default {
  name: 'Todo5',
  components: {
    SetTokenComponent,
    InboxReviewComponent,
    OverdueReviewComponent,
    NoDueDateReviewComponent,
    TodayReviewComponent,
    NiceWorkComponent
  },
  data() {
    return {
      todoist_token: localStorage.getItem('todoist_token'),
      active_review: 1
    }
  },
  mounted() {
    Dark.set(true)
  },
  methods: {
    reload_todoist_token(e) {
      this.todoist_token = localStorage.getItem('todoist_token');
    },
    next_review() {
      console.log("Review " + this.active_review + " completed.  Moving to next review section")
      this.active_review = this.active_review + 1
      if (this.active_review == 6) {
        this.active_review = 1;
      }
    }
  },
}
</script>

<template>
  <SetTokenComponent v-if="!todoist_token" :key="todoist_token" @complete="reload_todoist_token"/>
    <q-stepper
      v-else
      v-model="active_review"
      ref="stepper"
      flat
      contracted
      color="accent"
      animated
    >
      <q-step
        :name="1"
        title="Inbox Review"
        icon="markunread_mailbox"
        active-color="accent"
        :done="active_review > 1">
        <InboxReviewComponent @complete="next_review" />
      </q-step>

      <q-step
        :name="2"
        title="Overdue Review"
        caption="Optional"
        icon="update"
        active-color="accent"
        :done="active_review > 2">
        <OverdueReviewComponent @complete="next_review" />        
      </q-step>

      <q-step
        :name="3"
        title="No Due Date Review"
        caption="Optional"
        icon="calendar_month"
        active-color="accent"
        :done="active_review > 3">
        <NoDueDateReviewComponent @complete="next_review" />        
      </q-step>      

      <q-step
        :name="4"
        title="Today Review"
        icon="calendar_today"
        active-color="accent"
        :done="active_review > 4">
        <TodayReviewComponent @complete="next_review" />
      </q-step>

      <q-step
        :name="5"
        title="All Done"
        icon="rocket"
        done-icon="rocket"
        active-icon="rocket"
        active-color="accent"
        :done="active_review > 5">
        <NiceWorkComponent @restart="next_review"/>
      </q-step>      
    </q-stepper>
</template>

<style type="text/css">
  .q-stepper--horizontal .q-stepper__step-inner {
    padding: 0 24px;
  }
</style>