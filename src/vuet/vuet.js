import Vue from 'vue'
import Vuet from 'vuet'
import utils from 'utils'
import http from 'http'
import VuetScroll from 'vuet-scroll'
import VuetRoute from 'vuet-route'

Vue
  .use(Vuet)
  .use(VuetScroll)

Vuet
  .rule('route', VuetRoute)

export default new Vuet({
  pathJoin: '-',
  modules: {
    user: {
      modules: {
        self: {
          data () {
            return JSON.parse(localStorage.getItem('vue_cnode_self')) || {
              avatar_url: null,
              id: null,
              loginname: null,
              success: false
            }
          },
          async login (accesstoken) {
            const res = await http.post(`/accesstoken`, { accesstoken })
            if (typeof res === 'object' && res.success) {
              this.state = res
              localStorage.setItem('vue_cnode_self', JSON.stringify(res))
              localStorage.setItem('vue_cnode_accesstoken', accesstoken)
            }
            return res
          },
          signout () {
            localStorage.removeItem('vue_cnode_self')
            localStorage.removeItem('vue_cnode_accesstoken')
            this.reset()
            this.app.$router.replace('/')
          }
        },
        detail: {
          data () {
            return {
              user: {
                loginname: null,
                avatar_url: null,
                githubUsername: null,
                create_at: null,
                score: 0,
                recent_topics: [],
                recent_replies: []
              },
              existence: true,
              loading: true,
              tabIndex: 0
            }
          },
          async fetch () {
            const route = this.app.$route
            const { data } = await http.get(`/user/${route.params.username}`)
            if (data) {
              this.user = data
            } else {
              this.existence = false
            }
            this.loading = false
          }
        },
        messages: {
          data () {
            return {
              list: [],
              loading: true
            }
          },
          async fetch () {
            if (!this.vuet.getState('user-self').id) return
            const { data } = await http.get(`/messages`, { mdrender: true })
            this.list = [...data.has_read_messages, ...data.hasnot_read_messages]
          },
          modules: {
            count: {
              data () {
                return 0
              },
              async fetch () {
                if (!this.vuet.getState('user-self').id) return
                const res = await http.get('/message/count')
                if (!res.data) return
                this.state = res.data
              }
            }
          }
        }
      }
    }
  }
})
