<template>
  <n-modal
    v-model:show="show"
    class="modal-box"
    :style="{ width: modalOptions.width, ...modalOptions }"
    :preset="undefined"
    size="huge"
    :bordered="false"
  >
    <n-card :style="modalOptions.contentStyle" :closable="modalOptions.closable" @close="close()">
      <template #header>
        <header class="modal-header">
          {{ modalOptions.title }}
        </header>
      </template>
      <slot />
      <!-- 底部按钮 -->
      <template #footer>
        <slot v-if="$slots.footer" name="footer" />
        <footer v-else-if="modalOptions.showFooter" class="flex justify-end">
          <n-button v-if="modalOptions.showCancel" @click="handleCancel()">
            {{ modalOptions.cancelText }}
          </n-button>
          <n-button
            v-if="modalOptions.showOk"
            type="primary"
            :loading="modalOptions.okLoading"
            class="ml-20"
            @click="handleOk()"
          >
            {{ modalOptions.okText }}
          </n-button>
        </footer>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup>
const props = defineProps({
  width: {
    type: String,
    default: '800px',
  },
  title: {
    type: String,
    default: '',
  },
  closable: {
    type: Boolean,
    default: true,
  },
  cancelText: {
    type: String,
    default: '取消',
  },
  okText: {
    type: String,
    default: '确定',
  },
  showFooter: {
    type: Boolean,
    default: true,
  },
  showCancel: {
    type: Boolean,
    default: true,
  },
  showOk: {
    type: Boolean,
    default: true,
  },
  modalStyle: {
    type: Object,
    default: () => {},
  },
  contentStyle: {
    type: Object,
    default: () => {},
  },
  onOk: {
    type: Function,
    default: () => {},
  },
  onCancel: {
    type: Function,
    default: () => {},
  },
})

const show = ref(false)
const modalOptions = ref({})

const okLoading = computed({
  get() {
    return !!modalOptions.value?.okLoading
  },
  set(v) {
    if (modalOptions.value) {
      modalOptions.value.okLoading = v
    }
  },
})

// 打开模态框
async function open(options = {}) {
  // 将props和options合并赋值给modalOptions
  modalOptions.value = { ...props, ...options }

  // 将show的值设置为true
  show.value = true
  await nextTick()
}

function close() {
  show.value = false
}

async function handleCancel(data) {
  if (typeof modalOptions.value.onCancel !== 'function') {
    return close()
  }
  try {
    // 调用onCancel函数，传入data参数
    const res = await modalOptions.value.onCancel(data)

    // 如果onCancel函数的返回值不为false，则关闭模态框
    if (res !== false)
      close()
  }
  catch (error) {
    console.error(error)
    okLoading.value = false
  }
}

async function handleOk(data) {
  if (typeof modalOptions.value.onOk !== 'function') {
    return close()
  }
  try {
    const res = await modalOptions.value.onOk(data)
    if (res !== false)
      close()
  }
  catch (error) {
    console.error(error)
    okLoading.value = false
  }
}

defineExpose({
  open,
  close,
  options: modalOptions,
})
</script>
