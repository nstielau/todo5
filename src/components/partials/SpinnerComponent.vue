<template>
  <div id="spinner" class="row fixed-center" style="justify-content:center;height:300px;width:300px;">
    <div class="col"></div>
    <div class="col-6">
      <q-spinner-gears size="100px" color="accent" />
      <div v-if="completed">{{title}}</div><div v-else class="invisible"></div>
    </div>
    <div class="col"></div>
  </div>
</template>

<script>
export default {
  props : ['completed', 'title'],
  data(){
    return{
      timer : null
    }
  },
}
</script>