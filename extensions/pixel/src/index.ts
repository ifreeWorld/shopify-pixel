import { register } from "@shopify/web-pixels-extension";
import { getQueryParam, track } from "./utils";
import packageV from "../../../package.json";

register(async ({ analytics, browser, settings }) => {
  const { accountId: apiKey = "" } = settings;
  // @ts-ignore
  self.browser = browser;
  // Step 2. Subscribe to customer events with analytics.subscribe(), and add tracking
  analytics.subscribe("all_standard_events", (event) => {
    console.log("Event data ", event?.data);
  });

  analytics.subscribe("page_viewed", (event) => {
    console.log("page_viewed", event);
    console.log("--------M.AI's Pixel Install Successful!---------");
    console.log(`--------M.AI's Pixel version: ${packageV.version}!---------`);
    track("page_view", {
      api_key: apiKey,
      timestamp: event.timestamp,
      id: event.id,
      // The client-side ID of the customer, provided by Shopify
      client_id: event.clientId,
      url: event.context.document.location.href,
      page_title: event.context.document.title,
      utmSource: getQueryParam(
        event.context.document.location.search,
        "utm_source"
      ),
      utmMedium: getQueryParam(
        event.context.document.location.search,
        "utm_medium"
      ),
      utmCampaign: getQueryParam(
        event.context.document.location.search,
        "utm_campaign"
      ),
      utmContent: getQueryParam(
        event.context.document.location.search,
        "utm_content"
      ),
      utmTerm: getQueryParam(
        event.context.document.location.search,
        "utm_term"
      ),
    });
  });

  analytics.subscribe("product_added_to_cart", (event) => {
    console.log("product_added_to_cart", event);
    track("product_added_to_cart", {
      api_key: apiKey,
      timestamp: event.timestamp,
      id: event.id,
      client_id: event.clientId,
      url: event.context.document.location.href,
      price: event.data?.cartLine?.merchandise?.price?.amount,
      currency: event.data?.cartLine?.merchandise?.id,
      product_title: event.data?.cartLine?.merchandise?.product?.title,
      quantity: event.data?.cartLine?.quantity,
      total_cost: event.data?.cartLine?.cost?.totalAmount?.amount,
      utmSource: getQueryParam(
        event.context.document.location.search,
        "utm_source"
      ),
      utmMedium: getQueryParam(
        event.context.document.location.search,
        "utm_medium"
      ),
      utmCampaign: getQueryParam(
        event.context.document.location.search,
        "utm_campaign"
      ),
      utmContent: getQueryParam(
        event.context.document.location.search,
        "utm_content"
      ),
      utmTerm: getQueryParam(
        event.context.document.location.search,
        "utm_term"
      ),
    });
  });

  analytics.subscribe("checkout_completed", (event) => {
    console.log("checkout_completed", event);
    track("checkout_completed", {
      api_key: apiKey,
      timestamp: event.timestamp,
      id: event.id,
      token: event.data?.checkout?.token,
      url: event.context.document.location.href,
      client_id: event.clientId,
      email: event.data?.checkout?.email,
      phone: event.data?.checkout?.phone,
      first_name: event.data?.checkout?.shippingAddress?.firstName,
      last_name: event.data?.checkout?.shippingAddress?.lastName,
      address1: event.data?.checkout?.shippingAddress?.address1,
      address2: event.data?.checkout?.shippingAddress?.address2,
      city: event.data?.checkout?.shippingAddress?.city,
      country: event.data?.checkout?.shippingAddress?.country,
      countryCode: event.data?.checkout?.shippingAddress?.countryCode,
      province: event.data?.checkout?.shippingAddress?.province,
      provinceCode: event.data?.checkout?.shippingAddress?.provinceCode,
      zip: event.data?.checkout?.shippingAddress?.zip,
      orderId: event.data?.checkout?.order?.id,
      currency: event.data?.checkout?.currencyCode,
      subtotal: event.data?.checkout?.subtotalPrice?.amount,
      shipping: event.data?.checkout?.shippingLine?.price?.amount,
      value: event.data?.checkout?.totalPrice?.amount,
      tax: event.data?.checkout?.totalTax?.amount,
      utmSource: getQueryParam(
        event.context.document.location.search,
        "utm_source"
      ),
      utmMedium: getQueryParam(
        event.context.document.location.search,
        "utm_medium"
      ),
      utmCampaign: getQueryParam(
        event.context.document.location.search,
        "utm_campaign"
      ),
      utmContent: getQueryParam(
        event.context.document.location.search,
        "utm_content"
      ),
      utmTerm: getQueryParam(
        event.context.document.location.search,
        "utm_term"
      ),
    });
  });
});
