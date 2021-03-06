export const NONE = "NONE";

const channelConfig = [
  {
    channelCode: NONE,
    path: "symbol/<nowRealID>/trend/<unit>",
    pathKey: ["nowRealID", "unit"],
    connectDistanceTime: 2000,
    tryConnectMax: 10,
    disconnectMax: 10,
    bufferInfo:{
      limitTime:2000,
      maxCount:50
    }
  }
];

export default channelConfig;
