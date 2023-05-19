import * as THREE from 'three';

import Experience from '../Experience';
import firefliesVertexShader from '../shaders/fireflies/vertex.glsl';
import firefliesFragmentShader from '../shaders/fireflies/fragment.glsl';
import portalVertexShader from '../shaders/portal/vertex.glsl';
import portalFragmentShader from '../shaders/portal/fragment.glsl';

export default class Portal {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.time = this.experience.time;
    this.sizes = this.experience.sizes;
    this.camera = this.experience.camera;
    this.resources = this.experience.resources;
    this.portal = this.resources.items.portal;
    this.actualPortal = this.portal.scene;
    this.bakedTexture = this.resources.items.bakedTexture;

    this.setMaterial();
    this.setModel();
    this.setFireFlies();
    this.setPoints();
  }

  setMaterial() {
    this.bakedTextureMaterial = new THREE.MeshBasicMaterial({ map: this.bakedTexture });
    this.poleLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffffe5 });
    this.portalLightMaterial = new THREE.ShaderMaterial({
      vertexShader: portalVertexShader,
      fragmentShader: portalFragmentShader,
      uniforms: {
        uTime: { value: 0 },
      },
    });
    this.firefliesMaterial = new THREE.ShaderMaterial({
      vertexShader: firefliesVertexShader,
      fragmentShader: firefliesFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uPixelRatio: { value: this.sizes.pixelRatio },
        uSize: { value: 100 },
        uTime: { value: 0 },
      },
    });
  }

  setModel() {
    this.actualPortal.traverse((child) => {
      // bakedTexture
      if (child.name.startsWith('baked')) {
        child.material = this.bakedTextureMaterial;
      }
      // poleLight
      else if (child.name.startsWith('poleLight')) {
        child.material = this.poleLightMaterial;
        console.log(child.position);
      }
      // portalLight
      else if (child.name.startsWith('portalLight')) {
        child.material = this.portalLightMaterial;
      }
    });

    this.scene.add(this.actualPortal);
  }

  setFireFlies() {
    const firefliesGeometry = new THREE.BufferGeometry();
    const firefliesCount = 30;
    // set random position
    const positionArray = new Float32Array(firefliesCount * 3);
    for (let i = 0; i < firefliesCount; i++) {
      positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4;
      positionArray[i * 3 + 1] = Math.random() * 1.5;
      positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    firefliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3));
    // set random scale
    const scaleArray = new Float32Array(firefliesCount);
    for (let i = 0; i < firefliesCount; i++) {
      scaleArray[i] = Math.random();
    }
    firefliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1));

    const fireflies = new THREE.Points(firefliesGeometry, this.firefliesMaterial);
    this.scene.add(fireflies);
  }

  setPoints() {
    this.points = [
      {
        position: new THREE.Vector3(0.7, 1.5, 0),
        element: document.querySelector('.point-01'),
      },
      {
        position: new THREE.Vector3(-0.7, 0.5, 2),
        element: document.querySelector('.point-02'),
      },
      {
        position: new THREE.Vector3(0, 0.7, -1.5),
        element: document.querySelector('.point-03'),
      },
    ];
  }

  resize() {
    this.firefliesMaterial.uniforms.uPixelRatio.value = this.sizes.pixelRatio;
  }

  update() {
    const elapsedTime = this.time.elapsed * 0.001;
    this.firefliesMaterial.uniforms.uTime.value = elapsedTime;
    this.portalLightMaterial.uniforms.uTime.value = elapsedTime;

    // points
    for (const point of this.points) {
      const screenPosition = point.position.clone();
      screenPosition.project(this.camera.perspectiveCamera);

      const translateX = screenPosition.x * this.sizes.width * 0.5 - point.element.clientWidth / 2;
      const translateY =
        -screenPosition.y * this.sizes.height * 0.5 - point.element.clientHeight / 2;
      point.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }
  }
}
