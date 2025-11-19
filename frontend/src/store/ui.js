import { reactive } from 'vue'

const ui = reactive({
  proModal: { visible: false, reason: null, need: null, after: null },

  openProModal({ reason = 'reports', need = 'pf', after = null } = {}) {
    this.proModal.visible = true
    this.proModal.reason = reason  
    this.proModal.need = need       
    this.proModal.after = after   
  },

  closeProModal() {
    this.proModal.visible = false
    this.proModal.reason = null
    this.proModal.need = null
    this.proModal.after = null
  }
})

export default ui
