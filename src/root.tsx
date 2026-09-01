import {Composition} from 'remotion';
import {ProductionSetupCheck} from './setup-check';
import {OwnerOpsCinematicPoC} from './ownerops-film';

export const OwnerOpsFilmRoot = () => (
  <>
    <Composition
      id="OwnerOpsCinematicPoC"
      component={OwnerOpsCinematicPoC}
      durationInFrames={3150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{bgm: true}}
    />
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
