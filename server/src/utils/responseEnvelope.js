export function sendSuccess(res, data, meta = {}, statusCode = 200) {
  const requestId = res.getHeader("X-Request-Id");
  const responseMeta = {
    timestamp: new Date().toISOString(),
    ...(requestId ? { requestId } : {}),
    ...meta,
  };

  return res.status(statusCode).json({
    success: true,
    data,
    meta: responseMeta,
  });
}

export function sendPaginated(res, items, total, page, pageSize, meta = {}) {
  const pageNum = parseInt(page, 10) || 1;
  const sizeNum = parseInt(pageSize, 10) || 10;
  const totalPages = Math.ceil(total / sizeNum) || 1;

  const paginationMeta = {
    items: items.length,
    page: pageNum,
    pageSize: sizeNum,
    total,
    totalPages,
    ...meta,
  };

  return sendSuccess(res, items, paginationMeta);
}

export function sendError(res, message, code = "BAD_REQUEST", statusCode = 400, details = null) {
  const requestId = res.getHeader("X-Request-Id");
  
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(requestId ? { requestId } : {}),
    },
  });
}
