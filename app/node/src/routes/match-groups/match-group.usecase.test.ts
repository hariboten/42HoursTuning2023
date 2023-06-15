import {
  mockDate,
  mockMatchGroupDetail,
  mockMatchGroupConfig,
  mockMatchMembers,
  onlyMyDepartmentUsers,
  onlyMyOfficeUsers,
} from "../../model/mock";
import { getUserForFilter } from "../users/repository";
import {
  getMatchGroupDetailByMatchGroupId,
  getUserIdsBeforeMatched,
  insertMatchGroup,
} from "./repository";
import { createMatchGroup } from "./usecase";

jest.mock("../users/repository", () => ({
  getUserForFilter: jest.fn(),
}));

jest.mock("./repository", () => ({
  insertMatchGroup: jest.fn(),
  getMatchGroupDetailByMatchGroupId: jest.fn(),
  getUserIdsBeforeMatched: jest.fn(),
}));

jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue(mockMatchGroupDetail.matchGroupId),
}));

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);
});

afterEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
});

describe("POST /api/v1/match-groups", () => {
  test("OK: no filter set", async () => {
    const mockGetUserForFilter = getUserForFilter as jest.Mock;
    mockGetUserForFilter
      .mockReturnValueOnce(mockMatchMembers[0])
      .mockReturnValueOnce(mockMatchMembers[1])
      .mockReturnValueOnce(mockMatchMembers[2]);

    const mockMatchGroupForInsert = {
      ...mockMatchGroupDetail,
      members: [mockMatchMembers[0], mockMatchMembers[1], mockMatchMembers[2]],
      createdAt: mockDate,
    };

    const mockGetMatchGroupDetailByMatchGroupId =
      getMatchGroupDetailByMatchGroupId as jest.Mock;
    mockGetMatchGroupDetailByMatchGroupId.mockReturnValue(mockMatchGroupDetail);

    const res = await createMatchGroup(mockMatchGroupConfig);
    expect(res).toStrictEqual(mockMatchGroupDetail);
    expect(mockGetUserForFilter).toHaveBeenCalledTimes(3);
    expect(insertMatchGroup).toHaveBeenCalledWith(mockMatchGroupForInsert);
    expect(mockGetMatchGroupDetailByMatchGroupId).toHaveBeenCalledWith(
      mockMatchGroupDetail.matchGroupId
    );
  });

  test("OK: department filter = 'onlyMyDepartment'", async () => {
    const mockGetUserForFilter = getUserForFilter as jest.Mock;
    mockGetUserForFilter
      .mockReturnValueOnce(mockMatchMembers[0])
      .mockReturnValueOnce(mockMatchMembers[1])
      .mockReturnValueOnce(mockMatchMembers[2])
      .mockReturnValueOnce(mockMatchMembers[3])
      .mockReturnValueOnce(mockMatchMembers[4]);

    const mockMatchGroupForInsert = {
      ...mockMatchGroupDetail,
      members: [mockMatchMembers[0], mockMatchMembers[3], mockMatchMembers[4]],
      createdAt: mockDate,
    };

    const mockGetMatchGroupDetailByMatchGroupId =
      getMatchGroupDetailByMatchGroupId as jest.Mock;
    mockGetMatchGroupDetailByMatchGroupId.mockReturnValue({
      ...mockMatchGroupDetail,
      members: onlyMyDepartmentUsers,
    });

    const res = await createMatchGroup({
      ...mockMatchGroupConfig,
      departmentFilter: "onlyMyDepartment",
    });

    expect(res).toStrictEqual({
      ...mockMatchGroupDetail,
      members: onlyMyDepartmentUsers,
    });
    expect(mockGetUserForFilter).toHaveBeenCalledTimes(5);
    expect(insertMatchGroup).toHaveBeenCalledWith(mockMatchGroupForInsert);
    expect(mockGetMatchGroupDetailByMatchGroupId).toHaveBeenCalledWith(
      mockMatchGroupDetail.matchGroupId
    );
  });

  test("OK: department filter = 'excludeMyDepartment'", async () => {
    const mockGetUserForFilter = getUserForFilter as jest.Mock;
    mockGetUserForFilter
      .mockReturnValueOnce(mockMatchMembers[0])
      .mockReturnValueOnce(mockMatchMembers[3])
      .mockReturnValueOnce(mockMatchMembers[4])
      .mockReturnValueOnce(mockMatchMembers[1])
      .mockReturnValueOnce(mockMatchMembers[2]);

    const mockMatchGroupForInsert = {
      ...mockMatchGroupDetail,
      members: [mockMatchMembers[0], mockMatchMembers[1], mockMatchMembers[2]],
      createdAt: mockDate,
    };

    const mockGetMatchGroupDetailByMatchGroupId =
      getMatchGroupDetailByMatchGroupId as jest.Mock;
    mockGetMatchGroupDetailByMatchGroupId.mockReturnValue(mockMatchGroupDetail);

    const res = await createMatchGroup({
      ...mockMatchGroupConfig,
      departmentFilter: "excludeMyDepartment",
    });

    expect(res).toStrictEqual(mockMatchGroupDetail);
    expect(mockGetUserForFilter).toHaveBeenCalledTimes(5);
    expect(insertMatchGroup).toHaveBeenCalledWith(mockMatchGroupForInsert);
    expect(mockGetMatchGroupDetailByMatchGroupId).toHaveBeenCalledWith(
      mockMatchGroupDetail.matchGroupId
    );
  });

  test("OK: office filter = 'onlyMyOffice'", async () => {
    const mockGetUserForFilter = getUserForFilter as jest.Mock;
    mockGetUserForFilter
      .mockReturnValueOnce(mockMatchMembers[0])
      .mockReturnValueOnce(mockMatchMembers[1])
      .mockReturnValueOnce(mockMatchMembers[2])
      .mockReturnValueOnce(mockMatchMembers[5])
      .mockReturnValueOnce(mockMatchMembers[6]);

    const mockMatchGroupForInsert = {
      ...mockMatchGroupDetail,
      members: [mockMatchMembers[0], mockMatchMembers[5], mockMatchMembers[6]],
      createdAt: mockDate,
    };

    const mockGetMatchGroupDetailByMatchGroupId =
      getMatchGroupDetailByMatchGroupId as jest.Mock;
    mockGetMatchGroupDetailByMatchGroupId.mockReturnValue({
      ...mockMatchGroupDetail,
      members: onlyMyOfficeUsers,
    });

    const res = await createMatchGroup({
      ...mockMatchGroupConfig,
      officeFilter: "onlyMyOffice",
    });

    expect(res).toStrictEqual({
      ...mockMatchGroupDetail,
      members: onlyMyOfficeUsers,
    });
    expect(mockGetUserForFilter).toHaveBeenCalledTimes(5);
    expect(insertMatchGroup).toHaveBeenCalledWith(mockMatchGroupForInsert);
    expect(mockGetMatchGroupDetailByMatchGroupId).toHaveBeenCalledWith(
      mockMatchGroupDetail.matchGroupId
    );
  });

  test("OK: office filter = 'excludeMyOffice'", async () => {
    const mockGetUserForFilter = getUserForFilter as jest.Mock;
    mockGetUserForFilter
      .mockReturnValueOnce(mockMatchMembers[0])
      .mockReturnValueOnce(mockMatchMembers[5])
      .mockReturnValueOnce(mockMatchMembers[6])
      .mockReturnValueOnce(mockMatchMembers[1])
      .mockReturnValueOnce(mockMatchMembers[2]);

    const mockMatchGroupForInsert = {
      ...mockMatchGroupDetail,
      members: [mockMatchMembers[0], mockMatchMembers[1], mockMatchMembers[2]],
      createdAt: mockDate,
    };

    const mockGetMatchGroupDetailByMatchGroupId =
      getMatchGroupDetailByMatchGroupId as jest.Mock;
    mockGetMatchGroupDetailByMatchGroupId.mockReturnValue(mockMatchGroupDetail);

    const res = await createMatchGroup({
      ...mockMatchGroupConfig,
      officeFilter: "excludeMyOffice",
    });

    expect(res).toStrictEqual(mockMatchGroupDetail);
    expect(mockGetUserForFilter).toHaveBeenCalledTimes(5);
    expect(insertMatchGroup).toHaveBeenCalledWith(mockMatchGroupForInsert);
    expect(mockGetMatchGroupDetailByMatchGroupId).toHaveBeenCalledWith(
      mockMatchGroupDetail.matchGroupId
    );
  });

  test("OK: skill filter = ['skill2', 'skill3']", async () => {
    const mockGetUserForFilter = getUserForFilter as jest.Mock;
    mockGetUserForFilter
      .mockReturnValueOnce(mockMatchMembers[0])
      .mockReturnValueOnce(mockMatchMembers[3])
      .mockReturnValueOnce(mockMatchMembers[4])
      .mockReturnValueOnce(mockMatchMembers[1])
      .mockReturnValueOnce(mockMatchMembers[2]);

    const mockMatchGroupForInsert = {
      ...mockMatchGroupDetail,
      members: [mockMatchMembers[0], mockMatchMembers[1], mockMatchMembers[2]],
      createdAt: mockDate,
    };

    const mockGetMatchGroupDetailByMatchGroupId =
      getMatchGroupDetailByMatchGroupId as jest.Mock;
    mockGetMatchGroupDetailByMatchGroupId.mockReturnValue(mockMatchGroupDetail);

    const res = await createMatchGroup({
      ...mockMatchGroupConfig,
      skillFilter: ["skill2", "skill3"],
    });

    expect(res).toStrictEqual(mockMatchGroupDetail);
    expect(mockGetUserForFilter).toHaveBeenCalledTimes(5);
    expect(insertMatchGroup).toHaveBeenCalledWith(mockMatchGroupForInsert);
    expect(mockGetMatchGroupDetailByMatchGroupId).toHaveBeenCalledWith(
      mockMatchGroupDetail.matchGroupId
    );
  });

  test("OK: never matched filter true", async () => {
    const mockGetUserForFilter = getUserForFilter as jest.Mock;
    mockGetUserForFilter
      .mockReturnValueOnce(mockMatchMembers[0])
      .mockReturnValueOnce(mockMatchMembers[3])
      .mockReturnValueOnce(mockMatchMembers[4])
      .mockReturnValueOnce(mockMatchMembers[1])
      .mockReturnValueOnce(mockMatchMembers[2]);

    const mockGetUserIdsBeforeMatched = getUserIdsBeforeMatched as jest.Mock;
    mockGetUserIdsBeforeMatched.mockReturnValue([
      mockMatchMembers[3].userId,
      mockMatchMembers[4].userId,
    ]);

    const mockMatchGroupForInsert = {
      ...mockMatchGroupDetail,
      members: [mockMatchMembers[0], mockMatchMembers[1], mockMatchMembers[2]],
      createdAt: mockDate,
    };

    const mockGetMatchGroupDetailByMatchGroupId =
      getMatchGroupDetailByMatchGroupId as jest.Mock;
    mockGetMatchGroupDetailByMatchGroupId.mockReturnValue(mockMatchGroupDetail);

    const res = await createMatchGroup({
      ...mockMatchGroupConfig,
      neverMatchedFilter: true,
    });

    expect(res).toStrictEqual(mockMatchGroupDetail);
    expect(mockGetUserForFilter).toHaveBeenCalledTimes(5);
    expect(mockGetUserIdsBeforeMatched).toHaveBeenCalledWith(
      mockMatchMembers[0].userId
    );
    expect(insertMatchGroup).toHaveBeenCalledWith(mockMatchGroupForInsert);
    expect(mockGetMatchGroupDetailByMatchGroupId).toHaveBeenCalledWith(
      mockMatchGroupDetail.matchGroupId
    );
  });

  test("NG: time out", async () => {
    jest.useRealTimers();

    const mockGetUserForFilter = getUserForFilter as jest.Mock;
    mockGetUserForFilter.mockReturnValue(mockMatchMembers[0]);

    const res = await createMatchGroup(mockMatchGroupConfig, 1000);

    expect(res).toBeUndefined();
  });
});
