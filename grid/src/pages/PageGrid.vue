<script lang="ts" setup>
  import GridRenderer from '@/content/view/grid/GridRenderer.vue'
  import InputRenderer from '@/content/view/InputGlobalRenderer.vue'
  import ModuleLoader from '@/common/core/module-loader'
  import DataStoreGist from '@/common/data/data-store-gist'
  import type { ComponentRef } from '@/common/utils/types'
  import Grid from '@/modules/grid'
  import TimeStages from '@/modules/time-stages'
  import TodoList from '@/modules/todo-list'
  import Yggdrasil from '@/modules/yggdrasil'
  import { ref, type Ref } from 'vue'

  const props = defineProps<{ pageControl: Ref<boolean> }>()

  const gridRenderer = ref() as ComponentRef<typeof GridRenderer>

  const _ = ModuleLoader.init()
    .run(Grid, { gridRenderer })
    .run(TodoList, { dataStore: await DataStoreGist.make('grid.json') })
    .run(TimeStages, {})
    .run(Yggdrasil, { pageControl: props.pageControl }).paramSpace
</script>

<template>
  <GridRenderer ref="gridRenderer" :bind="_.gridUpdater" :columns="_.columns" :rows="_.rows" />
  <InputRenderer
    :rows="_.rows"
    @onNewEntry="
      _.entryCreationContext.make(null)(_.memoryState.addEntry, { entry: { value: $event } })
    "
  />
</template>

<style></style>
