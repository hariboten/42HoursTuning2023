import {
  Button,
  Container,
  Grid,
  TextField,
  makeStyles,
} from "@material-ui/core";
import { LoginInfo, Session } from "@src/type/session";
import { ApiPath, apiRequest } from "@src/utils/api";
import { Path } from "@src/utils/routerPath";
import { useRouter } from "next/router";
import { Form, Field, useForm } from "react-final-form";
import { useAsyncFn } from "react-use";
import BackdropSpin from "../BackdropSpin";
import Snackbar from "../Snackbar";
import { useErrorHandle } from "@src/hooks/useErrorHandle";
import { useSnackbar } from "@src/hooks/useSnackbar";
import { useCallback, KeyboardEventHandler } from "react";

const useStyles = makeStyles((theme) => ({
  fullWidthButton: {
    width: "100%",
    backgroundColor: "#3f72af",
  },
  container: {
    marginTop: theme.spacing(5),
  },
  gridContainer: {
    height: "100vh",
  },
  logo: {
    height: "120px",
    width: "100%",
    objectFit: "none",
  },
}));

const LoginFormRender: React.FC = () => {
  const classes = useStyles();
  const { submit, getState } = useForm<LoginInfo>();

  const values = getState().values;
  const disabled = !values.mail || !values.password;

  const onKeyPress: KeyboardEventHandler = useCallback(
    (e) => {
      if (e.key == "Enter" && !disabled) {
        e.preventDefault();
        submit();
      }
    },
    [disabled, submit]
  );

  return (
    <Grid container direction="column" spacing={4}>
      <Grid item>
        <Field<string> name="mail">
          {({ input }) => (
            <TextField
              label="mail"
              placeholder="メールアドレス"
              variant="outlined"
              type="email"
              required
              fullWidth
              onChange={input.onChange}
              onKeyPress={onKeyPress}
            />
          )}
        </Field>
      </Grid>
      <Grid item>
        <Field<string> name="password">
          {({ input }) => (
            <TextField
              label="password"
              placeholder="パスワード"
              variant="outlined"
              type="password"
              required
              fullWidth
              onChange={input.onChange}
              onKeyPress={onKeyPress}
            />
          )}
        </Field>
      </Grid>
      <Grid item>
        <Button
          variant="contained"
          color="primary"
          type="submit"
          className={classes.fullWidthButton}
          onClick={submit}
          disabled={disabled}
        >
          {"ログイン"}
        </Button>
      </Grid>
    </Grid>
  );
};

const Login: React.FC = () => {
  const classes = useStyles();
  const router = useRouter();

  const {
    message,
    setMessage,
    openSnackbar,
    setOpenSnackbar,
    handleCloseSnackbar,
    statusCode,
    setStatusCode,
  } = useSnackbar();
  const { handleError } = useErrorHandle({
    setMessage,
    setOpenSnackbar,
    setStatusCode,
  });

  const [state, onLogin] = useAsyncFn(async (loginInfo: LoginInfo) => {
    try {
      const { status } = await apiRequest<Session, LoginInfo>(
        "post",
        ApiPath.session,
        loginInfo
      );
      setOpenSnackbar(true);
      setMessage("ログインに成功しました。");
      setStatusCode(status);

      router.push(Path.top);
    } catch (error) {
      handleError(error as Error);
    }
  }, []);

  if (state.loading) return <BackdropSpin />;

  return (
    <>
      <Container maxWidth="sm" className={classes.container}>
        <Grid
          container
          alignItems="center"
          justifyContent="center"
          className={classes.gridContainer}
        >
          <Grid item xs={12}>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <img
                  src="/login_logo.png"
                  alt="ロゴ"
                  className={classes.logo}
                />
              </Grid>
              <Grid item xs={12}>
                <Form<LoginInfo>
                  onSubmit={onLogin}
                  render={() => {
                    return <LoginFormRender />;
                  }}
                ></Form>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
      <Snackbar
        message={message || ""}
        statusCode={statusCode || 0}
        openSnackbar={openSnackbar || false}
        handleCloseSnackbar={handleCloseSnackbar}
      />
    </>
  );
};

export default Login;
