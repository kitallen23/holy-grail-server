export const googleAuthURL = (state: string) => {
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        redirect_uri: `${process.env.BASE_URL}/auth/google/callback`,
        response_type: "code",
        scope: "openid email",
        state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
};

export const discordAuthURL = (state: string) => {
    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        redirect_uri: `${process.env.BASE_URL}/auth/discord/callback`,
        response_type: "code",
        scope: "identify email",
        state,
    });
    return `https://discord.com/api/oauth2/authorize?${params}`;
};
