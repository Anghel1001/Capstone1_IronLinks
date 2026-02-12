import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import OpenAI from "openai";

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT || 3000;

// ============================
// MULTER CONFIG (MEMORY ONLY)
// ============================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ============================
// MIDDLEWARE
// ============================
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ============================
// SUPABASE CLIENT (SERVICE ROLE)
// ============================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ============================
// OPENAI CLIENT
// ============================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ============================
// HOME
// ============================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// =================================================
// CREATE BOOKING (FIXED: status added)
// =================================================
app.post("/book", upload.single("reference_image"), async (req, res) => {
  try {
    const { name, email, phone, date, time, request } = req.body;

    if (!name || !email || !phone || !date || !time) {
      return res.status(400).send("Please fill in all required fields.");
    }

    const { data: existing = [], error: checkError } = await supabase
      .from("bookings")
      .select("*")
      .eq("date", date)
      .eq("time", time);

    if (checkError) throw checkError;
    if (existing.length > 0) {
      return res.status(400).send("This date and time is already booked.");
    }

    let imageUrl = null;

    if (req.file) {
      const filePath = `bookings/${Date.now()}-${req.file.originalname}`;

      const { error: uploadError } = await supabase.storage
        .from("booking-images")
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype
        });

      if (uploadError) throw uploadError;

      imageUrl = supabase.storage
        .from("booking-images")
        .getPublicUrl(filePath).data.publicUrl;
    }

    // 🔥 FIX: status added
    const { error } = await supabase.from("bookings").insert([{
      name,
      email,
      phone,
      date,
      time,
      request,
      reference_image_url: imageUrl,
      status: "pending"
    }]);

    if (error) throw error;

    res.send("Booking successful!");
  } catch (err) {
    console.error("❌ Booking error:", err);
    res.status(500).send(err.message);
  }
});

// ============================
// GET ALL BOOKINGS
// ============================
app.get("/bookings", async (req, res) => {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Database error" });
  }

  res.json(data);
});

// =================================================
// 🔥 NEW: UPDATE BOOKING STATUS (ACCEPT / REJECT)
// =================================================
app.patch("/bookings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);

    if (error) throw error;

    res.json({ success: true });

  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ error: "Failed to update booking" });
  }
});

// =================================================
// GALLERY UPLOAD (UNCHANGED)
// =================================================
app.post("/gallery", upload.single("image"), async (req, res) => {
  try {
    const { category } = req.body;

    if (!category || !req.file) {
      return res.status(400).send("Category and image are required.");
    }

    const filePath = `gallery/${Date.now()}-${req.file.originalname}`;

    const { error: uploadError } = await supabase.storage
      .from("gallery-images")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype
      });

    if (uploadError) throw uploadError;

    const imageUrl = supabase.storage
      .from("gallery-images")
      .getPublicUrl(filePath).data.publicUrl;

    const { error } = await supabase.from("gallery").insert([
      { category, image_url: imageUrl }
    ]);

    if (error) throw error;

    res.send("Gallery image uploaded");
  } catch (err) {
    console.error("❌ Gallery upload error:", err);
    res.status(500).send(err.message);
  }
});

// ============================
// GET GALLERY
// ============================
app.get("/gallery", async (req, res) => {
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return res.status(500).json({ error: "Database error" });
  }

  res.json(data);
});

// =================================================
// DELETE GALLERY IMAGE
// =================================================
app.delete("/gallery/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("gallery")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    return res.status(500).send(error.message);
  }

  res.send("Gallery image deleted");
});

// =================================================
// OPENAI DESIGN FINDER (UNCHANGED)
// =================================================
app.post("/design-finder", upload.single("reference_image"), async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.json({ success: false });
    }

    const prompt = `
A professional, realistic wrought iron design
${description}.
Front view.
White background.
High detail.
Concept design only.
`;

    const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024"
    });

    const base64Image = image.data[0].b64_json;

    res.json({
      success: true,
      generated_image: `data:image/png;base64,${base64Image}`
    });

  } catch (err) {
    console.error("❌ OpenAI generation error:", err);
    res.status(500).json({ success: false });
  }
});

// ============================
// SERVER RUN
// ============================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
