export default function AmbientBackground() {
  return (
    <div className="ambient-bg">
      <div
        className="ambient-blob animate-drift"
        style={{
          width: 500,
          height: 500,
          top: '-10%',
          left: '-5%',
          background: '#34D399',
        }}
      />
      <div
        className="ambient-blob animate-drift-slow"
        style={{
          width: 600,
          height: 600,
          bottom: '-15%',
          right: '-10%',
          background: '#A78BFA',
        }}
      />
      <div
        className="ambient-blob animate-drift"
        style={{
          width: 350,
          height: 350,
          top: '40%',
          right: '20%',
          background: '#FBBF24',
          opacity: 0.08,
          animationDelay: '4s',
        }}
      />
    </div>
  );
}
