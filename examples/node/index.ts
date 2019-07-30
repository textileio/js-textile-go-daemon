import { DaemonFactory, Daemon } from '../../src'

// opens an api connection to local running go-ipfs node
new DaemonFactory()
  .spawn({ disposable: true })
  // @note: if we used disposable: false, we'd have to start the node and perhaps even init the repo first
  // .then((daemon: Daemon) => {
  //   return daemon.start()
  // })
  .then((daemon: Daemon) => {
    if (daemon.api) {
      // @note: daemon.api is an instance of Textile from @textile/js-http-client
      daemon.api.profile.get().then((profile: any) => {
        console.log('textile!')
        console.log(profile.address)
        daemon.stop()
      })
    } else {
      console.log('no api access!')
      daemon.stop()
    }
  })
  .catch(err => {
    console.log(err)
  })
