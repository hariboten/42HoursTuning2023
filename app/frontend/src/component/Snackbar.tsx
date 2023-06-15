import { Snackbar as MuiSnackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";

interface Props {
  message: string;
  statusCode: number;
  openSnackbar: boolean;
  handleCloseSnackbar: () => void;
}

const getDefaultErrorMessage = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return "不正なリクエストが発生しました。";
    case 401:
      return "認証に失敗しました。";
    case 404:
      return "リソースが見つかりませんでした。";
    default:
      return "予期せぬエラーが発生しました。";
  }
};

const Snackbar: React.FC<Props> = (props) => {
  return (
    <MuiSnackbar
      open={props.openSnackbar}
      autoHideDuration={5000}
      onClose={props.handleCloseSnackbar}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <Alert
        onClose={props.handleCloseSnackbar}
        severity={props.statusCode < 400 ? "success" : "error"}
      >
        {props.message
          ? props.message
          : getDefaultErrorMessage(props.statusCode)}
      </Alert>
    </MuiSnackbar>
  );
};

export default Snackbar;
