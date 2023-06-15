import {
  Backdrop,
  CircularProgress,
  CircularProgressProps,
  makeStyles,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  backDrop: {
    zIndex: theme.zIndex.modal + 1,
    position: "absolute",
  },
}));

const BackdropSpin: React.FC<CircularProgressProps> = (props) => {
  const classes = useStyles();
  return (
    <Backdrop
      className={classes.backDrop}
      invisible
      open
      timeout={{ appear: 1000, enter: 1000, exit: 0 }}
      data-testid="loading"
    >
      <CircularProgress color="primary" {...props} />
    </Backdrop>
  );
};

export default BackdropSpin;
