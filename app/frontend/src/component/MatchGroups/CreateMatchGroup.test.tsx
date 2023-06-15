import {
  mockMatchGroupDetail,
  mockMatchGroupForCreate,
} from "@src/type/matchGroups";
import { ApiPath } from "@src/utils/api";
import { Path } from "@src/utils/routerPath";
import { render, screen, waitFor } from "@src/utils/testRender";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import CreateMatchGroup from "./CreateMatchGroup";
import userEvent from "@testing-library/user-event";
import { mockUser } from "@src/type/users";
import { mockFileData } from "@src/type/files";

let mockRouterPush: jest.Mock;
beforeEach(() => {
  mockRouterPush = jest.fn();
});
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

describe("マッチグループ作成", () => {
  const skills = ["基本情報技術者試験", "応用情報技術者試験"];

  it("OK: マッチグループ作成成功", async () => {
    const mock = new MockAdapter(axios);
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);
    mock
      .onPost(ApiPath.matchGroups, {
        ...mockMatchGroupForCreate,
        description: "",
      })
      .reply(201, mockMatchGroupDetail);

    render(<CreateMatchGroup />);
    const submitButton = (await screen.findByText("保存")).parentElement;
    if (!submitButton) {
      throw new Error("保存ボタンが見つかりません。");
    }
    expect(submitButton).toBeDisabled();

    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("雑談グループ"),
      mockMatchGroupForCreate.matchGroupName
    );
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRouterPush).toBeCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith(Path.matchGroups);
    });
  });

  it("OK: validate", async () => {
    const mock = new MockAdapter(axios);
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);

    render(<CreateMatchGroup />);
    const submitButton = (await screen.findByText("保存")).parentElement;
    if (!submitButton) {
      throw new Error("保存ボタンが見つかりません。");
    }
    expect(submitButton).toBeDisabled();

    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("雑談するためのグループです。"),
      "a"
    );
    await waitFor(() => {
      expect(screen.queryByText("必須項目です。")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    await user.type(screen.getByPlaceholderText("雑談グループ"), "a");
    expect(submitButton).toBeEnabled();

    await user.type(screen.getByPlaceholderText("雑談グループ"), "{backspace}");
    await waitFor(() => {
      expect(screen.queryByText("必須項目です。")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    await user.type(
      screen.getByPlaceholderText("雑談グループ"),
      "a".repeat(51)
    );
    await waitFor(() => {
      expect(
        screen.queryByText("文字数が超過しています。")
      ).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    await user.type(screen.getByPlaceholderText("雑談グループ"), "{backspace}");
    await waitFor(() => {
      expect(
        screen.queryByText("文字数が超過しています。")
      ).not.toBeInTheDocument();
      expect(submitButton).toBeEnabled();
    });

    await user.type(
      screen.getByPlaceholderText("雑談するためのグループです。"),
      "a".repeat(120)
    );
    await waitFor(() => {
      expect(
        screen.queryByText("文字数が超過しています。")
      ).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    await user.type(
      screen.getByPlaceholderText("雑談するためのグループです。"),
      "{backspace}"
    );
    await waitFor(() => {
      expect(
        screen.queryByText("文字数が超過しています。")
      ).not.toBeInTheDocument();
      expect(submitButton).toBeEnabled();
    });
  });

  it("OK: 複数フィルタ条件指定", async () => {
    const mock = new MockAdapter(axios);
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);

    mock
      .onPost(ApiPath.matchGroups, {
        ...mockMatchGroupForCreate,
        description: "",
        numOfMembers: 8,
        departmentFilter: "onlyMyDepartment",
        officeFilter: "excludeMyOffice",
        skillFilter: skills,
        neverMatchedFilter: true,
      })
      .reply(201, { ...mockMatchGroupDetail, description: "" });

    render(<CreateMatchGroup />);
    const submitButton = (await screen.findByText("保存")).parentElement;
    if (!submitButton) {
      throw new Error("保存ボタンが見つかりません。");
    }
    expect(submitButton).toBeDisabled();

    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("雑談グループ"),
      mockMatchGroupForCreate.matchGroupName
    );
    expect(submitButton).toBeEnabled();

    await user.click(screen.getByText("4人"));
    await user.click(screen.getByText("8人"));

    await user.type(
      screen.getByPlaceholderText("雑談するためのグループです。"),
      "a"
    );
    await user.type(
      screen.getByPlaceholderText("雑談するためのグループです。"),
      "{backspace}"
    );

    const filterSelectBox = screen.getAllByText("指定しない");
    await user.click(filterSelectBox[0]);
    await user.click(screen.getByText("自部署の社員のみ対象"));
    await user.click(filterSelectBox[1]);
    await user.click(screen.getByText("他拠点の社員のみ対象"));

    await user.click(
      screen.getByLabelText("neverMatchedFilter").children[0].children[0]
    );

    const skillField = screen.getByPlaceholderText(skills[0]);
    await user.type(skillField, `${skills[0]}{enter}`);
    await user.type(skillField, "test{enter}");
    await user.type(skillField, `${skills[1]}`);
    await user.click(screen.getByLabelText("filter"));
    await user.type(skillField, `${skills[1]}`);
    await user.click(screen.getByLabelText("filter"));

    await waitFor(() => {
      expect(screen.queryAllByText(skills[0]).length).toBe(1);
      expect(screen.queryByText("test")).toBeInTheDocument();
      expect(screen.queryAllByText(skills[1]).length).toBe(1);
    });

    const testChip = screen.getByText("test").parentElement;
    if (!testChip) {
      throw new Error("testのスキルチップが作成されていません。");
    }

    user.click(testChip.children[1]);
    await waitFor(() => {
      expect(screen.queryByText("test")).not.toBeInTheDocument();
    });

    expect(submitButton).toBeEnabled();
    user.click(submitButton);

    await waitFor(() => {
      expect(mockRouterPush).toBeCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith(Path.matchGroups);
    });
  });

  it("NG: スキルが存在しない", async () => {
    const mock = new MockAdapter(axios);

    const errorMessage = "testはスキルとして登録されていません。";
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);
    mock
      .onPost(ApiPath.matchGroups, {
        ...mockMatchGroupForCreate,
        description: "",
        skillFilter: ["test"],
      })
      .reply(400, {
        message: errorMessage,
      });

    render(<CreateMatchGroup />);
    const submitButton = (await screen.findByText("保存")).parentElement;
    if (!submitButton) {
      throw new Error("保存ボタンが見つかりません。");
    }
    expect(submitButton).toBeDisabled();

    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("雑談グループ"),
      mockMatchGroupForCreate.matchGroupName
    );
    expect(submitButton).toBeEnabled();

    await user.type(screen.getByPlaceholderText(skills[0]), "test{enter}");
    await waitFor(() => {
      expect(screen.queryByText("test")).toBeInTheDocument();
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("NG: 例外処理", async () => {
    const mock = new MockAdapter(axios);

    const errorMessage = "Internal Server Error";
    mock.onGet(ApiPath.loginUser).reply(200, mockUser);
    mock
      .onGet(ApiPath.userIcon.replace("{userIconId}", mockUser.userIcon.fileId))
      .reply(200, mockFileData);
    mock
      .onPost(ApiPath.matchGroups, {
        ...mockMatchGroupForCreate,
        description: "",
      })
      .reply(500, {
        message: errorMessage,
      });

    render(<CreateMatchGroup />);
    const submitButton = (await screen.findByText("保存")).parentElement;
    if (!submitButton) {
      throw new Error("保存ボタンが見つかりません。");
    }
    expect(submitButton).toBeDisabled();

    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText("雑談グループ"),
      mockMatchGroupForCreate.matchGroupName
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
