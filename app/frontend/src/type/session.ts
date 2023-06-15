export interface Session {
  sessionId: string;
  createdAt: string;
  userId: string;
}

export const mockSession = {
  sessionId: "sessionId",
  userId: "userId",
  createdAt: new Date("2023-05-22"),
};

export interface LoginInfo {
  mail: string;
  password: string;
}

export const mockLoginInfo = {
  mail: "test@example.com",
  password: "password",
};
