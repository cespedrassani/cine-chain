const POSTER_GRADIENTS: [string, string][] = [
  ["#0d1b3e", "#1a1060"], // indigo
  ["#1a0a3a", "#3a0d5e"], // deep purple
  ["#0a2a1a", "#0d3d28"], // emerald
  ["#3a0d0d", "#5e1a10"], // dark red
  ["#0d2233", "#0a3347"], // deep teal
  ["#2a200a", "#3d3010"], // deep gold
  ["#1a0d2e", "#2e1050"], // violet
  ["#0a3a2a", "#103320"], // forest
  ["#2e1a0a", "#4a2810"], // burnt umber
  ["#0d0d3a", "#1a104e"], // dark cobalt
];

export function posterGradient(title: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < title.length; i++)
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return POSTER_GRADIENTS[Math.abs(hash) % POSTER_GRADIENTS.length];
}
