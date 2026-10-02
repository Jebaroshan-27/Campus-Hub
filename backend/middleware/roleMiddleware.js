/**
 * Role-based authorization middleware
 * @param  {...string} roles Allowed roles ('student', 'faculty', 'admin')
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${roles.join(', ')}] role(s). Your role is [${req.user.role}].`,
      });
    }

    next();
  };
};

module.exports = { requireRole };
