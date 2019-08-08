const size = 800;

const strokeWidth = 100;

const overlapClip = 'overlapClip';
const partA = 'partA';
const partB = 'partB';
const angleX = 'angleX';

const INITIAL_ANGLE_FOR_GRADIENT = 80;

let draw, arc;

function init() {
	draw = SVG('drawing').size(size, size);
	arc = drawArc(270);
	addDefs();
	applyConicGradient();
}

/**
 * endAngle in deg
 */
function drawArc(endAngle) {
	const startAngle = degToRad(0+90);
	endAngle = degToRad(endAngle+90);
	const radius = size / 2 - strokeWidth / 2;
	const clockwise = true;

	const startPoint = polarToCartesian(startAngle, radius);

	const arc = new SVG.PathArray([
		['M', startPoint[0] + strokeWidth / 2, startPoint[1] + strokeWidth / 2],
		arcPath(startAngle, endAngle, radius, clockwise)
	]);

	const group = draw.group();
	group.center(0, 0);
	group.rect(size, size).fill('none');

	// return group.circle(size).fill('black');

	return group.path(arc).fill('none').stroke({
		color: 'white',
		width: strokeWidth,
		linecap: 'round'
	});
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

function degToRad(angle) {
	return Math.PI / 180 * angle;
}

function polarToCartesian(angle, radius) {
	return [
		Math.abs(radius * Math.sin(angle)),
		Math.abs(radius * Math.cos(angle))
	];
}

function applyConicGradient() {
	arc.attr('mask', `url(#${angleX})`);

	const maskA = SVG.get(partA);
	const maskB = SVG.get(partB);

	for (let i = INITIAL_ANGLE_FOR_GRADIENT; i < INITIAL_ANGLE_FOR_GRADIENT + 360; i++) {
		const rect = draw.rect(size / 2, size / 2);

		rect.fill(degreeToRGBA(i));

		rect.node.setAttribute('transform', `rotate(${i} ${size / 2} ${size / 2})`);

		if (i > 180) {
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
	var ratio = degree / 360;
	var colorVal = Math.floor(255 * ratio);
	var colorArray = [colorVal, colorVal, colorVal]
	const result = 'rgba(' + colorArray.join(',') + ',1)';
	return result;
}

init();
