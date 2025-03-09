export type HttpLogData = {
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

export type GraphQLLogData = {
  _id: {
    $oid: string;
  };
  level: 30;
  time: 1741388100783;
  pid: 17011;
  hostname: string;
  requestID: string;
  operationName: string;
  query: string;
  response: any;
  duration: 42.060375;
  variables: string;
  userAgent: string;
  userId: string;
  message: string;
  timestamp: string;
};
