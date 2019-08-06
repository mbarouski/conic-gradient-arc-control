const size = 800;

let draw;

function init() {
	draw = SVG('drawing').size(size, size);
	drawArc(260);
}

init();
/**
 * endAngle in deg
 */
function drawArc(endAngle) {
	const startAngle = degToRad(-90);
	endAngle = degToRad(endAngle - 90);
	const centerX = size / 2, centerY = size / 2;
	const radius = size / 2 - size / 10;
	const clockwise = true;

	const group = draw.group();
	group.center(centerX, centerY);
	
	const startPoint = polarToCartesian(startAngle, radius);

	const arc = new SVG.PathArray([
			['M', startPoint[0], startPoint[1]],
			arcPath(startAngle, endAngle, radius, clockwise)
	]);

	group.path(arc).fill('none').stroke({
			color: 'red',
			width: 100,
			linecap: 'round',
			linejoin: 'round'
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
			endPoint[0],
			endPoint[1]
	];
}

function degToRad(angle) {
	return Math.PI / 180 * angle;
}

function polarToCartesian(angle, radius) {
	return [
			radius * Math.cos(angle),
			radius * Math.sin(angle)
	];
}
