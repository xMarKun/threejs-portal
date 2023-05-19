import Experience from '../Experience';
import Portal from './Portal';

export default class World {
  constructor() {
    this.experience = new Experience();
    this.resources = this.experience.resources;

    this.resources.on('ready', () => {
      this.portal = new Portal();
    });
  }

  resize() {
    this.portal && this.portal.resize();
  }

  update() {
    this.portal && this.portal.update();
  }
}
