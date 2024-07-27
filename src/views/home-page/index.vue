<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:28:22
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <AppPage show-footer>
    <div>
      HomePages, {{ userStore.nickName }}
    </div>
  </AppPage>
</template>

<script setup>
import { useUserStore } from '@/store'

const userStore = useUserStore()
</script>
