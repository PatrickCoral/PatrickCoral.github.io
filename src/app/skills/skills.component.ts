import { Component, HostListener } from '@angular/core';
import * as THREE from 'three';
import {
	ConeGeometry,
	DirectionalLight,
	DirectionalLightHelper,
	Mesh,
	MeshNormalMaterial,
	MeshStandardMaterial,
	MeshToonMaterial,
	Vector2,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

import * as YUKA from 'yuka';
import {
	EntityManager,
	SeekBehavior,
	SteeringBehavior,
	SteeringManager,
	Vehicle,
	WanderBehavior,
} from 'yuka';

@Component({
	selector: 'app-skills',
	templateUrl: './skills.component.html',
	styleUrls: ['./skills.component.css'],
})
export class SkillsComponent {
	canvas: HTMLElement | undefined;
	mousePos: [x: number, y: number] = [0, 0];

	readonly gltfLoader = new GLTFLoader();
	readonly scene = new THREE.Scene();
	camera: THREE.OrthographicCamera = new THREE.OrthographicCamera(
		-2,
		2,
		2,
		-2,
		1,
		1000
	);
	pCamera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, 1);
	renderer: THREE.WebGL1Renderer | undefined;
	composer: EffectComposer | undefined;
	bloomPass: UnrealBloomPass = new UnrealBloomPass(
		new Vector2(window.innerWidth, window.innerHeight),
		0.35,
		1.0,
		0.8
	);
	renderPass: RenderPass | undefined;
	SMAAPass: SMAAPass = new SMAAPass(1, 1);

	readonly coneGeometry: ConeGeometry = new ConeGeometry(0.5, 2);
	readonly material: MeshStandardMaterial = new MeshStandardMaterial({
		color: 0xffffff,
	});
	readonly mat: MeshToonMaterial = new MeshToonMaterial({ color: 0x40e0d0 });
	readonly normalMat: MeshNormalMaterial = new MeshNormalMaterial();

	readonly dirLight: DirectionalLight = new DirectionalLight(0xffffff);

	readonly time: YUKA.Time = new YUKA.Time();
	readonly entityManager: YUKA.EntityManager = new EntityManager();
	readonly wanderBehavior: YUKA.WanderBehavior = new WanderBehavior();
	readonly seekBehavior: YUKA.SeekBehavior = new SeekBehavior(
		new YUKA.Vector3(0, 0, 0)
	);

	observer: IntersectionObserver = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				entry.target.classList.add('shown');
			}
		}
	});

	sync = (entity: YUKA.GameEntity, renderComponent: any) => {
		renderComponent.matrix.copy(entity.worldMatrix);
	};

	createBoids(amount: number) {
		this.coneGeometry.rotateX(Math.PI / 2);
		for (let i = 0; i < amount; i++) {
			let cone = new Mesh(this.coneGeometry, this.normalMat);
			cone.matrixAutoUpdate = false;
			this.scene.add(cone);

			let vehicle: YUKA.Vehicle = new YUKA.Vehicle();
			vehicle.setRenderComponent(cone, this.sync);
			vehicle.position.x = 10 - Math.random() * 20;
			vehicle.position.y = 10 - Math.random() * 20;
			vehicle.position.z = 10 - Math.random() * 20;
			vehicle.rotation.x = Math.PI * 2 - Math.random() * 4 * Math.PI;
			vehicle.rotation.y = Math.PI * 2 - Math.random() * 4 * Math.PI;
			vehicle.rotation.z = Math.PI * 2 - Math.random() * 4 * Math.PI;
			this.entityManager.add(vehicle);
			vehicle.steering.add(this.wanderBehavior);
			vehicle.smoother = new YUKA.Smoother(50);
		}
	}

	createScene() {
		this.canvas = document.getElementById('room') ?? undefined;
		this.renderer = new THREE.WebGL1Renderer({
			canvas: this.canvas,
			alpha: true,
			antialias: true,
		});

		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(
			this.canvas?.clientWidth ?? 1,
			this.canvas?.clientHeight ?? 1
		);

		this.pCamera.position.setY(30);
		this.pCamera.rotateX(-Math.PI / 2);

		this.dirLight.position.set(-5, 5, 5);

		this.scene.background = new THREE.Color(0x131316);

		this.createBoids(50);

		this.composer = new EffectComposer(this.renderer);
		this.renderPass = new RenderPass(this.scene, this.pCamera);
		this.composer?.addPass(this.renderPass);
		this.composer?.addPass(this.bloomPass);
		this.composer.addPass(this.SMAAPass);
	}

	updateSteeringBehavior() {
		this.entityManager.entities.forEach((entity) => {
			if (entity instanceof Vehicle) {
				if (entity.position.length() > 15) {
					entity.steering
						.remove(this.wanderBehavior)
						.add(this.seekBehavior);
				} else {
					entity.steering
						.remove(this.seekBehavior)
						.add(this.wanderBehavior);
				}
			}
		});
	}

	animate = () => {
		let delta = this.time.update().getDelta();
		this.entityManager.update(delta*10);
		this.updateSteeringBehavior();
		window.requestAnimationFrame(this.animate);
		this.composer?.render();
	};

	@HostListener('document:mousemove', ['$event'])
	onMouseMove(e: MouseEvent) {
		this.mousePos[0] = e.clientX / window.innerWidth;
		this.mousePos[1] = e.clientY / window.innerHeight;
	}

	ngOnInit() {
		document
			.querySelectorAll('.animated')
			.forEach((e) => this.observer.observe(e));

		this.createScene();
		this.animate();
	}
}
