import { User, getMockUsers } from "./users";

export interface MatchGroup {
  matchGroupId: string;
  matchGroupName: string;
  members: User[];
  status: matchGroupStatus;
  createdBy: string;
  createdAt: string;
}

export const mockMatchGroup: MatchGroup = {
  matchGroupId: "matchGroupId",
  matchGroupName: "雑談グループ",
  members: getMockUsers({ limit: 4 }),
  status: "open",
  createdBy: "userId0",
  createdAt: "2023-05-01",
};

export const getMockMatchGroups = ({
  status = true,
  offset = 0,
  limit = 100,
}: MatchGroupsParams): MatchGroup[] => {
  const list: MatchGroup[] = [];
  for (let i = offset; i < offset + limit; i++) {
    list.push({
      matchGroupId: `${mockMatchGroup.matchGroupId}${i}`,
      matchGroupName: `${mockMatchGroup.matchGroupName}${i}`,
      members: mockMatchGroup.members,
      status: status ? "open" : i % 2 === 0 ? "open" : "close",
      createdBy: mockMatchGroup.createdBy,
      createdAt: mockMatchGroup.createdAt,
    });
  }
  return list;
};

export type matchGroupStatus = "open" | "close";

export interface MatchGroupsParams {
  status?: boolean;
  offset?: number;
  limit?: number;
}

export type MatchGroupDetail = MatchGroup & { description: string };

export const mockMatchGroupDetail: MatchGroupDetail = {
  ...mockMatchGroup,
  description: "雑談するためのグループです。",
};

export interface MatchGroupForCreate {
  matchGroupName: string;
  description: string;
  numOfMembers: number;
  departmentFilter: departmentFilter;
  officeFilter: officeFilter;
  skillFilter: string[];
  neverMatchedFilter: boolean;
}

export const mockMatchGroupForCreate: MatchGroupForCreate = {
  matchGroupName: "雑談グループ",
  description: "雑談するためのグループです。",
  numOfMembers: 4,
  departmentFilter: "none",
  officeFilter: "none",
  skillFilter: [],
  neverMatchedFilter: false,
};

export const initialMatchGroupForCreate: MatchGroupForCreate = {
  matchGroupName: "",
  description: "",
  numOfMembers: 4,
  departmentFilter: "none",
  officeFilter: "none",
  skillFilter: [],
  neverMatchedFilter: false,
};

export type departmentFilter =
  | "onlyMyDepartment"
  | "excludeMyDepartMent"
  | "none";
export type officeFilter = "onlyMyOffice" | "excludeMyOffice" | "none";
