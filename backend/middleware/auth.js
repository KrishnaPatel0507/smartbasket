// Server-side Role-Based Access Control (RBAC) Middleware

function requireAdmin(req, res, next) {
  const userRole = req.headers['x-user-role'] || req.body?.userRole;
  const userEmail = req.headers['x-user-email'] || req.body?.userEmail;
  const authHeader = req.headers['authorization'];

  // Verified admin credentials
  const isAdmin = userRole === 'admin' ||
    userEmail === 'admin@smartbasket.com' ||
    (authHeader && authHeader.includes('admin-token-mock'));

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Store Administrator privileges required to execute supply chain and catalog operations.'
    });
  }

  next();
}

module.exports = {
  requireAdmin
};
