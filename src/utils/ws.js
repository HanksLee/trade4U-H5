import utils from 'utils';
export default function ws(path) {
  const token = utils.getLStorage('MOON_H5_TOKEN');
  // const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwbGF0Zm9ybSI6ImNsaWVudCIsInBob25lIjoiMTExMTExIiwiaXAiOiI0Ny4yNDAuOTMuMTA0IiwiYnJva2VyX2lkIjoyLCJ1c2VyX2lkIjo1OCwic2Vzc2lvbl9rZXkiOiIzMzI5OTJjMi03N2QxLTExZWEtOGM4OC0wMDE2M2UwMDM3NTMifQ.YCt91Crx6CfOn3GMSI_rG05euJeSpYdV7DcKpakDqbY';
  return new WebSocket(`ws://stock-ws.cangshu360.com/ws/trader/${path}?token=${token}`);
}