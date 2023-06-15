import axios from "axios";
import pool, {
  User,
  UserDetails,
  getUserDetailsByUserIds,
  getUsersForSearchExpects,
} from "./e2e";

const BASE_URL = process.env.BASE_URL;

jest.setTimeout(60000);
jest.retryTimes(3, { logErrorsBeforeRetry: true });

afterAll(async () => {
  await pool.end();
});

describe("Search Users API", () => {
  test("userName", async () => {
    console.log(new Date(), "start testing the Search Users API（userName）");
    const q = "山田";
    const target = "userName";
    const offset = 0;
    const limit = 5;

    const res = await axios.get(`${BASE_URL}/api/v1/users/search`, {
      params: {
        q,
        target,
        offset,
        limit,
      },
      headers: {
        Cookie: "SESSION_ID=test-session-id; Path=/; HttpOnly",
      },
    });

    const userIds: string[] = res.data.map((user: User) => user.userId);
    const users = await getUserDetailsByUserIds(userIds);
    const expects = getUsersForSearchExpects(users);

    expect(200).toBe(res.status);
    expect(res.data).toHaveLength(limit);
    expect(expects).toStrictEqual(res.data);
    expect(
      users.every((user: UserDetails) => user.userName.includes(q))
    ).toBeTruthy();
    console.log(new Date(), "end testing the Search Users API（userName）");
  });

  test("kana", async () => {
    console.log(new Date(), "start testing the Search Users API（kana）");
    const q = "さとう";
    const target = "kana";
    const offset = 0;
    const limit = 5;

    const res = await axios.get(`${BASE_URL}/api/v1/users/search`, {
      params: {
        q,
        target,
        offset,
        limit,
      },
      headers: {
        Cookie: "SESSION_ID=test-session-id; Path=/; HttpOnly",
      },
    });

    const userIds: string[] = res.data.map((user: User) => user.userId);
    const users = await getUserDetailsByUserIds(userIds);
    const expects = getUsersForSearchExpects(users);

    expect(200).toBe(res.status);
    expect(res.data).toHaveLength(limit);
    expect(expects).toStrictEqual(res.data);
    expect(
      users.every((user: UserDetails) => user.kana.includes(q))
    ).toBeTruthy();
    console.log(new Date(), "end testing the Search Users API（kana）");
  });

  test("mail", async () => {
    console.log(new Date(), "start testing the Search Users API（mail）");
    const q = "100";
    const target = "mail";
    const offset = 0;
    const limit = 5;

    const res = await axios.get(`${BASE_URL}/api/v1/users/search`, {
      params: {
        q,
        target,
        offset,
        limit,
      },
      headers: {
        Cookie: "SESSION_ID=test-session-id; Path=/; HttpOnly",
      },
    });

    const userIds: string[] = res.data.map((user: User) => user.userId);
    const users = await getUserDetailsByUserIds(userIds);
    const expects = getUsersForSearchExpects(users);

    expect(200).toBe(res.status);
    expect(res.data).toHaveLength(limit);
    expect(expects).toStrictEqual(res.data);
    expect(
      users.every((user: UserDetails) => user.mail.includes(q))
    ).toBeTruthy();
    console.log(new Date(), "end testing the Search Users API（mail）");
  });

  test("department", async () => {
    console.log(new Date(), "start testing the Search Users API（department）");
    const q = "営業4";
    const target = "department";
    const offset = 0;
    const limit = 5;

    const res = await axios.get(`${BASE_URL}/api/v1/users/search`, {
      params: {
        q,
        target,
        offset,
        limit,
      },
      headers: {
        Cookie: "SESSION_ID=test-session-id; Path=/; HttpOnly",
      },
    });

    const userIds: string[] = res.data.map((user: User) => user.userId);
    const users = await getUserDetailsByUserIds(userIds);
    const expects = getUsersForSearchExpects(users);

    expect(200).toBe(res.status);
    expect(res.data).toHaveLength(limit);
    expect(expects).toStrictEqual(res.data);
    expect(
      users.every((user: UserDetails) => user.departmentName.includes(q))
    ).toBeTruthy();
    console.log(new Date(), "end testing the Search Users API（department）");
  });

  test("role", async () => {
    console.log(new Date(), "start testing the Search Users API（role）");
    const q = "執行役員";
    const target = "role";
    const offset = 0;
    const limit = 5;

    const res = await axios.get(`${BASE_URL}/api/v1/users/search`, {
      params: {
        q,
        target,
        offset,
        limit,
      },
      headers: {
        Cookie: "SESSION_ID=test-session-id; Path=/; HttpOnly",
      },
    });

    const userIds: string[] = res.data.map((user: User) => user.userId);
    const users = await getUserDetailsByUserIds(userIds);
    const expects = getUsersForSearchExpects(users);

    expect(200).toBe(res.status);
    expect(res.data).toHaveLength(limit);
    expect(expects).toStrictEqual(res.data);
    expect(
      users.every((user: UserDetails) => user.roleName.includes(q))
    ).toBeTruthy();
    console.log(new Date(), "end testing the Search Users API（role）");
  });

  test("office", async () => {
    console.log(new Date(), "start testing the Search Users API（office）");
    const q = "東京";
    const target = "office";
    const offset = 0;
    const limit = 5;

    const res = await axios.get(`${BASE_URL}/api/v1/users/search`, {
      params: {
        q,
        target,
        offset,
        limit,
      },
      headers: {
        Cookie: "SESSION_ID=test-session-id; Path=/; HttpOnly",
      },
    });

    const userIds: string[] = res.data.map((user: User) => user.userId);
    const users = await getUserDetailsByUserIds(userIds);
    const expects = getUsersForSearchExpects(users);

    expect(200).toBe(res.status);
    expect(res.data).toHaveLength(limit);
    expect(expects).toStrictEqual(res.data);
    expect(
      users.every((user: UserDetails) => user.officeName.includes(q))
    ).toBeTruthy();
    console.log(new Date(), "end testing the Search Users API（office）");
  });

  test("skill", async () => {
    console.log(new Date(), "start testing the Search Users API（skill）");
    const q = "FP3";
    const target = "skill";
    const offset = 0;
    const limit = 5;

    const res = await axios.get(`${BASE_URL}/api/v1/users/search`, {
      params: {
        q,
        target,
        offset,
        limit,
      },
      headers: {
        Cookie: "SESSION_ID=test-session-id; Path=/; HttpOnly",
      },
    });

    const userIds: string[] = res.data.map((user: User) => user.userId);
    const users = await getUserDetailsByUserIds(userIds);
    const expects = getUsersForSearchExpects(users);

    expect(200).toBe(res.status);
    expect(res.data).toHaveLength(limit);
    expect(expects).toStrictEqual(res.data);
    expect(
      users.every((user: UserDetails) =>
        user.skillNames.some((skillName) => skillName.includes(q))
      )
    ).toBeTruthy();
    console.log(new Date(), "end testing the Search Users API（skill）");
  });

  test("goal", async () => {
    console.log(new Date(), "start testing the Search Users API（goal）");
    const q = "営業";
    const target = "goal";
    const offset = 0;
    const limit = 5;

    const res = await axios.get(`${BASE_URL}/api/v1/users/search`, {
      params: {
        q,
        target,
        offset,
        limit,
      },
      headers: {
        Cookie: "SESSION_ID=test-session-id; Path=/; HttpOnly",
      },
    });

    const userIds: string[] = res.data.map((user: User) => user.userId);
    const users = await getUserDetailsByUserIds(userIds);
    const expects = getUsersForSearchExpects(users);

    expect(200).toBe(res.status);
    expect(res.data).toHaveLength(limit);
    expect(expects).toStrictEqual(res.data);
    expect(
      users.every((user: UserDetails) => user.goal.includes(q))
    ).toBeTruthy();
    console.log(new Date(), "end testing the Search Users API（goal）");
  });
});
