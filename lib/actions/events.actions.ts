'use server';

import Event from "@/database/event.model";
import connectDB from "../mongodb";
import { IEvent } from '@/database/event.model'


export const getSimilarEventBySlug = async (slug: string): Promise<IEvent[]> => {
    try {
        await connectDB();

        const event = await Event.findOne({ slug }).lean<IEvent>();
        if (!event) return [];

        // 👇 Tell mongoose to return plain JS objects shaped like IEvent
        const similarEvents = await Event.find({
            _id: { $ne: event._id },
            tags: { $in: event.tags },
        }).lean<IEvent[]>();

        return similarEvents;
    } catch (error) {
        console.error("Error fetching similar events:", error);
        return [];
    }
};
