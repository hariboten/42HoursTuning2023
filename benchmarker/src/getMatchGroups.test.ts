import axios from "axios";
import pool, { getMatchGroupsExpects } from "./e2e";

const BASE_URL = process.env.BASE_URL;

jest.setTimeout(60000);
jest.retryTimes(3, { logErrorsBeforeRetry: true });

afterAll(async () => {
  await pool.end();
});

describe("Get Match Groups API", () => {
  test("OK", async () => {
    console.log(new Date(), "start testing the Get Match Group API");
    const limit = 5;

    const res = await axios.get(
      `${BASE_URL}/api/v1/match-groups/members/test-user-id`,
      {
        params: {
          limit,
        },
        headers: {
          Cookie: "SESSION_ID=test-session-id; Path=/; HttpOnly",
        },
      }
    );

    const expects = await getMatchGroupsExpects(res);

    expect(200).toBe(res.status);
    expect(res.data).toHaveLength(limit);
    expect(expects).toStrictEqual(res.data);
    console.log(new Date(), "end testing the Get Match Group API");
  });
});
