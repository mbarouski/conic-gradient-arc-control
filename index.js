import {polarToCartesian} from './utils.js';

const size = 320;

const strokeWidth = 50;

const overlapClip = 'overlapClip';
const partA = 'partA';
const partB = 'partB';
const angleX = 'angleX';

const MULTIPLIER_MAX = 0.69;
const MULTIPLIER_MIN = -0.15;
let multiplier = 0.5;

const ARC_ID = 'arc';

const INITIAL_ANGLE_FOR_GRADIENT = 79;

let draw, arc;

const _2PI = Math.PI * 2;

function init() {
	draw = SVG('drawing').viewbox(0, 0, size, size);
	arc = drawArc(_2PI * multiplier);
	addDefs();
	applyConicGradient();
}

function calculateArc(endAngle) {
	const startAngle = _2PI * (-1/4);

	const radius = size / 2 - strokeWidth / 2;
	const clockwise = true;

	const startPoint = polarToCartesian(startAngle, radius);

	return [
		['M', startPoint[0] + strokeWidth / 2, startPoint[1] + strokeWidth / 2],
		arcPath(startAngle, endAngle, radius, clockwise)
	];
}

let fakeArc;

let arcsGroup;

function drawArc(endAngle) {
	const arc = new SVG.PathArray(calculateArc(endAngle));

	draw.fill('none');

	// fake arc to fix cutting real one off
	fakeArc = draw.path(arc).fill('none').stroke({
		color: 'none',
		width: strokeWidth,
		linecap: 'round'
	});

	const realArc = draw.path(arc).id(ARC_ID).fill('none').stroke({
		color: 'white',
		width: strokeWidth,
		linecap: 'round'
	});

	arcsGroup = draw.group().add(fakeArc).add(realArc);

	return realArc;
}

function arcPath(startAngle, endAngle, radius, clockwise) {
	var angle = Math.abs(startAngle - endAngle);
	var fullCircle = angle == Math.PI * 2;
	var largeArc;

	if (fullCircle) {
		largeArc = true;
		clockwise = true;
	} else {
		var overHalf = angle > Math.PI;
		var reverse = startAngle > endAngle;
		largeArc = overHalf === clockwise !== reverse;
	}

	var endPoint = polarToCartesian(endAngle, radius);
	return [
		'A',
		radius,
		radius,
		0,
		largeArc ? 1 : 0,
		clockwise ? 1 : 0,
		endPoint[0] + strokeWidth / 2,
		endPoint[1] + strokeWidth / 2
	];
}

function applyConicGradient() {
	arcsGroup.attr('mask', `url(#${angleX})`);

	const maskA = SVG.get(partA);
	const maskB = SVG.get(partB);

	for (let i = INITIAL_ANGLE_FOR_GRADIENT; i < INITIAL_ANGLE_FOR_GRADIENT + 360; i++) {
		const rect = draw.rect(size / 2, size / 2);

		rect.fill(degreeToRGBA(i));

		rect.node.setAttribute('transform', `rotate(${i} ${size / 2} ${size / 2})`);

		if (i > 270) {
			maskB.add(rect);
		} else {
			maskA.add(rect);
		}
	}
}

function addDefs() {
	const clipRect = draw.rect(size, size / 2).move(0, size / 2);
	const clip = draw.clip().id('overlapClip').add(clipRect);
	const maskRect = draw.rect(size, size).move(0, 0).fill('white');
	const group = draw.group();
	group.add(maskRect);
	const mask = draw.mask();
	mask.add(group);
	mask.id(angleX);
	const groupA = draw.group().id(partA);
	const groupB = draw.group().id(partB);
	groupB.attr('clip-path', `url(#${overlapClip})`);
	group.add(groupA);
	group.add(groupB);
}

function degreeToRGBA(degree) {
	// добавить распределние
	var ratio = degree / 360; // 360 is real
	var colorVal = Math.floor(255 * ratio);
	var colorArray = [colorVal, colorVal, colorVal]
	const result = 'rgba(' + colorArray.join(',') + ',1)';
	return result;
}

init();

// document.body.onkeydown = e => {
// 	let newMultiplier = multiplier;
// 	if (e.code === 'ArrowRight') {
// 		newMultiplier += 0.01;
// 	} else if (e.code === 'ArrowLeft') {
// 		newMultiplier -= 0.01;
// 	}
// 	if (newMultiplier !== multiplier && newMultiplier < MULTIPLIER_MAX && newMultiplier > MULTIPLIER_MIN) {
// 		multiplier = newMultiplier;
// 		updateArc();
// 	}
// };

function updateArc() {
	const endAngle = _2PI * multiplier;
	const arc = calculateArc(endAngle);
	const arcString = arc.reduce((accumulator, current) => {
		if (Array.isArray(current)) {
			return accumulator + current.reduce((acc, curr) => {
				if (Number.isFinite(curr)) {
					return acc + ' ' + curr;
				}
				return acc + curr;
			}, '');
		}

		if (Number.isFinite(curr)) {
			return acc + ' ' + curr;
		}

		return acc + curr;
	}, '');
	document.querySelector(`#${ARC_ID}`).setAttribute('d', arcString);
}

let animationDirection = -1;

function animate() {
	setTimeout(() => {
		requestAnimationFrame(() => {
			if (multiplier > MULTIPLIER_MAX || multiplier < MULTIPLIER_MIN) {
				animationDirection *= -1;
			}
			multiplier += 0.01 * animationDirection;
			updateArc();
			animate();
		});
	}, 1);
}

animate();
