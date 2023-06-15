import { faBars, faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  AppBar,
  Avatar,
  Button,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { Path } from "@src/utils/routerPath";
import React, { useCallback, useState } from "react";
import NextLink from "next/link";

const useStyles = makeStyles((theme) => ({
  root: {
    cursor: "pointer",
  },
  userName: {
    whiteSpace: "nowrap",
  },
  subHeader: {
    background: theme.palette.common.white,
  },
  backButton: {
    fontSize: theme.spacing(2.5),
    fontWeight: 500,
    color: "#3f72af",
  },
  logo: {
    objectFit: "none",
    height: "48px",
    width: "200px",
  },
  header: {
    backgroundColor: "#3f72af",
  },
}));

export interface Props {
  userName: string;
  userIconFileData?: string;
  onLogout: () => Promise<void>;
  subHeaderTitle?: string;
}

const BarMenuIconButton: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const handleOpenMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget),
    []
  );
  const handleCloseMenu = useCallback(() => setAnchorEl(null), []);

  return (
    <>
      <IconButton color="inherit" onClick={handleOpenMenu}>
        <FontAwesomeIcon icon={faBars} />
      </IconButton>
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
        <MenuItem
          role="link"
          component={"a"}
          href={Path.top}
          onClick={handleCloseMenu}
        >
          {"ユーザー一覧"}
        </MenuItem>
        <MenuItem
          role="link"
          component={"a"}
          href={Path.matchGroups}
          onClick={handleCloseMenu}
        >
          {"マッチグループ一覧"}
        </MenuItem>
      </Menu>
    </>
  );
};

const UserIconAndNameMenu: React.FC<Props> = ({
  userName,
  userIconFileData,
  onLogout,
}) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const handleOpenMenu = useCallback(
    (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget),
    []
  );
  const handleCloseMenu = useCallback(() => setAnchorEl(null), []);
  const onClickLogout = useCallback(() => {
    handleCloseMenu();
    onLogout();
  }, [handleCloseMenu, onLogout]);

  return (
    <>
      <Grid
        container
        alignItems="center"
        spacing={1}
        wrap="nowrap"
        onClick={handleOpenMenu}
        className={classes.root}
      >
        <Grid item>
          <Avatar
            alt={userName || "test"}
            src={
              userIconFileData
                ? `data:image/png;base64,${userIconFileData}`
                : undefined
            }
          />
        </Grid>
        <Grid item>
          <Typography className={classes.userName}>{userName}</Typography>
        </Grid>
      </Grid>

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
        <MenuItem onClick={onClickLogout}>{"ログアウト"}</MenuItem>
      </Menu>
    </>
  );
};

const CommonHeader: React.FC<Props & { title: string }> = (props) => {
  const classes = useStyles();

  return (
    <>
      <AppBar className={classes.header}>
        <Toolbar>
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            wrap="nowrap"
          >
            <Grid item>
              <Grid container alignItems="center" spacing={3}>
                <Grid item>
                  <BarMenuIconButton />
                </Grid>
                <Grid item>
                  <NextLink href={Path.top}>
                    <img
                      src="/header_logo.png"
                      alt="ロゴ"
                      className={classes.logo}
                    />
                  </NextLink>
                </Grid>
                <Grid item>
                  <Typography variant="h5">{props.title}</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <UserIconAndNameMenu {...props} />
            </Grid>
          </Grid>
        </Toolbar>
        {props.subHeaderTitle && (
          <Toolbar className={classes.subHeader}>
            <Grid container alignItems="center">
              <Grid item>
                <NextLink href={Path.matchGroups}>
                  <Button
                    variant="text"
                    color="primary"
                    size="large"
                    startIcon={<FontAwesomeIcon icon={faChevronLeft} />}
                    className={classes.backButton}
                  >
                    {props.subHeaderTitle}
                  </Button>
                </NextLink>
              </Grid>
            </Grid>
          </Toolbar>
        )}
      </AppBar>
      <Toolbar />
      {props.subHeaderTitle && <Toolbar variant="dense" />}
    </>
  );
};

export default CommonHeader;
