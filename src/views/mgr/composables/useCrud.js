import { useForm, useModal } from '.'

const ACTIONS = {
  view: '查看',
  edit: '编辑',
  add: '新增',
}

export function useCrud({ name, doCreate, doUpdate, doDelete, refresh, initForm = {} }) {
  const modalAction = ref('')
  const [modalRef, okLoading] = useModal()
  const [modalFormRef, modalForm, validation] = useForm(initForm)

  function handleAdd(row = {}, title) {
    handleOpen({ action: 'add', title, row: { ...initForm, ...row } })
  }
  function handleOpen(options = {}) {
    const { action, row, title, onOk } = options
    modalAction.value = action
    modalForm.value = { ...row }
    modalRef.value?.open({
      ...options,
      async onOk() {
        if (typeof onOk === 'function') {
          return await onOk()
        }
        else {
          return await handleSave()
        }
      },
      title: title ?? (ACTIONS[modalAction.value] || '') + name,
    })
  }

  async function handleSave(action) {
    if (!action && !['edit', 'add'].includes(modalAction.value)) {
      return false
    }
    await validation()
    const actions = {
      add: {
        api: () => doCreate(modalForm.value),
        cb: () => $message.success('新增成功'),
      },
      edit: {
        api: () => doUpdate(modalForm.value),
        cb: () => $message.success('保存成功'),
      },
    }

    action = action || actions[modalAction.value]
    try {
      okLoading.value = true
      const data = await action.api()
      action.cb()
      okLoading.value = false
      data && refresh(data)
    }
    catch (error) {
      console.error(error)
      okLoading.value = false
      return false
    }
  }

  function handleDelete(id, confirmOptions) {
    if (!id && id !== 0) {
      return
    }
    const d = $dialog.warning({
      content: '确定删除？',
      title: '提示',
      positiveText: '确定',
      negativeText: '取消',
      async onPositiveClick() {
        try {
          d.loading = true
          const data = await doDelete(id)
          $message.success('删除成功')
          d.loading = false
          refresh(data, true)
        }
        catch (error) {
          console.error(error)
          d.loading = false
        }
      },
      ...confirmOptions,
    })
  }
  return {
    modalRef,
    modalAction,
    modalForm,
    modalFormRef,
    validation,
    okLoading,
    handleAdd,
    handleOpen,
    handleSave,
    handleDelete,
  }
}
