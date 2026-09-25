function hashSeed(seed: number) {
  const N = 29;
  const cells: boolean[] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  const inBox = (x: number, y: number, ox: number, oy: number) =>
    x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
  const isFinder = (x: number, y: number) =>
    inBox(x, y, 0, 0) || inBox(x, y, N - 7, 0) || inBox(x, y, 0, N - 7);
  const finderOn = (x: number, y: number) => {
    const lx = x >= N - 7 ? x - (N - 7) : x;
    const ly = y >= N - 7 ? y - (N - 7) : y;
    const d = Math.max(Math.abs(lx - 3), Math.abs(ly - 3));
    return d === 3 || d <= 1;
  };
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const quiet =
        (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
      let on: boolean;
      if (isFinder(x, y)) on = finderOn(x, y);
      else if (quiet) on = false;
      else if (x === 6 || y === 6) on = (x + y) % 2 === 0;
      else on = rnd() > 0.52;
      cells.push(on);
    }
  }
  return cells;
}

export function Qr({ seed, size = 220 }: { seed: string; size?: number }) {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n * 31 + seed.charCodeAt(i)) >>> 0;
  const cells = hashSeed(n || 1);
  return (
    <div
      className="grid shrink-0"
      style={{
        width: size,
        height: size,
        gridTemplateColumns: "repeat(29, 1fr)",
      }}
      aria-hidden="true"
    >
      {cells.map((on, i) => (
        <div key={i} style={{ background: on ? "#16161F" : "transparent" }} />
      ))}
    </div>
  );
}
