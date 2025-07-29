import { Quote, Client, QuoteItem, Observation, User } from "@prisma/client"

export type QuoteWithClientAndItems = Quote & {
  client: Client | null
  items: QuoteItem[]
  observations: Observation[]
  createdBy: User | null
}