const customErrorhandler = (err, req, res, next) => {
    return res.json({ INTERNAL_ERROR: err.message });    
}

module.exports = customErrorhandler;