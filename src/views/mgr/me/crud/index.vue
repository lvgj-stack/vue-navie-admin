<template>
  <AppCard v-if="$slots.default" bordered bg="#fafafc dark:black" class="mb-30 min-h-60 rounded-4">
    <form class="flex justify-between p-16" @submit.prevent="handleSearch()">
      <n-scrollbar x-scrollable>
        <n-space :wrap="!expand || isExpanded" :size="[32, 16]" class="p-10">
          <slot />
        </n-space>
      </n-scrollbar>
      <div class="flex-shrink-0 p-10">
        <NButton ghost type="primary" @click="handleReset">
          <i class="i-fe:rotate-ccw mr-4" />
          重置
        </NButton>
        <NButton attr-type="submit" type="primary" class="ml-20">
          <i class="i-fe:search mr-4" />
          搜索
        </NButton>
      </div>
    </form>
  </AppCard>
  <NDataTable
    :remote="remote"
    :loading="loading"
    :scroll-x="scrollX"
    :columns="columns"
    :data="tableData"
    :row-key="(row) => row[rowKey]"
    :pagination="isPagination ? pagination : false"
    @update:checked-row-keys="onChecked"
    @update:page="onPageChange"
  />
</template>

<script setup>
import { NButton, NDataTable } from 'naive-ui'

const props = defineProps({
  /**
   * @remote true: 后端分页  false： 前端分页
   */
  remote: {
    type: Boolean,
    default: true,
  },
  /**
   * @isPagination 是否分页
   */
  isPagination: {
    type: Boolean,
    default: true,
  },
  scrollX: {
    type: Number,
    default: 1200,
  },
  rowKey: {
    type: String,
    default: 'id',
  },
  columns: {
    type: Array,
    required: true,
  },
  /** queryBar中的参数 */
  queryItems: {
    type: Object,
    default() {
      return {}
    },
  },
  /**
   * ! 约定接口入参出参
   * 分页模式需约定分页接口入参
   *    @pageSize 分页参数：一页展示多少条，默认10
   *    @pageNo   分页参数：页码，默认1
   * 需约定接口出参
   *    @pageData 分页模式必须,非分页模式如果没有pageData则取上一层data
   *    @total    分页模式必须，非分页模式如果没有total则取上一层data.length
   */
  getData: {
    type: Function,
    required: true,
  },
  /** 是否支持展开 */
  expand: Boolean,
})

const emit = defineEmits(['update:queryItems', 'onChecked', 'onDataChange'])
const loading = ref(false)
const initQuery = { ...props.queryItems }
const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  prefix({ itemCount }) {
    return `共 ${itemCount} 条数据`
  },
})

async function handleQuery() {
  try {
    loading.value = true
    let paginationParams = {}
    if (props.isPagination && props.remote) {
      paginationParams = { pageNo: pagination.page, pageSize: pagination.pageSize }
    }
    const { data } = await props.getData({
      ...props.queryItems,
      ...paginationParams,
    })
    tableData.value = data?.pageData || data
    pagination.itemCount = data.total ?? data.length
    if (pagination.itemCount && !tableData.value.length && pagination > 1) {
      onPageChange(pagination.page - 1)
    }
  }
  catch (error) {
    console.error(error)
    tableData.value = []
    pagination.itemCount = 0
  }
  finally {
    emit('onDataChange', tableData.value)
    loading.value = false
  }
}

async function handleReset() {
  const queryItems = { ...props.queryItems }
  for (const key in queryItems) {
    queryItems[key] = null
  }
  emit('update:queryItems', { ...queryItems, ...initQuery })
  await nextTick()
  pagination.page = 1
  handleQuery()
}

function onPageChange(currentPage) {
  pagination.page = currentPage
  if (props.remote) {
    handleQuery()
  }
}

function onChecked(rowKeys) {
  if (props.columns.some(item => item.type === 'selection')) {
    emit('onChecked', rowKeys)
  }
}

function handleSearch(keepCurrentPage = false) {
  if (keepCurrentPage) {
    handleQuery()
  }
  else {
    onPageChange(1)
  }
}

defineExpose({
  handleReset,
  handleSearch,
})
</script>
