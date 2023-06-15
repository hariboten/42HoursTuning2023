import { mockFileData } from "@src/type/files";
import { getMockUsers, mockSearchParams, mockUser } from "@src/type/users";
import { ApiPath } from "@src/utils/api";
import { Path } from "@src/utils/routerPath";
import { render, screen, waitFor } from "@src/utils/testRender";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

const mockRouterPush = jest.fn();
const queryObject = { query: {} };

jest.mock("next/router", () => {
  const module = jest.requireActual("next/router");
  return {
    __esModule: true,
    ...module,
    useRouter: () => ({
      push: mockRouterPush,
      ...queryObject,
    }),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("ユーザー一覧表示", () => {
  it("OK: ユーザー一覧取得成功", async () => {
    const mock = new MockAdapter(axios);
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);
    mock
      .onGet(`${ApiPath.users}?offset=0&limit=100`)
      .reply(200, getMockUsers({}));

    const Users = (await import("./Users")).default;
    const { container } = render(<Users />);

    const userNames = await screen.findAllByText(/山田 太郎/);
    expect(userNames.length).toBe(101);

    await waitFor(() => {
      expect(
        container.querySelectorAll(
          `img[src='data:image/png;base64,${mockFileData.data}']`
        ).length
      ).toBe(101);
    });
  });

  it("OK: ユーザが存在しない", async () => {
    const mock = new MockAdapter(axios);
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);
    mock.onGet(`${ApiPath.users}?offset=0&limit=100`).reply(200, []);

    const Users = (await import("./Users")).default;
    render(<Users />);

    await screen.findByText("ユーザーが存在しません。");
  });

  it("NG: ユーザー一覧取得失敗", async () => {
    const mock = new MockAdapter(axios);
    const errorMessage = "Internal Server Error";
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);
    mock
      .onGet(`${ApiPath.users}?offset=0&limit=100`)
      .reply(500, { message: errorMessage });

    const Users = (await import("./Users")).default;
    const { container } = render(<Users />);

    const userNames = await screen.findAllByText(/山田 太郎/);

    await waitFor(() => {
      expect(userNames.length).toBe(1);
      expect(
        container.querySelectorAll(
          `img[src='data:image/png;base64,${mockFileData.data}']`
        ).length
      ).toBe(1);
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
      .onGet(`${ApiPath.users}?offset=0&limit=100`)
      .reply(200, getMockUsers({}));

    const Users = (await import("./Users")).default;
    const { container } = render(<Users />);

    const userNames = await screen.findAllByText(/山田 太郎/);
    expect(userNames.length).toBe(101);

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

describe("ユーザー検索", () => {
  it("OK: ユーザー検索で予期したクエリパラメータになっているか確認", async () => {
    const mock = new MockAdapter(axios);
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);
    mock
      .onGet(`${ApiPath.users}?offset=0&limit=100`)
      .reply(200, getMockUsers({}));

    queryObject.query = {};
    const Users = (await import("./Users")).default;
    render(<Users />);

    const searchButton = await screen.findByLabelText("search");
    expect(searchButton).toBeDisabled();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("search-field"), "aa");
    expect(searchButton).toBeEnabled();

    await user.type(screen.getByLabelText("search-field"), "{backspace}");
    expect(searchButton).toBeDisabled();

    await user.type(screen.getByLabelText("search-field"), "a".repeat(49));
    expect(searchButton).toBeEnabled();

    await user.type(screen.getByLabelText("search-field"), "a{enter}");
    expect(searchButton).toBeDisabled();

    await user.clear(screen.getByLabelText("search-field").children[0]);
    await user.type(screen.getByLabelText("search-field"), "aaa");
    expect(searchButton).toBeEnabled();

    userEvent.click(searchButton);

    await waitFor(() => {
      expect(mockRouterPush).toBeCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith(`${Path.top}?q=aaa`);
    });

    const advanceMenuButton = screen.getByText("詳細メニュー").parentElement;
    if (!advanceMenuButton) {
      throw new Error("詳細メニューが見つかりません。");
    }

    userEvent.click(advanceMenuButton);
    await screen.findByText("名前");

    userEvent.click(screen.getByText("名前"));
    userEvent.click(screen.getByText("かな"));
    userEvent.click(screen.getByText("メールアドレス"));
    userEvent.click(screen.getByText("メールアドレス"));
    user.click(screen.getByRole("presentation").children[0]);

    await waitFor(() => {
      expect(screen.queryByText("名前")).toBeInTheDocument;
      expect(screen.queryByText("かな")).toBeInTheDocument;
      expect(screen.queryByText("メールアドレス")).not.toBeInTheDocument;
    });

    await user.type(screen.getByLabelText("search-field"), "{enter}");

    await waitFor(() => {
      expect(mockRouterPush).toBeCalledTimes(2);
      expect(mockRouterPush).toHaveBeenCalledWith(
        `${Path.top}?q=aaa&target=userName&target=kana`
      );
    });
  });

  it("OK: 検索後に遷移したページで検索結果表示", async () => {
    const mock = new MockAdapter(axios);
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);
    mock
      .onGet(
        `${ApiPath.search}?offset=0&limit=100&q=aaa&target=userName&target=kana`
      )
      .reply(200, getMockUsers({}));

    queryObject.query = mockSearchParams;
    const Users = (await import("./Users")).default;
    const { container } = render(<Users />);

    const userNames = await screen.findAllByText(/山田 太郎/);
    expect(userNames.length).toBe(101);

    await waitFor(() => {
      expect(
        container.querySelectorAll(
          `img[src='data:image/png;base64,${mockFileData.data}']`
        ).length
      ).toBe(101);
    });
  });

  it("OK: 検索結果が存在しない", async () => {
    const mock = new MockAdapter(axios);
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);
    mock
      .onGet(
        `${ApiPath.search}?offset=0&limit=100&q=aaa&target=userName&target=kana`
      )
      .reply(200, []);

    queryObject.query = mockSearchParams;
    const Users = (await import("./Users")).default;
    render(<Users />);

    await screen.findByText("検索結果が見つかりません。");
  });

  it("NG: 例外処理", async () => {
    const mock = new MockAdapter(axios);
    const errorMessage = "Internal Server Error";
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);
    mock
      .onGet(
        `${ApiPath.search}?offset=0&limit=100&q=aaa&target=userName&target=kana`
      )
      .reply(500, errorMessage);

    queryObject.query = mockSearchParams;
    const Users = (await import("./Users")).default;
    const { container } = render(<Users />);

    const userNames = await screen.findAllByText(/山田 太郎/);

    await waitFor(() => {
      expect(userNames.length).toBe(1);
      expect(
        container.querySelectorAll(
          `img[src='data:image/png;base64,${mockFileData.data}']`
        ).length
      ).toBe(1);
      expect(
        screen.queryByText("予期せぬエラーが発生しました。")
      ).toBeInTheDocument();
    });
  });
});

describe("画面遷移後のSnackbarテスト", () => {
  it.each<[string, { message: string; statusCode: number }]>([
    [
      "OK: ログイン成功後",
      {
        message: "ログインに成功しました。",
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
      mock.onGet(`${ApiPath.users}?offset=0&limit=100`).reply(200, []);

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

      const Users = (await import("./Users")).default;
      render(<Users />);

      await waitFor(() => {
        expect(screen.queryByText(message)).toBeInTheDocument();
      });
    });
  });
});
