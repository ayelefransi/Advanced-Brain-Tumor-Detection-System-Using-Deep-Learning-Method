/**
 * <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
 * <span style={{fontSize: "1.35rem" }}>
 *  Built-in sign in with <b>Apple</b> integration.
 * </span>
 * <a href="https://apple.com" style={{backgroundColor: "black", padding: "12px", borderRadius: "100%" }}>
 *   <img style={{display: "block"}} src="https://authjs.dev/img/providers/apple.svg" width="24"/>
 * </a>
 * </div>
 *
 * @module providers/apple
 */
/**
 * ### Setup
 *
 * #### Callback URL
 * ```
 * https://example.com/api/auth/callback/apple
 * ```
 *
 * #### Configuration
 * ```ts
 * import { Auth } from "@auth/core"
 * import Apple from "@auth/core/providers/apple"
 *
 * const request = new Request(origin)
 * const response = await Auth(request, {
 *   providers: [
 *     Apple({
 *       clientId: APPLE_CLIENT_ID,
 *       clientSecret: APPLE_CLIENT_SECRET,
 *     }),
 *   ],
 * })
 * ```
 *
 * ### Resources
 *
 * - Sign in with Apple [Overview](https://developer.apple.com/sign-in-with-apple/get-started/)
 * - Sign in with Apple [REST API](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api)
 * - [How to retrieve](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api/authenticating_users_with_sign_in_with_apple#3383773) the user's information from Apple ID servers
 * - [Learn more about OAuth](https://authjs.dev/concepts/oauth)

 * ### Notes
 *
 * The Apple provider comes with a [default configuration](https://github.com/nextauthjs/next-auth/blob/main/packages/core/src/providers/apple.ts). To override the defaults for your use case, check out [customizing a built-in OAuth provider](https://authjs.dev/guides/configuring-oauth-providers).
 *
 * ## Help
 *
 * If you think you found a bug in the default configuration, you can [open an issue](https://authjs.dev/new/provider-issue).
 *
 * Auth.js strictly adheres to the specification and it cannot take responsibility for any deviation from
 * the spec by the provider. You can open an issue, but if the problem is non-compliance with the spec,
 * we might not pursue a resolution. You can ask for more help in [Discussions](https://authjs.dev/new/github-discussions).
 */
export default function Apple(options) {
    return {
        id: "apple",
        name: "Apple",
        type: "oidc",
        issuer: "https://appleid.apple.com",
        authorization: {
            params: { scope: "name email", response_mode: "form_post" },
        },
        profile(profile) {
            return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: null,
            };
        },
        style: {
            text: "#fff",
            bg: "#000",
        },
        // https://developer.apple.com/documentation/sign_in_with_apple/request_an_authorization_to_the_sign_in_with_apple_server
        checks: ["nonce", "state"],
        options,
    };
}
