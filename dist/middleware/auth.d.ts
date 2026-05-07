import { Request, Response, NextFunction } from 'express';
import { IBranch } from '../types';
import { Document } from 'mongoose';
export interface AuthRequest extends Request {
    branch?: Document & IBranch & {
        gym: {
            _id: unknown;
            name: string;
            status: string;
        };
    };
}
declare const protect: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export default protect;
//# sourceMappingURL=auth.d.ts.map