import { Types } from 'mongoose';
import { Response } from 'express';
import Branch from '../models/Branch';
import SubscriptionTier from '../models/SubscriptionTier';
import Member from '../models/Member';
import Staff from '../models/Staff';
import Service from '../models/Service';

type Resource = 'members' | 'staff' | 'services';

export async function enforceLimit(
  branchId: Types.ObjectId,
  resource: Resource,
  res: Response
): Promise<boolean> {
  const branch = await Branch.findById(branchId).select('subscription');
  if (!branch?.subscription?.tierId) return true; // no tier yet — allow

  const tier = await SubscriptionTier.findById(branch.subscription.tierId);
  if (!tier) return true;

  let current: number;
  let limit: number;
  let label: string;

  if (resource === 'members') {
    current = await Member.countDocuments({ branch: branchId, status: 'active' });
    limit = tier.memberLimit + branch.subscription.additionalMembers;
    label = 'active members';
  } else if (resource === 'staff') {
    current = await Staff.countDocuments({ branch: branchId, status: 'active' });
    limit = tier.staffLimit + (branch.subscription?.additionalStaff ?? 0);
    label = 'staff accounts';
  } else {
    current = await Service.countDocuments({ branch: branchId, status: 'active' });
    limit = tier.serviceLimit + (branch.subscription?.additionalServices ?? 0);
    label = 'services';
  }

  if (current >= limit) {
    res.status(403).json({
      error: `You have reached your ${tier.name} tier limit of ${limit} ${label}. Visit Subscription to increase your limit.`,
      code: 'LIMIT_REACHED',
      current,
      limit,
      resource,
    });
    return false;
  }
  return true;
}
