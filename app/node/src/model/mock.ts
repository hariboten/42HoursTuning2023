import {
  File,
  MatchGroupDetail,
  MatchGroupConfig,
  SearchedUser,
  Session,
  User,
  UserForFilter,
  MatchGroup,
} from "./types";
import { convertDateToString, convertUsersForFilterToUsers } from "./utils";

export const mockUserId = "userId";

export const mockSessionId = "sessionId";

export const mockDate = new Date("2023-01-01");
const mockDate2 = new Date("2022-12-31");
const mockDate3 = new Date("2022-12-30");

export const mockSession: Session = {
  sessionId: mockSessionId,
  userId: mockUserId,
  createdAt: convertDateToString(mockDate),
};

export const mockFileRecord: File = {
  fileName: "fileName",
  path: "path",
};

export const mockBuffer = Buffer.from("data");

export const mockFile = {
  fileName: "fileName",
  data: mockBuffer.toString("base64"),
};

export const mockUsersList: User[] = [
  {
    userId: "userId1",
    userName: "user1",
    userIcon: {
      fileId: "fileId1",
      fileName: "fileName1",
    },
    officeName: "office1",
  },
  {
    userId: "userId2",
    userName: "user2",
    userIcon: {
      fileId: "fileId2",
      fileName: "fileName2",
    },
    officeName: "office2",
  },
  {
    userId: "userId3",
    userName: "user3",
    userIcon: {
      fileId: "fileId3",
      fileName: "fileName3",
    },
    officeName: "office3",
  },
];

export const mockLoginUser: User = {
  userId: "userId",
  userName: "userName",
  userIcon: {
    fileId: "fileId",
    fileName: "fileName",
  },
  officeName: "office",
};

export const mockMatchGroupDetail: MatchGroupDetail = {
  matchGroupId: "matchGroupId",
  matchGroupName: "matchGroupName",
  description: "description",
  members: mockUsersList,
  status: "open",
  createdBy: mockUsersList[0].userId,
  createdAt: convertDateToString(mockDate),
};

export const mockMatchGroupConfig: MatchGroupConfig = {
  ownerId: mockUsersList[0].userId,
  matchGroupName: "matchGroupName",
  description: "description",
  numOfMembers: 3,
  departmentFilter: "none",
  officeFilter: "none",
  skillFilter: [],
  neverMatchedFilter: false,
};

export const mockSearchedUsers: SearchedUser[] = [
  {
    ...mockUsersList[1],
    kana: "kana2",
    entryDate: new Date("2022-01-01"),
  },
  {
    ...mockUsersList[2],
    kana: "kana3",
    entryDate: mockDate,
  },
  {
    ...mockUsersList[0],
    kana: "kana1",
    entryDate: new Date("2022-01-01"),
  },
];

export const mockMatchMembers: UserForFilter[] = [
  {
    userId: "userId1",
    userName: "user1",
    userIcon: {
      fileId: "fileId1",
      fileName: "fileName1",
    },
    officeName: "office1",
    departmentName: "department1",
    skillNames: ["skill1"],
  },
  {
    userId: "userId2",
    userName: "user2",
    userIcon: {
      fileId: "fileId2",
      fileName: "fileName2",
    },
    officeName: "office2",
    departmentName: "department2",
    skillNames: ["skill2"],
  },
  {
    userId: "userId3",
    userName: "user3",
    userIcon: {
      fileId: "fileId3",
      fileName: "fileName3",
    },
    officeName: "office3",
    departmentName: "department3",
    skillNames: ["skill3"],
  },
  {
    userId: "userId4",
    userName: "user4",
    userIcon: {
      fileId: "fileId4",
      fileName: "fileName4",
    },
    officeName: "office4",
    departmentName: "department1",
    skillNames: ["skill4"],
  },
  {
    userId: "userId5",
    userName: "user5",
    userIcon: {
      fileId: "fileId5",
      fileName: "fileName5",
    },
    officeName: "office5",
    departmentName: "department1",
    skillNames: ["skill5"],
  },
  {
    userId: "userId6",
    userName: "user6",
    userIcon: {
      fileId: "fileId6",
      fileName: "fileName6",
    },
    officeName: "office1",
    departmentName: "department6",
    skillNames: ["skill6"],
  },
  {
    userId: "userId7",
    userName: "user7",
    userIcon: {
      fileId: "fileId7",
      fileName: "fileName7",
    },
    officeName: "office1",
    departmentName: "department7",
    skillNames: ["skill7"],
  },
];

export const onlyMyDepartmentUsers: User[] = convertUsersForFilterToUsers([
  mockMatchMembers[0],
  mockMatchMembers[3],
  mockMatchMembers[4],
]);

export const onlyMyOfficeUsers: User[] = convertUsersForFilterToUsers([
  mockMatchMembers[0],
  mockMatchMembers[5],
  mockMatchMembers[6],
]);

export const { description: _description, ...mockMatchGroup } =
  mockMatchGroupDetail;

export const mockMatchGroup2: MatchGroup = {
  ...mockMatchGroup,
  matchGroupName: "matchGroup2",
  status: "close",
  createdAt: convertDateToString(mockDate2),
};

export const mockMatchGroup3: MatchGroup = {
  ...mockMatchGroup,
  matchGroupName: "matchGroup3",
  createdAt: convertDateToString(mockDate2),
};

export const mockMatchGroup4: MatchGroup = {
  ...mockMatchGroup,
  matchGroupName: "matchGroup4",
  status: "close",
  createdAt: convertDateToString(mockDate3),
};

export const mockMatchGroup5: MatchGroup = {
  ...mockMatchGroup,
  matchGroupName: "matchGroup5",
  createdAt: convertDateToString(mockDate3),
};

export const mockMatchGroup6: MatchGroup = {
  ...mockMatchGroup,
  matchGroupName: "matchGroup6",
  status: "close",
  createdAt: convertDateToString(mockDate3),
};

export const mockMatchGroup7: MatchGroup = {
  ...mockMatchGroup,
  matchGroupName: "matchGroup7",
  createdAt: convertDateToString(mockDate3),
};
