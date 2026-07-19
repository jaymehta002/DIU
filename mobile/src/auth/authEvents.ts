type UnauthorizedHandler = () => void;

let handler: UnauthorizedHandler = () => {};

export function setUnauthorizedHandler(fn: UnauthorizedHandler): void {
  handler = fn;
}

export function notifyUnauthorized(): void {
  handler();
}
