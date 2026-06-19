"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractQikinkOptions = extractQikinkOptions;
exports.resolveQikinkOptions = resolveQikinkOptions;
const config_1 = require("../config");
const PLUGIN_NAME = "medusa-qikink";
function normalizeApiUrl(url) {
    if (!url)
        return "";
    const trimmed = url.trim().replace(/\/+$/, "");
    return trimmed.replace(/\/(v1|api)(\/.*)?$/i, "") || trimmed;
}
/**
 * Extract plugin options from config module
 */
function extractQikinkOptions(configModule) {
    if (!configModule || typeof configModule !== "object") {
        return undefined;
    }
    const projectPlugins = configModule?.projectConfig?.plugins ?? [];
    const directPlugins = configModule?.plugins ?? [];
    const plugins = [...projectPlugins, ...directPlugins];
    for (const plugin of plugins) {
        if (typeof plugin === "string") {
            if (plugin === PLUGIN_NAME)
                return undefined;
            continue;
        }
        if (plugin?.resolve === PLUGIN_NAME) {
            return plugin.options;
        }
    }
    return undefined;
}
/**
 * Resolve options with plugin options overriding env-backed config. Throws if required values missing.
 */
function resolveQikinkOptions(options) {
    const apiUrl = options?.apiUrl ?? config_1.qikinkConfig.apiUrl;
    const clientId = options?.clientId ?? config_1.qikinkConfig.clientId;
    const clientSecret = options?.clientSecret ?? config_1.qikinkConfig.clientSecret;
    const resolvedUrl = (apiUrl && normalizeApiUrl(apiUrl)) || "";
    if (!resolvedUrl) {
        throw new Error("medusa-qikink: apiUrl is required. Set QIKINK_API_URL or plugin options in medusa-config.ts");
    }
    if (!clientId) {
        throw new Error("medusa-qikink: clientId is required. Set QIKINK_CLIENT_ID or plugin options in medusa-config.ts");
    }
    if (!clientSecret) {
        throw new Error("medusa-qikink: clientSecret is required. Set QIKINK_CLIENT_SECRET or plugin options in medusa-config.ts");
    }
    const rateLimitEnv = config_1.qikinkConfig.rateLimitRequestsPerMinute;
    const rateLimitOpt = options?.rateLimitRequestsPerMinute;
    const rateLimitRequestsPerMinute = rateLimitOpt !== undefined && rateLimitOpt !== null
        ? Math.max(0, Math.floor(Number(rateLimitOpt)))
        : (Number.isFinite(rateLimitEnv) && rateLimitEnv >= 0 ? rateLimitEnv : 30);
    return {
        apiUrl: resolvedUrl,
        clientId,
        clientSecret,
        rateLimitRequestsPerMinute,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzb2x2ZS1vcHRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3V0aWxzL3Jlc29sdmUtb3B0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWNBLG9EQXVCQztBQUtELG9EQXNDQztBQS9FRCxzQ0FBd0M7QUFFeEMsTUFBTSxXQUFXLEdBQUcsZUFBZSxDQUFBO0FBRW5DLFNBQVMsZUFBZSxDQUFDLEdBQVc7SUFDbEMsSUFBSSxDQUFDLEdBQUc7UUFBRSxPQUFPLEVBQUUsQ0FBQTtJQUNuQixNQUFNLE9BQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUM5QyxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMscUJBQXFCLEVBQUUsRUFBRSxDQUFDLElBQUksT0FBTyxDQUFBO0FBQzlELENBQUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLG9CQUFvQixDQUNsQyxZQUFzQjtJQUV0QixJQUFJLENBQUMsWUFBWSxJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQ3RELE9BQU8sU0FBUyxDQUFBO0lBQ2xCLENBQUM7SUFFRCxNQUFNLGNBQWMsR0FDakIsWUFBNEQsRUFBRSxhQUFhLEVBQUUsT0FBTyxJQUFJLEVBQUUsQ0FBQTtJQUM3RixNQUFNLGFBQWEsR0FBSSxZQUF3QyxFQUFFLE9BQU8sSUFBSSxFQUFFLENBQUE7SUFDOUUsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFHLGNBQWMsRUFBRSxHQUFHLGFBQWEsQ0FBQyxDQUFBO0lBRXJELEtBQUssTUFBTSxNQUFNLElBQUksT0FBTyxFQUFFLENBQUM7UUFDN0IsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUMvQixJQUFJLE1BQU0sS0FBSyxXQUFXO2dCQUFFLE9BQU8sU0FBUyxDQUFBO1lBQzVDLFNBQVE7UUFDVixDQUFDO1FBQ0QsSUFBSyxNQUErQixFQUFFLE9BQU8sS0FBSyxXQUFXLEVBQUUsQ0FBQztZQUM5RCxPQUFRLE1BQTRDLENBQUMsT0FBTyxDQUFBO1FBQzlELENBQUM7SUFDSCxDQUFDO0lBRUQsT0FBTyxTQUFTLENBQUE7QUFDbEIsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0Isb0JBQW9CLENBQ2xDLE9BQTZCO0lBRTdCLE1BQU0sTUFBTSxHQUFHLE9BQU8sRUFBRSxNQUFNLElBQUkscUJBQVksQ0FBQyxNQUFNLENBQUE7SUFDckQsTUFBTSxRQUFRLEdBQUcsT0FBTyxFQUFFLFFBQVEsSUFBSSxxQkFBWSxDQUFDLFFBQVEsQ0FBQTtJQUMzRCxNQUFNLFlBQVksR0FBRyxPQUFPLEVBQUUsWUFBWSxJQUFJLHFCQUFZLENBQUMsWUFBWSxDQUFBO0lBRXZFLE1BQU0sV0FBVyxHQUFHLENBQUMsTUFBTSxJQUFJLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtJQUU3RCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDakIsTUFBTSxJQUFJLEtBQUssQ0FDYiw2RkFBNkYsQ0FDOUYsQ0FBQTtJQUNILENBQUM7SUFDRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDZCxNQUFNLElBQUksS0FBSyxDQUNiLGlHQUFpRyxDQUNsRyxDQUFBO0lBQ0gsQ0FBQztJQUNELElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNsQixNQUFNLElBQUksS0FBSyxDQUNiLHlHQUF5RyxDQUMxRyxDQUFBO0lBQ0gsQ0FBQztJQUVELE1BQU0sWUFBWSxHQUFHLHFCQUFZLENBQUMsMEJBQTBCLENBQUE7SUFDNUQsTUFBTSxZQUFZLEdBQUcsT0FBTyxFQUFFLDBCQUEwQixDQUFBO0lBQ3hELE1BQU0sMEJBQTBCLEdBQzlCLFlBQVksS0FBSyxTQUFTLElBQUksWUFBWSxLQUFLLElBQUk7UUFDakQsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDL0MsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxZQUFZLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBRTlFLE9BQU87UUFDTCxNQUFNLEVBQUUsV0FBVztRQUNuQixRQUFRO1FBQ1IsWUFBWTtRQUNaLDBCQUEwQjtLQUMzQixDQUFBO0FBQ0gsQ0FBQyJ9