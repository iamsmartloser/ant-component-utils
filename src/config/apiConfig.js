const {
    production=true
} = process.env;

export const host = `${production?'https://www.easy-mock.com':'https://www.easy-mock.com'}/mock/5e1ed0bbfe6d23409285a7ea`;
export const baseUrl = `/mock-service`;