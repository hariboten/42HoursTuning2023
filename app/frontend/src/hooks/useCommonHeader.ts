import { FileData } from "@src/type/files";
import { User } from "@src/type/users";
import { ApiPath, apiRequest } from "@src/utils/api";
import useSWR from "swr";
import { useAsyncFn, useToggle } from "react-use";
import { Session } from "@src/type/session";
import { useRouter } from "next/router";
import { Path } from "@src/utils/routerPath";

interface Props {
  handleError: (error: Error) => void;
  setMessage: (message: string) => void;
  setOpenSnackbar: (open: boolean) => void;
  setStatusCode: (statusCode: number) => void;
}

export const useCommonHeader = (props: Props) => {
  const [transition, setTransition] = useToggle(false);

  const { data: userData, isLoading: getUserLoading } = useSWR(
    ApiPath.loginUser,
    async (url) => (await apiRequest<User>("get", url)).data,
    { onError: props.handleError }
  );

  const { data: userIconData, isLoading: getUserIconLoading } = useSWR(
    userData && userData.userId
      ? ApiPath.userIcon.replace("{userIconId}", userData.userIcon.fileId)
      : undefined,
    async (url) => (await apiRequest<FileData>("get", url)).data,
    { onError: props.handleError }
  );

  const router = useRouter();
  const [state, onLogout] = useAsyncFn(async () => {
    try {
      const { status } = await apiRequest<Session>("delete", ApiPath.session);
      props.setOpenSnackbar(true);
      props.setMessage("ログアウトに成功しました。");
      props.setStatusCode(status);
      setTransition(true);

      router.push(Path.login);
    } catch (error) {
      props.handleError(error as Error);
    }
  }, []);

  return {
    userId: userData?.userId,
    userName: userData ? userData.userName : "",
    userIconFileData: userIconData?.data,
    isLoading:
      getUserLoading || getUserIconLoading || state.loading || transition,
    onLogout,
  };
};
