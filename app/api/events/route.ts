import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const formData = await req.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    // Convert to object
    const event = Object.fromEntries(formData.entries())

    // 🧩 Safe parse tags & agenda
    const parseArray = (value: FormDataEntryValue | null) => {
      if (!value) return []
      const str = value.toString().trim()
      try {
        return JSON.parse(str) // try JSON
      } catch {
        return str.split(',').map((item) => item.trim()) // fallback plain text
      }
    }

    const tags = parseArray(formData.get('tags'))
    const agenda = parseArray(formData.get('agenda'))

    // File upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'DevEvent' },
        (error, result) => (error ? reject(error) : resolve(result))
      ).end(buffer)
    })

    event.image = (uploadResult as { secure_url: string }).secure_url

    const createdEvent = await Event.create({
      ...event,
      tags,
      agenda
    })

    return NextResponse.json(
      { message: 'Event created successfully', event: createdEvent },
      { status: 201 }
    )

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Event creation failed', error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}


export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({createdAt : -1}); // get the latest one 

        return NextResponse.json({message : 'Events fetched successfully',events},{status : 200})
    } catch (error) {
        return NextResponse.json({error : 'Event fetching failed',e : error},{status : 500})
    }
}