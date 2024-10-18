/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/05 21:29:51
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import { request } from '@/utils'

export default {
  create: data => request.post('/user', data),
  read: (params = {}) => request.get('/user', { params }),
  update: data => request.patch(`/user/${data.id}`, data),
  delete: id => request.delete(`/user/${id}`),
  resetPwd: (id, data) => request.patch(`/user/password/reset/${id}`, data),

  getAllRoles: () => request.get('/role?enable=1'),

  listNodes: data => request.post(`/stander/node?Action=ListNodes`, data),
  listChains: data => request.post(`/stander/chain?Action=ListChains`, data),

  deleteRule: data => request.post(`/stander/rule?Action=DeleteRule`, { ID: data }),
  testRule: data => request.post(`/stander/rule?Action=TestRule`, { ID: data }),
  listRules: data => request.post(`/stander/rule?Action=ListRules`, data),
  addRule: data => request.post(`/stander/rule?Action=AddRule`, data),
  modifyRule: data => request.post(`/stander/rule?Action=ModifyRule`, { ID: data.id, RuleName: data.ruleName, ListenPort: data.listenPort, ChainId: data.chainId, RemoteAddr: data.remoteAddr }),
}
