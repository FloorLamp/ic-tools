import type { Principal } from "@dfinity/agent";
export interface AttributeDescription {
  name: string;
  description: [] | [string];
  polling_frequency: [] | [Frequency];
  getter: [Principal, string];
}
export type AttributeId = bigint;
export interface AttributeRecord {
  id: AttributeId;
  status: Status;
  principal: Principal;
  description: AttributeDescription;
  series: Array<TimeSeries>;
}
export interface Frequency {
  n: bigint;
  period: Period;
}
export interface GetAttributeDescription {
  id: AttributeId;
  status: Status;
  name: string;
  description: [] | [string];
  polling_frequency: [] | [Frequency];
}
export type GetPeriod =
  | { Day: null }
  | { Hour: null }
  | { Week: null }
  | { Minute: null };
export interface GetRequest {
  period: [] | [GetPeriod];
  limit: [] | [bigint];
  before: [] | [bigint];
  attributeId: AttributeId;
}
export interface Metrics {
  allActiveAttributes: () => Promise<Array<GetAttributeDescription>>;
  attributesByPrincipal: (
    arg_0: Principal
  ) => Promise<Array<GetAttributeDescription>>;
  cycles: () => Promise<bigint>;
  execute: (arg_0: AttributeId) => Promise<MetricsResponse>;
  init: () => Promise<[[] | [AttributeId], [] | [AttributeId]]>;
  memory: () => Promise<bigint>;
  recordById: (arg_0: GetRequest) => Promise<Result_2>;
  track: (arg_0: TrackerRequest) => Promise<MetricsResponse>;
}
export type MetricsError =
  | { FailedExecution: null }
  | { InvalidId: null }
  | { AttributePaused: null }
  | { FailedGettingValue: null }
  | { Unauthorized: null };
export type MetricsResponse = Result;
export type Period = { Day: null } | { Hour: null } | { Minute: null };
export type Result = { ok: AttributeId } | { err: MetricsError };
export type Result_2 = { ok: AttributeRecord } | { err: MetricsError };
export type Status = { active: null } | { paused: null };
export interface TimeSeries {
  value: bigint;
  timestamp: bigint;
}
export interface TrackerRequest {
  action:
    | { Set: AttributeDescription }
    | { Pause: null }
    | { Unpause: null }
    | { Delete: null };
  attributeId: [] | [AttributeId];
}
export default Metrics;
