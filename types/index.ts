export type LogData = {
  _id: {
    $oid: string;
  };
  level: number;
  time: number;
  pid: number;
  hostname: string;
  request: {
    ip: string;
    method: string;
    url: {
      path: string;
      params: Record<string, any>;
      queryString: string;
    };
    headers: Record<string, string>;
    requestID: string;
  };
  response: {
    status_code: number;
    time: number;
    headers: Record<string, string>;
    message: string;
  };
  timestamp: string;
};
