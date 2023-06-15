export interface FileInfo {
  fileId: string;
  fileName: string;
}

export interface FileData {
  fileName: string;
  data: string;
}

const mockBuffer = Buffer.from("data");

export const mockFileData = {
  fileName: "fileName",
  data: mockBuffer.toString("base64"),
};
