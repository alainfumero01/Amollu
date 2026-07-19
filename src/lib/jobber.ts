export type JobberQuoteFields = {
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  service: string;
  message: string;
};

export type JobberSyncResult =
  | {
      status: "skipped";
      message: string;
    }
  | {
      status: "synced";
      clientId: string;
      requestId: string;
      clientUrl?: string;
      requestUrl?: string;
      warning?: string;
    };

type JobberTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  error?: string;
  error_description?: string;
  warning?: string;
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message?: string }>;
};

type UserError = {
  message?: string;
  path?: string[];
};

const authorizeUrl = "https://api.getjobber.com/api/oauth/authorize";
const tokenUrl = "https://api.getjobber.com/api/oauth/token";
const graphqlUrl = "https://api.getjobber.com/api/graphql";

function readEnv(name: string) {
  return process.env[name]?.trim() || "";
}

function getRedirectUri() {
  return readEnv("JOBBER_REDIRECT_URI") || "https://www.amolluservices.com/api/jobber/callback";
}

function getClientCredentials() {
  const clientId = readEnv("JOBBER_CLIENT_ID");
  const clientSecret = readEnv("JOBBER_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Jobber OAuth credentials are not configured.");
  }

  return { clientId, clientSecret };
}

function formatJobberErrors(errors?: UserError[]) {
  const messages = errors?.map((error) => error.message).filter(Boolean);
  return messages?.length ? messages.join("; ") : "Jobber rejected the request.";
}

function splitName(fullName: string) {
  const parts = fullName.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "Website", lastName: "Lead" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "Lead" };
  }

  return {
    firstName: parts.slice(0, -1).join(" "),
    lastName: parts.at(-1) || "Lead",
  };
}

function makeNote(fields: JobberQuoteFields) {
  return [
    "Website quote request",
    "",
    `Name: ${fields.name}`,
    `Email: ${fields.email}`,
    `Phone: ${fields.phone || "Not provided"}`,
    `Property type: ${fields.propertyType}`,
    `Requested service: ${fields.service}`,
    "",
    "Message:",
    fields.message,
  ].join("\n");
}

export function getJobberAuthorizationUrl() {
  const { clientId } = getClientCredentials();
  const state = readEnv("JOBBER_OAUTH_STATE");
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: getRedirectUri(),
  });

  if (state) {
    params.set("state", state);
  }

  return `${authorizeUrl}?${params.toString()}`;
}

async function requestToken(params: Record<string, string>) {
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });

  const tokens = (await response.json()) as JobberTokenResponse;

  if (!response.ok || !tokens.access_token) {
    throw new Error(
      tokens.error_description || tokens.error || `Jobber authorization failed with HTTP ${response.status}.`,
    );
  }

  return tokens;
}

export async function exchangeJobberCode(code: string) {
  const { clientId, clientSecret } = getClientCredentials();

  return requestToken({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: getRedirectUri(),
  });
}

async function refreshJobberAccessToken() {
  const { clientId, clientSecret } = getClientCredentials();
  const refreshToken = readEnv("JOBBER_REFRESH_TOKEN");

  if (!refreshToken) {
    throw new Error("Jobber is not connected yet.");
  }

  return requestToken({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}

async function jobberGraphql<T>(query: string, variables: Record<string, unknown>, accessToken: string) {
  const response = await fetch(graphqlUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const result = (await response.json()) as GraphqlResponse<T>;

  if (!response.ok || result.errors?.length) {
    throw new Error(
      result.errors?.map((error) => error.message).filter(Boolean).join("; ") ||
        `Jobber API request failed with HTTP ${response.status}.`,
    );
  }

  if (!result.data) {
    throw new Error("Jobber returned an empty response.");
  }

  return result.data;
}

async function findExistingClient(accessToken: string, email: string) {
  const data = await jobberGraphql<{
    clients: {
      nodes: Array<{
        id: string;
        jobberWebUri?: string;
        emails: Array<{ address?: string }>;
      }>;
    };
  }>(
    `query FindClient($searchTerm: String!) {
      clients(searchTerm: $searchTerm, searchFields: [EMAILS, PRIMARY_EMAIL], first: 10) {
        nodes {
          id
          jobberWebUri
          emails {
            address
          }
        }
      }
    }`,
    { searchTerm: email },
    accessToken,
  );

  return data.clients.nodes.find((client) =>
    client.emails.some((clientEmail) => clientEmail.address?.toLowerCase() === email.toLowerCase()),
  );
}

async function createClient(accessToken: string, fields: JobberQuoteFields) {
  const { firstName, lastName } = splitName(fields.name);
  const data = await jobberGraphql<{
    clientCreate: {
      client?: {
        id: string;
        jobberWebUri?: string;
      };
      userErrors: UserError[];
    };
  }>(
    `mutation CreateClient($input: ClientCreateInput!) {
      clientCreate(input: $input) {
        client {
          id
          jobberWebUri
        }
        userErrors {
          message
          path
        }
      }
    }`,
    {
      input: {
        firstName,
        lastName,
        isCompany: fields.propertyType === "Commercial" || fields.propertyType === "Facility",
        companyName:
          fields.propertyType === "Commercial" || fields.propertyType === "Facility" ? fields.name : undefined,
        emails: [{ description: "MAIN", primary: true, address: fields.email }],
        phones: fields.phone ? [{ description: "MAIN", primary: true, number: fields.phone }] : [],
      },
    },
    accessToken,
  );

  if (!data.clientCreate.client || data.clientCreate.userErrors.length) {
    throw new Error(`Jobber client create failed: ${formatJobberErrors(data.clientCreate.userErrors)}`);
  }

  return data.clientCreate.client;
}

async function createRequest(accessToken: string, clientId: string, fields: JobberQuoteFields) {
  const data = await jobberGraphql<{
    requestCreate: {
      request?: {
        id: string;
        jobberWebUri?: string;
      };
      userErrors: UserError[];
    };
  }>(
    `mutation CreateRequest($input: RequestCreateInput!) {
      requestCreate(input: $input) {
        request {
          id
          jobberWebUri
        }
        userErrors {
          message
          path
        }
      }
    }`,
    {
      input: {
        clientId,
        title: `${fields.service} - ${fields.propertyType}`,
        source: "EXTERNAL",
      },
    },
    accessToken,
  );

  if (!data.requestCreate.request || data.requestCreate.userErrors.length) {
    throw new Error(`Jobber request create failed: ${formatJobberErrors(data.requestCreate.userErrors)}`);
  }

  return data.requestCreate.request;
}

async function createRequestNote(accessToken: string, requestId: string, fields: JobberQuoteFields) {
  const data = await jobberGraphql<{
    requestCreateNote: {
      userErrors: UserError[];
    };
  }>(
    `mutation CreateRequestNote($requestId: EncodedId!, $input: RequestCreateNoteInput!) {
      requestCreateNote(requestId: $requestId, input: $input) {
        userErrors {
          message
          path
        }
      }
    }`,
    {
      requestId,
      input: {
        message: makeNote(fields),
        pinned: true,
      },
    },
    accessToken,
  );

  if (data.requestCreateNote.userErrors.length) {
    throw new Error(`Jobber request note failed: ${formatJobberErrors(data.requestCreateNote.userErrors)}`);
  }
}

export async function syncQuoteToJobber(fields: JobberQuoteFields): Promise<JobberSyncResult> {
  if (readEnv("JOBBER_ENABLED") === "false") {
    return { status: "skipped", message: "Jobber sync is disabled." };
  }

  if (!readEnv("JOBBER_CLIENT_ID") || !readEnv("JOBBER_CLIENT_SECRET") || !readEnv("JOBBER_REFRESH_TOKEN")) {
    return { status: "skipped", message: "Jobber is not connected yet." };
  }

  const tokens = await refreshJobberAccessToken();
  const accessToken = tokens.access_token;

  if (!accessToken) {
    throw new Error("Jobber did not return an access token.");
  }

  let warning: string | undefined;
  let existingClient: Awaited<ReturnType<typeof findExistingClient>> | undefined;

  try {
    existingClient = await findExistingClient(accessToken, fields.email);
  } catch (error) {
    warning = `Client lookup skipped: ${error instanceof Error ? error.message : "Jobber client lookup failed."}`;
  }

  const client = existingClient || (await createClient(accessToken, fields));
  const request = await createRequest(accessToken, client.id, fields);

  try {
    await createRequestNote(accessToken, request.id, fields);
  } catch (error) {
    const noteWarning = `Request note skipped: ${error instanceof Error ? error.message : "Jobber request note failed."}`;
    warning = warning ? `${warning} ${noteWarning}` : noteWarning;
  }

  return {
    status: "synced",
    clientId: client.id,
    requestId: request.id,
    clientUrl: client.jobberWebUri,
    requestUrl: request.jobberWebUri,
    warning,
  };
}
