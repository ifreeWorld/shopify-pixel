export function getQueryParam(search: any, name: string) {
  var urlParams = new URLSearchParams(search);
  return urlParams.get(name) || "";
}
