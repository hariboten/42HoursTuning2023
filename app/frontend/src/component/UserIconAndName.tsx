import {
  Avatar,
  Grid,
  GridSpacing,
  Typography,
  TypographyVariant,
} from "@material-ui/core";
import { FileData } from "@src/type/files";
import { ApiPath, apiRequest } from "@src/utils/api";
import useSWR from "swr";
import BackdropSpin from "./BackdropSpin";

interface Props {
  userIconId?: string;
  userName?: string;
  iconData?: string;
  handleError?: (error: Error) => void;
  iconClassName: string;
  userNameVariant?: TypographyVariant;
  gridSpacing: GridSpacing;
}

const UserIconAndName: React.FC<Props> = (props) => {
  const { data, isLoading } = useSWR(
    props.userIconId
      ? ApiPath.userIcon.replace("{userIconId}", props.userIconId)
      : undefined,
    async (url) => (await apiRequest<FileData>("get", url)).data,
    { onError: props.handleError }
  );

  if (isLoading) return <BackdropSpin />;

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      spacing={props.gridSpacing}
    >
      <Grid item>
        <Avatar
          alt={props.userName || "test"}
          src={
            props.iconData
              ? `data:image/png;base64,${props.iconData}`
              : `data:image/png;base64,${data?.data}`
          }
          className={props.iconClassName}
        />
      </Grid>
      <Grid item>
        <Typography variant={props.userNameVariant}>
          {props.userName}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default UserIconAndName;
