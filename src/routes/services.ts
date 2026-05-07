import { Router, Response, NextFunction } from 'express';
import Service from '../models/Service';
import Member from '../models/Member';
import protect, { AuthRequest } from '../middleware/auth';
import { branchFilter } from '../utils/gymFilter';

const router = Router();
router.use(protect);

router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, status, category } = req.query as Record<string, string>;
    const extra: Record<string, string> = {};
    if (status) extra.status = status;
    if (category) extra.category = category;
    const filter = branchFilter(req, extra);
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ] as unknown as typeof filter.$or;
    }
    const services = await Service.find(filter)
      .populate('instructor', 'name role specialization')
      .sort({ createdAt: -1 });
    res.json(services);
  } catch (err) { next(err); }
});

router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await Service.findOne(branchFilter(req, { _id: req.params.id }))
      .populate('instructor', 'name role specialization email phone');
    if (!service) { res.status(404).json({ error: 'Service not found' }); return; }
    res.json(service);
  } catch (err) { next(err); }
});

router.post('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await Service.create({ ...req.body, branch: req.branch!._id });
    await service.populate('instructor', 'name role specialization');
    res.status(201).json(service);
  } catch (err) { next(err); }
});

router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await Service.findOneAndUpdate(
      branchFilter(req, { _id: req.params.id }),
      req.body,
      { new: true, runValidators: true }
    ).populate('instructor', 'name role specialization');
    if (!service) { res.status(404).json({ error: 'Service not found' }); return; }
    res.json(service);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const service = await Service.findOneAndDelete(branchFilter(req, { _id: req.params.id }));
    if (!service) { res.status(404).json({ error: 'Service not found' }); return; }
    await Member.updateMany(
      { branch: req.branch!._id, services: service._id },
      { $pull: { services: service._id } }
    );
    res.json({ message: 'Service deleted successfully' });
  } catch (err) { next(err); }
});

export default router;
