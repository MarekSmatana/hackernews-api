import { ApolloServer } from "apollo-server"
import { schema } from "./schema"
import { context } from "./context"
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core"

const port = process.env.PORT || 3000

export const apolloServer = new ApolloServer({
  schema,
  context,
  introspection: true,
  plugins: [ApolloServerPluginLandingPageLocalDefault],
})

apolloServer.listen({ port }).then(({ url }) => {
  console.log(`🚀 Server is ready at ${url}`)
})
