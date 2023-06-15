import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { ApiPath } from "@src/utils/api";
import { mockLoginInfo, mockSession } from "@src/type/session";
import userEvent from "@testing-library/user-event";
import { Path } from "@src/utils/routerPath";
import { render, screen, waitFor } from "@src/utils/testRender";

const mockRouterPush = jest.fn();
jest.mock("next/router", () => {
  const module = jest.requireActual("next/router");
  return {
    __esModule: true,
    ...module,
    useRouter: () => ({
      push: mockRouterPush,
      pathname: Path.login,
    }),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("ログイン", () => {
  it("OK: ログイン成功", async () => {
    const mock = new MockAdapter(axios);
    mock.onPost(ApiPath.session, mockLoginInfo).reply(201, mockSession);

    const Login = (await import("./Login")).default;
    render(<Login />);
    const submitButton = (await screen.findByText("ログイン")).parentElement;
    if (!submitButton) {
      throw new Error("ログインボタンが見つかりません。");
    }
    expect(submitButton).toBeDisabled();

    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("メールアドレス"),
      `${mockLoginInfo.mail}{enter}`
    );
    expect(submitButton).toBeDisabled();

    await user.type(
      screen.getByPlaceholderText("パスワード"),
      mockLoginInfo.password
    );
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRouterPush).toBeCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith(Path.top);
    });
  });

  it("NG: 認証失敗", async () => {
    const mock = new MockAdapter(axios);

    const errorMessage = "メールアドレスまたはパスワードが正しくありません。";
    mock.onPost(ApiPath.session, mockLoginInfo).reply(401, {
      message: errorMessage,
    });

    const Login = (await import("./Login")).default;
    render(<Login />);
    const submitButton = (await screen.findByText("ログイン")).parentElement;
    if (!submitButton) {
      throw new Error("ログインボタンが見つかりません。");
    }
    expect(submitButton).toBeDisabled();

    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("メールアドレス"),
      mockLoginInfo.mail
    );
    expect(submitButton).toBeDisabled();

    await user.type(
      screen.getByPlaceholderText("パスワード"),
      mockLoginInfo.password
    );
    expect(submitButton).toBeEnabled();

    await user.type(screen.getByPlaceholderText("パスワード"), "{enter}");

    await waitFor(() => {
      expect(screen.queryByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("NG: 例外発生", async () => {
    const mock = new MockAdapter(axios);

    const errorMessage = "Internal Server Error";
    mock.onPost(ApiPath.session, mockLoginInfo).reply(500, {
      message: errorMessage,
    });

    const Login = (await import("./Login")).default;
    render(<Login />);
    const submitButton = (await screen.findByText("ログイン")).parentElement;
    if (!submitButton) {
      throw new Error("ログインボタンが見つかりません。");
    }
    expect(submitButton).toBeDisabled();

    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("メールアドレス"),
      mockLoginInfo.mail
    );
    expect(submitButton).toBeDisabled();

    await user.type(
      screen.getByPlaceholderText("パスワード"),
      mockLoginInfo.password
    );
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.queryByText("予期せぬエラーが発生しました。")
      ).toBeInTheDocument();
    });
  });
});

describe("画面遷移後のSnackbarテスト", () => {
  it.each<[string, { message: string; statusCode: number }]>([
    [
      "OK: ログアウト成功後",
      {
        message: "ログアウトに成功しました。",
        statusCode: 204,
      },
    ],
    [
      "NG: 認可失敗後",
      {
        message: "認可に失敗しました。",
        statusCode: 401,
      },
    ],
  ])("%s", async (_, { message, statusCode }) => {
    await jest.isolateModules(async () => {
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

      const Login = (await import("./Login")).default;
      render(<Login />);

      await waitFor(() => {
        expect(screen.queryByText(message)).toBeInTheDocument();
      });
    });
  });
});
