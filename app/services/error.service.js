function error (req, res, message) {  
  console.log(message)
  return res.status(400).json({
    error: message
  })
};

module.exports = {
  error,
}
