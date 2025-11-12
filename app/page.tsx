import Eventcard from "@/components/EventCard"
import ExploreBtn from "@/components/ExploreBtn"
import { IEvent } from "@/database/event.model"
import events from "@/lib/constants"
import axios from "axios"
import { cacheLife } from "next/cache"

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

const page = async () => {

  'use cache';

  cacheLife('hours')

  const response = await axios.get(`${BASE_URL}/api/events`);

  const { events } = response.data

  return (
    <section>
      <h1 className="text-center">The hub for Every Dev <br /> Event You can't miss </h1>
      <p className="text-center mt-5">Hackathons, Meetups, and Conferences All in One Place</p>

      <ExploreBtn />

      <div className="mt-20 space-y-2">
        <h3>Featured Events</h3>

        <ul className="events">
          {events && events.length > 0 ? (
            events.map((event: IEvent) => (
              <li key={event.title} className="list-none">
                <Eventcard {...event} />
              </li>
            ))
          ) : (
            <p>No events found.</p>
          )}

        </ul>
      </div>
    </section>
  )
}

export default page