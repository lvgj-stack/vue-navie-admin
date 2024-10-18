<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:29:56
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage>
    <template #action>
      <NButton type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        新增转发链
      </NButton>
    </template>

    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1200"
      :columns="columns"
      :get-data="api.listChains"
    >
      <MeQueryItem label="服务器名" :label-width="60">
        <n-input
          v-model:value="queryItems.nodeName"
          type="text"
          placeholder="请输入服务器名称"
          clearable
        />
      </MeQueryItem>

      <MeQueryItem label="类型" :label-width="50">
        <NSelect v-model:value="queryItems.nodeType" clearable :options="protocolType" />
      </MeQueryItem>
    </MeCrud>

    <MeModal ref="modalRef" width="520px">
      <n-form
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="80"
        :model="modalForm"
        :disabled="modalAction === 'view'"
      >
        <n-form-item
          v-if="modalAction === 'add'"
          label="节点" path="nodeId"
          :rule="{
            required: true,
          }"
        >
          <NSelect
            v-model:value="modalForm.nodeId"

            placeholder="搜索节点"
            :loading="addLoadingRef"
            :options="dynProtocolTypeRef"
            clearable filterable
            @search="queryNode"
          />
        </n-form-item>
        <n-form-item
          label="链名称"
          path="name"
          :rule="{
            required: true,
            message: '请输入名称',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.name" :disabled="modalAction !== 'add'" />
        </n-form-item>

        <n-form-item
          v-if="modalAction === 'add'"
          label="协议" path="chainType"
          :rule="{
            required: true,
          }"
        >
          <NSelect v-model:value="modalForm.chainType" :options="protocolType" />
        </n-form-item>
        <n-form-item
          label="监听端口"
          path="port"
          :rule="{
            required: true,
          }"
        >
          <NInputNumber v-model:value="modalForm.port" clearable />
        </n-form-item>
      </n-form>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NButton, NInputNumber, NSelect, NTag } from 'naive-ui'
import api from './api'
import { formatDateTime } from '@/utils'
import { MeCrud, MeModal, MeQueryItem } from '@/components'
import { useCrud } from '@/composables'

defineOptions({ name: 'UserMgt' })

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})

const addLoadingRef = ref(false)

onMounted(() => {
  $table.value?.handleSearch()
})

const protocolType = [
  { label: 'TLS', value: 'TLS' },
  { label: 'TCP', value: 'TCP' },
]

const protocolTypeRef = ref([])
const dynProtocolTypeRef = ref([])
api.listNodes({ pageNo: -1 }).then((res) => {
  protocolTypeRef.value = res.data.pageData.map(item => ({
    label: item.node_name,
    value: item.id,
  }))
  dynProtocolTypeRef.value = res.data.pageData.map(item => ({
    label: item.node_name,
    value: item.id,
  }))
})

const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleDelete,
  handleOpen,
  handleSave,
} = useCrud({
  name: '转发链',
  initForm: { enable: true },
  doCreate: api.addChain,
  doDelete: api.deleteChain,
  doUpdate: api.update,
  refresh: () => $table.value?.handleSearch(),
})

const columns = [
  {
    title: '链路名称',
    key: 'chain_name',
    width: 160,
    ellipsis: { tooltip: true },
  },
  {
    title: '创建时间',
    key: 'created_at',
    width: 180,
    render(row) {
      return h('span', formatDateTime(row.created_at))
    },
  },
  { title: 'IP地址', key: 'ip', width: 180, ellipsis: { tooltip: true } },
  {
    title: '监听端口',
    key: 'port',
    width: 80,
    ellipsis: { tooltip: true },
    render(row) {
      return h(
        NTag,
        { type: 'success' },
        { default: () => row.port },
      )
    },
  },
  {
    title: '转发协议',
    key: 'protocol',
    width: 100,
    ellipsis: { tooltip: true },
    render: ({ protocol }) =>
      h(
        NTag,
        { type: 'success' },
        { default: () => protocol },
      ),
  },
  {
    title: '节点',
    key: 'node.node_name',
    width: 80,
    ellipsis: { tooltip: true },
  },
  {
    title: '操作',
    key: 'actions',
    width: 320,
    align: 'right',
    fixed: 'right',
    hideInExcel: true,
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            secondary: true,
            onClick: () => handleOpenRolesSet(row),
          },
          {
            default: () => '分配角色',
            icon: () => h('i', { class: 'i-carbon:user-role text-14' }),
          },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            style: 'margin-left: 12px;',
            onClick: () => handleOpen({ action: 'reset', title: '重置密码', row, onOk: onSave }),
          },
          {
            default: () => '重置密码',
            icon: () => h('i', { class: 'i-radix-icons:reset text-14' }),
          },
        ),

        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            style: 'margin-left: 12px;',
            onClick: () => handleDelete(row.id),
          },
          {
            default: () => '删除',
            icon: () => h('i', { class: 'i-material-symbols:delete-outline text-14' }),
          },
        ),
      ]
    },
  },
]

function queryNode(query) {
  addLoadingRef.value = true
  dynProtocolTypeRef.value = protocolTypeRef.value.filter(
    item => ~item.label.indexOf(query),
  )
  addLoadingRef.value = false
}

function handleOpenRolesSet(row) {
  const roleIds = row.roles.map(item => item.id)
  handleOpen({
    action: 'setRole',
    title: '分配角色',
    row: { id: row.id, username: row.username, roleIds },
    onOk: onSave,
  })
}

function onSave() {
  if (modalAction.value === 'setRole') {
    return handleSave({
      api: () => api.update(modalForm.value),
      cb: () => $message.success('分配成功'),
    })
  }
  else if (modalAction.value === 'reset') {
    return handleSave({
      api: () => api.resetPwd(modalForm.value.id, modalForm.value),
      cb: () => $message.success('密码重置成功'),
    })
  }
  handleSave()
}
</script>
