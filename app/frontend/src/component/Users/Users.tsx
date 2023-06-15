import { useCommonHeader } from "@src/hooks/useCommonHeader";
import CommonHeader from "../CommonHeader/CommonHeader";
import Snackbar from "../Snackbar";
import BackdropSpin from "../BackdropSpin";
import { useErrorHandle } from "@src/hooks/useErrorHandle";
import { useSnackbar } from "@src/hooks/useSnackbar";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  OutlinedInput,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { User } from "@src/type/users";
import { ApiPath } from "@src/utils/api";
import UserIconAndName from "../UserIconAndName";
import { LIMIT, useInfiniteScroll } from "@src/hooks/useInfiniteScroll";
import InfiniteScroll from "react-infinite-scroll-component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faSearch } from "@fortawesome/free-solid-svg-icons";
import {
  ChangeEventHandler,
  KeyboardEventHandler,
  useCallback,
  useState,
} from "react";
import { useRouter } from "next/router";
import { Path } from "@src/utils/routerPath";
import qs from "qs";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(9),
  },
  userIcon: {
    width: 120,
    height: 120,
  },
  searchIcon: {
    color: theme.palette.primary.main,
  },
  advanceMenu: {
    fontSize: theme.spacing(2.5),
    color: "#3f72af",
  },
  userList: {
    height: "80vh",
    overflowY: "auto",
  },
  checkIcon: {
    minWidth: theme.spacing(4.5),
  },
}));

const Search: React.FC = () => {
  const classes = useStyles();
  const router = useRouter();
  const [targets, setTargets] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const menuList: { [key: string]: string } = {
    userName: "名前",
    kana: "かな",
    mail: "メールアドレス",
    department: "部署",
    role: "役職",
    office: "拠点",
    skill: "スキル",
    goal: "目標",
  };
  const disable = query.length < 2 || query.length > 50;

  const onClickMenu = useCallback(
    (key: string) => () => {
      const copyTargets = !targets.includes(key)
        ? targets.concat(key)
        : targets.filter((target) => target !== key);

      setTargets(copyTargets);
    },
    [targets]
  );

  const onDeleteChip = useCallback(
    (key: string) => () => {
      const copyTargets = targets.filter((target) => target !== key);
      setTargets(copyTargets);
    },
    [targets]
  );

  const onChangeSearchField: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useCallback((e) => {
    setQuery(e.target.value);
  }, []);

  const onClickSearchIcon = useCallback(() => {
    if (!query) return;
    const params: { [key: string]: string[] } = { target: targets };
    const queryString = qs.stringify(params, { arrayFormat: "repeat" });
    const path = queryString
      ? `${Path.top}?q=${query}&${queryString}`
      : `${Path.top}?q=${query}`;

    router.push(path);
  }, [query, router, targets]);

  const onKeyPressSearchField: KeyboardEventHandler = useCallback(
    (e) => {
      if (!disable && e.key == "Enter") {
        e.preventDefault();
        onClickSearchIcon();
      }
    },
    [disable, onClickSearchIcon]
  );

  const handleOpenMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget),
    []
  );
  const handleCloseMenu = useCallback(() => setAnchorEl(null), []);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <OutlinedInput
          placeholder="2文字以上50文字以下で検索してください（フィルタをかけない場合、全ての項目を対象に検索されます）"
          type="text"
          fullWidth
          value={query}
          onChange={onChangeSearchField}
          onKeyPress={onKeyPressSearchField}
          endAdornment={
            <IconButton
              size="small"
              aria-label="search"
              onClick={onClickSearchIcon}
              disabled={disable}
              className={classes.searchIcon}
            >
              <FontAwesomeIcon icon={faSearch} />
            </IconButton>
          }
          aria-label="search-field"
        />
      </Grid>
      <Grid item>
        <Grid container justifyContent="space-between">
          <Grid item>
            <Grid container spacing={1}>
              {targets.map((target, i) => (
                <Grid item key={i}>
                  <Chip
                    label={menuList[target]}
                    onDelete={onDeleteChip(target)}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
          <Grid item>
            <Button
              variant="text"
              color="primary"
              className={classes.advanceMenu}
              onClick={handleOpenMenu}
            >
              {"詳細メニュー"}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
            >
              {Object.keys(menuList).map((key, i) => (
                <MenuItem key={i} value={key} onClick={onClickMenu(key)}>
                  <ListItemIcon className={classes.checkIcon}>
                    {targets.includes(key) && (
                      <FontAwesomeIcon icon={faCheck} />
                    )}
                  </ListItemIcon>
                  <ListItemText>{menuList[key]}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

const Users: React.FC = () => {
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

  const queryParams = router.query;
  const queryString = qs.stringify(queryParams, { arrayFormat: "repeat" });
  const apiPath = !queryParams?.q
    ? `${ApiPath.users}?offset={offset}&limit=${LIMIT}`
    : `${ApiPath.search}?offset={offset}&limit=${LIMIT}&${queryString}`;

  const {
    data,
    isLoading: getUsersLoading,
    nextFetcher,
    hasMore,
  } = useInfiniteScroll<User[]>({
    apiPath: apiPath,
    handleError,
  });

  if (isLoading || getUsersLoading) return <BackdropSpin />;

  return (
    <>
      <CommonHeader
        title={"ユーザー一覧"}
        userName={userName}
        userIconFileData={userIconFileData}
        onLogout={onLogout}
      />
      <Container maxWidth="lg" className={classes.container}>
        <Grid container direction="column" spacing={8}>
          <Grid item>
            <Search />
          </Grid>
          {data?.length === 0 && (
            <Box marginTop={4}>
              <Grid container justifyContent="center" alignItems="center">
                <Grid item>
                  <Typography variant="h6">
                    {!queryParams?.q
                      ? "ユーザーが存在しません。"
                      : "検索結果が見つかりません。"}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
          <Grid
            item
            className={classes.userList}
            id="users-infinite-scroll-parent"
          >
            <InfiniteScroll
              dataLength={data?.length || 0}
              next={nextFetcher}
              hasMore={data ? hasMore : false}
              loader={
                <Box height={"50px"}>
                  <Grid container justifyContent="center">
                    <Grid item>
                      <CircularProgress color="primary" />
                    </Grid>
                  </Grid>
                </Box>
              }
              style={{ overflow: "hidden" }}
              scrollableTarget="users-infinite-scroll-parent"
            >
              <Grid container spacing={4}>
                {data?.map((user, index) => (
                  <Grid item key={index}>
                    <UserIconAndName
                      userIconId={user.userIcon.fileId}
                      userName={user.userName}
                      handleError={handleError}
                      iconClassName={classes.userIcon}
                      gridSpacing={1}
                    />
                  </Grid>
                ))}
              </Grid>
            </InfiniteScroll>
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

export default Users;
