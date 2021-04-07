export interface GarbageWeights {
  list?: number
  map?: number
  string?: number
  bytes?: number
  boolean?: number
  integer?: number
  float?: number
  null?: number
  CID?: number
}
export interface GarbageOptions {
  initialWeights?: GarbageWeights
  weights?: GarbageWeights
}