import { Component, HostListener } from '@angular/core';
import * as THREE from 'three';

import * as YUKA from 'yuka';

@Component({
	selector: 'app-skills',
	templateUrl: './skills.component.html',
	styleUrls: ['./skills.component.css'],
})
export class SkillsComponent {
	canvas: HTMLCanvasElement | undefined;
	container?: HTMLElement;

	readonly scene = new THREE.Scene();
	camera?: THREE.PerspectiveCamera;
	renderer?: THREE.WebGL1Renderer;

	readonly coneGeo = new THREE.ConeGeometry(0.5, 2);
	readonly normalMat = new THREE.MeshNormalMaterial();
	readonly cone = new THREE.Mesh(this.coneGeo, this.normalMat);

	readonly entityManager = new YUKA.EntityManager();
	readonly time = new YUKA.Time();

	readonly path = new YUKA.Path();

	isDrawing: boolean = false;
	iter: number = 3;
	axiom: string = 'A';
	readonly ruleA = '+BF-AFA-FB+';
	readonly ruleB = '-AF+BFB+FA-';
	readonly angles: [x: number, y: number][] = [
		[1, 0],
		[0, 1],
		[-1, 0],
		[0, -1],
	];

	createPoint(range: number) {
		return new YUKA.Vector3(
			range / 2 - Math.random() * range,
			range / 2 - Math.random() * range,
			range / 2 - Math.random() * range
		);
	}

	createLoop(amount: number) {
		let prev = new YUKA.Vector3();
		for (let i = 0; i < amount; i++) {
			let pos: YUKA.Vector3 = this.createPoint(50);
			while (prev.distanceTo(pos) < 10) pos = this.createPoint(50);
			this.path.add(pos);

			prev = pos;
		}
	}

	createBoids(amount: number) {
		const leader = new YUKA.Vehicle();
		let leaderCone = new THREE.Mesh(this.coneGeo, this.normalMat);
		leader.maxSpeed = 40;
		leaderCone.matrixAutoUpdate = false;

		leader.steering.add(new YUKA.FollowPathBehavior(this.path, 10));

		this.entityManager.add(leader);

		const separationBehavior = new YUKA.SeparationBehavior();
		separationBehavior.weight = 10;

		const pursuitBehavior = new YUKA.PursuitBehavior(leader);
		pursuitBehavior.weight = 0.5;

		for (let i = 0; i < amount; i++) {
			const vehicle = new YUKA.Vehicle();
			let cone = new THREE.Mesh(this.coneGeo, this.normalMat);
			vehicle.setRenderComponent(cone, this.sync);
			vehicle.maxSpeed = 20 + Math.random() * 20;
			cone.matrixAutoUpdate = false;
			this.scene.add(cone);

			vehicle.updateNeighborhood = true;
			vehicle.neighborhoodRadius = 5;

			vehicle.position = this.createPoint(30);

			vehicle.steering.add(pursuitBehavior);
			vehicle.steering.add(new YUKA.AlignmentBehavior());
			vehicle.steering.add(new YUKA.CohesionBehavior());
			vehicle.steering.add(separationBehavior);

			this.entityManager.add(vehicle);
		}
	}

	createScene() {
		if (this.canvas === undefined || this.container === undefined) return;

		this.camera = new THREE.PerspectiveCamera(
			55,
			this.container.clientWidth / this.container.clientHeight
		);

		this.renderer = new THREE.WebGL1Renderer({
			canvas: this.canvas,
			alpha: true,
			antialias: true,
		});
		this.renderer?.setSize(
			this.container.clientWidth,
			this.container.clientHeight,
			true
		);

		this.camera.position.z = 100;

		this.path.loop = true;

		this.createLoop(10);

		this.coneGeo.rotateX(Math.PI / 2);

		this.createBoids(200);

		this.renderer.render(this.scene, this.camera);
	}

	sync(entity: YUKA.GameEntity, renderComponent: any) {
		renderComponent.matrix.copy(entity.worldMatrix);
	}

	animate = () => {
		const delta = this.time.update().getDelta();
		this.entityManager.update(delta);
		if (this.camera !== undefined)
			this.renderer?.render(this.scene, this.camera);
		window.requestAnimationFrame(this.animate);
	};

	@HostListener('window:resize', ['$event'])
	onResize() {
		if (this.container === undefined || this.camera === undefined) return;
		this.camera.aspect =
			this.container?.clientWidth / this.container?.clientHeight;
		this.camera.updateProjectionMatrix();
		this.renderer?.setSize(
			this.container.clientWidth,
			this.container.clientHeight,
			true
		);
	}

	observer: IntersectionObserver = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				entry.target.classList.add('shown');
			}
		}
	});

	iteration(axiom: string): string {
		this.iter--;
		var newString = '';
		for (let index = 0; index < axiom.length; index++) {
			const char = axiom.charAt(index);
			if (char == 'A') {
				newString += this.ruleA;
			} else if (char == 'B') {
				newString += this.ruleB;
			} else {
				newString += char;
			}
		}

		if (this.iter == 0) {
			return newString;
		}

		return this.iteration(newString);
	}

	parseInstructions(instructions: string): string {
		var newString = '';
		for (let index = 0; index < instructions.length; index++) {
			let char = instructions.charAt(index);
			if (char != 'A' && char != 'B') {
				newString += char;
			}
		}

		return newString;
	}

	mulTuples = (
		[x, y]: [x: number, y: number],
		[a, b]: [a: number, b: number]
	): [x: number, y: number] => {
		return [x * a, y * b];
	};

	addTuples = (
		[x, y]: [x: number, y: number],
		[a, b]: [a: number, b: number]
	): [x: number, y: number] => {
		return [x + a, y + b];
	};

	sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async draw(
		context: CanvasRenderingContext2D,
		stepSize: number,
		instructions: string
	) {
		this.isDrawing = true;
		let pos: [x: number, y: number] = [0, 0];
		let angle = 0;
		const steps: [x: number, y: number] = [stepSize, stepSize];

		context.beginPath();
		context.moveTo(...pos);

		for (let index = 0; index < instructions.length; index++) {
			const char = instructions.charAt(index);
			if (char == '+') {
				angle = (4 + angle + 1) % 4;
			} else if (char == '-') {
				angle = (4 + angle - 1) % 4;
			} else if (char == 'F') {
				pos = this.addTuples(
					pos,
					this.mulTuples(steps, this.angles[angle])
				);
				context.lineTo(...pos);
				if (index % 1 == 0) {
					context.stroke();
					await this.sleep(40);
				}
			}
		}
		context.stroke();
		this.isDrawing = false;
	}

	setupCanvas(canvas: HTMLElement | undefined){
		if (!(canvas instanceof HTMLCanvasElement)) return;
		let width = canvas.clientWidth;
		let height = canvas.clientHeight;
		let stepSize = Math.min(width * 0.9, height * 0.9);
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d') ?? undefined;
		if (ctx == undefined) return;
		ctx.translate((width - stepSize) / 2, 0);
		ctx.translate(0, (height - stepSize) / 2);
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 10;
		ctx.lineCap = "square";
		stepSize = stepSize / (Math.pow(2, this.iter) - 1);

		let instructions = this.parseInstructions(this.iteration(this.axiom));

		this.draw(ctx, stepSize, instructions);

		setInterval(() => {
			if (this.isDrawing) return;
			ctx.clearRect(-width, -height, width*2, height*2);
			this.draw(ctx, stepSize, instructions);
		}, 5000)
	}

	ngOnInit() {
		const canvas = document.getElementById('room') ?? undefined;
		const hilbert = document.getElementById('hilbert') ?? undefined;

		this.setupCanvas(hilbert);
		if (canvas instanceof HTMLCanvasElement) this.canvas = canvas;
		this.container = document.getElementById('container3D') ?? undefined;

		document
			.querySelectorAll('.animated')
			.forEach((e) => this.observer.observe(e));

		this.createScene();
		this.animate();
	}
}
