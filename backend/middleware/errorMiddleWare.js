const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode);

    // Log detailed error information
    console.error('ERROR HANDLER TRIGGERED:');
    console.error(`Status Code: ${statusCode}`);
    console.error(`Error Message: ${err.message}`);
    console.error(`Request URL: ${req.originalUrl}`);
    console.error(`Request Method: ${req.method}`);
    console.error(`Request Headers:`, req.headers);
    
    if (err.name === 'CORSError' || err.message.includes('CORS')) {
        console.error('CORS ERROR DETECTED. Request origin:', req.headers.origin);
        console.error('Allowed origins:', ['http://localhost:5173', 'http://167.172.66.203:5001', 'http://167.172.66.203']);
    }
    
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : null,
    });
};

module.exports = errorHandler;
