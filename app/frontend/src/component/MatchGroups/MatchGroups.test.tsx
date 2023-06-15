import { mockFileData } from "@src/type/files";
import { mockUser } from "@src/type/users";
import { ApiPath } from "@src/utils/api";
import { render, screen, waitFor } from "@src/utils/testRender";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import MatchGroups from "./MatchGroups";
import { getMockMatchGroups } from "@src/type/matchGroups";

jest.mock("next/router", () => {
  const module = jest.requireActual("next/router");
  return {
    __esModule: true,
    ...module,
    useRouter: () => ({
      push: () => {},
    }),
  };
});

describe("マッチグループ一覧表時", () => {
  it("OK: マッチグループ一覧取得成功", async () => {
    const mock = new MockAdapter(axios);
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);
    mock
      .onGet(
        `${ApiPath.matchGroupForMember.replace(
          "{userId}",
          mockUser.userId
        )}?status=all&offset=0&limit=100`
      )
      .reply(200, getMockMatchGroups({}));

    const { container } = render(<MatchGroups />);

    const matchGroupNames = await screen.findAllByText(/雑談グループ/);
    expect(matchGroupNames.length).toBe(100);

    await waitFor(() => {
      expect(
        container.querySelectorAll(
          `img[src='data:image/png;base64,${mockFileData.data}']`
        ).length
      ).toBe(402);
    });
  });

  it("OK: 作成済みのマッチグループが存在しない", async () => {
    const mock = new MockAdapter(axios);
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);
    mock
      .onGet(
        `${ApiPath.matchGroupForMember.replace(
          "{userId}",
          mockUser.userId
        )}?status=all&offset=0&limit=100`
      )
      .reply(200, []);

    render(<MatchGroups />);

    await screen.findByText("作成済みのマッチグループが存在しません。");
  });

  it("NG: マッチグループ一覧取得失敗", async () => {
    const mock = new MockAdapter(axios);
    const errorMessage = "Internal Server Error";
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);
    mock
      .onGet(
        `${ApiPath.matchGroupForMember.replace(
          "{userId}",
          mockUser.userId
        )}?status=all&offset=0&limit=100`
      )
      .reply(500, { message: errorMessage });

    const { container } = render(<MatchGroups />);

    await waitFor(() => {
      expect(screen.queryByText(/雑談グループ/)).not.toBeInTheDocument();
      expect(
        container.querySelectorAll(
          `img[src='data:image/png;base64,${mockFileData.data}']`
        ).length
      ).toBe(2);
      expect(
        screen.queryByText("予期せぬエラーが発生しました。")
      ).toBeInTheDocument();
    });
  });

  it("NG: ユーザーアイコン取得失敗", async () => {
    const mock = new MockAdapter(axios);
    const errorMessage = "Internal Server Error";
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(500, { message: errorMessage });
    mock
      .onGet(
        `${ApiPath.matchGroupForMember.replace(
          "{userId}",
          mockUser.userId
        )}?status=all&offset=0&limit=100`
      )
      .reply(200, getMockMatchGroups({}));

    const { container } = render(<MatchGroups />);

    const matchGroupNames = await screen.findAllByText(/雑談グループ/);
    expect(matchGroupNames.length).toBe(100);

    await waitFor(() => {
      expect(
        container.querySelectorAll(
          `img[src='data:image/png;base64,${mockFileData.data}']`
        ).length
      ).toBe(0);
      expect(
        screen.queryByText("予期せぬエラーが発生しました。")
      ).toBeInTheDocument();
    });
  });
});

describe("画面遷移後のSnackbarテスト", () => {
  it.each<[string, { message: string; statusCode: number }]>([
    [
      "OK: マッチグループ作成後",
      {
        message: "マッチグループの作成に成功しました。",
        statusCode: 201,
      },
    ],
  ])("%s", async (_, { message, statusCode }) => {
    await jest.isolateModules(async () => {
      const mock = new MockAdapter(axios);
      mock.onGet(ApiPath.loginUser).reply(200, mockUser);
      mock
        .onGet(
          ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId)
        )
        .reply(200, mockFileData);

      jest.doMock("@src/hooks/useSnackbar", () => {
        const module = jest.requireActual("@src/hooks/useSnackbar");
        return {
          __esModule: true,
          ...module,
          useSnackbar: () => ({
            message,
            openSnackbar: true,
            statusCode,
          }),
        };
      });

      const CreateMatchGroup = (await import("./CreateMatchGroup")).default;
      render(<CreateMatchGroup />);

      await waitFor(() => {
        expect(screen.queryByText(message)).toBeInTheDocument();
      });
    });
  });
});
