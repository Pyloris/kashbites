export class ApiResponse {
    /**
     * Send a 200 OK success response
     * @param {Object} res - Express response object
     * @param {Object} data - Payload data or { data, meta }
     * @param {string} [message="Success"] - Informative message
     * @param {number} [statusCode=200] - HTTP status code
     */
    static success(res, data = {}, message = "Success", statusCode = 200) {
        const hasMeta = data && typeof data === "object" && "meta" in data;
        const payloadData = hasMeta ? data.data : data;

        return res.status(statusCode).json({
            status: 1,
            success: true,
            message,
            data: payloadData !== undefined ? payloadData : {},
            ...(hasMeta && data.meta && { meta: data.meta }),
            ...(Array.isArray(payloadData) && { count: payloadData.length }),
            ...(data && typeof data === "object" && "token" in data && { token: data.token }),
        });
    }

    /**
     * Send a 201 Created response
     * @param {Object} res - Express response object
     * @param {Object} data - Payload data
     * @param {string} [message="Resource created successfully"]
     */
    static created(res, data = {}, message = "Resource created successfully") {
        return ApiResponse.success(res, data, message, 201);
    }
}

export default ApiResponse;
