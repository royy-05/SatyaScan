import { v4 as uuidv4 } from "uuid";

export function requestIdMiddleware(req, res, next) {
  const requestId = req.headers["x-request-id"] || uuidv4();
  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}
