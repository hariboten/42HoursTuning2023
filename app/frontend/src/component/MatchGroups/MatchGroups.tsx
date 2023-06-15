import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Typography,
  makeStyles,
} from "@material-ui/core";
import CommonHeader from "../CommonHeader/CommonHeader";
import { useSnackbar } from "@src/hooks/useSnackbar";
import { useErrorHandle } from "@src/hooks/useErrorHandle";
import { useCommonHeader } from "@src/hooks/useCommonHeader";
import BackdropSpin from "../BackdropSpin";
import Snackbar from "../Snackbar";
import { ApiPath } from "@src/utils/api";
import { MatchGroup } from "@src/type/matchGroups";
import UserIconAndName from "../UserIconAndName";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import NextLink from "next/link";
import { Path } from "@src/utils/routerPath";
import { LIMIT, useInfiniteScroll } from "@src/hooks/useInfiniteScroll";
import InfiniteScroll from "react-infinite-scroll-component";
import clsx from "clsx";
import { useIntl } from "react-intl";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(9),
  },
  loginUserIcon: {
    width: 240,
    height: 240,
    marginTop: theme.spacing(30),
  },
  createdByIcon: {
    border: `8px solid ${theme.palette.info.light}`,
  },
  memberIcon: {
    width: 152,
    height: 152,
  },
  matchGroupTitle: {
    fontWeight: 600,
  },
  matchGroupName: {
    fontWeight: 550,
  },
  item: {
    marginRight: theme.spacing(20),
  },
  card: {
    border: `1px solid ${theme.palette.action.disabled}`,
    borderRadius: theme.spacing(2),
  },
  closedCard: {
    backgroundColor: theme.palette.action.disabledBackground,
  },
  matchGroupCards: {
    marginTop: theme.spacing(6),
    height: "80vh",
    overflowY: "auto",
  },
  createButton: {
    borderRadius: "20px",
    fontSize: theme.spacing(2.5),
    backgroundColor: "#3f72af",
  },
}));

interface Props {
  matchGroup: MatchGroup;
  handleError: (error: Error) => void;
}

const MatchGroupCard: React.FC<Props> = ({ matchGroup, handleError }) => {
  const classes = useStyles();
  const { formatDate } = useIntl();

  const createdByUser = matchGroup.members.find(
    (member) => member.userId === matchGroup.createdBy
  );
  const memberExcludeCreator = matchGroup.members.filter(
    (member) => member.userId !== matchGroup.createdBy
  );
  const members =
    createdByUser !== undefined
      ? [createdByUser, ...memberExcludeCreator]
      : memberExcludeCreator;

  return (
    <Card
      elevation={3}
      className={
        matchGroup.status === "close"
          ? clsx(classes.card, classes.closedCard)
          : classes.card
      }
    >
      <CardContent>
        <Grid container spacing={4} direction="column">
          <Grid item>
            <Grid container justifyContent="space-between" spacing={4}>
              <Grid item>
                <Typography variant="h5" className={classes.matchGroupName}>
                  {matchGroup.matchGroupName}
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="h6">
                  {`作成日：${formatDate(matchGroup.createdAt)}`}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container spacing={7}>
              {members.map((member, i) => (
                <Grid item key={i}>
                  <UserIconAndName
                    userIconId={member.userIcon.fileId}
                    userName={member.userName}
                    handleError={handleError}
                    iconClassName={
                      i === 0
                        ? clsx(classes.createdByIcon, classes.memberIcon)
                        : classes.memberIcon
                    }
                    userNameVariant="body1"
                    gridSpacing={1}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const MatchGroups: React.FC = () => {
  const classes = useStyles();

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
  const { userId, userName, userIconFileData, isLoading, onLogout } =
    useCommonHeader({
      handleError,
      setMessage,
      setOpenSnackbar,
      setStatusCode,
    });

  const apiPath = userId
    ? `${ApiPath.matchGroupForMember.replace(
        "{userId}",
        userId
      )}?status=all&offset={offset}&limit=${LIMIT}`
    : undefined;

  const {
    data,
    isLoading: getMatchGroupsLoading,
    nextFetcher,
    hasMore,
  } = useInfiniteScroll<MatchGroup[]>({
    apiPath,
    handleError,
  });

  if (isLoading || getMatchGroupsLoading) return <BackdropSpin />;

  return (
    <>
      <CommonHeader
        title="マッチグループ一覧"
        userName={userName}
        userIconFileData={userIconFileData}
        onLogout={onLogout}
      />
      <Container maxWidth="lg" className={classes.container}>
        <Grid container>
          <Grid item className={classes.item}>
            <UserIconAndName
              userName={userName}
              iconData={userIconFileData}
              iconClassName={classes.loginUserIcon}
              userNameVariant="h5"
              gridSpacing={3}
            />
          </Grid>
          <Grid item xs>
            <Grid container direction="column" justifyContent="center">
              <Grid item>
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Grid item>
                    <Typography
                      variant="h4"
                      className={classes.matchGroupTitle}
                    >
                      {"参加しているマッチグループ一覧"}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <NextLink href={Path.createMatchGroups}>
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        startIcon={<FontAwesomeIcon icon={faPlusCircle} />}
                        className={classes.createButton}
                      >
                        {"新規作成"}
                      </Button>
                    </NextLink>
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                item
                className={classes.matchGroupCards}
                id="match-groups-infinite-scroll-parent"
              >
                {data?.length === 0 && (
                  <Box marginTop={4}>
                    <Grid container justifyContent="center" alignItems="center">
                      <Grid item>
                        <Typography variant="h6">
                          {"作成済みのマッチグループが存在しません。"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
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
                  scrollableTarget="match-groups-infinite-scroll-parent"
                >
                  <Grid container direction="column" spacing={6} wrap="nowrap">
                    {data?.map((matchGroup, i) => (
                      <Grid item key={i}>
                        <MatchGroupCard
                          matchGroup={matchGroup}
                          handleError={handleError}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </InfiniteScroll>
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

export default MatchGroups;
