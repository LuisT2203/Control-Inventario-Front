export const PAL_R = ['#CFE3FF', '#E0D6FF', '#FFD3E1', '#FFE9C9'];
export const PAL_U = ['#CDEFD9', '#FFF0B8', '#CFE3FF', '#FFD3E1', '#E0D6FF', '#FFDDC2'];
export const COLOR_TODAS = '#E7ECF5';

export function colorCategoria(esUniformes: boolean, indice: number): string {
  const pal = esUniformes ? PAL_U : PAL_R;
  return pal[indice % pal.length];
}
