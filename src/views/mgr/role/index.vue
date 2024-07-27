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
      <NButton type="primary" @click="handleAdd()">
        <i class="i-material-symbols:add mr-4 text-18" />
        新增角色
      </NButton>
    </template>
    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1200"
      :columns="columns"
      :get-data="api.read"
    >
      <MeQueryItem label="角色名" label-width="50">
        <NInput type="text" placeholder="请输入角色名" clearable />
      </MeQueryItem>
      <MeQueryItem label="状态" label-width="50">
        <NSelect
          clearable
          :options="[
            { label: '启用', value: 1 },
            { label: '停用', value: 0 },
          ]"
        />
      </MeQueryItem>
    </MeCrud>
    <MeModal
      ref="modalRef" width="520px"
    >
      <NForm
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="80"
        :model="modalForm"
      >
        <NFormItem
          label="角色名"
          path="name"
          :rule="{
            required: true,
            message: '请输入角色名',
            trigger: ['input', 'blur'],
          }"
        >
          <NInput v-model:value="modalForm.name" />
        </NFormItem>
        <NFormItem
          label="角色编码"
          path="code"
          :rule="{
            required: true,
            message: '请输入角角色编码',
            trigger: ['input', 'blur'],
          }"
        >
          <NInput v-model:value="modalForm.code" :disabled="modalAction !== 'add'" />
        </NFormItem>
        <NFormItem
          label="权限"
          path="permissionIds"
        >
          <NTree
            key-field="id"
            label-field="name"
            :selectable="false"
            :data="permissionTree"
            :checked-keys="modalForm.permissionIds"
            :on-update:checked-keys="(keys) => (modalForm.permissionIds = keys)"

            checkable check-on-click default-expand-all
            class="cus-scroll max-h-200 w-full"
          />
        </NFormItem>
        <NFormItem label="状态" path="enable">
          <NSwitch v-model:value="modalForm.enable">
            <template #checked>
              启用
            </template>
            <template #unchecked>
              停用
            </template>
          </NSwitch>
        </NFormItem>
      </NForm>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NButton, NForm, NFormItem, NInput, NSelect, NSwitch, NTree } from 'naive-ui'
import { onMounted } from 'vue'
import api from './api'
import { MeCrud, MeModal, MeQueryItem } from '@/components'
import { useCrud } from '@/composables'

defineOptions({ name: 'RoleManager' })

const router = useRouter()
const $table = ref(null)
const queryItems = ref({})
onMounted(() => {
  $table.value?.handleSearch()
})

const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleEdit,
  handleDelete,
} = useCrud({
  name: '角色',
  doCreate: api.create,
  doDelete: api.delete,
  doUpdate: api.update,
  initForm: { enable: true },
  refresh: (_, keepCurrentPage) => $table.value?.handleSearch(keepCurrentPage),
})

const permissionTree = ref([])
api.getAllPermissionTree().then(({ data = [] }) => (permissionTree.value = data))

const columns = [
  { title: '角色名', key: 'name' },
  { title: '角色编码', key: 'code' },
  {
    title: '状态',
    key: 'enable',
    render: row =>
      h(
        NSwitch,
        {
          size: 'small',
          rubberBand: false,
          value: row.enable,
          loading: !!row.enableLoading,
          disabled: row.code === 'SUPER_ADMIN',
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
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            secondary: true,
            onClick: () =>
              router.push({ path: `/mgr/role/user/${row.id}`, query: { roleName: row.name } }),
          },
          {
            default: () => '分配用户',
            icon: () => h('i', { class: 'i-fe:user-plus text-14' }),
          },
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            disabled: row.code === 'SUPER_ADMIN',
            style: 'margin-left: 12px',
            onclick: () => handleEdit(row),
          },
          {
            default: () => '编辑',
            icon: () => h('i', { class: 'i-fe:edit text-14' }),
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
    $message.error(error)
    row.enableLoading = false
  }
}
</script>
