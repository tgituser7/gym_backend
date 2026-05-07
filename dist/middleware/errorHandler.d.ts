import { Request, Response, NextFunction } from 'express';
interface MongoError extends Error {
    code?: number;
    keyValue?: Record<string, unknown>;
    errors?: Record<string, {
        message: string;
    }>;
}
declare const errorHandler: (err: MongoError, _req: Request, res: Response, _next: NextFunction) => void;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map