<script>
import dompurify from 'dompurify';
import { marked } from 'marked';

export default {
  props: ['project', 'isRecurring', 'content'],
  computed: {
    parsed_content() {
      return dompurify.sanitize(marked.parse(this.content));
    }
  },
}
</script>

<template>
	<q-card>
		<q-badge color="accent" class="float-right" v-if="isRecurring">Recurring <q-icon name="autorenew" /></q-badge>
		<q-badge>{{project}}</q-badge>
		<q-card-section style="width:400px" v-html="parsed_content"></q-card-section>
	</q-card>
</template>
