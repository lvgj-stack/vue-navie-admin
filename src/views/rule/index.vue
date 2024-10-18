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
        新增转发规则
      </NButton>
    </template>

    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1200"
      :columns="columns"
      :get-data="api.listRules"
    >
      <MeQueryItem label="转发名" :label-width="60">
        <n-input
          v-model:value="queryItems.ruleName"
          type="text"
          placeholder="请输入转发名称"
          clearable
        />
      </MeQueryItem>

      <MeQueryItem label="排序" :label-width="50">
        <NSelect
          v-model:value="queryItems.orderBy" :options="sortOptions" clearable
        />
      </MeQueryItem>

      <MeQueryItem label="排序方式" :label-width="80">
        <NSelect
          v-model:value="queryItems.asc" :options="ascOptions" clearable
        />
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
          label="转发名"
          path="ruleName"
          :rule="{
            required: true,
            message: '请输入名称',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.ruleName" />
        </n-form-item>
        <n-form-item
          v-if="['editRule', 'add'].includes(modalAction)"
          label="入口"
          path="nodeId"
          :rule="{
            required: true,
          }"
        >
          <NSelect
            v-model:value="modalForm.nodeId"
            placeholder="搜索入口"
            :loading="false"
            :options="dynNodeListRef"
            clearable filterable
            :disabled="modalAction !== 'add'"
            @click="queryNodeList"
          />
        </n-form-item>
        <n-form-item
          label="监听端口"
          path="listenPort"
          :rule="{
            required: true,
          }"
        >
          <NInputNumber v-model:value="modalForm.listenPort" clearable />
        </n-form-item>
        <n-form-item
          v-if="['editRule', 'add'].includes(modalAction)"
          label="出口"
          path="chainId"
        >
          <NSelect
            v-model:value="modalForm.chainId"
            placeholder="搜索出口"
            :loading="false"
            :options="dynChainListRef"
            clearable filterable
            @click="queryChainList"
          />
        </n-form-item>
        <n-form-item
          label="目的地址"
          path="remoteAddr"
          :rule="{
            required: true,
            message: '请输入目的地址',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.remoteAddr" :disabled="!['editRule', 'add'].includes(modalAction)" />
        </n-form-item>
        <n-form-item
          v-if="['editRule', 'add'].includes(modalAction)"
          label="协议"
          path="chainType"
          :rule="{
            required: true,
          }"
        >
          <NSelect v-model:value="modalForm.chainType" :options="protocolType" :disabled="modalAction !== 'add'" />
        </n-form-item>
      </n-form>
    </MeModal>
    <NModal
      v-model:show="showTestRuleModal"
      preset="dialog"
      title="测试结果"
    >
      <template #header>
        <div>测试结果</div>
      </template>
      <h4>入口测试：</h4>
      <div style="display: flex;justify-content: space-between;width: 100%;">
        {{ testResultRef.inboundName }} ====> {{ testResultRef.inboundTo }}
        <span style="font-weight:bold;text-align: right;margin-left: auto;">cost: {{ testResultRef.inboundPing }} ms</span>
      </div>
      <h4>出口测试：</h4>
      <div style="display: flex;justify-content: space-between;width: 100%;">
        {{ testResultRef.outboundName }} ====> {{ testResultRef.outboundTo }}
        <span style="font-weight:bold;text-align: right;margin-left: auto;">cost: {{ testResultRef.outboundPing }} ms</span>
      </div>
    </NModal>
  </CommonPage>
</template>

<script setup>
import { NButton, NInputNumber, NSelect, NTag } from 'naive-ui'
import { h, ref } from 'vue'
import api from './api'
import { formatDateTime } from '@/utils'
import { MeCrud, MeModal, MeQueryItem } from '@/components'
import { useCrud } from '@/composables'

defineOptions({ name: 'UserMgt' })

const $table = ref(null)
/** QueryBar筛选参数（可选） */
const queryItems = ref({})
const showTestRuleModal = ref(false)
const testResultRef = ref(null)

onMounted(() => {
  $table.value?.handleSearch()
})

const protocolType = [
  { label: 'TLS', value: 'TLS' },
  { label: 'TCP', value: 'TCP' },
]
const sortOptions = [
  { label: '名称', value: 'rule_name' },
  { label: '流量', value: 'traffic' },
  { label: '创建时间', value: 'updated_at' },
]

const ascOptions = [
  { label: '降序', value: false },
  { label: '升序', value: true },
]

const dynNodeListRef = ref([])
const nodeListRef = ref([])
const dynChainListRef = ref([])
const chainListRef = ref([])

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
  name: '转发规则',
  initForm: { enable: true },
  doCreate: api.addRule,
  doDelete: api.deleteRule,
  doUpdate: api.update,
  refresh: () => $table.value?.handleSearch(),
})

const columns = [
  {
    title: '转发名',
    key: 'ruleName',
    width: 120,
    ellipsis: { tooltip: true },
  },
  {
    title: '入口节点',
    key: 'node.nodeName',
    width: 120,
    ellipsis: { tooltip: true },
  },
  {
    title: '转发链',
    key: 'chain.chainName',
    width: 120,
    ellipsis: { tooltip: true },
  },
  {
    title: '入口',
    key: 'ip',
    width: 200,
    ellipsis: { tooltip: true },
    render(row) {
      return h(
        NTag,
        { type: 'success' },
        { default: () => `${row.node.ip}:${row.listenPort}` },
      )
    },
  },
  {
    title: '出口',
    key: 'remoteAddr',
    width: 200,
    ellipsis: { tooltip: true },
    render(row) {
      return h(
        NTag,
        { type: 'success' },
        { default: () => `${row.remoteAddr}` },
      )
    },
  },
  {
    title: '转发协议',
    key: 'protocol',
    width: 80,
    ellipsis: { tooltip: true },
    render: ({ protocol }) =>
      h(
        NTag,
        { type: 'success' },
        { default: () => protocol },
      ),
  },
  {
    title: '流量',
    key: 'traffic',
    width: 100,
    ellipsis: { tooltip: true },
    sorter: (row1, row2) => row1.traffic - row2.traffic,
    render: ({ traffic }) =>
      h(
        NTag,
        { type: 'success' },
        { default: () => `${(traffic / 1024 / 1024 / 1024).toFixed(2)} GB` },
      ),
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 180,
    render(row) {
      return h('span', formatDateTime(row.createdAt))
    },
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
            style: 'margin-left: 12px;',
            onClick: () => handleTestRule(row),
          },
          {
            default: () => '测试',
            icon: () => h('i', { class: 'i-fe:tool text-14' }),
          },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            style: 'margin-left: 12px;',
            onClick: () => handleOpen({ action: 'editRule', title: '编辑规则', row: { ...row, chainType: row.protocol }, onOk: onSave }),
          },
          {
            default: () => '编辑规则',
            icon: () => h('i', { class: 'i-fe:edit-3 text-14' }),
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

function queryNodeList() {
  api.listNodes({ pageNo: -1, nodeType: 'inbound' }).then((res) => {
    nodeListRef.value = res.data.pageData.map(item => ({
      label: item.nodeName,
      value: item.id,
    }))
    dynNodeListRef.value = res.data.pageData.map(item => ({
      label: item.nodeName,
      value: item.id,
    }))
  })
}

function queryChainList() {
  api.listChains({ pageNo: -1 }).then((res) => {
    chainListRef.value = res.data.pageData.map(item => ({
      label: item.chainName,
      value: item.id,
    }))
    dynChainListRef.value = res.data.pageData.map(item => ({
      label: item.chainName,
      value: item.id,
    }))
  })
}

function handleTestRule(row) {
  api.testRule(row.id).then((res) => {
    testResultRef.value = res.data
    showTestRuleModal.value = true
  })
}

function onSave() {
  if (modalAction.value === 'editRule') {
    return handleSave({
      api: () => api.modifyRule(modalForm.value),
      cb: () => $message.success('规则编辑成功'),
    })
  }
  handleSave()
}
</script>
