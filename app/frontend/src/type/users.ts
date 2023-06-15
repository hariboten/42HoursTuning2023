import { FileInfo } from "./files";

export interface User {
  userId: string;
  userName: string;
  userIcon: FileInfo;
  officeName: string;
}

export const mockUserIcon: FileInfo = {
  fileId: "userIconId",
  fileName: "userIconName",
};

export const mockUser: User = {
  userId: "userId",
  userName: "山田 太郎",
  userIcon: mockUserIcon,
  officeName: "東京",
};

export const getMockUsers = ({
  offset = 0,
  limit = 100,
}: UsersParams): User[] => {
  const list: User[] = [];
  for (let i = offset; i < offset + limit; i++) {
    list.push({
      userId: `${mockUser.userId}${i}`,
      userName: `${mockUser.userName}${i}`,
      userIcon: {
        fileId: mockUser.userIcon.fileId,
        fileName: `${mockUser.userIcon.fileName}${i}`,
      },
      officeName: `${mockUser.officeName}${i}`,
    });
  }
  return list;
};

export interface UsersParams {
  offset?: number;
  limit?: number;
}

export interface SearchParams {
  q?: string;
  target?: Target[];
}

export type Target =
  | "userName"
  | "kana"
  | "mail"
  | "department"
  | "role"
  | "office"
  | "skill"
  | "goal";

export const mockSearchParams: SearchParams = {
  q: "aaa",
  target: ["userName", "kana"],
};
