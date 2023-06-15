import axios from "axios";
import pool, { getUsersExpects } from "./e2e";

const BASE_URL = process.env.BASE_URL;

afterAll(async () => {
  await pool.end();
});

describe("Get Users API", () => {
  test("OK", async () => {
    console.log(new Date(), "start testing the Get Users API");
    const offset = Math.floor(Math.random() * 1000);
    const limit = 5;

    const res = await axios.get(`${BASE_URL}/api/v1/users`, {
      params: {
        offset,
        limit,
      },
      headers: {
        Cookie: "SESSION_ID=test-session-id; Path=/; HttpOnly",
      },
    });

    const expects = await getUsersExpects(res);

    expect(200).toBe(res.status);
    expect(res.data).toHaveLength(limit);
    expect(expects).toStrictEqual(res.data);
    console.log(new Date(), "end testing the Get Users API");
  });
});
