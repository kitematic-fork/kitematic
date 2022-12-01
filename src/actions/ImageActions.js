import alt from '../alt';
import dockerUtil from '../utils/DockerUtil';

class ImageActions {

  all () {
    this.dispatch({});
    dockerUtil.refresh();
  }

  destroy (image) {
    dockerUtil.removeImage(image);
  }

  push(image) {
    dockerUtil.push(image);
  }
}

export default alt.createActions(ImageActions);
