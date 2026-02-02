export function toPosixPath(filePath: string): string {
  return filePath.split("\\").join("/");
}

