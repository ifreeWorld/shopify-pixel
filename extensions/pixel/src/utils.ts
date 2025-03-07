export function getQueryParam(search: any, name: string) {
  var urlParams = new URLSearchParams(search);
  return urlParams.get(name) || "";
}

// Define an interface for properties that requires a client_id
interface TrackProperties {
  client_id: string;
  [key: string]: any; // Allow additional properties
}

// GA4 Track
export async function track(eventName: string, properties: TrackProperties) {
  const measurementId = `G-L6RJPETWN1`;
  const apiSecret = `tYjaJa_MTlCwgPC-lwhg_g`;
  // TODO: 后续最终版增加一个mai_client_id的参数，用来区分数据上报到mai的具体的哪个账号上去
  fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
    {
      method: "POST",
      body: JSON.stringify({
        // c端用户id
        client_id: properties.client_id,
        events: [
          {
            name: eventName,
            params: {
              ...properties,
              // sessionId 我们的代码自己生成的
              session_id: await getOrCreateSessionId(),
              // TODO: 设置engagement_time_msec
              engagement_time_msec: 100,
            },
          },
        ],
      }),
    },
  );
}

async function getOrCreateSessionId() {
  const sessionKey = "mai_shopify_ga4_session_id";
  const timestampKey = "mai_shopify_ga4_session_timestamp";
  const now = Date.now();

  let sessionId = await browser.sessionStorage.getItem(sessionKey);
  let lastTimestamp = await browser.sessionStorage.getItem(timestampKey);
  let timestamp = lastTimestamp ? parseInt(lastTimestamp) : 0;

  if (!sessionId || !lastTimestamp || now - timestamp > 30 * 60 * 1000) {
    // 如果 session 不存在，或 30 分钟无操作，则生成新 session
    sessionId = Math.floor(now / 1000).toString(); // 转换为字符串
    browser.sessionStorage.setItem(sessionKey, sessionId);
  }

  // 更新 session 时间戳
  await browser.sessionStorage.setItem(timestampKey, now.toString());
  return sessionId;
}

// TODO: track需要增加预制属性，比如各种utm，apikey等等
