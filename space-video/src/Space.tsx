import React, {useMemo} from 'react';
import {
	AbsoluteFill,
	Easing,
	Sequence,
	interpolate,
	random,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const W = 1920;
const H = 1080;
const CX = W / 2;
const CY = H / 2;

const Warp: React.FC = () => {
	const frame = useCurrentFrame();
	const stars = useMemo(
		() =>
			new Array(260).fill(0).map((_, i) => ({
				angle: random(`a${i}`) * Math.PI * 2,
				phase: random(`p${i}`),
				speed: 0.35 + random(`s${i}`) * 0.5,
				hue: random(`h${i}`) > 0.8 ? '#ffd9a0' : '#cfe4ff',
			})),
		[],
	);
	// Hyperspace in the first 5s, slowing to a drift
	const velocity = interpolate(frame, [0, 90, 200, 450], [1, 3.2, 0.5, 0.15], {
		extrapolateRight: 'clamp',
	});
	const travelled = useMemo(() => {
		let acc = 0;
		const arr: number[] = [];
		for (let f = 0; f <= 450; f++) {
			acc += interpolate(f, [0, 90, 200, 450], [1, 3.2, 0.5, 0.15]) * 0.004;
			arr.push(acc);
		}
		return arr;
	}, []);
	const t = travelled[Math.min(frame, 450)];
	return (
		<AbsoluteFill>
			<svg width={W} height={H}>
				{stars.map((s, i) => {
					const p = (s.phase + t * s.speed) % 1;
					const r = Math.pow(p, 2.2) * 1250;
					const trail = Math.max(2, velocity * 26 * p * p);
					const x1 = CX + Math.cos(s.angle) * r;
					const y1 = CY + Math.sin(s.angle) * r;
					const x0 = CX + Math.cos(s.angle) * Math.max(0, r - trail);
					const y0 = CY + Math.sin(s.angle) * Math.max(0, r - trail);
					return (
						<line
							key={i}
							x1={x0}
							y1={y0}
							x2={x1}
							y2={y1}
							stroke={s.hue}
							strokeWidth={0.8 + p * 2.6}
							strokeLinecap="round"
							opacity={Math.min(1, p * 3)}
						/>
					);
				})}
			</svg>
		</AbsoluteFill>
	);
};

const Nebula: React.FC = () => {
	const frame = useCurrentFrame();
	const drift = interpolate(frame, [0, 450], [0, -80]);
	return (
		<AbsoluteFill style={{background: '#04040f'}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 900px 600px at ${70 + drift / 20}% 30%, rgba(120,60,200,0.35), transparent 70%),
					radial-gradient(ellipse 800px 500px at 20% 75%, rgba(30,110,220,0.30), transparent 70%),
					radial-gradient(ellipse 500px 350px at 85% 85%, rgba(220,70,140,0.22), transparent 70%)`,
				}}
			/>
		</AbsoluteFill>
	);
};

const Planet: React.FC = () => {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [120, 450], [0.15, 1.15], {
		easing: Easing.out(Easing.cubic),
		extrapolateLeft: 'clamp',
	});
	const opacity = interpolate(frame, [120, 170], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const x = interpolate(frame, [120, 450], [CX, CX + 380], {
		easing: Easing.inOut(Easing.quad),
		extrapolateLeft: 'clamp',
	});
	const y = interpolate(frame, [120, 450], [CY, CY + 90], {
		extrapolateLeft: 'clamp',
	});
	const bands = [0.2, 0.34, 0.46, 0.6, 0.72, 0.85];
	return (
		<AbsoluteFill style={{opacity}}>
			<svg width={W} height={H}>
				<defs>
					<radialGradient id="body" cx="30%" cy="28%" r="85%">
						<stop offset="0%" stopColor="#ffd9a8" />
						<stop offset="45%" stopColor="#d9803f" />
						<stop offset="100%" stopColor="#3a1608" />
					</radialGradient>
					<radialGradient id="shade" cx="28%" cy="28%" r="90%">
						<stop offset="55%" stopColor="rgba(0,0,0,0)" />
						<stop offset="100%" stopColor="rgba(0,0,10,0.92)" />
					</radialGradient>
					<clipPath id="clip">
						<circle cx={0} cy={0} r={300} />
					</clipPath>
					<linearGradient id="ring" x1="0" x2="1">
						<stop offset="0" stopColor="#f3d9b0" stopOpacity="0" />
						<stop offset="0.25" stopColor="#f3d9b0" stopOpacity="0.8" />
						<stop offset="0.75" stopColor="#c9a070" stopOpacity="0.8" />
						<stop offset="1" stopColor="#c9a070" stopOpacity="0" />
					</linearGradient>
				</defs>
				<g transform={`translate(${x} ${y}) scale(${scale}) rotate(-18)`}>
					{/* back half of ring */}
					<ellipse cx={0} cy={0} rx={560} ry={130} fill="none" stroke="url(#ring)" strokeWidth={46} opacity={0.55} />
					<circle cx={0} cy={0} r={300} fill="url(#body)" />
					<g clipPath="url(#clip)">
						{bands.map((b, i) => (
							<rect
								key={i}
								x={-300}
								y={-300 + b * 600 - 10}
								width={600}
								height={14 + (i % 3) * 8}
								fill={i % 2 ? 'rgba(120,50,15,0.28)' : 'rgba(255,225,180,0.16)'}
								transform={`translate(${Math.sin(frame / 60 + i) * 6} 0)`}
							/>
						))}
					</g>
					<circle cx={0} cy={0} r={300} fill="url(#shade)" />
					{/* front half of ring */}
					<path d="M -560 0 A 560 130 0 0 0 560 0" fill="none" stroke="url(#ring)" strokeWidth={46} opacity={0.9} />
					<path d="M -480 0 A 480 112 0 0 0 480 0" fill="none" stroke="rgba(255,235,200,0.35)" strokeWidth={8} />
				</g>
			</svg>
		</AbsoluteFill>
	);
};

const Ship: React.FC = () => {
	const frame = useCurrentFrame();
	const p = interpolate(frame, [0, 120], [0, 1], {
		easing: Easing.inOut(Easing.cubic),
		extrapolateRight: 'clamp',
	});
	const x = interpolate(p, [0, 1], [-300, W + 300]);
	const y = interpolate(p, [0, 1], [760, 300]);
	const angle = Math.atan2(300 - 760, W + 600) * (180 / Math.PI);
	const flame = 0.7 + Math.sin(frame * 1.6) * 0.3;
	return (
		<AbsoluteFill>
			<svg width={W} height={H}>
				<g transform={`translate(${x} ${y}) rotate(${angle}) scale(1.4)`}>
					<ellipse cx={-110} cy={0} rx={90 * flame} ry={9} fill="#7fd0ff" opacity={0.85} />
					<ellipse cx={-90} cy={0} rx={45 * flame} ry={5} fill="#ffffff" />
					<path d="M 90 0 L 10 -14 L -40 -46 L -52 -46 L -34 -12 L -60 -10 L -60 10 L -34 12 L -52 46 L -40 46 L 10 14 Z" fill="#2a2f45" stroke="#9fb4e8" strokeWidth={2} />
					<ellipse cx={30} cy={0} rx={22} ry={6} fill="#7fd0ff" opacity={0.9} />
				</g>
			</svg>
		</AbsoluteFill>
	);
};

const Title: React.FC<{text: string; sub: string}> = ({text, sub}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const op = interpolate(
		frame,
		[0, 25, durationInFrames - 25, durationInFrames],
		[0, 1, 1, 0],
	);
	const spacing = interpolate(frame, [0, durationInFrames], [14, 32]);
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: op}}>
			<div
				style={{
					fontFamily: 'Helvetica, Arial, sans-serif',
					fontSize: 150,
					fontWeight: 200,
					color: '#fff',
					letterSpacing: spacing,
					paddingLeft: spacing,
					textShadow: '0 0 40px rgba(140,180,255,0.8)',
				}}
			>
				{text}
			</div>
			<div
				style={{
					fontFamily: 'Helvetica, Arial, sans-serif',
					fontSize: 34,
					color: '#a9c1ff',
					letterSpacing: 12,
					marginTop: 10,
				}}
			>
				{sub}
			</div>
		</AbsoluteFill>
	);
};

export const Space: React.FC = () => {
	const frame = useCurrentFrame();
	const fade = interpolate(frame, [0, 20, 425, 450], [0, 1, 1, 0]);
	return (
		<AbsoluteFill style={{background: '#000', opacity: fade}}>
			<Nebula />
			<Warp />
			<Planet />
			<Sequence from={150} durationInFrames={120}>
				<Ship />
			</Sequence>
			<Sequence from={20} durationInFrames={110}>
				<Title text="BEYOND" sub="A JOURNEY INTO THE DARK" />
			</Sequence>
			<Sequence from={340} durationInFrames={100}>
				<Title text="ONWARD" sub="THE STARS ARE WAITING" />
			</Sequence>
		</AbsoluteFill>
	);
};
