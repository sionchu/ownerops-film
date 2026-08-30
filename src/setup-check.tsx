import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

const palette = {
  background: '#f2f3f1',
  surface: '#fbfcfa',
  ink: '#18231f',
  muted: '#68736f',
  accent: '#2f6b55',
  line: '#dfe3df',
};

export const ProductionSetupCheck = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 24, 126, 149], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(frame, [0, 149], [0.985, 1.01]);

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        backgroundColor: palette.background,
        color: palette.ink,
        display: 'flex',
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: palette.surface,
          border: `1px solid ${palette.line}`,
          borderRadius: 18,
          boxShadow: '0 12px 32px rgb(20 30 25 / 0.08)',
          opacity,
          padding: '70px 88px',
          transform: `scale(${scale})`,
          width: 980,
        }}
      >
        <div style={{color: palette.accent, fontSize: 24, letterSpacing: 4, textTransform: 'uppercase'}}>
          Production environment
        </div>
        <div style={{fontSize: 76, fontWeight: 650, letterSpacing: -3, marginTop: 24}}>OwnerOps Film</div>
        <div style={{color: palette.muted, fontSize: 30, lineHeight: 1.45, marginTop: 24}}>
          1920×1080 · 30 fps · authentic WebMCP footage required
        </div>
      </div>
    </AbsoluteFill>
  );
};
