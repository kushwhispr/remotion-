import {Composition} from 'remotion';
import {Space} from './Space';

export const Root = () => (
	<Composition
		id="Space"
		component={Space}
		durationInFrames={450}
		fps={30}
		width={1920}
		height={1080}
	/>
);
