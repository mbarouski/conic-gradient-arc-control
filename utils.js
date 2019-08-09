
export function degToRad(angle) {
	return Math.PI / 180 * angle;
}

export function polarToCartesian(angle, radius) {
	return [
		radius * Math.cos(angle) + radius,
		radius * Math.sin(angle) + radius
	];
}
