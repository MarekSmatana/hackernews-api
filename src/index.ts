import { ApolloServer } from "apollo-server"
// import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core" // for offline gql playground
import { schema } from "./schema"
import { context } from "./context"

const port = 3210

export const apolloServer = new ApolloServer({
  schema,
  context,
  // plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
})

apolloServer.listen({ port }).then(({ url, ...rest }) => {
  console.log(`🚀 Server is ready at ${url}`)
})
