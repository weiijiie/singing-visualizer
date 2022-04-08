export function canRecord(): boolean {
  const userMedia = navigator?.mediaDevices?.getUserMedia;
  const supportsGetUserMedia = userMedia !== undefined && userMedia !== null;
  return supportsGetUserMedia;
}
