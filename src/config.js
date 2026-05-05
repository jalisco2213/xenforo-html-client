let config = {
    baseUrl: process.env.XENFORO_BASE_URL || null
};

function normalizeBaseUrl(value) {
    const url = String(value || '').trim();

    if (!url) {
        throw new Error('XenForo baseUrl is required');
    }

    return url.replace(/\/+$/, '');
}

function configure(options = {}) {
    if (options.baseUrl) {
        config.baseUrl = normalizeBaseUrl(options.baseUrl);
        process.env.XENFORO_BASE_URL = config.baseUrl;
    }

    return {
        baseUrl: config.baseUrl
    };
}

function getBaseUrl(value = null) {
    if (value) {
        return normalizeBaseUrl(value);
    }

    if (config.baseUrl) {
        return normalizeBaseUrl(config.baseUrl);
    }

    if (process.env.XENFORO_BASE_URL) {
        return normalizeBaseUrl(process.env.XENFORO_BASE_URL);
    }

    throw new Error('XenForo baseUrl is required');
}

module.exports = {
    configure,
    getBaseUrl,
    normalizeBaseUrl
};
