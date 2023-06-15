import { mockFileData } from "@src/type/files";
import { getMockUsers, mockUser } from "@src/type/users";
import { ApiPath } from "@src/utils/api";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import Users from "../Users/Users";
import { render, screen, waitFor } from "@src/utils/testRender";
import { Path } from "@src/utils/routerPath";
import userEvent from "@testing-library/user-event";

const mockRouterPush = jest.fn();
jest.mock("next/router", () => {
  const module = jest.requireActual("next/router");
  return {
    __esModule: true,
    ...module,
    useRouter: () => ({
      push: mockRouterPush,
    }),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("ログインユーザー表示", () => {
  it("OK: ログインユーザー情報とそのアイコンを取得し、共通ヘッダーを正常に表示できていること", async () => {
    const mock = new MockAdapter(axios);
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);
    mock.onGet(`${ApiPath.users}?offset=0&limit=100`).reply(200, []);

    const { container } = render(<Users />);
    await waitFor(() => {
      expect(screen.queryByText(mockUser.userName)).toBeInTheDocument();
      expect(
        container.querySelectorAll(
          `img[src='data:image/png;base64,${mockFileData.data}']`
        ).length
      ).toBe(1);
    });
  });

  it("NG: 認可失敗", async () => {
    const mock = new MockAdapter(axios);
    mock.onGet(ApiPath.loginUser).reply(401);

    render(<Users />);

    await waitFor(() => {
      expect(mockRouterPush).toBeCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith(Path.login);
    });
  });

  it("NG: ログインユーザー情報の取得失敗", async () => {
    const mock = new MockAdapter(axios);
    const errorMessage = "ユーザーが見つかりませんでした。";
    mock.onGet(ApiPath.loginUser).reply(404, { message: errorMessage });
    mock.onGet(`${ApiPath.users}?offset=0&limit=100`).reply(200, []);

    const { container } = render(<Users />);
    await waitFor(() => {
      expect(screen.queryByText("山田 太郎")).not.toBeInTheDocument();
      expect(
        container.querySelectorAll(
          `img[src='data:image/png;base64,${mockFileData.data}']`
        ).length
      ).toBe(0);
      expect(
        screen.queryByText("リソースが見つかりませんでした。")
      ).toBeInTheDocument();
    });
  });

  it("NG: ログインユーザーアイコンの取得失敗", async () => {
    const mock = new MockAdapter(axios);
    const errorMessage = "Internal Server Error";
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(500, { message: errorMessage });
    mock.onGet(`${ApiPath.users}?offset=0&limit=100`).reply(200, []);

    const { container } = render(<Users />);
    await waitFor(() => {
      expect(screen.queryByText(mockUser.userName)).toBeInTheDocument();
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

describe("ログアウト", () => {
  it("OK: ログアウト成功", async () => {
    const mock = new MockAdapter(axios);
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);
    mock
      .onGet(`${ApiPath.users}?offset=0&limit=100`)
      .reply(200, getMockUsers({}));
    mock.onDelete(ApiPath.session).reply(204);

    render(<Users />);
    const userName = await screen.findByText("山田 太郎");

    const user = userEvent.setup();
    await user.click(userName);

    const logoutMenuItem = await screen.findByText("ログアウト");
    await user.click(logoutMenuItem);

    await waitFor(() => {
      expect(mockRouterPush).toBeCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith(Path.login);
    });
  });

  it("NG: 例外発生", async () => {
    const mock = new MockAdapter(axios);
    const errorMessage = "Internal Server Error";
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);
    mock.onGet(`${ApiPath.users}?offset=0&limit=100`).reply(200, []);
    mock.onDelete(ApiPath.session).reply(500, { message: errorMessage });

    render(<Users />);
    const userName = await screen.findByText("山田 太郎");

    const user = userEvent.setup();
    await user.click(userName);

    const logoutMenuItem = await screen.findByText("ログアウト");
    await user.click(logoutMenuItem);

    await waitFor(() => {
      expect(
        screen.queryByText("予期せぬエラーが発生しました。")
      ).toBeInTheDocument();
    });
  });
});
