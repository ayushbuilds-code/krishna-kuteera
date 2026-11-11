import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const STORE_PATH = '/tmp/krishna-kuteera-store.json';
const PORT = Number(process.env.PORT) || 3000;

const OUTLET_NAMES = {
  '11111111-1111-4111-8111-111111111101':
    'Krishna Kuteera — Hulimavu (Bannerghatta Rd)',
  '11111111-1111-4111-8111-111111111102': 'Krishna Kuteera — JP Nagar 7th Phase',
  '11111111-1111-4111-8111-111111111103': 'Krishna Kuteera — Jayanagar 4th Block',
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
};

function seedOrders() {
  const now = Date.now();
  const mk = (
    idx,
    outletId,
    num,
    name,
    phone,
    type,
    status,
    minsAgo,
    lineList
  ) => {
    const subtotal = lineList.reduce((s, l) => s + l.qty * l.price, 0);
    const gst = Math.round(subtotal * 0.05 * 100) / 100;
    const createdAt = new Date(now - minsAgo * 60000).toISOString();
    return {
      outletName: OUTLET_NAMES[outletId] || 'Krishna Kuteera',
      order: {
        id: `seed-ord-${idx}`,
        order_number: num,
        outlet_id: outletId,
        customer_id: null,
        customer_name: name,
        customer_phone: phone,
        customer_email: null,
        order_type: type,
        status,
        payment_status: 'paid',
        subtotal,
        gst_amount: gst,
        discount_amount: 0,
        delivery_fee: type === 'delivery' ? 30 : 0,
        total_amount: subtotal + gst + (type === 'delivery' ? 30 : 0),
        coupon_code: null,
        loyalty_points_redeemed: 0,
        loyalty_points_earned: Math.floor(subtotal / 100) * 5,
        delivery_address:
          type === 'delivery' ? '14th Cross, Hulimavu, Bengaluru' : null,
        order_notes: idx === 1 ? 'Extra coconut chutney please' : null,
        scheduled_for: null,
        estimated_ready_at: new Date(now + 15 * 60000).toISOString(),
        created_at: createdAt,
        updated_at: createdAt,
      },
      items: lineList.map((l, i) => ({
        id: `seed-ord-${idx}-it-${i}`,
        order_id: `seed-ord-${idx}`,
        menu_item_id: `item-${i}`,
        item_name: l.name,
        quantity: l.qty,
        unit_price: l.price,
        total_price: l.qty * l.price,
        spice_preference: 'medium',
        is_jain: Boolean(l.isJain),
        special_instructions: null,
      })),
    };
  };

  return [
    mk(
      1,
      '11111111-1111-4111-8111-111111111101',
      'KK-HUL-1081',
      'Srinivas Murthy',
      '9845011223',
      'pickup',
      'received',
      3,
      [
        { name: 'Benne Masala Dosa', qty: 2, price: 95 },
        { name: 'Madras Filter Coffee (Brass Davara)', qty: 2, price: 35 },
      ]
    ),
    mk(
      2,
      '11111111-1111-4111-8111-111111111101',
      'KK-HUL-1080',
      'Kavitha N',
      '9900122334',
      'delivery',
      'preparing',
      11,
      [
        { name: 'Rava Idli', qty: 2, price: 75, isJain: true },
        { name: 'Chow Chow Bath (Khara & Kesari)', qty: 1, price: 85 },
      ]
    ),
    mk(
      3,
      '11111111-1111-4111-8111-111111111101',
      'KK-HUL-1079',
      'Arjun Deshpande',
      '9880144556',
      'pickup',
      'ready',
      19,
      [{ name: 'Idli Vada Combo (2 Idli + 1 Vada)', qty: 3, price: 70 }]
    ),
    mk(
      4,
      '11111111-1111-4111-8111-111111111101',
      'KK-HUL-1076',
      'Lakshmi Narayanan',
      '9741055667',
      'dine_in',
      'completed',
      48,
      [
        { name: 'Krishna Kuteera Banana Leaf Meal', qty: 2, price: 175 },
        { name: 'Bele Obbattu / Holige (2 Pcs)', qty: 1, price: 90 },
      ]
    ),
    mk(
      5,
      '11111111-1111-4111-8111-111111111102',
      'KK-JPN-2041',
      'Rohit Sharma',
      '9845233445',
      'pickup',
      'received',
      4,
      [
        { name: 'Mysore Masala Dosa', qty: 2, price: 110 },
        { name: 'Madras Filter Coffee (Brass Davara)', qty: 1, price: 35 },
      ]
    ),
    mk(
      6,
      '11111111-1111-4111-8111-111111111103',
      'KK-JAY-3012',
      'Vasudha Iyer',
      '9886077889',
      'pickup',
      'completed',
      55,
      [
        { name: 'KK Bakers Bengaluru Honey Cake (2 Pcs)', qty: 2, price: 70 },
        { name: 'Madras Filter Coffee (Brass Davara)', qty: 2, price: 30 },
      ]
    ),
  ];
}

function loadStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
      if (Array.isArray(parsed.orders) && parsed.orders.length > 0) {
        return parsed.orders;
      }
    }
  } catch {
    // ignore corrupt/unavailable temp store
  }
  return seedOrders();
}

let ordersStore = loadStore();

function persistStore() {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify({ orders: ordersStore }));
  } catch {
    // ignore disk errors
  }
}

const sseClients = new Set();

function broadcastEvent(payload) {
  const line = `data: ${JSON.stringify(payload)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(line);
    } catch {
      sseClients.delete(res);
    }
  }
}

setInterval(() => {
  for (const res of sseClients) {
    try {
      res.write(': ping\n\n');
    } catch {
      sseClients.delete(res);
    }
  }
}, 25000).unref();

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(data));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function serveStaticFile(reqPath, res) {
  let cleanPath = decodeURIComponent(reqPath.split('?')[0]);
  if (cleanPath === '/') cleanPath = '/index.html';

  const resolved = path.resolve(DIST_DIR, `.${cleanPath}`);
  const isInsideDist =
    resolved === DIST_DIR || resolved.startsWith(`${DIST_DIR}${path.sep}`);

  let targetFile = isInsideDist ? resolved : path.join(DIST_DIR, 'index.html');
  let isFallbackHtml = false;

  if (!fs.existsSync(targetFile) || fs.statSync(targetFile).isDirectory()) {
    // SPA fallback for every client route (/menu, /admin/orders, /track-order/...)
    targetFile = path.join(DIST_DIR, 'index.html');
    isFallbackHtml = true;
  }

  if (!fs.existsSync(targetFile)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Build not found. Run npm run build.');
    return;
  }

  const ext = path.extname(targetFile).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const cacheControl =
    !isFallbackHtml && cleanPath.startsWith('/assets/')
      ? 'public, max-age=31536000, immutable'
      : 'no-cache';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': cacheControl,
  });
  fs.createReadStream(targetFile).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;

  // API endpoints for cross-device live kitchen sync
  if (pathname === '/api/health' && req.method === 'GET') {
    sendJson(res, 200, { ok: true, ordersCount: ordersStore.length });
    return;
  }

  if (pathname === '/api/events' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write(': connected\n\n');
    sseClients.add(res);
    req.on('close', () => {
      sseClients.delete(res);
    });
    return;
  }

  if (pathname === '/api/orders' && req.method === 'GET') {
    const outletId = url.searchParams.get('outletId') || 'all';
    const sorted = [...ordersStore].sort(
      (a, b) =>
        new Date(b.order.created_at).getTime() -
        new Date(a.order.created_at).getTime()
    );
    const filtered =
      outletId === 'all'
        ? sorted
        : sorted.filter((entry) => entry.order.outlet_id === outletId);
    sendJson(res, 200, { orders: filtered });
    return;
  }

  if (pathname === '/api/orders' && req.method === 'POST') {
    try {
      const body = await readJsonBody(req);
      if (!body?.order?.id) {
        sendJson(res, 400, { error: 'Invalid order payload' });
        return;
      }
      const record = {
        order: body.order,
        items: Array.isArray(body.items) ? body.items : [],
        outletName:
          body.outletName ||
          OUTLET_NAMES[body.order.outlet_id] ||
          'Krishna Kuteera',
      };
      ordersStore = [
        record,
        ...ordersStore.filter((r) => r.order.id !== record.order.id),
      ].slice(0, 100);
      persistStore();
      broadcastEvent({
        type: 'NEW_ORDER',
        orderId: record.order.id,
        outletId: record.order.outlet_id,
      });
      sendJson(res, 201, { record });
    } catch {
      sendJson(res, 400, { error: 'Malformed JSON body' });
    }
    return;
  }

  if (pathname === '/api/orders/lookup' && req.method === 'GET') {
    const num = (url.searchParams.get('orderNumber') || '').trim().toUpperCase();
    const phone = (url.searchParams.get('phone') || '').replace(/\D/g, '').slice(-4);
    const match = ordersStore.find(
      (r) =>
        r.order.order_number.toUpperCase() === num &&
        r.order.customer_phone.replace(/\D/g, '').slice(-4) === phone
    );
    sendJson(res, 200, { record: match || null });
    return;
  }

  const statusMatch = pathname.match(/^\/api\/orders\/([^/]+)\/status$/);
  if (statusMatch && (req.method === 'PATCH' || req.method === 'POST')) {
    try {
      const orderId = decodeURIComponent(statusMatch[1]);
      const body = await readJsonBody(req);
      const nextStatus = body?.status;
      if (!nextStatus) {
        sendJson(res, 400, { error: 'Missing status' });
        return;
      }
      const now = new Date().toISOString();
      let updatedRecord = null;
      ordersStore = ordersStore.map((entry) => {
        if (entry.order.id !== orderId) return entry;
        updatedRecord = {
          ...entry,
          order: { ...entry.order, status: nextStatus, updated_at: now },
        };
        return updatedRecord;
      });
      if (!updatedRecord) {
        sendJson(res, 404, { error: 'Order not found' });
        return;
      }
      persistStore();
      broadcastEvent({
        type: 'ORDER_STATUS_UPDATED',
        orderId,
        status: nextStatus,
      });
      sendJson(res, 200, { record: updatedRecord });
    } catch {
      sendJson(res, 400, { error: 'Malformed JSON body' });
    }
    return;
  }

  const singleMatch = pathname.match(/^\/api\/orders\/([^/]+)$/);
  if (singleMatch && req.method === 'GET') {
    const id = decodeURIComponent(singleMatch[1]);
    const match = ordersStore.find(
      (r) => r.order.id === id || r.order.order_number === id
    );
    sendJson(res, 200, { record: match || null });
    return;
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStaticFile(pathname, res);
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Krishna Kuteera server listening on http://localhost:${PORT}`);
});
