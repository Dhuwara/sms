import TransportRoute from '../models/TransportRoute.js';
import TransportAssignment from '../models/TransportAssignment.js';

// ── Routes ────────────────────────────────────────────────────────────────────

export const getRoutes = async (req, res, next) => {
  try {
    const routes = await TransportRoute.find().sort({ routeNumber: 1 });
    res.json({ success: true, data: routes });
  } catch (err) {
    next(err);
  }
};

export const createRoute = async (req, res, next) => {
  try {
    const { route_number, driver, ...rest } = req.body;
    const route = await TransportRoute.create({
      routeNumber: route_number || rest.routeNumber,
      driverName: driver || rest.driverName,
      ...rest,
    });
    res.status(201).json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
};

export const updateRoute = async (req, res, next) => {
  try {
    const route = await TransportRoute.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
};

export const deleteRoute = async (req, res, next) => {
  try {
    const route = await TransportRoute.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    await TransportAssignment.deleteMany({ routeId: req.params.id });
    res.json({ success: true, message: 'Route deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Assignments ───────────────────────────────────────────────────────────────

export const getAssignments = async (req, res, next) => {
  try {
    const assignments = await TransportAssignment.find()
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
      .populate('routeId', 'routeNumber driverName');
    res.json({ success: true, data: assignments });
  } catch (err) {
    next(err);
  }
};

export const createAssignment = async (req, res, next) => {
  try {
    const assignment = await TransportAssignment.findOneAndUpdate(
      { studentId: req.body.studentId },
      req.body,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    next(err);
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    const a = await TransportAssignment.findByIdAndDelete(req.params.id);
    if (!a) return res.status(404).json({ success: false, message: 'Assignment not found' });
    res.json({ success: true, message: 'Assignment removed' });
  } catch (err) {
    next(err);
  }
};
