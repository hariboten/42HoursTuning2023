import { createPool, Pool, PoolOptions } from "mysql2/promise";
import { RowDataPacket } from "mysql2";
import { AxiosResponse } from "axios";

const mysqlOption: PoolOptions = {
  host: "host.docker.internal",
  port: 33060,
  user: "mysql",
  password: "mysql",
  database: "app",
  waitForConnections: true,
  connectionLimit: 10,
};

const pool: Pool = createPool(mysqlOption);

export default pool;

export interface User {
  userId: string;
  userName: string;
  userIcon: {
    fileId: string;
    fileName: string;
  };
  officeName: string;
}

interface UserForSort extends User {
  kana: string;
  entryDate: Date;
}

// 指定したキーワードが検索項目に含まれているかを確認するために使う型
export interface UserDetails extends UserForSort {
  mail: string;
  departmentName: string;
  roleName: string;
  skillNames: string[];
  goal: string;
}

const getUsersForSortByUserIds = async (
  userIds: string[]
): Promise<UserForSort[]> => {
  const users: UserForSort[] = [];
  for (const userId of userIds) {
    const [row] = await pool.query<RowDataPacket[]>(
      "SELECT \
        user.user_id, \
        user.user_name, \
        user.kana, \
        user.entry_date, \
        office.office_name, \
        file.file_id, \
        file.file_name \
      FROM user \
        JOIN office ON user.office_id = office.office_id \
        JOIN file ON user.user_icon_id = file.file_id \
      WHERE user_id = ?",
      [userId]
    );
    users.push({
      userId: row[0].user_id,
      userName: row[0].user_name,
      kana: row[0].kana,
      entryDate: row[0].entry_date,
      officeName: row[0].office_name,
      userIcon: {
        fileId: row[0].file_id,
        fileName: row[0].file_name,
      },
    });
  }
  return users;
};

export const getUsersExpects = async (res: AxiosResponse): Promise<User[]> => {
  const userIds: string[] = res.data.map((user: User) => user.userId);
  const users: UserForSort[] = await getUsersForSortByUserIds(userIds);

  users.sort((a, b) => {
    if (a.entryDate < b.entryDate) return -1;
    if (a.entryDate > b.entryDate) return 1;
    if (a.kana < b.kana) return -1;
    if (a.kana > b.kana) return 1;
    return 0;
  });

  const expects: User[] = users.map(
    ({ kana: _kana, entryDate: _entryDate, ...user }) => user
  );
  return expects;
};

export const getUserDetailsByUserIds = async (
  userIds: string[]
): Promise<UserDetails[]> => {
  const users: UserDetails[] = [];
  for (const userId of userIds) {
    const [row] = await pool.query<RowDataPacket[]>(
      "SELECT \
        user.user_id, \
        user.user_name, \
        user.kana, \
        user.mail, \
        user.entry_date, \
        office.office_name, \
        department.department_name, \
        role.role_name, \
        file.file_id, \
        file.file_name, \
        GROUP_CONCAT(skill.skill_name) as skill_names, \
        user.goal \
      FROM user \
        JOIN office ON user.office_id = office.office_id \
        JOIN department_role_member ON user.user_id = department_role_member.user_id \
        JOIN department ON department_role_member.department_id = department.department_id \
        JOIN role ON department_role_member.role_id = role.role_id \
        JOIN file ON user.user_icon_id = file.file_id \
        JOIN skill_member ON user.user_id = skill_member.user_id \
        JOIN skill ON skill_member.skill_id = skill.skill_id \
      WHERE user.user_id = ? \
      AND department_role_member.belong = true \
      GROUP BY \
        user.user_id, \
        user.user_name, \
        user.kana, \
        user.mail, \
        user.entry_date, \
        office.office_name, \
        department.department_name, \
        role.role_name, \
        file.file_id, \
        file.file_name, \
        user.goal",
      [userId]
    );
    users.push({
      userId: row[0].user_id,
      userName: row[0].user_name,
      kana: row[0].kana,
      mail: row[0].mail,
      entryDate: row[0].entry_date,
      officeName: row[0].office_name,
      departmentName: row[0].department_name,
      roleName: row[0].role_name,
      userIcon: {
        fileId: row[0].file_id,
        fileName: row[0].file_name,
      },
      skillNames: row[0].skill_names.split(","),
      goal: row[0].goal,
    });
  }
  return users;
};

export const getUsersForSearchExpects = (users: UserDetails[]): User[] => {
  users.sort((a, b) => {
    if (a.entryDate < b.entryDate) return -1;
    if (a.entryDate > b.entryDate) return 1;
    if (a.kana < b.kana) return -1;
    if (a.kana > b.kana) return 1;
    return 0;
  });

  const expects: User[] = users.map(
    ({
      kana: _kana,
      mail: _mail,
      entryDate: _entryDate,
      departmentName: _departmentName,
      roleName: _roleName,
      skillNames: _skillNames,
      goal: _goal,
      ...user
    }) => user
  );
  return expects;
};

export interface MatchGroupConfig {
  matchGroupName: string;
  description: string;
  numOfMembers: number;
  departmentFilter: "onlyMyDepartment" | "excludeMyDepartment" | "none";
  officeFilter: "onlyMyOffice" | "excludeMyOffice" | "none";
  skillFilter: string[];
  neverMatchedFilter: boolean;
}

export const getUserIdsBeforeMatched = async (
  userId: string
): Promise<string[]> => {
  const [matchGroupIdRows] = await pool.query<RowDataPacket[]>(
    "SELECT match_group_id FROM match_group_member WHERE user_id = ?",
    [userId]
  );
  if (matchGroupIdRows.length === 0) {
    return [];
  }

  const [userIdRows] = await pool.query<RowDataPacket[]>(
    "SELECT user_id FROM match_group_member WHERE match_group_id IN (?)",
    [matchGroupIdRows]
  );

  return userIdRows.map((row) => row.user_id);
};

export interface MatchGroup {
  matchGroupId: string;
  matchGroupName: string;
  members: User[];
  status: "open" | "close";
  createdBy: string;
  createdAt: Date | string;
}

export const getMatchGroupsExpects = async (
  res: AxiosResponse
): Promise<MatchGroup[]> => {
  const matchGroupIds: string[] = res.data.map(
    (matchGroup: MatchGroup) => matchGroup.matchGroupId
  );
  const matchGroups: MatchGroup[] = await getMatchGroupsByMatchGroupIds(
    matchGroupIds
  );

  matchGroups.sort((a, b) => {
    if (a.status === "open" && b.status === "close") return -1;
    if (a.status === "close" && b.status === "open") return 1;
    if (new Date(a.createdAt) > new Date(b.createdAt)) return -1;
    if (new Date(a.createdAt) < new Date(b.createdAt)) return 1;
    if (a.matchGroupName < b.matchGroupName) return -1;
    if (a.matchGroupName > b.matchGroupName) return 1;
    return 0;
  });

  return matchGroups;
};

const getMatchGroupsByMatchGroupIds = async (
  matchGroupIds: string[]
): Promise<MatchGroup[]> => {
  const matchGroups: MatchGroup[] = [];
  for (const matchGroupId of matchGroupIds) {
    const [row] = await pool.query<RowDataPacket[]>(
      "SELECT \
        match_group.match_group_id, \
        match_group.match_group_name, \
        match_group.status, \
        match_group.created_by, \
        match_group.created_at, \
        GROUP_CONCAT(match_group_member.user_id) AS user_ids \
      FROM match_group \
        JOIN match_group_member ON match_group.match_group_id = match_group_member.match_group_id \
      WHERE match_group.match_group_id = ? \
      GROUP BY \
        match_group.match_group_id",
      [matchGroupId]
    );
    const users = await getUsersByUserIds(row[0].user_ids.split(","));
    matchGroups.push({
      matchGroupId: row[0].match_group_id,
      matchGroupName: row[0].match_group_name,
      members: users,
      status: row[0].status,
      createdBy: row[0].created_by,
      createdAt:
        row[0].created_at.getFullYear() +
        "-" +
        (row[0].created_at.getMonth() + 1) +
        "-" +
        row[0].created_at.getDate(),
    });
  }
  return matchGroups;
};

const getUsersByUserIds = async (userIds: string[]): Promise<User[]> => {
  const users: User[] = [];
  for (const userId of userIds) {
    const [row] = await pool.query<RowDataPacket[]>(
      "SELECT \
        user.user_id, \
        user.user_name, \
        office.office_name, \
        file.file_id, \
        file.file_name \
      FROM user \
        JOIN office ON user.office_id = office.office_id \
        JOIN file ON user.user_icon_id = file.file_id \
      WHERE user_id = ?",
      [userId]
    );
    users.push({
      userId: row[0].user_id,
      userName: row[0].user_name,
      officeName: row[0].office_name,
      userIcon: {
        fileId: row[0].file_id,
        fileName: row[0].file_name,
      },
    });
  }
  return users;
};
