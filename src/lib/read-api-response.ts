type ApiErrorPayload = {
  error?: {
    message?: string;
  };
};

function canTreatAsJson(contentType: string | null, body: string) {
  if (contentType?.includes("application/json")) {
    return true;
  }

  const trimmedBody = body.trim();

  return trimmedBody.startsWith("{") || trimmedBody.startsWith("[");
}

export async function readApiResponse<T>(
  response: Response,
  {
    errorMessage,
    unexpectedResponseMessage = errorMessage,
  }: {
    errorMessage: string;
    unexpectedResponseMessage?: string;
  },
) {
  const body = await response.text();

  if (body.trim().length === 0) {
    if (!response.ok) {
      throw new Error(errorMessage);
    }

    return null as T;
  }

  if (!canTreatAsJson(response.headers.get("content-type"), body)) {
    throw new Error(unexpectedResponseMessage);
  }

  let payload: unknown;

  try {
    payload = JSON.parse(body);
  } catch {
    throw new Error(unexpectedResponseMessage);
  }

  if (!response.ok) {
    const errorPayload = payload as ApiErrorPayload;

    throw new Error(errorPayload.error?.message ?? errorMessage);
  }

  return payload as T;
}
