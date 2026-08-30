import {Composition} from 'remotion';
import {ProductionSetupCheck} from './setup-check';

export const OwnerOpsFilmRoot = () => (
  <>
    <Composition
      id="OwnerOpsFilmSetupCheck"
      component={ProductionSetupCheck}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
