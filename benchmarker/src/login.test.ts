import axios from "axios";
import crypto from "crypto";
import { RowDataPacket } from "mysql2";
import pool from "./e2e";

const BASE_URL = process.env.BASE_URL;

afterAll(async () => {
  await pool.query(
    `DELETE FROM session WHERE linked_user_id != "test-user-id"`
  );
  await pool.end();
});

describe("Login API", () => {
  test("OK", async () => {
    console.log(new Date(), "start testing the Login API");
    const userIndex = Math.floor(Math.random() * 300001);
    const mail = `popy${userIndex}@example.com`;
    const password = `pass${userIndex}`;

    const hash = crypto.createHash("sha256");
    hash.update(password);
    const hashPassword = hash.digest("hex");

    const res = await axios.post(`${BASE_URL}/api/v1/session`, {
      mail,
      password,
    });

    const [userIdRow] = await pool.query<RowDataPacket[]>(
      "SELECT user_id FROM user WHERE mail = ? AND password = ?",
      [mail, hashPassword]
    );
    const [sessionRow] = await pool.query<RowDataPacket[]>(
      "SELECT session_id, created_at FROM session WHERE linked_user_id = ?",
      [userIdRow[0].user_id]
    );
    const createdAt =
      sessionRow[0].created_at.getFullYear() +
      "-" +
      (sessionRow[0].created_at.getMonth() + 1) +
      "-" +
      sessionRow[0].created_at.getDate();
    const session = {
      sessionId: sessionRow[0].session_id,
      userId: userIdRow[0].user_id,
      createdAt,
    };
    const Cookie = `SESSION_ID=${session.sessionId}; Path=/; HttpOnly`;

    expect([200, 201]).toContain(res.status);
    expect(session).toStrictEqual(res.data);
    expect(Cookie).toBe(res.headers["set-cookie"]?.[0]);
    console.log(new Date(), "end testing the Login API");
  });
});
