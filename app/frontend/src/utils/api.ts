import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export enum ApiPath {
  session = "/api/v1/session",
  users = "/api/v1/users",
  loginUser = "/api/v1/users/login-user",
  userIcon = "/api/v1/users/user-icon/{userIconId}",
  search = "/api/v1/users/search",
  matchGroups = "/api/v1/match-groups",
  matchGroupForMember = "/api/v1/match-groups/members/{userId}",
}

export interface ErrorData {
  message: string;
}

export const apiRequest = <Response, Body = any>(
  method: string,
  path: string,
  data?: Body
): Promise<AxiosResponse<Response>> => {
  const options: AxiosRequestConfig = {
    method,
    url: path,
    headers:
      method === "post" ? { "content-type": "application/json" } : undefined,
    data,
  };

  return axios(options);
};
