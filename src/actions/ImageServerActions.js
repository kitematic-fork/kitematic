import alt from '../alt';

class ImageServerActions {
  constructor () {
    this.generateActions(
      'added',
      'updated',
      'destroyed',
      'error',
      'pushing'
    );
  }
}

export default alt.createActions(ImageServerActions);
