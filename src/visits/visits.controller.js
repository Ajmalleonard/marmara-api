import Visit from "../models/visit.model.js";

export async function createVisit(req, res) {
  const { visitDate, page, ip, country } = req.body;

  try {
    const data = {
      visitDate,
      page,
      country,
      userAgent: req.headers["user-agent"],
      ip,
    };
    const visit = new Visit(data);
    await visit.save();
    res.status(201).json({ success: true, data: visit });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

export async function getVisits(req, res) {
  try {
    const visits = await Visit.find({}).sort({ visitDate: -1 });
    res.status(200).json({ success: true, data: visits });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}

