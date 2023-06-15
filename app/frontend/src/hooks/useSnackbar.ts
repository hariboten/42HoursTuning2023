import { useCallback } from "react";
import { useLocalStorage } from "react-use";

enum LocalStorageKey {
  snackbarMessage = "snackbar-message",
  openSnackbar = "open-snackbar",
  statusCode = "api-status-code",
}

export const useSnackbar = () => {
  const [message, setMessage] = useLocalStorage(
    LocalStorageKey.snackbarMessage,
    ""
  );

  const [openSnackbar, setOpenSnackbar] = useLocalStorage(
    LocalStorageKey.openSnackbar,
    false
  );
  const handleCloseSnackbar = useCallback(
    () => setOpenSnackbar(false),
    [setOpenSnackbar]
  );

  const [statusCode, setStatusCode] = useLocalStorage(
    LocalStorageKey.statusCode,
    0
  );

  return {
    message,
    setMessage,
    openSnackbar,
    setOpenSnackbar,
    handleCloseSnackbar,
    statusCode,
    setStatusCode,
  };
};
