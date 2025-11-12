import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import Event, { IEvent } from '@/database/event.model';

// Define route params type for type safety
type RouteParams = {
    params: Promise<{
        slug: string;
    }>;
};

/**
 * GET /api/events/[slug]
 * Fetches a single events by its slug
 */
export async function GET(
    req: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    try {
        // Connect to database
        await connectDB();

        // Await and extract slug from params
        const { slug } = await params;

        if (!slug || typeof slug !== 'string') {
            return NextResponse.json({ message: 'Invalid slug' }, { status: 400 });
        }

        const sanitizedSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');

        console.log("slug in BE is ", sanitizedSlug);

        const event = await Event.findOne({ slug: sanitizedSlug }).lean();

        if (!event) {
            return NextResponse.json(
                { message: `Event with slug '${sanitizedSlug}' not found` },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Event fetched successfully', event });

    } catch (error) {
        // Log error for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching events by slug:', error);
        }

        // Handle specific error types
        if (error instanceof Error) {
            // Handle database connection errors
            if (error.message.includes('MONGODB_URI')) {
                return NextResponse.json(
                    { message: 'Database configuration error' },
                    { status: 500 }
                );
            }

            // Return generic error with error message
            return NextResponse.json(
                { message: 'Failed to fetch events', error: error.message },
                { status: 500 }
            );
        }

        // Handle unknown errors
        return NextResponse.json(
            { message: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}