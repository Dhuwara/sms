import Counter from '../models/Counter.js';

const formatDate = (format) => {
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const yy = yyyy.slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  switch (format) {
    case '{{YYYY}}': return yyyy;
    case '{{YY}}': return yy;
    case '{{YY/MM}}': return `${yy}/${mm}`;
    case '{{YYMM}}': return `${yy}${mm}`;
    default: return '';
  }
};

export const generateNextId = async (name, schoolId) => {
  const counter = await Counter.findOneAndUpdate(
    { name, schoolId },
    { $inc: { current: 1 } },
    { new: true }
  );
  if (!counter) return null;

  const sequence = counter.start - 1 + counter.current;
  const paddedSeq = String(sequence).padStart(counter.padding, '0');
  const datePart = formatDate(counter.format);
  return `${counter.prefix}${datePart}${paddedSeq}`;
};

export const configureCounter = async (req, res, next) => {
  try {
    const { name, prefix, format, start, padding } = req.body;
    const schoolId = req.user.schoolId;
    if (!name) return res.status(400).json({ success: false, message: 'Counter name is required' });

    const counter = await Counter.findOneAndUpdate(
      { name, schoolId },
      { prefix: prefix || '', format: format || '{{YYYY}}', start: start ?? 1, padding: padding ?? 3, current: 0, schoolId },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: counter });
  } catch (err) {
    next(err);
  }
};

export const getCounter = async (req, res, next) => {
  try {
    const schoolId = req.user.schoolId;
    const counter = await Counter.findOne({ name: req.params.name, schoolId });
    if (!counter) return res.status(404).json({ success: false, message: 'Counter not found' });
    res.json({ success: true, data: counter });
  } catch (err) {
    next(err);
  }
};
