const express = require("express");
const {
  getStudentsInSpecificClassTaughtByTeacher,
  dashboard,
} = require("../Controllers/teacher");

const router = express.Router();
const Course = require("../models/courses");
const Teacher = require("../models/teacher");

const mongoose = require("mongoose");

//GET Routes
router.get("/", function (req, res, next) {
  res.send("Teacher Dashboard");
});

//get all students in specific class taught by a teacher
router.get("/classes/:cid/students", getStudentsInSpecificClassTaughtByTeacher);

router.put("/addmarks/:sid/:cid", function (req, res, next) {
  const { marks } = req.body; // Assuming marks are passed in the request body

  Courses.findOneAndUpdate(
    {
      _id: mongoose.Types.ObjectId(req.params.cid),
      "students.sid": mongoose.Types.ObjectId(req.params.sid),
    },
    {
      $set: {
        "students.$.marks": marks,
      },
    },
    { new: true, upsert: false }
  ).then(
    (result) => {
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ message: "Course or student not found" });
      }
    },
    (err) => {
      res.status(500).json({ error: err.message });
    }
  );
});

// Route to reset a student's marks in a certain course to zero
router.delete("/deleteMarks/:sid/:cid", async (req, res) => {
  const { sid, cid } = req.params;

  try {
    // Convert the provided IDs to MongoDB ObjectId
    const courseId = new mongoose.Types.ObjectId(cid);
    const studentId = new mongoose.Types.ObjectId(sid);

    // Update the course to reset the student's marks to zero
    const updatedCourse = await Course.findOneAndUpdate(
      { _id: courseId, "students.sid": studentId },
      { $set: { "students.$.marks": 0 } },
      { new: true }
    );

    // Check if the course exists
    if (!updatedCourse) {
      return res.status(404).json({ error: "Course or student not found" });
    }

    // Return the updated course object
    res.json(updatedCourse);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to delete marks of all students in a course
router.delete("/removemarks/:cid", async (req, res) => {
  try {
    const courseId = req.params.cid;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    course.students.forEach((student) => {
      student.marks = undefined;
    });
    await course.save();
    res.json({ message: "Marks of all students removed from the course" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//PUT route to update details of a specific teacher -- FA21-BCS-069
router.put("/:id", async (req, res) => {
  const teacherId = req.params.id;
  const updates = req.body;

  try {
    const teacher = await Teacher.findByIdAndUpdate(teacherId, updates, { new: true });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({ teacher });
  } catch (error) {
    console.error("Error updating teacher:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Route to reset a student's marks in a certain course to zero
router.delete("/deleteMarks/:sid/:cid", async (req, res) => {
  const { sid, cid } = req.params;

  try {
    // Convert the provided IDs to MongoDB ObjectId
    const courseId = new mongoose.Types.ObjectId(cid);
    const studentId = new mongoose.Types.ObjectId(sid);

    // Update the course to reset the student's marks to zero
    const updatedCourse = await Course.findOneAndUpdate(
      { _id: courseId, "students.sid": studentId },
      { $set: { "students.$.marks": 0 } },
      { new: true }
    );

    // Check if the course exists
    if (!updatedCourse) {
      return res.status(404).json({ error: "Course or student not found" });
    }

    // Return the updated course object
    res.json(updatedCourse);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to delete marks of all students in a course
router.delete("/removemarks/:cid", async (req, res) => {
  try {
    const courseId = req.params.cid;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    course.students.forEach((student) => {
      student.marks = undefined;
    });
    await course.save();
    res.json({ message: "Marks of all students removed from the course" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

//PUT route to update details of a specific teacher -- FA21-BCS-069
router.put("/:id", async (req, res) => {
  const teacherId = req.params.id;
  const updates = req.body;

  try {
    const teacher = await Teacher.findByIdAndUpdate(teacherId, updates, {
      new: true,
    });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    res.json({ teacher });
  } catch (error) {
    console.error("Error updating teacher:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/dashboard", dashboard);

module.exports = router;
