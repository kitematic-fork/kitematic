import alt from '../alt';
import dockerUtil from '../utils/DockerUtil';

class ContainerActions {

  destroy (name) {
    dockerUtil.destroy(name);
  }

  rename (name, newName) {
    this.dispatch({name, newName});
    dockerUtil.rename(name, newName);
  }

  start (name) {
    this.dispatch({name});
    dockerUtil.start(name);
  }

  stop (name) {
    dockerUtil.stop(name);
  }

  restart (name) {
    this.dispatch({name});
    dockerUtil.restart(name);
  }

  update (name, container) {
    this.dispatch({name, container});
    dockerUtil.updateContainer(name, container);
  }

  clearPending () {
    this.dispatch();
  }

  run (name, repo, tag, local=false) {
    dockerUtil.run(name, repo, tag, local);
  }

  active (name) {
    dockerUtil.active(name);
  }
}

export default alt.createActions(ContainerActions);
