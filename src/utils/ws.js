import utils from 'utils';
export default function ws(path) {
  // const token = utils.getLStorage('MOON_H5_TOKEN');
  const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJwbGF0Zm9ybSI6ImNsaWVudCIsInVzZXJfaWQiOjEwLCJzZXNzaW9uX2tleSI6ImYtMTFlYS04Yzg4LTAwMTYzZTAwMyJ9.r5EVE3BXXEf1fz0LvcaYdckIIfzr9N3_w5rgsuOZNyQ'
  return new WebSocket(`ws://stock-ws.cangshu360.com/ws/trader/${path}?token=${token}`)
}