
export function polarToCartesian(angle, radius, strokeWidth) {
	return [
		radius * Math.cos(angle) + radius + strokeWidth / 2,
		radius * Math.sin(angle) + radius + strokeWidth / 2
	];
}
