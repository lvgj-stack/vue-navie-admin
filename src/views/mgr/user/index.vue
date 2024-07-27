<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:28:22
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <CommonPage>
    <template #action>
      <NButton type="primary" @click="handleAdd">
        <i class="i-material-symbols:add mr-4 text-18" />
        创建新用户
      </NButton>
    </template>
    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1200"
      :columns="columns"
      :get-data="api.read"
    >
      <MeQueryItem
        label="用户名"
        :label-width="50"
      >
        <NInput v-model:value="queryItems.userName" type="text" placeholder="请输入用户名" clearable />
      </MeQueryItem>
      <MeQueryItem
        label="性别"
        :label-width="50"
      >
        <NSelect v-model:value="queryItems.gender" clearable :options="genders" />
      </MeQueryItem>
      <MeQueryItem
        label="状态"
        :label-width="50"
      >
        <NSelect
          v-model:value="queryItems.enable" clearable :options="[
            { label: '启用', value: 1 },
            { label: '停用', value: 0 },
          ]"
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
        <NFormItem
          label="用户名"
          path="username"
          :rule="{
            required: true,
            message: '请输入用户名',
            trigger: ['input', 'blur'],
          }"
        >
          <NInput v-model:value="modalForm.username" :disabled="modalAction !== 'add'" />
        </NFormItem>
        <NFormItem
          v-if="['add', 'reset'].includes(modalAction)"
          :label="modalAction === 'reset' ? '重置密码' : '初始密码'"
          path="password"
          :rule="{
            required: true,
            message: '请输入密码',
            trigger: ['input', 'blur'],
          }"
        >
          <NInput v-model:value="modalForm.password" />
        </NFormItem>
        <NFormItem
          v-if="['add', 'setRole'].includes(modalAction)"
          label="角色"
          path="roleIds"
        >
          <NSelect
            v-model:value="modalForm.roleIds"
            :options="roles"
            label-field="name"
            value-field="id"
            clearable
            filterable
            multiple
          />
        </NFormItem>
        <NFormItem v-if="modalAction === 'add'" label="状态" path="enable">
          <NSwitch v-model:value="modalForm.enable">
            <template #checked>
              启用
            </template>
            <template #unchcked>
              停用
            </template>
          </NSwitch>
        </NFormItem>
      </n-form>
      <n-alert v-if="modalAction === 'add'" type="warning" closable>
        详细信息需由用户本人补充修改
      </n-alert>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NAvatar, NButton, NFormItem, NInput, NSelect, NSwitch, NTag } from 'naive-ui'
import { onMounted } from 'vue'
import { MeCrud, MeModal, MeQueryItem } from '../me'
import api from './api'
import { useCrud } from '@/views/mgr/composables'
import { formatDateTime } from '@/utils'

const queryItems = ref ({})
const $table = ref(null)
const genders = [
  { label: '男', value: 1 },
  { label: '女', value: 2 },
]

const roles = ref({})
api.getAllRoles().then(({ data = {} }) => (roles.value = data))

onMounted(() => {
  $table.value?.handleSearch()
})

const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleOpen,
  handleDelete,
  handleSave,
} = useCrud({
  name: '用户',
  initForm: { enable: true },
  doCreate: api.create,
  doUpdate: api.update,
  doDelete: api.delete,
  refresh: () => $table.value?.handleSearch(),
})

const columns = [
  {
    title: '头像',
    key: 'avatar',
    width: 80,
    render: ({ avatar }) =>
      h(NAvatar, {
        size: 'medium',
        src: avatar,
      }),
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
          ))
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
    title: '邮箱',
    key: 'email',
    width: 150,
    ellipsis: { tooltip: true },
  },
  {
    title: '创建时间',
    key: 'createDate',
    width: 180,
    render: row => h('span', formatDateTime(row.createTime)),
  },
  {
    title: '状态',
    key: 'enable',
    width: 120,
    render: row => h(
      NSwitch,
      {
        size: 'small',
        rubberBand: false,
        value: row.enable,
        loading: !!row.enableLoading,
        onUpdateValue: () => handleEnable(row),
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
            style: 'margin-left: 12px',
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
            style: 'margin-left: 12px',
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

async function handleEnable(row) {
  row.enableLoading = true
  try {
    await api.update({ id: row.id, enable: !row.enable })
    row.enableLoading = false
    $message.success('操作成功')
    $table.value?.handleSearch()
  }
  catch (error) {
    console.error(error)
    row.enableLoading = false
  }
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
      cb: () => $message.success('重置密码成功'),
    })
  }
  handleSave()
}
</script>
