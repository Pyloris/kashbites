import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import { auth, signToken, verifyToken } from '../src/middleware/auth/index.js';
import { appConfig } from '../src/config/app-config.js';
import { ApiError } from '../src/errors/api-error.js';

describe('Authentication & Role Authorization Middleware Suite', () => {
    // Helper to simulate Express middleware execution
    const runMiddleware = (middleware, req) => {
        return new Promise((resolve) => {
            const res = {};
            let nextCalled = false;
            let capturedError = null;

            middleware(req, res, (err) => {
                nextCalled = true;
                capturedError = err || null;
                resolve({ nextCalled, error: capturedError, req });
            });
        });
    };

    it('1. signToken creates valid JWT and verifyToken decodes expected payload', () => {
        const payload = {
            id: 'admin-123',
            username: 'shoaibwani',
            role: 'superadmin',
            email: 'shoaib@kashbites.com',
        };

        const token = signToken(payload, { expiresIn: '1h' });
        assert.ok(token, 'Token string should be generated');
        assert.strictEqual(typeof token, 'string');

        const decoded = verifyToken(token);
        assert.strictEqual(decoded.id, 'admin-123');
        assert.strictEqual(decoded.username, 'shoaibwani');
        assert.strictEqual(decoded.role, 'superadmin');
    });

    it('2. auth() rejects request when Authorization header is missing', async () => {
        const middleware = auth();
        const req = { headers: {} };

        const { nextCalled, error } = await runMiddleware(middleware, req);

        assert.strictEqual(nextCalled, true);
        assert.ok(error instanceof ApiError, 'Should pass ApiError to next');
        assert.strictEqual(error.statusCode, 401);
        assert.match(error.message, /Bearer token is required/i);
    });

    it('3. auth() rejects request when Authorization header lacks Bearer prefix', async () => {
        const middleware = auth();
        const req = { headers: { authorization: 'Basic dXNlcjpwYXNz' } };

        const { nextCalled, error } = await runMiddleware(middleware, req);

        assert.strictEqual(nextCalled, true);
        assert.ok(error instanceof ApiError);
        assert.strictEqual(error.statusCode, 401);
    });

    it('4. auth() rejects empty Bearer token', async () => {
        const middleware = auth();
        const req = { headers: { authorization: 'Bearer   ' } };

        const { nextCalled, error } = await runMiddleware(middleware, req);

        assert.strictEqual(nextCalled, true);
        assert.ok(error instanceof ApiError);
        assert.strictEqual(error.statusCode, 401);
    });

    it('5. auth() rejects invalid or malformed JWT token', async () => {
        const middleware = auth();
        const req = { headers: { authorization: 'Bearer this.is.an.invalid.token' } };

        const { nextCalled, error } = await runMiddleware(middleware, req);

        assert.strictEqual(nextCalled, true);
        assert.ok(error instanceof ApiError);
        assert.strictEqual(error.statusCode, 401);
        assert.match(error.message, /invalid or malformed/i);
    });

    it('6. auth() rejects expired JWT token with descriptive message', async () => {
        const expiredToken = jwt.sign(
            { id: 'usr-expired', role: 'customer' },
            appConfig.JWT_SECRET,
            { expiresIn: -10 } // Already expired 10 seconds ago
        );

        const middleware = auth();
        const req = { headers: { authorization: `Bearer ${expiredToken}` } };

        const { nextCalled, error } = await runMiddleware(middleware, req);

        assert.strictEqual(nextCalled, true);
        assert.ok(error instanceof ApiError);
        assert.strictEqual(error.statusCode, 401);
        assert.match(error.message, /expired/i);
    });

    it('7. auth() allows any valid authenticated user when no role is specified and maps to member', async () => {
        const token = signToken({ id: 'usr-555', role: 'member', name: 'Zahoor Ahmad' });
        const middleware = auth();
        const req = { headers: { authorization: `Bearer ${token}` } };

        const { nextCalled, error } = await runMiddleware(middleware, req);

        assert.strictEqual(nextCalled, true);
        assert.strictEqual(error, null, 'Should not have error');
        assert.ok(req.user, 'req.user must be populated');
        assert.strictEqual(req.user.id, 'usr-555');
        assert.strictEqual(req.user.role, 'member');
    });

    it('8. auth({ role: ["superadmin"] }) allows superadmin role', async () => {
        const adminMiddleware = auth({ role: ['superadmin'] });

        // Test with superadmin role
        const superToken = signToken({ id: 'adm-02', role: 'superadmin', name: 'Shoaib' });
        const superReq = { headers: { authorization: `Bearer ${superToken}` } };
        const res = await runMiddleware(adminMiddleware, superReq);

        assert.strictEqual(res.error, null);
        assert.strictEqual(superReq.user.role, 'superadmin');
        assert.strictEqual(superReq.user.isAdmin, true);
    });

    it('9. auth({ role: ["superadmin"] }) rejects member users with 403 Forbidden', async () => {
        const adminMiddleware = auth({ role: ['superadmin'] });
        const memberToken = signToken({ id: 'cust-99', role: 'member' });
        const req = { headers: { authorization: `Bearer ${memberToken}` } };

        const { nextCalled, error } = await runMiddleware(adminMiddleware, req);

        assert.strictEqual(nextCalled, true);
        assert.ok(error instanceof ApiError);
        assert.strictEqual(error.statusCode, 403, 'Should return 403 Forbidden');
        assert.match(error.message, /insufficient permissions/i);
    });

    it('10. auth({ role: ["member"] }) allows member role and rejects superadmin', async () => {
        const memberMiddleware = auth({ role: ['member'] });
        const memberToken = signToken({ id: 'cust-42', role: 'member' });
        const reqMember = { headers: { authorization: `Bearer ${memberToken}` } };

        const res1 = await runMiddleware(memberMiddleware, reqMember);

        assert.strictEqual(res1.nextCalled, true);
        assert.strictEqual(res1.error, null);
        assert.strictEqual(reqMember.user.id, 'cust-42');
        assert.strictEqual(reqMember.user.role, 'member');

        // Test superadmin gets rejected when strictly member is required
        const superToken = signToken({ id: 'adm-02', role: 'superadmin' });
        const reqSuper = { headers: { authorization: `Bearer ${superToken}` } };
        const res2 = await runMiddleware(memberMiddleware, reqSuper);
        assert.strictEqual(res2.error.statusCode, 403);
    });

    it('11. auth({ role: ["superadmin", "member"] }) allows both superadmin and member roles', async () => {
        const multiRoleMiddleware = auth({ role: ['superadmin', 'member'] });

        // Test superadmin access
        const superToken = signToken({ id: 'adm-02', role: 'superadmin' });
        const reqSuper = { headers: { authorization: `Bearer ${superToken}` } };
        const resSuper = await runMiddleware(multiRoleMiddleware, reqSuper);
        assert.strictEqual(resSuper.error, null);
        assert.strictEqual(reqSuper.user.role, 'superadmin');

        // Test member access
        const memberToken = signToken({ id: 'cust-101', role: 'member' });
        const reqMember = { headers: { authorization: `Bearer ${memberToken}` } };
        const resMember = await runMiddleware(multiRoleMiddleware, reqMember);
        assert.strictEqual(resMember.error, null);
        assert.strictEqual(reqMember.user.role, 'member');
    });

    it('12. auth({ optional: true }) allows unauthenticated requests without throwing 401', async () => {
        const optionalMiddleware = auth({ optional: true });
        const req = { headers: {} };

        const { nextCalled, error } = await runMiddleware(optionalMiddleware, req);

        assert.strictEqual(nextCalled, true);
        assert.strictEqual(error, null);
        assert.strictEqual(req.user, undefined);
    });

    it('13. auth({ optional: true }) attaches req.user when valid Bearer token is provided', async () => {
        const optionalMiddleware = auth({ optional: true });
        const token = signToken({ id: 'cust-guest-converted', role: 'member' });
        const req = { headers: { authorization: `Bearer ${token}` } };

        const { nextCalled, error } = await runMiddleware(optionalMiddleware, req);

        assert.strictEqual(nextCalled, true);
        assert.strictEqual(error, null);
        assert.ok(req.user);
        assert.strictEqual(req.user.id, 'cust-guest-converted');
        assert.strictEqual(req.user.role, 'member');
    });

    it('14. auth() supports backward-compatible legacy admin and customer tokens', async () => {
        const middleware = auth({ role: ['superadmin'] });

        // admin_jwt_ token
        const reqAdmin = { headers: { authorization: 'Bearer admin_jwt_shoaibwani' } };
        const resAdmin = await runMiddleware(middleware, reqAdmin);
        assert.strictEqual(resAdmin.error, null);
        assert.strictEqual(reqAdmin.user.isAdmin, true);
        assert.strictEqual(reqAdmin.user.role, 'superadmin');

        // jwt_token_ token with member middleware
        const memberMiddleware = auth({ role: ['member'] });
        const reqMember = { headers: { authorization: 'Bearer jwt_token_usr_test_123' } };
        const resMember = await runMiddleware(memberMiddleware, reqMember);
        assert.strictEqual(resMember.error, null);
        assert.strictEqual(reqMember.user.role, 'member');
    });

    it('15. Internal service key header bypasses token check and grants service credentials', async () => {
        const middleware = auth({ role: 'superadmin|admin' });
        const req = {
            headers: {
                'x-api-key': appConfig.SERVICE_KEY,
                'x-org-id': 'kashbites-warehouse-cluster',
            },
        };

        const { nextCalled, error } = await runMiddleware(middleware, req);

        assert.strictEqual(nextCalled, true);
        assert.strictEqual(error, null);
        assert.ok(req.authenticatedService);
        assert.strictEqual(req.authenticatedService.name, 'internal');
        assert.strictEqual(req.user.role, 'superadmin');
    });
});
