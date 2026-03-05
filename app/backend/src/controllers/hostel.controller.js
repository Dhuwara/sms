import HostelRoom from '../models/HostelRoom.js';
import HostelAllocation from '../models/HostelAllocation.js';

// ── Rooms ─────────────────────────────────────────────────────────────────────

export const getRooms = async (req, res, next) => {
  try {
    const rooms = await HostelRoom.find().sort({ roomNumber: 1 });
    res.json({ success: true, data: rooms });
  } catch (err) {
    next(err);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    const { room_no, capacity, ...rest } = req.body;
    const room = await HostelRoom.create({
      roomNumber: room_no || rest.roomNumber,
      capacity: capacity || rest.capacity || 2,
      ...rest,
    });
    res.status(201).json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const room = await HostelRoom.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: room });
  } catch (err) {
    next(err);
  }
};

export const deleteRoom = async (req, res, next) => {
  try {
    const room = await HostelRoom.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    await HostelAllocation.deleteMany({ roomId: req.params.id });
    res.json({ success: true, message: 'Room deleted' });
  } catch (err) {
    next(err);
  }
};

// ── Allocations ───────────────────────────────────────────────────────────────

export const getAllocations = async (req, res, next) => {
  try {
    const allocations = await HostelAllocation.find({ status: 'active' })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
      .populate('roomId', 'roomNumber floor type');
    res.json({ success: true, data: allocations });
  } catch (err) {
    next(err);
  }
};

export const createAllocation = async (req, res, next) => {
  try {
    const { studentId, roomId } = req.body;
    const room = await HostelRoom.findById(roomId);
    if (!room || room.occupancy >= room.capacity) {
      return res.status(400).json({ success: false, message: 'Room is full or not found' });
    }
    const allocation = await HostelAllocation.create({ studentId, roomId });
    await HostelRoom.findByIdAndUpdate(roomId, {
      $inc: { occupancy: 1 },
      ...(room.occupancy + 1 >= room.capacity && { status: 'full' }),
    });
    res.status(201).json({ success: true, data: allocation });
  } catch (err) {
    next(err);
  }
};

export const deleteAllocation = async (req, res, next) => {
  try {
    const allocation = await HostelAllocation.findByIdAndUpdate(
      req.params.id,
      { status: 'vacated', checkOut: new Date() },
      { new: true }
    );
    if (!allocation) return res.status(404).json({ success: false, message: 'Allocation not found' });
    await HostelRoom.findByIdAndUpdate(allocation.roomId, {
      $inc: { occupancy: -1 },
      status: 'available',
    });
    res.json({ success: true, message: 'Student vacated' });
  } catch (err) {
    next(err);
  }
};
