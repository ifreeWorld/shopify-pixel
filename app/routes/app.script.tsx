import type { ActionFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { authenticate } from "app/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  console.log("install script");

  const getResponse = await admin.graphql(
    `#graphql
    query {
      scriptTags(first: 5) {
        edges {
          node {
            id
          }
        }
      }
    }`,
  );
  const scripts = await getResponse.json();

  for (var i = 0; i < scripts?.data?.scriptTags?.edges?.length; i++) {
    const { node } = scripts?.data?.scriptTags?.edges[i];
    await admin.graphql(
      `#graphql
      mutation ScriptTagDelete($id: ID!) {
        scriptTagDelete(id: $id) {
          deletedScriptTagId
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          id: node.id,
        },
      },
    );
  }
  await admin.graphql(
    `#graphql
      mutation ScriptTagCreate($input: ScriptTagInput!) {
        scriptTagCreate(input: $input) {
          scriptTag {
            id
            cache
            createdAt
            displayScope
            src
            updatedAt
          }
          userErrors {
            field
            message
          }
        }
      }`,
    {
      variables: {
        input: {
          src: "https://cdn.mxpnl.com/libs/mixpanel-js/dist/mixpanel.umd.js",
          displayScope: "ONLINE_STORE",
          cache: true,
        },
      },
    },
  );

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
            accountId: "123",
          },
        },
      },
    },
  );
  const data = await pixelResponse.json();

  return data;
};

export default function Script() {
  const fetcher = useFetcher<typeof action>();

  const installScript = () => {
    fetcher.submit({}, { method: "POST" });
  };

  return (
    <div>
      <button onClick={installScript}>Install Script</button>
      <p>{JSON.stringify(fetcher.data) || "no data"}</p>
    </div>
  );
}
