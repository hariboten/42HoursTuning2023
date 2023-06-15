import { useCommonHeader } from "@src/hooks/useCommonHeader";
import { useErrorHandle } from "@src/hooks/useErrorHandle";
import { useSnackbar } from "@src/hooks/useSnackbar";
import BackdropSpin from "../BackdropSpin";
import CommonHeader from "../CommonHeader/CommonHeader";
import {
  AppBar,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  makeStyles,
} from "@material-ui/core";
import Snackbar from "../Snackbar";
import { Field, Form, useField, useForm } from "react-final-form";
import {
  MatchGroupDetail,
  MatchGroupForCreate,
  departmentFilter,
  initialMatchGroupForCreate,
  officeFilter,
} from "@src/type/matchGroups";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import React, {
  ChangeEventHandler,
  KeyboardEventHandler,
  useCallback,
  useState,
} from "react";
import NextLink from "next/link";
import { Path } from "@src/utils/routerPath";
import { ApiPath, apiRequest } from "@src/utils/api";
import { useAsyncFn } from "react-use";
import { useRouter } from "next/router";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(9),
  },
  requiredLabl: {
    borderRadius: "0.25rem",
    background: theme.palette.error.dark,
    padding: theme.spacing(0, 0.5),
    color: theme.palette.background.default,
  },
  numOfMember: {
    maxWidth: theme.spacing(12),
  },
  filterSelect: {
    maxWidth: theme.spacing(28),
  },
  skillFilterGrid: {
    marginTop: theme.spacing(2),
  },
  skillFilter: {
    maxWidth: theme.spacing(64),
  },
  questionIcon: {
    color: theme.palette.action.active,
  },
  filterIcon: {
    color: "#3f72af",
  },
  footer: {
    top: "auto",
    bottom: 0,
    backgroundColor: theme.palette.background.paper,
  },
  actionButton: {
    fontSize: theme.spacing(2.5),
  },
  saveButton: {
    backgroundColor: "#3f72af",
  },
  toolbar: {
    padding: theme.spacing(2, 3),
  },
  length: {
    textAlign: "right",
  },
}));

const ActionButtonFooter: React.FC = () => {
  const classes = useStyles();
  const { submit, getState } = useForm<MatchGroupForCreate>();

  const { hasValidationErrors, dirty, values } = getState();

  return (
    <AppBar position="fixed" component="footer" className={classes.footer}>
      <Divider />
      <Toolbar className={classes.toolbar}>
        <Grid container justifyContent="flex-end" spacing={2}>
          <Grid item>
            <NextLink href={Path.matchGroups}>
              <Button
                variant="outlined"
                color="default"
                size="large"
                className={classes.actionButton}
              >
                {"キャンセル"}
              </Button>
            </NextLink>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              size="large"
              disabled={hasValidationErrors || !dirty || !values.matchGroupName}
              onClick={submit}
              className={clsx(classes.actionButton, classes.saveButton)}
            >
              {"保存"}
            </Button>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

interface Props {
  skillName: string;
}

const ChipItem: React.FC<Props> = (props) => {
  const {
    input: { value: skills, onChange: onChangeSkills },
  } = useField<string[]>("skillFilter");

  const onDelete = useCallback(() => {
    const filteredSkills = skills.filter((skill) => skill !== props.skillName);
    onChangeSkills(filteredSkills);
  }, [onChangeSkills, props.skillName, skills]);

  return <Chip label={props.skillName} onDelete={onDelete} />;
};

const CreateMatchGroupField: React.FC = () => {
  const classes = useStyles();

  const {
    input: { value: skills, onChange: onChangeSkills },
  } = useField<string[]>("skillFilter");
  const { getState } = useForm<MatchGroupForCreate>();
  const { dirty } = getState();

  const [skillInput, setSkillInput] = useState("");

  const onChangeSkillInput: ChangeEventHandler<
    HTMLTextAreaElement | HTMLInputElement
  > = useCallback((e) => {
    setSkillInput(e.target.value);
  }, []);

  const onClick = useCallback(() => {
    if (!skillInput || skills.some((skill) => skill === skillInput)) {
      setSkillInput("");
      return;
    }
    onChangeSkills([...skills, skillInput]);
    setSkillInput("");
  }, [onChangeSkills, skillInput, skills]);

  const onKeyPress: KeyboardEventHandler = useCallback(
    (e) => {
      if (e.key == "Enter" && skillInput) {
        e.preventDefault();
        onClick();
      }
    },
    [onClick, skillInput]
  );

  const matchGroupLimit = 50;
  const descriptionLimit = 120;

  const onRequiredError = useCallback(
    (value: string) => {
      return dirty && !value;
    },
    [dirty]
  );
  const onLimitError = useCallback((value: string, limit: number) => {
    return value.length > limit;
  }, []);

  return (
    <Grid container direction="column" spacing={8}>
      <Grid item>
        <Grid container spacing={4}>
          <Grid item xs={7}>
            <Field<string>
              name="matchGroupName"
              validate={(value: string) =>
                onRequiredError(value || "") ||
                onLimitError(value || "", matchGroupLimit)
              }
            >
              {({ input }) => {
                const requiredError = onRequiredError(input.value || "");
                const limitError = onLimitError(
                  input.value || "",
                  matchGroupLimit
                );

                return (
                  <Grid container direction="column" spacing={1}>
                    <Grid item>
                      <Grid container spacing={1} alignItems="center">
                        <Grid item>
                          <Typography variant="body2" color="textSecondary">
                            {"マッチグループ名"}
                          </Typography>
                        </Grid>
                        <Grid item>
                          <div className={classes.requiredLabl}>
                            <Typography variant="caption">{"必須"}</Typography>
                          </div>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item>
                      <TextField
                        placeholder="雑談グループ"
                        variant="outlined"
                        type="text"
                        fullWidth
                        onChange={input.onChange}
                        error={requiredError || limitError}
                        helperText={
                          requiredError
                            ? "必須項目です。"
                            : limitError
                            ? "文字数が超過しています。"
                            : ""
                        }
                      />
                    </Grid>
                    <Grid item className={classes.length}>
                      <Typography variant="caption" color="textPrimary">
                        {`${
                          input.value ? input.value.length : 0
                        }/${matchGroupLimit}`}
                      </Typography>
                    </Grid>
                  </Grid>
                );
              }}
            </Field>
          </Grid>
          <Grid item xs={5}>
            <Field<number> name="numOfMembers">
              {({ input }) => (
                <Grid container direction="column" spacing={1}>
                  <Grid item>
                    <Typography variant="body2" color="textSecondary">
                      {"参加人数"}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Select
                      variant="outlined"
                      fullWidth
                      onChange={input.onChange}
                      defaultValue={4}
                      className={classes.numOfMember}
                    >
                      {[...Array(7)].map((_, i) => {
                        const index = i + 2;

                        return (
                          <MenuItem key={index} value={index}>
                            {`${index}人`}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </Grid>
                </Grid>
              )}
            </Field>
          </Grid>
          <Grid item xs={12}>
            <Field<string>
              name="description"
              validate={(value: string) =>
                onLimitError(value || "", descriptionLimit)
              }
            >
              {({ input }) => {
                const limitError = onLimitError(
                  input.value || "",
                  descriptionLimit
                );

                return (
                  <Grid container direction="column" spacing={1}>
                    <Grid item>
                      <Typography variant="body2" color="textSecondary">
                        {"マッチグループの説明"}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <TextField
                        placeholder="雑談するためのグループです。"
                        // defaultValue={initialMatchGroupForCreate.description}
                        variant="outlined"
                        multiline
                        minRows={2}
                        type="text"
                        fullWidth
                        onChange={input.onChange}
                        error={limitError}
                        helperText={
                          limitError ? "文字数が超過しています。" : ""
                        }
                      />
                    </Grid>
                    <Grid item className={classes.length}>
                      <Typography variant="caption" color="textPrimary">
                        {`${
                          input.value ? input.value.length : 0
                        }/${descriptionLimit}`}
                      </Typography>
                    </Grid>
                  </Grid>
                );
              }}
            </Field>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <Grid container alignItems="center" spacing={1}>
              <Grid item>
                <Typography variant="subtitle1">{"マッチング条件"}</Typography>
              </Grid>
              <Grid item>
                <Tooltip
                  title="設定したフィルタに該当する社員からグループを作成します。（それぞれのフィルタはAND条件）"
                  placement="right"
                >
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    className={classes.questionIcon}
                  />
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container alignItems="center" spacing={4}>
              <Grid item xs={3}>
                <Field<departmentFilter> name="departmentFilter">
                  {({ input }) => (
                    <Grid container direction="column" spacing={1}>
                      <Grid item>
                        <Typography variant="body2" color="textSecondary">
                          {"部署"}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Select
                          variant="outlined"
                          fullWidth
                          onChange={input.onChange}
                          defaultValue={"none"}
                          className={classes.filterSelect}
                        >
                          <MenuItem value={"onlyMyDepartment"}>
                            {"自部署の社員のみ対象"}
                          </MenuItem>
                          <MenuItem value={"excludeMyDepartment"}>
                            {"他部署の社員のみ対象"}
                          </MenuItem>
                          <MenuItem value={"none"}>{"指定しない"}</MenuItem>
                        </Select>
                      </Grid>
                    </Grid>
                  )}
                </Field>
              </Grid>
              <Grid item xs={3}>
                <Field<officeFilter> name="officeFilter">
                  {({ input }) => (
                    <Grid container direction="column" spacing={1}>
                      <Grid item>
                        <Typography variant="body2" color="textSecondary">
                          {"拠点"}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Select
                          variant="outlined"
                          fullWidth
                          onChange={input.onChange}
                          defaultValue={"none"}
                          className={classes.filterSelect}
                        >
                          <MenuItem value={"onlyMyOffice"}>
                            {"自拠点の社員のみ対象"}
                          </MenuItem>
                          <MenuItem value={"excludeMyOffice"}>
                            {"他拠点の社員のみ対象"}
                          </MenuItem>
                          <MenuItem value={"none"}>{"指定しない"}</MenuItem>
                        </Select>
                      </Grid>
                    </Grid>
                  )}
                </Field>
              </Grid>
              <Grid item xs={6}>
                <Field<boolean> name="neverMatchedFilter">
                  {({ input }) => (
                    <Grid container alignItems="center">
                      <Grid item>
                        <Checkbox
                          aria-label="neverMatchedFilter"
                          color="primary"
                          onChange={input.onChange}
                        ></Checkbox>
                      </Grid>
                      <Grid item>
                        <Typography variant="body1" color="textSecondary">
                          {"過去にマッチングしていない社員のみ対象"}
                        </Typography>
                      </Grid>
                    </Grid>
                  )}
                </Field>
              </Grid>
            </Grid>
          </Grid>
          <Grid item className={classes.skillFilterGrid}>
            <Field<string[]> name="skillFilter">
              {() => (
                <Grid container direction="column" spacing={1}>
                  <Grid item>
                    <Grid container alignItems="center" spacing={1}>
                      <Grid item>
                        <Typography variant="body2" color="textSecondary">
                          {"スキル"}
                        </Typography>
                      </Grid>
                      <Grid item>
                        <Tooltip
                          title="指定したスキル名を設定している社員のみマッチング対象です。（複数指定の場合はOR条件）"
                          placement="right"
                        >
                          <FontAwesomeIcon
                            icon={faQuestionCircle}
                            className={classes.questionIcon}
                          />
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <OutlinedInput
                      placeholder="基本情報技術者試験"
                      type="text"
                      fullWidth
                      value={skillInput}
                      onChange={onChangeSkillInput}
                      onKeyPress={onKeyPress}
                      endAdornment={
                        <IconButton
                          size="small"
                          aria-label="filter"
                          onClick={onClick}
                          className={classes.filterIcon}
                        >
                          <FontAwesomeIcon icon={faFilter} />
                        </IconButton>
                      }
                      className={classes.skillFilter}
                    />
                  </Grid>
                  <Grid item>
                    <Grid container spacing={1}>
                      {skills.map((skill, i) => (
                        <Grid item key={i}>
                          <ChipItem skillName={skill} />
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Field>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const CreateMatchGroup: React.FC = () => {
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
  const { userName, userIconFileData, isLoading, onLogout } = useCommonHeader({
    handleError,
    setMessage,
    setOpenSnackbar,
    setStatusCode,
  });

  const [state, onSubmit] = useAsyncFn(
    async (matchGroupForCreate: MatchGroupForCreate) => {
      try {
        const { status } = await apiRequest<
          MatchGroupDetail,
          MatchGroupForCreate
        >("post", ApiPath.matchGroups, {
          ...matchGroupForCreate,
          description: matchGroupForCreate.description || "",
        });
        setOpenSnackbar(true);
        setMessage("マッチグループの作成に成功しました。");
        setStatusCode(status);

        router.push(Path.matchGroups);
      } catch (error) {
        handleError(error as Error);
      }
    },
    []
  );

  if (isLoading || state.loading) return <BackdropSpin />;

  return (
    <>
      <CommonHeader
        title="マッチグループ作成"
        userName={userName}
        userIconFileData={userIconFileData}
        onLogout={onLogout}
        subHeaderTitle="一覧に戻る"
      />
      <Container maxWidth="md" className={classes.container}>
        <Form<MatchGroupForCreate>
          onSubmit={onSubmit}
          initialValues={initialMatchGroupForCreate}
          render={() => {
            return (
              <>
                <CreateMatchGroupField />
                <ActionButtonFooter />
              </>
            );
          }}
        ></Form>
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

export default CreateMatchGroup;
