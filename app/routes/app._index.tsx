import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  TextField,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const data = await db.session.findUnique({
    where: {
      id: session.id,
    },
    select: {
      apiKey: true,
    },
  });

  return {
    isConnected: !!data?.apiKey,
    accountId: data?.apiKey || "",
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const body = await request.formData();
  const accountId = body.get("accountId");

  // 先更新数据库
  await db.session.update({
    where: {
      id: session.id,
    },
    data: {
      apiKey: accountId as string,
    },
  });

  // 然后创建 web pixel
  const pixelResponse = await admin.graphql(
    `#graphql
      mutation webPixelCreate($webPixel: WebPixelInput!) {
        webPixelCreate(webPixel: $webPixel) {
          userErrors {
            code
            field
            message
          }
          webPixel {
            settings
            id
          }
        }
      }`,
    {
      variables: {
        webPixel: {
          settings: {
            accountId: accountId,
          },
        },
      },
    }
  );
  const { data } = await pixelResponse.json();

  // 如果 pixel 创建失败，可能需要回滚数据库更新
  if (data.webPixelCreate.userErrors.length > 0) {
    await db.session.update({
      where: {
        id: session.id,
      },
      data: {
        apiKey: null, // 或者之前的值，如果你有保存的话
      },
    });
  }

  return data.webPixelCreate.userErrors.length === 0;
};

export default function Index() {
  const { isConnected: initialConnected, accountId: initialAccountId } =
    useLoaderData<typeof loader>();
  const [accountId, setAccountId] = useState(initialAccountId);
  const [isConnected, setIsConnected] = useState(initialConnected);
  const fetcher = useFetcher<typeof action>();

  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) &&
    fetcher.formMethod === "POST";

  const handleConnect = () => {
    if (accountId) {
      fetcher.submit({ accountId }, { method: "POST" });
    }
  };

  useEffect(() => {
    if (fetcher.data) {
      setIsConnected(true);
    }
  }, [fetcher.data]);

  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Connect my Account
                </Text>
                <Text variant="bodyMd" as="p">
                  Once you've connected your account, events should
                  automatically begin flowing to your M.AI account.
                </Text>

                <TextField
                  label="Email"
                  value={accountId}
                  onChange={setAccountId}
                  autoComplete="off"
                  disabled={isConnected}
                  placeholder="Please enter M.AI's login email"
                />

                <Button
                  variant="primary"
                  onClick={handleConnect}
                  disabled={isConnected || !accountId || isLoading}
                  loading={isLoading}
                >
                  Connect
                </Button>

                {isConnected && (
                  <Banner tone="success">
                    <p>Your M.AI account has been successfully connected.</p>
                  </Banner>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
