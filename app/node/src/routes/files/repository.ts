import { RowDataPacket } from "mysql2";
import pool from "../../util/mysql";
import { File } from "../../model/types";

export const getFileByFileId = async (
  fileId: string
): Promise<File | undefined> => {
  const [file] = await pool.query<RowDataPacket[]>(
    "SELECT file_name, path FROM file WHERE file_id = ?",
    [fileId]
  );
  if (file.length === 0) {
    return;
  }

  return {
    fileName: file[0].file_name,
    path: file[0].path,
  };
};
