import { request } from '@/utils'

export default {
  read: (params = {}) => request.get('/user', { params }),
  update: data => request.patch(`/user/${data.id}`, data),
  create: data => request.post('/user', data),
  resetPwd: (id, data) => request.patch(`/user/password/reset/${id}`, data),
  delete: id => request.delete(`/user/${id}`),

  getAllRoles: () => request.get('/role?enable=1'),
}
