
export function polarToCartesian(angle, radius) {
	return [
		radius * Math.cos(angle) + radius,
		radius * Math.sin(angle) + radius
	];
}
