import express from "express";
import request from "supertest";
import { app } from "../../app";
import {
  mockDate,
  mockLoginUser,
  mockMatchGroupDetail,
  mockMatchGroup,
  mockMatchGroup2,
  mockMatchGroup3,
  mockMatchGroup4,
  mockMatchGroup5,
  mockMatchGroup6,
  mockMatchGroup7,
  mockMatchGroupConfig,
  mockUserId,
  mockUsersList,
} from "../../model/mock";
import { checkSkillsRegistered, createMatchGroup } from "./usecase";
import {
  getMatchGroupIdsByUserId,
  getMatchGroupsByMatchGroupIds,
} from "./repository";
import { getUserByUserId } from "../users/repository";

jest.mock("./usecase", () => ({
  checkSkillsRegistered: jest.fn(),
  createMatchGroup: jest.fn(),
}));

jest.mock("./repository", () => ({
  getMatchGroupIdsByUserId: jest.fn(),
  getMatchGroupsByMatchGroupIds: jest.fn(),
}));

jest.mock("../users/repository", () => ({
  getUserByUserId: jest.fn(),
}));

jest.mock("../../middleware/auth", () => ({
  checkAuthMiddleware: (
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction
  ) => {
    req.headers["X-DA-USER-ID"] = mockUsersList[0].userId;
    next();
  },
}));

describe("POST /api/v1/match-groups", () => {
  const { ownerId: _, ...mockReqBody } = mockMatchGroupConfig;
  test("OK", async () => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);

    const mockCheckSkillsRegistered = checkSkillsRegistered as jest.Mock;
    mockCheckSkillsRegistered.mockReturnValue(undefined);

    const mockCreateMatchGroup = createMatchGroup as jest.Mock;
    mockCreateMatchGroup.mockReturnValue(mockMatchGroupDetail);

    const res = await request(app)
      .post("/api/v1/match-groups")
      .send(mockReqBody)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(201);
    expect(res.body).toStrictEqual(mockMatchGroupDetail);
    expect(mockCheckSkillsRegistered).toHaveBeenCalledWith([]);
    expect(mockCreateMatchGroup).toHaveBeenCalledWith(mockMatchGroupConfig);
    jest.useRealTimers();
  });

  test("NG: match group not string", async () => {
    const res = await request(app)
      .post("/api/v1/match-groups")
      .send({
        matchGroupName: -1,
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "マッチグループ名を文字列で指定してください。",
    });
  });

  test("NG: description not string", async () => {
    const res = await request(app)
      .post("/api/v1/match-groups")
      .send({
        matchGroupName: "matchGroupName",
        description: -1,
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "マッチグループの説明を文字列で指定してください。",
    });
  });

  test("NG: numOfMembers not number", async () => {
    const res = await request(app)
      .post("/api/v1/match-groups")
      .send({
        matchGroupName: "matchGroupName",
        description: "description",
        numOfMembers: "not number",
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "作成したいマッチグループの人数を数値で指定してください。",
    });
  });

  test("NG: departmentFilter not string", async () => {
    const res = await request(app)
      .post("/api/v1/match-groups")
      .send({
        matchGroupName: "matchGroupName",
        description: "description",
        numOfMembers: 3,
        departmentFilter: -1,
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "マッチグループの部署フィルタを文字列で指定してください。",
    });
  });

  test("NG: officeFilter not string", async () => {
    const res = await request(app)
      .post("/api/v1/match-groups")
      .send({
        matchGroupName: "matchGroupName",
        description: "description",
        numOfMembers: 3,
        departmentFilter: "none",
        officeFilter: -1,
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "マッチグループのオフィスフィルタを文字列で指定してください。",
    });
  });

  test("NG: skillFilter not string array", async () => {
    const res = await request(app)
      .post("/api/v1/match-groups")
      .send({
        matchGroupName: "matchGroupName",
        description: "description",
        numOfMembers: 3,
        departmentFilter: "none",
        officeFilter: "none",
        skillFilter: [-1],
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message:
        "マッチグループのスキルフィルタを文字列の配列で指定してください。",
    });
  });

  test("NG: neverMatchedFilter not boolean", async () => {
    const res = await request(app)
      .post("/api/v1/match-groups")
      .send({
        matchGroupName: "matchGroupName",
        description: "description",
        numOfMembers: 3,
        departmentFilter: "none",
        officeFilter: "none",
        skillFilter: [],
        neverMatchedFilter: "not boolean",
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message:
        "マッチグループのneverMatchedフィルタを真偽値で指定してください。",
    });
  });

  test("NG: matchGroupName too short", async () => {
    const res = await request(app)
      .post("/api/v1/match-groups")
      .send({
        matchGroupName: "",
        description: "description",
        numOfMembers: 3,
        departmentFilter: "none",
        officeFilter: "none",
        skillFilter: [],
        neverMatchedFilter: false,
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "マッチグループ名は1文字以上50文字以下で指定してください。",
    });
  });

  test("NG: description too long", async () => {
    const res = await request(app)
      .post("/api/v1/match-groups")
      .send({
        matchGroupName: "matchGroupName",
        description: "a".repeat(121),
        numOfMembers: 3,
        departmentFilter: "none",
        officeFilter: "none",
        skillFilter: [],
        neverMatchedFilter: false,
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "マッチグループの説明は120文字以下で指定してください。",
    });
  });

  test("NG: numOfMembers too large", async () => {
    const res = await request(app)
      .post("/api/v1/match-groups")
      .send({
        matchGroupName: "matchGroupName",
        description: "description",
        numOfMembers: 100,
        departmentFilter: "none",
        officeFilter: "none",
        skillFilter: [],
        neverMatchedFilter: false,
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message:
        "作成したいマッチグループの人数は2人以上8人以下で指定してください。",
    });
  });

  test("NG: departmentFilter invalid format", async () => {
    const res = await request(app)
      .post("/api/v1/match-groups")
      .send({
        matchGroupName: "matchGroupName",
        description: "description",
        numOfMembers: 3,
        departmentFilter: "invalid",
        officeFilter: "none",
        skillFilter: [],
        neverMatchedFilter: false,
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: `マッチグループの部署フィルタは'onlyMyDepartment', 'excludeMyDepartment', 'none'のいずれかで指定してください。`,
    });
  });

  test("NG: officeFilter invalid format", async () => {
    const res = await request(app)
      .post("/api/v1/match-groups")
      .send({
        matchGroupName: "matchGroupName",
        description: "description",
        numOfMembers: 3,
        departmentFilter: "none",
        officeFilter: "invalid",
        skillFilter: [],
        neverMatchedFilter: false,
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: `マッチグループのオフィスフィルタは'onlyMyOffice', 'excludeMyOffice', 'none'のいずれかで指定してください。`,
    });
  });

  test("NG: skillFilter has empty skill name", async () => {
    const res = await request(app)
      .post("/api/v1/match-groups")
      .send({
        matchGroupName: "matchGroupName",
        description: "description",
        numOfMembers: 3,
        departmentFilter: "none",
        officeFilter: "none",
        skillFilter: [""],
        neverMatchedFilter: false,
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "マッチグループのスキルフィルタに空文字が含まれています。",
    });
  });

  test("NG: skillFilter has no exist skill name", async () => {
    const noExistSkill = "no exist";
    const mockCheckSkillsRegistered = checkSkillsRegistered as jest.Mock;
    mockCheckSkillsRegistered.mockReturnValue(noExistSkill);

    const res = await request(app)
      .post("/api/v1/match-groups")
      .send({
        matchGroupName: "matchGroupName",
        description: "description",
        numOfMembers: 3,
        departmentFilter: "none",
        officeFilter: "none",
        skillFilter: [noExistSkill],
        neverMatchedFilter: false,
      })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: `${noExistSkill}はスキルとして登録されていません。`,
    });
    expect(mockCheckSkillsRegistered).toHaveBeenCalledWith([noExistSkill]);
  });

  test("NG: request body not json format", async () => {
    const res = await request(app)
      .post("/api/v1/match-groups")
      .send('{"invalid"}')
      .set("Content-Type", "application/json");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      message: "リクエストボディがJSON形式ではありません。",
    });
  });

  test("NG: failed to crate a match group", async () => {
    const mockCheckSkillsRegistered = checkSkillsRegistered as jest.Mock;
    mockCheckSkillsRegistered.mockReturnValue(undefined);

    const mockCreateMatchGroup = createMatchGroup as jest.Mock;
    mockCreateMatchGroup.mockReturnValue(undefined);

    const res = await request(app)
      .post("/api/v1/match-groups")
      .send(mockReqBody)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      message: "マッチグループの作成に失敗しました。",
    });
    expect(mockCheckSkillsRegistered).toHaveBeenCalledWith([]);
    expect(mockCreateMatchGroup).toHaveBeenCalledWith(mockMatchGroupConfig);
  });

  test("NG: unexpected error occurred", async () => {
    const mockCheckSkillsRegistered = checkSkillsRegistered as jest.Mock;
    mockCheckSkillsRegistered.mockImplementation(() => {
      throw new Error();
    });

    const res = await request(app)
      .post("/api/v1/match-groups")
      .send(mockReqBody)
      .set("Content-Type", "application/json");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: "Internal Server Error" });
    expect(mockCheckSkillsRegistered).toHaveBeenCalledWith([]);
  });
});

describe("GET /api/v1/match-groups/members/{userId}", () => {
  test("OK: limit 3, offset 2", async () => {
    const limit = 3;
    const offset = 2;

    const mockGetUserByUserId = getUserByUserId as jest.Mock;
    mockGetUserByUserId.mockReturnValue(mockLoginUser);

    const mockGetMatchGroupIdsByUserId = getMatchGroupIdsByUserId as jest.Mock;
    mockGetMatchGroupIdsByUserId.mockReturnValue([
      mockMatchGroup7.matchGroupId,
      mockMatchGroup6.matchGroupId,
      mockMatchGroup5.matchGroupId,
      mockMatchGroup4.matchGroupId,
      mockMatchGroup3.matchGroupId,
      mockMatchGroup2.matchGroupId,
      mockMatchGroup.matchGroupId,
    ]);

    const mockGetMatchGroupsByMatchGroupIds =
      getMatchGroupsByMatchGroupIds as jest.Mock;
    mockGetMatchGroupsByMatchGroupIds.mockReturnValue([
      mockMatchGroup7,
      mockMatchGroup6,
      mockMatchGroup5,
      mockMatchGroup4,
      mockMatchGroup3,
      mockMatchGroup2,
      mockMatchGroup,
    ]);

    const res = await request(app)
      .get(`/api/v1/match-groups/members/${mockUserId}`)
      .query({
        limit,
        offset,
      });

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([
      mockMatchGroup5,
      mockMatchGroup7,
      mockMatchGroup2,
    ]);
    expect(mockGetUserByUserId).toHaveBeenCalledWith(mockUserId);
    expect(mockGetMatchGroupIdsByUserId).toHaveBeenCalledWith(mockUserId);
    expect(mockGetMatchGroupsByMatchGroupIds).toHaveBeenCalledWith(
      [
        mockMatchGroup7.matchGroupId,
        mockMatchGroup6.matchGroupId,
        mockMatchGroup5.matchGroupId,
        mockMatchGroup4.matchGroupId,
        mockMatchGroup3.matchGroupId,
        mockMatchGroup2.matchGroupId,
        mockMatchGroup.matchGroupId,
      ],
      "all"
    );
  });

  test("OK: only open", async () => {
    const limit = 3;
    const offset = 0;

    const mockGetUserByUserId = getUserByUserId as jest.Mock;
    mockGetUserByUserId.mockReturnValue(mockLoginUser);

    const mockGetMatchGroupIdsByUserId = getMatchGroupIdsByUserId as jest.Mock;
    mockGetMatchGroupIdsByUserId.mockReturnValue([
      mockMatchGroup7.matchGroupId,
      mockMatchGroup6.matchGroupId,
      mockMatchGroup5.matchGroupId,
      mockMatchGroup4.matchGroupId,
      mockMatchGroup3.matchGroupId,
      mockMatchGroup2.matchGroupId,
      mockMatchGroup.matchGroupId,
    ]);

    const mockGetMatchGroupsByMatchGroupIds =
      getMatchGroupsByMatchGroupIds as jest.Mock;
    mockGetMatchGroupsByMatchGroupIds.mockReturnValue([
      mockMatchGroup7,
      mockMatchGroup5,
      mockMatchGroup3,
      mockMatchGroup,
    ]);

    const res = await request(app)
      .get(`/api/v1/match-groups/members/${mockUserId}`)
      .query({
        limit,
        offset,
        status: "open",
      });

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([
      mockMatchGroup,
      mockMatchGroup3,
      mockMatchGroup5,
    ]);
    expect(mockGetUserByUserId).toHaveBeenCalledWith(mockUserId);
    expect(mockGetMatchGroupIdsByUserId).toHaveBeenCalledWith(mockUserId);
    expect(mockGetMatchGroupsByMatchGroupIds).toHaveBeenCalledWith(
      [
        mockMatchGroup7.matchGroupId,
        mockMatchGroup6.matchGroupId,
        mockMatchGroup5.matchGroupId,
        mockMatchGroup4.matchGroupId,
        mockMatchGroup3.matchGroupId,
        mockMatchGroup2.matchGroupId,
        mockMatchGroup.matchGroupId,
      ],
      "open"
    );
  });

  test("OK: participated in no match groups", async () => {
    const mockGetUserByUserId = getUserByUserId as jest.Mock;
    mockGetUserByUserId.mockReturnValue(mockLoginUser);

    const mockGetMatchGroupIdsByUserId = getMatchGroupIdsByUserId as jest.Mock;
    mockGetMatchGroupIdsByUserId.mockReturnValue([]);

    const res = await request(app).get(
      `/api/v1/match-groups/members/${mockUserId}`
    );

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([]);
    expect(mockGetUserByUserId).toHaveBeenCalledWith(mockUserId);
    expect(mockGetMatchGroupIdsByUserId).toHaveBeenCalledWith(mockUserId);
  });

  test("OK: no match groups found", async () => {
    const mockGetUserByUserId = getUserByUserId as jest.Mock;
    mockGetUserByUserId.mockReturnValue(mockLoginUser);

    const mockGetMatchGroupIdsByUserId = getMatchGroupIdsByUserId as jest.Mock;
    mockGetMatchGroupIdsByUserId.mockReturnValue([
      mockMatchGroup2.matchGroupId,
      mockMatchGroup4.matchGroupId,
      mockMatchGroup6.matchGroupId,
    ]);

    const mockGetMatchGroupsByMatchGroupIds =
      getMatchGroupsByMatchGroupIds as jest.Mock;
    mockGetMatchGroupsByMatchGroupIds.mockReturnValue([]);

    const res = await request(app)
      .get(`/api/v1/match-groups/members/${mockUserId}`)
      .query({ status: "open" });

    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([]);
    expect(mockGetUserByUserId).toHaveBeenCalledWith(mockUserId);
    expect(mockGetMatchGroupIdsByUserId).toHaveBeenCalledWith(mockUserId);
    expect(mockGetMatchGroupsByMatchGroupIds).toHaveBeenCalledWith(
      [
        mockMatchGroup2.matchGroupId,
        mockMatchGroup4.matchGroupId,
        mockMatchGroup6.matchGroupId,
      ],
      "open"
    );
  });

  test("NG: specified user not found", async () => {
    const mockGetUserByUserId = getUserByUserId as jest.Mock;
    mockGetUserByUserId.mockReturnValue(undefined);

    const res = await request(app).get(`/api/v1/match-groups/members/noexist`);

    expect(res.status).toBe(404);
    expect(res.body).toStrictEqual({
      message: "指定されたユーザーは存在しません。",
    });
    expect(getUserByUserId).toHaveBeenCalledWith("noexist");
  });

  test("NG: unexpected error occurred", async () => {
    const mockGetUserByUserId = getUserByUserId as jest.Mock;
    mockGetUserByUserId.mockImplementation(() => {
      throw new Error();
    });

    const res = await request(app).get(
      `/api/v1/match-groups/members/${mockUserId}`
    );

    expect(res.status).toBe(500);
    expect(res.body).toStrictEqual({
      message: "Internal Server Error",
    });
    expect(mockGetUserByUserId).toHaveBeenCalledWith(mockUserId);
    expect(getUserByUserId).toHaveBeenCalledWith(mockUserId);
  });
});
