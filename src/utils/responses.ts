export const errorResponses = {
    INSUFFICIENT_DATA: {
        message: 'Insufficient data.',
    },
    SOMETHING_WENT_WRONG: {
        message: 'Something went wrong.',
    },
};

export const successResponses = {
    LINK_TOKEN_CREATED: {
        message: 'Link token created successfully.',
    },
    ACCESS_TOKEN_CREATED: {
        message: 'Access Token created successfully.',
    },
};

export const responseWithData = (response: any, data: any) => {
    return { response, data };
};