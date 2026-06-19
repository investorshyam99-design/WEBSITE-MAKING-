"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
const utils_1 = require("@medusajs/framework/utils");
const qikink_client_1 = require("../../../../helpers/qikink-client");
const resolve_options_1 = require("../../../../utils/resolve-options");
const qikink_rate_limiter_1 = require("../../../../utils/qikink-rate-limiter");
/**
 * POST /store/qikink/token
 * Get Qikink access token using client ID and secret from config. Available on store so any client can use it.
 */
async function POST(req, res) {
    try {
        const configModule = req.scope.resolve(utils_1.ContainerRegistrationKeys.CONFIG_MODULE);
        const rawOptions = (0, resolve_options_1.extractQikinkOptions)(configModule);
        const options = (0, resolve_options_1.resolveQikinkOptions)(rawOptions);
        const client = (0, qikink_client_1.createQikinkClient)(options);
        const tokenResponse = await client.getToken();
        const accessToken = tokenResponse.access_token ?? null;
        return res.status(200).json({ access_token: accessToken, ...tokenResponse });
    }
    catch (err) {
        if (err instanceof qikink_rate_limiter_1.QikinkRateLimitError) {
            return res.status(429).json({ message: err.message });
        }
        const message = err instanceof Error ? err.message : "Failed to get Qikink token";
        const status = message.includes("required") ? 400 : 502;
        return res.status(status).json({ message });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9zcmMvYXBpL3N0b3JlL3Fpa2luay90b2tlbi9yb3V0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVVBLG9CQWlCQztBQTFCRCxxREFBcUU7QUFDckUscUVBQXNFO0FBQ3RFLHVFQUE4RjtBQUM5RiwrRUFBNEU7QUFFNUU7OztHQUdHO0FBQ0ksS0FBSyxVQUFVLElBQUksQ0FBQyxHQUFrQixFQUFFLEdBQW1CO0lBQ2hFLElBQUksQ0FBQztRQUNILE1BQU0sWUFBWSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLGFBQWEsQ0FBQyxDQUFBO1FBQy9FLE1BQU0sVUFBVSxHQUFHLElBQUEsc0NBQW9CLEVBQUMsWUFBWSxDQUFDLENBQUE7UUFDckQsTUFBTSxPQUFPLEdBQUcsSUFBQSxzQ0FBb0IsRUFBQyxVQUFVLENBQUMsQ0FBQTtRQUNoRCxNQUFNLE1BQU0sR0FBRyxJQUFBLGtDQUFrQixFQUFDLE9BQU8sQ0FBQyxDQUFBO1FBQzFDLE1BQU0sYUFBYSxHQUFHLE1BQU0sTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFBO1FBQzdDLE1BQU0sV0FBVyxHQUFHLGFBQWEsQ0FBQyxZQUFZLElBQUksSUFBSSxDQUFBO1FBQ3RELE9BQU8sR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLEdBQUcsYUFBYSxFQUFFLENBQUMsQ0FBQTtJQUM5RSxDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNiLElBQUksR0FBRyxZQUFZLDBDQUFvQixFQUFFLENBQUM7WUFDeEMsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQTtRQUN2RCxDQUFDO1FBQ0QsTUFBTSxPQUFPLEdBQUcsR0FBRyxZQUFZLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUE7UUFDakYsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUE7UUFDdkQsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUE7SUFDN0MsQ0FBQztBQUNILENBQUMifQ==