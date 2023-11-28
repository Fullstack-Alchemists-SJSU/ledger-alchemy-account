import bcrypt from 'bcrypt';

export const hashAccessToken = async (access_token: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    const hashedAccessToken = await bcrypt.hash(access_token, salt);
    return hashedAccessToken;
};

export const comparePassword = async (access_token: string, hashedAccessToken: string): Promise<boolean> => {
    const isMatch = await bcrypt.compare(access_token, hashedAccessToken);
    return isMatch;
};