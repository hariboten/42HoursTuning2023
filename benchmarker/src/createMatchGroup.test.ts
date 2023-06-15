import axios from "axios";
import pool, {
  MatchGroupConfig,
  User,
  getUserDetailsByUserIds,
  getUserIdsBeforeMatched,
} from "./e2e";

const BASE_URL = process.env.BASE_URL;

jest.setTimeout(60000);
jest.retryTimes(3, { logErrorsBeforeRetry: true });

afterAll(async () => {
  await pool.query(
    `DELETE FROM match_group_member where match_group_id IN (SELECT match_group_id FROM match_group WHERE match_group_name = "test")`
  );
  await pool.query(`DELETE FROM match_group WHERE match_group_name = "test"`);
  await pool.end();
});

describe("Create Match Group API", () => {
  test("departmentFilter", async () => {
    console.log(
      new Date(),
      "start testing the Create Match Group API（departmentFilter）"
    );
    const matchGroupName = "test";
    const description = "test";
    const numOfMembers = 2;
    const departmentFilter = "onlyMyDepartment";
    const officeFilter = "none";
    const skillFilter: string[] = [];
    const neverMatchedFilter = false;
    const matchGroupConfig: MatchGroupConfig = {
      matchGroupName,
      description,
      numOfMembers,
      departmentFilter,
      officeFilter,
      skillFilter,
      neverMatchedFilter,
    };
    const res = await axios.post(
      `${BASE_URL}/api/v1/match-groups`,
      matchGroupConfig,
      {
        headers: {
          Cookie: "SESSION_ID=test-session-id; Path=/; HttpOnly",
        },
      }
    );

    const userIds: string[] = res.data.members.map((user: User) => user.userId);
    const users = await getUserDetailsByUserIds(userIds);
    const departmentName = users[0].departmentName;
    const today = new Date();

    expect(201).toBe(res.status);
    expect(res.data.matchGroupName).toBe(matchGroupName);
    expect(res.data.description).toBe(description);
    expect(res.data.members).toHaveLength(numOfMembers);
    expect(
      users.every((user) => user.departmentName === departmentName)
    ).toBeTruthy();
    expect(res.data.status).toBe("open");
    expect(res.data.createdBy).toBe("test-user-id");
    expect(res.data.createdAt).toBe(
      today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate()
    );
    console.log(
      new Date(),
      "end testing the Create Match Group API（departmentFilter）"
    );
  });

  test("officeFilter", async () => {
    console.log(
      new Date(),
      "start testing the Create Match Group API（officeFilter）"
    );
    const matchGroupName = "test";
    const description = "test";
    const numOfMembers = 2;
    const departmentFilter = "none";
    const officeFilter = "onlyMyOffice";
    const skillFilter: string[] = [];
    const neverMatchedFilter = false;
    const matchGroupConfig: MatchGroupConfig = {
      matchGroupName,
      description,
      numOfMembers,
      departmentFilter,
      officeFilter,
      skillFilter,
      neverMatchedFilter,
    };
    const res = await axios.post(
      `${BASE_URL}/api/v1/match-groups`,
      matchGroupConfig,
      {
        headers: {
          Cookie: "SESSION_ID=test-session-id; Path=/; HttpOnly",
        },
      }
    );

    const userIds: string[] = res.data.members.map((user: User) => user.userId);
    const users = await getUserDetailsByUserIds(userIds);
    const officeName = users[0].officeName;
    const today = new Date();

    expect(201).toBe(res.status);
    expect(res.data.matchGroupName).toBe(matchGroupName);
    expect(res.data.description).toBe(description);
    expect(res.data.members).toHaveLength(numOfMembers);
    expect(users.every((user) => user.officeName === officeName)).toBeTruthy();
    expect(res.data.status).toBe("open");
    expect(res.data.createdBy).toBe("test-user-id");
    expect(res.data.createdAt).toBe(
      today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate()
    );
    console.log(
      new Date(),
      "end testing the Create Match Group API（officeFilter）"
    );
  });

  test("skillFilter", async () => {
    console.log(
      new Date(),
      "start testing the Create Match Group API（skillFilter）"
    );
    const matchGroupName = "test";
    const description = "test";
    const numOfMembers = 2;
    const departmentFilter = "none";
    const officeFilter = "none";
    const skillFilter: string[] = ["簿記2級"];
    const neverMatchedFilter = false;
    const matchGroupConfig: MatchGroupConfig = {
      matchGroupName,
      description,
      numOfMembers,
      departmentFilter,
      officeFilter,
      skillFilter,
      neverMatchedFilter,
    };
    const res = await axios.post(
      `${BASE_URL}/api/v1/match-groups`,
      matchGroupConfig,
      {
        headers: {
          Cookie: "SESSION_ID=test-session-id; Path=/; HttpOnly",
        },
      }
    );

    const userIds: string[] = res.data.members.map((user: User) => user.userId);
    const users = await getUserDetailsByUserIds(userIds);
    const today = new Date();

    expect(201).toBe(res.status);
    expect(res.data.matchGroupName).toBe(matchGroupName);
    expect(res.data.description).toBe(description);
    expect(res.data.members).toHaveLength(numOfMembers);
    expect(
      users.every((user) => {
        if (user.userId === "test-user-id") {
          return true;
        }
        return user.skillNames.includes(skillFilter[0]);
      })
    ).toBeTruthy();
    expect(res.data.status).toBe("open");
    expect(res.data.createdBy).toBe("test-user-id");
    expect(res.data.createdAt).toBe(
      today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate()
    );
    console.log(
      new Date(),
      "end testing the Create Match Group API（skillFilter）"
    );
  });

  test("neverMatchedFilter", async () => {
    console.log(
      new Date(),
      "start testing the Create Match Group API（neverMatchedFilter）"
    );
    const matchGroupName = "test";
    const description = "test";
    const numOfMembers = 2;
    const departmentFilter = "none";
    const officeFilter = "none";
    const skillFilter: string[] = [];
    const neverMatchedFilter = true;
    const matchGroupConfig: MatchGroupConfig = {
      matchGroupName,
      description,
      numOfMembers,
      departmentFilter,
      officeFilter,
      skillFilter,
      neverMatchedFilter,
    };
    const res = await axios.post(
      `${BASE_URL}/api/v1/match-groups`,
      matchGroupConfig,
      {
        headers: {
          Cookie: "SESSION_ID=test-session-id; Path=/; HttpOnly",
        },
      }
    );

    const userIds: string[] = res.data.members.map((user: User) => user.userId);
    const users = await getUserDetailsByUserIds(userIds);
    const excludeUserIds = await getUserIdsBeforeMatched("test-user-id");
    const today = new Date();

    expect(201).toBe(res.status);
    expect(res.data.matchGroupName).toBe(matchGroupName);
    expect(res.data.description).toBe(description);
    expect(res.data.members).toHaveLength(numOfMembers);
    expect(
      users.every((user) => !excludeUserIds.includes(user.userId))
    ).toBeTruthy();
    expect(res.data.status).toBe("open");
    expect(res.data.createdBy).toBe("test-user-id");
    expect(res.data.createdAt).toBe(
      today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate()
    );
    console.log(
      new Date(),
      "end testing the Create Match Group API（neverMatchedFilter）"
    );
  });
});
