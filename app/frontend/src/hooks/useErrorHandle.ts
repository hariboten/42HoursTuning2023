import { ErrorData } from "@src/utils/api";
import { Path } from "@src/utils/routerPath";
import axios from "axios";
import { useRouter } from "next/router";
import { useCallback } from "react";

interface Props {
  setMessage: (message: string) => void;
  setOpenSnackbar: (open: boolean) => void;
  setStatusCode: (statusCode: number) => void;
}

export const useErrorHandle = (props: Props) => {
  const router = useRouter();

  const handleError = useCallback(
    (error: Error) => {
      console.error(error);
      if (axios.isAxiosError(error) && error.response) {
        const {
          status: statusCode,
          data: errorData,
        }: { status: number; data: ErrorData } = error.response;

        props.setStatusCode(statusCode);

        if (statusCode === 401 && router.pathname !== Path.login) {
          props.setOpenSnackbar(true);
          props.setMessage("認可に失敗しました。");

          router.push(Path.login);
          return;
        }
        props.setOpenSnackbar(true);

        (!errorData || !errorData.message) && props.setMessage("");

        errorData &&
          errorData.message &&
          (errorData.message !== "Internal Server Error"
            ? props.setMessage(errorData.message)
            : props.setMessage(""));
      }
    },
    [props, router]
  );

  return {
    handleError,
  };
};
