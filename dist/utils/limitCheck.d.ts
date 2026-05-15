import { Types } from 'mongoose';
import { Response } from 'express';
type Resource = 'members' | 'staff' | 'services';
export declare function enforceLimit(branchId: Types.ObjectId, resource: Resource, res: Response): Promise<boolean>;
export {};
//# sourceMappingURL=limitCheck.d.ts.map