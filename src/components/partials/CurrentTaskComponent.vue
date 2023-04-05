<script>
import dompurify from 'dompurify';
import { marked } from 'marked';

export default {
  props: ['task', 'prompt'],
  computed: {
    parsed_content() {
      return dompurify.sanitize(marked.parse(this.task.content));
    },
    isRecurring() {
      return (this.task.due && this.task.due.isRecurring);
    },
  },
}
</script>

<template>
  <div class="row q-mb-md" id="current_task">
    <div class="col-12">
        {{prompt}}
    	<q-card>
    		<q-badge color="accent" class="float-right" v-if="isRecurring">Recurring <q-icon name="autorenew" /></q-badge>
    		<q-badge v-if="task.project">{{task.project}}</q-badge>
    		<q-card-section style="width:400px" v-html="parsed_content"></q-card-section>
    	</q-card>
    </div>
  </div>
</template>
