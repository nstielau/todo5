<script>
export default {
    emits: ["restart"]
}
</script>

<template>
<div class="row">
    <h1>All done, nice work!</h1>
    <img style="width:100%;" src="../assets/hamster.jpeg"/>
    <q-btn class="q-ma-sm"
           color="primary"
           label="Do it again!"
           @click="$emit('restart')"/>
</div>
</template>

<style>
    .row {
        justify-content: center;
    }
</style>