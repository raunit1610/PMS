import Diary from "../models/Diary.js";
import mongoose from "mongoose";

// GET /feature/diary - Get all diary entries for a user
async function handleDiaryGet(req, res) {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        message: "userId is required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId format"
      });
    }

    const diaries = await Diary.find({ userId }).sort({ date: -1 });
    
    res.status(200).json(diaries);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// GET /feature/diary/:id - Get a specific diary entry
async function handleDiaryEntryGet(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid diary id format"
      });
    }

    const diary = await Diary.findById(id);
    
    if (!diary) {
      return res.status(404).json({
        message: "Diary entry not found"
      });
    }
    
    res.status(200).json(diary);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// POST /feature/diary - Create a new diary entry
async function handleDiaryPost(req, res) {
  try {
    const { userId, date, title, content, mood } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        message: "userId and content are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId format"
      });
    }

    // Use provided date or today's date
    const entryDate = date ? new Date(date) : new Date();
    // Set time to start of day for consistency
    entryDate.setHours(0, 0, 0, 0);

    // Check if entry already exists for this date
    const existingEntry = await Diary.findOne({
      userId,
      date: {
        $gte: new Date(entryDate),
        $lt: new Date(entryDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingEntry) {
      // Update existing entry
      existingEntry.title = title || existingEntry.title;
      existingEntry.content = content;
      existingEntry.mood = mood || existingEntry.mood;
      await existingEntry.save();
      return res.status(200).json(existingEntry);
    }

    const diary = await Diary.create({
      userId,
      date: entryDate,
      title: title || "",
      content,
      mood: mood || "neutral"
    });

    res.status(201).json(diary);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Diary entry already exists for this date"
      });
    }
    res.status(500).json({
      message: error.message,
    });
  }
}

// PUT /feature/diary/:id - Update a diary entry
async function handleDiaryPut(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid diary id format"
      });
    }

    // If date is being updated, normalize it
    if (updateData.date) {
      const entryDate = new Date(updateData.date);
      entryDate.setHours(0, 0, 0, 0);
      updateData.date = entryDate;
    }

    const diary = await Diary.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!diary) {
      return res.status(404).json({
        message: "Diary entry not found"
      });
    }

    res.status(200).json(diary);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

// DELETE /feature/diary/:id - Delete a diary entry
async function handleDiaryDelete(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid diary id format"
      });
    }

    const deletedDiary = await Diary.findByIdAndDelete(id);
    if (!deletedDiary) {
      return res.status(404).json({ message: "Diary entry not found" });
    }
    
    return res.status(200).json({ message: "Diary entry deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

export {
  handleDiaryGet,
  handleDiaryEntryGet,
  handleDiaryPost,
  handleDiaryPut,
  handleDiaryDelete
};

