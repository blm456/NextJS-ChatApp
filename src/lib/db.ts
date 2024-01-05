import { Redis } from "@upstash/redis";
import { pv } from "./utils";

export const db = new Redis({
    url: pv("UPSTASH_REDIS_REST_URL"),
    token: pv("UPSTASH_REDIS_REST_TOKEN")
});
