import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";
import OpenAI from "openai";
import fs from "fs";
import nodemailer from "nodemailer";

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT || 3000;

// MULTER CONFIG (MEMORY ONLY)

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// MIDDLEWARE

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// SUPABASE CLIENT (SERVICE ROLE)

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// OPENAI CLIENT

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// EMAIL TRANSPORTER

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// HOME

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// CREATE BOOKING (WITH TIME)

app.post("/book", (req, res, next) => {

  upload.single("reference_image")(req, res, function (err) {

      if (err) {
          console.log("====== MULTER ERROR ======");
          console.log(err);
          console.log("FIELD:", err.field);
          return res.status(500).send(err.message);
      }

      next();

  });

}, async (req, res) => {
  try {
    const { name, email, phone, date, time, request } = req.body;

    if (!name || !email || !phone || !date || !time) {
      return res.status(400).send("Please fill in all required fields.");
    }

    // BLOCK SUNDAYS
    
    const selectedDate = new Date(date);
    const day = selectedDate.getDay(); // 0 = Sunday

    if (day === 0) {
      return res.status(400).send("We are closed on Sundays.");
    }

    //  ALLOWED TIME SLOTS ONLY
    
    const allowedTimes = [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00"
    ];

    if (!allowedTimes.includes(time)) {
      return res.status(400).send(
        "Invalid booking time. Available slots: 8AM–11AM and 1PM–4PM only."
      );
    }

    // BLOCK ONLY IF ALREADY APPROVED

    const { data: existingApproved = [], error: checkError } = await supabase
      .from("bookings")
      .select("id")
      .eq("date", date)
      .eq("time", time)
      .eq("status", "approved");

    if (checkError) throw checkError;

    if (existingApproved.length > 0) {
      return res.status(400).send(
        "This consultation slot is no longer available because another booking has already been approved."
      );
    }

    // IMAGE UPLOAD

    let imageUrl = null;

    // Uploaded Reference Image

    if(req.file){
    
        const fileExt = req.file.originalname.split(".").pop();
    
        const filePath =
            `bookings/${Date.now()}-reference.${fileExt}`;
    
        const { error: uploadError } =
            await supabase.storage
            .from("booking-images")
            .upload(filePath, req.file.buffer,{
                contentType:req.file.mimetype
            });
    
        if(uploadError) throw uploadError;
    
        imageUrl =
            supabase.storage
            .from("booking-images")
            .getPublicUrl(filePath)
            .data.publicUrl;
    }
    
    // AI Generated Image

    else if(req.body.generated_image){
    
        const base64 =
            req.body.generated_image.replace(
                /^data:image\/\w+;base64,/,
                ""
            );
    
        const buffer =
            Buffer.from(base64,"base64");
    
        const filePath =
            `bookings/${Date.now()}-generated.png`;
    
        const { error: uploadError } =
            await supabase.storage
            .from("booking-images")
            .upload(filePath, buffer,{
                contentType:"image/png"
            });
    
        if(uploadError) throw uploadError;
    
        imageUrl =
            supabase.storage
            .from("booking-images")
            .getPublicUrl(filePath)
            .data.publicUrl;
    }

    // INSERT BOOKING

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

    // SEND EMAIL TO ADMIN

    try {

    await transporter.sendMail({
        from: process.env.EMAIL_USER,

        to: "ironlinksadmin@gmail.com",

        subject: "MAY KUPAL NA NAG BOOK",

        html: `
            <h2>New Consultation Booking</h2>

            <p>A customer has submitted a booking request.</p>

            <p>
                <strong>Name:</strong> ${name}<br>
                <strong>Email:</strong> ${email}<br>
                <strong>Phone:</strong> ${phone}<br>
                <strong>Date:</strong> ${date}<br>
                <strong>Time:</strong> ${time}
            </p>

            <p>
                <strong>Request:</strong><br>
                ${request || "No request provided"}
            </p>
        `
    });

} catch (emailError) {

    console.error("Email failed:", emailError);

    // Booking is already saved.
    // Do NOT stop the request because of email.

}

res.send("Booking successful!");

  } catch (err) {
    console.error("❌ Booking error:", err);
    res.status(500).send(err.message);
  }
});

// GET ALL BOOKINGS

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

// UPDATE BOOKING STATUS

app.patch("/bookings/:id", async (req, res) => {
  try {

    const { id } = req.params;
    const { status, reason } = req.body;

    if (!status) {
      return res.status(400).json({
        error: "Status is required"
      });
    }

    // get booking first
    const { data: booking, error: fetchError } =
      await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // update status
    if (status !== "approved") {

  const { error } = await supabase
    .from("bookings")
    .update({
    status
    })
    .eq("id", id);

  if (error) throw error;

}

    // SEND EMAIL

    if (status === "approved") {

  // Approve selected booking
  await supabase
    .from("bookings")
    .update({ status: "approved" })
    .eq("id", id);

  // Get other pending bookings first
const { data: rejectedBookings, error: fetchOthersError } = await supabase
  .from("bookings")
  .select("*")
  .eq("date", booking.date)
  .eq("time", booking.time)
  .eq("status", "pending")
  .neq("id", id);

if (fetchOthersError) throw fetchOthersError;

// Update them to rejected
const { error: rejectError } = await supabase
  .from("bookings")
  .update({
    status: "rejected"
    })
  .eq("date", booking.date)
  .eq("time", booking.time)
  .eq("status", "pending")
  .neq("id", id);

if (rejectError) throw rejectError;

  if (rejectError) throw rejectError;

  // Send approval email
  await transporter.sendMail({

    from: process.env.EMAIL_USER,

    to: booking.email,

    subject: "IronLinks Consultation Approved",

    html: `
      <h2>Booking Approved</h2>

      <p>Hello ${booking.name},</p>

      <p>Your consultation request has been approved.</p>

      <p>
      <strong>Date:</strong> ${booking.date}<br>
      <strong>Time:</strong> ${booking.time}
      </p>

      <p>Thank you for choosing IronLinks.</p>
    `
  });

  // Send rejection emails to the others
  if (rejectedBookings && rejectedBookings.length > 0) {

    for (const customer of rejectedBookings) {

      await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to: customer.email,

        subject: "IronLinks Consultation Rejected",

        html: `
          <h2>Booking Rejected</h2>

          <p>Hello ${customer.name},</p>

          <p>
          Unfortunately, your consultation request has been declined.
          </p>

          <p>
          <strong>Reason:</strong><br>
          This consultation request was automatically declined because another booking for the same consultation slot was approved first.
          </p>

          <p>
          Please submit another booking request if you would like to schedule a different consultation time.
          </p>
        `
      });

    }

  }

}

    if (status === "rejected") {

      await transporter.sendMail({

        from: process.env.EMAIL_USER,

        to: booking.email,

        subject: "IronLinks Consultation Rejected",

        html: `
          <h2>Booking Rejected</h2>

          <p>Hello ${booking.name},</p>

          <p>
          Unfortunately your consultation request
          could not be approved.
          </p>

          <p>
          <strong>Reason:</strong><br>
          </p>

          <p>
          Please submit another booking request.
          </p>
        `
      });

    }

    res.json({
      success: true
    });

  } catch (err) {

    console.error("❌ Update error:", err);

    res.status(500).json({
      error: "Failed to update booking"
    });

  }
});

// GALLERY UPLOAD

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

// GET GALLERY

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

// DELETE GALLERY IMAGE

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


// OPENAI DESIGN FINDER

app.post("/design-finder", upload.single("reference_image"), async (req, res) => {
  try {
  
  const { description } = req.body;
  
  const prompt = `
  You are editing the uploaded ironwork sketch.
  
  This may be:
  - Gate
  - Grill
  - Railing
  - Fence
  - Any ironwork design
  
  STRICT COPY MODE:
  
  - Keep exact structure
  - Keep exact layout
  - Keep shapes
  - Keep bars and patterns
  - Keep proportions
  
  DO NOT:
  - Add decorative curls unless requested
  - Add flowers unless requested
  - Redesign structure
  - Change layout
  
  Only convert sketch into realistic ironwork.
  
  User request:
  ${description || "Copy exactly"}
  `;
  let image;
  
  if(req.file){
    console.log("===== FILE RECEIVED =====");
    console.log(req.file);

    // IMAGE EDIT MODE
    const file = new File(
        [req.file.buffer],
        req.file.originalname,
        {
            type: req.file.mimetype
        }
    );

    image = await openai.images.edit({

        model:"gpt-image-1",

        image:file,

        prompt,

        size:"1024x1024"

    });

  
  }else{
  
  // GENERATE FROM SCRATCH
  image = await openai.images.generate({
  
  model:"gpt-image-1",
  
  prompt,
  
  size:"1024x1024"
  
  });
  
  }
  
  const base64 =
  image.data[0].b64_json;
  
  res.json({
  success:true,
  generated_image:
  `data:image/png;base64,${base64}`
  });
  
  }catch(err){
  
  console.error(err);
  
  res.status(500).json({
  success:false
  });
  
  }
  
  });

// SERVER RUN

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
