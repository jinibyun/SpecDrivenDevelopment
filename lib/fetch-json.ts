export type ApiResult<T> = { data: T; error?: undefined } | { data?: undefined; error: { code: string; message: string } };

export async function fetchJson<T>(input: string, init?: RequestInit): Promise<ApiResult<T>> {
  const res = await fetch(input, init);
  return (await res.json()) as ApiResult<T>;
}
