<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:29:43
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage back>
    <template #title-suffix>
      <NTag class="ml-12" type="warning">
        {{ route.query.roleName }}
      </NTag>
    </template>
    <template #action>
      <div class="flex items-center">
        <NButton type="error" :disabled="!userIds.length" @click="handleBatchRemove()">
          <i v-if="userIds.length" class="i-material-symbols:delete-outline mr-4 text-18" />
          批量取消授权
        </NButton>
        <NButton type="primary" class="ml-12" :disabled="!userIds.length" @click="handleBatchAdd()">
          <i v-if="userIds.length" class="i-material-symbols:delete-outline mr-4 text-18" />
          批量授权
        </NButton>
      </div>
    </template>
    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1200"
      :columns="columns"
      :get-data="api.getAllUsers"
      @on-checked="onChecked"
    >
      <MeQueryItem label="用户名" :label-width="50">
        <NInput
          v-model:value="queryItems.username"
          placeholder="请输入用户名"
          type="text"
          clearable
        />
      </MeQueryItem>
      <MeQueryItem label="性别" :label-width="50">
        <NSelect v-model:value="queryItems.gender" clearable :options="genders" />
      </MeQueryItem>
      <MeQueryItem label="状态" :label-width="50">
        <NSelect
          v-model:value="queryItems.enable"
          clearable
          :options="[
            { label: '启用', value: 1 },
            { label: '停用', value: 0 },
          ]"
        />
      </MeQueryItem>
    </MeCrud>
  </CommonPage>
</template>

<script setup>
import { NAvatar, NButton, NInput, NSelect, NSwitch, NTag } from 'naive-ui'
import api from './api'
import CommonPage from '@/components/common/CommonPage.vue'
import { MeCrud, MeQueryItem } from '@/components'
import { formatDateTime } from '@/utils'

defineOptions({ name: 'MgrRoleUser' })
const route = useRoute()
const queryItems = ref({})

const $table = ref(null)
/** QueryBar筛选参数（可选） */

const genders = [
  {
    label: '男',
    value: 1,
  },
  {
    label: '女',
    value: 2,
  },
]

onMounted(() => {
  $table.value?.handleSearch()
})

const columns = [
  { type: 'selection', fixed: 'left' },
  {
    title: '头像',
    key: 'avatar',
    width: 80,
    render: ({ avatar }) =>
      h(NAvatar, { size: 'medium', src: avatar }),
  },
  {
    title: '用户名',
    key: 'username',
    width: 150,
    ellipsis: { tooltip: true },
  },
  {
    title: '角色',
    key: 'roles',
    width: 200,
    ellipsis: { tooltip: true },
    render: ({ roles }) => {
      if (roles?.length) {
        return roles.map((item, index) =>
          h(
            NTag,
            { type: 'success', style: index > 0 ? 'margin-left: 8px' : '' },
            { default: () => item.name },
          ),
        )
      }
      return '暂无角色'
    },
  },
  {
    title: '性别',
    key: 'gender',
    width: 80,
    render: ({ gender }) => genders.find(item => gender === item.value)?.label ?? '',
  },
  {
    title: '创建时间',
    key: 'createDate',
    width: 180,
    render(row) {
      return h('span', formatDateTime(row.createTime))
    },
  },
  {
    title: '状态',
    key: 'enable',
    width: 80,
    render: ({ enable }) =>
      h(
        NSwitch,
        {
          size: 'small',
          rubberBand: false,
          value: enable,
        },
        {
          checked: () => '启用',
          unchecked: () => '停用',
        },
      ),

  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    align: 'right',
    fixed: 'right',
    hideInExcel: true,
    render(row) {
      return row.roles?.some(item => item.id === +route.params.roleId)
        ? h(
          NButton,
          {
            size: 'small',
            type: 'error',
            secondary: true,
            onclick: () => handleBatchRemove([row.id]),
          },
          {
            default: () => '取消授权',
            icon: () => h('i', { class: 'i-material-symbols:delete-outline text-14' }),
          },
        )
        : h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            secondary: true,
            onclick: () => handleBatchAdd([row.id]),
          },
          {
            default: () => '授权',
            icon: () => h('i', { class: 'i-line-md:confirm-circle text-14' }),
          },
        )
    },
  },
]

const userIds = ref([])
function onChecked(rowKeys) {
  userIds.value = rowKeys || []
}

function handleBatchRemove(ids = userIds.value) {
  const roleId = route.params.roleId
  $message.success(roleId)
  $message.success(ids)
}

function handleBatchAdd(ids = userIds.value) {
  const roleId = route.params.roleId
  $message.success(roleId)
  $message.success(ids)
}
</script>
